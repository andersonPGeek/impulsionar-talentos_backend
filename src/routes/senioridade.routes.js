const express = require('express');
const senioridadeController = require('../controllers/senioridade.controller');

const router = express.Router();

/**
 * @route GET /api/senioridades/cliente/:id_cliente
 * @desc Buscar todas as senioridades por cliente
 * @access Private
 */
router.get('/cliente/:id_cliente', senioridadeController.buscarSenioridadesPorCliente);

/**
 * @route POST /api/senioridades/cliente/:id_cliente
 * @desc Criar nova senioridade
 * @access Private
 */
router.post('/cliente/:id_cliente', senioridadeController.criarSenioridade);

/**
 * @route GET /api/senioridades/:id_senioridade/cliente/:id_cliente
 * @desc Buscar senioridade específica
 * @access Private
 */
router.get('/:id_senioridade/cliente/:id_cliente', senioridadeController.buscarSenioridade);

/**
 * @route PUT /api/senioridades/:id_senioridade/cliente/:id_cliente
 * @desc Atualizar senioridade
 * @access Private
 */
router.put('/:id_senioridade/cliente/:id_cliente', senioridadeController.atualizarSenioridade);

/**
 * @route DELETE /api/senioridades/:id_senioridade/cliente/:id_cliente
 * @desc Deletar senioridade
 * @access Private
 */
router.delete('/:id_senioridade/cliente/:id_cliente', senioridadeController.deletarSenioridade);

module.exports = router;









