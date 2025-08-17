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
      const { id_usuario } = req.params;

      // Validar se o id_usuario foi fornecido
      if (!id_usuario) {
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      // Buscar perguntas que ainda não foram respondidas
      const perguntasResult = await query(`
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
        ORDER BY pp.id
      `, [id_usuario]);

      return ApiResponse.success(res, {
        id_usuario: parseInt(id_usuario),
        perguntas_pendentes: perguntasResult.rows,
        total_perguntas: perguntasResult.rows.length
      }, 'Perguntas pendentes encontradas com sucesso');

    } catch (error) {
      return this.handleError(res, error, 'Erro ao buscar perguntas pendentes');
    }
  }

  // POST - Salvar respostas das perguntas
  async salvarRespostas(req, res) {
    try {
      const { id_usuario, respostas } = req.body;

      // Validar campos obrigatórios
      if (!id_usuario) {
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      if (!respostas || !Array.isArray(respostas) || respostas.length === 0) {
        return ApiResponse.validationError(res, 'Array de respostas é obrigatório');
      }

      // Validar estrutura das respostas
      for (const resposta of respostas) {
        if (!resposta.id_pergunta || !resposta.resposta || !resposta.dimensao || !resposta.weight) {
          return ApiResponse.validationError(res, 'Cada resposta deve ter id_pergunta, resposta, dimensao e weight');
        }
        if (resposta.resposta < 1 || resposta.resposta > 5) {
          return ApiResponse.validationError(res, 'Resposta deve ser um valor entre 1 e 5');
        }
      }

      // Iniciar transação para garantir consistência
      const client = await query('BEGIN');

      try {
        // Salvar cada resposta
        for (const resposta of respostas) {
          await query(
            'INSERT INTO respostas_personalidade (id_usuario, id_pergunta, resposta) VALUES ($1, $2, $3)',
            [id_usuario, resposta.id_pergunta, resposta.resposta]
          );
        }

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

        // Se todas as perguntas foram respondidas, calcular resultado
        if (perguntasPendentes.rows.length === 0) {
          await this.calcularERegistrarResultado(id_usuario);
        }

        await query('COMMIT');

        return ApiResponse.success(res, {
          id_usuario: parseInt(id_usuario),
          respostas_salvas: respostas.length,
          todas_perguntas_respondidas: perguntasPendentes.rows.length === 0
        }, 'Respostas salvas com sucesso');

      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      return this.handleError(res, error, 'Erro ao salvar respostas');
    }
  }

  // GET - Buscar resultado da personalidade
  async getResultado(req, res) {
    try {
      const { id_usuario } = req.params;

      // Validar se o id_usuario foi fornecido
      if (!id_usuario) {
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

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

      if (resultadoResult.rows.length === 0) {
        return ApiResponse.notFound(res, 'Resultado da personalidade não encontrado. Complete o teste primeiro.');
      }

      return ApiResponse.success(res, {
        id_usuario: parseInt(id_usuario),
        resultado: resultadoResult.rows[0]
      }, 'Resultado da personalidade encontrado com sucesso');

    } catch (error) {
      return this.handleError(res, error, 'Erro ao buscar resultado da personalidade');
    }
  }

  // Método privado para calcular e registrar resultado
  async calcularERegistrarResultado(id_usuario) {
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

    // Inicializar scores por dimensão
    const scores = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };

    // Calcular scores para cada resposta
    for (const resposta of respostasResult.rows) {
      const score = (resposta.resposta - 3) * resposta.weight;
      const dimensao = resposta.dimensao;

      // Aplicar lógica MBTI
      if (dimensao === 'E') {
        scores.E += score;
        scores.I -= score; // Reduz I quando aumenta E
      } else if (dimensao === 'I') {
        scores.I += score;
        scores.E -= score; // Reduz E quando aumenta I
      } else {
        // Para outras dimensões, somar diretamente
        scores[dimensao] += score;
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

    // Buscar id da personalidade na tabela dimensoes_personalidade
    const personalidadeResult = await query(
      'SELECT id FROM dimensoes_personalidade WHERE dimensao = $1',
      [tipoMBTI]
    );

    if (personalidadeResult.rows.length === 0) {
      throw new Error(`Personalidade MBTI ${tipoMBTI} não encontrada na tabela dimensoes_personalidade`);
    }

    const id_personalidade = personalidadeResult.rows[0].id;

    // Verificar se já existe resultado para este usuário
    const existingResult = await query(
      'SELECT id FROM resultado_personalidade WHERE id_usuario = $1',
      [id_usuario]
    );

    if (existingResult.rows.length > 0) {
      // Atualizar resultado existente
      await query(`
        UPDATE resultado_personalidade 
        SET id_personalidade = $1, updated_at = NOW()
        WHERE id_usuario = $2
      `, [id_personalidade, id_usuario]);
    } else {
      // Inserir novo resultado
      await query(`
        INSERT INTO resultado_personalidade (id_usuario, id_personalidade)
        VALUES ($1, $2)
      `, [id_usuario, id_personalidade]);
    }

    // Atualizar id_resultado_personalidades na tabela perfil_colaborador
    await query(`
      UPDATE perfil_colaborador 
      SET id_resultado_personalidades = $1 
      WHERE id_usuario = $2
    `, [id_usuario, id_usuario]);
  }
}

module.exports = new PersonalidadeController(); 