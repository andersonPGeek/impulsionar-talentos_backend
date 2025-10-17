const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

class SetorController extends BaseController {
  /**
   * Buscar todos os setores por cliente
   * GET /api/setores/cliente/:id_cliente
   */
  async buscarSetoresPorCliente(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Iniciando busca de setores por cliente', {
        id_cliente
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar setores do cliente com departamento
      const setoresQuery = `
        SELECT 
          s.id,
          s.nome_setor,
          s.departamento_id,
          s.created_at,
          d.titulo_departamento
        FROM setor s
        LEFT JOIN departamento d ON s.departamento_id = d.id
        WHERE s.client_id = $1
        ORDER BY s.nome_setor
      `;
      
      const setoresResult = await client.query(setoresQuery, [id_cliente]);
      
      if (setoresResult.rows.length === 0) {
        return ApiResponse.success(res, {
          message: 'Nenhum setor encontrado para este cliente',
          data: {
            cliente_id: parseInt(id_cliente),
            setores: []
          }
        });
      }

      const setores = setoresResult.rows.map(row => ({
        id: row.id,
        nome_setor: row.nome_setor,
        departamento: row.departamento_id ? {
          id: row.departamento_id,
          nome_departamento: row.nome_departamento
        } : null,
        created_at: row.created_at
      }));

      logger.info('Setores buscados com sucesso', {
        cliente_id: id_cliente,
        quantidade: setores.length
      });

      return ApiResponse.success(res, {
        message: 'Setores buscados com sucesso',
        data: {
          cliente_id: parseInt(id_cliente),
          setores
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar setores por cliente', { 
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
   * Criar novo setor
   * POST /api/setores/cliente/:id_cliente
   */
  async criarSetor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;
      const { nome_setor, departamento_id } = req.body;

      logger.info('Iniciando criação de setor', {
        id_cliente,
        nome_setor,
        departamento_id
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      if (!nome_setor || nome_setor.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SETOR_NAME',
          message: 'Nome do setor é obrigatório'
        });
      }

      // Verificar se departamento existe e pertence ao cliente (se fornecido)
      if (departamento_id) {
        if (isNaN(departamento_id)) {
          return ApiResponse.badRequest(res, {
            error: 'INVALID_DEPARTAMENTO_ID',
            message: 'ID do departamento deve ser um número válido'
          });
        }

        const verificarDepartamentoQuery = `
          SELECT id FROM departamento
          WHERE id = $1 AND id_cliente = $2
        `;
        const departamentoResult = await client.query(verificarDepartamentoQuery, [departamento_id, id_cliente]);

        if (departamentoResult.rows.length === 0) {
          return ApiResponse.badRequest(res, {
            error: 'DEPARTAMENTO_NOT_FOUND',
            message: 'Departamento não encontrado para este cliente'
          });
        }
      }

      // Verificar se já existe setor com mesmo nome para o cliente
      const existeQuery = `
        SELECT id FROM setor
        WHERE client_id = $1 AND LOWER(nome_setor) = LOWER($2)
      `;
      const existeResult = await client.query(existeQuery, [id_cliente, nome_setor.trim()]);

      if (existeResult.rows.length > 0) {
        return ApiResponse.badRequest(res, {
          error: 'SETOR_ALREADY_EXISTS',
          message: 'Já existe um setor com este nome para este cliente'
        });
      }

      // Criar setor
      const criarQuery = `
        INSERT INTO setor (nome_setor, client_id, departamento_id)
        VALUES ($1, $2, $3)
        RETURNING id, nome_setor, client_id, departamento_id, created_at
      `;
      
      const criarResult = await client.query(criarQuery, [nome_setor.trim(), id_cliente, departamento_id]);
      const novoSetor = criarResult.rows[0];

      logger.info('Setor criado com sucesso', {
        id: novoSetor.id,
        nome_setor: novoSetor.nome_setor,
        cliente_id: id_cliente,
        departamento_id: departamento_id
      });

      return ApiResponse.success(res, {
        message: 'Setor criado com sucesso',
        data: {
          id: novoSetor.id,
          nome_setor: novoSetor.nome_setor,
          client_id: parseInt(id_cliente),
          departamento_id: novoSetor.departamento_id ? parseInt(novoSetor.departamento_id) : null,
          created_at: novoSetor.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao criar setor', { 
        error: error.message, 
        stack: error.stack,
        cliente_id: req.params.id_cliente,
        nome_setor: req.body.nome_setor
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Atualizar setor
   * PUT /api/setores/:id_setor/cliente/:id_cliente
   */
  async atualizarSetor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_setor, id_cliente } = req.params;
      const { nome_setor, departamento_id } = req.body;

      logger.info('Iniciando atualização de setor', {
        id_setor,
        id_cliente,
        nome_setor,
        departamento_id
      });

      // Validações básicas
      if (!id_setor || isNaN(id_setor)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SETOR_ID',
          message: 'ID do setor é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      if (!nome_setor || nome_setor.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SETOR_NAME',
          message: 'Nome do setor é obrigatório'
        });
      }

      // Verificar se departamento existe e pertence ao cliente (se fornecido)
      if (departamento_id) {
        if (isNaN(departamento_id)) {
          return ApiResponse.badRequest(res, {
            error: 'INVALID_DEPARTAMENTO_ID',
            message: 'ID do departamento deve ser um número válido'
          });
        }

        const verificarDepartamentoQuery = `
          SELECT id FROM departamento
          WHERE id = $1 AND id_cliente = $2
        `;
        const departamentoResult = await client.query(verificarDepartamentoQuery, [departamento_id, id_cliente]);

        if (departamentoResult.rows.length === 0) {
          return ApiResponse.badRequest(res, {
            error: 'DEPARTAMENTO_NOT_FOUND',
            message: 'Departamento não encontrado para este cliente'
          });
        }
      }

      // Verificar se o setor existe e pertence ao cliente
      const verificarQuery = `
        SELECT id, nome_setor FROM setor
        WHERE id = $1 AND client_id = $2
      `;
      const verificarResult = await client.query(verificarQuery, [id_setor, id_cliente]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'SETOR_NOT_FOUND',
          message: 'Setor não encontrado para este cliente'
        });
      }

      // Verificar se já existe outro setor com mesmo nome para o cliente
      const existeQuery = `
        SELECT id FROM setor
        WHERE client_id = $1 AND LOWER(nome_setor) = LOWER($2) AND id != $3
      `;
      const existeResult = await client.query(existeQuery, [id_cliente, nome_setor.trim(), id_setor]);

      if (existeResult.rows.length > 0) {
        return ApiResponse.badRequest(res, {
          error: 'SETOR_ALREADY_EXISTS',
          message: 'Já existe outro setor com este nome para este cliente'
        });
      }

      // Atualizar setor
      const atualizarQuery = `
        UPDATE setor 
        SET nome_setor = $1, departamento_id = $2
        WHERE id = $3 AND client_id = $4
        RETURNING id, nome_setor, client_id, departamento_id, created_at
      `;
      
      const atualizarResult = await client.query(atualizarQuery, [nome_setor.trim(), departamento_id, id_setor, id_cliente]);
      const setorAtualizado = atualizarResult.rows[0];

      logger.info('Setor atualizado com sucesso', {
        id: setorAtualizado.id,
        nome_setor: setorAtualizado.nome_setor,
        cliente_id: id_cliente,
        departamento_id: departamento_id
      });

      return ApiResponse.success(res, {
        message: 'Setor atualizado com sucesso',
        data: {
          id: setorAtualizado.id,
          nome_setor: setorAtualizado.nome_setor,
          client_id: parseInt(id_cliente),
          departamento_id: setorAtualizado.departamento_id ? parseInt(setorAtualizado.departamento_id) : null,
          created_at: setorAtualizado.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao atualizar setor', { 
        error: error.message, 
        stack: error.stack,
        id_setor: req.params.id_setor,
        cliente_id: req.params.id_cliente,
        nome_setor: req.body.nome_setor
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Deletar setor
   * DELETE /api/setores/:id_setor/cliente/:id_cliente
   */
  async deletarSetor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_setor, id_cliente } = req.params;

      logger.info('Iniciando exclusão de setor', {
        id_setor,
        id_cliente
      });

      // Validações básicas
      if (!id_setor || isNaN(id_setor)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SETOR_ID',
          message: 'ID do setor é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Verificar se o setor existe e pertence ao cliente
      const verificarQuery = `
        SELECT id, nome_setor FROM setor
        WHERE id = $1 AND client_id = $2
      `;
      const verificarResult = await client.query(verificarQuery, [id_setor, id_cliente]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'SETOR_NOT_FOUND',
          message: 'Setor não encontrado para este cliente'
        });
      }

      const setor = verificarResult.rows[0];

      // Verificar se há cargos vinculados ao setor
      const cargosVinculadosQuery = `
        SELECT COUNT(*) as total_cargos FROM cargo
        WHERE setor_id = $1
      `;
      const cargosResult = await client.query(cargosVinculadosQuery, [id_setor]);
      const totalCargos = parseInt(cargosResult.rows[0].total_cargos);

      if (totalCargos > 0) {
        return ApiResponse.badRequest(res, {
          error: 'SETOR_HAS_CARGOS',
          message: `Não é possível excluir o setor pois há ${totalCargos} cargo(s) vinculado(s) a ele`
        });
      }

      // Deletar setor
      const deletarQuery = `
        DELETE FROM setor 
        WHERE id = $1 AND client_id = $2
      `;
      
      await client.query(deletarQuery, [id_setor, id_cliente]);

      logger.info('Setor excluído com sucesso', {
        id: id_setor,
        nome_setor: setor.nome_setor,
        cliente_id: id_cliente
      });

      return ApiResponse.success(res, {
        message: 'Setor excluído com sucesso',
        data: {
          id: parseInt(id_setor),
          nome_setor: setor.nome_setor,
          client_id: parseInt(id_cliente)
        }
      });

    } catch (error) {
      logger.error('Erro ao excluir setor', { 
        error: error.message, 
        stack: error.stack,
        id_setor: req.params.id_setor,
        cliente_id: req.params.id_cliente
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar setor específico
   * GET /api/setores/:id_setor/cliente/:id_cliente
   */
  async buscarSetor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_setor, id_cliente } = req.params;

      logger.info('Iniciando busca de setor específico', {
        id_setor,
        id_cliente
      });

      // Validações básicas
      if (!id_setor || isNaN(id_setor)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SETOR_ID',
          message: 'ID do setor é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar setor específico com departamento
      const setorQuery = `
        SELECT 
          s.id,
          s.nome_setor,
          s.client_id,
          s.departamento_id,
          s.created_at,
          d.nome_departamento
        FROM setor s
        LEFT JOIN departamento d ON s.departamento_id = d.id
        WHERE s.id = $1 AND s.client_id = $2
      `;
      
      const setorResult = await client.query(setorQuery, [id_setor, id_cliente]);
      
      if (setorResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'SETOR_NOT_FOUND',
          message: 'Setor não encontrado para este cliente'
        });
      }

      const setor = setorResult.rows[0];

      // Buscar quantidade de cargos com este setor
      const cargosQuery = `
        SELECT COUNT(*) as total_cargos FROM cargo
        WHERE setor_id = $1
      `;
      const cargosResult = await client.query(cargosQuery, [id_setor]);
      const totalCargos = parseInt(cargosResult.rows[0].total_cargos);

      logger.info('Setor específico buscado com sucesso', {
        id: setor.id,
        nome_setor: setor.nome_setor,
        cliente_id: id_cliente,
        total_cargos: totalCargos
      });

      return ApiResponse.success(res, {
        message: 'Setor buscado com sucesso',
        data: {
          id: setor.id,
          nome_setor: setor.nome_setor,
          client_id: setor.client_id,
          departamento: setor.departamento_id ? {
            id: setor.departamento_id,
            nome_departamento: setor.nome_departamento
          } : null,
          total_cargos: totalCargos,
          created_at: setor.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar setor específico', { 
        error: error.message, 
        stack: error.stack,
        id_setor: req.params.id_setor,
        cliente_id: req.params.id_cliente
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }
}

module.exports = new SetorController();






