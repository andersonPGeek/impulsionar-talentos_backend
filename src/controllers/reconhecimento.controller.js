const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

class ReconhecimentoController extends BaseController {
  /**
   * Buscar todos os reconhecimentos por usuário
   * GET /api/reconhecimento/usuario/:id_usuario
   */
  async buscarReconhecimentosPorUsuario(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_usuario } = req.params;

      logger.info('Iniciando busca de reconhecimentos por usuário', {
        id_usuario
      });

      // Validações básicas
      if (!id_usuario || isNaN(id_usuario)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      // Buscar reconhecimentos do usuário com informações relacionadas
      const reconhecimentosQuery = `
        SELECT 
          r.id,
          r.created_at,
          r.motivo_reconhecimento,
          r.id_usuario_reconhecido,
          r.id_usuario_reconheceu,
          r.id_tipo_reconhecimento,
          u_reconhecido.nome as nome_usuario_reconhecido,
          u_reconheceu.nome as nome_usuario_reconheceu,
          tr.reconhecimento as tipo_reconhecimento,
          tr.icone_reconhecimento
        FROM reconhecimento r
        LEFT JOIN usuarios u_reconhecido ON r.id_usuario_reconhecido = u_reconhecido.id
        LEFT JOIN usuarios u_reconheceu ON r.id_usuario_reconheceu = u_reconheceu.id
        LEFT JOIN tipo_reconhecimento tr ON r.id_tipo_reconhecimento = tr.id
        WHERE r.id_usuario_reconhecido = $1
        ORDER BY r.created_at DESC
      `;

      const result = await client.query(reconhecimentosQuery, [id_usuario]);

      if (result.rows.length === 0) {
        return ApiResponse.success(res, {
          message: 'Nenhum reconhecimento encontrado para este usuário',
          data: {
            usuario_id: parseInt(id_usuario),
            reconhecimentos: []
          }
        });
      }

      // Processar os resultados
      const reconhecimentos = result.rows.map(row => ({
        id: row.id,
        created_at: row.created_at,
        motivo_reconhecimento: row.motivo_reconhecimento,
        usuario_reconhecido: {
          id: row.id_usuario_reconhecido,
          nome: row.nome_usuario_reconhecido
        },
        usuario_reconheceu: {
          id: row.id_usuario_reconheceu,
          nome: row.nome_usuario_reconheceu
        },
        tipo_reconhecimento: {
          id: row.id_tipo_reconhecimento,
          reconhecimento: row.tipo_reconhecimento,
          icone_reconhecimento: row.icone_reconhecimento
        }
      }));

      logger.info('Reconhecimentos buscados com sucesso', {
        usuario_id: id_usuario,
        reconhecimentos_count: reconhecimentos.length
      });

      return ApiResponse.success(res, {
        message: 'Reconhecimentos buscados com sucesso',
        data: {
          usuario_id: parseInt(id_usuario),
          reconhecimentos
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar reconhecimentos por usuário', { 
        error: error.message, 
        stack: error.stack,
        usuario_id: req.params.id_usuario
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar reconhecimentos dados por um usuário
   * GET /api/reconhecimento/dados-por/:id_usuario
   */
  async buscarReconhecimentosDadosPorUsuario(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_usuario } = req.params;

      logger.info('Iniciando busca de reconhecimentos dados por usuário', {
        id_usuario
      });

      // Validações básicas
      if (!id_usuario || isNaN(id_usuario)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      // Buscar reconhecimentos dados pelo usuário
      const reconhecimentosQuery = `
        SELECT 
          r.id,
          r.created_at,
          r.motivo_reconhecimento,
          r.id_usuario_reconhecido,
          r.id_usuario_reconheceu,
          r.id_tipo_reconhecimento,
          u_reconhecido.nome as nome_usuario_reconhecido,
          u_reconheceu.nome as nome_usuario_reconheceu,
          tr.reconhecimento as tipo_reconhecimento,
          tr.icone_reconhecimento
        FROM reconhecimento r
        LEFT JOIN usuarios u_reconhecido ON r.id_usuario_reconhecido = u_reconhecido.id
        LEFT JOIN usuarios u_reconheceu ON r.id_usuario_reconheceu = u_reconheceu.id
        LEFT JOIN tipo_reconhecimento tr ON r.id_tipo_reconhecimento = tr.id
        WHERE r.id_usuario_reconheceu = $1
        ORDER BY r.created_at DESC
      `;

      const result = await client.query(reconhecimentosQuery, [id_usuario]);

      if (result.rows.length === 0) {
        return ApiResponse.success(res, {
          message: 'Nenhum reconhecimento dado por este usuário',
          data: {
            usuario_id: parseInt(id_usuario),
            reconhecimentos: []
          }
        });
      }

      // Processar os resultados
      const reconhecimentos = result.rows.map(row => ({
        id: row.id,
        created_at: row.created_at,
        motivo_reconhecimento: row.motivo_reconhecimento,
        usuario_reconhecido: {
          id: row.id_usuario_reconhecido,
          nome: row.nome_usuario_reconhecido
        },
        usuario_reconheceu: {
          id: row.id_usuario_reconheceu,
          nome: row.nome_usuario_reconheceu
        },
        tipo_reconhecimento: {
          id: row.id_tipo_reconhecimento,
          reconhecimento: row.tipo_reconhecimento,
          icone_reconhecimento: row.icone_reconhecimento
        }
      }));

      logger.info('Reconhecimentos dados buscados com sucesso', {
        usuario_id: id_usuario,
        reconhecimentos_count: reconhecimentos.length
      });

      return ApiResponse.success(res, {
        message: 'Reconhecimentos dados buscados com sucesso',
        data: {
          usuario_id: parseInt(id_usuario),
          reconhecimentos
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar reconhecimentos dados por usuário', { 
        error: error.message, 
        stack: error.stack,
        usuario_id: req.params.id_usuario
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Criar novo reconhecimento
   * POST /api/reconhecimento
   */
  async criarReconhecimento(req, res) {
    const client = await pool.connect();
    
    try {
      const {
        id_usuario_reconhecido,
        id_usuario_reconheceu,
        motivo_reconhecimento,
        id_tipo_reconhecimento
      } = req.body;

      logger.info('Iniciando criação de reconhecimento', {
        id_usuario_reconhecido,
        id_usuario_reconheceu,
        motivo_reconhecimento,
        id_tipo_reconhecimento
      });

      // Validações básicas
      if (!id_usuario_reconhecido || isNaN(id_usuario_reconhecido)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNIZED_USER_ID',
          message: 'ID do usuário reconhecido é obrigatório e deve ser um número válido'
        });
      }

      if (!id_usuario_reconheceu || isNaN(id_usuario_reconheceu)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNIZER_USER_ID',
          message: 'ID do usuário que reconheceu é obrigatório e deve ser um número válido'
        });
      }

      if (!motivo_reconhecimento || motivo_reconhecimento.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNITION_REASON',
          message: 'Motivo do reconhecimento é obrigatório'
        });
      }

      if (!id_tipo_reconhecimento || isNaN(id_tipo_reconhecimento)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNITION_TYPE_ID',
          message: 'ID do tipo de reconhecimento é obrigatório e deve ser um número válido'
        });
      }

      // Verificar se os usuários existem
      const verificarUsuariosQuery = `
        SELECT 
          u1.id as id_reconhecido,
          u1.nome as nome_reconhecido,
          u1.id_cliente as cliente_reconhecido,
          u2.id as id_reconheceu,
          u2.nome as nome_reconheceu,
          u2.id_cliente as cliente_reconheceu
        FROM usuarios u1
        CROSS JOIN usuarios u2
        WHERE u1.id = $1 AND u2.id = $2
      `;
      const usuariosResult = await client.query(verificarUsuariosQuery, [id_usuario_reconhecido, id_usuario_reconheceu]);

      if (usuariosResult.rows.length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'USERS_NOT_FOUND',
          message: 'Um ou ambos os usuários não foram encontrados'
        });
      }

      const usuarios = usuariosResult.rows[0];

      // Verificar se os usuários pertencem ao mesmo cliente
      if (usuarios.cliente_reconhecido !== usuarios.cliente_reconheceu) {
        return ApiResponse.badRequest(res, {
          error: 'DIFFERENT_CLIENTS',
          message: 'Os usuários devem pertencer ao mesmo cliente'
        });
      }

      // Verificar se o tipo de reconhecimento existe
      const verificarTipoQuery = `
        SELECT id, reconhecimento FROM tipo_reconhecimento WHERE id = $1
      `;
      const tipoResult = await client.query(verificarTipoQuery, [id_tipo_reconhecimento]);

      if (tipoResult.rows.length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'RECOGNITION_TYPE_NOT_FOUND',
          message: 'Tipo de reconhecimento não encontrado'
        });
      }

      // Verificar se não está tentando reconhecer a si mesmo
      if (parseInt(id_usuario_reconhecido) === parseInt(id_usuario_reconheceu)) {
        return ApiResponse.badRequest(res, {
          error: 'SELF_RECOGNITION',
          message: 'Um usuário não pode reconhecer a si mesmo'
        });
      }

      // Criar reconhecimento
      const criarQuery = `
        INSERT INTO reconhecimento (
          id_usuario_reconhecido,
          id_usuario_reconheceu,
          motivo_reconhecimento,
          id_tipo_reconhecimento
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at
      `;

      const criarResult = await client.query(criarQuery, [
        id_usuario_reconhecido,
        id_usuario_reconheceu,
        motivo_reconhecimento.trim(),
        id_tipo_reconhecimento
      ]);
      const novoReconhecimento = criarResult.rows[0];

      logger.info('Reconhecimento criado com sucesso', {
        id: novoReconhecimento.id,
        id_usuario_reconhecido,
        id_usuario_reconheceu,
        id_tipo_reconhecimento
      });

      return ApiResponse.created(res, {
        message: 'Reconhecimento criado com sucesso',
        data: {
          id: novoReconhecimento.id,
          id_usuario_reconhecido: parseInt(id_usuario_reconhecido),
          id_usuario_reconheceu: parseInt(id_usuario_reconheceu),
          motivo_reconhecimento: motivo_reconhecimento.trim(),
          id_tipo_reconhecimento: parseInt(id_tipo_reconhecimento),
          created_at: novoReconhecimento.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao criar reconhecimento', { 
        error: error.message, 
        stack: error.stack,
        id_usuario_reconhecido: req.body.id_usuario_reconhecido,
        id_usuario_reconheceu: req.body.id_usuario_reconheceu
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Atualizar reconhecimento
   * PUT /api/reconhecimento/:id
   */
  async atualizarReconhecimento(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const {
        motivo_reconhecimento,
        id_tipo_reconhecimento
      } = req.body;

      logger.info('Iniciando atualização de reconhecimento', {
        id,
        motivo_reconhecimento,
        id_tipo_reconhecimento
      });

      // Validações básicas
      if (!id || isNaN(id)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNITION_ID',
          message: 'ID do reconhecimento é obrigatório e deve ser um número válido'
        });
      }

      if (!motivo_reconhecimento || motivo_reconhecimento.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNITION_REASON',
          message: 'Motivo do reconhecimento é obrigatório'
        });
      }

      if (!id_tipo_reconhecimento || isNaN(id_tipo_reconhecimento)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNITION_TYPE_ID',
          message: 'ID do tipo de reconhecimento é obrigatório e deve ser um número válido'
        });
      }

      // Verificar se o reconhecimento existe
      const verificarQuery = `
        SELECT id, id_usuario_reconhecido, id_usuario_reconheceu FROM reconhecimento WHERE id = $1
      `;
      const verificarResult = await client.query(verificarQuery, [id]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'RECOGNITION_NOT_FOUND',
          message: 'Reconhecimento não encontrado'
        });
      }

      // Verificar se o tipo de reconhecimento existe
      const verificarTipoQuery = `
        SELECT id, reconhecimento FROM tipo_reconhecimento WHERE id = $1
      `;
      const tipoResult = await client.query(verificarTipoQuery, [id_tipo_reconhecimento]);

      if (tipoResult.rows.length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'RECOGNITION_TYPE_NOT_FOUND',
          message: 'Tipo de reconhecimento não encontrado'
        });
      }

      // Atualizar reconhecimento
      const atualizarQuery = `
        UPDATE reconhecimento 
        SET motivo_reconhecimento = $1, id_tipo_reconhecimento = $2
        WHERE id = $3
        RETURNING id, id_usuario_reconhecido, id_usuario_reconheceu, motivo_reconhecimento, id_tipo_reconhecimento, created_at
      `;

      const atualizarResult = await client.query(atualizarQuery, [
        motivo_reconhecimento.trim(),
        id_tipo_reconhecimento,
        id
      ]);
      const reconhecimentoAtualizado = atualizarResult.rows[0];

      logger.info('Reconhecimento atualizado com sucesso', {
        id: reconhecimentoAtualizado.id,
        id_tipo_reconhecimento
      });

      return ApiResponse.success(res, {
        message: 'Reconhecimento atualizado com sucesso',
        data: {
          id: reconhecimentoAtualizado.id,
          id_usuario_reconhecido: reconhecimentoAtualizado.id_usuario_reconhecido,
          id_usuario_reconheceu: reconhecimentoAtualizado.id_usuario_reconheceu,
          motivo_reconhecimento: reconhecimentoAtualizado.motivo_reconhecimento,
          id_tipo_reconhecimento: reconhecimentoAtualizado.id_tipo_reconhecimento,
          created_at: reconhecimentoAtualizado.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao atualizar reconhecimento', { 
        error: error.message, 
        stack: error.stack,
        id: req.params.id
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Deletar reconhecimento
   * DELETE /api/reconhecimento/:id
   */
  async deletarReconhecimento(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;

      logger.info('Iniciando exclusão de reconhecimento', {
        id
      });

      // Validações básicas
      if (!id || isNaN(id)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNITION_ID',
          message: 'ID do reconhecimento é obrigatório e deve ser um número válido'
        });
      }

      // Verificar se o reconhecimento existe
      const verificarQuery = `
        SELECT id, id_usuario_reconhecido, id_usuario_reconheceu FROM reconhecimento WHERE id = $1
      `;
      const verificarResult = await client.query(verificarQuery, [id]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'RECOGNITION_NOT_FOUND',
          message: 'Reconhecimento não encontrado'
        });
      }

      const reconhecimento = verificarResult.rows[0];

      // Deletar reconhecimento
      const deletarQuery = `
        DELETE FROM reconhecimento WHERE id = $1
      `;

      await client.query(deletarQuery, [id]);

      logger.info('Reconhecimento excluído com sucesso', {
        id: id,
        id_usuario_reconhecido: reconhecimento.id_usuario_reconhecido,
        id_usuario_reconheceu: reconhecimento.id_usuario_reconheceu
      });

      return ApiResponse.success(res, {
        message: 'Reconhecimento excluído com sucesso',
        data: {
          id: parseInt(id)
        }
      });

    } catch (error) {
      logger.error('Erro ao excluir reconhecimento', { 
        error: error.message, 
        stack: error.stack,
        id: req.params.id
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar reconhecimento específico
   * GET /api/reconhecimento/:id
   */
  async buscarReconhecimento(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;

      logger.info('Iniciando busca de reconhecimento específico', {
        id
      });

      // Validações básicas
      if (!id || isNaN(id)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNITION_ID',
          message: 'ID do reconhecimento é obrigatório e deve ser um número válido'
        });
      }

      // Buscar reconhecimento específico com informações relacionadas
      const reconhecimentoQuery = `
        SELECT 
          r.id,
          r.created_at,
          r.motivo_reconhecimento,
          r.id_usuario_reconhecido,
          r.id_usuario_reconheceu,
          r.id_tipo_reconhecimento,
          u_reconhecido.nome as nome_usuario_reconhecido,
          u_reconheceu.nome as nome_usuario_reconheceu,
          tr.reconhecimento as tipo_reconhecimento,
          tr.icone_reconhecimento
        FROM reconhecimento r
        LEFT JOIN usuarios u_reconhecido ON r.id_usuario_reconhecido = u_reconhecido.id
        LEFT JOIN usuarios u_reconheceu ON r.id_usuario_reconheceu = u_reconheceu.id
        LEFT JOIN tipo_reconhecimento tr ON r.id_tipo_reconhecimento = tr.id
        WHERE r.id = $1
      `;

      const result = await client.query(reconhecimentoQuery, [id]);

      if (result.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'RECOGNITION_NOT_FOUND',
          message: 'Reconhecimento não encontrado'
        });
      }

      const reconhecimento = result.rows[0];

      logger.info('Reconhecimento específico buscado com sucesso', {
        id: reconhecimento.id,
        id_usuario_reconhecido: reconhecimento.id_usuario_reconhecido,
        id_usuario_reconheceu: reconhecimento.id_usuario_reconheceu
      });

      return ApiResponse.success(res, {
        message: 'Reconhecimento buscado com sucesso',
        data: {
          id: reconhecimento.id,
          created_at: reconhecimento.created_at,
          motivo_reconhecimento: reconhecimento.motivo_reconhecimento,
          usuario_reconhecido: {
            id: reconhecimento.id_usuario_reconhecido,
            nome: reconhecimento.nome_usuario_reconhecido
          },
          usuario_reconheceu: {
            id: reconhecimento.id_usuario_reconheceu,
            nome: reconhecimento.nome_usuario_reconheceu
          },
          tipo_reconhecimento: {
            id: reconhecimento.id_tipo_reconhecimento,
            reconhecimento: reconhecimento.tipo_reconhecimento,
            icone_reconhecimento: reconhecimento.icone_reconhecimento
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar reconhecimento específico', { 
        error: error.message, 
        stack: error.stack,
        id: req.params.id
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar todos os tipos de reconhecimento
   * GET /api/reconhecimento/tipos
   */
  async buscarTiposReconhecimento(req, res) {
    const client = await pool.connect();
    
    try {
      logger.info('Iniciando busca de tipos de reconhecimento');

      // Buscar todos os tipos de reconhecimento
      const tiposQuery = `
        SELECT 
          id,
          reconhecimento,
          icone_reconhecimento,
          created_at
        FROM tipo_reconhecimento
        ORDER BY reconhecimento ASC
      `;

      const result = await client.query(tiposQuery);

      if (result.rows.length === 0) {
        return ApiResponse.success(res, {
          message: 'Nenhum tipo de reconhecimento encontrado',
          data: {
            tipos: []
          }
        });
      }

      // Processar os resultados
      const tipos = result.rows.map(row => ({
        id: row.id,
        reconhecimento: row.reconhecimento,
        icone_reconhecimento: row.icone_reconhecimento,
        created_at: row.created_at
      }));

      logger.info('Tipos de reconhecimento buscados com sucesso', {
        tipos_count: tipos.length
      });

      return ApiResponse.success(res, {
        message: 'Tipos de reconhecimento buscados com sucesso',
        data: {
          tipos
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar tipos de reconhecimento', { 
        error: error.message, 
        stack: error.stack
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Criar novo tipo de reconhecimento
   * POST /api/reconhecimento/tipos
   */
  async criarTipoReconhecimento(req, res) {
    const client = await pool.connect();
    
    try {
      const {
        reconhecimento,
        icone_reconhecimento
      } = req.body;

      logger.info('Iniciando criação de tipo de reconhecimento', {
        reconhecimento,
        icone_reconhecimento
      });

      // Validações básicas
      if (!reconhecimento || reconhecimento.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNITION_TYPE',
          message: 'Nome do tipo de reconhecimento é obrigatório'
        });
      }

      // Verificar se já existe tipo com mesmo nome
      const existeQuery = `
        SELECT id FROM tipo_reconhecimento WHERE LOWER(reconhecimento) = LOWER($1)
      `;
      const existeResult = await client.query(existeQuery, [reconhecimento.trim()]);

      if (existeResult.rows.length > 0) {
        return ApiResponse.badRequest(res, {
          error: 'RECOGNITION_TYPE_ALREADY_EXISTS',
          message: 'Já existe um tipo de reconhecimento com este nome'
        });
      }

      // Criar tipo de reconhecimento
      const criarQuery = `
        INSERT INTO tipo_reconhecimento (reconhecimento, icone_reconhecimento)
        VALUES ($1, $2)
        RETURNING id, reconhecimento, icone_reconhecimento, created_at
      `;

      const criarResult = await client.query(criarQuery, [
        reconhecimento.trim(),
        icone_reconhecimento ? icone_reconhecimento.trim() : null
      ]);
      const novoTipo = criarResult.rows[0];

      logger.info('Tipo de reconhecimento criado com sucesso', {
        id: novoTipo.id,
        reconhecimento: novoTipo.reconhecimento
      });

      return ApiResponse.created(res, {
        message: 'Tipo de reconhecimento criado com sucesso',
        data: {
          id: novoTipo.id,
          reconhecimento: novoTipo.reconhecimento,
          icone_reconhecimento: novoTipo.icone_reconhecimento,
          created_at: novoTipo.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao criar tipo de reconhecimento', { 
        error: error.message, 
        stack: error.stack,
        reconhecimento: req.body.reconhecimento
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Atualizar tipo de reconhecimento
   * PUT /api/reconhecimento/tipos/:id
   */
  async atualizarTipoReconhecimento(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const {
        reconhecimento,
        icone_reconhecimento
      } = req.body;

      logger.info('Iniciando atualização de tipo de reconhecimento', {
        id,
        reconhecimento,
        icone_reconhecimento
      });

      // Validações básicas
      if (!id || isNaN(id)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNITION_TYPE_ID',
          message: 'ID do tipo de reconhecimento é obrigatório e deve ser um número válido'
        });
      }

      if (!reconhecimento || reconhecimento.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNITION_TYPE',
          message: 'Nome do tipo de reconhecimento é obrigatório'
        });
      }

      // Verificar se o tipo existe
      const verificarQuery = `
        SELECT id, reconhecimento FROM tipo_reconhecimento WHERE id = $1
      `;
      const verificarResult = await client.query(verificarQuery, [id]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'RECOGNITION_TYPE_NOT_FOUND',
          message: 'Tipo de reconhecimento não encontrado'
        });
      }

      // Verificar se já existe outro tipo com mesmo nome
      const existeQuery = `
        SELECT id FROM tipo_reconhecimento WHERE LOWER(reconhecimento) = LOWER($1) AND id != $2
      `;
      const existeResult = await client.query(existeQuery, [reconhecimento.trim(), id]);

      if (existeResult.rows.length > 0) {
        return ApiResponse.badRequest(res, {
          error: 'RECOGNITION_TYPE_ALREADY_EXISTS',
          message: 'Já existe outro tipo de reconhecimento com este nome'
        });
      }

      // Atualizar tipo de reconhecimento
      const atualizarQuery = `
        UPDATE tipo_reconhecimento 
        SET reconhecimento = $1, icone_reconhecimento = $2
        WHERE id = $3
        RETURNING id, reconhecimento, icone_reconhecimento, created_at
      `;

      const atualizarResult = await client.query(atualizarQuery, [
        reconhecimento.trim(),
        icone_reconhecimento ? icone_reconhecimento.trim() : null,
        id
      ]);
      const tipoAtualizado = atualizarResult.rows[0];

      logger.info('Tipo de reconhecimento atualizado com sucesso', {
        id: tipoAtualizado.id,
        reconhecimento: tipoAtualizado.reconhecimento
      });

      return ApiResponse.success(res, {
        message: 'Tipo de reconhecimento atualizado com sucesso',
        data: {
          id: tipoAtualizado.id,
          reconhecimento: tipoAtualizado.reconhecimento,
          icone_reconhecimento: tipoAtualizado.icone_reconhecimento,
          created_at: tipoAtualizado.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao atualizar tipo de reconhecimento', { 
        error: error.message, 
        stack: error.stack,
        id: req.params.id
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Deletar tipo de reconhecimento
   * DELETE /api/reconhecimento/tipos/:id
   */
  async deletarTipoReconhecimento(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;

      logger.info('Iniciando exclusão de tipo de reconhecimento', {
        id
      });

      // Validações básicas
      if (!id || isNaN(id)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_RECOGNITION_TYPE_ID',
          message: 'ID do tipo de reconhecimento é obrigatório e deve ser um número válido'
        });
      }

      // Verificar se o tipo existe
      const verificarQuery = `
        SELECT id, reconhecimento FROM tipo_reconhecimento WHERE id = $1
      `;
      const verificarResult = await client.query(verificarQuery, [id]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'RECOGNITION_TYPE_NOT_FOUND',
          message: 'Tipo de reconhecimento não encontrado'
        });
      }

      const tipo = verificarResult.rows[0];

      // Verificar se há reconhecimentos usando este tipo
      const reconhecimentosQuery = `
        SELECT COUNT(*) as total_reconhecimentos FROM reconhecimento WHERE id_tipo_reconhecimento = $1
      `;
      const reconhecimentosResult = await client.query(reconhecimentosQuery, [id]);
      const totalReconhecimentos = parseInt(reconhecimentosResult.rows[0].total_reconhecimentos);

      if (totalReconhecimentos > 0) {
        return ApiResponse.badRequest(res, {
          error: 'RECOGNITION_TYPE_HAS_RECOGNITIONS',
          message: `Não é possível excluir o tipo pois há ${totalReconhecimentos} reconhecimento(s) usando este tipo`
        });
      }

      // Deletar tipo de reconhecimento
      const deletarQuery = `
        DELETE FROM tipo_reconhecimento WHERE id = $1
      `;

      await client.query(deletarQuery, [id]);

      logger.info('Tipo de reconhecimento excluído com sucesso', {
        id: id,
        reconhecimento: tipo.reconhecimento
      });

      return ApiResponse.success(res, {
        message: 'Tipo de reconhecimento excluído com sucesso',
        data: {
          id: parseInt(id)
        }
      });

    } catch (error) {
      logger.error('Erro ao excluir tipo de reconhecimento', { 
        error: error.message, 
        stack: error.stack,
        id: req.params.id
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }
}

module.exports = new ReconhecimentoController();

