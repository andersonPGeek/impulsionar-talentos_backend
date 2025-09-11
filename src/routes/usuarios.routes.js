const express = require('express');
const usuariosController = require('../controllers/usuarios.controller');

const router = express.Router();

/**
 * @route GET /api/usuarios/buscar
 * @desc Buscar usuários por email e id_cliente
 * @access Private
 */
router.get('/buscar', usuariosController.buscarUsuariosPorEmail);

/**
 * @route GET /api/usuarios/gestor/:id_gestor
 * @desc Buscar usuários por gestor
 * @access Private
 */
router.get('/gestor/:id_gestor', usuariosController.buscarUsuariosPorGestor);

/**
 * @route GET /api/usuarios/dashboard/:id_usuario
 * @desc Buscar dashboard do usuário
 * @access Private
 */
router.get('/dashboard/:id_usuario', usuariosController.buscarDashboardUsuario);

module.exports = router;
