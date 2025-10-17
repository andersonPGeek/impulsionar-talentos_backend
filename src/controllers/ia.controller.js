const { BaseController } = require('./index');
const { OpenAI } = require('openai');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

class IAController extends BaseController {
  constructor() {
    super();
    // Inicializar cliente OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Gerar habilidades para cargo usando IA
   * POST /api/ia/gerar-habilidades
   */
  gerarHabilidades = async (req, res) => {
    try {
      const { 
        setor, 
        departamento, 
        titulo_cargo, 
        descricao_cargo, 
        senioridade 
      } = req.body;

      logger.info('Iniciando geração de habilidades com IA', {
        setor,
        departamento,
        titulo_cargo,
        descricao_cargo,
        senioridade
      });

      // Validações básicas
      if (!titulo_cargo || titulo_cargo.trim().length === 0) {
        return ApiResponse.error(res, 'Título do cargo é obrigatório', 400, {
          error: 'INVALID_JOB_TITLE'
        });
      }

      if (!descricao_cargo || descricao_cargo.trim().length === 0) {
        return ApiResponse.error(res, 'Descrição do cargo é obrigatória', 400, {
          error: 'INVALID_JOB_DESCRIPTION'
        });
      }

      if (!senioridade || senioridade.trim().length === 0) {
        return ApiResponse.error(res, 'Senioridade é obrigatória', 400, {
          error: 'INVALID_SENIORITY'
        });
      }

      // Construir prompt para a IA
      const prompt = IAController.construirPrompt({
        setor,
        departamento,
        titulo_cargo,
        descricao_cargo,
        senioridade
      });

      // Chamar API da OpenAI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em recursos humanos e análise de cargos. Sua função é gerar habilidades técnicas e comportamentais relevantes para posições específicas baseadas nas informações fornecidas."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const respostaIA = completion.choices[0].message.content;
      
      // Extrair habilidades da resposta
      const habilidades = IAController.extrairHabilidades(respostaIA);

      // Validar quantidade de habilidades
      if (habilidades.length < 3) {
        logger.warn('IA retornou menos de 3 habilidades válidas', {
          habilidades_retornadas: habilidades.length,
          resposta_ia: respostaIA
        });
        return ApiResponse.error(res, 'A IA retornou menos de 3 habilidades válidas com título e descrição. Tente novamente ou ajuste os parâmetros.', 400, {
          error: 'INSUFFICIENT_SKILLS'
        });
      }

      if (habilidades.length > 15) {
        // Limitar a 15 habilidades se retornar mais
        habilidades.splice(15);
      }

      logger.info('Habilidades geradas com sucesso', {
        quantidade_habilidades: habilidades.length,
        titulo_cargo,
        senioridade
      });

      return ApiResponse.success(res, {
        cargo_info: {
          titulo: titulo_cargo,
          setor: setor || null,
          departamento: departamento || null,
          senioridade: senioridade
        },
        habilidades: habilidades,
        total_habilidades: habilidades.length,
        gerado_por: 'OpenAI GPT-3.5-turbo'
      }, 'Habilidades geradas com sucesso');

    } catch (error) {
      logger.error('Erro ao gerar habilidades com IA', { 
        error: error.message, 
        stack: error.stack,
        titulo_cargo: req.body.titulo_cargo
      });

      // Tratar erros específicos da OpenAI
      if (error.code === 'insufficient_quota') {
        return ApiResponse.error(res, 'Limite de uso da API OpenAI excedido', 400, {
          error: 'OPENAI_QUOTA_EXCEEDED'
        });
      }

      if (error.code === 'rate_limit_exceeded') {
        return ApiResponse.error(res, 'Limite de requisições da API OpenAI excedido. Tente novamente em alguns segundos.', 400, {
          error: 'OPENAI_RATE_LIMIT'
        });
      }

      return ApiResponse.error(res, 'Erro interno ao gerar habilidades. Tente novamente mais tarde.', 500, {
        error: 'IA_GENERATION_ERROR'
      });
    }
  }

  /**
   * Construir prompt para a IA baseado nos dados do cargo
   */
  static construirPrompt({ setor, departamento, titulo_cargo, descricao_cargo, senioridade }) {
    let prompt = `Com base nas informações abaixo, gere entre 5 e 15 habilidades essenciais que uma pessoa precisa ter para este cargo:

Cargo: ${titulo_cargo}
Descrição: ${descricao_cargo}
Senioridade: ${senioridade}`;

    if (setor) {
      prompt += `\nSetor: ${setor}`;
    }

    if (departamento) {
      prompt += `\nDepartamento: ${departamento}`;
    }

    prompt += `

Considere:
- A senioridade (${senioridade}) ao definir o nível das habilidades
- Habilidades técnicas específicas para a área
- Habilidades comportamentais e soft skills
- Competências de liderança se aplicável ao nível de senioridade
- Tecnologias e ferramentas relevantes

Para cada habilidade, forneça:
- Um título curto e claro
- Uma descrição concisa explicando por que é importante para este cargo

IMPORTANTE: Responda EXATAMENTE no formato abaixo, com numeração sequencial:

1. Título: [nome da habilidade]
Descrição: [explicação breve da importância]

2. Título: [nome da habilidade]
Descrição: [explicação breve da importância]

3. Título: [nome da habilidade]
Descrição: [explicação breve da importância]

Continue até ter pelo menos 5 habilidades. Cada habilidade deve ter EXATAMENTE o formato:
- Uma linha com "X. Título: [nome]"
- Uma linha com "Descrição: [explicação]"
- Uma linha em branco

Exemplo:
1. Título: JavaScript
Descrição: Linguagem de programação essencial para desenvolvimento frontend e backend, permitindo criar interfaces interativas e lógica de servidor.

2. Título: Liderança de equipe
Descrição: Capacidade de coordenar e motivar equipes, essencial para cargos de senioridade mais alta que envolvem gestão de pessoas.`;

    return prompt;
  }

  /**
   * Extrair habilidades da resposta da IA
   */
  static extrairHabilidades(respostaIA) {
    try {
      const habilidades = [];
      const linhas = respostaIA.split('\n');
      
      let habilidadeAtual = {};
      
      for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        
        // Verificar se é um título de habilidade (com ou sem numeração)
        if (linha.toLowerCase().includes('título:')) {
          // Se já temos uma habilidade anterior, adicionar à lista
          if (habilidadeAtual.titulo && habilidadeAtual.descricao) {
            habilidades.push(habilidadeAtual);
          }
          
          // Extrair título (remover numeração e prefixo)
          const titulo = linha.replace(/^\d+\.\s*título:\s*/i, '').replace(/^título:\s*/i, '').trim();
          habilidadeAtual = { titulo };
        }
        // Verificar se é uma descrição
        else if (linha.toLowerCase().includes('descrição:')) {
          // Extrair descrição (remover numeração e prefixo se houver)
          const descricao = linha.replace(/^\d+\.\s*descrição:\s*/i, '').replace(/^descrição:\s*/i, '').trim();
          habilidadeAtual.descricao = descricao;
        }
        // Se a linha não está vazia e não é um título/descrição, pode ser continuação da descrição
        else if (linha && habilidadeAtual.titulo && !habilidadeAtual.descricao) {
          // Pode ser uma descrição sem o prefixo "Descrição:"
          habilidadeAtual.descricao = linha;
        }
        else if (linha && habilidadeAtual.descricao) {
          // Continuar a descrição em múltiplas linhas
          habilidadeAtual.descricao += ' ' + linha;
        }
      }
      
      // Adicionar a última habilidade se estiver completa
      if (habilidadeAtual.titulo && habilidadeAtual.descricao) {
        habilidades.push(habilidadeAtual);
      }
      
      // Filtrar habilidades válidas
      const habilidadesValidas = habilidades.filter(habilidade => {
        return habilidade.titulo && 
               habilidade.titulo.length > 2 && 
               habilidade.titulo.length < 100 &&
               habilidade.descricao && 
               habilidade.descricao.length > 10 && 
               habilidade.descricao.length < 500;
      });
      
      // Limitar a 15 habilidades
      return habilidadesValidas.slice(0, 15);

    } catch (error) {
      logger.error('Erro ao extrair habilidades da resposta da IA', {
        error: error.message,
        resposta_ia: respostaIA
      });
      return [];
    }
  }

  /**
   * Obter informações sobre a API de IA
   * GET /api/ia/info
   */
  obterInfoIA = async (req, res) => {
    try {
      return ApiResponse.success(res, {
        modelo: 'OpenAI GPT-3.5-turbo',
        funcionalidade: 'Geração de habilidades para cargos',
        parametros_aceitos: {
          titulo_cargo: 'string (obrigatório)',
          descricao_cargo: 'string (obrigatório)', 
          senioridade: 'string (obrigatório)',
          setor: 'string (opcional)',
          departamento: 'string (opcional)'
        },
        limite_habilidades: {
          minimo: 5,
          maximo: 15
        },
        versao: '1.0.0'
      }, 'Informações da API de IA');
    } catch (error) {
      logger.error('Erro ao obter informações da IA', { 
        error: error.message, 
        stack: error.stack
      });
      return ApiResponse.error(res, 'Erro interno do servidor', 500);
    }
  }
}

module.exports = new IAController();
module.exports.IAController = IAController;
