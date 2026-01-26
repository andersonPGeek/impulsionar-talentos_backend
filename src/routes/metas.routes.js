const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const metasController = require('../controllers/metas.controller');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas arquivos de imagem e PDF
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas imagens, PDF e texto são aceitos.'), false);
    }
  }
});

/**
 * Middleware para normalizar status antes da validação
 */
const normalizeStatus = (req, res, next) => {
  if (req.body && req.body.status) {
    const statusMap = {
      'em_progresso': 'Em Progresso',
      'em progresso': 'Em Progresso',
      'progresso': 'Em Progresso',
      'parado': 'Parado',
      'atrasado': 'Atrasado',
      'concluida': 'Concluida',
      'concluído': 'Concluida',
      'concluida': 'Concluida'
    };
    
    const statusLower = String(req.body.status).toLowerCase().trim();
    if (statusMap[statusLower]) {
      req.body.status = statusMap[statusLower];
    }
  }
  next();
};

/**
 * Validação para atualizar status de atividade
 */
const validateAtualizarAtividade = [
  body('status_atividade')
    .notEmpty()
    .withMessage('Status da atividade é obrigatório')
    .isIn(['backlog', 'em_progresso', 'concluida', 'cancelada'])
    .withMessage('Status deve ser: backlog, em_progresso, concluida ou cancelada'),
];

/**
 * Validação para atualizar status da meta
 */
const validateAtualizarStatusMeta = [
  normalizeStatus,
  body('status')
    .notEmpty()
    .withMessage('Status é obrigatório')
    .isIn(['Em Progresso', 'Parado', 'Atrasado', 'Concluida'])
    .withMessage('Status deve ser: Em Progresso, Parado, Atrasado ou Concluida'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Erro de validação na atualização de status da meta', {
        errors: errors.array(),
        body: req.body
      });
      return validateRequest(req, res, next);
    }
    next();
  }
];

/**
 * Validação para criar meta PDI
 */
const validateCriarMeta = [
  normalizeStatus,
  body('id_usuario')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo'),

  body('titulo_da_meta')
    .notEmpty()
    .withMessage('Título da meta é obrigatório')
    .isLength({ min: 1, max: 255 })
    .withMessage('Título da meta deve ter entre 1 e 255 caracteres'),

  body('atividades')
    .isArray({ min: 1 })
    .withMessage('Array de atividades é obrigatório e deve conter pelo menos uma atividade')
    .custom((atividades) => {
      if (!Array.isArray(atividades)) {
        throw new Error('Atividades deve ser um array');
      }
      if (atividades.length === 0) {
        throw new Error('Array de atividades não pode estar vazio');
      }
      for (const atividade of atividades) {
        if (typeof atividade !== 'string' || atividade.trim().length === 0) {
          throw new Error('Cada atividade deve ser uma string não vazia');
        }
      }
      return true;
    }),

  body('data_vencimento')
    .notEmpty()
    .withMessage('Data de vencimento é obrigatória')
    .isISO8601()
    .withMessage('Data de vencimento deve estar no formato ISO 8601 (YYYY-MM-DD)')
    .custom((value) => {
      const data = new Date(value);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (data < hoje) {
        throw new Error('Data de vencimento não pode ser anterior à data atual');
      }
      return true;
    }),

  body('status')
    .notEmpty()
    .withMessage('Status é obrigatório')
    .isIn(['Em Progresso', 'Parado', 'Atrasado', 'Concluida'])
    .withMessage('Status deve ser: Em Progresso, Parado, Atrasado ou Concluida'),

  body('id_usuarios')
    .isArray({ min: 1 })
    .withMessage('Array de usuários envolvidos é obrigatório e deve conter pelo menos um usuário')
    .custom((usuarios) => {
      if (!Array.isArray(usuarios)) {
        throw new Error('ID de usuários deve ser um array');
      }
      if (usuarios.length === 0) {
        throw new Error('Array de usuários não pode estar vazio');
      }
      for (const userId of usuarios) {
        if (!Number.isInteger(userId) || userId < 1) {
          throw new Error('Cada ID de usuário deve ser um número inteiro positivo');
        }
      }
      return true;
    }),

  body('resultado_3_meses')
    .optional()
    .isString()
    .withMessage('Resultado 3 meses deve ser uma string')
    .isLength({ max: 1000 })
    .withMessage('Resultado 3 meses deve ter no máximo 1000 caracteres'),

  body('resultado_6_meses')
    .optional()
    .isString()
    .withMessage('Resultado 6 meses deve ser uma string')
    .isLength({ max: 1000 })
    .withMessage('Resultado 6 meses deve ter no máximo 1000 caracteres'),

  body('observacao_gestor')
    .optional()
    .isString()
    .withMessage('Observação do gestor deve ser uma string')
    .isLength({ max: 1000 })
    .withMessage('Observação do gestor deve ter no máximo 1000 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Erro de validação na criação de meta', {
        errors: errors.array(),
        body: req.body
      });
      return validateRequest(req, res, next);
    }
    next();
  }
];

/**
 * @route POST /api/metas
 * @desc Criar uma nova meta PDI
 * @access Private
 */
router.post('/', validateCriarMeta, metasController.criarMeta);

/**
 * @route PUT /api/metas/:id
 * @desc Atualizar uma meta PDI existente
 * @access Private
 */
router.put('/:id', validateCriarMeta, metasController.atualizarMeta);

/**
 * @route GET /api/metas/gestor/:id_gestor
 * @desc Buscar metas por gestor
 * @access Private
 */
router.get('/gestor/:id_gestor', metasController.buscarMetasPorGestor);

/**
 * @route GET /api/metas/usuario/:id_usuario
 * @desc Buscar metas por usuário
 * @access Private
 */
router.get('/usuario/:id_usuario', metasController.buscarMetasPorUsuario);

/**
 * @route GET /api/metas/habilidades-cargo/:id_cargo
 * @desc Listar habilidades disponíveis para um cargo
 * @access Private
 */
router.get('/habilidades-cargo/:id_cargo', metasController.buscarHabilidadesPorCargo);

/**
 * @route PUT /api/metas/atividade/:id_meta_pdi/:id_atividade
 * @desc Atualizar status de atividade e evidência
 * @access Private
 */
router.put('/atividade/:id_meta_pdi/:id_atividade', 
  upload.single('evidencia_atividade'),
  validateAtualizarAtividade,
  validateRequest,
  metasController.atualizarStatusAtividade
);

/**
 * @route PATCH /api/metas/:id/status
 * @desc Atualizar apenas o status de uma meta PDI
 * @access Private
 */
router.patch('/:id/status',
  validateAtualizarStatusMeta,
  validateRequest,
  metasController.atualizarStatusMeta
);

module.exports = router;
