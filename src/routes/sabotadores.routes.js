const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const sabotadoresController = require('../controllers/sabotadores.controller');

const router = express.Router();

// Validações
const idUsuarioValidation = [
  param('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo')
];

const respostasValidation = [
  body('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo'),
  body('respostas')
    .isArray({ min: 1 })
    .withMessage('Respostas deve ser um array não vazio'),
  body('respostas.*.id_pergunta')
    .isInt({ min: 1 })
    .withMessage('ID da pergunta deve ser um número inteiro positivo'),
  body('respostas.*.resposta')
    .isInt({ min: 1, max: 5 })
    .withMessage('Resposta deve ser um valor entre 1 e 5')
];

// Rotas

// GET /api/sabotadores/:id_usuario/perguntas-pendentes
// Buscar perguntas pendentes de resposta
router.get('/:id_usuario/perguntas-pendentes', 
  idUsuarioValidation,
  validateRequest,
  sabotadoresController.getPerguntasPendentes
);

// POST /api/sabotadores/respostas
// Salvar respostas das perguntas
router.post('/respostas', 
  respostasValidation,
  validateRequest,
  sabotadoresController.salvarRespostas
);

// GET /api/sabotadores/:id_usuario/resultado
// Buscar resultado dos sabotadores
router.get('/:id_usuario/resultado', 
  idUsuarioValidation,
  validateRequest,
  sabotadoresController.getResultado
);

module.exports = router; 