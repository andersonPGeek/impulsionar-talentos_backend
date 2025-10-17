const express = require('express');
const { body } = require('express-validator');
const reconhecimentoController = require('../controllers/reconhecimento.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, sanitizeInput } = require('../middleware/validation');

const router = express.Router();

// Validações para criar reconhecimento
const criarReconhecimentoValidation = [
  body('id_usuario_reconhecido')
    .isInt({ min: 1 })
    .withMessage('ID do usuário reconhecido deve ser um número inteiro positivo'),
  body('id_usuario_reconheceu')
    .isInt({ min: 1 })
    .withMessage('ID do usuário que reconheceu deve ser um número inteiro positivo'),
  body('motivo_reconhecimento')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Motivo do reconhecimento deve ter entre 1 e 1000 caracteres')
    .trim(),
  body('id_tipo_reconhecimento')
    .isInt({ min: 1 })
    .withMessage('ID do tipo de reconhecimento deve ser um número inteiro positivo')
];

// Validações para atualizar reconhecimento
const atualizarReconhecimentoValidation = [
  body('motivo_reconhecimento')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Motivo do reconhecimento deve ter entre 1 e 1000 caracteres')
    .trim(),
  body('id_tipo_reconhecimento')
    .isInt({ min: 1 })
    .withMessage('ID do tipo de reconhecimento deve ser um número inteiro positivo')
];

// Validações para criar tipo de reconhecimento
const criarTipoReconhecimentoValidation = [
  body('reconhecimento')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome do tipo de reconhecimento deve ter entre 1 e 100 caracteres')
    .trim(),
  body('icone_reconhecimento')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Ícone do reconhecimento deve ter no máximo 255 caracteres')
    .trim()
];

// Validações para atualizar tipo de reconhecimento
const atualizarTipoReconhecimentoValidation = [
  body('reconhecimento')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome do tipo de reconhecimento deve ter entre 1 e 100 caracteres')
    .trim(),
  body('icone_reconhecimento')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Ícone do reconhecimento deve ter no máximo 255 caracteres')
    .trim()
];

/**
 * @route GET /api/reconhecimento/tipos
 * @desc Buscar todos os tipos de reconhecimento
 * @access Private
 */
router.get('/tipos', 
  authenticateToken,
  reconhecimentoController.buscarTiposReconhecimento
);

/**
 * @route POST /api/reconhecimento/tipos
 * @desc Criar novo tipo de reconhecimento
 * @access Private
 */
router.post('/tipos', 
  authenticateToken,
  criarTipoReconhecimentoValidation,
  validateRequest,
  sanitizeInput,
  reconhecimentoController.criarTipoReconhecimento
);

/**
 * @route PUT /api/reconhecimento/tipos/:id
 * @desc Atualizar tipo de reconhecimento
 * @access Private
 */
router.put('/tipos/:id', 
  authenticateToken,
  atualizarTipoReconhecimentoValidation,
  validateRequest,
  sanitizeInput,
  reconhecimentoController.atualizarTipoReconhecimento
);

/**
 * @route DELETE /api/reconhecimento/tipos/:id
 * @desc Deletar tipo de reconhecimento
 * @access Private
 */
router.delete('/tipos/:id', 
  authenticateToken,
  reconhecimentoController.deletarTipoReconhecimento
);

/**
 * @route GET /api/reconhecimento/usuario/:id_usuario
 * @desc Buscar reconhecimentos recebidos por um usuário
 * @access Private
 */
router.get('/usuario/:id_usuario', 
  authenticateToken,
  reconhecimentoController.buscarReconhecimentosPorUsuario
);

/**
 * @route GET /api/reconhecimento/dados-por/:id_usuario
 * @desc Buscar reconhecimentos dados por um usuário
 * @access Private
 */
router.get('/dados-por/:id_usuario', 
  authenticateToken,
  reconhecimentoController.buscarReconhecimentosDadosPorUsuario
);

/**
 * @route POST /api/reconhecimento
 * @desc Criar novo reconhecimento
 * @access Private
 */
router.post('/', 
  authenticateToken,
  criarReconhecimentoValidation,
  validateRequest,
  sanitizeInput,
  reconhecimentoController.criarReconhecimento
);

/**
 * @route GET /api/reconhecimento/:id
 * @desc Buscar reconhecimento específico
 * @access Private
 */
router.get('/:id', 
  authenticateToken,
  reconhecimentoController.buscarReconhecimento
);

/**
 * @route PUT /api/reconhecimento/:id
 * @desc Atualizar reconhecimento
 * @access Private
 */
router.put('/:id', 
  authenticateToken,
  atualizarReconhecimentoValidation,
  validateRequest,
  sanitizeInput,
  reconhecimentoController.atualizarReconhecimento
);

/**
 * @route DELETE /api/reconhecimento/:id
 * @desc Deletar reconhecimento
 * @access Private
 */
router.delete('/:id', 
  authenticateToken,
  reconhecimentoController.deletarReconhecimento
);

module.exports = router;
