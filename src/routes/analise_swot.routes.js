const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const analiseSwotController = require('../controllers/analise_swot.controller');

const router = express.Router();

// Validações
const idUsuarioValidation = [
  param('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo')
];

const analiseSwotValidation = [
  body('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo'),
  body('textos_por_categoria')
    .isArray({ min: 1 })
    .withMessage('textos_por_categoria deve ser um array com pelo menos uma categoria'),
  body('textos_por_categoria.*.id_categoria_swot')
    .isInt({ min: 1, max: 4 })
    .withMessage('id_categoria_swot deve ser um número inteiro entre 1 e 4'),
  body('textos_por_categoria.*.textos')
    .isArray()
    .withMessage('textos deve ser um array'),
  body('textos_por_categoria.*.textos.*')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Cada texto deve ser uma string entre 1 e 1000 caracteres')
];

// Rotas

// GET /api/analise-swot/:id_usuario
// Buscar análise SWOT do usuário
router.get('/:id_usuario',
  idUsuarioValidation,
  validateRequest,
  analiseSwotController.getAnaliseSwot
);

// POST /api/analise-swot
// Salvar/Atualizar análise SWOT
router.post('/',
  analiseSwotValidation,
  validateRequest,
  analiseSwotController.salvarAnaliseSwot
);

// GET /api/analise-swot/verificar-periodo/:id_usuario
// Verificar se pode atualizar análise SWOT baseado no período
router.get('/verificar-periodo/:id_usuario',
  idUsuarioValidation,
  validateRequest,
  analiseSwotController.verificarPeriodoAtualizacao
);

module.exports = router;







