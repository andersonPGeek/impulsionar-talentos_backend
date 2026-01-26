const express = require('express');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const controleEmocionalController = require('../controllers/controle.emocional.controller');

const router = express.Router();

/**
 * Validação para criação de profissional
 */
const profissionalCreateValidation = [
  body('nome')
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nome é obrigatório e deve ter entre 1 e 255 caracteres'),
  
  body('tipo_profissional')
    .isIn(['psicologo', 'psiquiatra', 'terapeuta'])
    .withMessage('Tipo profissional deve ser: psicologo, psiquiatra ou terapeuta'),
  
  body('crp_ou_registro')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('CRP/Registro é obrigatório e deve ter entre 1 e 50 caracteres'),
  
  body('especialidades')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Especialidades deve ter no máximo 500 caracteres'),
  
  body('telefone')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Telefone deve ter no máximo 20 caracteres'),
  
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Email deve ser um endereço válido'),
  
  body('foto_url')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('URL da foto deve ter no máximo 500 caracteres'),
  
  body('atende_online')
    .optional()
    .isBoolean()
    .withMessage('Atende online deve ser um valor booleano'),
  
  body('atende_presencial')
    .optional()
    .isBoolean()
    .withMessage('Atende presencial deve ser um valor booleano'),
  
  body('cidade')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Cidade deve ter no máximo 100 caracteres'),
  
  body('estado')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ser a sigla (2 caracteres)'),
  
  body('valor_sessao')
    .optional({ checkFalsy: true })
    .isDecimal({ decimal_digits: '1,2' })
    .withMessage('Valor da sessão deve ser um número decimal válido')
];

/**
 * Validação para atualização de profissional
 */
const profissionalUpdateValidation = [
  body('nome')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nome deve ter entre 1 e 255 caracteres'),
  
  body('tipo_profissional')
    .optional({ checkFalsy: true })
    .isIn(['psicologo', 'psiquiatra', 'terapeuta'])
    .withMessage('Tipo profissional deve ser: psicologo, psiquiatra ou terapeuta'),
  
  body('crp_ou_registro')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('CRP/Registro deve ter entre 1 e 50 caracteres'),
  
  body('especialidades')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Especialidades deve ter no máximo 500 caracteres'),
  
  body('telefone')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Telefone deve ter no máximo 20 caracteres'),
  
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Email deve ser um endereço válido'),
  
  body('foto_url')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('URL da foto deve ter no máximo 500 caracteres'),
  
  body('atende_online')
    .optional()
    .isBoolean()
    .withMessage('Atende online deve ser um valor booleano'),
  
  body('atende_presencial')
    .optional()
    .isBoolean()
    .withMessage('Atende presencial deve ser um valor booleano'),
  
  body('cidade')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Cidade deve ter no máximo 100 caracteres'),
  
  body('estado')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ser a sigla (2 caracteres)'),
  
  body('valor_sessao')
    .optional({ checkFalsy: true })
    .isDecimal({ decimal_digits: '1,2' })
    .withMessage('Valor da sessão deve ser um número decimal válido'),
  
  body('ativo')
    .optional()
    .isBoolean()
    .withMessage('Ativo deve ser um valor booleano')
];

/**
 * Validação para ID de profissional na URL
 */
const idProfissionalParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do profissional deve ser um número inteiro positivo')
];

// ========== ENDPOINTS DE CHECK-IN EMOCIONAL ==========

/**
 * Validação para ID de check-in na URL
 */
const idCheckInParamValidation = [
  param('id_checkin')
    .isInt({ min: 1 })
    .withMessage('ID do check-in deve ser um número inteiro positivo')
];

/**
 * Validação para ID de usuário na URL
 */
const idUserParamValidation = [
  param('id_user')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo')
];

/**
 * Validação para registrar/atualizar check-in emocional
 */
const checkInValidation = [
  body('id_user')
    .isInt({ min: 1 })
    .withMessage('ID do usuário é obrigatório e deve ser um número inteiro positivo'),
  
  body('score')
    .isInt({ min: 1, max: 5 })
    .withMessage('Score deve ser um número entre 1 e 5'),
  
  body('motivo')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Motivo deve ter entre 1 e 500 caracteres'),
  
  body('categoria_motivo')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Categoria do motivo deve ter no máximo 100 caracteres'),
  
  // Validação customizada: motivo obrigatório se score <= 3
  body().custom((body) => {
    if (body.score && body.score <= 3) {
      if (!body.motivo || typeof body.motivo !== 'string' || body.motivo.trim() === '') {
        throw new Error('Motivo é obrigatório quando o score é menor ou igual a 3');
      }
    }
    return true;
  })
];

/**
 * Validação para query parameters de paginação
 */
const paginationValidation = [
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset deve ser um número inteiro não-negativo'),
  
  query('data_inicio')
    .optional()
    .isISO8601()
    .withMessage('Data inicial deve estar no formato ISO 8601 (YYYY-MM-DD)'),
  
  query('data_fim')
    .optional()
    .isISO8601()
    .withMessage('Data final deve estar no formato ISO 8601 (YYYY-MM-DD)')
];

/**
 * @route POST /api/controle-emocional
 * @desc Registrar ou atualizar check-in emocional do dia
 * @access Private
 * @body { id_user, score, motivo?, categoria_motivo? }
 */
router.post('/',
  checkInValidation,
  validateRequest,
  controleEmocionalController.registrarCheckIn.bind(controleEmocionalController)
);

// ========== ENDPOINTS DE PROFISSIONAIS DE SAÚDE MENTAL ==========

/**
 * @route POST /api/controle-emocional/profissionais
 * @desc Criar novo profissional de saúde mental
 * @access Private (Admin)
 * @body { nome, tipo_profissional, crp_ou_registro, especialidades?, telefone?, email?, foto_url?, atende_online?, atende_presencial?, cidade?, estado?, valor_sessao? }
 */
router.post('/profissionais',
  profissionalCreateValidation,
  validateRequest,
  controleEmocionalController.criarProfissional.bind(controleEmocionalController)
);

/**
 * @route GET /api/controle-emocional/profissionais
 * @desc Listar profissionais de saúde mental com filtros
 * @access Private
 * @query { tipo_profissional?, ativo?, atende_online?, atende_presencial?, limite?, offset? }
 */
router.get('/profissionais',
  paginationValidation,
  query('tipo_profissional')
    .optional()
    .isIn(['psicologo', 'psiquiatra', 'terapeuta'])
    .withMessage('Tipo profissional deve ser: psicologo, psiquiatra ou terapeuta'),
  
  query('ativo')
    .optional()
    .isBoolean()
    .withMessage('Ativo deve ser um valor booleano'),
  
  query('atende_online')
    .optional()
    .isBoolean()
    .withMessage('Atende online deve ser um valor booleano'),
  
  query('atende_presencial')
    .optional()
    .isBoolean()
    .withMessage('Atende presencial deve ser um valor booleano'),
  
  validateRequest,
  controleEmocionalController.listarProfissionais.bind(controleEmocionalController)
);

/**
 * @route GET /api/controle-emocional/profissionais/:id
 * @desc Buscar profissional de saúde mental por ID
 * @access Private
 * @param { id }
 */
router.get('/profissionais/:id',
  idProfissionalParamValidation,
  validateRequest,
  controleEmocionalController.buscarProfissional.bind(controleEmocionalController)
);

/**
 * @route PUT /api/controle-emocional/profissionais/:id
 * @desc Atualizar profissional de saúde mental
 * @access Private (Admin)
 * @param { id }
 * @body { nome?, tipo_profissional?, crp_ou_registro?, especialidades?, telefone?, email?, foto_url?, atende_online?, atende_presencial?, cidade?, estado?, valor_sessao?, ativo? }
 */
router.put('/profissionais/:id',
  idProfissionalParamValidation,
  profissionalUpdateValidation,
  validateRequest,
  controleEmocionalController.atualizarProfissional.bind(controleEmocionalController)
);

/**
 * @route DELETE /api/controle-emocional/profissionais/:id
 * @desc Deletar profissional de saúde mental
 * @access Private (Admin)
 * @param { id }
 */
router.delete('/profissionais/:id',
  idProfissionalParamValidation,
  validateRequest,
  controleEmocionalController.deletarProfissional.bind(controleEmocionalController)
);

// ========== ENDPOINTS DE CHECK-IN EMOCIONAL ==========

/**
 * @route GET /api/controle-emocional/:id_user/hoje
 * @desc Buscar check-in emocional de hoje
 * @access Private
 * @param { id_user }
 */
router.get('/:id_user/hoje',
  idUserParamValidation,
  validateRequest,
  controleEmocionalController.buscarCheckInHoje.bind(controleEmocionalController)
);

/**
 * @route GET /api/controle-emocional/:id_user/historico
 * @desc Buscar histórico de check-ins emocionais com paginação
 * @access Private
 * @param { id_user }
 * @query { limite, offset, data_inicio, data_fim }
 */
router.get('/:id_user/historico',
  idUserParamValidation,
  paginationValidation,
  validateRequest,
  controleEmocionalController.buscarHistorico.bind(controleEmocionalController)
);

/**
 * @route GET /api/controle-emocional/:id_user/estatisticas
 * @desc Buscar estatísticas de bem-estar por período
 * @access Private
 * @param { id_user }
 * @query { data_inicio, data_fim }
 */
router.get('/:id_user/estatisticas',
  idUserParamValidation,
  paginationValidation,
  validateRequest,
  controleEmocionalController.buscarEstatisticas.bind(controleEmocionalController)
);

/**
 * @route PUT /api/controle-emocional/:id_checkin
 * @desc Atualizar check-in emocional
 * @access Private
 * @param { id_checkin }
 * @body { score, motivo?, categoria_motivo? }
 */
router.put('/:id_checkin',
  idCheckInParamValidation,
  body('score')
    .isInt({ min: 1, max: 5 })
    .withMessage('Score deve ser um número entre 1 e 5'),
  
  body('motivo')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Motivo deve ter entre 1 e 500 caracteres'),
  
  body('categoria_motivo')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Categoria do motivo deve ter no máximo 100 caracteres'),
  
  // Validação customizada: motivo obrigatório se score <= 3
  body().custom((body) => {
    if (body.score && body.score <= 3) {
      if (!body.motivo || typeof body.motivo !== 'string' || body.motivo.trim() === '') {
        throw new Error('Motivo é obrigatório quando o score é menor ou igual a 3');
      }
    }
    return true;
  }),
  
  validateRequest,
  controleEmocionalController.atualizarCheckIn.bind(controleEmocionalController)
);

module.exports = router;
