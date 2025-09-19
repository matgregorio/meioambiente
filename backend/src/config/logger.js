import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, errors } = format;

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} ${level}: ${stack || message}`;
});

export const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), errors({ stack: true }), logFormat),
  transports: [new transports.Console()]
});
