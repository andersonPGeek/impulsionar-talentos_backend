const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

class PerfilColaboradorController extends BaseController {
  /**
   * Buscar perfil completo do colaborador
   * GET /api/perfil-colaborador/:id_user
   */
  async buscarPerfil(req, res) {
    const client = await pool.connect();

    try {
      const { id_user } = req.params;

      logger.info('Iniciando busca de perfil completo do colaborador', {
        id_user
      });

      if (!id_user || isNaN(id_user)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      // Buscar identidade profissional
      const identidadeQuery = `
        SELECT * FROM identidade_profissional WHERE id_user = $1
      `;
      const identidadeResult = await client.query(identidadeQuery, [id_user]);
      
      // Buscar habilidades técnicas
      const habTecnicasQuery = `
        SELECT * FROM habilidades_tecnicas WHERE id_user = $1 ORDER BY id
      `;
      const habTecnicasResult = await client.query(habTecnicasQuery, [id_user]);

      // Buscar habilidades comportamentais
      const habComportamentaisQuery = `
        SELECT * FROM habilidades_comportamentais WHERE id_user = $1
      `;
      const habComportamentaisResult = await client.query(habComportamentaisQuery, [id_user]);

      // Buscar interesses e motivadores
      const interessesQuery = `
        SELECT * FROM interesses_motivadores WHERE id_user = $1
      `;
      const interessesResult = await client.query(interessesQuery, [id_user]);

      // Buscar propósito e valores
      const propositoQuery = `
        SELECT * FROM proposito_valores WHERE id_user = $1
      `;
      const propositoResult = await client.query(propositoQuery, [id_user]);

      // Buscar objetivos de carreira
      const objetivosQuery = `
        SELECT * FROM objetivos_carreira WHERE id_user = $1
      `;
      const objetivosResult = await client.query(objetivosQuery, [id_user]);

      // Buscar disponibilidade
      const disponibilidadeQuery = `
        SELECT * FROM disponibilidade WHERE id_user = $1
      `;
      const disponibilidadeResult = await client.query(disponibilidadeQuery, [id_user]);

      // Buscar histórico inicial
      const historicoQuery = `
        SELECT * FROM historico_inicial WHERE id_user = $1
      `;
      const historicoResult = await client.query(historicoQuery, [id_user]);

      // Verificar se existe algum registro
      const hasData = identidadeResult.rows.length > 0 ||
                     habTecnicasResult.rows.length > 0 ||
                     habComportamentaisResult.rows.length > 0 ||
                     interessesResult.rows.length > 0 ||
                     propositoResult.rows.length > 0 ||
                     objetivosResult.rows.length > 0 ||
                     disponibilidadeResult.rows.length > 0 ||
                     historicoResult.rows.length > 0;

      if (!hasData) {
        return ApiResponse.notFound(res, {
          error: 'PROFILE_NOT_FOUND',
          message: 'Perfil do colaborador não encontrado'
        });
      }

      // Montar resposta
      const perfil = {
        id_user: parseInt(id_user),
        identidade_profissional: identidadeResult.rows.length > 0 ? {
          area_time: identidadeResult.rows[0].area_time,
          tempo_empresa_meses: identidadeResult.rows[0].tempo_empresa_meses,
          tempo_experiencia_total_anos: identidadeResult.rows[0].tempo_experiencia_total_anos,
          formacao_nivel: identidadeResult.rows[0].formacao_nivel,
          formacao_area: identidadeResult.rows[0].formacao_area,
          certificacoes: identidadeResult.rows[0].certificacoes
        } : null,
        habilidades_tecnicas: habTecnicasResult.rows.map(row => ({
          nome_habilidade: row.nome_habilidade,
          nivel_autoavaliado: row.nivel_autoavaliado,
          nivel_exigido_cargo: row.nivel_exigido_cargo,
          experiencia_pratica: row.experiencia_pratica,
          evidencias: row.evidencias
        })),
        habilidades_comportamentais: habComportamentaisResult.rows.length > 0 ? {
          comunicacao: habComportamentaisResult.rows[0].comunicacao,
          trabalho_equipe: habComportamentaisResult.rows[0].trabalho_equipe,
          organizacao: habComportamentaisResult.rows[0].organizacao,
          autonomia: habComportamentaisResult.rows[0].autonomia,
          lideranca: habComportamentaisResult.rows[0].lideranca,
          resiliencia: habComportamentaisResult.rows[0].resiliencia,
          aprendizado_continuo: habComportamentaisResult.rows[0].aprendizado_continuo
        } : null,
        interesses_motivadores: interessesResult.rows.length > 0 ? {
          gosta_trabalho: interessesResult.rows[0].gosta_trabalho,
          nao_gosta_trabalho: interessesResult.rows[0].nao_gosta_trabalho,
          preferencia_desafio: interessesResult.rows[0].preferencia_desafio,
          preferencia_crescimento: interessesResult.rows[0].preferencia_crescimento,
          fator_retencao: interessesResult.rows[0].fator_retencao
        } : null,
        proposito_valores: propositoResult.rows.length > 0 ? {
          orgulho_trabalho: propositoResult.rows[0].orgulho_trabalho,
          impacto_desejado: propositoResult.rows[0].impacto_desejado,
          nao_aceita_ambiente: propositoResult.rows[0].nao_aceita_ambiente,
          definicao_sucesso: propositoResult.rows[0].definicao_sucesso
        } : null,
        objetivos_carreira: objetivosResult.rows.length > 0 ? {
          objetivo_1_ano: objetivosResult.rows[0].objetivo_1_ano,
          objetivo_3_anos: objetivosResult.rows[0].objetivo_3_anos,
          objetivo_5_anos: objetivosResult.rows[0].objetivo_5_anos,
          trilha_carreira: objetivosResult.rows[0].trilha_carreira
        } : null,
        disponibilidade: disponibilidadeResult.rows.length > 0 ? {
          horas_semanais_desenvolvimento: disponibilidadeResult.rows[0].horas_semanais_desenvolvimento,
          preferencia_aprendizado: disponibilidadeResult.rows[0].preferencia_aprendizado,
          aberto_mudanca: disponibilidadeResult.rows[0].aberto_mudanca,
          aceita_desafios: disponibilidadeResult.rows[0].aceita_desafios
        } : null,
        historico_inicial: historicoResult.rows.length > 0 ? {
          cursos_realizados: historicoResult.rows[0].cursos_realizados,
          eventos_palestras: historicoResult.rows[0].eventos_palestras,
          projetos_relevantes: historicoResult.rows[0].projetos_relevantes,
          feedbacks_recebidos: historicoResult.rows[0].feedbacks_recebidos
        } : null
      };

      logger.info('Perfil completo buscado com sucesso', { id_user });

      return ApiResponse.success(res, perfil, 'Perfil do colaborador buscado com sucesso');

    } catch (error) {
      logger.error('Erro ao buscar perfil do colaborador', {
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
   * Criar perfil completo do colaborador
   * POST /api/perfil-colaborador
   */
  async criarPerfil(req, res) {
    const client = await pool.connect();

    try {
      const {
        id_user,
        identidade_profissional,
        habilidades_tecnicas,
        habilidades_comportamentais,
        interesses_motivadores,
        proposito_valores,
        objetivos_carreira,
        disponibilidade,
        historico_inicial
      } = req.body;

      logger.info('Iniciando criação de perfil completo do colaborador', {
        id_user
      });

      // Validações básicas
      if (!id_user || isNaN(id_user)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      await client.query('BEGIN');

      // 1. Inserir ou atualizar identidade profissional
      if (identidade_profissional) {
        const checkQuery = `SELECT id FROM identidade_profissional WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const updateQuery = `
            UPDATE identidade_profissional SET
              area_time = $2,
              tempo_empresa_meses = $3,
              tempo_experiencia_total_anos = $4,
              formacao_nivel = $5,
              formacao_area = $6,
              certificacoes = $7,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            identidade_profissional.area_time || null,
            identidade_profissional.tempo_empresa_meses || null,
            identidade_profissional.tempo_experiencia_total_anos || null,
            identidade_profissional.formacao_nivel || null,
            identidade_profissional.formacao_area || null,
            identidade_profissional.certificacoes || null
          ]);
        } else {
          const insertQuery = `
            INSERT INTO identidade_profissional (
              id_user, area_time, tempo_empresa_meses, tempo_experiencia_total_anos,
              formacao_nivel, formacao_area, certificacoes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `;
          await client.query(insertQuery, [
            id_user,
            identidade_profissional.area_time || null,
            identidade_profissional.tempo_empresa_meses || null,
            identidade_profissional.tempo_experiencia_total_anos || null,
            identidade_profissional.formacao_nivel || null,
            identidade_profissional.formacao_area || null,
            identidade_profissional.certificacoes || null
          ]);
        }
      }

      // 2. Deletar habilidades técnicas antigas e inserir novas
      if (Array.isArray(habilidades_tecnicas)) {
        await client.query('DELETE FROM habilidades_tecnicas WHERE id_user = $1', [id_user]);
        
        for (const habilidade of habilidades_tecnicas) {
          const habTecQuery = `
            INSERT INTO habilidades_tecnicas (
              id_user, nome_habilidade, nivel_autoavaliado, nivel_exigido_cargo,
              experiencia_pratica, evidencias
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `;
          await client.query(habTecQuery, [
            id_user,
            habilidade.nome_habilidade,
            habilidade.nivel_autoavaliado || null,
            habilidade.nivel_exigido_cargo || null,
            habilidade.experiencia_pratica || null,
            habilidade.evidencias || null
          ]);
        }
      }

      // 3. Inserir ou atualizar habilidades comportamentais
      if (habilidades_comportamentais) {
        const checkQuery = `SELECT id FROM habilidades_comportamentais WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const updateQuery = `
            UPDATE habilidades_comportamentais SET
              comunicacao = $2,
              trabalho_equipe = $3,
              organizacao = $4,
              autonomia = $5,
              lideranca = $6,
              resiliencia = $7,
              aprendizado_continuo = $8,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            habilidades_comportamentais.comunicacao || null,
            habilidades_comportamentais.trabalho_equipe || null,
            habilidades_comportamentais.organizacao || null,
            habilidades_comportamentais.autonomia || null,
            habilidades_comportamentais.lideranca || null,
            habilidades_comportamentais.resiliencia || null,
            habilidades_comportamentais.aprendizado_continuo || null
          ]);
        } else {
          const insertQuery = `
            INSERT INTO habilidades_comportamentais (
              id_user, comunicacao, trabalho_equipe, organizacao, autonomia,
              lideranca, resiliencia, aprendizado_continuo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `;
          await client.query(insertQuery, [
            id_user,
            habilidades_comportamentais.comunicacao || null,
            habilidades_comportamentais.trabalho_equipe || null,
            habilidades_comportamentais.organizacao || null,
            habilidades_comportamentais.autonomia || null,
            habilidades_comportamentais.lideranca || null,
            habilidades_comportamentais.resiliencia || null,
            habilidades_comportamentais.aprendizado_continuo || null
          ]);
        }
      }

      // 4. Inserir ou atualizar interesses e motivadores
      if (interesses_motivadores) {
        const checkQuery = `SELECT id FROM interesses_motivadores WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const updateQuery = `
            UPDATE interesses_motivadores SET
              gosta_trabalho = $2,
              nao_gosta_trabalho = $3,
              preferencia_desafio = $4,
              preferencia_crescimento = $5,
              fator_retencao = $6,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            interesses_motivadores.gosta_trabalho || null,
            interesses_motivadores.nao_gosta_trabalho || null,
            interesses_motivadores.preferencia_desafio || null,
            interesses_motivadores.preferencia_crescimento || null,
            interesses_motivadores.fator_retencao || null
          ]);
        } else {
          const insertQuery = `
            INSERT INTO interesses_motivadores (
              id_user, gosta_trabalho, nao_gosta_trabalho, preferencia_desafio,
              preferencia_crescimento, fator_retencao
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `;
          await client.query(insertQuery, [
            id_user,
            interesses_motivadores.gosta_trabalho || null,
            interesses_motivadores.nao_gosta_trabalho || null,
            interesses_motivadores.preferencia_desafio || null,
            interesses_motivadores.preferencia_crescimento || null,
            interesses_motivadores.fator_retencao || null
          ]);
        }
      }

      // 5. Inserir ou atualizar propósito e valores
      if (proposito_valores) {
        const checkQuery = `SELECT id FROM proposito_valores WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const updateQuery = `
            UPDATE proposito_valores SET
              orgulho_trabalho = $2,
              impacto_desejado = $3,
              nao_aceita_ambiente = $4,
              definicao_sucesso = $5,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            proposito_valores.orgulho_trabalho || null,
            proposito_valores.impacto_desejado || null,
            proposito_valores.nao_aceita_ambiente || null,
            proposito_valores.definicao_sucesso || null
          ]);
        } else {
          const insertQuery = `
            INSERT INTO proposito_valores (
              id_user, orgulho_trabalho, impacto_desejado, nao_aceita_ambiente, definicao_sucesso
            ) VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(insertQuery, [
            id_user,
            proposito_valores.orgulho_trabalho || null,
            proposito_valores.impacto_desejado || null,
            proposito_valores.nao_aceita_ambiente || null,
            proposito_valores.definicao_sucesso || null
          ]);
        }
      }

      // 6. Inserir ou atualizar objetivos de carreira
      if (objetivos_carreira) {
        const checkQuery = `SELECT id FROM objetivos_carreira WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const updateQuery = `
            UPDATE objetivos_carreira SET
              objetivo_1_ano = $2,
              objetivo_3_anos = $3,
              objetivo_5_anos = $4,
              trilha_carreira = $5,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            objetivos_carreira.objetivo_1_ano || null,
            objetivos_carreira.objetivo_3_anos || null,
            objetivos_carreira.objetivo_5_anos || null,
            objetivos_carreira.trilha_carreira || null
          ]);
        } else {
          const insertQuery = `
            INSERT INTO objetivos_carreira (
              id_user, objetivo_1_ano, objetivo_3_anos, objetivo_5_anos, trilha_carreira
            ) VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(insertQuery, [
            id_user,
            objetivos_carreira.objetivo_1_ano || null,
            objetivos_carreira.objetivo_3_anos || null,
            objetivos_carreira.objetivo_5_anos || null,
            objetivos_carreira.trilha_carreira || null
          ]);
        }
      }

      // 7. Inserir ou atualizar disponibilidade
      if (disponibilidade) {
        const checkQuery = `SELECT id FROM disponibilidade WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const updateQuery = `
            UPDATE disponibilidade SET
              horas_semanais_desenvolvimento = $2,
              preferencia_aprendizado = $3,
              aberto_mudanca = $4,
              aceita_desafios = $5,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            disponibilidade.horas_semanais_desenvolvimento || null,
            disponibilidade.preferencia_aprendizado || null,
            disponibilidade.aberto_mudanca !== undefined ? disponibilidade.aberto_mudanca : null,
            disponibilidade.aceita_desafios !== undefined ? disponibilidade.aceita_desafios : null
          ]);
        } else {
          const insertQuery = `
            INSERT INTO disponibilidade (
              id_user, horas_semanais_desenvolvimento, preferencia_aprendizado,
              aberto_mudanca, aceita_desafios
            ) VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(insertQuery, [
            id_user,
            disponibilidade.horas_semanais_desenvolvimento || null,
            disponibilidade.preferencia_aprendizado || null,
            disponibilidade.aberto_mudanca !== undefined ? disponibilidade.aberto_mudanca : null,
            disponibilidade.aceita_desafios !== undefined ? disponibilidade.aceita_desafios : null
          ]);
        }
      }

      // 8. Inserir ou atualizar histórico inicial
      if (historico_inicial) {
        const checkQuery = `SELECT id FROM historico_inicial WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const updateQuery = `
            UPDATE historico_inicial SET
              cursos_realizados = $2,
              eventos_palestras = $3,
              projetos_relevantes = $4,
              feedbacks_recebidos = $5,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            historico_inicial.cursos_realizados || null,
            historico_inicial.eventos_palestras || null,
            historico_inicial.projetos_relevantes || null,
            historico_inicial.feedbacks_recebidos || null
          ]);
        } else {
          const insertQuery = `
            INSERT INTO historico_inicial (
              id_user, cursos_realizados, eventos_palestras, projetos_relevantes, feedbacks_recebidos
            ) VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(insertQuery, [
            id_user,
            historico_inicial.cursos_realizados || null,
            historico_inicial.eventos_palestras || null,
            historico_inicial.projetos_relevantes || null,
            historico_inicial.feedbacks_recebidos || null
          ]);
        }
      }

      await client.query('COMMIT');

      logger.info('Perfil completo criado com sucesso', { id_user });

      // Retornar sucesso - o cliente pode fazer GET se quiser o perfil completo
      return ApiResponse.success(res, {
        id_user: parseInt(id_user),
        message: 'Perfil criado com sucesso. Use GET para visualizar o perfil completo.'
      }, 'Perfil do colaborador criado com sucesso', 201);

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Erro ao criar perfil do colaborador', {
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

      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Função auxiliar para mesclar valores - só usa existente se a propriedade não foi enviada
   * Se foi enviada (mesmo que vazia), usa o novo valor para permitir limpeza de campos
   */
  mergeValue(novoValor, valorExistente, foiEnviado) {
    // Se a propriedade não foi enviada (undefined no objeto original), mantém existente
    if (!foiEnviado) {
      return valorExistente;
    }
    // Se foi enviada, usa o novo valor (permite string vazia, null, etc)
    return novoValor;
  }

  /**
   * Função auxiliar para mesclar objetos - mantém campos existentes quando novos estão vazios
   */
  mergeObject(novoObj, objExistente) {
    if (!novoObj || !objExistente) {
      return novoObj || objExistente;
    }
    
    const merged = { ...objExistente };
    Object.keys(novoObj).forEach(key => {
      const novoValor = novoObj[key];
      const valorExistente = objExistente[key];
      
      // Se o novo valor não é vazio, usa ele
      if (novoValor !== undefined && novoValor !== null && novoValor !== '') {
        if (typeof novoValor === 'object' && !Array.isArray(novoValor)) {
          merged[key] = this.mergeObject(novoValor, valorExistente || {});
        } else {
          merged[key] = novoValor;
        }
      }
    });
    
    return merged;
  }

  /**
   * Atualizar perfil completo do colaborador
   * PUT /api/perfil-colaborador
   */
  async atualizarPerfil(req, res) {
    const client = await pool.connect();

    try {
      const {
        id_user,
        identidade_profissional,
        habilidades_tecnicas,
        habilidades_comportamentais,
        interesses_motivadores,
        proposito_valores,
        objetivos_carreira,
        disponibilidade,
        historico_inicial
      } = req.body;

      logger.info('Iniciando atualização de perfil completo do colaborador', {
        id_user
      });

      // Validações básicas
      if (!id_user || isNaN(id_user)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      await client.query('BEGIN');

      // 1. Atualizar identidade profissional (mescla com existente)
      if (identidade_profissional !== undefined) {
        const checkQuery = `SELECT * FROM identidade_profissional WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          // Mesclar com valores existentes - usar novo valor se foi enviado
          const existente = checkResult.rows[0];
          const merged = {
            area_time: this.mergeValue(identidade_profissional.area_time, existente.area_time, identidade_profissional.hasOwnProperty('area_time')),
            tempo_empresa_meses: this.mergeValue(identidade_profissional.tempo_empresa_meses, existente.tempo_empresa_meses, identidade_profissional.hasOwnProperty('tempo_empresa_meses')),
            tempo_experiencia_total_anos: this.mergeValue(identidade_profissional.tempo_experiencia_total_anos, existente.tempo_experiencia_total_anos, identidade_profissional.hasOwnProperty('tempo_experiencia_total_anos')),
            formacao_nivel: this.mergeValue(identidade_profissional.formacao_nivel, existente.formacao_nivel, identidade_profissional.hasOwnProperty('formacao_nivel')),
            formacao_area: this.mergeValue(identidade_profissional.formacao_area, existente.formacao_area, identidade_profissional.hasOwnProperty('formacao_area')),
            certificacoes: this.mergeValue(identidade_profissional.certificacoes, existente.certificacoes, identidade_profissional.hasOwnProperty('certificacoes'))
          };

          const updateQuery = `
            UPDATE identidade_profissional SET
              area_time = $2,
              tempo_empresa_meses = $3,
              tempo_experiencia_total_anos = $4,
              formacao_nivel = $5,
              formacao_area = $6,
              certificacoes = $7,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            merged.area_time,
            merged.tempo_empresa_meses,
            merged.tempo_experiencia_total_anos,
            merged.formacao_nivel,
            merged.formacao_area,
            merged.certificacoes
          ]);
        } else {
          // Se não existe, cria novo (só se houver dados)
          if (identidade_profissional.area_time || identidade_profissional.tempo_empresa_meses || 
              identidade_profissional.tempo_experiencia_total_anos || identidade_profissional.formacao_nivel ||
              identidade_profissional.formacao_area || identidade_profissional.certificacoes) {
            const insertQuery = `
              INSERT INTO identidade_profissional (
                id_user, area_time, tempo_empresa_meses, tempo_experiencia_total_anos,
                formacao_nivel, formacao_area, certificacoes
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            await client.query(insertQuery, [
              id_user,
              identidade_profissional.area_time || null,
              identidade_profissional.tempo_empresa_meses || null,
              identidade_profissional.tempo_experiencia_total_anos || null,
              identidade_profissional.formacao_nivel || null,
              identidade_profissional.formacao_area || null,
              identidade_profissional.certificacoes || null
            ]);
          }
        }
      }

      // 2. Atualizar habilidades técnicas (se fornecido, substitui completamente)
      if (habilidades_tecnicas !== undefined) {
        if (Array.isArray(habilidades_tecnicas) && habilidades_tecnicas.length > 0) {
          // Se array não está vazio, substitui
          await client.query('DELETE FROM habilidades_tecnicas WHERE id_user = $1', [id_user]);
          
          for (const habilidade of habilidades_tecnicas) {
            const habTecQuery = `
              INSERT INTO habilidades_tecnicas (
                id_user, nome_habilidade, nivel_autoavaliado, nivel_exigido_cargo,
                experiencia_pratica, evidencias
              ) VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await client.query(habTecQuery, [
              id_user,
              habilidade.nome_habilidade,
              habilidade.nivel_autoavaliado || null,
              habilidade.nivel_exigido_cargo || null,
              habilidade.experiencia_pratica || null,
              habilidade.evidencias || null
            ]);
          }
        }
        // Se array está vazio ou não é array, mantém as existentes (não faz nada)
      }

      // 3. Atualizar habilidades comportamentais (mescla com existente)
      if (habilidades_comportamentais !== undefined) {
        const checkQuery = `SELECT * FROM habilidades_comportamentais WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const existente = checkResult.rows[0];
          const merged = {
            comunicacao: this.mergeValue(habilidades_comportamentais.comunicacao, existente.comunicacao, habilidades_comportamentais.hasOwnProperty('comunicacao')),
            trabalho_equipe: this.mergeValue(habilidades_comportamentais.trabalho_equipe, existente.trabalho_equipe, habilidades_comportamentais.hasOwnProperty('trabalho_equipe')),
            organizacao: this.mergeValue(habilidades_comportamentais.organizacao, existente.organizacao, habilidades_comportamentais.hasOwnProperty('organizacao')),
            autonomia: this.mergeValue(habilidades_comportamentais.autonomia, existente.autonomia, habilidades_comportamentais.hasOwnProperty('autonomia')),
            lideranca: this.mergeValue(habilidades_comportamentais.lideranca, existente.lideranca, habilidades_comportamentais.hasOwnProperty('lideranca')),
            resiliencia: this.mergeValue(habilidades_comportamentais.resiliencia, existente.resiliencia, habilidades_comportamentais.hasOwnProperty('resiliencia')),
            aprendizado_continuo: this.mergeValue(habilidades_comportamentais.aprendizado_continuo, existente.aprendizado_continuo, habilidades_comportamentais.hasOwnProperty('aprendizado_continuo'))
          };

          const updateQuery = `
            UPDATE habilidades_comportamentais SET
              comunicacao = $2,
              trabalho_equipe = $3,
              organizacao = $4,
              autonomia = $5,
              lideranca = $6,
              resiliencia = $7,
              aprendizado_continuo = $8,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            merged.comunicacao,
            merged.trabalho_equipe,
            merged.organizacao,
            merged.autonomia,
            merged.lideranca,
            merged.resiliencia,
            merged.aprendizado_continuo
          ]);
        } else {
          // Se não existe, cria novo (só se houver dados não vazios)
          if (habilidades_comportamentais.comunicacao !== undefined || 
              habilidades_comportamentais.trabalho_equipe !== undefined ||
              habilidades_comportamentais.organizacao !== undefined ||
              habilidades_comportamentais.autonomia !== undefined ||
              habilidades_comportamentais.lideranca !== undefined ||
              habilidades_comportamentais.resiliencia !== undefined ||
              habilidades_comportamentais.aprendizado_continuo !== undefined) {
            const insertQuery = `
              INSERT INTO habilidades_comportamentais (
                id_user, comunicacao, trabalho_equipe, organizacao, autonomia,
                lideranca, resiliencia, aprendizado_continuo
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            await client.query(insertQuery, [
              id_user,
              habilidades_comportamentais.comunicacao || null,
              habilidades_comportamentais.trabalho_equipe || null,
              habilidades_comportamentais.organizacao || null,
              habilidades_comportamentais.autonomia || null,
              habilidades_comportamentais.lideranca || null,
              habilidades_comportamentais.resiliencia || null,
              habilidades_comportamentais.aprendizado_continuo || null
            ]);
          }
        }
      }

      // 4. Atualizar interesses e motivadores (mescla com existente)
      if (interesses_motivadores !== undefined) {
        const checkQuery = `SELECT * FROM interesses_motivadores WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const existente = checkResult.rows[0];
          const merged = {
            gosta_trabalho: this.mergeValue(interesses_motivadores.gosta_trabalho, existente.gosta_trabalho, interesses_motivadores.hasOwnProperty('gosta_trabalho')),
            nao_gosta_trabalho: this.mergeValue(interesses_motivadores.nao_gosta_trabalho, existente.nao_gosta_trabalho, interesses_motivadores.hasOwnProperty('nao_gosta_trabalho')),
            preferencia_desafio: this.mergeValue(interesses_motivadores.preferencia_desafio, existente.preferencia_desafio, interesses_motivadores.hasOwnProperty('preferencia_desafio')),
            preferencia_crescimento: this.mergeValue(interesses_motivadores.preferencia_crescimento, existente.preferencia_crescimento, interesses_motivadores.hasOwnProperty('preferencia_crescimento')),
            fator_retencao: this.mergeValue(interesses_motivadores.fator_retencao, existente.fator_retencao, interesses_motivadores.hasOwnProperty('fator_retencao'))
          };

          const updateQuery = `
            UPDATE interesses_motivadores SET
              gosta_trabalho = $2,
              nao_gosta_trabalho = $3,
              preferencia_desafio = $4,
              preferencia_crescimento = $5,
              fator_retencao = $6,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            merged.gosta_trabalho,
            merged.nao_gosta_trabalho,
            merged.preferencia_desafio,
            merged.preferencia_crescimento,
            merged.fator_retencao
          ]);
        } else {
          // Se não existe, cria novo
          if (interesses_motivadores.gosta_trabalho || interesses_motivadores.nao_gosta_trabalho ||
              interesses_motivadores.preferencia_desafio || interesses_motivadores.preferencia_crescimento ||
              interesses_motivadores.fator_retencao) {
            const insertQuery = `
              INSERT INTO interesses_motivadores (
                id_user, gosta_trabalho, nao_gosta_trabalho, preferencia_desafio,
                preferencia_crescimento, fator_retencao
              ) VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await client.query(insertQuery, [
              id_user,
              interesses_motivadores.gosta_trabalho || null,
              interesses_motivadores.nao_gosta_trabalho || null,
              interesses_motivadores.preferencia_desafio || null,
              interesses_motivadores.preferencia_crescimento || null,
              interesses_motivadores.fator_retencao || null
            ]);
          }
        }
      }

      // 5. Atualizar propósito e valores (mescla com existente)
      if (proposito_valores !== undefined) {
        const checkQuery = `SELECT * FROM proposito_valores WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const existente = checkResult.rows[0];
          const merged = {
            orgulho_trabalho: this.mergeValue(proposito_valores.orgulho_trabalho, existente.orgulho_trabalho, proposito_valores.hasOwnProperty('orgulho_trabalho')),
            impacto_desejado: this.mergeValue(proposito_valores.impacto_desejado, existente.impacto_desejado, proposito_valores.hasOwnProperty('impacto_desejado')),
            nao_aceita_ambiente: this.mergeValue(proposito_valores.nao_aceita_ambiente, existente.nao_aceita_ambiente, proposito_valores.hasOwnProperty('nao_aceita_ambiente')),
            definicao_sucesso: this.mergeValue(proposito_valores.definicao_sucesso, existente.definicao_sucesso, proposito_valores.hasOwnProperty('definicao_sucesso'))
          };

          const updateQuery = `
            UPDATE proposito_valores SET
              orgulho_trabalho = $2,
              impacto_desejado = $3,
              nao_aceita_ambiente = $4,
              definicao_sucesso = $5,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            merged.orgulho_trabalho,
            merged.impacto_desejado,
            merged.nao_aceita_ambiente,
            merged.definicao_sucesso
          ]);
        } else {
          // Se não existe, cria novo
          if (proposito_valores.orgulho_trabalho || proposito_valores.impacto_desejado ||
              proposito_valores.nao_aceita_ambiente || proposito_valores.definicao_sucesso) {
            const insertQuery = `
              INSERT INTO proposito_valores (
                id_user, orgulho_trabalho, impacto_desejado, nao_aceita_ambiente, definicao_sucesso
              ) VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(insertQuery, [
              id_user,
              proposito_valores.orgulho_trabalho || null,
              proposito_valores.impacto_desejado || null,
              proposito_valores.nao_aceita_ambiente || null,
              proposito_valores.definicao_sucesso || null
            ]);
          }
        }
      }

      // 6. Atualizar objetivos de carreira (mescla com existente)
      if (objetivos_carreira !== undefined) {
        const checkQuery = `SELECT * FROM objetivos_carreira WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const existente = checkResult.rows[0];
          const merged = {
            objetivo_1_ano: this.mergeValue(objetivos_carreira.objetivo_1_ano, existente.objetivo_1_ano, objetivos_carreira.hasOwnProperty('objetivo_1_ano')),
            objetivo_3_anos: this.mergeValue(objetivos_carreira.objetivo_3_anos, existente.objetivo_3_anos, objetivos_carreira.hasOwnProperty('objetivo_3_anos')),
            objetivo_5_anos: this.mergeValue(objetivos_carreira.objetivo_5_anos, existente.objetivo_5_anos, objetivos_carreira.hasOwnProperty('objetivo_5_anos')),
            trilha_carreira: this.mergeValue(objetivos_carreira.trilha_carreira, existente.trilha_carreira, objetivos_carreira.hasOwnProperty('trilha_carreira'))
          };

          const updateQuery = `
            UPDATE objetivos_carreira SET
              objetivo_1_ano = $2,
              objetivo_3_anos = $3,
              objetivo_5_anos = $4,
              trilha_carreira = $5,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            merged.objetivo_1_ano,
            merged.objetivo_3_anos,
            merged.objetivo_5_anos,
            merged.trilha_carreira
          ]);
        } else {
          // Se não existe, cria novo
          if (objetivos_carreira.objetivo_1_ano || objetivos_carreira.objetivo_3_anos ||
              objetivos_carreira.objetivo_5_anos || objetivos_carreira.trilha_carreira) {
            const insertQuery = `
              INSERT INTO objetivos_carreira (
                id_user, objetivo_1_ano, objetivo_3_anos, objetivo_5_anos, trilha_carreira
              ) VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(insertQuery, [
              id_user,
              objetivos_carreira.objetivo_1_ano || null,
              objetivos_carreira.objetivo_3_anos || null,
              objetivos_carreira.objetivo_5_anos || null,
              objetivos_carreira.trilha_carreira || null
            ]);
          }
        }
      }

      // 7. Atualizar disponibilidade (mescla com existente)
      if (disponibilidade !== undefined) {
        const checkQuery = `SELECT * FROM disponibilidade WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const existente = checkResult.rows[0];
          const merged = {
            horas_semanais_desenvolvimento: this.mergeValue(disponibilidade.horas_semanais_desenvolvimento, existente.horas_semanais_desenvolvimento, disponibilidade.hasOwnProperty('horas_semanais_desenvolvimento')),
            preferencia_aprendizado: this.mergeValue(disponibilidade.preferencia_aprendizado, existente.preferencia_aprendizado, disponibilidade.hasOwnProperty('preferencia_aprendizado')),
            aberto_mudanca: disponibilidade.hasOwnProperty('aberto_mudanca') ? disponibilidade.aberto_mudanca : existente.aberto_mudanca,
            aceita_desafios: disponibilidade.hasOwnProperty('aceita_desafios') ? disponibilidade.aceita_desafios : existente.aceita_desafios
          };

          const updateQuery = `
            UPDATE disponibilidade SET
              horas_semanais_desenvolvimento = $2,
              preferencia_aprendizado = $3,
              aberto_mudanca = $4,
              aceita_desafios = $5,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            merged.horas_semanais_desenvolvimento,
            merged.preferencia_aprendizado,
            merged.aberto_mudanca,
            merged.aceita_desafios
          ]);
        } else {
          // Se não existe, cria novo
          if (disponibilidade.horas_semanais_desenvolvimento !== undefined ||
              disponibilidade.preferencia_aprendizado !== undefined ||
              disponibilidade.aberto_mudanca !== undefined ||
              disponibilidade.aceita_desafios !== undefined) {
            const insertQuery = `
              INSERT INTO disponibilidade (
                id_user, horas_semanais_desenvolvimento, preferencia_aprendizado,
                aberto_mudanca, aceita_desafios
              ) VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(insertQuery, [
              id_user,
              disponibilidade.horas_semanais_desenvolvimento || null,
              disponibilidade.preferencia_aprendizado || null,
              disponibilidade.aberto_mudanca !== undefined ? disponibilidade.aberto_mudanca : null,
              disponibilidade.aceita_desafios !== undefined ? disponibilidade.aceita_desafios : null
            ]);
          }
        }
      }

      // 8. Atualizar histórico inicial (mescla com existente)
      if (historico_inicial !== undefined) {
        const checkQuery = `SELECT * FROM historico_inicial WHERE id_user = $1`;
        const checkResult = await client.query(checkQuery, [id_user]);

        if (checkResult.rows.length > 0) {
          const existente = checkResult.rows[0];
          const merged = {
            cursos_realizados: this.mergeValue(historico_inicial.cursos_realizados, existente.cursos_realizados, historico_inicial.hasOwnProperty('cursos_realizados')),
            eventos_palestras: this.mergeValue(historico_inicial.eventos_palestras, existente.eventos_palestras, historico_inicial.hasOwnProperty('eventos_palestras')),
            projetos_relevantes: this.mergeValue(historico_inicial.projetos_relevantes, existente.projetos_relevantes, historico_inicial.hasOwnProperty('projetos_relevantes')),
            feedbacks_recebidos: this.mergeValue(historico_inicial.feedbacks_recebidos, existente.feedbacks_recebidos, historico_inicial.hasOwnProperty('feedbacks_recebidos'))
          };

          const updateQuery = `
            UPDATE historico_inicial SET
              cursos_realizados = $2,
              eventos_palestras = $3,
              projetos_relevantes = $4,
              feedbacks_recebidos = $5,
              updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
          `;
          await client.query(updateQuery, [
            id_user,
            merged.cursos_realizados,
            merged.eventos_palestras,
            merged.projetos_relevantes,
            merged.feedbacks_recebidos
          ]);
        } else {
          // Se não existe, cria novo
          if (historico_inicial.cursos_realizados || historico_inicial.eventos_palestras ||
              historico_inicial.projetos_relevantes || historico_inicial.feedbacks_recebidos) {
            const insertQuery = `
              INSERT INTO historico_inicial (
                id_user, cursos_realizados, eventos_palestras, projetos_relevantes, feedbacks_recebidos
              ) VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(insertQuery, [
              id_user,
              historico_inicial.cursos_realizados || null,
              historico_inicial.eventos_palestras || null,
              historico_inicial.projetos_relevantes || null,
              historico_inicial.feedbacks_recebidos || null
            ]);
          }
        }
      }

      await client.query('COMMIT');

      logger.info('Perfil completo atualizado com sucesso', { id_user });

      return ApiResponse.success(res, {
        id_user: parseInt(id_user),
        message: 'Perfil atualizado com sucesso. Use GET para visualizar o perfil completo.'
      }, 'Perfil do colaborador atualizado com sucesso', 200);

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Erro ao atualizar perfil do colaborador', {
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

      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }

  /**
   * Deletar perfil completo do colaborador
   * DELETE /api/perfil-colaborador/:id_user
   */
  async deletarPerfil(req, res) {
    const client = await pool.connect();

    try {
      const { id_user } = req.params;

      logger.info('Iniciando exclusão de perfil completo do colaborador', {
        id_user
      });

      if (!id_user || isNaN(id_user)) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      await client.query('BEGIN');

      // Deletar de todas as tabelas
      await client.query('DELETE FROM historico_inicial WHERE id_user = $1', [id_user]);
      await client.query('DELETE FROM disponibilidade WHERE id_user = $1', [id_user]);
      await client.query('DELETE FROM objetivos_carreira WHERE id_user = $1', [id_user]);
      await client.query('DELETE FROM proposito_valores WHERE id_user = $1', [id_user]);
      await client.query('DELETE FROM interesses_motivadores WHERE id_user = $1', [id_user]);
      await client.query('DELETE FROM habilidades_comportamentais WHERE id_user = $1', [id_user]);
      await client.query('DELETE FROM habilidades_tecnicas WHERE id_user = $1', [id_user]);
      await client.query('DELETE FROM identidade_profissional WHERE id_user = $1', [id_user]);

      await client.query('COMMIT');

      logger.info('Perfil completo deletado com sucesso', { id_user });

      return ApiResponse.success(res, {
        id_user: parseInt(id_user),
        message: 'Perfil deletado com sucesso'
      }, 'Perfil do colaborador deletado com sucesso');

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Erro ao deletar perfil do colaborador', {
        error: error.message,
        stack: error.stack,
        id_user: req.params.id_user
      });
      return ApiResponse.internalError(res);
    } finally {
      client.release();
    }
  }
}

module.exports = new PerfilColaboradorController(); 
