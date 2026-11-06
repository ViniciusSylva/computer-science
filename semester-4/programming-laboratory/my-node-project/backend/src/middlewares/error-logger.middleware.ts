import { Request, Response, NextFunction } from "express";

/**
 * Middleware para logging formatado de requisições HTTP em desenvolvimento
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const timestamp = new Date().toLocaleTimeString("pt-BR", { hour12: false });

    const statusColor =
      statusCode >= 500
        ? "\x1b[31m" // Vermelho
        : statusCode >= 400
        ? "\x1b[33m" // Amarelo
        : statusCode >= 300
        ? "\x1b[36m" // Ciano
        : "\x1b[32m"; // Verde
    const reset = "\x1b[0m";

    console.log(
      `[${timestamp}] ${method.padEnd(6)} ${originalUrl.padEnd(30)} ${statusColor}${statusCode}${reset} (${duration}ms)`
    );
  });

  next();
}

/**
 * Middleware global para tratamento uniforme de exceções e erros
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("❌ Erro não tratado:", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Erro interno do servidor.";

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}

