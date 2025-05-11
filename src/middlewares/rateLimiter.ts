import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // máximo 5 intentos por IP
  message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
