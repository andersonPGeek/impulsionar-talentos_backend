const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

class HabilidadesUsuariosController extends BaseController {
  /**
   * Buscar todas as habilidades de um usuário
   * GET /api/habilidades-usuarios/usuario/:id_usuario
   */
  async buscarHabilidadesPorUsuario(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_usuario } = req.params;

      logger.info('Iniciando busca de habilidades por usuário', {
        id_usuario
      });

      // Validações básicas
      if (!id_usuario || isNaN(id_usuario)) {
        return ApiResponse.error(res, 'ID do usuário é obrigatório e deve ser um número válido', 400, {
          error: 'INVALID_USER_ID'
        });
      }

      // Verificar se o usuário existe e tem cargo
      const verificarUsuarioQuery = `
        SELECT u.id, u.nome, u.cargo, c.nome_cargo
        FROM usuarios u
        LEFT JOIN cargo c ON u.cargo = c.id
        WHERE u.id = $1
      `;
      const usuarioResult = await client.query(verificarUsuarioQuery, [id_usuario]);

      if (usuarioResult.rows.length === 0) {
        return ApiResponse.notFound(res, 'Usuário não encontrado');
      }

      const usuario = usuarioResult.rows[0];

      if (!usuario.cargo) {
        return ApiResponse.error(res, 'Usuário não possui cargo atribuído', 400, {
          error: 'USER_WITHOUT_JOB'
        });
      }

      // Buscar habilidades do usuário com informações da habilidade do cargo
      const habilidadesQuery = `
        SELECT 
          hu.id,
          hu.nivel,
          hu.created_at,
          hc.id as id_habilidade,
          hc.habilidade as titulo,
          hc.descricao
        FROM cargo c
        INNER JOIN habilidades_cargo hc ON c.id = hc.id_cargo
        INNER JOIN usuarios u on u.cargo = c.id
        LEFT JOIN habilidades_usuarios hu ON hu.id_habilidade = hc.id
        WHERE u.id = $1
        ORDER BY hc.habilidade
      `;
      
      const habilidadesResult = await client.query(habilidadesQuery, [id_usuario]);

      logger.info('Habilidades do usuário buscadas com sucesso', {
        id_usuario,
        nome_usuario: usuario.nome,
        cargo: usuario.nome_cargo,
        quantidade_habilidades: habilidadesResult.rows.length
      });

      const habilidades = habilidadesResult.rows.map(row => ({
        id: row.id,
        id_habilidade: row.id_habilidade,
        titulo: row.titulo,
        descricao: row.descricao,
        nivel: row.nivel,
        created_at: row.created_at
      }));

      return ApiResponse.success(res, {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          cargo: usuario.nome_cargo
        },
        habilidades,
        total_habilidades: habilidades.length
      }, 'Habilidades do usuário buscadas com sucesso');

    } catch (error) {
      logger.error('Erro ao buscar habilidades por usuário', { 
        error: error.message, 
        stack: error.stack,
        id_usuario: req.params.id_usuario
      });
      return ApiResponse.error(res, 'Erro interno do servidor', 500);
    } finally {
      client.release();
    }
  }

  /**
   * Adicionar/Atualizar habilidade de usuário
   * POST /api/habilidades-usuarios
   */
  async adicionarOuAtualizarHabilidade(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_usuario, id_habilidade, nivel } = req.body;

      logger.info('Iniciando adição/atualização de habilidade de usuário', {
        id_usuario,
        id_habilidade,
        nivel
      });

      // Validações básicas
      if (!id_usuario || isNaN(id_usuario)) {
        return ApiResponse.error(res, 'ID do usuário é obrigatório e deve ser um número válido', 400, {
          error: 'INVALID_USER_ID'
        });
      }

      if (!id_habilidade || isNaN(id_habilidade)) {
        return ApiResponse.error(res, 'ID da habilidade é obrigatório e deve ser um número válido', 400, {
          error: 'INVALID_SKILL_ID'
        });
      }

      if (nivel === undefined || nivel === null || isNaN(nivel)) {
        return ApiResponse.error(res, 'Nível da habilidade é obrigatório e deve ser um número válido', 400, {
          error: 'INVALID_SKILL_LEVEL'
        });
      }

      if (nivel < 1 || nivel > 5) {
        return ApiResponse.error(res, 'Nível da habilidade deve estar entre 1 e 5', 400, {
          error: 'INVALID_SKILL_LEVEL_RANGE'
        });
      }

      // Verificar se o usuário existe
      const verificarUsuarioQuery = `
        SELECT id, nome, cargo FROM usuarios WHERE id = $1
      `;
      const usuarioResult = await client.query(verificarUsuarioQuery, [id_usuario]);

      if (usuarioResult.rows.length === 0) {
        return ApiResponse.notFound(res, 'Usuário não encontrado');
      }

      const usuario = usuarioResult.rows[0];

      if (!usuario.cargo) {
        return ApiResponse.error(res, 'Usuário não possui cargo atribuído', 400, {
          error: 'USER_WITHOUT_JOB'
        });
      }

      // Verificar se a habilidade existe e pertence ao cargo do usuário
      const verificarHabilidadeQuery = `
        SELECT hc.id, hc.habilidade, hc.descricao, c.id as id_cargo
        FROM habilidades_cargo hc
        INNER JOIN cargo c ON hc.id_cargo = c.id
        WHERE hc.id = $1 AND c.id = $2
      `;
      const habilidadeResult = await client.query(verificarHabilidadeQuery, [id_habilidade, usuario.cargo]);

      if (habilidadeResult.rows.length === 0) {
        return ApiResponse.notFound(res, 'Habilidade não encontrada para o cargo do usuário');
      }

      const habilidade = habilidadeResult.rows[0];

      // Verificar se já existe registro para esta habilidade e usuário
      const existeQuery = `
        SELECT id, nivel FROM habilidades_usuarios
        WHERE id_usuario = $1 AND id_habilidade = $2
      `;
      const existeResult = await client.query(existeQuery, [id_usuario, id_habilidade]);

      let resultado;

      if (existeResult.rows.length > 0) {
        // Atualizar habilidade existente
        const atualizarQuery = `
          UPDATE habilidades_usuarios 
          SET nivel = $1
          WHERE id_usuario = $2 AND id_habilidade = $3
          RETURNING id, nivel, created_at
        `;
        
        const atualizarResult = await client.query(atualizarQuery, [nivel, id_usuario, id_habilidade]);
        resultado = atualizarResult.rows[0];

        logger.info('Habilidade de usuário atualizada com sucesso', {
          id: resultado.id,
          id_usuario,
          id_habilidade,
          nivel_anterior: existeResult.rows[0].nivel,
          nivel_novo: nivel
        });

      } else {
        // Criar nova habilidade
        const criarQuery = `
          INSERT INTO habilidades_usuarios (id_usuario, id_habilidade, nivel)
          VALUES ($1, $2, $3)
          RETURNING id, nivel, created_at
        `;
        
        const criarResult = await client.query(criarQuery, [id_usuario, id_habilidade, nivel]);
        resultado = criarResult.rows[0];

        logger.info('Habilidade de usuário criada com sucesso', {
          id: resultado.id,
          id_usuario,
          id_habilidade,
          nivel
        });
      }

      return ApiResponse.success(res, {
        id: resultado.id,
        id_usuario: parseInt(id_usuario),
        id_habilidade: parseInt(id_habilidade),
        titulo: habilidade.habilidade,
        descricao: habilidade.descricao,
        nivel: resultado.nivel,
        created_at: resultado.created_at
      }, existeResult.rows.length > 0 ? 'Habilidade atualizada com sucesso' : 'Habilidade adicionada com sucesso');

    } catch (error) {
      logger.error('Erro ao adicionar/atualizar habilidade de usuário', { 
        error: error.message, 
        stack: error.stack,
        id_usuario: req.body.id_usuario,
        id_habilidade: req.body.id_habilidade,
        nivel: req.body.nivel
      });
      return ApiResponse.error(res, 'Erro interno do servidor', 500);
    } finally {
      client.release();
    }
  }

  /**
   * Remover habilidade de usuário
   * DELETE /api/habilidades-usuarios/:id
   */
  async removerHabilidade(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;

      logger.info('Iniciando remoção de habilidade de usuário', {
        id
      });

      // Validações básicas
      if (!id || isNaN(id)) {
        return ApiResponse.error(res, 'ID é obrigatório e deve ser um número válido', 400, {
          error: 'INVALID_ID'
        });
      }

      // Verificar se a habilidade do usuário existe
      const verificarQuery = `
        SELECT 
          hu.id,
          hu.id_usuario,
          hu.id_habilidade,
          hu.nivel,
          u.nome as nome_usuario,
          hc.habilidade
        FROM habilidades_usuarios hu
        INNER JOIN usuarios u ON hu.id_usuario = u.id
        INNER JOIN habilidades_cargo hc ON hu.id_habilidade = hc.id
        WHERE hu.id = $1
      `;
      const verificarResult = await client.query(verificarQuery, [id]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, 'Habilidade do usuário não encontrada');
      }

      const habilidadeUsuario = verificarResult.rows[0];

      // Remover habilidade
      const removerQuery = `
        DELETE FROM habilidades_usuarios WHERE id = $1
      `;
      
      await client.query(removerQuery, [id]);

      logger.info('Habilidade de usuário removida com sucesso', {
        id,
        id_usuario: habilidadeUsuario.id_usuario,
        nome_usuario: habilidadeUsuario.nome_usuario,
        habilidade: habilidadeUsuario.habilidade,
        nivel: habilidadeUsuario.nivel
      });

      return ApiResponse.success(res, {
        id: parseInt(id),
        id_usuario: habilidadeUsuario.id_usuario,
        nome_usuario: habilidadeUsuario.nome_usuario,
        habilidade: habilidadeUsuario.habilidade,
        nivel_removido: habilidadeUsuario.nivel
      }, 'Habilidade removida com sucesso');

    } catch (error) {
      logger.error('Erro ao remover habilidade de usuário', { 
        error: error.message, 
        stack: error.stack,
        id: req.params.id
      });
      return ApiResponse.error(res, 'Erro interno do servidor', 500);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar habilidade específica de usuário
   * GET /api/habilidades-usuarios/:id
   */
  async buscarHabilidadeEspecifica(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;

      logger.info('Iniciando busca de habilidade específica de usuário', {
        id
      });

      // Validações básicas
      if (!id || isNaN(id)) {
        return ApiResponse.error(res, 'ID é obrigatório e deve ser um número válido', 400, {
          error: 'INVALID_ID'
        });
      }

      // Buscar habilidade específica
      const habilidadeQuery = `
        SELECT 
          hu.id,
          hu.nivel,
          hu.created_at,
          hu.id_usuario,
          hu.id_habilidade,
          u.nome as nome_usuario,
          u.cargo as id_cargo,
          c.nome_cargo,
          hc.habilidade as titulo,
          hc.descricao
        FROM habilidades_usuarios hu
        INNER JOIN usuarios u ON hu.id_usuario = u.id
        INNER JOIN cargo c ON u.cargo = c.id
        INNER JOIN habilidades_cargo hc ON hu.id_habilidade = hc.id
        WHERE hu.id = $1
      `;
      
      const habilidadeResult = await client.query(habilidadeQuery, [id]);

      if (habilidadeResult.rows.length === 0) {
        return ApiResponse.notFound(res, 'Habilidade do usuário não encontrada');
      }

      const habilidade = habilidadeResult.rows[0];

      logger.info('Habilidade específica de usuário buscada com sucesso', {
        id,
        id_usuario: habilidade.id_usuario,
        nome_usuario: habilidade.nome_usuario,
        habilidade: habilidade.titulo,
        nivel: habilidade.nivel
      });

      return ApiResponse.success(res, {
        id: habilidade.id,
        usuario: {
          id: habilidade.id_usuario,
          nome: habilidade.nome_usuario,
          cargo: habilidade.nome_cargo,
          id_cargo: habilidade.id_cargo
        },
        habilidade: {
          id: habilidade.id_habilidade,
          titulo: habilidade.titulo,
          descricao: habilidade.descricao
        },
        nivel: habilidade.nivel,
        created_at: habilidade.created_at
      }, 'Habilidade do usuário buscada com sucesso');

    } catch (error) {
      logger.error('Erro ao buscar habilidade específica de usuário', { 
        error: error.message, 
        stack: error.stack,
        id: req.params.id
      });
      return ApiResponse.error(res, 'Erro interno do servidor', 500);
    } finally {
      client.release();
    }
  }
}

module.exports = new HabilidadesUsuariosController();
module.exports.HabilidadesUsuariosController = HabilidadesUsuariosController;


