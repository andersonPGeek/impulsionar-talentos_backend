const { query } = require('../utils/supabase');
const ApiResponse = require('../utils/response');
const { BaseController } = require('./index');

class ArvoreDaVidaController extends BaseController {
  constructor() {
    super();
    this.getArvoreDaVida = this.getArvoreDaVida.bind(this);
    this.salvarArvoreDaVida = this.salvarArvoreDaVida.bind(this);
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

      console.log('🔍 [ARVORE_DA_VIDA] Buscando árvore da vida...');
      // Buscar árvore da vida do usuário
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
        // Verificar se já existe registro para este usuário
        console.log('🔍 [ARVORE_DA_VIDA] Verificando se já existe registro...');
        const existingResult = await query(
          'SELECT id FROM arvore_da_vida WHERE id_usuario = $1',
          [id_usuario]
        );

        if (existingResult.rows.length > 0) {
          console.log('🔄 [ARVORE_DA_VIDA] Atualizando registro existente');
          // Atualizar registro existente
          const updateResult = await query(`
            UPDATE arvore_da_vida 
            SET 
              pontuacao_geral = $1,
              criatividade_hobbie = $2,
              plenitude_felicidade = $3,
              espiritualidade = $4,
              saude_disposicao = $5,
              desenvolvimento_intelectual = $6,
              equilibrio_emocional = $7,
              familia = $8,
              desenvolvimento_amoroso = $9,
              vida_social = $10,
              realizacao_proposito = $11,
              recursos_financeiros = $12,
              contribuicao_social = $13
            WHERE id_usuario = $14
            RETURNING *
          `, [
            pontuacao_geral, criatividade_hobbie, plenitude_felicidade,
            espiritualidade, saude_disposicao, desenvolvimento_intelectual,
            equilibrio_emocional, familia, desenvolvimento_amoroso,
            vida_social, realizacao_proposito, recursos_financeiros,
            contribuicao_social, id_usuario
          ]);

          console.log('✅ [ARVORE_DA_VIDA] Registro atualizado com sucesso');
          console.log('📝 [ARVORE_DA_VIDA] Dados atualizados:', JSON.stringify(updateResult.rows[0], null, 2));

          await query('COMMIT');

          return ApiResponse.success(res, {
            id_usuario: parseInt(id_usuario),
            arvore_da_vida: updateResult.rows[0],
            operacao: 'atualizado'
          }, 'Árvore da vida atualizada com sucesso');

        } else {
          console.log('➕ [ARVORE_DA_VIDA] Inserindo novo registro');
          // Inserir novo registro
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
        }

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
}

module.exports = new ArvoreDaVidaController();

