const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

class DepartamentoController extends BaseController {
  /**
   * Buscar todos os departamentos por cliente
   * GET /api/departamentos/cliente/:id_cliente
   */
  async buscarDepartamentosPorCliente(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Iniciando busca de departamentos por cliente', {
        id_cliente
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar departamentos do cliente
      const departamentosQuery = `
        SELECT 
          id,
          titulo_departamento,
          created_at
        FROM departamento
        WHERE id_cliente = $1
        ORDER BY titulo_departamento
      `;
      
      const departamentosResult = await client.query(departamentosQuery, [id_cliente]);
      
      if (departamentosResult.rows.length === 0) {
        return ApiResponse.success(res, {
          message: 'Nenhum departamento encontrado para este cliente',
          data: {
            cliente_id: parseInt(id_cliente),
            departamentos: []
          }
        });
      }

      const departamentos = departamentosResult.rows.map(row => row.titulo_departamento);

      logger.info('Departamentos buscados com sucesso', {
        cliente_id: id_cliente,
        quantidade: departamentos.length
      });

      return ApiResponse.success(res, {
        message: 'Departamentos buscados com sucesso',
        data: {
          cliente_id: parseInt(id_cliente),
          departamentos
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar departamentos por cliente', { 
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
   * Criar novo departamento
   * POST /api/departamentos/cliente/:id_cliente
   */
  async criarDepartamento(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;
      const { titulo_departamento } = req.body;

      logger.info('Iniciando criação de departamento', {
        id_cliente,
        titulo_departamento
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      if (!titulo_departamento || titulo_departamento.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_DEPARTMENT_TITLE',
          message: 'Título do departamento é obrigatório'
        });
      }

      // Verificar se já existe departamento com mesmo nome para o cliente
      const existeQuery = `
        SELECT id FROM departamento
        WHERE id_cliente = $1 AND LOWER(titulo_departamento) = LOWER($2)
      `;
      const existeResult = await client.query(existeQuery, [id_cliente, titulo_departamento.trim()]);

      if (existeResult.rows.length > 0) {
        return ApiResponse.badRequest(res, {
          error: 'DEPARTMENT_ALREADY_EXISTS',
          message: 'Já existe um departamento com este nome para este cliente'
        });
      }

      // Criar departamento
      const criarQuery = `
        INSERT INTO departamento (titulo_departamento, id_cliente)
        VALUES ($1, $2)
        RETURNING id, titulo_departamento, created_at
      `;
      
      const criarResult = await client.query(criarQuery, [titulo_departamento.trim(), id_cliente]);
      const novoDepartamento = criarResult.rows[0];

      logger.info('Departamento criado com sucesso', {
        id: novoDepartamento.id,
        titulo_departamento: novoDepartamento.titulo_departamento,
        cliente_id: id_cliente
      });

      return ApiResponse.created(res, {
        message: 'Departamento criado com sucesso',
        data: {
          id: novoDepartamento.id,
          titulo_departamento: novoDepartamento.titulo_departamento,
          id_cliente: parseInt(id_cliente),
          created_at: novoDepartamento.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao criar departamento', { 
        error: error.message, 
        stack: error.stack,
        cliente_id: req.params.id_cliente,
        titulo_departamento: req.body.titulo_departamento
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Atualizar departamento
   * PUT /api/departamentos/:id_departamento/cliente/:id_cliente
   */
  async atualizarDepartamento(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_departamento, id_cliente } = req.params;
      const { titulo_departamento } = req.body;

      logger.info('Iniciando atualização de departamento', {
        id_departamento,
        id_cliente,
        titulo_departamento
      });

      // Validações básicas
      if (!id_departamento || isNaN(id_departamento)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_DEPARTMENT_ID',
          message: 'ID do departamento é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      if (!titulo_departamento || titulo_departamento.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_DEPARTMENT_TITLE',
          message: 'Título do departamento é obrigatório'
        });
      }

      // Verificar se o departamento existe e pertence ao cliente
      const verificarQuery = `
        SELECT id, titulo_departamento FROM departamento
        WHERE id = $1 AND id_cliente = $2
      `;
      const verificarResult = await client.query(verificarQuery, [id_departamento, id_cliente]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'DEPARTMENT_NOT_FOUND',
          message: 'Departamento não encontrado para este cliente'
        });
      }

      // Verificar se já existe outro departamento com mesmo nome para o cliente
      const existeQuery = `
        SELECT id FROM departamento
        WHERE id_cliente = $1 AND LOWER(titulo_departamento) = LOWER($2) AND id != $3
      `;
      const existeResult = await client.query(existeQuery, [id_cliente, titulo_departamento.trim(), id_departamento]);

      if (existeResult.rows.length > 0) {
        return ApiResponse.badRequest(res, {
          error: 'DEPARTMENT_ALREADY_EXISTS',
          message: 'Já existe outro departamento com este nome para este cliente'
        });
      }

      // Atualizar departamento
      const atualizarQuery = `
        UPDATE departamento 
        SET titulo_departamento = $1
        WHERE id = $2 AND id_cliente = $3
        RETURNING id, titulo_departamento, created_at
      `;
      
      const atualizarResult = await client.query(atualizarQuery, [titulo_departamento.trim(), id_departamento, id_cliente]);
      const departamentoAtualizado = atualizarResult.rows[0];

      logger.info('Departamento atualizado com sucesso', {
        id: departamentoAtualizado.id,
        titulo_departamento: departamentoAtualizado.titulo_departamento,
        cliente_id: id_cliente
      });

      return ApiResponse.success(res, {
        message: 'Departamento atualizado com sucesso',
        data: {
          id: departamentoAtualizado.id,
          titulo_departamento: departamentoAtualizado.titulo_departamento,
          id_cliente: parseInt(id_cliente),
          created_at: departamentoAtualizado.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao atualizar departamento', { 
        error: error.message, 
        stack: error.stack,
        id_departamento: req.params.id_departamento,
        cliente_id: req.params.id_cliente,
        titulo_departamento: req.body.titulo_departamento
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Deletar departamento
   * DELETE /api/departamentos/:id_departamento/cliente/:id_cliente
   */
  async deletarDepartamento(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_departamento, id_cliente } = req.params;

      logger.info('Iniciando exclusão de departamento', {
        id_departamento,
        id_cliente
      });

      // Validações básicas
      if (!id_departamento || isNaN(id_departamento)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_DEPARTMENT_ID',
          message: 'ID do departamento é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Verificar se o departamento existe e pertence ao cliente
      const verificarQuery = `
        SELECT id, titulo_departamento FROM departamento
        WHERE id = $1 AND id_cliente = $2
      `;
      const verificarResult = await client.query(verificarQuery, [id_departamento, id_cliente]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'DEPARTMENT_NOT_FOUND',
          message: 'Departamento não encontrado para este cliente'
        });
      }

      const departamento = verificarResult.rows[0];

      // Verificar se há usuários vinculados ao departamento
      const usuariosVinculadosQuery = `
        SELECT COUNT(*) as total_usuarios FROM usuarios
        WHERE id_departamento = $1
      `;
      const usuariosResult = await client.query(usuariosVinculadosQuery, [id_departamento]);
      const totalUsuarios = parseInt(usuariosResult.rows[0].total_usuarios);

      if (totalUsuarios > 0) {
        return ApiResponse.badRequest(res, {
          error: 'DEPARTMENT_HAS_USERS',
          message: `Não é possível excluir o departamento pois há ${totalUsuarios} usuário(s) vinculado(s) a ele`
        });
      }

      // Deletar departamento
      const deletarQuery = `
        DELETE FROM departamento 
        WHERE id = $1 AND id_cliente = $2
      `;
      
      await client.query(deletarQuery, [id_departamento, id_cliente]);

      logger.info('Departamento excluído com sucesso', {
        id: id_departamento,
        titulo_departamento: departamento.titulo_departamento,
        cliente_id: id_cliente
      });

      return ApiResponse.success(res, {
        message: 'Departamento excluído com sucesso',
        data: {
          id: parseInt(id_departamento),
          titulo_departamento: departamento.titulo_departamento,
          id_cliente: parseInt(id_cliente)
        }
      });

    } catch (error) {
      logger.error('Erro ao excluir departamento', { 
        error: error.message, 
        stack: error.stack,
        id_departamento: req.params.id_departamento,
        cliente_id: req.params.id_cliente
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar departamento específico
   * GET /api/departamentos/:id_departamento/cliente/:id_cliente
   */
  async buscarDepartamento(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_departamento, id_cliente } = req.params;

      logger.info('Iniciando busca de departamento específico', {
        id_departamento,
        id_cliente
      });

      // Validações básicas
      if (!id_departamento || isNaN(id_departamento)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_DEPARTMENT_ID',
          message: 'ID do departamento é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar departamento específico
      const departamentoQuery = `
        SELECT 
          id,
          titulo_departamento,
          id_cliente,
          created_at
        FROM departamento
        WHERE id = $1 AND id_cliente = $2
      `;
      
      const departamentoResult = await client.query(departamentoQuery, [id_departamento, id_cliente]);
      
      if (departamentoResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'DEPARTMENT_NOT_FOUND',
          message: 'Departamento não encontrado para este cliente'
        });
      }

      const departamento = departamentoResult.rows[0];

      // Buscar quantidade de usuários no departamento
      const usuariosQuery = `
        SELECT COUNT(*) as total_usuarios FROM usuarios
        WHERE id_departamento = $1
      `;
      const usuariosResult = await client.query(usuariosQuery, [id_departamento]);
      const totalUsuarios = parseInt(usuariosResult.rows[0].total_usuarios);

      logger.info('Departamento específico buscado com sucesso', {
        id: departamento.id,
        titulo_departamento: departamento.titulo_departamento,
        cliente_id: id_cliente,
        total_usuarios: totalUsuarios
      });

      return ApiResponse.success(res, {
        message: 'Departamento buscado com sucesso',
        data: {
          id: departamento.id,
          titulo_departamento: departamento.titulo_departamento,
          id_cliente: departamento.id_cliente,
          total_usuarios: totalUsuarios,
          created_at: departamento.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar departamento específico', { 
        error: error.message, 
        stack: error.stack,
        id_departamento: req.params.id_departamento,
        cliente_id: req.params.id_cliente
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }
}

module.exports = new DepartamentoController();

