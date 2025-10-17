const { query } = require('../utils/supabase');
const ApiResponse = require('../utils/response');
const { BaseController } = require('./index');

class AnaliseSwotController extends BaseController {
  constructor() {
    super();
    this.salvarAnaliseSwot = this.salvarAnaliseSwot.bind(this);
    this.getAnaliseSwot = this.getAnaliseSwot.bind(this);
    this.verificarPeriodoAtualizacao = this.verificarPeriodoAtualizacao.bind(this);
  }

  // POST - Salvar/Atualizar análise SWOT
  async salvarAnaliseSwot(req, res) {
    try {
      console.log('🔍 [ANALISE_SWOT] Iniciando salvarAnaliseSwot');
      console.log('📝 [ANALISE_SWOT] Request body:', JSON.stringify(req.body, null, 2));
      
      const { id_usuario, textos_por_categoria } = req.body;

      // Validar campos obrigatórios
      if (!id_usuario) {
        console.log('❌ [ANALISE_SWOT] Validação falhou - id_usuario não fornecido');
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      if (!textos_por_categoria || !Array.isArray(textos_por_categoria)) {
        console.log('❌ [ANALISE_SWOT] Validação falhou - textos_por_categoria não fornecido ou inválido');
        return ApiResponse.validationError(res, 'textos_por_categoria deve ser um array');
      }

      console.log('✅ [ANALISE_SWOT] id_usuario válido:', id_usuario);
      console.log('✅ [ANALISE_SWOT] textos_por_categoria válido:', textos_por_categoria.length, 'categorias');

      // Validar estrutura dos dados
      for (const categoria of textos_por_categoria) {
        if (!categoria.id_categoria_swot || !Array.isArray(categoria.textos)) {
          console.log('❌ [ANALISE_SWOT] Estrutura inválida para categoria:', categoria);
          return ApiResponse.validationError(res, 'Cada categoria deve ter id_categoria_swot e textos (array)');
        }

        const idCategoria = Number(categoria.id_categoria_swot);

        // Validar se a categoria existe
        if (![1, 2, 3, 4].includes(idCategoria)) {
          console.log('❌ [ANALISE_SWOT] Categoria inválida:', categoria.id_categoria_swot);
          return ApiResponse.validationError(res, 'id_categoria_swot deve ser 1, 2, 3 ou 4');
        }

        // Validar textos
        for (const texto of categoria.textos) {
          if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
            console.log('❌ [ANALISE_SWOT] Texto inválido:', texto);
            return ApiResponse.validationError(res, 'Todos os textos devem ser strings não vazias');
          }
        }
      }

      console.log('✅ [ANALISE_SWOT] Todos os dados válidos');

      console.log('🔄 [ANALISE_SWOT] Iniciando transação');
      // Iniciar transação para garantir consistência
      const client = await query('BEGIN');

      try {
        const resultados = [];

        // Processar cada categoria
        for (const categoria of textos_por_categoria) {
          const { id_categoria_swot, textos } = categoria;
          
          console.log(`🔄 [ANALISE_SWOT] Processando categoria ${id_categoria_swot} com ${textos.length} textos`);

          // 1. Buscar textos existentes para esta categoria e usuário
          console.log('🔍 [ANALISE_SWOT] Buscando textos existentes...');
          const textosExistentesResult = await query(`
            SELECT ts.texto
            FROM analise_swot asw
            JOIN textos_swot ts ON asw.id_texto_swot = ts.id
            WHERE asw.id_usuario = $1 AND asw.categoria_swot = $2
          `, [id_usuario, id_categoria_swot]);

          const textosExistentes = textosExistentesResult.rows.map(row => row.texto.trim());
          console.log(`📝 [ANALISE_SWOT] Textos existentes encontrados: ${textosExistentes.length}`);

          // 2. Filtrar apenas textos novos (que não existem)
          const textosNovos = textos.filter(texto => {
            const textoTrimmed = texto.trim();
            return !textosExistentes.includes(textoTrimmed);
          });

          console.log(`➕ [ANALISE_SWOT] Textos novos para inserir: ${textosNovos.length}`);

          // 3. Inserir apenas textos novos
          if (textosNovos.length > 0) {
            console.log('➕ [ANALISE_SWOT] Inserindo textos novos...');
            
            for (const texto of textosNovos) {
              // Inserir texto na tabela textos_swot
              const textoResult = await query(`
                INSERT INTO textos_swot (texto) 
                VALUES ($1) 
                RETURNING id
              `, [texto.trim()]);

              const id_texto_swot = textoResult.rows[0].id;
              console.log(`📝 [ANALISE_SWOT] Texto inserido com ID: ${id_texto_swot}`);

              // Inserir relação na tabela analise_swot
              await query(`
                INSERT INTO analise_swot (id_usuario, categoria_swot, id_texto_swot) 
                VALUES ($1, $2, $3)
              `, [id_usuario, id_categoria_swot, id_texto_swot]);

              console.log(`✅ [ANALISE_SWOT] Relação inserida: usuário ${id_usuario}, categoria ${id_categoria_swot}, texto ${id_texto_swot}`);
            }
          } else {
            console.log('ℹ️ [ANALISE_SWOT] Nenhum texto novo para inserir nesta categoria');
          }

          resultados.push({
            id_categoria_swot,
            textos_existentes: textosExistentes.length,
            textos_novos: textosNovos.length,
            textos_inseridos: textosNovos.length,
            textos_novos_lista: textosNovos
          });
        }

        console.log('✅ [ANALISE_SWOT] Commit da transação');
        await query('COMMIT');

        return ApiResponse.success(res, {
          id_usuario: parseInt(id_usuario),
          categorias_processadas: resultados,
          total_textos_inseridos: resultados.reduce((sum, cat) => sum + cat.textos_inseridos, 0),
          total_textos_existentes: resultados.reduce((sum, cat) => sum + cat.textos_existentes, 0),
          total_textos_novos: resultados.reduce((sum, cat) => sum + cat.textos_novos, 0)
        }, 'Análise SWOT atualizada com sucesso - apenas textos novos foram inseridos');

      } catch (error) {
        console.log('❌ [ANALISE_SWOT] Erro durante transação:', error.message);
        console.log('❌ [ANALISE_SWOT] Stack trace:', error.stack);
        console.log('🔄 [ANALISE_SWOT] Fazendo rollback...');
        await query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.log('❌ [ANALISE_SWOT] Erro geral no salvarAnaliseSwot:', error.message);
      console.log('❌ [ANALISE_SWOT] Stack trace:', error.stack);
      return this.handleError(res, error, 'Erro ao salvar análise SWOT');
    }
  }

  // GET - Buscar análise SWOT do usuário
  async getAnaliseSwot(req, res) {
    try {
      console.log('🔍 [ANALISE_SWOT] Iniciando getAnaliseSwot');
      console.log('📝 [ANALISE_SWOT] Params:', req.params);
      
      const { id_usuario } = req.params;

      // Validar se o id_usuario foi fornecido
      if (!id_usuario) {
        console.log('❌ [ANALISE_SWOT] id_usuario não fornecido');
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      console.log('✅ [ANALISE_SWOT] id_usuario válido:', id_usuario);

      console.log('🔍 [ANALISE_SWOT] Buscando análise SWOT...');
      // Buscar análise SWOT do usuário agrupada por categoria
      const analiseResult = await query(`
        SELECT 
          cs.id as id_categoria_swot,
          cs.categoria,
          ts.id as id_texto_swot,
          ts.texto,
          ts.created_at as texto_created_at
        FROM 
          analise_swot asw
        JOIN 
          categoria_swot cs ON asw.categoria_swot = cs.id
        JOIN 
          textos_swot ts ON asw.id_texto_swot = ts.id
        WHERE 
          asw.id_usuario = $1
        ORDER BY 
          cs.id, ts.created_at
      `, [id_usuario]);

      console.log('📊 [ANALISE_SWOT] Análise encontrada:', analiseResult.rows.length > 0 ? 'Sim' : 'Não');
      if (analiseResult.rows.length > 0) {
        console.log('📝 [ANALISE_SWOT] Total de textos:', analiseResult.rows.length);
      }

      // Agrupar por categoria
      const analiseAgrupada = {};
      analiseResult.rows.forEach(row => {
        const categoriaId = row.id_categoria_swot;
        if (!analiseAgrupada[categoriaId]) {
          analiseAgrupada[categoriaId] = {
            id_categoria_swot: categoriaId,
            categoria: row.categoria,
            textos: []
          };
        }
        analiseAgrupada[categoriaId].textos.push({
          id_texto_swot: row.id_texto_swot,
          texto: row.texto,
          created_at: row.texto_created_at
        });
      });

      // Converter para array
      const categorias = Object.values(analiseAgrupada);

      return ApiResponse.success(res, {
        id_usuario: parseInt(id_usuario),
        categorias: categorias,
        total_categorias: categorias.length,
        total_textos: analiseResult.rows.length
      }, 'Análise SWOT encontrada com sucesso');

    } catch (error) {
      console.log('❌ [ANALISE_SWOT] Erro em getAnaliseSwot:', error.message);
      console.log('❌ [ANALISE_SWOT] Stack trace:', error.stack);
      return this.handleError(res, error, 'Erro ao buscar análise SWOT');
    }
  }

  // GET - Verificar se pode atualizar análise SWOT baseado no período
  async verificarPeriodoAtualizacao(req, res) {
    try {
      console.log('🔍 [ANALISE_SWOT] Iniciando verificarPeriodoAtualizacao');
      console.log('📝 [ANALISE_SWOT] Params:', req.params);
      
      const { id_usuario } = req.params;

      // Validar se o id_usuario foi fornecido
      if (!id_usuario) {
        console.log('❌ [ANALISE_SWOT] id_usuario não fornecido');
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      console.log('✅ [ANALISE_SWOT] id_usuario válido:', id_usuario);

      // Buscar o período de controle do cliente do usuário
      console.log('🔍 [ANALISE_SWOT] Buscando período de controle...');
      const periodoResult = await query(`
        SELECT 
          cas.periodo
        FROM 
          controle_atualizacao_swot cas
        INNER JOIN usuarios u ON cas.id_cliente = u.id_cliente
        WHERE 
          u.id = $1
        LIMIT 1
      `, [id_usuario]);

      if (periodoResult.rows.length === 0) {
        console.log('❌ [ANALISE_SWOT] Período de controle não configurado');
        return ApiResponse.notFound(res, 'Período de controle não configurado para este cliente');
      }

      const periodoMeses = periodoResult.rows[0].periodo;
      console.log('📅 [ANALISE_SWOT] Período configurado:', periodoMeses, 'meses');

      // Buscar a última atualização da análise SWOT do usuário
      console.log('🔍 [ANALISE_SWOT] Buscando última atualização...');
      const ultimaAtualizacaoResult = await query(`
        SELECT 
          MAX(created_at) as ultima_atualizacao
        FROM 
          analise_swot
        WHERE 
          id_usuario = $1
      `, [id_usuario]);

      let podeAtualizar = true;
      let mesesRestantes = 0;
      let dataUltimaAtualizacao = null;
      let proximaAtualizacaoPermitida = null;

      if (ultimaAtualizacaoResult.rows.length > 0 && ultimaAtualizacaoResult.rows[0].ultima_atualizacao) {
        dataUltimaAtualizacao = ultimaAtualizacaoResult.rows[0].ultima_atualizacao;
        console.log('📅 [ANALISE_SWOT] Última atualização:', dataUltimaAtualizacao);

        // Calcular a próxima data permitida para atualização
        const proximaDataPermitida = new Date(dataUltimaAtualizacao);
        proximaDataPermitida.setMonth(proximaDataPermitida.getMonth() + periodoMeses);
        proximaAtualizacaoPermitida = proximaDataPermitida;

        const agora = new Date();
        const diferencaMeses = Math.ceil((proximaDataPermitida - agora) / (1000 * 60 * 60 * 24 * 30.44)); // 30.44 dias por mês

        if (diferencaMeses > 0) {
          podeAtualizar = false;
          mesesRestantes = diferencaMeses;
        }

        console.log('📊 [ANALISE_SWOT] Pode atualizar:', podeAtualizar);
        console.log('📊 [ANALISE_SWOT] Meses restantes:', mesesRestantes);
      } else {
        console.log('ℹ️ [ANALISE_SWOT] Usuário ainda não possui análise SWOT - pode criar');
      }

      return ApiResponse.success(res, {
        id_usuario: parseInt(id_usuario),
        pode_atualizar: podeAtualizar,
        periodo_configurado_meses: periodoMeses,
        data_ultima_atualizacao: dataUltimaAtualizacao,
        proxima_atualizacao_permitida: proximaAtualizacaoPermitida,
        meses_restantes: mesesRestantes,
        mensagem: podeAtualizar 
          ? 'Usuário pode atualizar a análise SWOT' 
          : `Usuário deve aguardar ${mesesRestantes} mês(es) para nova atualização`
      }, 'Verificação de período realizada com sucesso');

    } catch (error) {
      console.log('❌ [ANALISE_SWOT] Erro em verificarPeriodoAtualizacao:', error.message);
      console.log('❌ [ANALISE_SWOT] Stack trace:', error.stack);
      return this.handleError(res, error, 'Erro ao verificar período de atualização');
    }
  }
}

module.exports = new AnaliseSwotController();







