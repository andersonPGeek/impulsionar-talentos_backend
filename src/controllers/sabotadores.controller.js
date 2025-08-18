const { query } = require('../utils/supabase');
const ApiResponse = require('../utils/response');
const { BaseController } = require('./index');

class SabotadoresController extends BaseController {
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
          ps.id,
          ps.titulo_pergunta, 
          s.sabotador,
          s.imagem
        FROM 
          perguntas_sabotadores ps
        JOIN 
          sabotadores s ON ps.id_sabotador = s.id
        ORDER BY ps.id
      `);

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
        if (!resposta.id_pergunta || !resposta.resposta) {
          return ApiResponse.validationError(res, 'Cada resposta deve ter id_pergunta e resposta');
        }
        if (resposta.resposta < 1 || resposta.resposta > 5) {
          return ApiResponse.validationError(res, 'Resposta deve ser um valor entre 1 e 5');
        }
      }

      // Iniciar transação para garantir consistência
      const client = await query('BEGIN');

      try {
        // Salvar/atualizar cada resposta
        for (const resposta of respostas) {
          // Verificar se já existe resposta para esta pergunta e usuário
          const existingResponse = await query(
            'SELECT id FROM respostas_sabotadores WHERE id_usuario = $1 AND id_pergunta = $2',
            [id_usuario, resposta.id_pergunta]
          );

          if (existingResponse.rows.length > 0) {
            // Atualizar resposta existente
            await query(
              'UPDATE respostas_sabotadores SET resposta = $1 WHERE id_usuario = $2 AND id_pergunta = $3',
              [resposta.resposta, id_usuario, resposta.id_pergunta]
            );
          } else {
            // Inserir nova resposta
            await query(
              'INSERT INTO respostas_sabotadores (id_usuario, id_pergunta, resposta) VALUES ($1, $2, $3)',
              [id_usuario, resposta.id_pergunta, resposta.resposta]
            );
          }
        }

        // Verificar se todas as perguntas foram respondidas
        const perguntasPendentes = await query(`
          SELECT
            ps.id,
            ps.titulo_pergunta, 
            s.id AS id_sabotador,
            s.sabotador,
            s.imagem
          FROM 
            perguntas_sabotadores ps
          JOIN 
            sabotadores s ON ps.id_sabotador = s.id
          LEFT JOIN 
            respostas_sabotadores rs 
            ON ps.id = rs.id_pergunta AND rs.id_usuario = $1
          WHERE 
            rs.id IS NULL
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

  // GET - Buscar resultado dos sabotadores
  async getResultado(req, res) {
    try {
      const { id_usuario } = req.params;

      // Validar se o id_usuario foi fornecido
      if (!id_usuario) {
        return ApiResponse.validationError(res, 'ID do usuário é obrigatório');
      }

      // Buscar resultado dos sabotadores
      const resultadoResult = await query(`
        SELECT
          s.sabotador,
          rs.nivel,
          ds.descricao
        FROM resultado_sabotadores rs
        JOIN sabotadores s ON s.id = rs.id_sabotador
        JOIN descricoes_sabotadores ds ON ds.id = rs.id_descricao_sabotadores
        WHERE rs.id_usuario = $1
        ORDER BY s.id
      `, [id_usuario]);

      if (resultadoResult.rows.length === 0) {
        return ApiResponse.notFound(res, 'Resultado dos sabotadores não encontrado. Complete o teste primeiro.');
      }

      return ApiResponse.success(res, {
        id_usuario: parseInt(id_usuario),
        resultado: resultadoResult.rows,
        total_sabotadores: resultadoResult.rows.length
      }, 'Resultado dos sabotadores encontrado com sucesso');

    } catch (error) {
      return this.handleError(res, error, 'Erro ao buscar resultado dos sabotadores');
    }
  }

  // Método privado para calcular e registrar resultado
  async calcularERegistrarResultado(id_usuario) {
    // Calcular média por sabotador
    const mediasResult = await query(`
      SELECT 
        s.id AS id_sabotador,
        s.sabotador,
        AVG(rs.resposta) AS media,
        COUNT(ps.id) AS total_perguntas
      FROM 
        sabotadores s
      JOIN 
        perguntas_sabotadores ps ON s.id = ps.id_sabotador
      JOIN 
        respostas_sabotadores rs ON ps.id = rs.id_pergunta
      WHERE 
        rs.id_usuario = $1
      GROUP BY 
        s.id, s.sabotador
      ORDER BY 
        s.id
    `, [id_usuario]);

    // Para cada sabotador, determinar nível e salvar resultado
    for (const media of mediasResult.rows) {
      const pontuacao = parseFloat(media.media);
      let nivel;

      // Determinar nível baseado na pontuação
      if (pontuacao >= 1.0 && pontuacao <= 2.4) {
        nivel = 'Baixo';
      } else if (pontuacao >= 2.5 && pontuacao <= 3.9) {
        nivel = 'Moderado';
      } else if (pontuacao >= 4.0 && pontuacao <= 5.0) {
        nivel = 'Alto';
      } else {
        nivel = 'Baixo'; // Fallback
      }

      // Buscar id_descricao_sabotadores
      const descricaoResult = await query(
        'SELECT id FROM descricoes_sabotadores WHERE id_sabotador = $1 AND nivel = $2',
        [media.id_sabotador, nivel]
      );

      if (descricaoResult.rows.length === 0) {
        throw new Error(`Descrição não encontrada para sabotador ${media.id_sabotador} e nível ${nivel}`);
      }

      const id_descricao_sabotadores = descricaoResult.rows[0].id;

      // Verificar se já existe resultado para este usuário e sabotador
      const existingResult = await query(
        'SELECT id FROM resultado_sabotadores WHERE id_usuario = $1 AND id_sabotador = $2',
        [id_usuario, media.id_sabotador]
      );

      if (existingResult.rows.length > 0) {
        // Atualizar resultado existente
        await query(`
          UPDATE resultado_sabotadores 
          SET pontuacao = $1, nivel = $2, id_descricao_sabotadores = $3
          WHERE id_usuario = $4 AND id_sabotador = $5
        `, [pontuacao, nivel, id_descricao_sabotadores, id_usuario, media.id_sabotador]);
      } else {
        // Inserir novo resultado
        await query(`
          INSERT INTO resultado_sabotadores (id_usuario, id_sabotador, pontuacao, nivel, id_descricao_sabotadores)
          VALUES ($1, $2, $3, $4, $5)
        `, [id_usuario, media.id_sabotador, pontuacao, nivel, id_descricao_sabotadores]);
      }
    }

    // Buscar o id do resultado de sabotadores para atualizar o perfil_colaborador
    const resultadoSabotadoresResult = await query(
      'SELECT id FROM resultado_sabotadores WHERE id_usuario = $1 LIMIT 1',
      [id_usuario]
    );

    if (resultadoSabotadoresResult.rows.length > 0) {
      const resultadoId = resultadoSabotadoresResult.rows[0].id;
      
      // Atualizar id_resultado_sabotadores na tabela perfil_colaborador
      await query(`
        UPDATE perfil_colaborador 
        SET id_resultado_sabotadores = $1 
        WHERE id_usuario = $2
      `, [resultadoId, id_usuario]);
    }
  }
}

module.exports = new SabotadoresController(); 