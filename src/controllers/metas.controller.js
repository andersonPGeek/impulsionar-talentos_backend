const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');

class MetasController extends BaseController {
  /**
   * Criar uma nova meta PDI
   * POST /api/metas
   */
  async criarMeta(req, res) {
    const client = await pool.connect();
    
    try {
      const {
        id_usuario,
        titulo_da_meta,
        atividades,
        data_vencimento,
        status,
        id_usuarios,
        resultado_3_meses,
        resultado_6_meses,
        observacao_gestor
      } = req.body;

      logger.info('Iniciando criação de meta PDI', {
        id_usuario,
        titulo_da_meta,
        atividades_count: atividades?.length || 0,
        id_usuarios_count: id_usuarios?.length || 0
      });

      // Validações básicas
      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_USER_ID',
          message: 'ID do usuário é obrigatório'
        });
      }

      if (!titulo_da_meta) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_TITULO',
          message: 'Título da meta é obrigatório'
        });
      }

      if (!data_vencimento) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_DATA_VENCIMENTO',
          message: 'Data de vencimento é obrigatória'
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_STATUS',
          message: 'Status é obrigatório'
        });
      }

      // Validar status
      const statusValidos = ['Em Progresso', 'Parado', 'Atrasado', 'Concluida'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_STATUS',
          message: 'Status inválido. Valores aceitos: Em Progresso, Parado, Atrasado, Concluida'
        });
      }

      if (!atividades || !Array.isArray(atividades) || atividades.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_ATIVIDADES',
          message: 'Array de atividades é obrigatório e deve conter pelo menos uma atividade'
        });
      }

      if (!id_usuarios || !Array.isArray(id_usuarios) || id_usuarios.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_USUARIOS',
          message: 'Array de usuários envolvidos é obrigatório e deve conter pelo menos um usuário'
        });
      }

      await client.query('BEGIN');

      // 1. Inserir na tabela metas_pdi
      const metaQuery = `
        INSERT INTO metas_pdi (
          titulo, prazo, status, resultado_3_meses, resultado_6_meses, 
          feedback_gestor, id_usuario
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at
      `;

      const metaValues = [
        titulo_da_meta,
        data_vencimento,
        status,
        resultado_3_meses || null,
        resultado_6_meses || null,
        observacao_gestor || null,
        id_usuario
      ];

      const metaResult = await client.query(metaQuery, metaValues);
      const metaId = metaResult.rows[0].id;

      logger.info('Meta PDI criada com sucesso', { meta_id: metaId });

      // 2. Inserir atividades na tabela atividades_pdi
      const atividadesQuery = `
        INSERT INTO atividades_pdi (
          id_meta_pdi, titulo_atividade, status_atividade, evidencia_atividade
        ) VALUES ($1, $2, $3, $4)
      `;

      for (const atividade of atividades) {
        await client.query(atividadesQuery, [
          metaId,
          atividade,
          'backlog',
          null
        ]);
      }

      logger.info('Atividades inseridas com sucesso', { 
        meta_id: metaId, 
        atividades_count: atividades.length 
      });

      // 3. Inserir pessoas envolvidas na tabela pessoas_envolvidas_pdi
      const pessoasQuery = `
        INSERT INTO pessoas_envolvidas_pdi (
          id_meta_pdi, id_usuario
        ) VALUES ($1, $2)
      `;

      for (const userId of id_usuarios) {
        await client.query(pessoasQuery, [metaId, userId]);
      }

      logger.info('Pessoas envolvidas inseridas com sucesso', { 
        meta_id: metaId, 
        usuarios_count: id_usuarios.length 
      });

      await client.query('COMMIT');

      // Buscar a meta criada com todas as informações
      const metaCompletaQuery = `
        SELECT 
          m.id,
          m.titulo,
          m.prazo,
          m.status,
          m.resultado_3_meses,
          m.resultado_6_meses,
          m.feedback_gestor,
          m.id_usuario,
          m.created_at,
          array_agg(DISTINCT a.titulo_atividade) as atividades,
          array_agg(DISTINCT p.id_usuario) as usuarios_envolvidos
        FROM metas_pdi m
        LEFT JOIN atividades_pdi a ON m.id = a.id_meta_pdi
        LEFT JOIN pessoas_envolvidas_pdi p ON m.id = p.id_meta_pdi
        WHERE m.id = $1
        GROUP BY m.id, m.titulo, m.prazo, m.status, m.resultado_3_meses, 
                 m.resultado_6_meses, m.feedback_gestor, m.id_usuario, m.created_at
      `;

      const metaCompletaResult = await client.query(metaCompletaQuery, [metaId]);
      const metaCompleta = metaCompletaResult.rows[0];

      logger.info('Meta PDI criada com sucesso', { 
        meta_id: metaId,
        titulo: titulo_da_meta,
        atividades_count: atividades.length,
        usuarios_count: id_usuarios.length
      });

      return res.status(201).json({
        success: true,
        message: 'Meta PDI criada com sucesso',
        data: {
          meta: metaCompleta
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Erro ao criar meta PDI', { error: error.message, stack: error.stack });
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    } finally {
      client.release();
    }
  }

  /**
   * Atualizar uma meta PDI existente
   * PUT /api/metas/:id
   */
  async atualizarMeta(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const {
        id_usuario,
        titulo_da_meta,
        atividades,
        data_vencimento,
        status,
        id_usuarios,
        resultado_3_meses,
        resultado_6_meses,
        observacao_gestor
      } = req.body;

      logger.info('Iniciando atualização de meta PDI', {
        meta_id: id,
        id_usuario,
        titulo_da_meta,
        atividades_count: atividades?.length || 0,
        id_usuarios_count: id_usuarios?.length || 0
      });

      // Validações básicas
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_META_ID',
          message: 'ID da meta é obrigatório e deve ser um número válido'
        });
      }

      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_USER_ID',
          message: 'ID do usuário é obrigatório'
        });
      }

      if (!titulo_da_meta) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_TITULO',
          message: 'Título da meta é obrigatório'
        });
      }

      if (!data_vencimento) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_DATA_VENCIMENTO',
          message: 'Data de vencimento é obrigatória'
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_STATUS',
          message: 'Status é obrigatório'
        });
      }

      // Validar status
      const statusValidos = ['Em Progresso', 'Parado', 'Atrasado', 'Concluida'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_STATUS',
          message: 'Status inválido. Valores aceitos: Em Progresso, Parado, Atrasado, Concluida'
        });
      }

      if (!atividades || !Array.isArray(atividades) || atividades.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_ATIVIDADES',
          message: 'Array de atividades é obrigatório e deve conter pelo menos uma atividade'
        });
      }

      if (!id_usuarios || !Array.isArray(id_usuarios) || id_usuarios.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_USUARIOS',
          message: 'Array de usuários envolvidos é obrigatório e deve conter pelo menos um usuário'
        });
      }

      await client.query('BEGIN');

      // 1. Verificar se a meta existe e pertence ao usuário
      const metaExistsQuery = `
        SELECT id, id_usuario FROM metas_pdi WHERE id = $1
      `;
      const metaExistsResult = await client.query(metaExistsQuery, [id]);

      if (metaExistsResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'META_NOT_FOUND',
          message: 'Meta não encontrada'
        });
      }

      const existingMeta = metaExistsResult.rows[0];
      if (parseInt(existingMeta.id_usuario) !== parseInt(id_usuario)) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Você não tem permissão para atualizar esta meta'
        });
      }

      // 2. Atualizar a meta na tabela metas_pdi
      const updateMetaQuery = `
        UPDATE metas_pdi SET
          titulo = $1,
          prazo = $2,
          status = $3,
          resultado_3_meses = $4,
          resultado_6_meses = $5,
          feedback_gestor = $6
        WHERE id = $7
        RETURNING id, created_at
      `;

      const updateMetaValues = [
        titulo_da_meta,
        data_vencimento,
        status,
        resultado_3_meses || null,
        resultado_6_meses || null,
        observacao_gestor || null,
        id
      ];

      await client.query(updateMetaQuery, updateMetaValues);

      logger.info('Meta PDI atualizada com sucesso', { meta_id: id });

      // 3. Deletar atividades existentes e inserir novas
      await client.query('DELETE FROM atividades_pdi WHERE id_meta_pdi = $1', [id]);

      const atividadesQuery = `
        INSERT INTO atividades_pdi (
          id_meta_pdi, titulo_atividade, status_atividade, evidencia_atividade
        ) VALUES ($1, $2, $3, $4)
      `;

      for (const atividade of atividades) {
        await client.query(atividadesQuery, [
          id,
          atividade,
          'backlog',
          null
        ]);
      }

      logger.info('Atividades atualizadas com sucesso', { 
        meta_id: id, 
        atividades_count: atividades.length 
      });

      // 4. Deletar pessoas envolvidas existentes e inserir novas
      await client.query('DELETE FROM pessoas_envolvidas_pdi WHERE id_meta_pdi = $1', [id]);

      const pessoasQuery = `
        INSERT INTO pessoas_envolvidas_pdi (
          id_meta_pdi, id_usuario
        ) VALUES ($1, $2)
      `;

      for (const userId of id_usuarios) {
        await client.query(pessoasQuery, [id, userId]);
      }

      logger.info('Pessoas envolvidas atualizadas com sucesso', { 
        meta_id: id, 
        usuarios_count: id_usuarios.length 
      });

      await client.query('COMMIT');

      // Buscar a meta atualizada com todas as informações
      const metaCompletaQuery = `
        SELECT 
          m.id,
          m.titulo,
          m.prazo,
          m.status,
          m.resultado_3_meses,
          m.resultado_6_meses,
          m.feedback_gestor,
          m.id_usuario,
          m.created_at,
          array_agg(DISTINCT a.titulo_atividade) as atividades,
          array_agg(DISTINCT p.id_usuario) as usuarios_envolvidos
        FROM metas_pdi m
        LEFT JOIN atividades_pdi a ON m.id = a.id_meta_pdi
        LEFT JOIN pessoas_envolvidas_pdi p ON m.id = p.id_meta_pdi
        WHERE m.id = $1
        GROUP BY m.id, m.titulo, m.prazo, m.status, m.resultado_3_meses, 
                 m.resultado_6_meses, m.feedback_gestor, m.id_usuario, m.created_at
      `;

      const metaCompletaResult = await client.query(metaCompletaQuery, [id]);
      const metaCompleta = metaCompletaResult.rows[0];

      logger.info('Meta PDI atualizada com sucesso', { 
        meta_id: id,
        titulo: titulo_da_meta,
        atividades_count: atividades.length,
        usuarios_count: id_usuarios.length
      });

      return res.status(200).json({
        success: true,
        message: 'Meta PDI atualizada com sucesso',
        data: {
          meta: metaCompleta
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Erro ao atualizar meta PDI', { error: error.message, stack: error.stack });
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    } finally {
      client.release();
    }
  }

  /**
   * Buscar metas por gestor
   * GET /api/metas/gestor/:id_gestor
   */
  async buscarMetasPorGestor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_gestor } = req.params;

      logger.info('Iniciando busca de metas por gestor', {
        id_gestor
      });

      // Validações básicas
      if (!id_gestor || isNaN(id_gestor)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_GESTOR_ID',
          message: 'ID do gestor é obrigatório e deve ser um número válido'
        });
      }

      // Query para buscar todas as metas dos usuários que têm o gestor especificado
      const metasQuery = `
        SELECT 
          u.id as usuario_id,
          u.nome as nome_usuario,
          u.email as email_usuario,
          m.id as meta_id,
          m.titulo as titulo_meta,
          m.prazo,
          m.status,
          m.resultado_3_meses,
          m.resultado_6_meses,
          m.feedback_gestor,
          m.created_at as meta_created_at,
          a.id as atividade_id,
          a.titulo_atividade,
          a.status_atividade,
          a.evidencia_atividade,
          p.id_usuario as pessoa_envolvida_id,
          u2.nome as pessoa_envolvida_nome,
          u2.email as pessoa_envolvida_email
        FROM usuarios u
        INNER JOIN metas_pdi m ON u.id = m.id_usuario
        LEFT JOIN atividades_pdi a ON m.id = a.id_meta_pdi
        LEFT JOIN pessoas_envolvidas_pdi p ON m.id = p.id_meta_pdi
        LEFT JOIN usuarios u2 ON p.id_usuario = u2.id
        WHERE u.id_gestor = $1
        ORDER BY u.nome, m.created_at DESC, a.id, p.id
      `;

      const result = await client.query(metasQuery, [id_gestor]);

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhuma meta encontrada para este gestor',
          data: {
            gestor_id: parseInt(id_gestor),
            usuarios: []
          }
        });
      }

      // Processar os resultados para agrupar por usuário e meta
      const usuariosMap = new Map();

      result.rows.forEach(row => {
        const usuarioId = row.usuario_id;
        const metaId = row.meta_id;

        // Inicializar usuário se não existir
        if (!usuariosMap.has(usuarioId)) {
          usuariosMap.set(usuarioId, {
            id: usuarioId,
            nome_usuario: row.nome_usuario,
            email_usuario: row.email_usuario,
            quantidade_metas: 0,
            metas: new Map()
          });
        }

        const usuario = usuariosMap.get(usuarioId);

        // Inicializar meta se não existir
        if (!usuario.metas.has(metaId)) {
          usuario.metas.set(metaId, {
            id: metaId,
            titulo_meta: row.titulo_meta,
            status: row.status,
            prazo: row.prazo,
            resultado_3_meses: row.resultado_3_meses,
            resultado_6_meses: row.resultado_6_meses,
            feedback_gestor: row.feedback_gestor,
            created_at: row.meta_created_at,
            atividades: new Map(),
            pessoas_envolvidas: new Map()
          });
          usuario.quantidade_metas++;
        }

        const meta = usuario.metas.get(metaId);

        // Adicionar atividade se existir
        if (row.atividade_id && !meta.atividades.has(row.atividade_id)) {
          meta.atividades.set(row.atividade_id, {
            id: row.atividade_id,
            titulo_atividade: row.titulo_atividade,
            status: row.status_atividade,
            evidencia_atividade: row.evidencia_atividade
          });
        }

        // Adicionar pessoa envolvida se existir
        if (row.pessoa_envolvida_id && !meta.pessoas_envolvidas.has(row.pessoa_envolvida_id)) {
          meta.pessoas_envolvidas.set(row.pessoa_envolvida_id, {
            id: row.pessoa_envolvida_id,
            nome: row.pessoa_envolvida_nome,
            email: row.pessoa_envolvida_email
          });
        }
      });

      // Converter Maps para Arrays
      const usuarios = Array.from(usuariosMap.values()).map(usuario => ({
        id: usuario.id,
        nome_usuario: usuario.nome_usuario,
        email_usuario: usuario.email_usuario,
        quantidade_metas: usuario.quantidade_metas,
        metas: Array.from(usuario.metas.values()).map(meta => ({
          id: meta.id,
          titulo_meta: meta.titulo_meta,
          status: meta.status,
          prazo: meta.prazo,
          resultado_3_meses: meta.resultado_3_meses,
          resultado_6_meses: meta.resultado_6_meses,
          feedback_gestor: meta.feedback_gestor,
          created_at: meta.created_at,
          atividades: Array.from(meta.atividades.values()),
          pessoas_envolvidas: Array.from(meta.pessoas_envolvidas.values())
        }))
      }));

      logger.info('Metas buscadas com sucesso', {
        gestor_id: id_gestor,
        usuarios_count: usuarios.length,
        total_metas: usuarios.reduce((total, user) => total + user.quantidade_metas, 0)
      });

      return res.status(200).json({
        success: true,
        message: 'Metas buscadas com sucesso',
        data: {
          gestor_id: parseInt(id_gestor),
          usuarios
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar metas por gestor', { error: error.message, stack: error.stack });
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    } finally {
      client.release();
    }
  }

  /**
   * Atualizar status de atividade e evidência
   * PUT /api/metas/atividade/:id_meta_pdi/:id_atividade
   */
  async atualizarStatusAtividade(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_meta_pdi, id_atividade } = req.params;
      const { status_atividade } = req.body;
      const arquivo = req.file;

      logger.info('Iniciando atualização de status de atividade', {
        id_meta_pdi,
        id_atividade,
        status_atividade,
        tem_arquivo: !!arquivo
      });

      // Validações básicas
      if (!id_meta_pdi || isNaN(id_meta_pdi)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_META_ID',
          message: 'ID da meta PDI é obrigatório e deve ser um número válido'
        });
      }

      if (!id_atividade || isNaN(id_atividade)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_ATIVIDADE_ID',
          message: 'ID da atividade é obrigatório e deve ser um número válido'
        });
      }

      if (!status_atividade) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_STATUS',
          message: 'Status da atividade é obrigatório'
        });
      }

      // Validar status
      const statusValidos = ['backlog', 'em_progresso', 'concluida', 'cancelada'];
      if (!statusValidos.includes(status_atividade)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_STATUS',
          message: 'Status inválido. Valores aceitos: backlog, em_progresso, concluida, cancelada'
        });
      }

      await client.query('BEGIN');

      // 1. Verificar se a meta existe
      const metaExistsQuery = `
        SELECT id, id_usuario FROM metas_pdi WHERE id = $1
      `;
      const metaExistsResult = await client.query(metaExistsQuery, [id_meta_pdi]);

      if (metaExistsResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'META_NOT_FOUND',
          message: 'Meta PDI não encontrada'
        });
      }

      const meta = metaExistsResult.rows[0];
      const id_usuario = meta.id_usuario;

      // 2. Verificar se existe a atividade específica para esta meta
      const atividadeQuery = `
        SELECT id, titulo_atividade, status_atividade, evidencia_atividade 
        FROM atividades_pdi 
        WHERE id_meta_pdi = $1 AND id = $2
      `;
      const atividadeResult = await client.query(atividadeQuery, [id_meta_pdi, id_atividade]);

      if (atividadeResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'ATIVIDADE_NOT_FOUND',
          message: 'Atividade não encontrada para esta meta PDI'
        });
      }

      const atividade = atividadeResult.rows[0];
      let evidenciaUrl = atividade.evidencia_atividade;

      // 3. Se há arquivo, fazer upload para o Supabase
      if (arquivo) {
        try {
          const { uploadFile, createFolder } = require('../config/supabase-storage');
          
          // Criar estrutura de pastas: evidencia_atividade/{id_usuario}/{id_meta_pdi}/
          const folderPath = `evidencia_atividade/${id_usuario}/${id_meta_pdi}`;
          
          // Verificar se a pasta existe, se não, criar
          await createFolder(folderPath);
          
          // Fazer upload do arquivo
          const fileName = `${atividade.id}_${Date.now()}_${arquivo.originalname}`;
          const filePath = `${folderPath}/${fileName}`;
          
          evidenciaUrl = await uploadFile(arquivo.buffer, filePath, arquivo.mimetype);
          
          logger.info('Arquivo de evidência enviado com sucesso', {
            id_meta_pdi,
            id_atividade,
            id_usuario,
            filePath,
            evidenciaUrl
          });
          
        } catch (uploadError) {
          await client.query('ROLLBACK');
          logger.error('Erro ao fazer upload da evidência', { 
            error: uploadError.message, 
            id_meta_pdi 
          });
          return res.status(500).json({
            success: false,
            error: 'UPLOAD_ERROR',
            message: 'Erro ao fazer upload do arquivo de evidência'
          });
        }
      }

      // 4. Atualizar a atividade específica
      const updateAtividadeQuery = `
        UPDATE atividades_pdi SET
          status_atividade = $1,
          evidencia_atividade = $2
        WHERE id_meta_pdi = $3 AND id = $4
        RETURNING id, titulo_atividade, status_atividade, evidencia_atividade
      `;

      const updateResult = await client.query(updateAtividadeQuery, [
        status_atividade,
        evidenciaUrl,
        id_meta_pdi,
        id_atividade
      ]);

      await client.query('COMMIT');

      const atividadeAtualizada = updateResult.rows[0];

      logger.info('Status de atividade atualizado com sucesso', {
        id_meta_pdi,
        id_atividade,
        atividade_id: atividadeAtualizada.id,
        status_atividade,
        tem_evidencia: !!evidenciaUrl
      });

      return res.status(200).json({
        success: true,
        message: 'Status da atividade atualizado com sucesso',
        data: {
          atividade: {
            id: atividadeAtualizada.id,
            id_meta_pdi: parseInt(id_meta_pdi),
            titulo_atividade: atividadeAtualizada.titulo_atividade,
            status_atividade: atividadeAtualizada.status_atividade,
            evidencia_atividade: atividadeAtualizada.evidencia_atividade
          }
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Erro ao atualizar status de atividade', { 
        error: error.message, 
        stack: error.stack,
        id_meta_pdi: req.params.id_meta_pdi,
        id_atividade: req.params.id_atividade
      });
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    } finally {
      client.release();
    }
  }

  /**
   * Buscar metas por usuário
   * GET /api/metas/usuario/:id_usuario
   */
  async buscarMetasPorUsuario(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_usuario } = req.params;

      logger.info('Iniciando busca de metas por usuário', {
        id_usuario
      });

      // Validações básicas
      if (!id_usuario || isNaN(id_usuario)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      // Query principal para buscar todas as informações
      const metasQuery = `
        SELECT 
          m.id as meta_id,
          m.titulo as titulo_meta,
          m.prazo as prazo_meta,
          m.status as status_meta,
          m.resultado_3_meses,
          m.resultado_6_meses,
          m.feedback_gestor,
          m.created_at as meta_created_at,
          a.id as atividade_id,
          a.titulo_atividade,
          a.status_atividade,
          p.id_usuario as pessoa_envolvida_id,
          u.nome as pessoa_envolvida_nome
        FROM metas_pdi m
        LEFT JOIN atividades_pdi a ON m.id = a.id_meta_pdi
        LEFT JOIN pessoas_envolvidas_pdi p ON m.id = p.id_meta_pdi
        LEFT JOIN usuarios u ON p.id_usuario = u.id
        WHERE m.id_usuario = $1
        ORDER BY m.created_at DESC, a.id, p.id
      `;

      const result = await client.query(metasQuery, [id_usuario]);

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhuma meta encontrada para este usuário',
          data: {
            usuario_id: parseInt(id_usuario),
            quantidade_metas: 0,
            progresso_medio: 0,
            proximo_prazo: null,
            metas: []
          }
        });
      }

      // Processar os resultados para agrupar por meta
      const metasMap = new Map();
      let totalAtividades = 0;
      let atividadesConcluidas = 0;
      let proximoPrazo = null;

      result.rows.forEach(row => {
        const metaId = row.meta_id;

        // Inicializar meta se não existir
        if (!metasMap.has(metaId)) {
          metasMap.set(metaId, {
            id: metaId,
            titulo_meta: row.titulo_meta,
            prazo_meta: row.prazo_meta,
            status_meta: row.status_meta,
            resultado_3_meses: row.resultado_3_meses,
            resultado_6_meses: row.resultado_6_meses,
            feedback_gestor: row.feedback_gestor,
            created_at: row.meta_created_at,
            atividades: new Map(),
            pessoas_envolvidas: new Map(),
            atividades_concluidas: 0,
            total_atividades: 0
          });

          // Verificar se é o próximo prazo mais próximo
          if (row.prazo_meta) {
            const prazoDaMeta = new Date(row.prazo_meta);
            const hoje = new Date();
            
            if (prazoDaMeta >= hoje && (!proximoPrazo || prazoDaMeta < new Date(proximoPrazo))) {
              proximoPrazo = row.prazo_meta;
            }
          }
        }

        const meta = metasMap.get(metaId);

        // Adicionar atividade se existir e não foi adicionada ainda
        if (row.atividade_id && !meta.atividades.has(row.atividade_id)) {
          meta.atividades.set(row.atividade_id, {
            id: row.atividade_id,
            atividade: row.titulo_atividade,
            status: row.status_atividade
          });

          meta.total_atividades++;
          totalAtividades++;

          if (row.status_atividade === 'concluida') {
            meta.atividades_concluidas++;
            atividadesConcluidas++;
          }
        }

        // Adicionar pessoa envolvida se existir e não foi adicionada ainda
        if (row.pessoa_envolvida_id && !meta.pessoas_envolvidas.has(row.pessoa_envolvida_id)) {
          meta.pessoas_envolvidas.set(row.pessoa_envolvida_id, {
            id: row.pessoa_envolvida_id,
            nome_pessoa: row.pessoa_envolvida_nome
          });
        }
      });

      // Calcular progresso médio geral
      const progressoMedio = totalAtividades > 0 ? 
        Math.round((atividadesConcluidas / totalAtividades) * 100) : 0;

      // Converter Maps para Arrays e calcular porcentagem de progresso por meta
      const metas = Array.from(metasMap.values()).map(meta => {
        const porcentagemProgresso = meta.total_atividades > 0 ? 
          Math.round((meta.atividades_concluidas / meta.total_atividades) * 100) : 0;

        return {
          id: meta.id,
          titulo_meta: meta.titulo_meta,
          prazo_meta: meta.prazo_meta,
          status_meta: meta.status_meta,
          porcentagem_progresso: porcentagemProgresso,
          atividades: Array.from(meta.atividades.values()),
          pessoas_envolvidas: Array.from(meta.pessoas_envolvidas.values()),
          resultado_3_meses: meta.resultado_3_meses,
          resultado_6_meses: meta.resultado_6_meses,
          feedback_gestor: meta.feedback_gestor
        };
      });

      logger.info('Metas buscadas com sucesso', {
        usuario_id: id_usuario,
        quantidade_metas: metas.length,
        total_atividades: totalAtividades,
        atividades_concluidas: atividadesConcluidas,
        progresso_medio: progressoMedio
      });

      return res.status(200).json({
        success: true,
        message: 'Metas buscadas com sucesso',
        data: {
          usuario_id: parseInt(id_usuario),
          quantidade_metas: metas.length,
          progresso_medio: progressoMedio,
          proximo_prazo: proximoPrazo,
          metas
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar metas por usuário', { 
        error: error.message, 
        stack: error.stack,
        usuario_id: req.params.id_usuario
      });
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    } finally {
      client.release();
    }
  }
}

module.exports = new MetasController();
