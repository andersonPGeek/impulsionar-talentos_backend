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

// Validações para registro
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('nome')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .trim(),
  body('data_nascimento')
    .optional()
    .isISO8601()
    .withMessage('Data de nascimento deve ser uma data válida'),
  body('cargo')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Cargo deve ter no máximo 100 caracteres')
    .trim(),
  body('idade')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Idade deve ser um número entre 0 e 150'),
  body('id_gestor')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do gestor deve ser um número válido'),
  body('id_departamento')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do departamento deve ser um número válido'),
  body('id_cliente')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do cliente deve ser um número válido'),
  body('perfil_acesso')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Perfil de acesso deve ser um número válido')
];

// Validações para alteração de senha
const changePasswordValidation = [
  body('senhaAtual')
    .isLength({ min: 6 })
    .withMessage('Senha atual deve ter pelo menos 6 caracteres'),
  body('novaSenha')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
];

// Rotas públicas
router.post('/login', 
  sanitizeInput,
  loginValidation,
  validateRequest,
  authController.login
);

router.post('/register',
  sanitizeInput,
  registerValidation,
  validateRequest,
  authController.register
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