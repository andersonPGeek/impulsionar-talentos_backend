const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const perfilColaboradorController = require('../controllers/perfil_colaborador.controller');

const router = express.Router();

// Validações
const idUsuarioValidation = [
  param('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo')
];

const perfilValidation = [
  body('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo'),
  body('sobre_perfil')
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Sobre perfil deve ter entre 1 e 2000 caracteres')
];

// Rotas

// GET /api/perfil-colaborador/:id_usuario
// Buscar perfil do colaborador
router.get('/:id_usuario', 
  idUsuarioValidation,
  validateRequest,
  perfilColaboradorController.getPerfil
);

// POST /api/perfil-colaborador
// Criar perfil do colaborador
router.post('/', 
  perfilValidation,
  validateRequest,
  perfilColaboradorController.salvarPerfil
);

// PUT /api/perfil-colaborador
// Atualizar perfil do colaborador
router.put('/', 
  perfilValidation,
  validateRequest,
  perfilColaboradorController.atualizarPerfil
);

module.exports = router; 