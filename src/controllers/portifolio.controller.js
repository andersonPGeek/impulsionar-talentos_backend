const { BaseController } = require('./index');
const { query } = require('../utils/supabase');
const { uploadFile, createFolder, sanitizeFilename, deleteFile, extractFilePathFromUrl } = require('../config/supabase-storage');
const logger = require('../utils/logger');

class PortifolioController extends BaseController {
  constructor() {
    super();
    this.salvarPortifolio = this.salvarPortifolio.bind(this);
    this.getPortifolio = this.getPortifolio.bind(this);
    this.atualizarPortifolio = this.atualizarPortifolio.bind(this);
    this.deletarPortifolio = this.deletarPortifolio.bind(this);
  }

  /**
   * Salva um portfólio completo com experiências, materiais, links e feedbacks
   * POST /api/portifolio
   */
  async salvarPortifolio(req, res) {
    try {
      logger.info('Iniciando salvamento de portfólio', { 
        id_usuario: req.body.id_usuario,
        experiencias_count: req.body.experiencias ? JSON.parse(req.body.experiencias).length : 0
      });

      const { id_usuario, experiencias } = req.body;
      const files = req.files || [];

      // Validações básicas
      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório',
          error: 'MISSING_USER_ID'
        });
      }

      if (!experiencias) {
        return res.status(400).json({
          success: false,
          message: 'Experiências são obrigatórias',
          error: 'MISSING_EXPERIENCIAS'
        });
      }

      let experienciasData;
      try {
        experienciasData = JSON.parse(experiencias);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Formato de experiências inválido',
          error: 'INVALID_EXPERIENCIAS_FORMAT'
        });
      }

      if (!Array.isArray(experienciasData) || experienciasData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lista de experiências não pode estar vazia',
          error: 'EMPTY_EXPERIENCIAS'
        });
      }

      // Iniciar transação
      await query('BEGIN');

      const resultados = [];

      for (let i = 0; i < experienciasData.length; i++) {
        const experiencia = experienciasData[i];
        
        logger.info(`Processando experiência ${i + 1}/${experienciasData.length}`, {
          titulo: experiencia.titulo_experiencia,
          data: experiencia.data_experiencia
        });

        // Validar dados da experiência
        if (!experiencia.titulo_experiencia || !experiencia.data_experiencia || 
            !experiencia.acao_realizada || !experiencia.resultado_entregue) {
          await query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Experiência ${i + 1} está incompleta. Campos obrigatórios: titulo_experiencia, data_experiencia, acao_realizada, resultado_entregue`,
            error: 'INCOMPLETE_EXPERIENCIA'
          });
        }

        // Inserir experiência
        const experienciaResult = await query(
          `INSERT INTO experiencia_portifolio 
           (titulo_experiencia, data_experiencia, acao_realizada, resultado_entregue, id_usuario)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [
            experiencia.titulo_experiencia,
            experiencia.data_experiencia,
            experiencia.acao_realizada,
            experiencia.resultado_entregue,
            id_usuario
          ]
        );

        const id_experiencia_portifolio = experienciaResult.rows[0].id;
        logger.info(`Experiência inserida com ID: ${id_experiencia_portifolio}`);

        // Processar materiais (arquivos)
        // Primeiro, verificar se há arquivos enviados via FormData
        const filesFromFormData = files.filter(file => file.fieldname === 'materiais');
        
        if (filesFromFormData.length > 0) {
          // Criar pasta do usuário no bucket
          const userFolder = `usuario_${id_usuario}`;
          const experienceFolder = `${userFolder}/experiencia_${id_experiencia_portifolio}`;
          
          await createFolder(userFolder);
          await createFolder(experienceFolder);
          
          // Processar arquivos enviados via FormData
          for (const material of filesFromFormData) {
            try {
              const sanitizedFileName = sanitizeFilename(material.originalname);
              const fileName = `${Date.now()}_${sanitizedFileName}`;
              const filePath = `${experienceFolder}/${fileName}`;
              
              // Fazer upload do arquivo para o Supabase Storage
              const uploadResult = await uploadFile(material, filePath);
              
              if (!uploadResult.success) {
                throw new Error(uploadResult.error);
              }
              
              // Salvar URL do arquivo no banco
              await query(
                `INSERT INTO materiais_portifolio (id_experiencia_portifolio, material)
                 VALUES ($1, $2)`,
                [id_experiencia_portifolio, uploadResult.publicUrl]
              );

              logger.info(`Material enviado com sucesso: ${uploadResult.publicUrl}`);
            } catch (error) {
              logger.error('Erro no upload do material', { error: error.message, material: material.originalname });
              await query('ROLLBACK');
              return res.status(500).json({
                success: false,
                message: `Erro no upload do material: ${error.message}`,
                error: 'MATERIAL_UPLOAD_ERROR'
              });
            }
          }
        } else if (experiencia.materiais && Array.isArray(experiencia.materiais)) {
          // Processar materiais enviados dentro do JSON das experiências
          const userFolder = `usuario_${id_usuario}`;
          const experienceFolder = `${userFolder}/experiencia_${id_experiencia_portifolio}`;
          
          await createFolder(userFolder);
          await createFolder(experienceFolder);
          
          for (const material of experiencia.materiais) {
            try {
              const sanitizedFileName = sanitizeFilename(material.originalname);
              const fileName = `${Date.now()}_${sanitizedFileName}`;
              const filePath = `${experienceFolder}/${fileName}`;
              
              // Fazer upload do arquivo para o Supabase Storage
              const uploadResult = await uploadFile(material, filePath);
              
              if (!uploadResult.success) {
                throw new Error(uploadResult.error);
              }
              
              // Salvar URL do arquivo no banco
              await query(
                `INSERT INTO materiais_portifolio (id_experiencia_portifolio, material)
                 VALUES ($1, $2)`,
                [id_experiencia_portifolio, uploadResult.publicUrl]
              );

              logger.info(`Material enviado com sucesso: ${uploadResult.publicUrl}`);
            } catch (error) {
              logger.error('Erro no upload do material', { error: error.message, material: material.originalname });
              await query('ROLLBACK');
              return res.status(500).json({
                success: false,
                message: `Erro no upload do material: ${error.message}`,
                error: 'MATERIAL_UPLOAD_ERROR'
              });
            }
          }
        }

        // Processar links
        if (experiencia.links && Array.isArray(experiencia.links)) {
          for (const link of experiencia.links) {
            if (link.link_evidencia) {
              await query(
                `INSERT INTO links_portifolio (id_experiencia_portifolio, link_evidencia)
                 VALUES ($1, $2)`,
                [id_experiencia_portifolio, link.link_evidencia]
              );
              logger.info(`Link salvo: ${link.link_evidencia}`);
            }
          }
        }

        // Processar feedbacks
        if (experiencia.feedbacks && Array.isArray(experiencia.feedbacks)) {
          for (const feedback of experiencia.feedbacks) {
            if (feedback.feedback && feedback.autor) {
              await query(
                `INSERT INTO feedbacks_portifolio (feedback, autor, id_experiencia_portifolio)
                 VALUES ($1, $2, $3)`,
                [feedback.feedback, feedback.autor, id_experiencia_portifolio]
              );
              logger.info(`Feedback salvo: ${feedback.autor}`);
            }
          }
        }

        resultados.push({
          id_experiencia_portifolio,
          titulo_experiencia: experiencia.titulo_experiencia,
          status: 'success'
        });
      }

      // Commit da transação
      await query('COMMIT');

      logger.info('Portfólio salvo com sucesso', { 
        id_usuario, 
        experiencias_salvas: resultados.length 
      });

      res.status(201).json({
        success: true,
        message: 'Portfólio salvo com sucesso',
        data: {
          id_usuario,
          experiencias_salvas: resultados.length,
          experiencias: resultados
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await query('ROLLBACK');
      logger.error('Erro ao salvar portfólio', { 
        error: error.message, 
        stack: error.stack,
        body: req.body,
        files: req.files ? req.files.map(f => ({ name: f.originalname, size: f.size })) : null
      });
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao salvar portfólio',
        error: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Busca o portfólio de um usuário
   * GET /api/portifolio/:id_usuario
   */
  async getPortifolio(req, res) {
    try {
      const { id_usuario } = req.params;

      logger.info('Buscando portfólio do usuário', { id_usuario });

      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório',
          error: 'MISSING_USER_ID'
        });
      }

      // Buscar experiências com materiais, links e feedbacks
      const experienciasResult = await query(
        `SELECT 
          ep.id,
          ep.titulo_experiencia,
          ep.data_experiencia,
          ep.acao_realizada,
          ep.resultado_entregue,
          ep.created_at
        FROM experiencia_portifolio ep
        WHERE ep.id_usuario = $1
        ORDER BY ep.data_experiencia DESC, ep.created_at DESC`,
        [id_usuario]
      );

      const experiencias = experienciasResult.rows;

      // Para cada experiência, buscar materiais, links e feedbacks
      for (let experiencia of experiencias) {
        // Buscar materiais
        const materiaisResult = await query(
          `SELECT id, material, created_at
           FROM materiais_portifolio
           WHERE id_experiencia_portifolio = $1
           ORDER BY created_at ASC`,
          [experiencia.id]
        );
        experiencia.materiais = materiaisResult.rows;

        // Buscar links
        const linksResult = await query(
          `SELECT id, link_evidencia, created_at
           FROM links_portifolio
           WHERE id_experiencia_portifolio = $1
           ORDER BY created_at ASC`,
          [experiencia.id]
        );
        experiencia.links = linksResult.rows;

        // Buscar feedbacks
        const feedbacksResult = await query(
          `SELECT id, feedback, autor, created_at
           FROM feedbacks_portifolio
           WHERE id_experiencia_portifolio = $1
           ORDER BY created_at ASC`,
          [experiencia.id]
        );
        experiencia.feedbacks = feedbacksResult.rows;
      }

      logger.info('Portfólio encontrado', { 
        id_usuario, 
        experiencias_count: experiencias.length 
      });

      res.json({
        success: true,
        message: 'Portfólio encontrado com sucesso',
        data: {
          id_usuario,
          experiencias,
          total_experiencias: experiencias.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Erro ao buscar portfólio', { error: error.message, stack: error.stack });
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar portfólio',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Atualiza uma experiência específica
   * PUT /api/portifolio/:id_usuario/:id_experiencia_portifolio
   */
  async atualizarPortifolio(req, res) {
    try {
      const { id_usuario, id_experiencia_portifolio } = req.params;
      const { experiencias } = req.body;
      const files = req.files || [];

      logger.info('Iniciando atualização de experiência', { 
        id_usuario,
        id_experiencia_portifolio,
        experiencias_count: experiencias ? JSON.parse(experiencias).length : 0
      });

      // Validações básicas
      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório',
          error: 'MISSING_USER_ID'
        });
      }

      if (!id_experiencia_portifolio) {
        return res.status(400).json({
          success: false,
          message: 'ID da experiência é obrigatório',
          error: 'MISSING_EXPERIENCE_ID'
        });
      }

      if (!experiencias) {
        return res.status(400).json({
          success: false,
          message: 'Experiências são obrigatórias',
          error: 'MISSING_EXPERIENCIAS'
        });
      }

      let experienciasData;
      try {
        experienciasData = JSON.parse(experiencias);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Formato de experiências inválido',
          error: 'INVALID_EXPERIENCIAS_FORMAT'
        });
      }

      if (!Array.isArray(experienciasData) || experienciasData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lista de experiências não pode estar vazia',
          error: 'EMPTY_EXPERIENCIAS'
        });
      }

      // Verificar se a experiência pertence ao usuário
      const experienciaCheck = await query(
        `SELECT id FROM experiencia_portifolio WHERE id = $1 AND id_usuario = $2`,
        [id_experiencia_portifolio, id_usuario]
      );

      if (experienciaCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Experiência não encontrada para este usuário',
          error: 'EXPERIENCE_NOT_FOUND'
        });
      }

      // Iniciar transação
      await query('BEGIN');

      // Deletar experiência existente (incluindo arquivos do S3)
      await this._deletarExperienciaCompleta(id_experiencia_portifolio);

      // Agora salvar a nova experiência
      const experiencia = experienciasData[0]; // Atualizar apenas uma experiência
        
      logger.info(`Processando experiência`, {
        titulo: experiencia.titulo_experiencia,
        data: experiencia.data_experiencia
      });

      // Validar dados da experiência
      if (!experiencia.titulo_experiencia || !experiencia.data_experiencia || 
          !experiencia.acao_realizada || !experiencia.resultado_entregue) {
        await query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Experiência está incompleta. Campos obrigatórios: titulo_experiencia, data_experiencia, acao_realizada, resultado_entregue`,
          error: 'INCOMPLETE_EXPERIENCIA'
        });
      }

      // Inserir nova experiência
      const experienciaResult = await query(
        `INSERT INTO experiencia_portifolio 
         (titulo_experiencia, data_experiencia, acao_realizada, resultado_entregue, id_usuario)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          experiencia.titulo_experiencia,
          experiencia.data_experiencia,
          experiencia.acao_realizada,
          experiencia.resultado_entregue,
          id_usuario
        ]
      );

      const novo_id_experiencia_portifolio = experienciaResult.rows[0].id;
      logger.info(`Experiência inserida com ID: ${novo_id_experiencia_portifolio}`);

      // Processar materiais (arquivos)
      const filesFromFormData = files.filter(file => file.fieldname === 'materiais');
      
      if (filesFromFormData.length > 0) {
        const userFolder = `usuario_${id_usuario}`;
        const experienceFolder = `${userFolder}/experiencia_${novo_id_experiencia_portifolio}`;
        
        await createFolder(userFolder);
        await createFolder(experienceFolder);
        
        for (const material of filesFromFormData) {
          try {
            const sanitizedFileName = sanitizeFilename(material.originalname);
            const fileName = `${Date.now()}_${sanitizedFileName}`;
            const filePath = `${experienceFolder}/${fileName}`;
            
            const uploadResult = await uploadFile(material, filePath);
            
            if (!uploadResult.success) {
              throw new Error(uploadResult.error);
            }
            
            await query(
              `INSERT INTO materiais_portifolio (id_experiencia_portifolio, material)
               VALUES ($1, $2)`,
              [novo_id_experiencia_portifolio, uploadResult.publicUrl]
            );

            logger.info(`Material enviado com sucesso: ${uploadResult.publicUrl}`);
          } catch (error) {
            logger.error('Erro no upload do material', { error: error.message, material: material.originalname });
            await query('ROLLBACK');
            return res.status(500).json({
              success: false,
              message: `Erro no upload do material: ${error.message}`,
              error: 'MATERIAL_UPLOAD_ERROR'
            });
          }
        }
      } else if (experiencia.materiais && Array.isArray(experiencia.materiais)) {
        const userFolder = `usuario_${id_usuario}`;
        const experienceFolder = `${userFolder}/experiencia_${novo_id_experiencia_portifolio}`;
        
        await createFolder(userFolder);
        await createFolder(experienceFolder);
        
        for (const material of experiencia.materiais) {
          try {
            const sanitizedFileName = sanitizeFilename(material.originalname);
            const fileName = `${Date.now()}_${sanitizedFileName}`;
            const filePath = `${experienceFolder}/${fileName}`;
            
            const uploadResult = await uploadFile(material, filePath);
            
            if (!uploadResult.success) {
              throw new Error(uploadResult.error);
            }
            
            await query(
              `INSERT INTO materiais_portifolio (id_experiencia_portifolio, material)
               VALUES ($1, $2)`,
              [novo_id_experiencia_portifolio, uploadResult.publicUrl]
            );

            logger.info(`Material enviado com sucesso: ${uploadResult.publicUrl}`);
          } catch (error) {
            logger.error('Erro no upload do material', { error: error.message, material: material.originalname });
            await query('ROLLBACK');
            return res.status(500).json({
              success: false,
              message: `Erro no upload do material: ${error.message}`,
              error: 'MATERIAL_UPLOAD_ERROR'
            });
          }
        }
      }

      // Processar links
      if (experiencia.links && Array.isArray(experiencia.links)) {
        for (const link of experiencia.links) {
          if (link.link_evidencia) {
            await query(
              `INSERT INTO links_portifolio (id_experiencia_portifolio, link_evidencia)
               VALUES ($1, $2)`,
              [novo_id_experiencia_portifolio, link.link_evidencia]
            );
            logger.info(`Link salvo: ${link.link_evidencia}`);
          }
        }
      }

      // Processar feedbacks
      if (experiencia.feedbacks && Array.isArray(experiencia.feedbacks)) {
        for (const feedback of experiencia.feedbacks) {
          if (feedback.feedback && feedback.autor) {
            await query(
              `INSERT INTO feedbacks_portifolio (feedback, autor, id_experiencia_portifolio)
               VALUES ($1, $2, $3)`,
              [feedback.feedback, feedback.autor, novo_id_experiencia_portifolio]
            );
            logger.info(`Feedback salvo: ${feedback.autor}`);
          }
        }
      }

      // Commit da transação
      await query('COMMIT');

      logger.info('Experiência atualizada com sucesso', { 
        id_usuario, 
        id_experiencia_portifolio: novo_id_experiencia_portifolio
      });

      res.status(200).json({
        success: true,
        message: 'Experiência atualizada com sucesso',
        data: {
          id_usuario,
          id_experiencia_portifolio: novo_id_experiencia_portifolio,
          titulo_experiencia: experiencia.titulo_experiencia,
          status: 'success'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await query('ROLLBACK');
      logger.error('Erro ao atualizar experiência', { 
        error: error.message, 
        stack: error.stack,
        params: req.params,
        body: req.body,
        files: req.files ? req.files.map(f => ({ name: f.originalname, size: f.size })) : null
      });
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao atualizar experiência',
        error: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Deleta uma experiência específica (incluindo arquivos do S3)
   * DELETE /api/portifolio/:id_usuario/:id_experiencia_portifolio
   */
  async deletarPortifolio(req, res) {
    try {
      const { id_usuario, id_experiencia_portifolio } = req.params;

      logger.info('Iniciando deleção de experiência', { 
        id_usuario, 
        id_experiencia_portifolio 
      });

      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório',
          error: 'MISSING_USER_ID'
        });
      }

      if (!id_experiencia_portifolio) {
        return res.status(400).json({
          success: false,
          message: 'ID da experiência é obrigatório',
          error: 'MISSING_EXPERIENCE_ID'
        });
      }

      // Verificar se a experiência pertence ao usuário
      const experienciaCheck = await query(
        `SELECT id, titulo_experiencia FROM experiencia_portifolio WHERE id = $1 AND id_usuario = $2`,
        [id_experiencia_portifolio, id_usuario]
      );

      if (experienciaCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Experiência não encontrada para este usuário',
          error: 'EXPERIENCE_NOT_FOUND'
        });
      }

      const experiencia = experienciaCheck.rows[0];

      // Iniciar transação
      await query('BEGIN');

      // Deletar experiência específica
      const resultado = await this._deletarExperienciaCompleta(id_experiencia_portifolio);

      // Commit da transação
      await query('COMMIT');

      logger.info('Experiência deletada com sucesso', { 
        id_usuario,
        id_experiencia_portifolio,
        titulo_experiencia: experiencia.titulo_experiencia,
        arquivos_deletados: resultado.arquivos_deletados
      });

      res.status(200).json({
        success: true,
        message: 'Experiência deletada com sucesso',
        data: {
          id_usuario,
          id_experiencia_portifolio,
          titulo_experiencia: experiencia.titulo_experiencia,
          arquivos_deletados: resultado.arquivos_deletados
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await query('ROLLBACK');
      logger.error('Erro ao deletar experiência', { 
        error: error.message, 
        stack: error.stack,
        params: req.params
      });
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao deletar experiência',
        error: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Função auxiliar para deletar uma experiência específica (incluindo arquivos do S3)
   * @param {string} id_experiencia_portifolio - ID da experiência
   * @returns {Promise<Object>} - Resultado da operação
   */
  async _deletarExperienciaCompleta(id_experiencia_portifolio) {
    let arquivos_deletados = 0;

    // Buscar materiais (arquivos) da experiência
    const materiaisResult = await query(
      `SELECT id, material FROM materiais_portifolio WHERE id_experiencia_portifolio = $1`,
      [id_experiencia_portifolio]
    );

    const materiais = materiaisResult.rows;

    // Deletar arquivos do S3
    for (const material of materiais) {
      try {
        const filePath = extractFilePathFromUrl(material.material);
        if (filePath) {
          const deleteResult = await deleteFile(filePath);
          if (deleteResult.success) {
            arquivos_deletados++;
            logger.info(`Arquivo deletado do S3: ${filePath}`);
          }
        }
      } catch (error) {
        logger.warn(`Erro ao deletar arquivo do S3: ${material.material}`, error.message);
      }
    }

    // Deletar materiais do banco
    await query(
      `DELETE FROM materiais_portifolio WHERE id_experiencia_portifolio = $1`,
      [id_experiencia_portifolio]
    );

    // Deletar links do banco
    await query(
      `DELETE FROM links_portifolio WHERE id_experiencia_portifolio = $1`,
      [id_experiencia_portifolio]
    );

    // Deletar feedbacks do banco
    await query(
      `DELETE FROM feedbacks_portifolio WHERE id_experiencia_portifolio = $1`,
      [id_experiencia_portifolio]
    );

    // Deletar experiência
    await query(
      `DELETE FROM experiencia_portifolio WHERE id = $1`,
      [id_experiencia_portifolio]
    );

    return {
      arquivos_deletados
    };
  }

  /**
   * Função auxiliar para deletar portfólio completo (incluindo arquivos do S3)
   * @param {string} id_usuario - ID do usuário
   * @returns {Promise<Object>} - Resultado da operação
   */
  async _deletarPortfolioCompleto(id_usuario) {
    let experiencias_deletadas = 0;
    let arquivos_deletados = 0;

    // Buscar todas as experiências do usuário
    const experienciasResult = await query(
      `SELECT id FROM experiencia_portifolio WHERE id_usuario = $1`,
      [id_usuario]
    );

    const experiencias = experienciasResult.rows;

    for (const experiencia of experiencias) {
      const resultado = await this._deletarExperienciaCompleta(experiencia.id);
      arquivos_deletados += resultado.arquivos_deletados;
      experiencias_deletadas++;
    }

    return {
      experiencias_deletadas,
      arquivos_deletados
    };
  }
}

module.exports = new PortifolioController();
