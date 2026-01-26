const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

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

  /**
   * Helper: Calcular datas de filtro baseado no período
   * @param {string} periodo - 'ultimo_mes', 'ultimo_trimestre', 'ultimo_semestre', 'ultimo_ano'
   * @returns {object} - { dataInicio, dataFim }
   */
  calcularFiltroDataPeriodo(periodo) {
    const hoje = new Date();
    let dataInicio;

    switch (periodo) {
      case 'ultimo_mes':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
        break;
      case 'ultimo_trimestre':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, hoje.getDate());
        break;
      case 'ultimo_semestre':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, hoje.getDate());
        break;
      case 'ultimo_ano':
        dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
        break;
      default:
        return { dataInicio: null, dataFim: null }; // Sem filtro
    }

    return {
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataFim: hoje.toISOString().split('T')[0]
    };
  }

  /**
   * Helper: Gerar cláusula SQL de filtro por data
   * @param {string} nomoCampoData - Nome do campo de data na tabela
   * @param {object} filtroData - { dataInicio, dataFim }
   * @returns {string} - Cláusula WHERE adicional (vazia se sem filtro)
   */
  gerarClausulaSQLFiltroData(nomeTabela, nomoCampoData, filtroData) {
    if (!filtroData.dataInicio || !filtroData.dataFim) {
      return '';
    }
    return ` AND ${nomeTabela}.${nomoCampoData} BETWEEN '${filtroData.dataInicio}' AND '${filtroData.dataFim}'`;
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
  async coletarTodosOsDados(id_cliente, periodo = null) {
    const client = await pool.connect();
    try {
      logger.info('Coletando todos os dados para o relatório', { id_cliente, periodo });

      // Calcular filtro de data se período foi especificado
      const filtroData = this.calcularFiltroDataPeriodo(periodo);

      // Executar todas as APIs em paralelo para melhor performance
      const [
        dadosVisaoGeral,
        dadosArvoreDaVida,
        dadosAnaliseSwot,
        dadosPDI,
        dadosPortfolio,
        dadosReconhecimento,
        dadosTendencia,
        dadosBemEstarEmocional
      ] = await Promise.all([
        this.coletarDadosVisaoGeral(client, id_cliente, filtroData),
        this.coletarDadosArvoreDaVida(client, id_cliente, filtroData),
        this.coletarDadosAnaliseSwot(client, id_cliente, filtroData),
        this.coletarDadosPDI(client, id_cliente, filtroData),
        this.coletarDadosPortfolio(client, id_cliente, filtroData),
        this.coletarDadosReconhecimento(client, id_cliente, filtroData),
        this.coletarDadosTendencia(client, id_cliente, filtroData),
        this.coletarDadosBemEstarEmocional(client, id_cliente, filtroData)
      ]);

      return {
        visao_geral: dadosVisaoGeral,
        arvore_da_vida: dadosArvoreDaVida,
        analise_swot: dadosAnaliseSwot,
        pdi: dadosPDI,
        portfolio: dadosPortfolio,
        reconhecimento: dadosReconhecimento,
        tendencia: dadosTendencia,
        bem_estar_emocional: dadosBemEstarEmocional,
        data_geracao: new Date().toLocaleString('pt-BR'),
        periodo_filtro: periodo || 'completo',
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
  async coletarDadosVisaoGeral(client, id_cliente, filtroData = {}) {
    const clausulaFiltroArvoreDaVida = this.gerarClausulaSQLFiltroData('adv', 'created_at', filtroData);
    const clausulaFiltroMetas = this.gerarClausulaSQLFiltroData('ap', 'created_at', filtroData);
    const clausulaFiltroReconhecimento = this.gerarClausulaSQLFiltroData('r', 'created_at', filtroData);
    const clausulaFiltroFeedbacks = this.gerarClausulaSQLFiltroData('fp', 'created_at', filtroData);
    
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
      WHERE u.id_cliente = $1 ${clausulaFiltroArvoreDaVida}`,
      
      // TED
      `SELECT 
        COUNT(CASE WHEN ap.status_atividade = 'Concluída' THEN 1 END) as atividades_concluidas,
        COUNT(ap.id) as total_atividades
      FROM atividades_pdi ap
      INNER JOIN metas_pdi mp ON ap.id_meta_pdi = mp.id
      INNER JOIN usuarios u ON mp.id_usuario = u.id
      WHERE u.id_cliente = $1 ${clausulaFiltroMetas}`,
      
      // NMR
      `SELECT 
        COUNT(r.id) as total_reconhecimentos,
        COUNT(DISTINCT u.id) as colaboradores_ativos
      FROM usuarios u
      LEFT JOIN reconhecimento r ON (u.id = r.id_usuario_reconhecido OR u.id = r.id_usuario_reconheceu)
      WHERE u.id_cliente = $1 ${clausulaFiltroReconhecimento}`,
      
      // ISI
      `SELECT 
        COUNT(CASE WHEN LOWER(fp.feedback) LIKE '%positiv%' OR LOWER(fp.feedback) LIKE '%excelent%' OR LOWER(fp.feedback) LIKE '%ótim%' THEN 1 END) as feedbacks_positivos,
        COUNT(fp.id) as total_feedbacks
      FROM feedbacks_portifolio fp
      INNER JOIN experiencia_portifolio ep ON fp.id_experiencia_portifolio = ep.id
      INNER JOIN usuarios u ON ep.id_usuario = u.id
      WHERE u.id_cliente = $1 ${clausulaFiltroFeedbacks}`,
      
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
   * Coletar dados de bem-estar emocional (checkin_emocional e checkin_acao)
   */
  async coletarDadosBemEstarEmocional(client, id_cliente, filtroData = {}) {
    const clausulaFiltroCheckin = this.gerarClausulaSQLFiltroData('ce', 'created_at', filtroData);
    const clausulaFiltroAcao = this.gerarClausulaSQLFiltroData('ca', 'created_at', filtroData);
    
    // Buscar dados de checkin emocional
    const checkinsQuery = `
      SELECT 
        COUNT(*) as total_checkins,
        AVG(score) as media_nota_bem_estar,
        COUNT(CASE WHEN score = 1 THEN 1 END) as nota_1,
        COUNT(CASE WHEN score = 2 THEN 1 END) as nota_2,
        COUNT(CASE WHEN score = 3 THEN 1 END) as nota_3,
        COUNT(CASE WHEN score = 4 THEN 1 END) as nota_4,
        COUNT(CASE WHEN score = 5 THEN 1 END) as nota_5
      FROM checkin_emocional ce
      INNER JOIN usuarios u ON ce.id_user = u.id
      WHERE u.id_cliente = $1 ${clausulaFiltroCheckin}
    `;

    const checkinsResult = await client.query(checkinsQuery, [id_cliente]);
    const checkinsData = checkinsResult.rows[0];

    // Buscar agrupamento por categoria de motivo
    const categoriasQuery = `
      SELECT 
        categoria_motivo,
        COUNT(*) as quantidade
      FROM checkin_emocional ce
      INNER JOIN usuarios u ON ce.id_user = u.id
      WHERE u.id_cliente = $1 AND categoria_motivo IS NOT NULL ${clausulaFiltroCheckin}
      GROUP BY categoria_motivo
      ORDER BY quantidade DESC
    `;

    const categoriasResult = await client.query(categoriasQuery, [id_cliente]);
    const categoriasMotivo = categoriasResult.rows.map(row => ({
      categoria: row.categoria_motivo,
      quantidade: parseInt(row.quantidade)
    }));

    // Buscar dados de ações de bem-estar
    const acoesQuery = `
      SELECT 
        COUNT(*) as total_acoes,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as acoes_pendentes,
        COUNT(CASE WHEN status = 'em_progresso' THEN 1 END) as acoes_em_progresso,
        COUNT(CASE WHEN status = 'concluida' THEN 1 END) as acoes_concluidas,
        COUNT(CASE WHEN status = 'cancelada' THEN 1 END) as acoes_canceladas
      FROM checkin_acao ca
      INNER JOIN usuarios u ON ca.id_user = u.id
      WHERE u.id_cliente = $1 ${clausulaFiltroAcao}
    `;

    const acoesResult = await client.query(acoesQuery, [id_cliente]);
    const acoesData = acoesResult.rows[0];

    // Buscar agrupamento de ações por tipo
    const acoestipoQuery = `
      SELECT 
        tipo_acao,
        COUNT(*) as quantidade
      FROM checkin_acao ca
      INNER JOIN usuarios u ON ca.id_user = u.id
      WHERE u.id_cliente = $1
      GROUP BY tipo_acao
      ORDER BY quantidade DESC
    `;

    const acoesTipoResult = await client.query(acoestipoQuery, [id_cliente]);
    const acoesPorTipo = acoesTipoResult.rows.map(row => ({
      tipo_acao: row.tipo_acao,
      quantidade: parseInt(row.quantidade)
    }));

    // Buscar agrupamento de ações por prioridade
    const acoesprioridadeQuery = `
      SELECT 
        prioridade,
        COUNT(*) as quantidade
      FROM checkin_acao ca
      INNER JOIN usuarios u ON ca.id_user = u.id
      WHERE u.id_cliente = $1
      GROUP BY prioridade
      ORDER BY 
        CASE prioridade
          WHEN 'alta' THEN 1
          WHEN 'normal' THEN 2
          WHEN 'baixa' THEN 3
          ELSE 4
        END
    `;

    const acoesPrioridadeResult = await client.query(acoesprioridadeQuery, [id_cliente]);
    const acoesPorPrioridade = acoesPrioridadeResult.rows.map(row => ({
      prioridade: row.prioridade,
      quantidade: parseInt(row.quantidade)
    }));

    const totalCheckins = parseInt(checkinsData.total_checkins) || 0;
    const mediaNotaBemEstar = totalCheckins > 0 ? parseFloat(checkinsData.media_nota_bem_estar).toFixed(2) : 0;
    const totalAcoes = parseInt(acoesData.total_acoes) || 0;
    const percentualAcoesConcluidas = totalAcoes > 0 ? parseFloat(((parseInt(acoesData.acoes_concluidas) / totalAcoes) * 100).toFixed(2)) : 0;

    return {
      checkin_emocional: {
        total_checkins: totalCheckins,
        media_nota_bem_estar: parseFloat(mediaNotaBemEstar),
        distribuicao_por_nota: {
          nota_1: parseInt(checkinsData.nota_1) || 0,
          nota_2: parseInt(checkinsData.nota_2) || 0,
          nota_3: parseInt(checkinsData.nota_3) || 0,
          nota_4: parseInt(checkinsData.nota_4) || 0,
          nota_5: parseInt(checkinsData.nota_5) || 0
        },
        categorias_motivo: categoriasMotivo
      },
      acoes_bem_estar: {
        total_acoes: totalAcoes,
        acoes_pendentes: parseInt(acoesData.acoes_pendentes) || 0,
        acoes_em_progresso: parseInt(acoesData.acoes_em_progresso) || 0,
        acoes_concluidas: parseInt(acoesData.acoes_concluidas) || 0,
        acoes_canceladas: parseInt(acoesData.acoes_canceladas) || 0,
        percentual_conclusao: percentualAcoesConcluidas,
        acoes_por_tipo: acoesPorTipo,
        acoes_por_prioridade: acoesPorPrioridade
      }
    };
  }
  async coletarDadosArvoreDaVida(client, id_cliente, filtroData = {}) {
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
  async coletarDadosAnaliseSwot(client, id_cliente, filtroData = {}) {
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
  async coletarDadosPDI(client, id_cliente, filtroData = {}) {
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
  async coletarDadosPortfolio(client, id_cliente, filtroData = {}) {
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
  async coletarDadosReconhecimento(client, id_cliente, filtroData = {}) {
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
  async coletarDadosTendencia(client, id_cliente, filtroData = {}) {
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
  /**
   * Gerar Excel do Relatório Executivo Completo
   * @param {number} id_cliente - ID do cliente
   * @param {string} periodo - Período de filtro (opcional)
   * @returns {Buffer} - Buffer do Excel
   */
  async gerarExcelRelatorio(id_cliente, periodo = null) {
  }

  /**
   * Gerar HTML do Relatório Executivo com gráficos
   * @param {object} dados - Dados coletados do relatório
   * @returns {string} - HTML do relatório
   */
  gerarHTMLRelatorio(dados) {
    const formatarNumero = (valor, casasDecimais = 2) => {
      if (typeof valor !== 'number') return 'N/A';
      return valor.toFixed(casasDecimais);
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório Executivo</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
            padding: 20px;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            border-radius: 8px;
          }
          
          /* HEADER */
          .header {
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            margin: -40px -40px 40px -40px;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            font-size: 40px;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .header .metadata {
            font-size: 13px;
            opacity: 0.9;
            margin-top: 15px;
          }
          
          /* SEÇÕES */
          .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
            border: 1px solid #eee;
            border-radius: 6px;
            padding: 25px;
            background: #fafbfc;
          }
          .section h2 {
            font-size: 22px;
            color: #667eea;
            border-bottom: 3px solid #667eea;
            padding-bottom: 12px;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
          }
          
          /* GRID DE CARDS */
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .metric-card {
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 18px;
            text-align: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          }
          .metric-card .label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .metric-card .value {
            font-size: 28px;
            font-weight: 700;
            color: #667eea;
          }
          
          /* CHARTS */
          .chart-container {
            position: relative;
            height: 300px;
            margin-bottom: 20px;
            background: white;
            border-radius: 6px;
            padding: 15px;
            border: 1px solid #eee;
          }
          .chart-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 20px;
          }
          
          /* TABELAS */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            background: white;
            border-radius: 6px;
            overflow: hidden;
          }
          thead {
            background: #667eea;
            color: white;
          }
          thead th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
          }
          tbody tr:nth-child(even) {
            background: #f9f9f9;
          }
          tbody tr:hover {
            background: #f0f0f0;
          }
          tbody td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          
          /* FOOTER */
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #999;
            font-size: 12px;
          }
          
          @media print {
            .section { page-break-inside: avoid; }
            .chart-row { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- HEADER -->
          <div class="header">
            <h1>📊 Relatório Executivo</h1>
            <div class="metadata">
              <strong>Cliente ID:</strong> ${dados.id_cliente} | 
              <strong>Gerado em:</strong> ${dados.data_geracao} |
              <strong>Período:</strong> ${dados.periodo_filtro === 'completo' ? 'Completo' : dados.periodo_filtro}
            </div>
          </div>

          <!-- VISÃO GERAL -->
          <div class="section">
            <h2>🎯 Visão Geral</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="label">Engajamento Geral</div>
                <div class="value">${formatarNumero(dados.visao_geral.indice_engajamento_geral)}</div>
              </div>
              <div class="metric-card">
                <div class="label">Maturidade Carreira</div>
                <div class="value">${formatarNumero(dados.visao_geral.maturidade_carreira)}</div>
              </div>
              <div class="metric-card">
                <div class="label">Reconhecimento Médio</div>
                <div class="value">${formatarNumero(dados.visao_geral.nivel_medio_reconhecimento)}</div>
              </div>
              <div class="metric-card">
                <div class="label">Evolução Desenvolvimento</div>
                <div class="value">${formatarNumero(dados.visao_geral.taxa_evolucao_desenvolvimento)}%</div>
              </div>
            </div>
          </div>

          <!-- ÁRVORE DA VIDA -->
          <div class="section">
            <h2>🌳 Árvore da Vida</h2>
            <div class="chart-row">
              <div class="chart-container">
                <canvas id="arvoreChart"></canvas>
              </div>
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="label">Plenitude</div>
                  <div class="value">${formatarNumero(dados.arvore_da_vida.indice_plenitude)}</div>
                </div>
                <div class="metric-card">
                  <div class="label">Vitalidade</div>
                  <div class="value">${formatarNumero(dados.arvore_da_vida.indice_vitalidade)}</div>
                </div>
                <div class="metric-card">
                  <div class="label">Propósito</div>
                  <div class="value">${formatarNumero(dados.arvore_da_vida.indice_proposito_contribuicao)}</div>
                </div>
                <div class="metric-card">
                  <div class="label">Profissional Global</div>
                  <div class="value">${formatarNumero(dados.arvore_da_vida.indice_profissional_global)}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ANÁLISE SWOT -->
          <div class="section">
            <h2>⚔️ Análise SWOT</h2>
            <div class="chart-row">
              <div class="chart-container">
                <canvas id="swotChart"></canvas>
              </div>
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="label">Forças vs Fraquezas</div>
                  <div class="value">${formatarNumero(dados.analise_swot.forcas_vs_fraquezas_ratio)}</div>
                </div>
                <div class="metric-card">
                  <div class="label">Oportunidades</div>
                  <div class="value">${formatarNumero(dados.analise_swot.oportunidades_aproveitadas)}%</div>
                </div>
                <div class="metric-card">
                  <div class="label">Ameaças Monitoradas</div>
                  <div class="value">${formatarNumero(dados.analise_swot.ameacas_monitoradas)}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PDI -->
          <div class="section">
            <h2>📈 Plano de Desenvolvimento Individual (PDI)</h2>
            <div class="chart-row">
              <div class="chart-container">
                <canvas id="pdiChart"></canvas>
              </div>
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="label">Progresso Médio</div>
                  <div class="value">${formatarNumero(dados.pdi.progresso_medio_pdi)}%</div>
                </div>
                <div class="metric-card">
                  <div class="label">Metas em Progresso</div>
                  <div class="value">${formatarNumero(dados.pdi.taxa_metas_progresso)}%</div>
                </div>
                <div class="metric-card">
                  <div class="label">Aderência ao Prazo</div>
                  <div class="value">${formatarNumero(dados.pdi.aderencia_prazo)}%</div>
                </div>
                <div class="metric-card">
                  <div class="label">Engajamento Mentoria</div>
                  <div class="value">${formatarNumero(dados.pdi.engajamento_mentoria)}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PORTFÓLIO -->
          <div class="section">
            <h2>💼 Portfólio</h2>
            <div class="chart-row">
              <div class="chart-container">
                <canvas id="portfolioChart"></canvas>
              </div>
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="label">Atualização</div>
                  <div class="value">${formatarNumero(dados.portfolio.taxa_atualizacao_portfolio)}%</div>
                </div>
                <div class="metric-card">
                  <div class="label">Feedbacks Positivos</div>
                  <div class="value">${formatarNumero(dados.portfolio.indice_feedbacks_positivos)}%</div>
                </div>
                <div class="metric-card">
                  <div class="label">Conquistas Validadas</div>
                  <div class="value">${formatarNumero(dados.portfolio.conquistas_validadas)}%</div>
                </div>
                <div class="metric-card">
                  <div class="label">Ações de Melhoria</div>
                  <div class="value">${formatarNumero(dados.portfolio.acoes_melhoria)}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- RECONHECIMENTO -->
          <div class="section">
            <h2>🏆 Programa de Reconhecimento</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="label">Reconhecimentos por Colaborador</div>
                <div class="value">${formatarNumero(dados.reconhecimento.reconhecimentos_por_colaborador)}</div>
              </div>
              <div class="metric-card">
                <div class="label">Tempo Médio entre Reconhecimentos</div>
                <div class="value">${dados.reconhecimento.tempo_medio_entre_reconhecimentos ? formatarNumero(dados.reconhecimento.tempo_medio_entre_reconhecimentos) + ' dias' : 'N/A'}</div>
              </div>
            </div>
            
            ${dados.reconhecimento.top_skills_reconhecidas && dados.reconhecimento.top_skills_reconhecidas.length > 0 ? `
              <h3 style="color: #667eea; margin-top: 20px; margin-bottom: 10px;">Top Skills Reconhecidas:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Frequência</th>
                  </tr>
                </thead>
                <tbody>
                  ${dados.reconhecimento.top_skills_reconhecidas.slice(0, 5).map(skill => `
                    <tr>
                      <td>${skill.skill || 'N/A'}</td>
                      <td>${skill.frequencia || 0}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>

          <!-- TENDÊNCIAS -->
          <div class="section">
            <h2>📊 KPIs de Tendência</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="label">Reconhecimento Recíproco</div>
                <div class="value">${formatarNumero(dados.tendencia.indice_reconhecimento_reciproco)}%</div>
              </div>
              <div class="metric-card">
                <div class="label">Bem-Estar Organizacional</div>
                <div class="value">${formatarNumero(dados.tendencia.indice_bem_estar_organizacional)}</div>
              </div>
              <div class="metric-card">
                <div class="label">Evolução de Meta (dias)</div>
                <div class="value">${formatarNumero(dados.tendencia.tempo_medio_evolucao_meta, 0)}</div>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema Impulsionar Talentos</p>
            <p style="margin-top: 8px; color: #bbb;">Todos os dados são confidenciais e de uso exclusivo da organização</p>
          </div>
        </div>

        <script>
          // Cores padrão
          const colors = {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#48bb78',
            danger: '#f56565',
            warning: '#ed8936',
            info: '#4299e1'
          };

          // ÁRVORE DA VIDA - Radar Chart
          const arvoreCtx = document.getElementById('arvoreChart');
          if (arvoreCtx) {
            new Chart(arvoreCtx, {
              type: 'radar',
              data: {
                labels: ['Plenitude', 'Vitalidade', 'Propósito', 'Profissional'],
                datasets: [{
                  label: 'Índices da Árvore',
                  data: [
                    ${dados.arvore_da_vida.indice_plenitude},
                    ${dados.arvore_da_vida.indice_vitalidade},
                    ${dados.arvore_da_vida.indice_proposito_contribuicao},
                    ${dados.arvore_da_vida.indice_profissional_global}
                  ],
                  borderColor: colors.primary,
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  pointBackgroundColor: colors.primary,
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: 'top' }
                },
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 10
                  }
                }
              }
            });
          }

          // SWOT - Bar Chart
          const swotCtx = document.getElementById('swotChart');
          if (swotCtx) {
            new Chart(swotCtx, {
              type: 'bar',
              data: {
                labels: ['F/F Ratio', 'Oportunidades', 'Ameaças'],
                datasets: [{
                  label: 'Valores',
                  data: [
                    ${dados.analise_swot.forcas_vs_fraquezas_ratio},
                    ${dados.analise_swot.oportunidades_aproveitadas},
                    ${dados.analise_swot.ameacas_monitoradas}
                  ],
                  backgroundColor: [colors.primary, colors.success, colors.warning],
                  borderColor: [colors.primary, colors.success, colors.warning],
                  borderWidth: 2
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: { beginAtZero: true, max: 100 }
                }
              }
            });
          }

          // PDI - Progress Doughnut
          const pdiCtx = document.getElementById('pdiChart');
          if (pdiCtx) {
            new Chart(pdiCtx, {
              type: 'doughnut',
              data: {
                labels: ['Progresso', 'Metas em Progresso', 'Aderência ao Prazo', 'Mentoria'],
                datasets: [{
                  data: [
                    ${dados.pdi.progresso_medio_pdi},
                    ${dados.pdi.taxa_metas_progresso},
                    ${dados.pdi.aderencia_prazo},
                    ${dados.pdi.engajamento_mentoria}
                  ],
                  backgroundColor: [
                    colors.primary,
                    colors.secondary,
                    colors.success,
                    colors.warning
                  ],
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }
            });
          }

          // PORTFÓLIO - Line Chart
          const portfolioCtx = document.getElementById('portfolioChart');
          if (portfolioCtx) {
            new Chart(portfolioCtx, {
              type: 'line',
              data: {
                labels: ['Atualização', 'Feedbacks', 'Conquistas', 'Melhorias'],
                datasets: [{
                  label: 'Desempenho',
                  data: [
                    ${dados.portfolio.taxa_atualizacao_portfolio},
                    ${dados.portfolio.indice_feedbacks_positivos},
                    ${dados.portfolio.conquistas_validadas},
                    ${dados.portfolio.acoes_melhoria}
                  ],
                  borderColor: colors.primary,
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: colors.primary,
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 5
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { beginAtZero: true, max: 100 }
                }
              }
            });
          }
        </script>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Gerar PDF do Relatório Executivo usando Puppeteer
   * GET /api/relatorio-executivo/gerar-pdf/:id_cliente
   */
  async gerarPDFRelatorio(id_cliente, periodo = null) {
    try {
      logger.info('Gerando PDF do relatório executivo', { id_cliente, periodo });

      // Coletar dados do relatório
      const dados = await this.coletarTodosOsDados(id_cliente, periodo);

      // Gerar HTML
      const html = this.gerarHTMLRelatorio(dados);

      // Usar Puppeteer para converter HTML em PDF
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'domcontentloaded' });

        const pdfData = await page.pdf({
          format: 'A4',
          margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
          },
          printBackground: true
        });

        // Garantir que é um Buffer válido
        const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);
        
        logger.info('PDF gerado com sucesso', { id_cliente, tamanho: pdfBuffer.length });
        return pdfBuffer;

      } finally {
        await browser.close();
      }

    } catch (error) {
      logger.error('Erro ao gerar PDF:', error);
      throw new Error('Erro ao gerar PDF do relatório executivo: ' + error.message);
    }
  }

  /**
   * Gerar Excel do Relatório Executivo Completo
   * @param {number} id_cliente - ID do cliente
   * @param {string} periodo - Período de filtro (opcional)
   * @returns {Buffer} - Buffer do Excel
   */
  async gerarExcelRelatorio(id_cliente, periodo = null) {
    try {
      logger.info('Gerando Excel do relatório executivo', { id_cliente, periodo });

      // Coletar dados do relatório
      const dados = await this.coletarTodosOsDados(id_cliente, periodo);

      // Criar workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Resumo Executivo
      const sheetResumo = [
        ['RELATÓRIO EXECUTIVO - IMPULSIONAR TALENTOS'],
        [''],
        ['ID Cliente:', id_cliente],
        ['Data de Geração:', dados.data_geracao],
        ['Período:', dados.periodo_filtro],
        [''],
        ['=== VISÃO GERAL ==='],
        ['Métrica', 'Valor'],
        ['Índice de Engajamento Geral', dados.visao_geral.indice_engajamento_geral],
        ['Taxa de Evolução de Desenvolvimento', dados.visao_geral.taxa_evolucao_desenvolvimento + '%'],
        ['Nível Médio de Reconhecimento', dados.visao_geral.nivel_medio_reconhecimento],
        ['Índice de Satisfação Interna', dados.visao_geral.indice_satisfacao_interna + '%'],
        ['Maturidade de Carreira', dados.visao_geral.maturidade_carreira],
        [''],
        ['=== BEM-ESTAR EMOCIONAL ==='],
        ['Métrica', 'Valor'],
        ['Total de Check-ins', dados.bem_estar_emocional.checkin_emocional.total_checkins],
        ['Média de Nota de Bem-Estar', dados.bem_estar_emocional.checkin_emocional.media_nota_bem_estar],
        ['Total de Ações', dados.bem_estar_emocional.acoes_bem_estar.total_acoes],
        ['Ações Concluídas', dados.bem_estar_emocional.acoes_bem_estar.acoes_concluidas],
        ['Taxa de Conclusão de Ações', dados.bem_estar_emocional.acoes_bem_estar.percentual_conclusao + '%'],
      ];

      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetResumo), 'Resumo');

      // Sheet 2: Bem-Estar Emocional - Distribuição por Nota
      const sheetBemEstarDistribuicao = [
        ['BEM-ESTAR EMOCIONAL - DISTRIBUIÇÃO POR NOTA'],
        ['Nota', 'Quantidade'],
        ['1 - Muito Ruim', dados.bem_estar_emocional.checkin_emocional.distribuicao_por_nota.nota_1],
        ['2 - Ruim', dados.bem_estar_emocional.checkin_emocional.distribuicao_por_nota.nota_2],
        ['3 - Neutro', dados.bem_estar_emocional.checkin_emocional.distribuicao_por_nota.nota_3],
        ['4 - Bom', dados.bem_estar_emocional.checkin_emocional.distribuicao_por_nota.nota_4],
        ['5 - Excelente', dados.bem_estar_emocional.checkin_emocional.distribuicao_por_nota.nota_5],
        [''],
        ['CATEGORIAS DE MOTIVO'],
        ['Categoria', 'Quantidade'],
        ...dados.bem_estar_emocional.checkin_emocional.categorias_motivo.map(c => [c.categoria, c.quantidade])
      ];

      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetBemEstarDistribuicao), 'Bem-Estar Distribuição');

      // Sheet 3: Ações de Bem-Estar
      const sheetAcoesDistribuicao = [
        ['AÇÕES DE BEM-ESTAR - DISTRIBUIÇÃO'],
        ['Status', 'Quantidade'],
        ['Pendente', dados.bem_estar_emocional.acoes_bem_estar.acoes_pendentes],
        ['Em Progresso', dados.bem_estar_emocional.acoes_bem_estar.acoes_em_progresso],
        ['Concluída', dados.bem_estar_emocional.acoes_bem_estar.acoes_concluidas],
        ['Cancelada', dados.bem_estar_emocional.acoes_bem_estar.acoes_canceladas],
        [''],
        ['AÇÕES POR TIPO'],
        ['Tipo', 'Quantidade'],
        ...dados.bem_estar_emocional.acoes_bem_estar.acoes_por_tipo.map(t => [t.tipo_acao, t.quantidade]),
        [''],
        ['AÇÕES POR PRIORIDADE'],
        ['Prioridade', 'Quantidade'],
        ...dados.bem_estar_emocional.acoes_bem_estar.acoes_por_prioridade.map(p => [p.prioridade, p.quantidade])
      ];

      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetAcoesDistribuicao), 'Ações de Bem-Estar');

      // Sheet 4: Top Skills Reconhecidas
      if (dados.reconhecimento.top_skills_reconhecidas && dados.reconhecimento.top_skills_reconhecidas.length > 0) {
        const sheetSkills = [
          ['TOP SKILLS RECONHECIDAS'],
          ['Skill', 'Frequência'],
          ...dados.reconhecimento.top_skills_reconhecidas.map(s => [s.skill, s.frequencia])
        ];

        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetSkills), 'Top Skills');
      }

      // Converter para Buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      logger.info('Excel gerado com sucesso', { id_cliente });
      return excelBuffer;

    } catch (error) {
      logger.error('Erro ao gerar Excel:', error);
      throw new Error('Erro ao gerar Excel do relatório executivo: ' + error.message);
    }
  }
}

module.exports = new RelatorioExecutivoController();

