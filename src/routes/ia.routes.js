const express = require('express');
const iaController = require('../controllers/ia.controller');

const router = express.Router();

/**
 * @route GET /api/ia/info
 * @desc Obter informações sobre a API de IA
 * @access Private
 */
router.get('/info', iaController.obterInfoIA);

/**
 * @route POST /api/ia/gerar-habilidades
 * @desc Gerar habilidades para cargo usando IA
 * @access Private
 */
router.post('/gerar-habilidades', iaController.gerarHabilidades);

module.exports = router;








