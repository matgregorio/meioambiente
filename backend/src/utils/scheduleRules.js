import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { isBefore, set } from 'date-fns';
import { AppError } from './errors.js';

export const scheduleTypes = {
  poda: { weekday: 2, label: 'Poda', limit: 3 },
  moveis: { weekday: 3, label: 'Móveis', limit: 8 },
  'vidro-eletronicos': { weekday: 4, label: 'Vidro e Eletrônicos', limit: 8 }
};

export function assertValidScheduleDate(type, dateStr) {
  const config = scheduleTypes[type];
  if (!config) throw new AppError(422, 'Tipo de recolha inválido');
  const timeZone = 'America/Sao_Paulo';
  const scheduleDateUtc = zonedTimeToUtc(`${dateStr}T00:00:00`, timeZone);
  const scheduleDate = utcToZonedTime(scheduleDateUtc, timeZone);
  if (scheduleDate.getDay() !== config.weekday) {
    throw new AppError(409, `Agendamentos de ${config.label} ocorrem apenas na ${weekdayName(config.weekday)}`);
  }
  const cutoff = set(scheduleDate, { hours: 16, minutes: 30 });
  const previousDay = new Date(cutoff.getTime());
  previousDay.setDate(previousDay.getDate() - 1);
  const now = utcToZonedTime(new Date(), timeZone);
  if (isBefore(previousDay, now)) {
    throw new AppError(409, 'Prazo de agendamento encerrado para esta data. Escolha outra.');
  }
  return scheduleDateUtc;
}

export function weekdayName(index) {
  return ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][index];
}
