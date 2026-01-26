const express = require('express');
const WebSocket = require('ws');
const iaController = require('../controllers/ia.controller');
const logger = require('../utils/logger');

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

/**
 * @route POST /api/ia/chat/perfil
 * @desc Chat IA para preencher perfil do colaborador
 * @access Private
 */
router.post('/chat/perfil', iaController.chatPerfilColaborador);

/**
 * @route POST /api/ia/chat/gestor
 * @desc Chat IA para auxiliar gestor
 * @access Private
 */
router.post('/chat/gestor', iaController.chatGestor);

/**
 * @route POST /api/ia/chat/colaborador
 * @desc Chat IA para auxiliar colaborador
 * @access Private
 */
router.post('/chat/colaborador', iaController.chatColaborador);

/**
 * @route POST /api/ia/gerar-pdi
 * @desc Gerar PDI/Metas baseado no perfil do colaborador
 * @access Private
 */
router.post('/gerar-pdi', iaController.gerarPDI);

/**
 * @route POST /api/ia/voz/perfil
 * @desc Voz IA para preencher perfil do colaborador
 * @access Private
 */
router.post('/voz/perfil', iaController.vozPerfilColaborador);

/**
 * @route POST /api/ia/voz/gestor
 * @desc Voz IA para auxiliar gestor
 * @access Private
 */
router.post('/voz/gestor', iaController.vozGestor);

/**
 * @route POST /api/ia/voz/colaborador
 * @desc Voz IA para auxiliar colaborador
 * @access Private
 */
router.post('/voz/colaborador', iaController.vozColaborador);

/**
 * Configurar servidor WebSocket para conversação de voz
 * @param {http.Server} server - Servidor HTTP
 */
function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws/ia/voz'
  });

  wss.on('connection', (ws, req) => {
    logger.info('Cliente WebSocket conectado', {
      url: req.url,
      headers: {
        origin: req.headers.origin,
        'user-agent': req.headers['user-agent']
      }
    });

    // Parsear query params da URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const tipo = url.searchParams.get('tipo'); // perfil, gestor, colaborador
    const id = url.searchParams.get('id'); // id_user ou id_gestor

    if (!tipo || !id) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Parâmetros obrigatórios: tipo (perfil|gestor|colaborador) e id'
      }));
      ws.close();
      return;
    }

    // Conectar ao ElevenLabs e fazer bridge
    if (tipo === 'perfil') {
      iaController.handleWebSocketVozPerfil(ws, parseInt(id));
    } else if (tipo === 'gestor') {
      iaController.handleWebSocketVozGestor(ws, parseInt(id));
    } else if (tipo === 'colaborador') {
      iaController.handleWebSocketVozColaborador(ws, parseInt(id));
    } else {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Tipo inválido. Use: perfil, gestor ou colaborador'
      }));
      ws.close();
    }
  });

  logger.info('Servidor WebSocket configurado', {
    path: '/ws/ia/voz'
  });
}

module.exports = router;
module.exports.setupWebSocketServer = setupWebSocketServer;