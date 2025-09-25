import dotenv from 'dotenv';

const envFound = dotenv.config();
if (envFound.error) {
  process.env.PORT = process.env.PORT || '8080';
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isDevelopment = nodeEnv !== 'production';

function ensure(condition, message) {
  if (condition) return;
  if (isDevelopment) {
    console.warn(`${message} Usando valor default.`);
  } else {
    throw new Error(message);
  }
}

const required = ['MONGO_URI', 'JWT_SECRET', 'BASE_URL'];
required.forEach((key) => {
  ensure(Boolean(process.env[key]), `Variavel de ambiente ${key} nao definida.`);
});

if (!isDevelopment && process.env.JWT_SECRET === 'change_me') {
  throw new Error('Valor inseguro encontrado em JWT_SECRET. Defina um segredo forte.');
}

const parseNumber = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
};

const corsAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!isDevelopment && corsAllowedOrigins.length === 0) {
  throw new Error('Defina CORS_ALLOWED_ORIGINS em producao para restringir origens confiaveis.');
}

export const env = {
  nodeEnv,
  isDevelopment,
  port: parseNumber(process.env.PORT, 8080),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/meioambiente',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  uploadsDir: process.env.UPLOADS_DIR || './uploads',
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
  corsAllowedOrigins: corsAllowedOrigins.length > 0 ? corsAllowedOrigins : ['http://localhost:5173'],
  rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_SCHEDULE_WINDOW, 60000),
  rateLimitMax: parseNumber(process.env.RATE_LIMIT_SCHEDULE_MAX, 10),
  rateLimitAuthWindowMs: parseNumber(process.env.RATE_LIMIT_AUTH_WINDOW, 15 * 60 * 1000),
  rateLimitAuthMax: parseNumber(process.env.RATE_LIMIT_AUTH_MAX, 10),
  rateLimitVerifyWindowMs: parseNumber(process.env.RATE_LIMIT_VERIFY_WINDOW, 5 * 60 * 1000),
  rateLimitVerifyMax: parseNumber(process.env.RATE_LIMIT_VERIFY_MAX, 20)
};