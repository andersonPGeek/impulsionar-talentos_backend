const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const personalidadeController = require('../controllers/personalidade.controller');

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
    .withMessage('Resposta deve ser um valor entre 1 e 5'),
  body('respostas.*.dimensao')
    .isIn(['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'])
    .withMessage('Dimensão deve ser uma das letras MBTI: E, I, S, N, T, F, J, P'),
  body('respostas.*.weight')
    .isNumeric()
    .withMessage('Weight deve ser um número')
];

// Rotas

// GET /api/personalidade/:id_usuario/perguntas-pendentes
// Buscar perguntas pendentes de resposta
router.get('/:id_usuario/perguntas-pendentes', 
  idUsuarioValidation,
  validateRequest,
  personalidadeController.getPerguntasPendentes
);

// POST /api/personalidade/respostas
// Salvar respostas das perguntas
router.post('/respostas', 
  respostasValidation,
  validateRequest,
  personalidadeController.salvarRespostas
);

// GET /api/personalidade/:id_usuario/resultado
// Buscar resultado da personalidade
router.get('/:id_usuario/resultado', 
  idUsuarioValidation,
  validateRequest,
  personalidadeController.getResultado
);

module.exports = router; 