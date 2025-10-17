const express = require('express');
const relatorioExecutivoController = require('../controllers/relatorio_executivo.controller');

const router = express.Router();

// ========== APIs DE VISÃO GERAL ==========

/**
 * @route GET /api/relatorio-executivo/indice-engajamento-geral/:id_cliente
 * @desc Índice de Engajamento Geral (IEG) - Média ponderada dos pilares da Árvore da Vida
 * @access Private
 */
router.get('/indice-engajamento-geral/:id_cliente', relatorioExecutivoController.getIndiceEngajamentoGeral);

/**
 * @route GET /api/relatorio-executivo/taxa-evolucao-desenvolvimento/:id_cliente
 * @desc Taxa de Evolução de Desenvolvimento (TED) - (Atividades concluídas ÷ Atividades planejadas no PDI) × 100
 * @access Private
 */
router.get('/taxa-evolucao-desenvolvimento/:id_cliente', relatorioExecutivoController.getTaxaEvolucaoDesenvolvimento);

/**
 * @route GET /api/relatorio-executivo/nivel-medio-reconhecimento/:id_cliente
 * @desc Nível Médio de Reconhecimento (NMR) - Total de reconhecimentos dados + recebidos ÷ Colaboradores ativos
 * @access Private
 */
router.get('/nivel-medio-reconhecimento/:id_cliente', relatorioExecutivoController.getNivelMedioReconhecimento);

/**
 * @route GET /api/relatorio-executivo/indice-satisfacao-interna/:id_cliente
 * @desc Índice de Satisfação Interna (ISI) - Média ponderada de feedbacks positivos no portfólio
 * @access Private
 */
router.get('/indice-satisfacao-interna/:id_cliente', relatorioExecutivoController.getIndiceSatisfacaoInterna);

/**
 * @route GET /api/relatorio-executivo/maturidade-carreira/:id_cliente
 * @desc Maturidade de Carreira (MC) - (Metas concluídas + Evoluções de Portfólio) ÷ Tempo de casa
 * @access Private
 */
router.get('/maturidade-carreira/:id_cliente', relatorioExecutivoController.getMaturidadeCarreira);

// ========== APIs DE ÁRVORE DA VIDA ==========

/**
 * @route GET /api/relatorio-executivo/indice-plenitude/:id_cliente
 * @desc Índice de Plenitude - Média dos pilares Plenitude, Felicidade e Realização
 * @access Private
 */
router.get('/indice-plenitude/:id_cliente', relatorioExecutivoController.getIndicePlenitude);

/**
 * @route GET /api/relatorio-executivo/indice-vitalidade/:id_cliente
 * @desc Índice de Vitalidade - Média dos pilares Saúde, Equilíbrio Emocional e Energia
 * @access Private
 */
router.get('/indice-vitalidade/:id_cliente', relatorioExecutivoController.getIndiceVitalidade);

/**
 * @route GET /api/relatorio-executivo/indice-proposito-contribuicao/:id_cliente
 * @desc Índice de Propósito e Contribuição - Média de Espiritualidade + Contribuição Social
 * @access Private
 */
router.get('/indice-proposito-contribuicao/:id_cliente', relatorioExecutivoController.getIndicePropositoContribuicao);

/**
 * @route GET /api/relatorio-executivo/indice-profissional-global/:id_cliente
 * @desc Índice Profissional Global - Média de Profissional + Desenvolvimento Intelectual + Recursos Financeiros
 * @access Private
 */
router.get('/indice-profissional-global/:id_cliente', relatorioExecutivoController.getIndiceProfissionalGlobal);

// ========== APIs DE ANÁLISE SWOT ==========

/**
 * @route GET /api/relatorio-executivo/forcas-vs-fraquezas-ratio/:id_cliente
 * @desc Forças vs Fraquezas Ratio (FFR) - Nº de forças ÷ Nº de fraquezas
 * @access Private
 */
router.get('/forcas-vs-fraquezas-ratio/:id_cliente', relatorioExecutivoController.getForcasVsFraquezasRatio);

/**
 * @route GET /api/relatorio-executivo/oportunidades-aproveitadas/:id_cliente
 * @desc Oportunidades Aproveitadas (%) - Oportunidades transformadas em ações do PDI ÷ Total de oportunidades
 * @access Private
 */
router.get('/oportunidades-aproveitadas/:id_cliente', relatorioExecutivoController.getOportunidadesAproveitadas);

/**
 * @route GET /api/relatorio-executivo/ameacas-monitoradas/:id_cliente
 * @desc Ameaças Monitoradas (%) - Ameaças com plano mitigado ÷ Total de ameaças
 * @access Private
 */
router.get('/ameacas-monitoradas/:id_cliente', relatorioExecutivoController.getAmeacasMonitoradas);

// ========== APIs DE PDI ==========

/**
 * @route GET /api/relatorio-executivo/progresso-medio-pdi/:id_cliente
 * @desc Progresso Médio do PDI - % de atividades concluídas
 * @access Private
 */
router.get('/progresso-medio-pdi/:id_cliente', relatorioExecutivoController.getProgressoMedioPDI);

/**
 * @route GET /api/relatorio-executivo/taxa-metas-progresso/:id_cliente
 * @desc Taxa de Metas em Progresso - Metas "em andamento" ÷ Total de metas
 * @access Private
 */
router.get('/taxa-metas-progresso/:id_cliente', relatorioExecutivoController.getTaxaMetasProgresso);

/**
 * @route GET /api/relatorio-executivo/aderencia-prazo/:id_cliente
 * @desc Aderência ao Prazo - Metas dentro do prazo ÷ Total de metas
 * @access Private
 */
router.get('/aderencia-prazo/:id_cliente', relatorioExecutivoController.getAderenciaPrazo);

/**
 * @route GET /api/relatorio-executivo/engajamento-mentoria/:id_cliente
 * @desc Engajamento com Mentoria - Participações em mentorias ÷ Colaboradores ativos
 * @access Private
 */
router.get('/engajamento-mentoria/:id_cliente', relatorioExecutivoController.getEngajamentoMentoria);

// ========== APIs DE PORTFÓLIO ==========

/**
 * @route GET /api/relatorio-executivo/taxa-atualizacao-portfolio/:id_cliente
 * @desc Taxa de Atualização do Portfólio - Colaboradores com experiências registradas nos últimos 90 dias ÷ Total
 * @access Private
 */
router.get('/taxa-atualizacao-portfolio/:id_cliente', relatorioExecutivoController.getTaxaAtualizacaoPortfolio);

/**
 * @route GET /api/relatorio-executivo/indice-feedbacks-positivos/:id_cliente
 * @desc Índice de Feedbacks Positivos - Feedbacks positivos ÷ Total de feedbacks
 * @access Private
 */
router.get('/indice-feedbacks-positivos/:id_cliente', relatorioExecutivoController.getIndiceFeedbacksPositivos);

/**
 * @route GET /api/relatorio-executivo/conquistas-validadas/:id_cliente
 * @desc Conquistas Validadas (%) - Experiências com evidências comprovadas ÷ Total
 * @access Private
 */
router.get('/conquistas-validadas/:id_cliente', relatorioExecutivoController.getConquistasValidadas);

/**
 * @route GET /api/relatorio-executivo/acoes-melhoria/:id_cliente
 * @desc Ações de Melhoria - Média de ações registradas por colaborador
 * @access Private
 */
router.get('/acoes-melhoria/:id_cliente', relatorioExecutivoController.getAcoesMelhoria);

// ========== APIs DE PROGRAMA DE RECONHECIMENTO ==========

/**
 * @route GET /api/relatorio-executivo/reconhecimentos-por-colaborador/:id_cliente
 * @desc Reconhecimentos por Colaborador - Total de reconhecimentos ÷ Total de colaboradores
 * @access Private
 */
router.get('/reconhecimentos-por-colaborador/:id_cliente', relatorioExecutivoController.getReconhecimentosPorColaborador);

/**
 * @route GET /api/relatorio-executivo/top-skills-reconhecidas/:id_cliente
 * @desc Top Skills Reconhecidas - Habilidades mais citadas nos reconhecimentos
 * @access Private
 */
router.get('/top-skills-reconhecidas/:id_cliente', relatorioExecutivoController.getTopSkillsReconhecidas);

/**
 * @route GET /api/relatorio-executivo/tempo-medio-entre-reconhecimentos/:id_cliente
 * @desc Tempo Médio entre Reconhecimentos - Dias médios entre reconhecimentos por colaborador
 * @access Private
 */
router.get('/tempo-medio-entre-reconhecimentos/:id_cliente', relatorioExecutivoController.getTempoMedioEntreReconhecimentos);

/**
 * @route GET /api/relatorio-executivo/distribuicao-reconhecimento-por-area/:id_cliente
 * @desc Distribuição de Reconhecimento por Área - Percentual por departamento
 * @access Private
 */
router.get('/distribuicao-reconhecimento-por-area/:id_cliente', relatorioExecutivoController.getDistribuicaoReconhecimentoPorArea);

// ========== KPIs DE TENDÊNCIA ==========

/**
 * @route GET /api/relatorio-executivo/indice-reconhecimento-reciproco/:id_cliente
 * @desc Índice de Reconhecimento Recíproco - Reconhecimentos dados e recebidos por par
 * @access Private
 */
router.get('/indice-reconhecimento-reciproco/:id_cliente', relatorioExecutivoController.getIndiceReconhecimentoReciproco);

/**
 * @route GET /api/relatorio-executivo/indice-bem-estar-organizacional/:id_cliente
 * @desc Índice de Bem-Estar Organizacional - Média de Plenitude + Saúde + Equilíbrio emocional
 * @access Private
 */
router.get('/indice-bem-estar-organizacional/:id_cliente', relatorioExecutivoController.getIndiceBemEstarOrganizacional);

/**
 * @route GET /api/relatorio-executivo/tempo-medio-evolucao-meta/:id_cliente
 * @desc Tempo Médio de Evolução de Meta - Dias até conclusão de metas
 * @access Private
 */
router.get('/tempo-medio-evolucao-meta/:id_cliente', relatorioExecutivoController.getTempoMedioEvolucaoMeta);

// ========== APIs DE GERAÇÃO DE RELATÓRIOS ==========

/**
 * @route GET /api/relatorio-executivo/gerar-pdf/:id_cliente
 * @desc Gerar PDF do Relatório Executivo completo
 * @access Private
 */
router.get('/gerar-pdf/:id_cliente', relatorioExecutivoController.gerarPDFRelatorio);

/**
 * @route GET /api/relatorio-executivo/gerar-excel/:id_cliente
 * @desc Gerar Excel do Relatório Executivo completo
 * @access Private
 */
router.get('/gerar-excel/:id_cliente', relatorioExecutivoController.gerarExcelRelatorio);

module.exports = router;

