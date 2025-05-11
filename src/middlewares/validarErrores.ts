import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const manejarErroresDeValidacion = (req: Request, res: Response, next: NextFunction) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};
