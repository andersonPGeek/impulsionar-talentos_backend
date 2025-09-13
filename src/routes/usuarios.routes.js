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

/**
 * @route POST /api/usuarios/cliente/:id_cliente
 * @desc Criar novo usuário
 * @access Private
 */
router.post('/cliente/:id_cliente', usuariosController.criarUsuario);

/**
 * @route GET /api/usuarios/cliente/:id_cliente
 * @desc Buscar todos os usuários por cliente
 * @access Private
 */
router.get('/cliente/:id_cliente', usuariosController.buscarUsuariosPorCliente);

/**
 * @route GET /api/usuarios/sem-gestor/:id_cliente
 * @desc Buscar usuários sem gestor
 * @access Private
 */
router.get('/sem-gestor/:id_cliente', usuariosController.buscarUsuariosSemGestor);

/**
 * @route GET /api/usuarios/com-gestor/:id_cliente
 * @desc Buscar usuários com gestor
 * @access Private
 */
router.get('/com-gestor/:id_cliente', usuariosController.buscarUsuariosComGestor);

/**
 * @route PUT /api/usuarios/:id_usuario/remover-gestor/:id_usuario_gestor
 * @desc Remover gestor de usuário
 * @access Private
 */
router.put('/:id_usuario/remover-gestor/:id_usuario_gestor', usuariosController.removerGestorUsuario);

/**
 * @route PUT /api/usuarios/:id_usuario/atribuir-gestor/:id_usuario_gestor
 * @desc Atribuir gestor a usuário
 * @access Private
 */
router.put('/:id_usuario/atribuir-gestor/:id_usuario_gestor', usuariosController.atribuirGestorUsuario);

/**
 * @route GET /api/usuarios/all-usuarios/:id_cliente
 * @desc Buscar todos os usuários por cliente (perfil_acesso = 1)
 * @access Private
 */
router.get('/all-usuarios/:id_cliente', usuariosController.buscarTodosUsuariosPorCliente);

/**
 * @route GET /api/usuarios/all-gestores/:id_cliente
 * @desc Buscar todos os gestores por cliente (perfil_acesso in (2,3))
 * @access Private
 */
router.get('/all-gestores/:id_cliente', usuariosController.buscarTodosGestoresPorCliente);

module.exports = router;
