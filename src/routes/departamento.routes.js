const express = require('express');
const departamentoController = require('../controllers/departamento.controller');

const router = express.Router();

/**
 * @route GET /api/departamentos/cliente/:id_cliente
 * @desc Buscar todos os departamentos por cliente
 * @access Private
 */
router.get('/cliente/:id_cliente', departamentoController.buscarDepartamentosPorCliente);

/**
 * @route POST /api/departamentos/cliente/:id_cliente
 * @desc Criar novo departamento
 * @access Private
 */
router.post('/cliente/:id_cliente', departamentoController.criarDepartamento);

/**
 * @route GET /api/departamentos/:id_departamento/cliente/:id_cliente
 * @desc Buscar departamento específico
 * @access Private
 */
router.get('/:id_departamento/cliente/:id_cliente', departamentoController.buscarDepartamento);

/**
 * @route PUT /api/departamentos/:id_departamento/cliente/:id_cliente
 * @desc Atualizar departamento
 * @access Private
 */
router.put('/:id_departamento/cliente/:id_cliente', departamentoController.atualizarDepartamento);

/**
 * @route DELETE /api/departamentos/:id_departamento/cliente/:id_cliente
 * @desc Deletar departamento
 * @access Private
 */
router.delete('/:id_departamento/cliente/:id_cliente', departamentoController.deletarDepartamento);

module.exports = router;

