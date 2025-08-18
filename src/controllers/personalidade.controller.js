const { query } = require('../utils/supabase');
const ApiResponse = require('../utils/response');
const { BaseController } = require('./index');

class PersonalidadeController extends BaseController {
  constructor() {
    super();
    this.getPerguntasPendentes = this.getPerguntasPendentes.bind(this);
    this.salvarRespostas = this.salvarRespostas.bind(this);
    this.getResultado = this.getResultado.bind(this);
  }

  // GET - Buscar perguntas pendentes de resposta
  async getPerguntasPendentes(req, res) {
    try {
      console.log('🔍 [PERSONALIDADE] Iniciando getPerguntasPendentes');
      console.log('📝 [PERSONALIDADE] Params:', req.params);
      
      const { id_usuario } = req.params;

      // Validar se o id_usuario foi fornecido
      if (!id_usuario) {
        console.log('❌ [PERSONALIDADE] id_usuario não fornecido');
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      console.log('✅ [PERSONALIDADE] id_usuario válido:', id_usuario);

      console.log('🔍 [PERSONALIDADE] Buscando perguntas pendentes...');
      // Buscar perguntas que ainda não foram respondidas
      const perguntasResult = await query(`
        SELECT
          pp.id,
          pp.titulo_pergunta, 
          pp.dimensao,
          pp.weight
        FROM 
          perguntas_personalidade pp
        ORDER BY pp.id
      `);

      console.log('📊 [PERSONALIDADE] Perguntas pendentes encontradas:', perguntasResult.rows.length);
      console.log('📝 [PERSONALIDADE] Perguntas:', JSON.stringify(perguntasResult.rows, null, 2));

      return ApiResponse.success(res, {
        id_usuario: parseInt(id_usuario),
        perguntas_pendentes: perguntasResult.rows,
        total_perguntas: perguntasResult.rows.length
      }, 'Perguntas pendentes encontradas com sucesso');

    } catch (error) {
      console.log('❌ [PERSONALIDADE] Erro em getPerguntasPendentes:', error.message);
      console.log('❌ [PERSONALIDADE] Stack trace:', error.stack);
      return this.handleError(res, error, 'Erro ao buscar perguntas pendentes');
    }
  }

  // POST - Salvar respostas das perguntas
  async salvarRespostas(req, res) {
    try {
      console.log('🔍 [PERSONALIDADE] Iniciando salvarRespostas');
      console.log('📝 [PERSONALIDADE] Request body:', JSON.stringify(req.body, null, 2));
      
      const { id_usuario, respostas } = req.body;

      // Validar campos obrigatórios
      if (!id_usuario) {
        console.log('❌ [PERSONALIDADE] Validação falhou - id_usuario não fornecido');
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      console.log('✅ [PERSONALIDADE] id_usuario válido:', id_usuario);

      if (!respostas || !Array.isArray(respostas) || respostas.length === 0) {
        console.log('❌ [PERSONALIDADE] Validação falhou - respostas inválidas');
        console.log('❌ [PERSONALIDADE] respostas:', respostas);
        console.log('❌ [PERSONALIDADE] Array.isArray(respostas):', Array.isArray(respostas));
        console.log('❌ [PERSONALIDADE] respostas.length:', respostas ? respostas.length : 'undefined');
        return ApiResponse.validationError(res, 'Array de respostas é obrigatório');
      }

      console.log('✅ [PERSONALIDADE] Array de respostas válido, total:', respostas.length);

      // Validar estrutura das respostas
      for (let i = 0; i < respostas.length; i++) {
        const resposta = respostas[i];
        console.log(`🔍 [PERSONALIDADE] Validando resposta ${i + 1}:`, JSON.stringify(resposta, null, 2));
        
        if (!resposta.id_pergunta || !resposta.resposta || !resposta.dimensao || !resposta.weight) {
          console.log('❌ [PERSONALIDADE] Estrutura de resposta inválida na posição', i + 1);
          console.log('❌ [PERSONALIDADE] id_pergunta:', resposta.id_pergunta);
          console.log('❌ [PERSONALIDADE] resposta:', resposta.resposta);
          console.log('❌ [PERSONALIDADE] dimensao:', resposta.dimensao);
          console.log('❌ [PERSONALIDADE] weight:', resposta.weight);
          return ApiResponse.validationError(res, `Cada resposta deve ter id_pergunta, resposta, dimensao e weight. Erro na posição ${i + 1}`);
        }
        
        if (resposta.resposta < 1 || resposta.resposta > 5) {
          console.log('❌ [PERSONALIDADE] Valor de resposta inválido na posição', i + 1);
          console.log('❌ [PERSONALIDADE] resposta:', resposta.resposta);
          return ApiResponse.validationError(res, `Resposta deve ser um valor entre 1 e 5. Erro na posição ${i + 1}`);
        }
        
        console.log(`✅ [PERSONALIDADE] Resposta ${i + 1} válida`);
      }

      console.log('🔄 [PERSONALIDADE] Iniciando transação');
      // Iniciar transação para garantir consistência
      const client = await query('BEGIN');

      try {
        console.log('💾 [PERSONALIDADE] Salvando respostas no banco...');
        // Salvar cada resposta
        for (let i = 0; i < respostas.length; i++) {
          const resposta = respostas[i];
          console.log(`💾 [PERSONALIDADE] Salvando resposta ${i + 1}:`, {
            id_usuario,
            id_pergunta: resposta.id_pergunta,
            resposta: resposta.resposta
          });
          
          await query(
            'INSERT INTO respostas_personalidade (id_usuario, id_pergunta, resposta) VALUES ($1, $2, $3)',
            [id_usuario, resposta.id_pergunta, resposta.resposta]
          );
          console.log(`✅ [PERSONALIDADE] Resposta ${i + 1} salva com sucesso`);
        }

        console.log('🔍 [PERSONALIDADE] Verificando perguntas pendentes...');
        // Verificar se todas as perguntas foram respondidas
        const perguntasPendentes = await query(`
          SELECT
            pp.id,
            pp.titulo_pergunta, 
            pp.dimensao,
            pp.weight
          FROM 
            perguntas_personalidade pp
          LEFT JOIN 
            respostas_personalidade rp 
            ON pp.id = rp.id_pergunta AND rp.id_usuario = $1
          WHERE 
            rp.id IS NULL
        `, [id_usuario]);

        console.log('📊 [PERSONALIDADE] Perguntas pendentes encontradas:', perguntasPendentes.rows.length);

        // Se todas as perguntas foram respondidas, calcular resultado
        if (perguntasPendentes.rows.length === 0) {
          console.log('🎯 [PERSONALIDADE] Todas as perguntas respondidas! Calculando resultado...');
          await this.calcularERegistrarResultado(id_usuario);
          console.log('✅ [PERSONALIDADE] Resultado calculado e registrado com sucesso');
        } else {
          console.log('⏳ [PERSONALIDADE] Ainda há perguntas pendentes, resultado não calculado');
        }

        console.log('✅ [PERSONALIDADE] Commit da transação');
        await query('COMMIT');

        return ApiResponse.success(res, {
          id_usuario: parseInt(id_usuario),
          respostas_salvas: respostas.length,
          todas_perguntas_respondidas: perguntasPendentes.rows.length === 0
        }, 'Respostas salvas com sucesso');

      } catch (error) {
        console.log('❌ [PERSONALIDADE] Erro durante transação:', error.message);
        console.log('❌ [PERSONALIDADE] Stack trace:', error.stack);
        console.log('🔄 [PERSONALIDADE] Fazendo rollback...');
        await query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.log('❌ [PERSONALIDADE] Erro geral no salvarRespostas:', error.message);
      console.log('❌ [PERSONALIDADE] Stack trace:', error.stack);
      return this.handleError(res, error, 'Erro ao salvar respostas');
    }
  }

  // GET - Buscar resultado da personalidade
  async getResultado(req, res) {
    try {
      console.log('🔍 [PERSONALIDADE] Iniciando getResultado');
      console.log('📝 [PERSONALIDADE] Params:', req.params);
      
      const { id_usuario } = req.params;

      // Validar se o id_usuario foi fornecido
      if (!id_usuario) {
        console.log('❌ [PERSONALIDADE] id_usuario não fornecido');
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      console.log('✅ [PERSONALIDADE] id_usuario válido:', id_usuario);

      console.log('🔍 [PERSONALIDADE] Buscando resultado da personalidade...');
      // Buscar resultado da personalidade
      const resultadoResult = await query(`
        SELECT
          dp.dimensao,
          dp.nome,
          dp.descricao,
          dp.imagem
        FROM 
          resultado_personalidade rp 
          JOIN dimensoes_personalidade dp ON rp.id_personalidade = dp.id
        WHERE 
          rp.id_usuario = $1
      `, [id_usuario]);

      console.log('📊 [PERSONALIDADE] Resultado encontrado:', resultadoResult.rows.length > 0 ? 'Sim' : 'Não');
      if (resultadoResult.rows.length > 0) {
        console.log('📝 [PERSONALIDADE] Resultado:', JSON.stringify(resultadoResult.rows[0], null, 2));
      }

      if (resultadoResult.rows.length === 0) {
        console.log('❌ [PERSONALIDADE] Resultado não encontrado');
        return ApiResponse.notFound(res, 'Resultado da personalidade não encontrado. Complete o teste primeiro.');
      }

      return ApiResponse.success(res, {
        id_usuario: parseInt(id_usuario),
        resultado: resultadoResult.rows[0]
      }, 'Resultado da personalidade encontrado com sucesso');

    } catch (error) {
      console.log('❌ [PERSONALIDADE] Erro em getResultado:', error.message);
      console.log('❌ [PERSONALIDADE] Stack trace:', error.stack);
      return this.handleError(res, error, 'Erro ao buscar resultado da personalidade');
    }
  }

  // Método privado para calcular e registrar resultado
  async calcularERegistrarResultado(id_usuario) {
    console.log('🧮 [PERSONALIDADE] Iniciando cálculo do resultado para usuário:', id_usuario);
    
    // Buscar todas as respostas do usuário com suas dimensões e weights
    const respostasResult = await query(`
      SELECT 
        rp.resposta,
        pp.dimensao,
        pp.weight
      FROM 
        respostas_personalidade rp
      JOIN 
        perguntas_personalidade pp ON rp.id_pergunta = pp.id
      WHERE 
        rp.id_usuario = $1
      ORDER BY 
        pp.dimensao
    `, [id_usuario]);

    console.log('📊 [PERSONALIDADE] Total de respostas encontradas:', respostasResult.rows.length);
    console.log('📝 [PERSONALIDADE] Respostas:', JSON.stringify(respostasResult.rows, null, 2));

    // Inicializar scores por dimensão
    const scores = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };

    // Calcular scores para cada resposta
    console.log('🧮 [PERSONALIDADE] Calculando scores...');
    for (let i = 0; i < respostasResult.rows.length; i++) {
      const resposta = respostasResult.rows[i];
      const score = (resposta.resposta - 3) * resposta.weight;
      const dimensao = resposta.dimensao;

      console.log(`🧮 [PERSONALIDADE] Resposta ${i + 1}:`, {
        resposta: resposta.resposta,
        dimensao,
        weight: resposta.weight,
        scoreCalculado: score
      });

      // Aplicar lógica MBTI
      if (dimensao === 'E') {
        scores.E += score;
        scores.I -= score; // Reduz I quando aumenta E
        console.log(`🧮 [PERSONALIDADE] Dimensão E: +${score}, I: -${score}`);
      } else if (dimensao === 'I') {
        scores.I += score;
        scores.E -= score; // Reduz E quando aumenta I
        console.log(`🧮 [PERSONALIDADE] Dimensão I: +${score}, E: -${score}`);
      } else {
        // Para outras dimensões, somar diretamente
        scores[dimensao] += score;
        console.log(`🧮 [PERSONALIDADE] Dimensão ${dimensao}: +${score}`);
      }
    }

    // Determinar tipo MBTI
    const tipoMBTI = 
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.S > scores.N ? 'S' : 'N') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P');

    console.log('🧮 Cálculo MBTI:', {
      scores,
      tipoMBTI
    });

    console.log('🔍 [PERSONALIDADE] Buscando personalidade na tabela dimensoes_personalidade:', tipoMBTI);
    // Buscar id da personalidade na tabela dimensoes_personalidade
    const personalidadeResult = await query(
      'SELECT id FROM dimensoes_personalidade WHERE dimensao = $1',
      [tipoMBTI]
    );

    if (personalidadeResult.rows.length === 0) {
      console.log('❌ [PERSONALIDADE] Personalidade não encontrada:', tipoMBTI);
      throw new Error(`Personalidade MBTI ${tipoMBTI} não encontrada na tabela dimensoes_personalidade`);
    }

    const id_personalidade = personalidadeResult.rows[0].id;
    console.log('✅ [PERSONALIDADE] Personalidade encontrada, id:', id_personalidade);

    console.log('🔍 [PERSONALIDADE] Verificando se já existe resultado para usuário:', id_usuario);
    // Verificar se já existe resultado para este usuário
    const existingResult = await query(
      'SELECT id FROM resultado_personalidade WHERE id_usuario = $1',
      [id_usuario]
    );

    if (existingResult.rows.length > 0) {
      console.log('🔄 [PERSONALIDADE] Atualizando resultado existente');
      // Atualizar resultado existente
      await query(`
        UPDATE resultado_personalidade 
        SET id_personalidade = $1
        WHERE id_usuario = $2
      `, [id_personalidade, id_usuario]);
    } else {
      console.log('➕ [PERSONALIDADE] Inserindo novo resultado');
      // Inserir novo resultado
      await query(`
        INSERT INTO resultado_personalidade (id_usuario, id_personalidade)
        VALUES ($1, $2)
      `, [id_usuario, id_personalidade]);
    }

    console.log('🔍 [PERSONALIDADE] Buscando id do resultado para atualizar perfil_colaborador');
    // Buscar o id do resultado de personalidade para atualizar o perfil_colaborador
    const resultadoPersonalidadeResult = await query(
      'SELECT id FROM resultado_personalidade WHERE id_usuario = $1',
      [id_usuario]
    );

    if (resultadoPersonalidadeResult.rows.length > 0) {
      const resultadoId = resultadoPersonalidadeResult.rows[0].id;
      console.log('✅ [PERSONALIDADE] Resultado encontrado, id:', resultadoId);
      
      console.log('🔄 [PERSONALIDADE] Atualizando perfil_colaborador');
      // Atualizar id_resultado_personalidades na tabela perfil_colaborador
      await query(`
        UPDATE perfil_colaborador 
        SET id_resultado_personalidades = $1 
        WHERE id_usuario = $2
      `, [resultadoId, id_usuario]);
      console.log('✅ [PERSONALIDADE] Perfil_colaborador atualizado com sucesso');
    } else {
      console.log('⚠️ [PERSONALIDADE] Nenhum resultado encontrado para atualizar perfil_colaborador');
    }
    
    console.log('✅ [PERSONALIDADE] Cálculo e registro concluído com sucesso');
  }
}

module.exports = new PersonalidadeController(); 