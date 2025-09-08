const { query } = require('../utils/supabase');
const ApiResponse = require('../utils/response');
const { BaseController } = require('./index');

class AnaliseSwotController extends BaseController {
  constructor() {
    super();
    this.salvarAnaliseSwot = this.salvarAnaliseSwot.bind(this);
    this.getAnaliseSwot = this.getAnaliseSwot.bind(this);
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

        // Validar se a categoria existe
        if (![1, 2, 3, 4].includes(categoria.id_categoria_swot)) {
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

          // 1. Deletar todos os textos existentes para esta categoria e usuário
          console.log('🗑️ [ANALISE_SWOT] Deletando textos existentes...');
          await query(`
            DELETE FROM analise_swot 
            WHERE id_usuario = $1 AND categoria_swot = $2
          `, [id_usuario, id_categoria_swot]);

          // 2. Inserir novos textos
          if (textos.length > 0) {
            console.log('➕ [ANALISE_SWOT] Inserindo novos textos...');
            
            for (const texto of textos) {
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
          }

          resultados.push({
            id_categoria_swot,
            textos_inseridos: textos.length,
            textos: textos
          });
        }

        console.log('✅ [ANALISE_SWOT] Commit da transação');
        await query('COMMIT');

        return ApiResponse.success(res, {
          id_usuario: parseInt(id_usuario),
          categorias_processadas: resultados,
          total_textos_inseridos: resultados.reduce((sum, cat) => sum + cat.textos_inseridos, 0)
        }, 'Análise SWOT salva com sucesso');

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
}

module.exports = new AnaliseSwotController();







