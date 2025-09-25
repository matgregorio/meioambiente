import crypto from 'crypto';
import { z } from 'zod';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { Address } from '../addresses/address.model.js';
import { Schedule } from './schedule.model.js';
import { createAuditLog } from '../common/auditLog.js';
import { AppError } from '../../utils/errors.js';
import { assertValidScheduleDate, scheduleTypes } from '../../utils/scheduleRules.js';
import { validateCpfCnpj, validatePhone } from '../../utils/validators.js';
import { env } from '../../config/env.js';

const scheduleSchema = z.object({
  type: z.enum(['poda', 'moveis', 'vidro-eletronicos']),
  date: z.string().regex(/\d{4}-\d{2}-\d{2}/, 'Data invalida'),
  addressId: z.string().length(24, 'Endereco invalido'),
  requesterName: z.string().min(3),
  cpfCnpj: z.string().min(11),
  phone: z.string().min(10),
  description: z.string().max(500).optional()
});

const buildVerifyUrl = (protocol) => new URL(`/verify/${protocol}`, env.baseUrl).toString();

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

export async function createSchedule(req, res, next) {
  try {
    const data = scheduleSchema.parse(req.body);
    if (!validateCpfCnpj(data.cpfCnpj)) {
      throw new AppError(422, 'CPF/CNPJ invalido');
    }
    if (!validatePhone(data.phone)) {
      throw new AppError(422, 'Telefone invalido');
    }
    const address = await Address.findOne({ _id: data.addressId, deletedAt: null }).populate('neighborhoodId');
    if (!address) throw new AppError(404, 'Endereco nao encontrado');
    const scheduleDateUtc = assertValidScheduleDate(data.type, data.date);
    const existingSameMonth = await Schedule.findOne({
      addressId: data.addressId,
      type: data.type,
      deletedAt: null,
      date: {
        $gte: startOfMonth(scheduleDateUtc),
        $lte: endOfMonth(scheduleDateUtc)
      }
    });
    if (existingSameMonth) {
      throw new AppError(409, 'Ja existe uma recolha para este endereco neste mes.');
    }
    const dayCount = await Schedule.countDocuments({
      type: data.type,
      deletedAt: null,
      date: {
        $gte: startOfDay(scheduleDateUtc),
        $lte: endOfDay(scheduleDateUtc)
      }
    });
    if (dayCount >= scheduleTypes[data.type].limit) {
      throw new AppError(409, 'Limite diario atingido para este tipo de recolha.');
    }
    const protocol = crypto.randomUUID();
    const qrcodeUrl = buildVerifyUrl(protocol);
    const schedule = await Schedule.create({
      protocol,
      type: data.type,
      date: scheduleDateUtc,
      addressId: data.addressId,
      neighborhoodName: address.neighborhoodId.name,
      addressText: address.street,
      requesterName: data.requesterName,
      cpfCnpj: data.cpfCnpj,
      phone: data.phone,
      description: data.description,
      status: 'Agendado',
      qrcodePayload: qrcodeUrl,
      createdByIp: req.ip,
      userAgent: req.headers['user-agent']
    });
    await createAuditLog({
      action: 'SCHEDULE_CREATE',
      entity: 'Schedule',
      entityId: schedule._id,
      ip: req.ip,
      ua: req.headers['user-agent'],
      after: schedule.toObject()
    });
    res.status(201).json({
      protocol,
      qrcodeUrl
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(422, 'Dados invalidos', err.errors));
    }
    return next(err);
  }
}

export async function listSchedules(req, res, next) {
  try {
    const { q, date, status, type, page = 1, limit = 20 } = req.query;
    const pageNumber = parsePositiveInteger(page, 1);
    const pageSize = Math.min(parsePositiveInteger(limit, 20), 100);
    const query = { deletedAt: null };
    if (status) query.status = status;
    if (type) query.type = type;
    if (date) {
      const start = startOfDay(new Date(date));
      const end = endOfDay(new Date(date));
      query.date = { $gte: start, $lte: end };
    }
    if (q) {
      query.$text = { $search: q };
    }
    const schedules = await Schedule.find(query)
      .sort({ date: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    const total = await Schedule.countDocuments(query);
    res.json({ data: schedules, total, page: pageNumber, limit: pageSize });
  } catch (err) {
    next(err);
  }
}

export async function listTodaySchedules(req, res, next) {
  try {
    const today = new Date();
    const schedules = await Schedule.find({
      deletedAt: null,
      status: 'Agendado',
      date: { $gte: startOfDay(today), $lte: endOfDay(today) }
    }).sort({ neighborhoodName: 1, addressText: 1 });
    res.json(schedules);
  } catch (err) {
    next(err);
  }
}

export async function getAvailability(req, res, next) {
  try {
    const { type } = req.params;
    const config = scheduleTypes[type];
    if (!config) throw new AppError(422, 'Tipo de recolha invalido');
    const timeZone = 'America/Sao_Paulo';
    const nowZoned = utcToZonedTime(new Date(), timeZone);
    const startDate = startOfDay(nowZoned);
    const endDate = addDays(startDate, 90);
    const startUtc = zonedTimeToUtc(startDate, timeZone);
    const endUtc = zonedTimeToUtc(endDate, timeZone);
    const counts = await Schedule.aggregate([
      {
        $match: {
          deletedAt: null,
          type,
          date: { $gte: startUtc, $lte: endUtc }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
              timezone: timeZone
            }
          },
          total: { $sum: 1 }
        }
      }
    ]);
    const map = new Map(counts.map((item) => [item._id, item.total]));
    const unavailableDates = [];
    for (let cursor = new Date(startDate); cursor <= endDate; cursor = addDays(cursor, 1)) {
      if (cursor.getDay() !== config.weekday) continue;
      const dateStr = formatInTimeZone(zonedTimeToUtc(cursor, timeZone), timeZone, 'yyyy-MM-dd');
      const total = map.get(dateStr) || 0;
      const cutoff = new Date(cursor);
      cutoff.setDate(cutoff.getDate() - 1);
      cutoff.setHours(16, 30, 0, 0);
      if (total >= config.limit || nowZoned > cutoff) {
        unavailableDates.push(dateStr);
      }
    }
    res.json({ unavailableDates });
  } catch (err) {
    next(err);
  }
}

export async function getSchedule(req, res, next) {
  try {
    const schedule = await Schedule.findOne({ protocol: req.params.protocol, deletedAt: null });
    if (!schedule) throw new AppError(404, 'Agendamento nao encontrado');
    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

const maskCpfCnpj = (value) => {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
  }
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-**`;
  }
  return '***';
};

export async function verifySchedule(req, res, next) {
  try {
    const schedule = await Schedule.findOne({ protocol: req.params.protocol, deletedAt: null });
    if (!schedule) throw new AppError(404, 'Agendamento nao encontrado');
    res.json({
      protocol: schedule.protocol,
      type: schedule.type,
      date: formatInTimeZone(schedule.date, 'America/Sao_Paulo', 'yyyy-MM-dd'),
      requesterName: schedule.requesterName,
      cpfCnpj: maskCpfCnpj(schedule.cpfCnpj),
      neighborhoodName: schedule.neighborhoodName,
      addressText: schedule.addressText,
      status: schedule.status,
      description: schedule.description,
      driverPhotoUrl: schedule.driverPhotoUrl || null
    });
  } catch (err) {
    next(err);
  }
}

export async function completeSchedule(req, res, next) {
  try {
    const { protocol } = req.params;
    const schedule = await Schedule.findOne({ protocol, deletedAt: null });
    if (!schedule) throw new AppError(404, 'Agendamento nao encontrado');
    if (schedule.status === 'Concluido') {
      throw new AppError(409, 'Agendamento ja concluido');
    }
    if (!req.file && req.user?.role === 'driver') {
      throw new AppError(422, 'Foto obrigatoria');
    }
    const before = schedule.toObject();
    schedule.status = 'Concluido';
    if (req.file) {
      schedule.driverPhotoUrl = `/uploads/${req.file.filename}`;
    }
    await schedule.save();
    await createAuditLog({
      action: 'SCHEDULE_COMPLETE',
      actorUserId: req.user?.id,
      entity: 'Schedule',
      entityId: schedule._id,
      before,
      after: schedule.toObject()
    });
    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

export async function deleteSchedule(req, res, next) {
  try {
    const schedule = await Schedule.findOne({ protocol: req.params.protocol, deletedAt: null });
    if (!schedule) throw new AppError(404, 'Agendamento nao encontrado');
    schedule.deletedAt = new Date();
    await schedule.save();
    await createAuditLog({
      action: 'SCHEDULE_DELETE',
      actorUserId: req.user?.id,
      entity: 'Schedule',
      entityId: schedule._id,
      before: schedule.toObject()
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}