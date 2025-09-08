const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const arvoreDaVidaController = require('../controllers/arvore_da_vida.controller');

const router = express.Router();

// Validações
const idUsuarioValidation = [
  param('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo')
];

const arvoreDaVidaValidation = [
  body('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo'),
  body('pontuacao_geral')
    .isInt({ min: 0, max: 10 })
    .withMessage('Pontuação geral deve ser um número inteiro entre 0 e 10'),
  body('criatividade_hobbie')
    .isInt({ min: 0, max: 10 })
    .withMessage('Criatividade/Hobbie deve ser um número inteiro entre 0 e 10'),
  body('plenitude_felicidade')
    .isInt({ min: 0, max: 10 })
    .withMessage('Plenitude/Felicidade deve ser um número inteiro entre 0 e 10'),
  body('espiritualidade')
    .isInt({ min: 0, max: 10 })
    .withMessage('Espiritualidade deve ser um número inteiro entre 0 e 10'),
  body('saude_disposicao')
    .isInt({ min: 0, max: 10 })
    .withMessage('Saúde/Disposição deve ser um número inteiro entre 0 e 10'),
  body('desenvolvimento_intelectual')
    .isInt({ min: 0, max: 10 })
    .withMessage('Desenvolvimento intelectual deve ser um número inteiro entre 0 e 10'),
  body('equilibrio_emocional')
    .isInt({ min: 0, max: 10 })
    .withMessage('Equilíbrio emocional deve ser um número inteiro entre 0 e 10'),
  body('familia')
    .isInt({ min: 0, max: 10 })
    .withMessage('Família deve ser um número inteiro entre 0 e 10'),
  body('desenvolvimento_amoroso')
    .isInt({ min: 0, max: 10 })
    .withMessage('Desenvolvimento amoroso deve ser um número inteiro entre 0 e 10'),
  body('vida_social')
    .isInt({ min: 0, max: 10 })
    .withMessage('Vida social deve ser um número inteiro entre 0 e 10'),
  body('realizacao_proposito')
    .isInt({ min: 0, max: 10 })
    .withMessage('Realização/Propósito deve ser um número inteiro entre 0 e 10'),
  body('recursos_financeiros')
    .isInt({ min: 0, max: 10 })
    .withMessage('Recursos financeiros deve ser um número inteiro entre 0 e 10'),
  body('contribuicao_social')
    .isInt({ min: 0, max: 10 })
    .withMessage('Contribuição social deve ser um número inteiro entre 0 e 10')
];

// Rotas

// GET /api/arvore-da-vida/:id_usuario
// Buscar árvore da vida do usuário
router.get('/:id_usuario',
  idUsuarioValidation,
  validateRequest,
  arvoreDaVidaController.getArvoreDaVida
);

// POST /api/arvore-da-vida
// Criar árvore da vida
router.post('/',
  arvoreDaVidaValidation,
  validateRequest,
  arvoreDaVidaController.salvarArvoreDaVida
);

// PUT /api/arvore-da-vida
// Atualizar árvore da vida
router.put('/',
  arvoreDaVidaValidation,
  validateRequest,
  arvoreDaVidaController.salvarArvoreDaVida
);

module.exports = router;








