const express = require('express');
const habilidadesUsuariosController = require('../controllers/habilidades_usuarios.controller');

const router = express.Router();

/**
 * @route GET /api/habilidades-usuarios/usuario/:id_usuario
 * @desc Buscar todas as habilidades de um usuário
 * @access Private
 */
router.get('/usuario/:id_usuario', habilidadesUsuariosController.buscarHabilidadesPorUsuario);

/**
 * @route POST /api/habilidades-usuarios
 * @desc Adicionar ou atualizar habilidade de usuário
 * @access Private
 */
router.post('/', habilidadesUsuariosController.adicionarOuAtualizarHabilidade);

/**
 * @route GET /api/habilidades-usuarios/:id
 * @desc Buscar habilidade específica de usuário
 * @access Private
 */
router.get('/:id', habilidadesUsuariosController.buscarHabilidadeEspecifica);

/**
 * @route DELETE /api/habilidades-usuarios/:id
 * @desc Remover habilidade de usuário
 * @access Private
 */
router.delete('/:id', habilidadesUsuariosController.removerHabilidade);

module.exports = router;









