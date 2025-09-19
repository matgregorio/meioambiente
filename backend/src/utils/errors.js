export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const errorCatalog = {
  UNAUTHORIZED: new AppError(401, 'Não autorizado'),
  FORBIDDEN: new AppError(403, 'Acesso negado'),
  NOT_FOUND: new AppError(404, 'Recurso não encontrado')
};
