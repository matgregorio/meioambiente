import { startOfDay, endOfDay } from 'date-fns';
import { Schedule } from './schedule.model.js';
import { scheduleTypes } from '../../utils/scheduleRules.js';

export async function getTodayStats(req, res, next) {
  try {
    const today = new Date();
    const query = {
      deletedAt: null,
      date: { $gte: startOfDay(today), $lte: endOfDay(today) }
    };
    const schedules = await Schedule.find(query);
    const totals = schedules.reduce(
      (acc, item) => {
        acc.totalHoje += 1;
        if (item.status === 'Agendado') {
          acc.vagasHoje[item.type] -= 1;
        }
        acc.porTipo[item.type] += 1;
        return acc;
      },
      {
        totalHoje: 0,
        vagasHoje: {
          poda: scheduleTypes.poda.limit,
          moveis: scheduleTypes.moveis.limit,
          'vidro-eletronicos': scheduleTypes['vidro-eletronicos'].limit
        },
        porTipo: { poda: 0, moveis: 0, 'vidro-eletronicos': 0 }
      }
    );
    res.json(totals);
  } catch (err) {
    next(err);
  }
}

export async function getTotalsStats(req, res, next) {
  try {
    const totalAgendamentos = await Schedule.countDocuments({ deletedAt: null });
    const concluidos = await Schedule.countDocuments({ deletedAt: null, status: 'Concluído' });
    res.json({ totalAgendamentos, concluidos });
  } catch (err) {
    next(err);
  }
}
