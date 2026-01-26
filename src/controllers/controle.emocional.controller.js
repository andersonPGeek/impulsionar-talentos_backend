const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

class ControleEmocionalController extends BaseController {
  /**
   * Registrar check-in emocional do dia
   * POST /api/controle-emocional
   */
  async registrarCheckIn(req, res) {
    const client = await pool.connect();

    try {
      const { id_user, score, motivo, categoria_motivo } = req.body;

      logger.info('Iniciando registro de check-in emocional', {
        id_user,
        score
      });

      // Validações básicas
      if (!id_user || isNaN(id_user)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      if (!score || isNaN(score) || score < 1 || score > 5) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SCORE',
          message: 'Score deve ser um número entre 1 e 5'
        });
      }

      // Validação: se score <= 3, motivo é obrigatório
      if (score <= 3 && (!motivo || motivo.trim() === '')) {
        return ApiResponse.badRequest(res, {
          error: 'MISSING_MOTIVO',
          message: 'Motivo é obrigatório quando o score é menor ou igual a 3'
        });
      }

      // Verificar se já existe check-in para hoje
      const checkExistsQuery = `
        SELECT id FROM checkin_emocional 
        WHERE id_user = $1 AND data_checkin = CURRENT_DATE
      `;
      const checkExists = await client.query(checkExistsQuery, [id_user]);

      let result;

      if (checkExists.rows.length > 0) {
        // Atualizar check-in existente
        const updateQuery = `
          UPDATE checkin_emocional SET
            score = $2,
            motivo = $3,
            categoria_motivo = $4,
            created_at = CURRENT_TIMESTAMP
          WHERE id_user = $1 AND data_checkin = CURRENT_DATE
          RETURNING id, id_user, data_checkin, score, motivo, categoria_motivo, gerou_acao, created_at
        `;
        result = await client.query(updateQuery, [
          id_user,
          score,
          motivo && motivo.trim() !== '' ? motivo : null,
          categoria_motivo || null
        ]);

        logger.info('Check-in emocional atualizado', {
          id_user,
          checkin_id: result.rows[0].id
        });
      } else {
        // Inserir novo check-in
        const insertQuery = `
          INSERT INTO checkin_emocional (
            id_user, data_checkin, score, motivo, categoria_motivo
          ) VALUES ($1, CURRENT_DATE, $2, $3, $4)
          RETURNING id, id_user, data_checkin, score, motivo, categoria_motivo, gerou_acao, created_at
        `;
        result = await client.query(insertQuery, [
          id_user,
          score,
          motivo && motivo.trim() !== '' ? motivo : null,
          categoria_motivo || null
        ]);

        logger.info('Check-in emocional registrado', {
          id_user,
          checkin_id: result.rows[0].id
        });
      }

      const checkin = result.rows[0];

      // Se score <= 3, criar ação automaticamente
      let acao = null;
      if (score <= 3) {
        const acaoInsertQuery = `
          INSERT INTO checkin_acao (
            id_checkin, id_user, tipo_acao, prioridade, status
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id, id_checkin, id_user, tipo_acao, prioridade, status, observacoes, created_at, resolved_at
        `;
        
        // Determinar tipo de ação baseado no score
        let tipoAcao = 'alerta_gestor';
        let prioridade = 'normal';
        
        if (score <= 2) {
          tipoAcao = 'chat_agente_ia';
          prioridade = 'urgente';
        }
        
        const acaoResult = await client.query(acaoInsertQuery, [
          checkin.id,
          id_user,
          tipoAcao,
          prioridade,
          'pendente'
        ]);
        
        acao = acaoResult.rows[0];
        
        // Atualizar flag gerou_acao no checkin
        const updateAcaoFlagQuery = `
          UPDATE checkin_emocional SET gerou_acao = true WHERE id = $1
        `;
        await client.query(updateAcaoFlagQuery, [checkin.id]);
        
        logger.info('Ação criada automaticamente para check-in', {
          id_checkin: checkin.id,
          tipo_acao: tipoAcao,
          prioridade
        });
      }

      return ApiResponse.success(
        res,
        {
          id: checkin.id,
          id_user: checkin.id_user,
          data_checkin: checkin.data_checkin,
          score: checkin.score,
          motivo: checkin.motivo,
          categoria_motivo: checkin.categoria_motivo,
          gerou_acao: score <= 3,
          acao: acao ? {
            tipo_acao: acao.tipo_acao,
            prioridade: acao.prioridade,
            status: acao.status,
            observacoes: acao.observacoes,
            created_at: acao.created_at,
            resolved_at: acao.resolved_at
          } : null,
          created_at: checkin.created_at
        },
        'Check-in emocional registrado com sucesso',
        checkExists.rows.length > 0 ? 200 : 201
      );
    } catch (error) {
      logger.error('Erro ao registrar check-in emocional', {
        error: error.message,
        stack: error.stack,
        id_user: req.body.id_user
      });

      if (error.code === '23503') {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'Usuário não encontrado'
        });
      }

      if (error.code === '23505') {
        return ApiResponse.badRequest(res, {
          error: 'DUPLICATE_CHECKIN',
          message: 'Já existe um check-in para este usuário hoje'
        });
      }

      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar check-in emocional de hoje
   * GET /api/controle-emocional/:id_user/hoje
   */
  async buscarCheckInHoje(req, res) {
    const client = await pool.connect();

    try {
      const { id_user } = req.params;

      logger.info('Iniciando busca de check-in emocional de hoje', {
        id_user
      });

      if (!id_user || isNaN(id_user)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT id, id_user, data_checkin, score, motivo, categoria_motivo, gerou_acao, created_at
        FROM checkin_emocional
        WHERE id_user = $1 AND data_checkin = CURRENT_DATE
      `;

      const result = await client.query(query, [id_user]);

      if (result.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'CHECKIN_NOT_FOUND',
          message: 'Nenhum check-in emocional registrado para hoje'
        });
      }

      const checkin = result.rows[0];

      logger.info('Check-in emocional de hoje buscado com sucesso', { id_user });

      return ApiResponse.success(res, {
        id: checkin.id,
        id_user: checkin.id_user,
        data_checkin: checkin.data_checkin,
        score: checkin.score,
        motivo: checkin.motivo,
        categoria_motivo: checkin.categoria_motivo,
        gerou_acao: checkin.gerou_acao,
        created_at: checkin.created_at
      }, 'Check-in emocional de hoje');
    } catch (error) {
      logger.error('Erro ao buscar check-in emocional de hoje', {
        error: error.message,
        stack: error.stack,
        id_user: req.params.id_user
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar histórico de check-ins emocionais com paginação
   * GET /api/controle-emocional/:id_user/historico?limite=30&offset=0&data_inicio=2025-01-01&data_fim=2025-01-31
   */
  async buscarHistorico(req, res) {
    const client = await pool.connect();

    try {
      const { id_user } = req.params;
      const { limite = 30, offset = 0, data_inicio, data_fim } = req.query;

      logger.info('Iniciando busca de histórico de check-ins emocionais', {
        id_user,
        limite,
        offset
      });

      if (!id_user || isNaN(id_user)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      if (isNaN(limite) || isNaN(offset) || limite < 1) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_PAGINATION',
          message: 'Limite deve ser maior que 0 e offset deve ser um número válido'
        });
      }

      let whereClause = 'WHERE id_user = $1';
      const params = [id_user];
      let paramIndex = 2;

      if (data_inicio) {
        whereClause += ` AND data_checkin >= $${paramIndex}`;
        params.push(data_inicio);
        paramIndex++;
      }

      if (data_fim) {
        whereClause += ` AND data_checkin <= $${paramIndex}`;
        params.push(data_fim);
        paramIndex++;
      }

      // Buscar total de registros
      const countQuery = `
        SELECT COUNT(*) as total FROM checkin_emocional ${whereClause}
      `;
      const countResult = await client.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Buscar registros com paginação
      const limitParam = paramIndex;
      const offsetParam = paramIndex + 1;
      params.push(limite);
      params.push(offset);

      const query = `
        SELECT id, id_user, data_checkin, score, motivo, categoria_motivo, gerou_acao, created_at
        FROM checkin_emocional
        ${whereClause}
        ORDER BY data_checkin DESC, created_at DESC
        LIMIT $${limitParam} OFFSET $${offsetParam}
      `;

      const result = await client.query(query, params);

      logger.info('Histórico de check-ins emocionais buscado com sucesso', {
        id_user,
        total,
        registros: result.rows.length
      });

      return ApiResponse.success(res, {
        id_user: parseInt(id_user),
        total,
        limite: parseInt(limite),
        offset: parseInt(offset),
        paginas: Math.ceil(total / parseInt(limite)),
        registros: result.rows.map(row => ({
          id: row.id,
          id_user: row.id_user,
          data_checkin: row.data_checkin,
          score: row.score,
          motivo: row.motivo,
          categoria_motivo: row.categoria_motivo,
          gerou_acao: row.gerou_acao,
          created_at: row.created_at
        }))
      }, 'Histórico de check-ins emocionais');
    } catch (error) {
      logger.error('Erro ao buscar histórico de check-ins emocionais', {
        error: error.message,
        stack: error.stack,
        id_user: req.params.id_user
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar estatísticas de bem-estar por período
   * GET /api/controle-emocional/:id_user/estatisticas?data_inicio=2025-01-01&data_fim=2025-01-31
   */
  async buscarEstatisticas(req, res) {
    const client = await pool.connect();

    try {
      const { id_user } = req.params;
      const { data_inicio, data_fim } = req.query;

      logger.info('Iniciando busca de estatísticas de bem-estar', {
        id_user
      });

      if (!id_user || isNaN(id_user)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      let whereClause = 'WHERE id_user = $1';
      const params = [id_user];
      let paramIndex = 2;

      if (data_inicio) {
        whereClause += ` AND data_checkin >= $${paramIndex}`;
        params.push(data_inicio);
        paramIndex++;
      }

      if (data_fim) {
        whereClause += ` AND data_checkin <= $${paramIndex}`;
        params.push(data_fim);
        paramIndex++;
      }

      const query = `
        SELECT
          COUNT(*) as total_checkins,
          AVG(score) as score_medio,
          MIN(score) as score_minimo,
          MAX(score) as score_maximo,
          SUM(CASE WHEN score >= 4 THEN 1 ELSE 0 END) as dias_bom_estar,
          SUM(CASE WHEN score = 3 THEN 1 ELSE 0 END) as dias_neutro,
          SUM(CASE WHEN score <= 2 THEN 1 ELSE 0 END) as dias_alerta,
          SUM(CASE WHEN gerou_acao = true THEN 1 ELSE 0 END) as acoes_disparadas
        FROM checkin_emocional
        ${whereClause}
      `;

      const result = await client.query(query, params);
      const stats = result.rows[0];

      // Buscar categorias de motivos mais frequentes (apenas scores <= 3)
      let categoriasQuery = `
        SELECT categoria_motivo, COUNT(*) as frequencia
        FROM checkin_emocional
        ${whereClause} AND score <= 3 AND categoria_motivo IS NOT NULL
        GROUP BY categoria_motivo
        ORDER BY frequencia DESC
        LIMIT 10
      `;

      const categoriasResult = await client.query(categoriasQuery, params);

      logger.info('Estatísticas de bem-estar buscadas com sucesso', { id_user });

      return ApiResponse.success(res, {
        id_user: parseInt(id_user),
        resumo: {
          total_checkins: parseInt(stats.total_checkins),
          score_medio: parseFloat(stats.score_medio),
          score_minimo: parseInt(stats.score_minimo),
          score_maximo: parseInt(stats.score_maximo),
          dias_bom_estar: parseInt(stats.dias_bom_estar),
          dias_neutro: parseInt(stats.dias_neutro),
          dias_alerta: parseInt(stats.dias_alerta),
          acoes_disparadas: parseInt(stats.acoes_disparadas)
        },
        motivos_frequentes: categoriasResult.rows.map(row => ({
          categoria: row.categoria_motivo,
          frequencia: parseInt(row.frequencia)
        }))
      }, 'Estatísticas de bem-estar');
    } catch (error) {
      logger.error('Erro ao buscar estatísticas de bem-estar', {
        error: error.message,
        stack: error.stack,
        id_user: req.params.id_user
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Atualizar check-in emocional
   * PUT /api/controle-emocional/:id_checkin
   */
  async atualizarCheckIn(req, res) {
    const client = await pool.connect();

    try {
      const { id_checkin } = req.params;
      const { score, motivo, categoria_motivo } = req.body;

      logger.info('Iniciando atualização de check-in emocional', {
        id_checkin
      });

      if (!id_checkin || isNaN(id_checkin)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_CHECKIN_ID',
          message: 'ID do check-in é obrigatório e deve ser um número válido'
        });
      }

      if (!score || isNaN(score) || score < 1 || score > 5) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_SCORE',
          message: 'Score deve ser um número entre 1 e 5'
        });
      }

      // Validação: se score <= 3, motivo é obrigatório
      if (score <= 3 && (!motivo || motivo.trim() === '')) {
        return ApiResponse.badRequest(res, {
          error: 'MISSING_MOTIVO',
          message: 'Motivo é obrigatório quando o score é menor ou igual a 3'
        });
      }

      // Verificar se check-in existe
      const checkQuery = `
        SELECT id, id_user FROM checkin_emocional WHERE id = $1
      `;
      const checkResult = await client.query(checkQuery, [id_checkin]);

      if (checkResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'CHECKIN_NOT_FOUND',
          message: 'Check-in emocional não encontrado'
        });
      }

      // Atualizar check-in
      const updateQuery = `
        UPDATE checkin_emocional SET
          score = $2,
          motivo = $3,
          categoria_motivo = $4
        WHERE id = $1
        RETURNING id, id_user, data_checkin, score, motivo, categoria_motivo, gerou_acao, created_at
      `;

      const result = await client.query(updateQuery, [
        id_checkin,
        score,
        motivo && motivo.trim() !== '' ? motivo : null,
        categoria_motivo || null
      ]);

      const checkin = result.rows[0];

      logger.info('Check-in emocional atualizado com sucesso', {
        id_checkin,
        id_user: checkin.id_user
      });

      return ApiResponse.success(res, {
        id: checkin.id,
        id_user: checkin.id_user,
        data_checkin: checkin.data_checkin,
        score: checkin.score,
        motivo: checkin.motivo,
        categoria_motivo: checkin.categoria_motivo,
        gerou_acao: checkin.gerou_acao,
        created_at: checkin.created_at
      }, 'Check-in emocional atualizado com sucesso');
    } catch (error) {
      logger.error('Erro ao atualizar check-in emocional', {
        error: error.message,
        stack: error.stack,
        id_checkin: req.params.id_checkin
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Criar profissional de saúde mental
   * POST /api/controle-emocional/profissionais
   */
  async criarProfissional(req, res) {
    const client = await pool.connect();

    try {
      const {
        nome,
        tipo_profissional,
        crp_ou_registro,
        especialidades,
        telefone,
        email,
        foto_url,
        atende_online,
        atende_presencial,
        cidade,
        estado,
        valor_sessao
      } = req.body;

      logger.info('Iniciando criação de profissional de saúde mental', {
        nome,
        tipo_profissional
      });

      // Validações
      if (!nome || nome.trim() === '') {
        return ApiResponse.badRequest(res, {
          error: 'MISSING_NOME',
          message: 'Nome é obrigatório'
        });
      }

      if (!tipo_profissional || !['psicologo', 'psiquiatra', 'terapeuta'].includes(tipo_profissional)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_TIPO_PROFISSIONAL',
          message: 'Tipo profissional deve ser: psicologo, psiquiatra ou terapeuta'
        });
      }

      if (!crp_ou_registro || crp_ou_registro.trim() === '') {
        return ApiResponse.badRequest(res, {
          error: 'MISSING_REGISTRO',
          message: 'CRP ou Registro é obrigatório'
        });
      }

      const insertQuery = `
        INSERT INTO profissionais_saude_mental (
          nome,
          tipo_profissional,
          crp_ou_registro,
          especialidades,
          telefone,
          email,
          foto_url,
          atende_online,
          atende_presencial,
          cidade,
          estado,
          valor_sessao
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, nome, tipo_profissional, crp_ou_registro, especialidades, telefone, email, foto_url, atende_online, atende_presencial, cidade, estado, valor_sessao, ativo, created_at
      `;

      const result = await client.query(insertQuery, [
        nome,
        tipo_profissional,
        crp_ou_registro,
        especialidades || null,
        telefone || null,
        email || null,
        foto_url || null,
        atende_online !== undefined ? atende_online : true,
        atende_presencial !== undefined ? atende_presencial : false,
        cidade || null,
        estado || null,
        valor_sessao || null
      ]);

      const profissional = result.rows[0];

      logger.info('Profissional de saúde mental criado com sucesso', {
        id: profissional.id,
        nome: profissional.nome
      });

      return ApiResponse.success(res, profissional, 'Profissional criado com sucesso', 201);
    } catch (error) {
      logger.error('Erro ao criar profissional de saúde mental', {
        error: error.message,
        stack: error.stack
      });

      if (error.code === '23505') {
        return ApiResponse.badRequest(res, {
          error: 'DUPLICATE_REGISTRO',
          message: 'Já existe um profissional com este CRP/Registro'
        });
      }

      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Buscar profissional de saúde mental por ID
   * GET /api/controle-emocional/profissionais/:id
   */
  async buscarProfissional(req, res) {
    const client = await pool.connect();

    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_ID',
          message: 'ID é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT id, nome, tipo_profissional, crp_ou_registro, especialidades, telefone, email, foto_url, atende_online, atende_presencial, cidade, estado, valor_sessao, ativo, created_at
        FROM profissionais_saude_mental
        WHERE id = $1
      `;

      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'PROFISSIONAL_NOT_FOUND',
          message: 'Profissional não encontrado'
        });
      }

      logger.info('Profissional buscado com sucesso', { id });

      return ApiResponse.success(res, result.rows[0], 'Profissional encontrado');
    } catch (error) {
      logger.error('Erro ao buscar profissional', {
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
   * Listar profissionais de saúde mental com filtros
   * GET /api/controle-emocional/profissionais?tipo_profissional=psicologo&ativo=true&limite=30&offset=0
   */
  async listarProfissionais(req, res) {
    const client = await pool.connect();

    try {
      const {
        tipo_profissional,
        ativo = true,
        atende_online,
        atende_presencial,
        limite = 30,
        offset = 0
      } = req.query;

      logger.info('Iniciando busca de profissionais de saúde mental', {
        tipo_profissional,
        ativo,
        limite,
        offset
      });

      if (isNaN(limite) || isNaN(offset) || limite < 1) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_PAGINATION',
          message: 'Limite deve ser maior que 0 e offset deve ser um número válido'
        });
      }

      let whereClause = 'WHERE ativo = $1';
      const params = [ativo === 'true' || ativo === true];
      let paramIndex = 2;

      if (tipo_profissional) {
        if (!['psicologo', 'psiquiatra', 'terapeuta'].includes(tipo_profissional)) {
          return ApiResponse.badRequest(res, {
            error: 'INVALID_TIPO_PROFISSIONAL',
            message: 'Tipo profissional deve ser: psicologo, psiquiatra ou terapeuta'
          });
        }
        whereClause += ` AND tipo_profissional = $${paramIndex}`;
        params.push(tipo_profissional);
        paramIndex++;
      }

      if (atende_online !== undefined) {
        whereClause += ` AND atende_online = $${paramIndex}`;
        params.push(atende_online === 'true' || atende_online === true);
        paramIndex++;
      }

      if (atende_presencial !== undefined) {
        whereClause += ` AND atende_presencial = $${paramIndex}`;
        params.push(atende_presencial === 'true' || atende_presencial === true);
        paramIndex++;
      }

      // Buscar total
      const countQuery = `SELECT COUNT(*) as total FROM profissionais_saude_mental ${whereClause}`;
      const countResult = await client.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Buscar registros
      const limiteParam = paramIndex;
      const offsetParam = paramIndex + 1;
      params.push(limite);
      params.push(offset);

      const query = `
        SELECT id, nome, tipo_profissional, crp_ou_registro, especialidades, telefone, email, foto_url, atende_online, atende_presencial, cidade, estado, valor_sessao, ativo, created_at
        FROM profissionais_saude_mental
        ${whereClause}
        ORDER BY nome ASC
        LIMIT $${limiteParam} OFFSET $${offsetParam}
      `;

      const result = await client.query(query, params);

      logger.info('Profissionais listados com sucesso', {
        total,
        registros: result.rows.length
      });

      return ApiResponse.success(res, {
        total,
        limite: parseInt(limite),
        offset: parseInt(offset),
        paginas: Math.ceil(total / parseInt(limite)),
        registros: result.rows
      }, 'Profissionais encontrados');
    } catch (error) {
      logger.error('Erro ao listar profissionais', {
        error: error.message,
        stack: error.stack
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Atualizar profissional de saúde mental
   * PUT /api/controle-emocional/profissionais/:id
   */
  async atualizarProfissional(req, res) {
    const client = await pool.connect();

    try {
      const { id } = req.params;
      const {
        nome,
        tipo_profissional,
        crp_ou_registro,
        especialidades,
        telefone,
        email,
        foto_url,
        atende_online,
        atende_presencial,
        cidade,
        estado,
        valor_sessao,
        ativo
      } = req.body;

      if (!id || isNaN(id)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_ID',
          message: 'ID é obrigatório e deve ser um número válido'
        });
      }

      logger.info('Iniciando atualização de profissional', { id });

      // Verificar se existe
      const checkQuery = 'SELECT id FROM profissionais_saude_mental WHERE id = $1';
      const checkResult = await client.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'PROFISSIONAL_NOT_FOUND',
          message: 'Profissional não encontrado'
        });
      }

      const updateQuery = `
        UPDATE profissionais_saude_mental SET
          nome = COALESCE($2, nome),
          tipo_profissional = COALESCE($3, tipo_profissional),
          crp_ou_registro = COALESCE($4, crp_ou_registro),
          especialidades = COALESCE($5, especialidades),
          telefone = COALESCE($6, telefone),
          email = COALESCE($7, email),
          foto_url = COALESCE($8, foto_url),
          atende_online = COALESCE($9, atende_online),
          atende_presencial = COALESCE($10, atende_presencial),
          cidade = COALESCE($11, cidade),
          estado = COALESCE($12, estado),
          valor_sessao = COALESCE($13, valor_sessao),
          ativo = COALESCE($14, ativo)
        WHERE id = $1
        RETURNING id, nome, tipo_profissional, crp_ou_registro, especialidades, telefone, email, foto_url, atende_online, atende_presencial, cidade, estado, valor_sessao, ativo, created_at
      `;

      const result = await client.query(updateQuery, [
        id,
        nome || null,
        tipo_profissional || null,
        crp_ou_registro || null,
        especialidades || null,
        telefone || null,
        email || null,
        foto_url || null,
        atende_online !== undefined ? atende_online : null,
        atende_presencial !== undefined ? atende_presencial : null,
        cidade || null,
        estado || null,
        valor_sessao || null,
        ativo !== undefined ? ativo : null
      ]);

      const profissional = result.rows[0];

      logger.info('Profissional atualizado com sucesso', { id });

      return ApiResponse.success(res, profissional, 'Profissional atualizado com sucesso');
    } catch (error) {
      logger.error('Erro ao atualizar profissional', {
        error: error.message,
        stack: error.stack,
        id: req.params.id
      });

      if (error.code === '23505') {
        return ApiResponse.badRequest(res, {
          error: 'DUPLICATE_REGISTRO',
          message: 'Já existe um profissional com este CRP/Registro'
        });
      }

      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Deletar profissional de saúde mental
   * DELETE /api/controle-emocional/profissionais/:id
   */
  async deletarProfissional(req, res) {
    const client = await pool.connect();

    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_ID',
          message: 'ID é obrigatório e deve ser um número válido'
        });
      }

      logger.info('Iniciando exclusão de profissional', { id });

      const deleteQuery = 'DELETE FROM profissionais_saude_mental WHERE id = $1 RETURNING id';
      const result = await client.query(deleteQuery, [id]);

      if (result.rows.length === 0) {
        return ApiResponse.notFound(res, {
          error: 'PROFISSIONAL_NOT_FOUND',
          message: 'Profissional não encontrado'
        });
      }

      logger.info('Profissional deletado com sucesso', { id });

      return ApiResponse.success(res, { id: result.rows[0].id }, 'Profissional deletado com sucesso');
    } catch (error) {
      logger.error('Erro ao deletar profissional', {
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

module.exports = new ControleEmocionalController();
