const express = require('express');
const multer = require('multer');
const iaDocumentoController = require('../controllers/ia.documento.controller');
const logger = require('../utils/logger');

const router = express.Router();

const allowedMimes = [
  'application/pdf',
  'text/html',
  'text/plain',
  'application/octet-stream'
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 4
  },
  fileFilter: (req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const ok = allowedMimes.includes(mime) ||
      file.originalname?.toLowerCase().endsWith('.pdf') ||
      file.originalname?.toLowerCase().endsWith('.html') ||
      file.originalname?.toLowerCase().endsWith('.htm');
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo não permitido: ${file.mimetype}. Use PDF e HTML.`), false);
    }
  }
});

const uploadFields = upload.fields([
  { name: 'template_html', maxCount: 1 },
  { name: 'documento_pdf', maxCount: 1 }
]);

/**
 * POST /api/ia/documento/gerar
 *
 * Gera documento visual em HTML+CSS a partir de um PDF (texto) e um template HTML.
 * Multipart: template_html (arquivo), documento_pdf (arquivo).
 * Opcional: modelo_visual (string), metadados (JSON string).
 * Público: não requer autenticação (sem token JWT).
 */
router.post(
  '/gerar',
  (req, res, next) => {
    uploadFields(req, res, (err) => {
      if (err) {
        logger.warn('Multer erro em /api/ia/documento', { error: err.message });
        return res.status(400).json({
          success: false,
          message: err.message || 'Erro no upload dos arquivos.',
          timestamp: new Date().toISOString()
        });
      }
      next();
    });
  },
  (req, res, next) => {
    const t = req.files?.template_html?.[0];
    const p = req.files?.documento_pdf?.[0];
    if (!t || !p) {
      return res.status(400).json({
        success: false,
        message: 'Envie os dois arquivos: "template_html" e "documento_pdf".',
        timestamp: new Date().toISOString()
      });
    }
    next();
  },
  iaDocumentoController.gerar
);

/**
 * POST /api/ia/documento/ajustar
 *
 * Ajusta um documento HTML conforme o prompt do usuário usando IA.
 * Body (JSON):
 * - html_formatado (string): Código HTML do documento
 * - conteudo_texto (string): Texto puro do documento (opcional)
 * - prompt_usuario (string): Instrução de ajuste solicitada
 * - ementa (object): Ementa do documento (opcional)
 * - entidade_juridica (array): Partes envolvidas (opcional)
 * - sugestoes_analise (object): Contexto jurídico (opcional)
 * - citacoes_de_lei (array): Referências legais (opcional)
 * - resposta_anterior_ia (string): Resposta anterior da IA para referência (opcional)
 *
 * Retorna: { html_formatado, explicacao_ia }
 * Público: não requer autenticação (sem token JWT).
 */
router.post('/ajustar', iaDocumentoController.ajustar);

module.exports = router;
