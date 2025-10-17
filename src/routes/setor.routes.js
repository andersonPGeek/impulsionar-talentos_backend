const express = require('express');
const setorController = require('../controllers/setor.controller');

const router = express.Router();

/**
 * @route GET /api/setores/cliente/:id_cliente
 * @desc Buscar todos os setores por cliente
 * @access Private
 */
router.get('/cliente/:id_cliente', setorController.buscarSetoresPorCliente);

/**
 * @route POST /api/setores/cliente/:id_cliente
 * @desc Criar novo setor
 * @access Private
 */
router.post('/cliente/:id_cliente', setorController.criarSetor);

/**
 * @route GET /api/setores/:id_setor/cliente/:id_cliente
 * @desc Buscar setor específico
 * @access Private
 */
router.get('/:id_setor/cliente/:id_cliente', setorController.buscarSetor);

/**
 * @route PUT /api/setores/:id_setor/cliente/:id_cliente
 * @desc Atualizar setor
 * @access Private
 */
router.put('/:id_setor/cliente/:id_cliente', setorController.atualizarSetor);

/**
 * @route DELETE /api/setores/:id_setor/cliente/:id_cliente
 * @desc Deletar setor
 * @access Private
 */
router.delete('/:id_setor/cliente/:id_cliente', setorController.deletarSetor);

module.exports = router;






