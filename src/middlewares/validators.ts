import { body } from 'express-validator';

export const validarLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es requerido'),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
];

export const validarRegistro = [
  body('fullname')
    .notEmpty().withMessage('El nombre completo es requerido'),

  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es requerido'),

  body('email')
    .isEmail().withMessage('Correo inválido'),

  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];
