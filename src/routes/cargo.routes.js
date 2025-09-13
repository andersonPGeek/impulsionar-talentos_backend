const express = require('express');
const cargoController = require('../controllers/cargo.controller');

const router = express.Router();

/**
 * @route GET /api/cargos/cliente/:id_cliente
 * @desc Buscar todos os cargos por cliente
 * @access Private
 */
router.get('/cliente/:id_cliente', cargoController.buscarCargosPorCliente);

/**
 * @route POST /api/cargos/cliente/:id_cliente
 * @desc Criar novo cargo
 * @access Private
 */
router.post('/cliente/:id_cliente', cargoController.criarCargo);

/**
 * @route GET /api/cargos/:id_cargo/cliente/:id_cliente
 * @desc Buscar cargo específico
 * @access Private
 */
router.get('/:id_cargo/cliente/:id_cliente', cargoController.buscarCargo);

/**
 * @route PUT /api/cargos/:id_cargo/cliente/:id_cliente
 * @desc Atualizar cargo
 * @access Private
 */
router.put('/:id_cargo/cliente/:id_cliente', cargoController.atualizarCargo);

/**
 * @route DELETE /api/cargos/:id_cargo/cliente/:id_cliente
 * @desc Deletar cargo
 * @access Private
 */
router.delete('/:id_cargo/cliente/:id_cliente', cargoController.deletarCargo);

module.exports = router;

