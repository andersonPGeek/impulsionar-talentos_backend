const { query } = require('../utils/supabase');
const ApiResponse = require('../utils/response');
const { BaseController } = require('./index');

class PerfilColaboradorController extends BaseController {
  constructor() {
    super();
    this.getPerfil = this.getPerfil.bind(this);
    this.salvarPerfil = this.salvarPerfil.bind(this);
    this.atualizarPerfil = this.atualizarPerfil.bind(this);
  }

  // GET - Buscar perfil do colaborador
  async getPerfil(req, res) {
    try {
      const { id_usuario } = req.params;

      // Validar se o id_usuario foi fornecido
      if (!id_usuario) {
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      // Buscar perfil do colaborador
      const perfilResult = await query(
        'SELECT sobre_perfil, id_resultado_personalidades, id_resultado_sabotadores FROM perfil_colaborador WHERE id_usuario = $1',
        [id_usuario]
      );

      if (perfilResult.rows.length === 0) {
        return ApiResponse.notFound(res, 'Perfil do colaborador não encontrado');
      }

      const perfil = perfilResult.rows[0];

      return ApiResponse.success(res, {
        id_usuario: parseInt(id_usuario),
        sobre_perfil: perfil.sobre_perfil,
        id_resultado_personalidades: perfil.id_resultado_personalidades,
        id_resultado_sabotadores: perfil.id_resultado_sabotadores
      }, 'Perfil do colaborador encontrado com sucesso');

    } catch (error) {
      return this.handleError(res, error, 'Erro ao buscar perfil do colaborador');
    }
  }

  // POST - Salvar perfil do colaborador
  async salvarPerfil(req, res) {
    try {
      const { id_usuario, sobre_perfil } = req.body;

      // Validar campos obrigatórios
      if (!id_usuario) {
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      if (!sobre_perfil) {
        return ApiResponse.validationError(res, 'Campo sobre_perfil é obrigatório');
      }

      // Verificar se já existe um perfil para este usuário
      const existingPerfil = await query(
        'SELECT id FROM perfil_colaborador WHERE id_usuario = $1',
        [id_usuario]
      );

      if (existingPerfil.rows.length > 0) {
        return ApiResponse.validationError(res, 'Já existe um perfil para este usuário. Use PUT para atualizar.');
      }

      // Inserir novo perfil
      const insertResult = await query(
        'INSERT INTO perfil_colaborador (id_usuario, sobre_perfil) VALUES ($1, $2) RETURNING id_usuario, sobre_perfil',
        [id_usuario, sobre_perfil]
      );

      const novoPerfil = insertResult.rows[0];

      return ApiResponse.success(res, {
        id_usuario: novoPerfil.id_usuario,
        sobre_perfil: novoPerfil.sobre_perfil,
        id_resultado_personalidades: null,
        id_resultado_sabotadores: null
      }, 'Perfil do colaborador criado com sucesso', 201);

    } catch (error) {
      return this.handleError(res, error, 'Erro ao criar perfil do colaborador');
    }
  }

  // PUT - Atualizar perfil do colaborador
  async atualizarPerfil(req, res) {
    try {
      const { id_usuario, sobre_perfil } = req.body;

      // Validar campos obrigatórios
      if (!id_usuario) {
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      if (!sobre_perfil) {
        return ApiResponse.validationError(res, 'Campo sobre_perfil é obrigatório');
      }

      // Verificar se o perfil existe
      const existingPerfil = await query(
        'SELECT id FROM perfil_colaborador WHERE id_usuario = $1',
        [id_usuario]
      );

      if (existingPerfil.rows.length === 0) {
        return ApiResponse.notFound(res, 'Perfil do colaborador não encontrado. Use POST para criar.');
      }

      // Atualizar perfil
      const updateResult = await query(
        'UPDATE perfil_colaborador SET sobre_perfil = $1 WHERE id_usuario = $2 RETURNING id_usuario, sobre_perfil, id_resultado_personalidades, id_resultado_sabotadores',
        [sobre_perfil, id_usuario]
      );

      const perfilAtualizado = updateResult.rows[0];

      return ApiResponse.success(res, {
        id_usuario: perfilAtualizado.id_usuario,
        sobre_perfil: perfilAtualizado.sobre_perfil,
        id_resultado_personalidades: perfilAtualizado.id_resultado_personalidades,
        id_resultado_sabotadores: perfilAtualizado.id_resultado_sabotadores
      }, 'Perfil do colaborador atualizado com sucesso');

    } catch (error) {
      return this.handleError(res, error, 'Erro ao atualizar perfil do colaborador');
    }
  }
}

module.exports = new PerfilColaboradorController(); 