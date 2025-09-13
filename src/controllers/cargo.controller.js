const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

class CargoController extends BaseController {
  /**
   * Buscar todos os cargos por cliente
   * GET /api/cargos/cliente/:id_cliente
   */
  async buscarCargosPorCliente(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Iniciando busca de cargos por cliente', {
        id_cliente
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar cargos do cliente
      const cargosQuery = `
        SELECT 
          id,
          nome_cargo,
          created_at
        FROM cargo
        WHERE id_cliente = $1
        ORDER BY nome_cargo
      `;
      
      const cargosResult = await client.query(cargosQuery, [id_cliente]);
      
      if (cargosResult.rows.length === 0) {
        return ApiResponse.success(res, {
          message: 'Nenhum cargo encontrado para este cliente',
          data: {
            cliente_id: parseInt(id_cliente),
            cargos: []
          }
        });
      }

      const cargos = cargosResult.rows.map(row => row.nome_cargo);

      logger.info('Cargos buscados com sucesso', {
        cliente_id: id_cliente,
        quantidade: cargos.length
      });

      return ApiResponse.success(res, {
        message: 'Cargos buscados com sucesso',
        data: {
          cliente_id: parseInt(id_cliente),
          cargos
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar cargos por cliente', { 
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
   * Criar novo cargo
   * POST /api/cargos/cliente/:id_cliente
   */
  async criarCargo(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;
      const { nome_cargo } = req.body;

      logger.info('Iniciando criação de cargo', {
        id_cliente,
        nome_cargo
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      if (!nome_cargo || nome_cargo.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CARGO_NAME',
          message: 'Nome do cargo é obrigatório'
        });
      }

      // Verificar se já existe cargo com mesmo nome para o cliente
      const existeQuery = `
        SELECT id FROM cargo
        WHERE id_cliente = $1 AND LOWER(nome_cargo) = LOWER($2)
      `;
      const existeResult = await client.query(existeQuery, [id_cliente, nome_cargo.trim()]);

      if (existeResult.rows.length > 0) {
        return ApiResponse.badRequest(res, {
          error: 'CARGO_ALREADY_EXISTS',
          message: 'Já existe um cargo com este nome para este cliente'
        });
      }

      // Criar cargo
      const criarQuery = `
        INSERT INTO cargo (nome_cargo, id_cliente)
        VALUES ($1, $2)
        RETURNING id, nome_cargo, created_at
      `;
      
      const criarResult = await client.query(criarQuery, [nome_cargo.trim(), id_cliente]);
      const novoCargo = criarResult.rows[0];

      logger.info('Cargo criado com sucesso', {
        id: novoCargo.id,
        nome_cargo: novoCargo.nome_cargo,
        cliente_id: id_cliente
      });

      return ApiResponse.created(res, {
        message: 'Cargo criado com sucesso',
        data: {
          id: novoCargo.id,
          nome_cargo: novoCargo.nome_cargo,
          id_cliente: parseInt(id_cliente),
          created_at: novoCargo.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao criar cargo', { 
        error: error.message, 
        stack: error.stack,
        cliente_id: req.params.id_cliente,
        nome_cargo: req.body.nome_cargo
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Atualizar cargo
   * PUT /api/cargos/:id_cargo/cliente/:id_cliente
   */
  async atualizarCargo(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cargo, id_cliente } = req.params;
      const { nome_cargo } = req.body;

      logger.info('Iniciando atualização de cargo', {
        id_cargo,
        id_cliente,
        nome_cargo
      });

      // Validações básicas
      if (!id_cargo || isNaN(id_cargo)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CARGO_ID',
          message: 'ID do cargo é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      if (!nome_cargo || nome_cargo.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CARGO_NAME',
          message: 'Nome do cargo é obrigatório'
        });
      }

      // Verificar se o cargo existe e pertence ao cliente
      const verificarQuery = `
        SELECT id, nome_cargo FROM cargo
        WHERE id = $1 AND id_cliente = $2
      `;
      const verificarResult = await client.query(verificarQuery, [id_cargo, id_cliente]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'CARGO_NOT_FOUND',
          message: 'Cargo não encontrado para este cliente'
        });
      }

      // Verificar se já existe outro cargo com mesmo nome para o cliente
      const existeQuery = `
        SELECT id FROM cargo
        WHERE id_cliente = $1 AND LOWER(nome_cargo) = LOWER($2) AND id != $3
      `;
      const existeResult = await client.query(existeQuery, [id_cliente, nome_cargo.trim(), id_cargo]);

      if (existeResult.rows.length > 0) {
        return ApiResponse.badRequest(res, {
          error: 'CARGO_ALREADY_EXISTS',
          message: 'Já existe outro cargo com este nome para este cliente'
        });
      }

      // Atualizar cargo
      const atualizarQuery = `
        UPDATE cargo 
        SET nome_cargo = $1
        WHERE id = $2 AND id_cliente = $3
        RETURNING id, nome_cargo, created_at
      `;
      
      const atualizarResult = await client.query(atualizarQuery, [nome_cargo.trim(), id_cargo, id_cliente]);
      const cargoAtualizado = atualizarResult.rows[0];

      logger.info('Cargo atualizado com sucesso', {
        id: cargoAtualizado.id,
        nome_cargo: cargoAtualizado.nome_cargo,
        cliente_id: id_cliente
      });

      return ApiResponse.success(res, {
        message: 'Cargo atualizado com sucesso',
        data: {
          id: cargoAtualizado.id,
          nome_cargo: cargoAtualizado.nome_cargo,
          id_cliente: parseInt(id_cliente),
          created_at: cargoAtualizado.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao atualizar cargo', { 
        error: error.message, 
        stack: error.stack,
        id_cargo: req.params.id_cargo,
        cliente_id: req.params.id_cliente,
        nome_cargo: req.body.nome_cargo
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Deletar cargo
   * DELETE /api/cargos/:id_cargo/cliente/:id_cliente
   */
  async deletarCargo(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cargo, id_cliente } = req.params;

      logger.info('Iniciando exclusão de cargo', {
        id_cargo,
        id_cliente
      });

      // Validações básicas
      if (!id_cargo || isNaN(id_cargo)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CARGO_ID',
          message: 'ID do cargo é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Verificar se o cargo existe e pertence ao cliente
      const verificarQuery = `
        SELECT id, nome_cargo FROM cargo
        WHERE id = $1 AND id_cliente = $2
      `;
      const verificarResult = await client.query(verificarQuery, [id_cargo, id_cliente]);

      if (verificarResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'CARGO_NOT_FOUND',
          message: 'Cargo não encontrado para este cliente'
        });
      }

      const cargo = verificarResult.rows[0];

      // Verificar se há usuários vinculados ao cargo
      const usuariosVinculadosQuery = `
        SELECT COUNT(*) as total_usuarios FROM usuarios
        WHERE cargo = $1
      `;
      const usuariosResult = await client.query(usuariosVinculadosQuery, [cargo.nome_cargo]);
      const totalUsuarios = parseInt(usuariosResult.rows[0].total_usuarios);

      if (totalUsuarios > 0) {
        return ApiResponse.badRequest(res, {
          error: 'CARGO_HAS_USERS',
          message: `Não é possível excluir o cargo pois há ${totalUsuarios} usuário(s) vinculado(s) a ele`
        });
      }

      // Deletar cargo
      const deletarQuery = `
        DELETE FROM cargo 
        WHERE id = $1 AND id_cliente = $2
      `;
      
      await client.query(deletarQuery, [id_cargo, id_cliente]);

      logger.info('Cargo excluído com sucesso', {
        id: id_cargo,
        nome_cargo: cargo.nome_cargo,
        cliente_id: id_cliente
      });

      return ApiResponse.success(res, {
        message: 'Cargo excluído com sucesso',
        data: {
          id: parseInt(id_cargo),
          nome_cargo: cargo.nome_cargo,
          id_cliente: parseInt(id_cliente)
        }
      });

    } catch (error) {
      logger.error('Erro ao excluir cargo', { 
        error: error.message, 
        stack: error.stack,
        id_cargo: req.params.id_cargo,
        cliente_id: req.params.id_cliente
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar cargo específico
   * GET /api/cargos/:id_cargo/cliente/:id_cliente
   */
  async buscarCargo(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cargo, id_cliente } = req.params;

      logger.info('Iniciando busca de cargo específico', {
        id_cargo,
        id_cliente
      });

      // Validações básicas
      if (!id_cargo || isNaN(id_cargo)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CARGO_ID',
          message: 'ID do cargo é obrigatório e deve ser um número válido'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar cargo específico
      const cargoQuery = `
        SELECT 
          id,
          nome_cargo,
          id_cliente,
          created_at
        FROM cargo
        WHERE id = $1 AND id_cliente = $2
      `;
      
      const cargoResult = await client.query(cargoQuery, [id_cargo, id_cliente]);
      
      if (cargoResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'CARGO_NOT_FOUND',
          message: 'Cargo não encontrado para este cliente'
        });
      }

      const cargo = cargoResult.rows[0];

      // Buscar quantidade de usuários com este cargo
      const usuariosQuery = `
        SELECT COUNT(*) as total_usuarios FROM usuarios
        WHERE cargo = $1
      `;
      const usuariosResult = await client.query(usuariosQuery, [cargo.nome_cargo]);
      const totalUsuarios = parseInt(usuariosResult.rows[0].total_usuarios);

      logger.info('Cargo específico buscado com sucesso', {
        id: cargo.id,
        nome_cargo: cargo.nome_cargo,
        cliente_id: id_cliente,
        total_usuarios: totalUsuarios
      });

      return ApiResponse.success(res, {
        message: 'Cargo buscado com sucesso',
        data: {
          id: cargo.id,
          nome_cargo: cargo.nome_cargo,
          id_cliente: cargo.id_cliente,
          total_usuarios: totalUsuarios,
          created_at: cargo.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar cargo específico', { 
        error: error.message, 
        stack: error.stack,
        id_cargo: req.params.id_cargo,
        cliente_id: req.params.id_cliente
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }
}

module.exports = new CargoController();

