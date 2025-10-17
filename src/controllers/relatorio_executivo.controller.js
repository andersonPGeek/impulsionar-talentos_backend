const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

class RelatorioExecutivoController extends BaseController {
  constructor() {
    super();
    
    // APIs de visão geral
    this.getIndiceEngajamentoGeral = this.getIndiceEngajamentoGeral.bind(this);
    this.getTaxaEvolucaoDesenvolvimento = this.getTaxaEvolucaoDesenvolvimento.bind(this);
    this.getNivelMedioReconhecimento = this.getNivelMedioReconhecimento.bind(this);
    this.getIndiceSatisfacaoInterna = this.getIndiceSatisfacaoInterna.bind(this);
    this.getMaturidadeCarreira = this.getMaturidadeCarreira.bind(this);
    
    // APIs de árvore da vida
    this.getIndicePlenitude = this.getIndicePlenitude.bind(this);
    this.getIndiceVitalidade = this.getIndiceVitalidade.bind(this);
    this.getIndicePropositoContribuicao = this.getIndicePropositoContribuicao.bind(this);
    this.getIndiceProfissionalGlobal = this.getIndiceProfissionalGlobal.bind(this);
    
    // APIs de análise SWOT
    this.getForcasVsFraquezasRatio = this.getForcasVsFraquezasRatio.bind(this);
    this.getOportunidadesAproveitadas = this.getOportunidadesAproveitadas.bind(this);
    this.getAmeacasMonitoradas = this.getAmeacasMonitoradas.bind(this);
    
    // APIs de PDI
    this.getProgressoMedioPDI = this.getProgressoMedioPDI.bind(this);
    this.getTaxaMetasProgresso = this.getTaxaMetasProgresso.bind(this);
    this.getAderenciaPrazo = this.getAderenciaPrazo.bind(this);
    this.getEngajamentoMentoria = this.getEngajamentoMentoria.bind(this);
    
    // APIs de Portfólio
    this.getTaxaAtualizacaoPortfolio = this.getTaxaAtualizacaoPortfolio.bind(this);
    this.getIndiceFeedbacksPositivos = this.getIndiceFeedbacksPositivos.bind(this);
    this.getConquistasValidadas = this.getConquistasValidadas.bind(this);
    this.getAcoesMelhoria = this.getAcoesMelhoria.bind(this);
    
    // APIs de Programa de Reconhecimento
    this.getReconhecimentosPorColaborador = this.getReconhecimentosPorColaborador.bind(this);
    this.getTopSkillsReconhecidas = this.getTopSkillsReconhecidas.bind(this);
    this.getTempoMedioEntreReconhecimentos = this.getTempoMedioEntreReconhecimentos.bind(this);
    this.getDistribuicaoReconhecimentoPorArea = this.getDistribuicaoReconhecimentoPorArea.bind(this);
    
    // KPIs de tendência
    this.getIndiceReconhecimentoReciproco = this.getIndiceReconhecimentoReciproco.bind(this);
    this.getIndiceBemEstarOrganizacional = this.getIndiceBemEstarOrganizacional.bind(this);
    this.getTempoMedioEvolucaoMeta = this.getTempoMedioEvolucaoMeta.bind(this);
    
    // APIs de geração de relatórios
    this.gerarPDFRelatorio = this.gerarPDFRelatorio.bind(this);
    this.gerarExcelRelatorio = this.gerarExcelRelatorio.bind(this);
  }

  // ========== APIs DE VISÃO GERAL ==========

  /**
   * Índice de Engajamento Geral (IEG) - Média ponderada dos pilares da Árvore da Vida
   * GET /api/relatorio-executivo/indice-engajamento-geral/:id_cliente
   */
  async getIndiceEngajamentoGeral(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Índice de Engajamento Geral', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          AVG(pontuacao_geral) as media_pontuacao_geral,
          AVG(criatividade_hobbie) as media_criatividade,
          AVG(plenitude_felicidade) as media_plenitude,
          AVG(espiritualidade) as media_espiritualidade,
          AVG(saude_disposicao) as media_saude,
          AVG(desenvolvimento_intelectual) as media_desenvolvimento,
          AVG(equilibrio_emocional) as media_equilibrio,
          AVG(familia) as media_familia,
          AVG(desenvolvimento_amoroso) as media_amoroso,
          AVG(vida_social) as media_social,
          AVG(realizacao_proposito) as media_realizacao,
          AVG(recursos_financeiros) as media_financeiros,
          AVG(contribuicao_social) as media_contribuicao
        FROM arvore_da_vida adv
        INNER JOIN usuarios u ON adv.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      
      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            indice_engajamento_geral: 0,
            detalhes: {
              pontuacao_geral: 0,
              criatividade_hobbie: 0,
              plenitude_felicidade: 0,
              espiritualidade: 0,
              saude_disposicao: 0,
              desenvolvimento_intelectual: 0,
              equilibrio_emocional: 0,
              familia: 0,
              desenvolvimento_amoroso: 0,
              vida_social: 0,
              realizacao_proposito: 0,
              recursos_financeiros: 0,
              contribuicao_social: 0
            }
          }
        });
      }

      const row = result.rows[0];
      const pilares = [
        parseFloat(row.media_criatividade) || 0,
        parseFloat(row.media_plenitude) || 0,
        parseFloat(row.media_espiritualidade) || 0,
        parseFloat(row.media_saude) || 0,
        parseFloat(row.media_desenvolvimento) || 0,
        parseFloat(row.media_equilibrio) || 0,
        parseFloat(row.media_familia) || 0,
        parseFloat(row.media_amoroso) || 0,
        parseFloat(row.media_social) || 0,
        parseFloat(row.media_realizacao) || 0,
        parseFloat(row.media_financeiros) || 0,
        parseFloat(row.media_contribuicao) || 0
      ];

      const indiceEngajamentoGeral = pilares.reduce((sum, valor) => sum + valor, 0) / pilares.length;

      return res.status(200).json({
        success: true,
        data: {
          indice_engajamento_geral: parseFloat(indiceEngajamentoGeral.toFixed(2)),
          detalhes: {
            pontuacao_geral: parseFloat(row.media_pontuacao_geral) || 0,
            criatividade_hobbie: parseFloat(row.media_criatividade) || 0,
            plenitude_felicidade: parseFloat(row.media_plenitude) || 0,
            espiritualidade: parseFloat(row.media_espiritualidade) || 0,
            saude_disposicao: parseFloat(row.media_saude) || 0,
            desenvolvimento_intelectual: parseFloat(row.media_desenvolvimento) || 0,
            equilibrio_emocional: parseFloat(row.media_equilibrio) || 0,
            familia: parseFloat(row.media_familia) || 0,
            desenvolvimento_amoroso: parseFloat(row.media_amoroso) || 0,
            vida_social: parseFloat(row.media_social) || 0,
            realizacao_proposito: parseFloat(row.media_realizacao) || 0,
            recursos_financeiros: parseFloat(row.media_financeiros) || 0,
            contribuicao_social: parseFloat(row.media_contribuicao) || 0
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Índice de Engajamento Geral:', error);
      return this.handleError(res, error, 'Erro ao calcular Índice de Engajamento Geral');
    } finally {
      client.release();
    }
  }

  /**
   * Taxa de Evolução de Desenvolvimento (TED) - (Atividades concluídas ÷ Atividades planejadas no PDI) × 100
   * GET /api/relatorio-executivo/taxa-evolucao-desenvolvimento/:id_cliente
   */
  async getTaxaEvolucaoDesenvolvimento(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Taxa de Evolução de Desenvolvimento', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(CASE WHEN ap.status_atividade = 'Concluída' THEN 1 END) as atividades_concluidas,
          COUNT(ap.id) as total_atividades
        FROM atividades_pdi ap
        INNER JOIN metas_pdi mp ON ap.id_meta_pdi = mp.id
        INNER JOIN usuarios u ON mp.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const atividadesConcluidas = parseInt(row.atividades_concluidas) || 0;
      const totalAtividades = parseInt(row.total_atividades) || 0;
      
      const taxaEvolucaoDesenvolvimento = totalAtividades > 0 
        ? ((atividadesConcluidas / totalAtividades) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          taxa_evolucao_desenvolvimento: parseFloat(taxaEvolucaoDesenvolvimento.toFixed(2)),
          detalhes: {
            atividades_concluidas: atividadesConcluidas,
            total_atividades: totalAtividades
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Taxa de Evolução de Desenvolvimento:', error);
      return this.handleError(res, error, 'Erro ao calcular Taxa de Evolução de Desenvolvimento');
    } finally {
      client.release();
    }
  }

  /**
   * Nível Médio de Reconhecimento (NMR) - Total de reconhecimentos dados + recebidos ÷ Colaboradores ativos
   * GET /api/relatorio-executivo/nivel-medio-reconhecimento/:id_cliente
   */
  async getNivelMedioReconhecimento(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Nível Médio de Reconhecimento', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(r.id) as total_reconhecimentos,
          COUNT(DISTINCT u.id) as colaboradores_ativos
        FROM usuarios u
        LEFT JOIN reconhecimento r ON (u.id = r.id_usuario_reconhecido OR u.id = r.id_usuario_reconheceu)
        WHERE u.id_cliente = $1 
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const totalReconhecimentos = parseInt(row.total_reconhecimentos) || 0;
      const colaboradoresAtivos = parseInt(row.colaboradores_ativos) || 0;
      
      const nivelMedioReconhecimento = colaboradoresAtivos > 0 
        ? (totalReconhecimentos / colaboradoresAtivos) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          nivel_medio_reconhecimento: parseFloat(nivelMedioReconhecimento.toFixed(2)),
          detalhes: {
            total_reconhecimentos: totalReconhecimentos,
            colaboradores_ativos: colaboradoresAtivos
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Nível Médio de Reconhecimento:', error);
      return this.handleError(res, error, 'Erro ao calcular Nível Médio de Reconhecimento');
    } finally {
      client.release();
    }
  }

  /**
   * Índice de Satisfação Interna (ISI) - Média ponderada de feedbacks positivos no portfólio
   * GET /api/relatorio-executivo/indice-satisfacao-interna/:id_cliente
   */
  async getIndiceSatisfacaoInterna(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Índice de Satisfação Interna', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(CASE WHEN LOWER(fp.feedback) LIKE '%positiv%' OR LOWER(fp.feedback) LIKE '%excelent%' OR LOWER(fp.feedback) LIKE '%ótim%' THEN 1 END) as feedbacks_positivos,
          COUNT(fp.id) as total_feedbacks
        FROM feedbacks_portifolio fp
        INNER JOIN experiencia_portifolio ep ON fp.id_experiencia_portifolio = ep.id
        INNER JOIN usuarios u ON ep.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const feedbacksPositivos = parseInt(row.feedbacks_positivos) || 0;
      const totalFeedbacks = parseInt(row.total_feedbacks) || 0;
      
      const indiceSatisfacaoInterna = totalFeedbacks > 0 
        ? ((feedbacksPositivos / totalFeedbacks) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          indice_satisfacao_interna: parseFloat(indiceSatisfacaoInterna.toFixed(2)),
          detalhes: {
            feedbacks_positivos: feedbacksPositivos,
            total_feedbacks: totalFeedbacks
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Índice de Satisfação Interna:', error);
      return this.handleError(res, error, 'Erro ao calcular Índice de Satisfação Interna');
    } finally {
      client.release();
    }
  }

  /**
   * Maturidade de Carreira (MC) - (Metas concluídas + Evoluções de Portfólio) ÷ Tempo de casa
   * GET /api/relatorio-executivo/maturidade-carreira/:id_cliente
   */
  async getMaturidadeCarreira(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Maturidade de Carreira', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          (SELECT COUNT(*) FROM metas_pdi mp WHERE mp.id_usuario IN (SELECT id FROM usuarios WHERE id_cliente = $1) AND mp.status = 'Concluída') as metas_concluidas,
          (SELECT COUNT(*) FROM experiencia_portifolio ep WHERE ep.id_usuario IN (SELECT id FROM usuarios WHERE id_cliente = $1)) as evolucoes_portfolio,
          AVG(EXTRACT(EPOCH FROM (NOW() - u.created_at)) / (365.25 * 24 * 60 * 60)) as tempo_medio_casa_anos
        FROM usuarios u
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const metasConcluidas = parseInt(row.metas_concluidas) || 0;
      const evolucoesPortfolio = parseInt(row.evolucoes_portfolio) || 0;
      const tempoMedioCasa = parseFloat(row.tempo_medio_casa_anos) || 1; // Evitar divisão por zero
      
      const maturidadeCarreira = tempoMedioCasa > 0 
        ? ((metasConcluidas + evolucoesPortfolio) / tempoMedioCasa) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          maturidade_carreira: parseFloat(maturidadeCarreira.toFixed(2)),
          detalhes: {
            metas_concluidas: metasConcluidas,
            evolucoes_portfolio: evolucoesPortfolio,
            tempo_medio_casa_anos: parseFloat(tempoMedioCasa.toFixed(2))
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Maturidade de Carreira:', error);
      return this.handleError(res, error, 'Erro ao calcular Maturidade de Carreira');
    } finally {
      client.release();
    }
  }

  // ========== APIs DE ÁRVORE DA VIDA ==========

  /**
   * Índice de Plenitude - Média dos pilares Plenitude, Felicidade e Realização
   * GET /api/relatorio-executivo/indice-plenitude/:id_cliente
   */
  async getIndicePlenitude(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Índice de Plenitude', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          AVG(plenitude_felicidade) as media_plenitude,
          AVG(realizacao_proposito) as media_realizacao
        FROM arvore_da_vida adv
        INNER JOIN usuarios u ON adv.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const plenitude = parseFloat(row.media_plenitude) || 0;
      const realizacao = parseFloat(row.media_realizacao) || 0;
      
      const indicePlenitude = (plenitude + realizacao) / 2;

      return res.status(200).json({
        success: true,
        data: {
          indice_plenitude: parseFloat(indicePlenitude.toFixed(2)),
          detalhes: {
            plenitude_felicidade: plenitude,
            realizacao_proposito: realizacao
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Índice de Plenitude:', error);
      return this.handleError(res, error, 'Erro ao calcular Índice de Plenitude');
    } finally {
      client.release();
    }
  }

  /**
   * Índice de Vitalidade - Média dos pilares Saúde, Equilíbrio Emocional e Energia
   * GET /api/relatorio-executivo/indice-vitalidade/:id_cliente
   */
  async getIndiceVitalidade(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Índice de Vitalidade', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          AVG(saude_disposicao) as media_saude,
          AVG(equilibrio_emocional) as media_equilibrio
        FROM arvore_da_vida adv
        INNER JOIN usuarios u ON adv.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const saude = parseFloat(row.media_saude) || 0;
      const equilibrio = parseFloat(row.media_equilibrio) || 0;
      
      // Como não temos um campo específico para energia, usamos saúde como proxy
      const indiceVitalidade = (saude + equilibrio + saude) / 3;

      return res.status(200).json({
        success: true,
        data: {
          indice_vitalidade: parseFloat(indiceVitalidade.toFixed(2)),
          detalhes: {
            saude_disposicao: saude,
            equilibrio_emocional: equilibrio,
            energia: saude // Usando saúde como proxy para energia
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Índice de Vitalidade:', error);
      return this.handleError(res, error, 'Erro ao calcular Índice de Vitalidade');
    } finally {
      client.release();
    }
  }

  /**
   * Índice de Propósito e Contribuição - Média de Espiritualidade + Contribuição Social
   * GET /api/relatorio-executivo/indice-proposito-contribuicao/:id_cliente
   */
  async getIndicePropositoContribuicao(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Índice de Propósito e Contribuição', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          AVG(espiritualidade) as media_espiritualidade,
          AVG(contribuicao_social) as media_contribuicao
        FROM arvore_da_vida adv
        INNER JOIN usuarios u ON adv.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const espiritualidade = parseFloat(row.media_espiritualidade) || 0;
      const contribuicao = parseFloat(row.media_contribuicao) || 0;
      
      const indicePropositoContribuicao = (espiritualidade + contribuicao) / 2;

      return res.status(200).json({
        success: true,
        data: {
          indice_proposito_contribuicao: parseFloat(indicePropositoContribuicao.toFixed(2)),
          detalhes: {
            espiritualidade: espiritualidade,
            contribuicao_social: contribuicao
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Índice de Propósito e Contribuição:', error);
      return this.handleError(res, error, 'Erro ao calcular Índice de Propósito e Contribuição');
    } finally {
      client.release();
    }
  }

  /**
   * Índice Profissional Global - Média de Profissional + Desenvolvimento Intelectual + Recursos Financeiros
   * GET /api/relatorio-executivo/indice-profissional-global/:id_cliente
   */
  async getIndiceProfissionalGlobal(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Índice Profissional Global', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          AVG(desenvolvimento_intelectual) as media_desenvolvimento,
          AVG(recursos_financeiros) as media_financeiros
        FROM arvore_da_vida adv
        INNER JOIN usuarios u ON adv.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const desenvolvimento = parseFloat(row.media_desenvolvimento) || 0;
      const financeiros = parseFloat(row.media_financeiros) || 0;
      
      // Como não temos um campo específico para "profissional", usamos desenvolvimento intelectual
      const indiceProfissionalGlobal = (desenvolvimento + desenvolvimento + financeiros) / 3;

      return res.status(200).json({
        success: true,
        data: {
          indice_profissional_global: parseFloat(indiceProfissionalGlobal.toFixed(2)),
          detalhes: {
            profissional: desenvolvimento, // Usando desenvolvimento como proxy
            desenvolvimento_intelectual: desenvolvimento,
            recursos_financeiros: financeiros
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Índice Profissional Global:', error);
      return this.handleError(res, error, 'Erro ao calcular Índice Profissional Global');
    } finally {
      client.release();
    }
  }

  // ========== APIs DE ANÁLISE SWOT ==========

  /**
   * Forças vs Fraquezas Ratio (FFR) - Nº de forças ÷ Nº de fraquezas
   * GET /api/relatorio-executivo/forcas-vs-fraquezas-ratio/:id_cliente
   */
  async getForcasVsFraquezasRatio(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Forças vs Fraquezas Ratio', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(CASE WHEN LOWER(cs.categoria) = 'forças' THEN 1 END) as total_forcas,
          COUNT(CASE WHEN LOWER(cs.categoria) = 'fraquezas' THEN 1 END) as total_fraquezas
        FROM analise_swot asw
        INNER JOIN categoria_swot cs ON asw.categoria_swot = cs.id
        INNER JOIN usuarios u ON asw.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const totalForcas = parseInt(row.total_forcas) || 0;
      const totalFraquezas = parseInt(row.total_fraquezas) || 0;
      
      const forcasVsFraquezasRatio = totalFraquezas > 0 
        ? (totalForcas / totalFraquezas) 
        : (totalForcas > 0 ? totalForcas : 0);

      return res.status(200).json({
        success: true,
        data: {
          forcas_vs_fraquezas_ratio: parseFloat(forcasVsFraquezasRatio.toFixed(2)),
          detalhes: {
            total_forcas: totalForcas,
            total_fraquezas: totalFraquezas
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Forças vs Fraquezas Ratio:', error);
      return this.handleError(res, error, 'Erro ao calcular Forças vs Fraquezas Ratio');
    } finally {
      client.release();
    }
  }

  /**
   * Oportunidades Aproveitadas (%) - Oportunidades transformadas em ações do PDI ÷ Total de oportunidades
   * GET /api/relatorio-executivo/oportunidades-aproveitadas/:id_cliente
   */
  async getOportunidadesAproveitadas(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Oportunidades Aproveitadas', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(DISTINCT CASE WHEN LOWER(cs.categoria) = 'oportunidades' THEN asw.id_usuario END) as usuarios_com_oportunidades,
          COUNT(DISTINCT CASE WHEN LOWER(cs.categoria) = 'oportunidades' AND mp.id IS NOT NULL THEN asw.id_usuario END) as usuarios_com_pdi
        FROM analise_swot asw
        INNER JOIN categoria_swot cs ON asw.categoria_swot = cs.id
        INNER JOIN usuarios u ON asw.id_usuario = u.id
        LEFT JOIN metas_pdi mp ON u.id = mp.id_usuario
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const usuariosComOportunidades = parseInt(row.usuarios_com_oportunidades) || 0;
      const usuariosComPDI = parseInt(row.usuarios_com_pdi) || 0;
      
      const oportunidadesAproveitadas = usuariosComOportunidades > 0 
        ? ((usuariosComPDI / usuariosComOportunidades) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          oportunidades_aproveitadas: parseFloat(oportunidadesAproveitadas.toFixed(2)),
          detalhes: {
            usuarios_com_oportunidades: usuariosComOportunidades,
            usuarios_com_pdi: usuariosComPDI
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Oportunidades Aproveitadas:', error);
      return this.handleError(res, error, 'Erro ao calcular Oportunidades Aproveitadas');
    } finally {
      client.release();
    }
  }

  /**
   * Ameaças Monitoradas (%) - Ameaças com plano mitigado ÷ Total de ameaças
   * GET /api/relatorio-executivo/ameacas-monitoradas/:id_cliente
   */
  async getAmeacasMonitoradas(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Ameaças Monitoradas', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(CASE WHEN LOWER(cs.categoria) = 'ameaças' THEN 1 END) as total_ameacas,
          COUNT(CASE WHEN LOWER(cs.categoria) = 'ameaças' AND mp.id IS NOT NULL THEN 1 END) as ameacas_com_plano
        FROM analise_swot asw
        INNER JOIN categoria_swot cs ON asw.categoria_swot = cs.id
        INNER JOIN usuarios u ON asw.id_usuario = u.id
        LEFT JOIN metas_pdi mp ON u.id = mp.id_usuario
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const totalAmeacas = parseInt(row.total_ameacas) || 0;
      const ameacasComPlano = parseInt(row.ameacas_com_plano) || 0;
      
      const ameacasMonitoradas = totalAmeacas > 0 
        ? ((ameacasComPlano / totalAmeacas) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          ameacas_monitoradas: parseFloat(ameacasMonitoradas.toFixed(2)),
          detalhes: {
            total_ameacas: totalAmeacas,
            ameacas_com_plano: ameacasComPlano
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Ameaças Monitoradas:', error);
      return this.handleError(res, error, 'Erro ao calcular Ameaças Monitoradas');
    } finally {
      client.release();
    }
  }

  // ========== APIs DE PDI ==========

  /**
   * Progresso Médio do PDI - % de atividades concluídas
   * GET /api/relatorio-executivo/progresso-medio-pdi/:id_cliente
   */
  async getProgressoMedioPDI(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Progresso Médio do PDI', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(CASE WHEN ap.status_atividade = 'Concluída' THEN 1 END) as atividades_concluidas,
          COUNT(ap.id) as total_atividades
        FROM atividades_pdi ap
        INNER JOIN metas_pdi mp ON ap.id_meta_pdi = mp.id
        INNER JOIN usuarios u ON mp.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const atividadesConcluidas = parseInt(row.atividades_concluidas) || 0;
      const totalAtividades = parseInt(row.total_atividades) || 0;
      
      const progressoMedioPDI = totalAtividades > 0 
        ? ((atividadesConcluidas / totalAtividades) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          progresso_medio_pdi: parseFloat(progressoMedioPDI.toFixed(2)),
          detalhes: {
            atividades_concluidas: atividadesConcluidas,
            total_atividades: totalAtividades
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Progresso Médio do PDI:', error);
      return this.handleError(res, error, 'Erro ao calcular Progresso Médio do PDI');
    } finally {
      client.release();
    }
  }

  /**
   * Taxa de Metas em Progresso - Metas "em andamento" ÷ Total de metas
   * GET /api/relatorio-executivo/taxa-metas-progresso/:id_cliente
   */
  async getTaxaMetasProgresso(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Taxa de Metas em Progresso', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(CASE WHEN LOWER(mp.status) LIKE '%andamento%' OR LOWER(mp.status) = 'em progresso' THEN 1 END) as metas_em_andamento,
          COUNT(mp.id) as total_metas
        FROM metas_pdi mp
        INNER JOIN usuarios u ON mp.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const metasEmAndamento = parseInt(row.metas_em_andamento) || 0;
      const totalMetas = parseInt(row.total_metas) || 0;
      
      const taxaMetasProgresso = totalMetas > 0 
        ? ((metasEmAndamento / totalMetas) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          taxa_metas_progresso: parseFloat(taxaMetasProgresso.toFixed(2)),
          detalhes: {
            metas_em_andamento: metasEmAndamento,
            total_metas: totalMetas
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Taxa de Metas em Progresso:', error);
      return this.handleError(res, error, 'Erro ao calcular Taxa de Metas em Progresso');
    } finally {
      client.release();
    }
  }

  /**
   * Aderência ao Prazo - Metas dentro do prazo ÷ Total de metas
   * GET /api/relatorio-executivo/aderencia-prazo/:id_cliente
   */
  async getAderenciaPrazo(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Aderência ao Prazo', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(CASE WHEN mp.prazo >= CURRENT_DATE THEN 1 END) as metas_no_prazo,
          COUNT(mp.id) as total_metas
        FROM metas_pdi mp
        INNER JOIN usuarios u ON mp.id_usuario = u.id
        WHERE u.id_cliente = $1 AND mp.prazo IS NOT NULL
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const metasNoPrazo = parseInt(row.metas_no_prazo) || 0;
      const totalMetas = parseInt(row.total_metas) || 0;
      
      const aderenciaPrazo = totalMetas > 0 
        ? ((metasNoPrazo / totalMetas) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          aderencia_prazo: parseFloat(aderenciaPrazo.toFixed(2)),
          detalhes: {
            metas_no_prazo: metasNoPrazo,
            total_metas: totalMetas
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Aderência ao Prazo:', error);
      return this.handleError(res, error, 'Erro ao calcular Aderência ao Prazo');
    } finally {
      client.release();
    }
  }

  /**
   * Engajamento com Mentoria - Participações em mentorias ÷ Colaboradores ativos
   * GET /api/relatorio-executivo/engajamento-mentoria/:id_cliente
   */
  async getEngajamentoMentoria(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Engajamento com Mentoria', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(DISTINCT pep.id_usuario) as usuarios_com_mentoria,
          COUNT(DISTINCT u.id) as colaboradores_ativos
        FROM usuarios u
        LEFT JOIN pessoas_envolvidas_pdi pep ON u.id = pep.id_usuario
        LEFT JOIN metas_pdi mp ON pep.id_meta_pdi = mp.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const usuariosComMentoria = parseInt(row.usuarios_com_mentoria) || 0;
      const colaboradoresAtivos = parseInt(row.colaboradores_ativos) || 0;
      
      const engajamentoMentoria = colaboradoresAtivos > 0 
        ? ((usuariosComMentoria / colaboradoresAtivos) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          engajamento_mentoria: parseFloat(engajamentoMentoria.toFixed(2)),
          detalhes: {
            usuarios_com_mentoria: usuariosComMentoria,
            colaboradores_ativos: colaboradoresAtivos
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Engajamento com Mentoria:', error);
      return this.handleError(res, error, 'Erro ao calcular Engajamento com Mentoria');
    } finally {
      client.release();
    }
  }

  // ========== APIs DE PORTFÓLIO ==========

  /**
   * Taxa de Atualização do Portfólio - Colaboradores com experiências registradas nos últimos 90 dias ÷ Total
   * GET /api/relatorio-executivo/taxa-atualizacao-portfolio/:id_cliente
   */
  async getTaxaAtualizacaoPortfolio(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Taxa de Atualização do Portfólio', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(DISTINCT CASE WHEN ep.created_at >= NOW() - INTERVAL '90 days' THEN ep.id_usuario END) as usuarios_atualizados,
          COUNT(DISTINCT u.id) as total_colaboradores
        FROM usuarios u
        LEFT JOIN experiencia_portifolio ep ON u.id = ep.id_usuario
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const usuariosAtualizados = parseInt(row.usuarios_atualizados) || 0;
      const totalColaboradores = parseInt(row.total_colaboradores) || 0;
      
      const taxaAtualizacaoPortfolio = totalColaboradores > 0 
        ? ((usuariosAtualizados / totalColaboradores) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          taxa_atualizacao_portfolio: parseFloat(taxaAtualizacaoPortfolio.toFixed(2)),
          detalhes: {
            usuarios_atualizados: usuariosAtualizados,
            total_colaboradores: totalColaboradores
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Taxa de Atualização do Portfólio:', error);
      return this.handleError(res, error, 'Erro ao calcular Taxa de Atualização do Portfólio');
    } finally {
      client.release();
    }
  }

  /**
   * Índice de Feedbacks Positivos - Feedbacks positivos ÷ Total de feedbacks
   * GET /api/relatorio-executivo/indice-feedbacks-positivos/:id_cliente
   */
  async getIndiceFeedbacksPositivos(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Índice de Feedbacks Positivos', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(CASE WHEN LOWER(fp.feedback) LIKE '%positiv%' OR LOWER(fp.feedback) LIKE '%excelent%' OR LOWER(fp.feedback) LIKE '%ótim%' OR LOWER(fp.feedback) LIKE '%bom%' THEN 1 END) as feedbacks_positivos,
          COUNT(fp.id) as total_feedbacks
        FROM feedbacks_portifolio fp
        INNER JOIN experiencia_portifolio ep ON fp.id_experiencia_portifolio = ep.id
        INNER JOIN usuarios u ON ep.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const feedbacksPositivos = parseInt(row.feedbacks_positivos) || 0;
      const totalFeedbacks = parseInt(row.total_feedbacks) || 0;
      
      const indiceFeedbacksPositivos = totalFeedbacks > 0 
        ? ((feedbacksPositivos / totalFeedbacks) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          indice_feedbacks_positivos: parseFloat(indiceFeedbacksPositivos.toFixed(2)),
          detalhes: {
            feedbacks_positivos: feedbacksPositivos,
            total_feedbacks: totalFeedbacks
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Índice de Feedbacks Positivos:', error);
      return this.handleError(res, error, 'Erro ao calcular Índice de Feedbacks Positivos');
    } finally {
      client.release();
    }
  }

  /**
   * Conquistas Validadas (%) - Experiências com evidências comprovadas ÷ Total
   * GET /api/relatorio-executivo/conquistas-validadas/:id_cliente
   */
  async getConquistasValidadas(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Conquistas Validadas', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(DISTINCT CASE WHEN lp.id IS NOT NULL THEN ep.id END) as experiencias_com_evidencias,
          COUNT(DISTINCT ep.id) as total_experiencias
        FROM experiencia_portifolio ep
        INNER JOIN usuarios u ON ep.id_usuario = u.id
        LEFT JOIN links_portifolio lp ON ep.id = lp.id_experiencia_portifolio
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const experienciasComEvidencias = parseInt(row.experiencias_com_evidencias) || 0;
      const totalExperiencias = parseInt(row.total_experiencias) || 0;
      
      const conquistasValidadas = totalExperiencias > 0 
        ? ((experienciasComEvidencias / totalExperiencias) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          conquistas_validadas: parseFloat(conquistasValidadas.toFixed(2)),
          detalhes: {
            experiencias_com_evidencias: experienciasComEvidencias,
            total_experiencias: totalExperiencias
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Conquistas Validadas:', error);
      return this.handleError(res, error, 'Erro ao calcular Conquistas Validadas');
    } finally {
      client.release();
    }
  }

  /**
   * Ações de Melhoria - Média de ações registradas por colaborador
   * GET /api/relatorio-executivo/acoes-melhoria/:id_cliente
   */
  async getAcoesMelhoria(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Ações de Melhoria', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(DISTINCT ep.id) as total_experiencias,
          COUNT(DISTINCT u.id) as colaboradores_ativos
        FROM usuarios u
        LEFT JOIN experiencia_portifolio ep ON u.id = ep.id_usuario
        WHERE u.id_cliente = $1 
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const totalExperiencias = parseInt(row.total_experiencias) || 0;
      const colaboradoresAtivos = parseInt(row.colaboradores_ativos) || 0;
      
      const acoesMelhoria = colaboradoresAtivos > 0 
        ? (totalExperiencias / colaboradoresAtivos) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          acoes_melhoria: parseFloat(acoesMelhoria.toFixed(2)),
          detalhes: {
            total_experiencias: totalExperiencias,
            colaboradores_ativos: colaboradoresAtivos
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Ações de Melhoria:', error);
      return this.handleError(res, error, 'Erro ao calcular Ações de Melhoria');
    } finally {
      client.release();
    }
  }

  // ========== APIs DE PROGRAMA DE RECONHECIMENTO ==========

  /**
   * Reconhecimentos por Colaborador - Total de reconhecimentos ÷ Total de colaboradores
   * GET /api/relatorio-executivo/reconhecimentos-por-colaborador/:id_cliente
   */
  async getReconhecimentosPorColaborador(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Reconhecimentos por Colaborador', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          COUNT(r.id) as total_reconhecimentos,
          COUNT(DISTINCT u.id) as total_colaboradores
        FROM usuarios u
        LEFT JOIN reconhecimento r ON u.id = r.id_usuario_reconhecido
        WHERE u.id_cliente = $1 
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const totalReconhecimentos = parseInt(row.total_reconhecimentos) || 0;
      const totalColaboradores = parseInt(row.total_colaboradores) || 0;
      
      const reconhecimentosPorColaborador = totalColaboradores > 0 
        ? (totalReconhecimentos / totalColaboradores) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          reconhecimentos_por_colaborador: parseFloat(reconhecimentosPorColaborador.toFixed(2)),
          detalhes: {
            total_reconhecimentos: totalReconhecimentos,
            total_colaboradores: totalColaboradores
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Reconhecimentos por Colaborador:', error);
      return this.handleError(res, error, 'Erro ao calcular Reconhecimentos por Colaborador');
    } finally {
      client.release();
    }
  }

  /**
   * Top Skills Reconhecidas - Habilidades mais citadas nos reconhecimentos
   * GET /api/relatorio-executivo/top-skills-reconhecidas/:id_cliente
   */
  async getTopSkillsReconhecidas(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Top Skills Reconhecidas', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          r.motivo_reconhecimento,
          COUNT(*) as frequencia
        FROM reconhecimento r
        INNER JOIN usuarios u ON r.id_usuario_reconhecido = u.id
        WHERE u.id_cliente = $1 AND r.motivo_reconhecimento IS NOT NULL
        GROUP BY r.motivo_reconhecimento
        ORDER BY frequencia DESC
        LIMIT 10
      `;

      const result = await client.query(query, [id_cliente]);

      const topSkills = result.rows.map(row => ({
        skill: row.motivo_reconhecimento,
        frequencia: parseInt(row.frequencia)
      }));

      return res.status(200).json({
        success: true,
        data: {
          top_skills_reconhecidas: topSkills
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Top Skills Reconhecidas:', error);
      return this.handleError(res, error, 'Erro ao calcular Top Skills Reconhecidas');
    } finally {
      client.release();
    }
  }

  /**
   * Tempo Médio entre Reconhecimentos - Dias médios entre reconhecimentos por colaborador
   * GET /api/relatorio-executivo/tempo-medio-entre-reconhecimentos/:id_cliente
   */
  async getTempoMedioEntreReconhecimentos(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Tempo Médio entre Reconhecimentos', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        WITH reconhecimentos_ordenados AS (
          SELECT 
            r.id_usuario_reconhecido,
            r.created_at,
            LAG(r.created_at) OVER (PARTITION BY r.id_usuario_reconhecido ORDER BY r.created_at) as reconhecimento_anterior
          FROM reconhecimento r
          INNER JOIN usuarios u ON r.id_usuario_reconhecido = u.id
          WHERE u.id_cliente = $1
        )
        SELECT 
          AVG(EXTRACT(EPOCH FROM (created_at - reconhecimento_anterior)) / (24 * 60 * 60)) as tempo_medio_dias
        FROM reconhecimentos_ordenados
        WHERE reconhecimento_anterior IS NOT NULL
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const tempoMedioDias = parseFloat(row.tempo_medio_dias) || 0;

      return res.status(200).json({
        success: true,
        data: {
          tempo_medio_entre_reconhecimentos: parseFloat(tempoMedioDias.toFixed(2))
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Tempo Médio entre Reconhecimentos:', error);
      return this.handleError(res, error, 'Erro ao calcular Tempo Médio entre Reconhecimentos');
    } finally {
      client.release();
    }
  }

  /**
   * Distribuição de Reconhecimento por Área - Percentual por departamento
   * GET /api/relatorio-executivo/distribuicao-reconhecimento-por-area/:id_cliente
   */
  async getDistribuicaoReconhecimentoPorArea(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Distribuição de Reconhecimento por Área', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          d.titulo_departamento,
          COUNT(r.id) as total_reconhecimentos,
          COUNT(DISTINCT u.id) as colaboradores_departamento,
          ROUND((COUNT(r.id) * 100.0 / SUM(COUNT(r.id)) OVER()), 2) as percentual
        FROM reconhecimento r
        INNER JOIN usuarios u ON r.id_usuario_reconhecido = u.id
        INNER JOIN departamento d ON u.id_departamento = d.id
        WHERE u.id_cliente = $1
        GROUP BY d.titulo_departamento, d.id
        ORDER BY total_reconhecimentos DESC
      `;

      const result = await client.query(query, [id_cliente]);

      const distribuicaoPorArea = result.rows.map(row => ({
        departamento: row.titulo_departamento,
        total_reconhecimentos: parseInt(row.total_reconhecimentos),
        colaboradores_departamento: parseInt(row.colaboradores_departamento),
        percentual: parseFloat(row.percentual)
      }));

      return res.status(200).json({
        success: true,
        data: {
          distribuicao_reconhecimento_por_area: distribuicaoPorArea
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Distribuição de Reconhecimento por Área:', error);
      return this.handleError(res, error, 'Erro ao calcular Distribuição de Reconhecimento por Área');
    } finally {
      client.release();
    }
  }

  // ========== KPIs DE TENDÊNCIA ==========

  /**
   * Índice de Reconhecimento Recíproco - Reconhecimentos dados e recebidos por par
   * GET /api/relatorio-executivo/indice-reconhecimento-reciproco/:id_cliente
   */
  async getIndiceReconhecimentoReciproco(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Índice de Reconhecimento Recíproco', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        WITH reconhecimentos_bidirecionais AS (
          SELECT 
            r1.id_usuario_reconhecido as usuario_a,
            r1.id_usuario_reconheceu as usuario_b,
            COUNT(*) as reconhecimentos_ab,
            (SELECT COUNT(*) 
             FROM reconhecimento r2 
             WHERE r2.id_usuario_reconhecido = r1.id_usuario_reconheceu 
             AND r2.id_usuario_reconheceu = r1.id_usuario_reconhecido) as reconhecimentos_ba
          FROM reconhecimento r1
          INNER JOIN usuarios u1 ON r1.id_usuario_reconhecido = u1.id
          INNER JOIN usuarios u2 ON r1.id_usuario_reconheceu = u2.id
          WHERE u1.id_cliente = $1 AND u2.id_cliente = $1
          GROUP BY r1.id_usuario_reconhecido, r1.id_usuario_reconheceu
        )
        SELECT 
          COUNT(CASE WHEN reconhecimentos_ab > 0 AND reconhecimentos_ba > 0 THEN 1 END) as pares_reciprocos,
          COUNT(*) as total_pares
        FROM reconhecimentos_bidirecionais
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const paresReciprocos = parseInt(row.pares_reciprocos) || 0;
      const totalPares = parseInt(row.total_pares) || 0;
      
      const indiceReconhecimentoReciproco = totalPares > 0 
        ? ((paresReciprocos / totalPares) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          indice_reconhecimento_reciproco: parseFloat(indiceReconhecimentoReciproco.toFixed(2)),
          detalhes: {
            pares_reciprocos: paresReciprocos,
            total_pares: totalPares
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Índice de Reconhecimento Recíproco:', error);
      return this.handleError(res, error, 'Erro ao calcular Índice de Reconhecimento Recíproco');
    } finally {
      client.release();
    }
  }

  /**
   * Índice de Bem-Estar Organizacional - Média de Plenitude + Saúde + Equilíbrio emocional
   * GET /api/relatorio-executivo/indice-bem-estar-organizacional/:id_cliente
   */
  async getIndiceBemEstarOrganizacional(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Índice de Bem-Estar Organizacional', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          AVG(plenitude_felicidade) as media_plenitude,
          AVG(saude_disposicao) as media_saude,
          AVG(equilibrio_emocional) as media_equilibrio
        FROM arvore_da_vida adv
        INNER JOIN usuarios u ON adv.id_usuario = u.id
        WHERE u.id_cliente = $1
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const plenitude = parseFloat(row.media_plenitude) || 0;
      const saude = parseFloat(row.media_saude) || 0;
      const equilibrio = parseFloat(row.media_equilibrio) || 0;
      
      const indiceBemEstarOrganizacional = (plenitude + saude + equilibrio) / 3;

      return res.status(200).json({
        success: true,
        data: {
          indice_bem_estar_organizacional: parseFloat(indiceBemEstarOrganizacional.toFixed(2)),
          detalhes: {
            plenitude_felicidade: plenitude,
            saude_disposicao: saude,
            equilibrio_emocional: equilibrio
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Índice de Bem-Estar Organizacional:', error);
      return this.handleError(res, error, 'Erro ao calcular Índice de Bem-Estar Organizacional');
    } finally {
      client.release();
    }
  }

  /**
   * Tempo Médio de Evolução de Meta - Dias até conclusão de metas
   * GET /api/relatorio-executivo/tempo-medio-evolucao-meta/:id_cliente
   */
  async getTempoMedioEvolucaoMeta(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Calculando Tempo Médio de Evolução de Meta', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      const query = `
        SELECT 
          AVG(EXTRACT(EPOCH FROM (mp.created_at - mp.created_at)) / (24 * 60 * 60)) as tempo_medio_dias
        FROM metas_pdi mp
        INNER JOIN usuarios u ON mp.id_usuario = u.id
        WHERE u.id_cliente = $1 
        AND mp.status = 'Concluída' 
        AND mp.created_at IS NOT NULL
      `;

      const result = await client.query(query, [id_cliente]);
      const row = result.rows[0];

      const tempoMedioDias = parseFloat(row.tempo_medio_dias) || 0;

      return res.status(200).json({
        success: true,
        data: {
          tempo_medio_evolucao_meta: parseFloat(tempoMedioDias.toFixed(2))
        }
      });

    } catch (error) {
      logger.error('Erro ao calcular Tempo Médio de Evolução de Meta:', error);
      return this.handleError(res, error, 'Erro ao calcular Tempo Médio de Evolução de Meta');
    } finally {
      client.release();
    }
  }

  // ========== APIs DE GERAÇÃO DE RELATÓRIOS ==========

  /**
   * Método auxiliar para coletar todos os dados do relatório
   */
  async coletarTodosOsDados(id_cliente) {
    const client = await pool.connect();
    try {
      logger.info('Coletando todos os dados para o relatório', { id_cliente });

      // Executar todas as APIs em paralelo para melhor performance
      const [
        dadosVisaoGeral,
        dadosArvoreDaVida,
        dadosAnaliseSwot,
        dadosPDI,
        dadosPortfolio,
        dadosReconhecimento,
        dadosTendencia
      ] = await Promise.all([
        this.coletarDadosVisaoGeral(client, id_cliente),
        this.coletarDadosArvoreDaVida(client, id_cliente),
        this.coletarDadosAnaliseSwot(client, id_cliente),
        this.coletarDadosPDI(client, id_cliente),
        this.coletarDadosPortfolio(client, id_cliente),
        this.coletarDadosReconhecimento(client, id_cliente),
        this.coletarDadosTendencia(client, id_cliente)
      ]);

      return {
        visao_geral: dadosVisaoGeral,
        arvore_da_vida: dadosArvoreDaVida,
        analise_swot: dadosAnaliseSwot,
        pdi: dadosPDI,
        portfolio: dadosPortfolio,
        reconhecimento: dadosReconhecimento,
        tendencia: dadosTendencia,
        data_geracao: new Date().toLocaleString('pt-BR'),
        id_cliente: id_cliente
      };

    } catch (error) {
      logger.error('Erro ao coletar dados do relatório:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Coletar dados de visão geral
   */
  async coletarDadosVisaoGeral(client, id_cliente) {
    const queries = [
      // IEG
      `SELECT 
        AVG(pontuacao_geral) as media_pontuacao_geral,
        AVG(criatividade_hobbie) as media_criatividade,
        AVG(plenitude_felicidade) as media_plenitude,
        AVG(espiritualidade) as media_espiritualidade,
        AVG(saude_disposicao) as media_saude,
        AVG(desenvolvimento_intelectual) as media_desenvolvimento,
        AVG(equilibrio_emocional) as media_equilibrio,
        AVG(familia) as media_familia,
        AVG(desenvolvimento_amoroso) as media_amoroso,
        AVG(vida_social) as media_social,
        AVG(realizacao_proposito) as media_realizacao,
        AVG(recursos_financeiros) as media_financeiros,
        AVG(contribuicao_social) as media_contribuicao
      FROM arvore_da_vida adv
      INNER JOIN usuarios u ON adv.id_usuario = u.id
      WHERE u.id_cliente = $1`,
      
      // TED
      `SELECT 
        COUNT(CASE WHEN ap.status_atividade = 'Concluída' THEN 1 END) as atividades_concluidas,
        COUNT(ap.id) as total_atividades
      FROM atividades_pdi ap
      INNER JOIN metas_pdi mp ON ap.id_meta_pdi = mp.id
      INNER JOIN usuarios u ON mp.id_usuario = u.id
      WHERE u.id_cliente = $1`,
      
      // NMR
      `SELECT 
        COUNT(r.id) as total_reconhecimentos,
        COUNT(DISTINCT u.id) as colaboradores_ativos
      FROM usuarios u
      LEFT JOIN reconhecimento r ON (u.id = r.id_usuario_reconhecido OR u.id = r.id_usuario_reconheceu)
      WHERE u.id_cliente = $1`,
      
      // ISI
      `SELECT 
        COUNT(CASE WHEN LOWER(fp.feedback) LIKE '%positiv%' OR LOWER(fp.feedback) LIKE '%excelent%' OR LOWER(fp.feedback) LIKE '%ótim%' THEN 1 END) as feedbacks_positivos,
        COUNT(fp.id) as total_feedbacks
      FROM feedbacks_portifolio fp
      INNER JOIN experiencia_portifolio ep ON fp.id_experiencia_portifolio = ep.id
      INNER JOIN usuarios u ON ep.id_usuario = u.id
      WHERE u.id_cliente = $1`,
      
      // MC
      `SELECT 
        (SELECT COUNT(*) FROM metas_pdi mp WHERE mp.id_usuario IN (SELECT id FROM usuarios WHERE id_cliente = $1) AND mp.status = 'Concluída') as metas_concluidas,
        (SELECT COUNT(*) FROM experiencia_portifolio ep WHERE ep.id_usuario IN (SELECT id FROM usuarios WHERE id_cliente = $1)) as evolucoes_portfolio,
        AVG(EXTRACT(EPOCH FROM (NOW() - u.created_at)) / (365.25 * 24 * 60 * 60)) as tempo_medio_casa_anos
      FROM usuarios u
      WHERE u.id_cliente = $1`
    ];

    const results = await Promise.all(queries.map(query => client.query(query, [id_cliente])));
    
    const [ieg, ted, nmr, isi, mc] = results.map(r => r.rows[0]);
    
    // Calcular IEG
    const pilares = [
      parseFloat(ieg.media_criatividade) || 0,
      parseFloat(ieg.media_plenitude) || 0,
      parseFloat(ieg.media_espiritualidade) || 0,
      parseFloat(ieg.media_saude) || 0,
      parseFloat(ieg.media_desenvolvimento) || 0,
      parseFloat(ieg.media_equilibrio) || 0,
      parseFloat(ieg.media_familia) || 0,
      parseFloat(ieg.media_amoroso) || 0,
      parseFloat(ieg.media_social) || 0,
      parseFloat(ieg.media_realizacao) || 0,
      parseFloat(ieg.media_financeiros) || 0,
      parseFloat(ieg.media_contribuicao) || 0
    ];
    const indiceEngajamentoGeral = pilares.reduce((sum, valor) => sum + valor, 0) / pilares.length;

    return {
      indice_engajamento_geral: parseFloat(indiceEngajamentoGeral.toFixed(2)),
      taxa_evolucao_desenvolvimento: ted.total_atividades > 0 ? parseFloat(((parseInt(ted.atividades_concluidas) / parseInt(ted.total_atividades)) * 100).toFixed(2)) : 0,
      nivel_medio_reconhecimento: parseInt(nmr.colaboradores_ativos) > 0 ? parseFloat((parseInt(nmr.total_reconhecimentos) / parseInt(nmr.colaboradores_ativos)).toFixed(2)) : 0,
      indice_satisfacao_interna: parseInt(isi.total_feedbacks) > 0 ? parseFloat(((parseInt(isi.feedbacks_positivos) / parseInt(isi.total_feedbacks)) * 100).toFixed(2)) : 0,
      maturidade_carreira: parseFloat(mc.tempo_medio_casa_anos) > 0 ? parseFloat(((parseInt(mc.metas_concluidas) + parseInt(mc.evolucoes_portfolio)) / parseFloat(mc.tempo_medio_casa_anos)).toFixed(2)) : 0
    };
  }

  /**
   * Coletar dados de árvore da vida
   */
  async coletarDadosArvoreDaVida(client, id_cliente) {
    const query = `
      SELECT 
        AVG(plenitude_felicidade) as media_plenitude,
        AVG(realizacao_proposito) as media_realizacao,
        AVG(saude_disposicao) as media_saude,
        AVG(equilibrio_emocional) as media_equilibrio,
        AVG(espiritualidade) as media_espiritualidade,
        AVG(contribuicao_social) as media_contribuicao,
        AVG(desenvolvimento_intelectual) as media_desenvolvimento,
        AVG(recursos_financeiros) as media_financeiros
      FROM arvore_da_vida adv
      INNER JOIN usuarios u ON adv.id_usuario = u.id
      WHERE u.id_cliente = $1
    `;

    const result = await client.query(query, [id_cliente]);
    const row = result.rows[0];

    const plenitude = parseFloat(row.media_plenitude) || 0;
    const realizacao = parseFloat(row.media_realizacao) || 0;
    const saude = parseFloat(row.media_saude) || 0;
    const equilibrio = parseFloat(row.media_equilibrio) || 0;
    const espiritualidade = parseFloat(row.media_espiritualidade) || 0;
    const contribuicao = parseFloat(row.media_contribuicao) || 0;
    const desenvolvimento = parseFloat(row.media_desenvolvimento) || 0;
    const financeiros = parseFloat(row.media_financeiros) || 0;

    return {
      indice_plenitude: parseFloat(((plenitude + realizacao) / 2).toFixed(2)),
      indice_vitalidade: parseFloat(((saude + equilibrio + saude) / 3).toFixed(2)),
      indice_proposito_contribuicao: parseFloat(((espiritualidade + contribuicao) / 2).toFixed(2)),
      indice_profissional_global: parseFloat(((desenvolvimento + desenvolvimento + financeiros) / 3).toFixed(2))
    };
  }

  /**
   * Coletar dados de análise SWOT
   */
  async coletarDadosAnaliseSwot(client, id_cliente) {
    const query = `
      SELECT 
        COUNT(CASE WHEN LOWER(cs.categoria) = 'forças' THEN 1 END) as total_forcas,
        COUNT(CASE WHEN LOWER(cs.categoria) = 'fraquezas' THEN 1 END) as total_fraquezas,
        COUNT(DISTINCT CASE WHEN LOWER(cs.categoria) = 'oportunidades' THEN asw.id_usuario END) as usuarios_com_oportunidades,
        COUNT(DISTINCT CASE WHEN LOWER(cs.categoria) = 'oportunidades' AND mp.id IS NOT NULL THEN asw.id_usuario END) as usuarios_com_pdi,
        COUNT(CASE WHEN LOWER(cs.categoria) = 'ameaças' THEN 1 END) as total_ameacas,
        COUNT(CASE WHEN LOWER(cs.categoria) = 'ameaças' AND mp.id IS NOT NULL THEN 1 END) as ameacas_com_plano
      FROM analise_swot asw
      INNER JOIN categoria_swot cs ON asw.categoria_swot = cs.id
      INNER JOIN usuarios u ON asw.id_usuario = u.id
      LEFT JOIN metas_pdi mp ON u.id = mp.id_usuario
      WHERE u.id_cliente = $1
    `;

    const result = await client.query(query, [id_cliente]);
    const row = result.rows[0];

    const totalForcas = parseInt(row.total_forcas) || 0;
    const totalFraquezas = parseInt(row.total_fraquezas) || 0;
    const usuariosComOportunidades = parseInt(row.usuarios_com_oportunidades) || 0;
    const usuariosComPDI = parseInt(row.usuarios_com_pdi) || 0;
    const totalAmeacas = parseInt(row.total_ameacas) || 0;
    const ameacasComPlano = parseInt(row.ameacas_com_plano) || 0;

    return {
      forcas_vs_fraquezas_ratio: totalFraquezas > 0 ? parseFloat((totalForcas / totalFraquezas).toFixed(2)) : (totalForcas > 0 ? totalForcas : 0),
      oportunidades_aproveitadas: usuariosComOportunidades > 0 ? parseFloat(((usuariosComPDI / usuariosComOportunidades) * 100).toFixed(2)) : 0,
      ameacas_monitoradas: totalAmeacas > 0 ? parseFloat(((ameacasComPlano / totalAmeacas) * 100).toFixed(2)) : 0
    };
  }

  /**
   * Coletar dados de PDI
   */
  async coletarDadosPDI(client, id_cliente) {
    const queries = [
      `SELECT 
        COUNT(CASE WHEN ap.status_atividade = 'Concluída' THEN 1 END) as atividades_concluidas,
        COUNT(ap.id) as total_atividades
      FROM atividades_pdi ap
      INNER JOIN metas_pdi mp ON ap.id_meta_pdi = mp.id
      INNER JOIN usuarios u ON mp.id_usuario = u.id
      WHERE u.id_cliente = $1`,
      
      `SELECT 
        COUNT(CASE WHEN LOWER(mp.status) LIKE '%andamento%' OR LOWER(mp.status) = 'em progresso' THEN 1 END) as metas_em_andamento,
        COUNT(mp.id) as total_metas
      FROM metas_pdi mp
      INNER JOIN usuarios u ON mp.id_usuario = u.id
      WHERE u.id_cliente = $1`,
      
      `SELECT 
        COUNT(CASE WHEN mp.prazo >= CURRENT_DATE THEN 1 END) as metas_no_prazo,
        COUNT(mp.id) as total_metas
      FROM metas_pdi mp
      INNER JOIN usuarios u ON mp.id_usuario = u.id
      WHERE u.id_cliente = $1 AND mp.prazo IS NOT NULL`,
      
      `SELECT 
        COUNT(DISTINCT pep.id_usuario) as usuarios_com_mentoria,
        COUNT(DISTINCT u.id) as colaboradores_ativos
      FROM usuarios u
      LEFT JOIN pessoas_envolvidas_pdi pep ON u.id = pep.id_usuario
      LEFT JOIN metas_pdi mp ON pep.id_meta_pdi = mp.id
      WHERE u.id_cliente = $1`
    ];

    const results = await Promise.all(queries.map(query => client.query(query, [id_cliente])));
    const [progresso, taxa, aderencia, engajamento] = results.map(r => r.rows[0]);

    return {
      progresso_medio_pdi: parseInt(progresso.total_atividades) > 0 ? parseFloat(((parseInt(progresso.atividades_concluidas) / parseInt(progresso.total_atividades)) * 100).toFixed(2)) : 0,
      taxa_metas_progresso: parseInt(taxa.total_metas) > 0 ? parseFloat(((parseInt(taxa.metas_em_andamento) / parseInt(taxa.total_metas)) * 100).toFixed(2)) : 0,
      aderencia_prazo: parseInt(aderencia.total_metas) > 0 ? parseFloat(((parseInt(aderencia.metas_no_prazo) / parseInt(aderencia.total_metas)) * 100).toFixed(2)) : 0,
      engajamento_mentoria: parseInt(engajamento.colaboradores_ativos) > 0 ? parseFloat(((parseInt(engajamento.usuarios_com_mentoria) / parseInt(engajamento.colaboradores_ativos)) * 100).toFixed(2)) : 0
    };
  }

  /**
   * Coletar dados de portfólio
   */
  async coletarDadosPortfolio(client, id_cliente) {
    const queries = [
      `SELECT 
        COUNT(DISTINCT CASE WHEN ep.created_at >= NOW() - INTERVAL '90 days' THEN ep.id_usuario END) as usuarios_atualizados,
        COUNT(DISTINCT u.id) as total_colaboradores
      FROM usuarios u
      LEFT JOIN experiencia_portifolio ep ON u.id = ep.id_usuario
      WHERE u.id_cliente = $1`,
      
      `SELECT 
        COUNT(CASE WHEN LOWER(fp.feedback) LIKE '%positiv%' OR LOWER(fp.feedback) LIKE '%excelent%' OR LOWER(fp.feedback) LIKE '%ótim%' OR LOWER(fp.feedback) LIKE '%bom%' THEN 1 END) as feedbacks_positivos,
        COUNT(fp.id) as total_feedbacks
      FROM feedbacks_portifolio fp
      INNER JOIN experiencia_portifolio ep ON fp.id_experiencia_portifolio = ep.id
      INNER JOIN usuarios u ON ep.id_usuario = u.id
      WHERE u.id_cliente = $1`,
      
      `SELECT 
        COUNT(DISTINCT CASE WHEN lp.id IS NOT NULL THEN ep.id END) as experiencias_com_evidencias,
        COUNT(DISTINCT ep.id) as total_experiencias
      FROM experiencia_portifolio ep
      INNER JOIN usuarios u ON ep.id_usuario = u.id
      LEFT JOIN links_portifolio lp ON ep.id = lp.id_experiencia_portifolio
      WHERE u.id_cliente = $1`,
      
      `SELECT 
        COUNT(DISTINCT ep.id) as total_experiencias,
        COUNT(DISTINCT u.id) as colaboradores_ativos
      FROM usuarios u
      LEFT JOIN experiencia_portifolio ep ON u.id = ep.id_usuario
      WHERE u.id_cliente = $1`
    ];

    const results = await Promise.all(queries.map(query => client.query(query, [id_cliente])));
    const [atualizacao, feedbacks, conquistas, acoes] = results.map(r => r.rows[0]);

    return {
      taxa_atualizacao_portfolio: parseInt(atualizacao.total_colaboradores) > 0 ? parseFloat(((parseInt(atualizacao.usuarios_atualizados) / parseInt(atualizacao.total_colaboradores)) * 100).toFixed(2)) : 0,
      indice_feedbacks_positivos: parseInt(feedbacks.total_feedbacks) > 0 ? parseFloat(((parseInt(feedbacks.feedbacks_positivos) / parseInt(feedbacks.total_feedbacks)) * 100).toFixed(2)) : 0,
      conquistas_validadas: parseInt(conquistas.total_experiencias) > 0 ? parseFloat(((parseInt(conquistas.experiencias_com_evidencias) / parseInt(conquistas.total_experiencias)) * 100).toFixed(2)) : 0,
      acoes_melhoria: parseInt(acoes.colaboradores_ativos) > 0 ? parseFloat((parseInt(acoes.total_experiencias) / parseInt(acoes.colaboradores_ativos)).toFixed(2)) : 0
    };
  }

  /**
   * Coletar dados de reconhecimento
   */
  async coletarDadosReconhecimento(client, id_cliente) {
    const queries = [
      `SELECT 
        COUNT(r.id) as total_reconhecimentos,
        COUNT(DISTINCT u.id) as total_colaboradores
      FROM usuarios u
      LEFT JOIN reconhecimento r ON u.id = r.id_usuario_reconhecido
      WHERE u.id_cliente = $1`,
      
      `SELECT 
        r.motivo_reconhecimento,
        COUNT(*) as frequencia
      FROM reconhecimento r
      INNER JOIN usuarios u ON r.id_usuario_reconhecido = u.id
      WHERE u.id_cliente = $1 AND r.motivo_reconhecimento IS NOT NULL
      GROUP BY r.motivo_reconhecimento
      ORDER BY frequencia DESC
      LIMIT 10`,
      
      `WITH reconhecimentos_ordenados AS (
        SELECT 
          r.id_usuario_reconhecido,
          r.created_at,
          LAG(r.created_at) OVER (PARTITION BY r.id_usuario_reconhecido ORDER BY r.created_at) as reconhecimento_anterior
        FROM reconhecimento r
        INNER JOIN usuarios u ON r.id_usuario_reconhecido = u.id
        WHERE u.id_cliente = $1
      )
      SELECT 
        AVG(EXTRACT(EPOCH FROM (created_at - reconhecimento_anterior)) / (24 * 60 * 60)) as tempo_medio_dias
      FROM reconhecimentos_ordenados
      WHERE reconhecimento_anterior IS NOT NULL`,
      
      `SELECT 
        d.titulo_departamento,
        COUNT(r.id) as total_reconhecimentos,
        COUNT(DISTINCT u.id) as colaboradores_departamento,
        ROUND((COUNT(r.id) * 100.0 / SUM(COUNT(r.id)) OVER()), 2) as percentual
      FROM reconhecimento r
      INNER JOIN usuarios u ON r.id_usuario_reconhecido = u.id
      INNER JOIN departamento d ON u.id_departamento = d.id
      WHERE u.id_cliente = $1
      GROUP BY d.titulo_departamento, d.id
      ORDER BY total_reconhecimentos DESC`
    ];

    const results = await Promise.all(queries.map(query => client.query(query, [id_cliente])));
    const [porColaborador, topSkills, tempoMedio, distribuicao] = results;

    return {
      reconhecimentos_por_colaborador: parseInt(porColaborador.rows[0].total_colaboradores) > 0 ? parseFloat((parseInt(porColaborador.rows[0].total_reconhecimentos) / parseInt(porColaborador.rows[0].total_colaboradores)).toFixed(2)) : 0,
      top_skills_reconhecidas: topSkills.rows.map(row => ({
        skill: row.motivo_reconhecimento,
        frequencia: parseInt(row.frequencia)
      })),
      tempo_medio_entre_reconhecimentos: parseFloat(tempoMedio.rows[0].tempo_medio_dias || 0).toFixed(2),
      distribuicao_reconhecimento_por_area: distribuicao.rows.map(row => ({
        departamento: row.titulo_departamento,
        total_reconhecimentos: parseInt(row.total_reconhecimentos),
        colaboradores_departamento: parseInt(row.colaboradores_departamento),
        percentual: parseFloat(row.percentual)
      }))
    };
  }

  /**
   * Coletar dados de tendência
   */
  async coletarDadosTendencia(client, id_cliente) {
    const queries = [
      `WITH reconhecimentos_bidirecionais AS (
        SELECT 
          r1.id_usuario_reconhecido as usuario_a,
          r1.id_usuario_reconheceu as usuario_b,
          COUNT(*) as reconhecimentos_ab,
          (SELECT COUNT(*) 
           FROM reconhecimento r2 
           WHERE r2.id_usuario_reconhecido = r1.id_usuario_reconheceu 
           AND r2.id_usuario_reconheceu = r1.id_usuario_reconhecido) as reconhecimentos_ba
        FROM reconhecimento r1
        INNER JOIN usuarios u1 ON r1.id_usuario_reconhecido = u1.id
        INNER JOIN usuarios u2 ON r1.id_usuario_reconheceu = u2.id
        WHERE u1.id_cliente = $1 AND u2.id_cliente = $1
        GROUP BY r1.id_usuario_reconhecido, r1.id_usuario_reconheceu
      )
      SELECT 
        COUNT(CASE WHEN reconhecimentos_ab > 0 AND reconhecimentos_ba > 0 THEN 1 END) as pares_reciprocos,
        COUNT(*) as total_pares
      FROM reconhecimentos_bidirecionais`,
      
      `SELECT 
        AVG(plenitude_felicidade) as media_plenitude,
        AVG(saude_disposicao) as media_saude,
        AVG(equilibrio_emocional) as media_equilibrio
      FROM arvore_da_vida adv
      INNER JOIN usuarios u ON adv.id_usuario = u.id
      WHERE u.id_cliente = $1`,
      
      `SELECT 
        AVG(EXTRACT(EPOCH FROM (mp.created_at - mp.created_at)) / (24 * 60 * 60)) as tempo_medio_dias
      FROM metas_pdi mp
      INNER JOIN usuarios u ON mp.id_usuario = u.id
      WHERE u.id_cliente = $1 
      AND mp.status = 'Concluída' 
      AND mp.created_at IS NOT NULL`
    ];

    const results = await Promise.all(queries.map(query => client.query(query, [id_cliente])));
    const [reciproco, bemEstar, tempoEvolucao] = results.map(r => r.rows[0]);

    const paresReciprocos = parseInt(reciproco.pares_reciprocos) || 0;
    const totalPares = parseInt(reciproco.total_pares) || 0;
    const plenitude = parseFloat(bemEstar.media_plenitude) || 0;
    const saude = parseFloat(bemEstar.media_saude) || 0;
    const equilibrio = parseFloat(bemEstar.media_equilibrio) || 0;

    return {
      indice_reconhecimento_reciproco: totalPares > 0 ? parseFloat(((paresReciprocos / totalPares) * 100).toFixed(2)) : 0,
      indice_bem_estar_organizacional: parseFloat(((plenitude + saude + equilibrio) / 3).toFixed(2)),
      tempo_medio_evolucao_meta: parseFloat((tempoEvolucao.tempo_medio_dias || 0).toFixed(2))
    };
  }

  /**
   * Gerar PDF do Relatório Executivo
   * GET /api/relatorio-executivo/gerar-pdf/:id_cliente
   */
  async gerarPDFRelatorio(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Gerando PDF do Relatório Executivo', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Coletar todos os dados
      const dadosRelatorio = await this.coletarTodosOsDados(id_cliente);

      // Gerar HTML do relatório
      const html = this.gerarHTMLRelatorio(dadosRelatorio);

      // Gerar PDF usando Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await browser.close();

      // Definir headers para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio-executivo-cliente-${id_cliente}-${new Date().toISOString().split('T')[0]}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);

    } catch (error) {
      logger.error('Erro ao gerar PDF do relatório:', error);
      return this.handleError(res, error, 'Erro ao gerar PDF do relatório');
    } finally {
      client.release();
    }
  }

  /**
   * Gerar Excel do Relatório Executivo
   * GET /api/relatorio-executivo/gerar-excel/:id_cliente
   */
  async gerarExcelRelatorio(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Gerando Excel do Relatório Executivo', { id_cliente });

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Coletar todos os dados
      const dadosRelatorio = await this.coletarTodosOsDados(id_cliente);

      // Criar workbook
      const workbook = XLSX.utils.book_new();

      // Aba 1: Visão Geral
      const visaoGeralData = [
        ['Métrica', 'Valor', 'Descrição'],
        ['Índice de Engajamento Geral', dadosRelatorio.visao_geral.indice_engajamento_geral, 'Média ponderada dos pilares da Árvore da Vida'],
        ['Taxa de Evolução de Desenvolvimento', `${dadosRelatorio.visao_geral.taxa_evolucao_desenvolvimento}%`, 'Atividades concluídas ÷ Atividades planejadas no PDI'],
        ['Nível Médio de Reconhecimento', dadosRelatorio.visao_geral.nivel_medio_reconhecimento, 'Total de reconhecimentos ÷ Colaboradores ativos'],
        ['Índice de Satisfação Interna', `${dadosRelatorio.visao_geral.indice_satisfacao_interna}%`, 'Feedbacks positivos no portfólio'],
        ['Maturidade de Carreira', dadosRelatorio.visao_geral.maturidade_carreira, 'Metas + Evoluções ÷ Tempo de casa']
      ];
      const wsVisaoGeral = XLSX.utils.aoa_to_sheet(visaoGeralData);
      XLSX.utils.book_append_sheet(workbook, wsVisaoGeral, 'Visão Geral');

      // Aba 2: Árvore da Vida
      const arvoreData = [
        ['Métrica', 'Valor', 'Descrição'],
        ['Índice de Plenitude', dadosRelatorio.arvore_da_vida.indice_plenitude, 'Média dos pilares Plenitude, Felicidade e Realização'],
        ['Índice de Vitalidade', dadosRelatorio.arvore_da_vida.indice_vitalidade, 'Média dos pilares Saúde, Equilíbrio e Energia'],
        ['Índice de Propósito e Contribuição', dadosRelatorio.arvore_da_vida.indice_proposito_contribuicao, 'Média de Espiritualidade + Contribuição Social'],
        ['Índice Profissional Global', dadosRelatorio.arvore_da_vida.indice_profissional_global, 'Média de Profissional + Desenvolvimento + Recursos Financeiros']
      ];
      const wsArvore = XLSX.utils.aoa_to_sheet(arvoreData);
      XLSX.utils.book_append_sheet(workbook, wsArvore, 'Árvore da Vida');

      // Aba 3: Análise SWOT
      const swotData = [
        ['Métrica', 'Valor', 'Descrição'],
        ['Forças vs Fraquezas Ratio', dadosRelatorio.analise_swot.forcas_vs_fraquezas_ratio, 'Nº de forças ÷ Nº de fraquezas'],
        ['Oportunidades Aproveitadas', `${dadosRelatorio.analise_swot.oportunidades_aproveitadas}%`, 'Oportunidades transformadas em ações do PDI'],
        ['Ameaças Monitoradas', `${dadosRelatorio.analise_swot.ameacas_monitoradas}%`, 'Ameaças com plano mitigado']
      ];
      const wsSwot = XLSX.utils.aoa_to_sheet(swotData);
      XLSX.utils.book_append_sheet(workbook, wsSwot, 'Análise SWOT');

      // Aba 4: PDI
      const pdiData = [
        ['Métrica', 'Valor', 'Descrição'],
        ['Progresso Médio do PDI', `${dadosRelatorio.pdi.progresso_medio_pdi}%`, 'Atividades concluídas'],
        ['Taxa de Metas em Progresso', `${dadosRelatorio.pdi.taxa_metas_progresso}%`, 'Metas "em andamento" ÷ Total de metas'],
        ['Aderência ao Prazo', `${dadosRelatorio.pdi.aderencia_prazo}%`, 'Metas dentro do prazo'],
        ['Engajamento com Mentoria', `${dadosRelatorio.pdi.engajamento_mentoria}%`, 'Participações em mentorias']
      ];
      const wsPdi = XLSX.utils.aoa_to_sheet(pdiData);
      XLSX.utils.book_append_sheet(workbook, wsPdi, 'PDI');

      // Aba 5: Portfólio
      const portfolioData = [
        ['Métrica', 'Valor', 'Descrição'],
        ['Taxa de Atualização do Portfólio', `${dadosRelatorio.portfolio.taxa_atualizacao_portfolio}%`, 'Colaboradores com experiências nos últimos 90 dias'],
        ['Índice de Feedbacks Positivos', `${dadosRelatorio.portfolio.indice_feedbacks_positivos}%`, 'Feedbacks positivos ÷ Total de feedbacks'],
        ['Conquistas Validadas', `${dadosRelatorio.portfolio.conquistas_validadas}%`, 'Experiências com evidências comprovadas'],
        ['Ações de Melhoria', dadosRelatorio.portfolio.acoes_melhoria, 'Média de ações registradas por colaborador']
      ];
      const wsPortfolio = XLSX.utils.aoa_to_sheet(portfolioData);
      XLSX.utils.book_append_sheet(workbook, wsPortfolio, 'Portfólio');

      // Aba 6: Reconhecimento
      const reconhecimentoData = [
        ['Métrica', 'Valor', 'Descrição'],
        ['Reconhecimentos por Colaborador', dadosRelatorio.reconhecimento.reconhecimentos_por_colaborador, 'Total de reconhecimentos ÷ Total de colaboradores'],
        ['Tempo Médio entre Reconhecimentos', `${dadosRelatorio.reconhecimento.tempo_medio_entre_reconhecimentos} dias`, 'Dias médios entre reconhecimentos'],
        ['', '', ''],
        ['Top Skills Reconhecidas', 'Frequência', ''],
        ...dadosRelatorio.reconhecimento.top_skills_reconhecidas.map(skill => [skill.skill, skill.frequencia, '']),
        ['', '', ''],
        ['Distribuição por Área', 'Reconhecimentos', 'Colaboradores', 'Percentual'],
        ...dadosRelatorio.reconhecimento.distribuicao_reconhecimento_por_area.map(area => [
          area.departamento, 
          area.total_reconhecimentos, 
          area.colaboradores_departamento, 
          `${area.percentual}%`
        ])
      ];
      const wsReconhecimento = XLSX.utils.aoa_to_sheet(reconhecimentoData);
      XLSX.utils.book_append_sheet(workbook, wsReconhecimento, 'Reconhecimento');

      // Aba 7: Tendências
      const tendenciaData = [
        ['Métrica', 'Valor', 'Descrição'],
        ['Índice de Reconhecimento Recíproco', `${dadosRelatorio.tendencia.indice_reconhecimento_reciproco}%`, 'Reconhecimentos dados e recebidos por par'],
        ['Índice de Bem-Estar Organizacional', dadosRelatorio.tendencia.indice_bem_estar_organizacional, 'Média de Plenitude + Saúde + Equilíbrio'],
        ['Tempo Médio de Evolução de Meta', `${dadosRelatorio.tendencia.tempo_medio_evolucao_meta} dias`, 'Dias até conclusão de metas']
      ];
      const wsTendencia = XLSX.utils.aoa_to_sheet(tendenciaData);
      XLSX.utils.book_append_sheet(workbook, wsTendencia, 'Tendências');

      // Gerar buffer do Excel
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Definir headers para download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio-executivo-cliente-${id_cliente}-${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.setHeader('Content-Length', excelBuffer.length);

      return res.send(excelBuffer);

    } catch (error) {
      logger.error('Erro ao gerar Excel do relatório:', error);
      return this.handleError(res, error, 'Erro ao gerar Excel do relatório');
    } finally {
      client.release();
    }
  }

  /**
   * Gerar HTML do relatório para PDF
   */
  gerarHTMLRelatorio(dados) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Relatório Executivo - Cliente ${dados.id_cliente}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f8f9fa;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 10px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .header p {
                margin: 5px 0 0 0;
                opacity: 0.9;
            }
            .section {
                margin-bottom: 30px;
                background: white;
                border-radius: 10px;
                padding: 25px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                page-break-inside: avoid;
            }
            .section h2 {
                color: #667eea;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
                margin-bottom: 20px;
                font-size: 22px;
            }
            .metric-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }
            .metric-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }
            .metric-title {
                font-weight: 600;
                color: #495057;
                margin-bottom: 8px;
                font-size: 14px;
            }
            .metric-value {
                font-size: 24px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 5px;
            }
            .metric-description {
                font-size: 12px;
                color: #6c757d;
                line-height: 1.4;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            .table th, .table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #dee2e6;
            }
            .table th {
                background-color: #667eea;
                color: white;
                font-weight: 600;
            }
            .table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding: 20px;
                color: #6c757d;
                font-size: 12px;
                border-top: 1px solid #dee2e6;
            }
            .highlight {
                background-color: #fff3cd;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #ffc107;
                margin: 15px 0;
            }
            @media print {
                body { background-color: white; }
                .section { box-shadow: none; border: 1px solid #dee2e6; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Relatório Executivo</h1>
            <p>Cliente ID: ${dados.id_cliente} | Gerado em: ${dados.data_geracao}</p>
        </div>

        <div class="section">
            <h2>📊 Visão Geral</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Índice de Engajamento Geral (IEG)</div>
                    <div class="metric-value">${dados.visao_geral.indice_engajamento_geral}</div>
                    <div class="metric-description">Média ponderada dos pilares da Árvore da Vida</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Taxa de Evolução de Desenvolvimento (TED)</div>
                    <div class="metric-value">${dados.visao_geral.taxa_evolucao_desenvolvimento}%</div>
                    <div class="metric-description">Atividades concluídas ÷ Atividades planejadas no PDI</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Nível Médio de Reconhecimento (NMR)</div>
                    <div class="metric-value">${dados.visao_geral.nivel_medio_reconhecimento}</div>
                    <div class="metric-description">Total de reconhecimentos ÷ Colaboradores ativos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Índice de Satisfação Interna (ISI)</div>
                    <div class="metric-value">${dados.visao_geral.indice_satisfacao_interna}%</div>
                    <div class="metric-description">Média ponderada de feedbacks positivos no portfólio</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Maturidade de Carreira (MC)</div>
                    <div class="metric-value">${dados.visao_geral.maturidade_carreira}</div>
                    <div class="metric-description">Metas concluídas + Evoluções de Portfólio ÷ Tempo de casa</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🌳 Árvore da Vida</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Índice de Plenitude</div>
                    <div class="metric-value">${dados.arvore_da_vida.indice_plenitude}</div>
                    <div class="metric-description">Média dos pilares Plenitude, Felicidade e Realização</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Índice de Vitalidade</div>
                    <div class="metric-value">${dados.arvore_da_vida.indice_vitalidade}</div>
                    <div class="metric-description">Média dos pilares Saúde, Equilíbrio Emocional e Energia</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Índice de Propósito e Contribuição</div>
                    <div class="metric-value">${dados.arvore_da_vida.indice_proposito_contribuicao}</div>
                    <div class="metric-description">Média de Espiritualidade + Contribuição Social</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Índice Profissional Global</div>
                    <div class="metric-value">${dados.arvore_da_vida.indice_profissional_global}</div>
                    <div class="metric-description">Média de Profissional + Desenvolvimento Intelectual + Recursos Financeiros</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🔍 Análise SWOT</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Forças vs Fraquezas Ratio (FFR)</div>
                    <div class="metric-value">${dados.analise_swot.forcas_vs_fraquezas_ratio}</div>
                    <div class="metric-description">Nº de forças ÷ Nº de fraquezas</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Oportunidades Aproveitadas</div>
                    <div class="metric-value">${dados.analise_swot.oportunidades_aproveitadas}%</div>
                    <div class="metric-description">Oportunidades transformadas em ações do PDI</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Ameaças Monitoradas</div>
                    <div class="metric-value">${dados.analise_swot.ameacas_monitoradas}%</div>
                    <div class="metric-description">Ameaças com plano mitigado</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>📈 PDI (Plano de Desenvolvimento Individual)</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Progresso Médio do PDI</div>
                    <div class="metric-value">${dados.pdi.progresso_medio_pdi}%</div>
                    <div class="metric-description">% de atividades concluídas</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Taxa de Metas em Progresso</div>
                    <div class="metric-value">${dados.pdi.taxa_metas_progresso}%</div>
                    <div class="metric-description">Metas "em andamento" ÷ Total de metas</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Aderência ao Prazo</div>
                    <div class="metric-value">${dados.pdi.aderencia_prazo}%</div>
                    <div class="metric-description">Metas dentro do prazo ÷ Total de metas</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Engajamento com Mentoria</div>
                    <div class="metric-value">${dados.pdi.engajamento_mentoria}%</div>
                    <div class="metric-description">Participações em mentorias ÷ Colaboradores ativos</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>💼 Portfólio</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Taxa de Atualização do Portfólio</div>
                    <div class="metric-value">${dados.portfolio.taxa_atualizacao_portfolio}%</div>
                    <div class="metric-description">Colaboradores com experiências nos últimos 90 dias</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Índice de Feedbacks Positivos</div>
                    <div class="metric-value">${dados.portfolio.indice_feedbacks_positivos}%</div>
                    <div class="metric-description">Feedbacks positivos ÷ Total de feedbacks</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Conquistas Validadas</div>
                    <div class="metric-value">${dados.portfolio.conquistas_validadas}%</div>
                    <div class="metric-description">Experiências com evidências comprovadas</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Ações de Melhoria</div>
                    <div class="metric-value">${dados.portfolio.acoes_melhoria}</div>
                    <div class="metric-description">Média de ações registradas por colaborador</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🏆 Programa de Reconhecimento</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Reconhecimentos por Colaborador</div>
                    <div class="metric-value">${dados.reconhecimento.reconhecimentos_por_colaborador}</div>
                    <div class="metric-description">Total de reconhecimentos ÷ Total de colaboradores</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Tempo Médio entre Reconhecimentos</div>
                    <div class="metric-value">${dados.reconhecimento.tempo_medio_entre_reconhecimentos} dias</div>
                    <div class="metric-description">Dias médios entre reconhecimentos por colaborador</div>
                </div>
            </div>
            
            ${dados.reconhecimento.top_skills_reconhecidas.length > 0 ? `
            <h3>Top Skills Reconhecidas</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Skill</th>
                        <th>Frequência</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.reconhecimento.top_skills_reconhecidas.map(skill => `
                    <tr>
                        <td>${skill.skill}</td>
                        <td>${skill.frequencia}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : ''}

            ${dados.reconhecimento.distribuicao_reconhecimento_por_area.length > 0 ? `
            <h3>Distribuição de Reconhecimento por Área</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Departamento</th>
                        <th>Reconhecimentos</th>
                        <th>Colaboradores</th>
                        <th>Percentual</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.reconhecimento.distribuicao_reconhecimento_por_area.map(area => `
                    <tr>
                        <td>${area.departamento}</td>
                        <td>${area.total_reconhecimentos}</td>
                        <td>${area.colaboradores_departamento}</td>
                        <td>${area.percentual}%</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : ''}
        </div>

        <div class="section">
            <h2>📊 KPIs de Tendência</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Índice de Reconhecimento Recíproco</div>
                    <div class="metric-value">${dados.tendencia.indice_reconhecimento_reciproco}%</div>
                    <div class="metric-description">Reconhecimentos dados e recebidos por par</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Índice de Bem-Estar Organizacional</div>
                    <div class="metric-value">${dados.tendencia.indice_bem_estar_organizacional}</div>
                    <div class="metric-description">Média de Plenitude + Saúde + Equilíbrio emocional</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Tempo Médio de Evolução de Meta</div>
                    <div class="metric-value">${dados.tendencia.tempo_medio_evolucao_meta} dias</div>
                    <div class="metric-description">Dias até conclusão de metas</div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema Impulsionar Talentos</p>
            <p>Data de geração: ${dados.data_geracao}</p>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = new RelatorioExecutivoController();

