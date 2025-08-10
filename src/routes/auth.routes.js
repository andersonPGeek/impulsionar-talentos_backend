const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, sanitizeInput } = require('../middleware/validation');

const router = express.Router();

// Validações para login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validações para alteração de senha
const changePasswordValidation = [
  body('senhaAtual')
    .isLength({ min: 6 })
    .withMessage('Senha atual deve ter pelo menos 6 caracteres'),
  body('novaSenha')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
];

// Rotas públicas
router.post('/login', 
  sanitizeInput,
  loginValidation,
  validateRequest,
  authController.login
);

// Rotas protegidas (requerem autenticação)
router.get('/validate', 
  authenticateToken,
  authController.validateToken
);

router.post('/change-password',
  authenticateToken,
  sanitizeInput,
  changePasswordValidation,
  validateRequest,
  authController.changePassword
);

module.exports = router; 