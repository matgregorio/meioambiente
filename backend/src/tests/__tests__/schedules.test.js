import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { api } from '../setup.js';
import { Address } from '../../modules/addresses/address.model.js';
import { Schedule } from '../../modules/schedules/schedule.model.js';
import { User } from '../../modules/auth/user.model.js';
import { AuditLog } from '../../modules/common/auditLog.js';
import { assertValidScheduleDate } from '../../utils/scheduleRules.js';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

process.env.TZ = 'America/Sao_Paulo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schedulesStore = [];
const addressesStore = [];
const usersStore = [];

const ADDRESS_ID = '507f1f77bcf86cd799439011';

function stripDocMethods(doc) {
  const { save, toObject, toJSON, ...rest } = doc;
  return { ...rest };
}

function wrapScheduleDoc(stored) {
  const doc = {
    ...stored,
    save: async function () {
      const index = schedulesStore.findIndex((item) => item.protocol === doc.protocol);
      if (index !== -1) {
        schedulesStore[index] = { ...stripDocMethods(doc) };
      }
      return this;
    },
    toObject: () => stripDocMethods(doc),
    toJSON: () => stripDocMethods(doc)
  };
  return doc;
}

function wrapUserDoc(stored) {
  const doc = {
    ...stored,
    save: async function () {
      const index = usersStore.findIndex((item) => item.email === doc.email);
      if (index !== -1) {
        usersStore[index] = { ...stripDocMethods(doc) };
      }
      return this;
    },
    toObject: () => stripDocMethods(doc),
    toJSON: () => stripDocMethods(doc)
  };
  return doc;
}

async function withMockedDate(fakeDate, callback) {
  const RealDate = global.Date;
  class MockDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        super(fakeDate.getTime());
      } else {
        super(...args);
      }
    }

    static now() {
      return fakeDate.getTime();
    }
  }
  MockDate.UTC = RealDate.UTC;
  MockDate.parse = RealDate.parse;
  global.Date = MockDate;
  try {
    return await callback();
  } finally {
    global.Date = RealDate;
  }
}

function setupModelMocks() {
  jest.spyOn(AuditLog, 'create').mockResolvedValue();

  jest.spyOn(Address, 'findOne').mockImplementation((query) => {
    const { _id } = query;
    const address = addressesStore.find((addr) => {
      if (_id && addr._id !== _id) return false;
      if ('deletedAt' in query && query.deletedAt === null && addr.deletedAt) return false;
      return true;
    });
    if (!address) return { populate: () => Promise.resolve(null) };
    return {
      populate: () =>
        Promise.resolve({
          _id: address._id,
          street: address.street,
          neighborhoodId: { name: address.neighborhood }
        })
    };
  });

  jest.spyOn(Schedule, 'countDocuments').mockImplementation(async (query) => {
    const { date } = query;
    return schedulesStore.filter((item) => {
      if (query.type && item.type !== query.type) return false;
      if (query.status && item.status !== query.status) return false;
      if (query.deletedAt === null && item.deletedAt) return false;
      if (date) {
        const time = new Date(item.date).getTime();
        return time >= new Date(date.$gte).getTime() && time <= new Date(date.$lte).getTime();
      }
      return true;
    }).length;
  });

  jest.spyOn(Schedule, 'create').mockImplementation(async (doc) => {
    const stored = {
      _id: doc._id || `schedule${Date.now()}`,
      deletedAt: null,
      ...doc
    };
    schedulesStore.push({ ...stored });
    return wrapScheduleDoc(stored);
  });

  jest.spyOn(Schedule, 'findOne').mockImplementation(async (query) => {
    if (query.protocol) {
      const schedule = schedulesStore.find((item) => {
        if (item.protocol !== query.protocol) return false;
        if ('deletedAt' in query && query.deletedAt === null && item.deletedAt) return false;
        return true;
      });
      if (!schedule) return null;
      return wrapScheduleDoc(schedule);
    }
    if (query.addressId) {
      const schedule = schedulesStore.find((item) => {
        if (item.addressId !== query.addressId || item.type !== query.type) return false;
        if (query.deletedAt === null && item.deletedAt) return false;
        const time = new Date(item.date).getTime();
        return time >= new Date(query.date.$gte).getTime() && time <= new Date(query.date.$lte).getTime();
      });
      return schedule ? wrapScheduleDoc(schedule) : null;
    }
    return null;
  });

  jest.spyOn(Schedule, 'aggregate').mockImplementation(async () => []);

  jest.spyOn(User, 'findOne').mockImplementation(async (query) => {
    const { email } = query;
    const user = usersStore.find((item) => {
      if (email && item.email !== email) return false;
      if ('deletedAt' in query && query.deletedAt === null && item.deletedAt) return false;
      return item.isActive;
    });
    return user ? wrapUserDoc(user) : null;
  });
}

function resetStores() {
  schedulesStore.length = 0;
  addressesStore.length = 0;
  usersStore.length = 0;
}

function getNextWeekday(weekday) {
  const date = new Date();
  const diff = (weekday + 7 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

async function seedBase() {
  resetStores();
  addressesStore.push({ _id: ADDRESS_ID, street: 'Rua Teste, 123', neighborhood: 'Centro', deletedAt: null });
  const adminHash = await bcrypt.hash('admin123', 10);
  const driverHash = await bcrypt.hash('driver123', 10);
  usersStore.push({
    _id: 'user1',
    role: 'admin',
    email: 'admin@example.com',
    passwordHash: adminHash,
    isActive: true,
    deletedAt: null
  });
  usersStore.push({
    _id: 'user2',
    role: 'driver',
    email: 'driver@example.com',
    passwordHash: driverHash,
    isActive: true,
    deletedAt: null
  });
}

describe('Schedules API', () => {
  beforeEach(() => {
    setupModelMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetStores();
  });

  test('cria agendamento com sucesso', async () => {
    await seedBase();
    const nextTuesday = getNextWeekday(2);
    const response = await api()
      .post('/api/schedules')
      .send({
        type: 'poda',
        date: nextTuesday,
        addressId: ADDRESS_ID,
        requesterName: 'Teste',
        cpfCnpj: '11144477735',
        phone: '11988887777',
        description: 'Teste'
      });
    expect(response.status).toBe(201);
    expect(response.body.protocol).toBeDefined();
  });

  test('bloqueia segundo agendamento no mesmo mês para o mesmo endereço e tipo', async () => {
    await seedBase();
    const nextTuesday = getNextWeekday(2);
    await api().post('/api/schedules').send({
      type: 'poda',
      date: nextTuesday,
      addressId: ADDRESS_ID,
      requesterName: 'Teste',
      cpfCnpj: '11144477735',
      phone: '11988887777'
    });
    const second = await api().post('/api/schedules').send({
      type: 'poda',
      date: nextTuesday,
      addressId: ADDRESS_ID,
      requesterName: 'Teste 2',
      cpfCnpj: '11144477735',
      phone: '11988887778'
    });
    expect(second.status).toBe(409);
  });

  test('respeita cutoff de 16:30 do dia anterior', async () => {
    await seedBase();
    const nextTuesday = getNextWeekday(2);
    const timeZone = 'America/Sao_Paulo';
    const scheduleLocal = utcToZonedTime(zonedTimeToUtc(`${nextTuesday}T00:00:00`, timeZone), timeZone);
    const dayBeforeLocal = new Date(scheduleLocal.getTime());
    dayBeforeLocal.setDate(dayBeforeLocal.getDate() - 1);
    const previousDayStr = dayBeforeLocal.toISOString().split('T')[0];
    const dayBefore = zonedTimeToUtc(`${previousDayStr}T17:00:00`, timeZone);
    let response;
    await withMockedDate(dayBefore, async () => {
      expect(() => assertValidScheduleDate('poda', nextTuesday)).toThrow();
      response = await api().post('/api/schedules').send({
        type: 'poda',
        date: nextTuesday,
        addressId: ADDRESS_ID,
        requesterName: 'Teste',
        cpfCnpj: '11144477735',
        phone: '11988887777'
      });
    });
    expect(response.status).toBe(409);
  });

  test('conclui agendamento com upload obrigatório', async () => {
    await seedBase();
    const nextTuesday = getNextWeekday(2);
    const scheduleRes = await api().post('/api/schedules').send({
      type: 'poda',
      date: nextTuesday,
      addressId: ADDRESS_ID,
      requesterName: 'Teste',
      cpfCnpj: '11144477735',
      phone: '11988887777'
    });
    const loginRes = await api().post('/api/auth/login').send({ email: 'admin@example.com', password: 'admin123' });
    const token = loginRes.body.token;
    const protocol = scheduleRes.body.protocol;
    const imagePath = path.join(__dirname, '..', 'fixtures', 'photo.jpg');
    fs.mkdirSync(path.dirname(imagePath), { recursive: true });
    fs.writeFileSync(imagePath, 'fake');
    const completeRes = await api()
      .patch(`/api/schedules/${protocol}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', imagePath);
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.status).toBe('Concluído');
  });

  test('driver deve enviar foto para concluir', async () => {
    await seedBase();
    const nextTuesday = getNextWeekday(2);
    const scheduleRes = await api().post('/api/schedules').send({
      type: 'poda',
      date: nextTuesday,
      addressId: ADDRESS_ID,
      requesterName: 'Teste',
      cpfCnpj: '11144477735',
      phone: '11988887777'
    });
    const loginRes = await api().post('/api/auth/login').send({ email: 'driver@example.com', password: 'driver123' });
    const protocol = scheduleRes.body.protocol;
    const result = await api()
      .patch(`/api/schedules/${protocol}/complete`)
      .set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(result.status).toBe(422);
  });
});
