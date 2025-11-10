const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

class SenioridadeController extends BaseController {
  /**
   * Buscar todas as senioridades por cliente
   * GET /api/senioridades/cliente/:id_cliente
   */
  async buscarSenioridadesPorCliente(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Iniciando busca de senioridades por cliente', {
        id_cliente
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar senioridades do cliente
      const senioridadesQuery = `
        SELECT 
          id,
          senioridade,
          client_id,
          created_at
        FROM senioridade
        WHERE client_id = $1
        ORDER BY senioridade
      `;
      
      const senioridadesResult = await client.query(senioridadesQuery, [id_cliente]);
      
      if (senioridadesResult.rows.length === 0) {
        return ApiResponse.success(res, {
          message: 'Nenhuma senioridade encontrada para este cliente',
          data: {
            cliente_id: parseInt(id_cliente),
            senioridades: []
          }
        });
      }

      const senioridades = senioridadesResult.rows.map(row => ({
        id: row.id,
        senioridade: row.senioridade,
        client_id: row.client_id,
        created_at: row.created_at
      }));

      logger.info('Senioridades buscadas com sucesso', {
        cliente_id: id_cliente,
        quantidade: senioridades.length
      });

      return ApiResponse.success(res, {
        message: 'Senioridades buscadas com sucesso',
        data: {
          cliente_id: parseInt(id_cliente),
          senioridades
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar senioridades por cliente', { 
        error: error.message, 
        stack: error.stack,
        cliente_id: req.params.id_cliente
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Criar nova senioridade
   * POST /api/senioridades/cliente/:id_cliente
   */
  async criarSenioridade(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;
      const { senioridade } = req.body;

      logger.info('Iniciando criação de senioridade', {
        id_cliente,
        senioridade
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      if (!senioridade || senioridade.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SENIORIDADE_NAME',
          message: 'Nome da senioridade é obrigatório'
        });
      }

      // Verificar se já existe senioridade com mesmo nome para o cliente
      const existeQuery = `
        SELECT id FROM senioridade
        WHERE client_id = $1 AND LOWER(senioridade) = LOWER($2)
      `;
      const existeResult = await client.query(existeQuery, [id_cliente, senioridade.trim()]);

      if (existeResult.rows.length > 0) {
        return ApiResponse.badRequest(res, {
          error: 'SENIORIDADE_ALREADY_EXISTS',
          message: 'Já existe uma senioridade com este nome para este cliente'
        });
      }

      // Criar senioridade
      const criarQuery = `
        INSERT INTO senioridade (senioridade, client_id)
        VALUES ($1, $2)
        RETURNING id, senioridade, client_id, created_at
      `;
      
      const criarResult = await client.query(criarQuery, [senioridade.trim(), id_cliente]);
      const novaSenioridade = criarResult.rows[0];

      logger.info('Senioridade criada com sucesso', {
        id: novaSenioridade.id,
        senioridade: novaSenioridade.senioridade,
        cliente_id: id_cliente
      });

      return ApiResponse.created(res, {
        message: 'Senioridade criada com sucesso',
        data: {
          id: novaSenioridade.id,
          senioridade: novaSenioridade.senioridade,
          client_id: parseInt(id_cliente),
          created_at: novaSenioridade.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao criar senioridade', { 
        error: error.message, 
        stack: error.stack,
        cliente_id: req.params.id_cliente,
        senioridade: req.body.senioridade
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Atualizar senioridade
   * PUT /api/senioridades/:id_senioridade/cliente/:id_cliente
   */
  async atualizarSenioridade(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_senioridade, id_cliente } = req.params;
      const { senioridade } = req.body;

      logger.info('Iniciando atualização de senioridade', {
        id_senioridade,
        id_cliente,
        senioridade
      });

      // Validações básicas
      if (!id_senioridade || isNaN(id_senioridade)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SENIORIDADE_ID',
          message: 'ID da senioridade é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      if (!senioridade || senioridade.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SENIORIDADE_NAME',
          message: 'Nome da senioridade é obrigatório'
        });
      }

      // Verificar se a senioridade existe e pertence ao cliente
      const verificarQuery = `
        SELECT id, senioridade FROM senioridade
        WHERE id = $1 AND client_id = $2
      `;
      const verificarResult = await client.query(verificarQuery, [id_senioridade, id_cliente]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'SENIORIDADE_NOT_FOUND',
          message: 'Senioridade não encontrada para este cliente'
        });
      }

      // Verificar se já existe outra senioridade com mesmo nome para o cliente
      const existeQuery = `
        SELECT id FROM senioridade
        WHERE client_id = $1 AND LOWER(senioridade) = LOWER($2) AND id != $3
      `;
      const existeResult = await client.query(existeQuery, [id_cliente, senioridade.trim(), id_senioridade]);

      if (existeResult.rows.length > 0) {
        return ApiResponse.badRequest(res, {
          error: 'SENIORIDADE_ALREADY_EXISTS',
          message: 'Já existe outra senioridade com este nome para este cliente'
        });
      }

      // Atualizar senioridade
      const atualizarQuery = `
        UPDATE senioridade 
        SET senioridade = $1
        WHERE id = $2 AND client_id = $3
        RETURNING id, senioridade, client_id, created_at
      `;
      
      const atualizarResult = await client.query(atualizarQuery, [senioridade.trim(), id_senioridade, id_cliente]);
      const senioridadeAtualizada = atualizarResult.rows[0];

      logger.info('Senioridade atualizada com sucesso', {
        id: senioridadeAtualizada.id,
        senioridade: senioridadeAtualizada.senioridade,
        cliente_id: id_cliente
      });

      return ApiResponse.success(res, {
        message: 'Senioridade atualizada com sucesso',
        data: {
          id: senioridadeAtualizada.id,
          senioridade: senioridadeAtualizada.senioridade,
          client_id: parseInt(id_cliente),
          created_at: senioridadeAtualizada.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao atualizar senioridade', { 
        error: error.message, 
        stack: error.stack,
        id_senioridade: req.params.id_senioridade,
        cliente_id: req.params.id_cliente,
        senioridade: req.body.senioridade
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Deletar senioridade
   * DELETE /api/senioridades/:id_senioridade/cliente/:id_cliente
   */
  async deletarSenioridade(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_senioridade, id_cliente } = req.params;

      logger.info('Iniciando exclusão de senioridade', {
        id_senioridade,
        id_cliente
      });

      // Validações básicas
      if (!id_senioridade || isNaN(id_senioridade)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SENIORIDADE_ID',
          message: 'ID da senioridade é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Verificar se a senioridade existe e pertence ao cliente
      const verificarQuery = `
        SELECT id, senioridade FROM senioridade
        WHERE id = $1 AND client_id = $2
      `;
      const verificarResult = await client.query(verificarQuery, [id_senioridade, id_cliente]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'SENIORIDADE_NOT_FOUND',
          message: 'Senioridade não encontrada para este cliente'
        });
      }

      const senioridade = verificarResult.rows[0];

      // Verificar se há cargos vinculados à senioridade
      const cargosVinculadosQuery = `
        SELECT COUNT(*) as total_cargos FROM cargo
        WHERE senioridade_id = $1
      `;
      const cargosResult = await client.query(cargosVinculadosQuery, [id_senioridade]);
      const totalCargos = parseInt(cargosResult.rows[0].total_cargos);

      if (totalCargos > 0) {
        return ApiResponse.badRequest(res, {
          error: 'SENIORIDADE_HAS_CARGOS',
          message: `Não é possível excluir a senioridade pois há ${totalCargos} cargo(s) vinculado(s) a ela`
        });
      }

      // Deletar senioridade
      const deletarQuery = `
        DELETE FROM senioridade 
        WHERE id = $1 AND client_id = $2
      `;
      
      await client.query(deletarQuery, [id_senioridade, id_cliente]);

      logger.info('Senioridade excluída com sucesso', {
        id: id_senioridade,
        senioridade: senioridade.senioridade,
        cliente_id: id_cliente
      });

      return ApiResponse.success(res, {
        message: 'Senioridade excluída com sucesso',
        data: {
          id: parseInt(id_senioridade),
          senioridade: senioridade.senioridade,
          client_id: parseInt(id_cliente)
        }
      });

    } catch (error) {
      logger.error('Erro ao excluir senioridade', { 
        error: error.message, 
        stack: error.stack,
        id_senioridade: req.params.id_senioridade,
        cliente_id: req.params.id_cliente
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar senioridade específica
   * GET /api/senioridades/:id_senioridade/cliente/:id_cliente
   */
  async buscarSenioridade(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_senioridade, id_cliente } = req.params;

      logger.info('Iniciando busca de senioridade específica', {
        id_senioridade,
        id_cliente
      });

      // Validações básicas
      if (!id_senioridade || isNaN(id_senioridade)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SENIORIDADE_ID',
          message: 'ID da senioridade é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar senioridade específica
      const senioridadeQuery = `
        SELECT 
          id,
          senioridade,
          client_id,
          created_at
        FROM senioridade
        WHERE id = $1 AND client_id = $2
      `;
      
      const senioridadeResult = await client.query(senioridadeQuery, [id_senioridade, id_cliente]);
      
      if (senioridadeResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'SENIORIDADE_NOT_FOUND',
          message: 'Senioridade não encontrada para este cliente'
        });
      }

      const senioridade = senioridadeResult.rows[0];

      // Buscar quantidade de cargos com esta senioridade
      const cargosQuery = `
        SELECT COUNT(*) as total_cargos FROM cargo
        WHERE senioridade_id = $1
      `;
      const cargosResult = await client.query(cargosQuery, [id_senioridade]);
      const totalCargos = parseInt(cargosResult.rows[0].total_cargos);

      logger.info('Senioridade específica buscada com sucesso', {
        id: senioridade.id,
        senioridade: senioridade.senioridade,
        cliente_id: id_cliente,
        total_cargos: totalCargos
      });

      return ApiResponse.success(res, {
        message: 'Senioridade buscada com sucesso',
        data: {
          id: senioridade.id,
          senioridade: senioridade.senioridade,
          client_id: senioridade.client_id,
          total_cargos: totalCargos,
          created_at: senioridade.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar senioridade específica', { 
        error: error.message, 
        stack: error.stack,
        id_senioridade: req.params.id_senioridade,
        cliente_id: req.params.id_cliente
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }
}

module.exports = new SenioridadeController();









