const express = require('express');
const multer = require('multer');
const { body, param, validationResult } = require('express-validator');
const portifolioController = require('../controllers/portifolio.controller');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
    files: 20 // Máximo 20 arquivos por requisição
  },
  fileFilter: (req, file, cb) => {
    // Permitir apenas tipos de arquivo comuns para portfólio
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
    }
  }
});

// Middleware para capturar erros do multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo permitido: 10MB',
        error: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Muitos arquivos. Máximo permitido: 20 arquivos',
        error: 'TOO_MANY_FILES'
      });
    }
  }
  
  if (error.message.includes('Tipo de arquivo não permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }

  next(error);
};

// Validações para POST
const validateSalvarPortifolio = [
  body('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo'),
  
  body('experiencias')
    .isString()
    .withMessage('Experiências devem ser enviadas como string JSON')
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error('Experiências devem ser um array');
        }
        if (parsed.length === 0) {
          throw new Error('Lista de experiências não pode estar vazia');
        }
        
        // Validar cada experiência
        parsed.forEach((exp, index) => {
          if (!exp.titulo_experiencia || typeof exp.titulo_experiencia !== 'string') {
            throw new Error(`Experiência ${index + 1}: título é obrigatório`);
          }
          if (!exp.data_experiencia || typeof exp.data_experiencia !== 'string') {
            throw new Error(`Experiência ${index + 1}: data é obrigatória`);
          }
          if (!exp.acao_realizada || typeof exp.acao_realizada !== 'string') {
            throw new Error(`Experiência ${index + 1}: ação realizada é obrigatória`);
          }
          if (!exp.resultado_entregue || typeof exp.resultado_entregue !== 'string') {
            throw new Error(`Experiência ${index + 1}: resultado entregue é obrigatório`);
          }
          
          // Validar materiais se existirem
          if (exp.materiais && !Array.isArray(exp.materiais)) {
            throw new Error(`Experiência ${index + 1}: materiais devem ser um array`);
          }
          
          // Validar links se existirem
          if (exp.links && !Array.isArray(exp.links)) {
            throw new Error(`Experiência ${index + 1}: links devem ser um array`);
          }
          
          // Validar feedbacks se existirem
          if (exp.feedbacks && !Array.isArray(exp.feedbacks)) {
            throw new Error(`Experiência ${index + 1}: feedbacks devem ser um array`);
          }
        });
        
        return true;
      } catch (error) {
        throw new Error(`Formato de experiências inválido: ${error.message}`);
      }
    })
];

// Validações para GET
const validateGetPortifolio = [
  param('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo')
];

// Validações para PUT
const validateAtualizarPortifolio = [
  param('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo'),
  
  param('id_experiencia_portifolio')
    .isInt({ min: 1 })
    .withMessage('ID da experiência deve ser um número inteiro positivo'),
  
  body('experiencias')
    .isString()
    .withMessage('Experiências devem ser enviadas como string JSON')
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error('Experiências devem ser um array');
        }
        if (parsed.length === 0) {
          throw new Error('Lista de experiências não pode estar vazia');
        }
        
        // Validar cada experiência
        parsed.forEach((exp, index) => {
          if (!exp.titulo_experiencia || typeof exp.titulo_experiencia !== 'string') {
            throw new Error(`Experiência ${index + 1}: título é obrigatório`);
          }
          if (!exp.data_experiencia || typeof exp.data_experiencia !== 'string') {
            throw new Error(`Experiência ${index + 1}: data é obrigatória`);
          }
          if (!exp.acao_realizada || typeof exp.acao_realizada !== 'string') {
            throw new Error(`Experiência ${index + 1}: ação realizada é obrigatória`);
          }
          if (!exp.resultado_entregue || typeof exp.resultado_entregue !== 'string') {
            throw new Error(`Experiência ${index + 1}: resultado entregue é obrigatório`);
          }
          
          // Validar materiais se existirem
          if (exp.materiais && !Array.isArray(exp.materiais)) {
            throw new Error(`Experiência ${index + 1}: materiais devem ser um array`);
          }
          
          // Validar links se existirem
          if (exp.links && !Array.isArray(exp.links)) {
            throw new Error(`Experiência ${index + 1}: links devem ser um array`);
          }
          
          // Validar feedbacks se existirem
          if (exp.feedbacks && !Array.isArray(exp.feedbacks)) {
            throw new Error(`Experiência ${index + 1}: feedbacks devem ser um array`);
          }
        });
        
        return true;
      } catch (error) {
        throw new Error(`Formato de experiências inválido: ${error.message}`);
      }
    })
];

// Validações para DELETE
const validateDeletarPortifolio = [
  param('id_usuario')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo'),
  
  param('id_experiencia_portifolio')
    .isInt({ min: 1 })
    .withMessage('ID da experiência deve ser um número inteiro positivo')
];

/**
 * @route POST /api/portifolio
 * @desc Salva um portfólio completo com experiências, materiais, links e feedbacks
 * @access Public
 * @body FormData: id_usuario, experiencias (JSON string), arquivos (opcional)
 */
router.post(
  '/',
  upload.array('materiais', 20), // Aceita até 20 arquivos
  handleMulterError,
  validateSalvarPortifolio,
  validateRequest,
  portifolioController.salvarPortifolio
);

/**
 * @route GET /api/portifolio/:id_usuario
 * @desc Busca o portfólio de um usuário
 * @access Public
 * @param id_usuario - ID do usuário
 */
router.get(
  '/:id_usuario',
  validateGetPortifolio,
  validateRequest,
  portifolioController.getPortifolio
);

/**
 * @route PUT /api/portifolio/:id_usuario/:id_experiencia_portifolio
 * @desc Atualiza uma experiência específica (deleta e recria)
 * @access Public
 * @param id_usuario - ID do usuário
 * @param id_experiencia_portifolio - ID da experiência
 * @body FormData: experiencias (JSON string), arquivos (opcional)
 */
router.put(
  '/:id_usuario/:id_experiencia_portifolio',
  upload.array('materiais', 20), // Aceita até 20 arquivos
  handleMulterError,
  validateAtualizarPortifolio,
  validateRequest,
  portifolioController.atualizarPortifolio
);

/**
 * @route DELETE /api/portifolio/:id_usuario/:id_experiencia_portifolio
 * @desc Deleta uma experiência específica (incluindo arquivos do S3)
 * @access Public
 * @param id_usuario - ID do usuário
 * @param id_experiencia_portifolio - ID da experiência
 */
router.delete(
  '/:id_usuario/:id_experiencia_portifolio',
  validateDeletarPortifolio,
  validateRequest,
  portifolioController.deletarPortifolio
);

// Middleware de tratamento de erros específico para rotas de portfólio
router.use((error, req, res, next) => {
  logger.error('Erro nas rotas de portfólio', { 
    error: error.message, 
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  if (error.message.includes('multer')) {
    return res.status(400).json({
      success: false,
      message: 'Erro no upload de arquivos',
      error: 'UPLOAD_ERROR'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

module.exports = router;




