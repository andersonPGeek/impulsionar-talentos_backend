const { query } = require('../utils/supabase');
const ApiResponse = require('../utils/response');
const { BaseController } = require('./index');

class ArvoreDaVidaController extends BaseController {
  constructor() {
    super();
    this.getArvoreDaVida = this.getArvoreDaVida.bind(this);
    this.salvarArvoreDaVida = this.salvarArvoreDaVida.bind(this);
    this.verificarPeriodoAtualizacao = this.verificarPeriodoAtualizacao.bind(this);
  }

  // GET - Buscar árvore da vida do usuário
  async getArvoreDaVida(req, res) {
    try {
      console.log('🔍 [ARVORE_DA_VIDA] Iniciando getArvoreDaVida');
      console.log('📝 [ARVORE_DA_VIDA] Params:', req.params);
      
      const { id_usuario } = req.params;

      // Validar se o id_usuario foi fornecido
      if (!id_usuario) {
        console.log('❌ [ARVORE_DA_VIDA] id_usuario não fornecido');
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      console.log('✅ [ARVORE_DA_VIDA] id_usuario válido:', id_usuario);

      console.log('🔍 [ARVORE_DA_VIDA] Buscando árvore da vida mais recente...');
      // Buscar árvore da vida mais recente do usuário
      const arvoreResult = await query(`
        SELECT 
          id,
          created_at,
          pontuacao_geral,
          criatividade_hobbie,
          plenitude_felicidade,
          espiritualidade,
          saude_disposicao,
          desenvolvimento_intelectual,
          equilibrio_emocional,
          familia,
          desenvolvimento_amoroso,
          vida_social,
          realizacao_proposito,
          recursos_financeiros,
          contribuicao_social,
          id_usuario
        FROM 
          arvore_da_vida 
        WHERE 
          id_usuario = $1
        ORDER BY 
          created_at DESC
        LIMIT 1
      `, [id_usuario]);

      console.log('📊 [ARVORE_DA_VIDA] Árvore encontrada:', arvoreResult.rows.length > 0 ? 'Sim' : 'Não');
      if (arvoreResult.rows.length > 0) {
        console.log('📝 [ARVORE_DA_VIDA] Dados:', JSON.stringify(arvoreResult.rows[0], null, 2));
      }

      if (arvoreResult.rows.length === 0) {
        console.log('❌ [ARVORE_DA_VIDA] Árvore da vida não encontrada');
        return ApiResponse.notFound(res, 'Árvore da vida não encontrada. Complete o teste primeiro.');
      }

      return ApiResponse.success(res, {
        id_usuario: parseInt(id_usuario),
        arvore_da_vida: arvoreResult.rows[0]
      }, 'Árvore da vida encontrada com sucesso');

    } catch (error) {
      console.log('❌ [ARVORE_DA_VIDA] Erro em getArvoreDaVida:', error.message);
      console.log('❌ [ARVORE_DA_VIDA] Stack trace:', error.stack);
      return this.handleError(res, error, 'Erro ao buscar árvore da vida');
    }
  }

  // POST/PUT - Salvar/Atualizar árvore da vida
  async salvarArvoreDaVida(req, res) {
    try {
      console.log('🔍 [ARVORE_DA_VIDA] Iniciando salvarArvoreDaVida');
      console.log('📝 [ARVORE_DA_VIDA] Request body:', JSON.stringify(req.body, null, 2));
      
      const {
        id_usuario,
        pontuacao_geral,
        criatividade_hobbie,
        plenitude_felicidade,
        espiritualidade,
        saude_disposicao,
        desenvolvimento_intelectual,
        equilibrio_emocional,
        familia,
        desenvolvimento_amoroso,
        vida_social,
        realizacao_proposito,
        recursos_financeiros,
        contribuicao_social
      } = req.body;

      // Validar campos obrigatórios
      if (!id_usuario) {
        console.log('❌ [ARVORE_DA_VIDA] Validação falhou - id_usuario não fornecido');
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      console.log('✅ [ARVORE_DA_VIDA] id_usuario válido:', id_usuario);

      // Validar se todos os campos de pontuação estão presentes
      const camposObrigatorios = [
        'pontuacao_geral', 'criatividade_hobbie', 'plenitude_felicidade', 
        'espiritualidade', 'saude_disposicao', 'desenvolvimento_intelectual',
        'equilibrio_emocional', 'familia', 'desenvolvimento_amoroso',
        'vida_social', 'realizacao_proposito', 'recursos_financeiros',
        'contribuicao_social'
      ];

      for (const campo of camposObrigatorios) {
        if (req.body[campo] === undefined || req.body[campo] === null) {
          console.log(`❌ [ARVORE_DA_VIDA] Campo obrigatório ausente: ${campo}`);
          return ApiResponse.validationError(res, `Campo ${campo} é obrigatório`);
        }
        
        if (!Number.isInteger(req.body[campo]) || req.body[campo] < 0 || req.body[campo] > 10) {
          console.log(`❌ [ARVORE_DA_VIDA] Valor inválido para ${campo}:`, req.body[campo]);
          return ApiResponse.validationError(res, `Campo ${campo} deve ser um número inteiro entre 0 e 10`);
        }
      }

      console.log('✅ [ARVORE_DA_VIDA] Todos os campos válidos');

      console.log('🔄 [ARVORE_DA_VIDA] Iniciando transação');
      // Iniciar transação para garantir consistência
      const client = await query('BEGIN');

      try {
        console.log('➕ [ARVORE_DA_VIDA] Inserindo novo registro (sempre INSERT)');
        // Sempre inserir novo registro
        const insertResult = await query(`
          INSERT INTO arvore_da_vida (
            id_usuario,
            pontuacao_geral,
            criatividade_hobbie,
            plenitude_felicidade,
            espiritualidade,
            saude_disposicao,
            desenvolvimento_intelectual,
            equilibrio_emocional,
            familia,
            desenvolvimento_amoroso,
            vida_social,
            realizacao_proposito,
            recursos_financeiros,
            contribuicao_social
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *
        `, [
          id_usuario, pontuacao_geral, criatividade_hobbie, plenitude_felicidade,
          espiritualidade, saude_disposicao, desenvolvimento_intelectual,
          equilibrio_emocional, familia, desenvolvimento_amoroso,
          vida_social, realizacao_proposito, recursos_financeiros,
          contribuicao_social
        ]);

        console.log('✅ [ARVORE_DA_VIDA] Registro criado com sucesso');
        console.log('📝 [ARVORE_DA_VIDA] Dados criados:', JSON.stringify(insertResult.rows[0], null, 2));

        await query('COMMIT');

        return ApiResponse.success(res, {
          id_usuario: parseInt(id_usuario),
          arvore_da_vida: insertResult.rows[0],
          operacao: 'criado'
        }, 'Árvore da vida criada com sucesso', 201);

      } catch (error) {
        console.log('❌ [ARVORE_DA_VIDA] Erro durante transação:', error.message);
        console.log('❌ [ARVORE_DA_VIDA] Stack trace:', error.stack);
        console.log('🔄 [ARVORE_DA_VIDA] Fazendo rollback...');
        await query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.log('❌ [ARVORE_DA_VIDA] Erro geral no salvarArvoreDaVida:', error.message);
      console.log('❌ [ARVORE_DA_VIDA] Stack trace:', error.stack);
      return this.handleError(res, error, 'Erro ao salvar árvore da vida');
    }
  }

  // GET - Verificar se pode atualizar árvore da vida baseado no período
  async verificarPeriodoAtualizacao(req, res) {
    try {
      console.log('🔍 [ARVORE_DA_VIDA] Iniciando verificarPeriodoAtualizacao');
      console.log('📝 [ARVORE_DA_VIDA] Params:', req.params);
      
      const { id_usuario } = req.params;

      // Validar se o id_usuario foi fornecido
      if (!id_usuario) {
        console.log('❌ [ARVORE_DA_VIDA] id_usuario não fornecido');
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      console.log('✅ [ARVORE_DA_VIDA] id_usuario válido:', id_usuario);

      // Buscar o período de controle do cliente do usuário
      console.log('🔍 [ARVORE_DA_VIDA] Buscando período de controle...');
      const periodoResult = await query(`
        SELECT 
          caa.periodo
        FROM 
          controle_atualizacao_arvore caa
        INNER JOIN usuarios u ON caa.id_cliente = u.id_cliente
        WHERE 
          u.id = $1
        LIMIT 1
      `, [id_usuario]);

      if (periodoResult.rows.length === 0) {
        console.log('❌ [ARVORE_DA_VIDA] Período de controle não configurado');
        return ApiResponse.notFound(res, 'Período de controle não configurado para este cliente');
      }

      const periodoMeses = periodoResult.rows[0].periodo;
      console.log('📅 [ARVORE_DA_VIDA] Período configurado:', periodoMeses, 'meses');

      // Buscar a última atualização da árvore da vida do usuário
      console.log('🔍 [ARVORE_DA_VIDA] Buscando última atualização...');
      const ultimaAtualizacaoResult = await query(`
        SELECT 
          created_at
        FROM 
          arvore_da_vida
        WHERE 
          id_usuario = $1
        ORDER BY 
          created_at DESC
        LIMIT 1
      `, [id_usuario]);

      let podeAtualizar = true;
      let mesesRestantes = 0;
      let dataUltimaAtualizacao = null;
      let proximaAtualizacaoPermitida = null;

      if (ultimaAtualizacaoResult.rows.length > 0) {
        dataUltimaAtualizacao = ultimaAtualizacaoResult.rows[0].created_at;
        console.log('📅 [ARVORE_DA_VIDA] Última atualização:', dataUltimaAtualizacao);

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

        console.log('📊 [ARVORE_DA_VIDA] Pode atualizar:', podeAtualizar);
        console.log('📊 [ARVORE_DA_VIDA] Meses restantes:', mesesRestantes);
      } else {
        console.log('ℹ️ [ARVORE_DA_VIDA] Usuário ainda não possui árvore da vida - pode criar');
      }

      return ApiResponse.success(res, {
        id_usuario: parseInt(id_usuario),
        pode_atualizar: podeAtualizar,
        periodo_configurado_meses: periodoMeses,
        data_ultima_atualizacao: dataUltimaAtualizacao,
        proxima_atualizacao_permitida: proximaAtualizacaoPermitida,
        meses_restantes: mesesRestantes,
        mensagem: podeAtualizar 
          ? 'Usuário pode atualizar a árvore da vida' 
          : `Usuário deve aguardar ${mesesRestantes} mês(es) para nova atualização`
      }, 'Verificação de período realizada com sucesso');

    } catch (error) {
      console.log('❌ [ARVORE_DA_VIDA] Erro em verificarPeriodoAtualizacao:', error.message);
      console.log('❌ [ARVORE_DA_VIDA] Stack trace:', error.stack);
      return this.handleError(res, error, 'Erro ao verificar período de atualização');
    }
  }
}

module.exports = new ArvoreDaVidaController();








