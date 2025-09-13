const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');

class DashboardController extends BaseController {
  /**
   * Buscar dashboard de gestão
   * GET /api/dashboard/gestor/:id_gestor
   */
  async buscarDashboardGestor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_gestor } = req.params;

      logger.info('Iniciando busca de dashboard de gestão', {
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

      // 1. Buscar membros da equipe
      const membrosQuery = `
        SELECT id, nome
        FROM usuarios
        WHERE id_gestor = $1
      `;
      const membrosResult = await client.query(membrosQuery, [id_gestor]);
      const membrosEquipe = membrosResult.rows.length;
      const usuariosIds = membrosResult.rows.map(row => row.id);

      if (usuariosIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum membro encontrado para este gestor',
          data: {
            gestor_id: parseInt(id_gestor),
            membros_equipe: 0,
            atividades_concluidas: 0,
            total_atividades: 0,
            metas_concluidas: 0,
            total_metas: 0,
            media_arvore_vida_equipe: 0,
            pontuacao_geral_usuarios: [],
            quantidade_swot_por_pilar: {
              fortalezas: 0,
              fraquezas: 0,
              oportunidades: 0,
              ameacas: 0
            },
            pilar_swot_por_colaborador: [],
            experiencias_por_colaborador: [],
            feedbacks_por_colaborador: []
          }
        });
      }

      // 2. Buscar atividades concluídas e total de atividades
      const atividadesQuery = `
        SELECT 
          COUNT(*) as total_atividades,
          COUNT(*) FILTER (WHERE a.status_atividade = 'concluida') as atividades_concluidas
        FROM metas_pdi m
        INNER JOIN atividades_pdi a ON m.id = a.id_meta_pdi
        WHERE m.id_usuario = ANY($1)
      `;
      const atividadesResult = await client.query(atividadesQuery, [usuariosIds]);
      const atividadesStats = atividadesResult.rows[0];
      const totalAtividades = parseInt(atividadesStats.total_atividades) || 0;
      const atividadesConcluidas = parseInt(atividadesStats.atividades_concluidas) || 0;

      // 3. Buscar metas concluídas e total de metas
      const metasQuery = `
        SELECT 
          COUNT(*) as total_metas,
          COUNT(*) FILTER (WHERE status = 'Concluida') as metas_concluidas
        FROM metas_pdi
        WHERE id_usuario = ANY($1)
      `;
      const metasResult = await client.query(metasQuery, [usuariosIds]);
      const metasStats = metasResult.rows[0];
      const totalMetas = parseInt(metasStats.total_metas) || 0;
      const metasConcluidas = parseInt(metasStats.metas_concluidas) || 0;

      // 4. Buscar média da árvore da vida e pontuação por usuário
      const arvoreQuery = `
        SELECT 
          u.id as usuario_id,
          u.nome as usuario_nome,
          a.pontuacao_geral
        FROM usuarios u
        LEFT JOIN arvore_da_vida a ON u.id = a.id_usuario
        WHERE u.id = ANY($1)
        ORDER BY u.nome
      `;
      const arvoreResult = await client.query(arvoreQuery, [usuariosIds]);
      
      const pontuacoesValidas = arvoreResult.rows
        .filter(row => row.pontuacao_geral !== null)
        .map(row => parseInt(row.pontuacao_geral));
      
      const mediaArvoreVida = pontuacoesValidas.length > 0 ? 
        Math.round(pontuacoesValidas.reduce((sum, p) => sum + p, 0) / pontuacoesValidas.length) : 0;

      const pontuacaoGeralUsuarios = arvoreResult.rows.map(row => ({
        usuario_id: row.usuario_id,
        usuario_nome: row.usuario_nome,
        pontuacao_geral: row.pontuacao_geral || 0
      }));

      // 5. Buscar análise SWOT
      const swotQuery = `
        SELECT 
          u.id as usuario_id,
          u.nome as usuario_nome,
          cs.categoria,
          COUNT(ans.id) as quantidade
        FROM usuarios u
        LEFT JOIN analise_swot ans ON u.id = ans.id_usuario
        LEFT JOIN categoria_swot cs ON ans.categoria_swot = cs.id
        WHERE u.id = ANY($1)
        GROUP BY u.id, u.nome, cs.categoria
        ORDER BY u.nome, cs.categoria
      `;
      const swotResult = await client.query(swotQuery, [usuariosIds]);

      // Processar dados SWOT
      const swotTotals = {
        'Fortalezas': 0,
        'Fraquezas': 0,
        'Oportunidades': 0,
        'Ameaças': 0
      };

      const swotPorColaborador = {};

      swotResult.rows.forEach(row => {
        if (row.categoria) {
          swotTotals[row.categoria] = (swotTotals[row.categoria] || 0) + parseInt(row.quantidade);
        }

        if (!swotPorColaborador[row.usuario_id]) {
          swotPorColaborador[row.usuario_id] = {
            usuario_id: row.usuario_id,
            usuario_nome: row.usuario_nome,
            fortalezas: 0,
            fraquezas: 0,
            oportunidades: 0,
            ameacas: 0
          };
        }

        if (row.categoria) {
          const categoriaKey = row.categoria.toLowerCase();
          if (swotPorColaborador[row.usuario_id][categoriaKey] !== undefined) {
            swotPorColaborador[row.usuario_id][categoriaKey] = parseInt(row.quantidade);
          }
        }
      });

      const pilarSwotPorColaborador = Object.values(swotPorColaborador);

      // 6. Buscar experiências por colaborador
      const experienciasQuery = `
        SELECT 
          u.id as usuario_id,
          u.nome as usuario_nome,
          COUNT(ep.id) as quantidade_experiencias
        FROM usuarios u
        LEFT JOIN experiencia_portifolio ep ON u.id = ep.id_usuario
        WHERE u.id = ANY($1)
        GROUP BY u.id, u.nome
        ORDER BY u.nome
      `;
      const experienciasResult = await client.query(experienciasQuery, [usuariosIds]);
      
      const experienciasPorColaborador = experienciasResult.rows.map(row => ({
        usuario_id: row.usuario_id,
        usuario_nome: row.usuario_nome,
        quantidade_experiencias: parseInt(row.quantidade_experiencias) || 0
      }));

      // 7. Buscar feedbacks por colaborador
      const feedbacksQuery = `
        SELECT 
          u.id as usuario_id,
          u.nome as usuario_nome,
          COUNT(fp.id) as quantidade_feedbacks
        FROM usuarios u
        LEFT JOIN experiencia_portifolio ep ON u.id = ep.id_usuario
        LEFT JOIN feedbacks_portifolio fp ON ep.id = fp.id_experiencia_portifolio
        WHERE u.id = ANY($1)
        GROUP BY u.id, u.nome
        ORDER BY u.nome
      `;
      const feedbacksResult = await client.query(feedbacksQuery, [usuariosIds]);
      
      const feedbacksPorColaborador = feedbacksResult.rows.map(row => ({
        usuario_id: row.usuario_id,
        usuario_nome: row.usuario_nome,
        quantidade_feedbacks: parseInt(row.quantidade_feedbacks) || 0
      }));

      logger.info('Dashboard de gestão buscado com sucesso', {
        gestor_id: id_gestor,
        membros_equipe: membrosEquipe,
        atividades_concluidas: atividadesConcluidas,
        total_atividades: totalAtividades,
        metas_concluidas: metasConcluidas,
        total_metas: totalMetas,
        media_arvore_vida: mediaArvoreVida
      });

      return res.status(200).json({
        success: true,
        message: 'Dashboard de gestão buscado com sucesso',
        data: {
          gestor_id: parseInt(id_gestor),
          membros_equipe: membrosEquipe,
          atividades_concluidas: atividadesConcluidas,
          total_atividades: totalAtividades,
          metas_concluidas: metasConcluidas,
          total_metas: totalMetas,
          media_arvore_vida_equipe: mediaArvoreVida,
          pontuacao_geral_usuarios: pontuacaoGeralUsuarios,
          quantidade_swot_por_pilar: {
            fortalezas: swotTotals['Fortalezas'] || 0,
            fraquezas: swotTotals['Fraquezas'] || 0,
            oportunidades: swotTotals['Oportunidades'] || 0,
            ameacas: swotTotals['Ameaças'] || 0
          },
          pilar_swot_por_colaborador: pilarSwotPorColaborador,
          experiencias_por_colaborador: experienciasPorColaborador,
          feedbacks_por_colaborador: feedbacksPorColaborador
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar dashboard de gestão', { 
        error: error.message, 
        stack: error.stack,
        gestor_id: req.params.id_gestor
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
   * Buscar árvore da vida da equipe por gestor
   * GET /api/dashboard/arvore-da-vida/:id_gestor
   */
  async buscarArvoreDaVidaPorGestor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_gestor } = req.params;

      logger.info('Iniciando busca de árvore da vida por gestor', {
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

      // Buscar colaboradores da equipe com suas árvores da vida
      const arvoreQuery = `
        SELECT 
          u.id as usuario_id,
          u.nome,
          a.pontuacao_geral,
          a.criatividade_hobbie,
          a.plenitude_felicidade,
          a.espiritualidade,
          a.saude_disposicao,
          a.desenvolvimento_intelectual,
          a.equilibrio_emocional,
          a.familia,
          a.desenvolvimento_amoroso,
          a.vida_social,
          a.realizacao_proposito,
          a.recursos_financeiros,
          a.contribuicao_social
        FROM usuarios u
        LEFT JOIN arvore_da_vida a ON u.id = a.id_usuario
        WHERE u.id_gestor = $1
        ORDER BY u.nome
      `;
      
      const arvoreResult = await client.query(arvoreQuery, [id_gestor]);
      
      if (arvoreResult.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum colaborador encontrado para este gestor',
          data: {
            gestor_id: parseInt(id_gestor),
            total_colaboradores: 0,
            media_geral: 0,
            maior_pontuacao: 0,
            colaborador: []
          }
        });
      }

      // Processar dados dos colaboradores
      const colaboradores = arvoreResult.rows.map(row => ({
        nome: row.nome,
        pontuacao_geral: row.pontuacao_geral || 0,
        criatividade_hobbie: row.criatividade_hobbie || 0,
        plenitude_felicidade: row.plenitude_felicidade || 0,
        espiritualidade: row.espiritualidade || 0,
        saude_disposicao: row.saude_disposicao || 0,
        desenvolvimento_intelectual: row.desenvolvimento_intelectual || 0,
        equilibrio_emocional: row.equilibrio_emocional || 0,
        familia: row.familia || 0,
        desenvolvimento_amoroso: row.desenvolvimento_amoroso || 0,
        vida_social: row.vida_social || 0,
        realizacao_proposito: row.realizacao_proposito || 0,
        recursos_financeiros: row.recursos_financeiros || 0,
        contribuicao_social: row.contribuicao_social || 0
      }));

      // Calcular estatísticas
      const totalColaboradores = colaboradores.length;
      const pontuacoesGerais = colaboradores
        .map(c => c.pontuacao_geral)
        .filter(p => p > 0);
      
      const mediaGeral = pontuacoesGerais.length > 0 ? 
        Math.round(pontuacoesGerais.reduce((sum, p) => sum + p, 0) / pontuacoesGerais.length) : 0;
      
      const maiorPontuacao = pontuacoesGerais.length > 0 ? 
        Math.max(...pontuacoesGerais) : 0;

      logger.info('Árvore da vida por gestor buscada com sucesso', {
        gestor_id: id_gestor,
        total_colaboradores: totalColaboradores,
        media_geral: mediaGeral,
        maior_pontuacao: maiorPontuacao
      });

      return res.status(200).json({
        success: true,
        message: 'Árvore da vida da equipe buscada com sucesso',
        data: {
          gestor_id: parseInt(id_gestor),
          total_colaboradores: totalColaboradores,
          media_geral: mediaGeral,
          maior_pontuacao: maiorPontuacao,
          colaborador: colaboradores
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar árvore da vida por gestor', { 
        error: error.message, 
        stack: error.stack,
        gestor_id: req.params.id_gestor
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
   * Buscar análise SWOT da equipe por gestor
   * GET /api/dashboard/analise-swot/:id_gestor
   */
  async buscarAnaliseSwotPorGestor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_gestor } = req.params;

      logger.info('Iniciando busca de análise SWOT por gestor', {
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

      // Buscar dados SWOT dos colaboradores da equipe
      const swotQuery = `
        SELECT 
          u.id as usuario_id,
          u.nome,
          cs.categoria,
          ts.texto
        FROM usuarios u
        JOIN analise_swot ans ON u.id = ans.id_usuario
        JOIN textos_swot ts ON ans.id_texto_swot = ts.id
        LEFT JOIN categoria_swot cs ON ans.categoria_swot = cs.id
        WHERE u.id_gestor = $1
        ORDER BY u.nome, cs.categoria, ts.created_at
      `;
      
      const swotResult = await client.query(swotQuery, [id_gestor]);
      
      if (swotResult.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhuma análise SWOT encontrada para este gestor',
          data: {
            gestor_id: parseInt(id_gestor),
            total_forcas: 0,
            total_fraquezas: 0,
            total_oportunidades: 0,
            total_ameacas: 0,
            colaborador: []
          }
        });
      }

      // Processar dados SWOT por colaborador
      const colaboradoresMap = new Map();
      const contadores = {
        forcas: 0,
        fraquezas: 0,
        oportunidades: 0,
        ameacas: 0
      };

      swotResult.rows.forEach(row => {
        const { usuario_id, nome, categoria, texto } = row;
        
        if (!colaboradoresMap.has(usuario_id)) {
          colaboradoresMap.set(usuario_id, {
            nome,
            pilar1: [], // Forças
            pilar2: [], // Fraquezas  
            pilar3: [], // Oportunidades
            pilar4: []  // Ameaças
          });
        }

        const colaborador = colaboradoresMap.get(usuario_id);

        // Mapear categoria para pilar e incrementar contadores
        switch (categoria?.toLowerCase()) {
          case 'forças':
          case 'forcas':
          case 'força':
          case 'forca':
            colaborador.pilar1.push(texto);
            contadores.forcas++;
            break;
          case 'fraquezas':
          case 'fraqueza':
            colaborador.pilar2.push(texto);
            contadores.fraquezas++;
            break;
          case 'oportunidades':
          case 'oportunidade':
            colaborador.pilar3.push(texto);
            contadores.oportunidades++;
            break;
          case 'ameaças':
          case 'ameacas':
          case 'ameaça':
          case 'ameaca':
            colaborador.pilar4.push(texto);
            contadores.ameacas++;
            break;
          default:
            // Se categoria não reconhecida, adicionar em pilar1 como padrão
            colaborador.pilar1.push(texto);
            contadores.forcas++;
            break;
        }
      });

      // Converter Map para Array
      const colaboradores = Array.from(colaboradoresMap.values());

      logger.info('Análise SWOT por gestor buscada com sucesso', {
        gestor_id: id_gestor,
        total_colaboradores: colaboradores.length,
        total_forcas: contadores.forcas,
        total_fraquezas: contadores.fraquezas,
        total_oportunidades: contadores.oportunidades,
        total_ameacas: contadores.ameacas
      });

      return res.status(200).json({
        success: true,
        message: 'Análise SWOT da equipe buscada com sucesso',
        data: {
          gestor_id: parseInt(id_gestor),
          total_forcas: contadores.forcas,
          total_fraquezas: contadores.fraquezas,
          total_oportunidades: contadores.oportunidades,
          total_ameacas: contadores.ameacas,
          colaborador: colaboradores
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar análise SWOT por gestor', { 
        error: error.message, 
        stack: error.stack,
        gestor_id: req.params.id_gestor
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
   * Buscar portfólio da equipe por gestor
   * GET /api/dashboard/portifolio/:id_gestor
   */
  async buscarPortifolioPorGestor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_gestor } = req.params;

      logger.info('Iniciando busca de portfólio por gestor', {
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

      // Buscar dados do portfólio dos colaboradores da equipe
      const portifolioQuery = `
        SELECT 
          u.id as usuario_id,
          u.nome,
          ep.id as experiencia_id,
          ep.titulo_experiencia as titulo,
          ep.data_experiencia as data,
          ep.acao_realizada,
          ep.resultado_entregue,
          fp.feedback,
          mp.material as link
        FROM usuarios u
        LEFT JOIN experiencia_portifolio ep ON u.id = ep.id_usuario
        LEFT JOIN feedbacks_portifolio fp ON ep.id = fp.id_experiencia_portifolio
        LEFT JOIN materiais_portifolio mp ON ep.id = mp.id_experiencia_portifolio
        WHERE u.id_gestor = $1
        ORDER BY u.nome, ep.data_experiencia DESC, ep.id, fp.id, mp.id
      `;
      
      const portifolioResult = await client.query(portifolioQuery, [id_gestor]);
      
      if (portifolioResult.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum portfólio encontrado para este gestor',
          data: {
            gestor_id: parseInt(id_gestor),
            quantidade_links: 0,
            quantidade_feedbacks: 0,
            quantidade_acoes: 0,
            quantidade_resultados: 0,
            colaborador: []
          }
        });
      }

      // Processar dados do portfólio por colaborador
      const colaboradoresMap = new Map();
      const contadores = {
        links: 0,
        feedbacks: 0,
        acoes: 0,
        resultados: 0
      };

      portifolioResult.rows.forEach(row => {
        const { usuario_id, nome, experiencia_id, titulo, data, acao_realizada, resultado_entregue, feedback, link } = row;
        
        // Se não há experiência, pular (LEFT JOIN pode retornar usuários sem experiências)
        if (!experiencia_id) {
          // Adicionar colaborador mesmo sem experiências
          if (!colaboradoresMap.has(usuario_id)) {
            colaboradoresMap.set(usuario_id, {
              nome,
              experiencias: []
            });
          }
          return;
        }

        if (!colaboradoresMap.has(usuario_id)) {
          colaboradoresMap.set(usuario_id, {
            nome,
            experiencias: []
          });
        }

        const colaborador = colaboradoresMap.get(usuario_id);
        
        // Encontrar ou criar experiência
        let experiencia = colaborador.experiencias.find(exp => exp.experiencia_id === experiencia_id);
        
        if (!experiencia) {
          experiencia = {
            experiencia_id,
            titulo: titulo || '',
            data: data ? data.toISOString().split('T')[0] : null,
            acao_realizada: acao_realizada || '',
            resultado_entregue: resultado_entregue || '',
            feedbacks: [],
            links: []
          };
          colaborador.experiencias.push(experiencia);

          // Contar ações e resultados (uma vez por experiência)
          if (acao_realizada && acao_realizada.trim().length > 0) {
            contadores.acoes++;
          }
          if (resultado_entregue && resultado_entregue.trim().length > 0) {
            contadores.resultados++;
          }
        }

        // Adicionar feedback se existir e não duplicar
        if (feedback && feedback.trim().length > 0 && !experiencia.feedbacks.includes(feedback)) {
          experiencia.feedbacks.push(feedback);
          contadores.feedbacks++;
        }

        // Adicionar link se existir e não duplicar
        if (link && link.trim().length > 0 && !experiencia.links.includes(link)) {
          experiencia.links.push(link);
          contadores.links++;
        }
      });

      // Converter Map para Array e formatar experiências
      const colaboradores = Array.from(colaboradoresMap.values()).map(colaborador => {
        const experienciasFormatadas = {};
        
        colaborador.experiencias.forEach((exp, index) => {
          const experienciaKey = `experiencia${index + 1}`;
          experienciasFormatadas[experienciaKey] = {
            titulo: exp.titulo,
            data: exp.data,
            acao_realizada: exp.acao_realizada,
            resultado_entregue: exp.resultado_entregue,
            feedback: exp.feedbacks.join('; '), // Concatenar múltiplos feedbacks
            link: exp.links.join('; ') // Concatenar múltiplos links
          };
        });

        return {
          nome: colaborador.nome,
          ...experienciasFormatadas
        };
      });

      logger.info('Portfólio por gestor buscado com sucesso', {
        gestor_id: id_gestor,
        total_colaboradores: colaboradores.length,
        quantidade_links: contadores.links,
        quantidade_feedbacks: contadores.feedbacks,
        quantidade_acoes: contadores.acoes,
        quantidade_resultados: contadores.resultados
      });

      return res.status(200).json({
        success: true,
        message: 'Portfólio da equipe buscado com sucesso',
        data: {
          gestor_id: parseInt(id_gestor),
          quantidade_links: contadores.links,
          quantidade_feedbacks: contadores.feedbacks,
          quantidade_acoes: contadores.acoes,
          quantidade_resultados: contadores.resultados,
          colaborador: colaboradores
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar portfólio por gestor', { 
        error: error.message, 
        stack: error.stack,
        gestor_id: req.params.id_gestor
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
   * Buscar dashboard de gestão de RH
   * GET /api/dashboard/rh
   */
  async buscarDashboardRH(req, res) {
    const client = await pool.connect();
    
    try {
      logger.info('Iniciando busca de dashboard de RH');

      // 1. Buscar total de colaboradores
      const totalColaboradoresQuery = `
        SELECT COUNT(*) as total_colaboradores
        FROM usuarios
        WHERE id IS NOT NULL
      `;
      const totalColaboradoresResult = await client.query(totalColaboradoresQuery);
      const totalColaboradores = parseInt(totalColaboradoresResult.rows[0].total_colaboradores) || 0;

      // 2. Buscar gestores ativos (usuários que são gestores de outros usuários)
      const gestoresAtivosQuery = `
        SELECT COUNT(DISTINCT id_gestor) as gestores_ativos
        FROM usuarios
        WHERE id_gestor IS NOT NULL
      `;
      const gestoresAtivosResult = await client.query(gestoresAtivosQuery);
      const gestoresAtivos = parseInt(gestoresAtivosResult.rows[0].gestores_ativos) || 0;

      // 3. Buscar metas concluídas e abertas
      const metasQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'Concluida') as metas_concluidas,
          COUNT(*) FILTER (WHERE status != 'Concluida' OR status IS NULL) as metas_abertas
        FROM metas_pdi
      `;
      const metasResult = await client.query(metasQuery);
      const metasStats = metasResult.rows[0];
      const metasConcluidas = parseInt(metasStats.metas_concluidas) || 0;
      const metasAbertas = parseInt(metasStats.metas_abertas) || 0;

      // 4. Buscar progresso das metas por departamento
      const metasDepartamentoQuery = `
        SELECT 
          d.titulo_departamento as departamento,
          COUNT(m.id) as total_metas,
          COUNT(m.id) FILTER (WHERE m.status = 'Concluida') as metas_concluidas,
          COUNT(m.id) FILTER (WHERE m.status != 'Concluida' OR m.status IS NULL) as metas_abertas
        FROM departamento d
        LEFT JOIN usuarios u ON d.id = u.id_departamento
        LEFT JOIN metas_pdi m ON u.id = m.id_usuario
        GROUP BY d.id, d.titulo_departamento
        ORDER BY d.titulo_departamento
      `;
      const metasDepartamentoResult = await client.query(metasDepartamentoQuery);
      
      const metasDepartamento = metasDepartamentoResult.rows.map(row => {
        const totalMetas = parseInt(row.total_metas) || 0;
        const metasConcluidas = parseInt(row.metas_concluidas) || 0;
        const progressoPercent = totalMetas > 0 ? Math.round((metasConcluidas / totalMetas) * 100) : 0;
        
        return {
          departamento: row.departamento || 'Sem departamento',
          progresso_das_metas: `${progressoPercent}% (${metasConcluidas}/${totalMetas})`
        };
      });

      // 5. Buscar progresso das metas por gestor
      const metasGestorQuery = `
        SELECT 
          g.nome as gestor,
          COUNT(m.id) as total_metas,
          COUNT(m.id) FILTER (WHERE m.status = 'Concluida') as metas_concluidas,
          COUNT(m.id) FILTER (WHERE m.status != 'Concluida' OR m.status IS NULL) as metas_abertas
        FROM usuarios g
        INNER JOIN usuarios u ON g.id = u.id_gestor
        LEFT JOIN metas_pdi m ON u.id = m.id_usuario
        GROUP BY g.id, g.nome
        ORDER BY g.nome
      `;
      const metasGestorResult = await client.query(metasGestorQuery);
      
      const metasGestor = metasGestorResult.rows.map(row => {
        const totalMetas = parseInt(row.total_metas) || 0;
        const metasConcluidas = parseInt(row.metas_concluidas) || 0;
        const progressoPercent = totalMetas > 0 ? Math.round((metasConcluidas / totalMetas) * 100) : 0;
        
        return {
          gestor: row.gestor,
          progresso_das_metas: `${progressoPercent}% (${metasConcluidas}/${totalMetas})`
        };
      });

      logger.info('Dashboard de RH buscado com sucesso', {
        total_colaboradores: totalColaboradores,
        gestores_ativos: gestoresAtivos,
        metas_concluidas: metasConcluidas,
        metas_abertas: metasAbertas,
        departamentos: metasDepartamento.length,
        gestores: metasGestor.length
      });

      return res.status(200).json({
        success: true,
        message: 'Dashboard de RH buscado com sucesso',
        data: {
          total_colaboradores: totalColaboradores,
          gestores_ativos: gestoresAtivos,
          metas_concluidas: metasConcluidas,
          metas_abertas: metasAbertas,
          metas_departamento: metasDepartamento,
          metas_gestor: metasGestor
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar dashboard de RH', { 
        error: error.message, 
        stack: error.stack
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

module.exports = new DashboardController();

