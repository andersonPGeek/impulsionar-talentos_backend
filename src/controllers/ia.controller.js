const { BaseController } = require('./index');
const { OpenAI } = require('openai');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');
const { pool } = require('../utils/supabase');
const axios = require('axios');
const WebSocket = require('ws');
const ElevenLabsWebSocketManager = require('../utils/websocket-elevenlabs');

class IAController extends BaseController {
  constructor() {
    super();
    // Inicializar cliente OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    // Eleven Labs Agent ID
    this.elevenLabsAgentId = 'agent_7801kdv0nw39fqgr2p69qx2m28bj';
    // API Key da Eleven Labs - ler novamente a cada vez para garantir que está atualizado
    this.elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY?.trim();
    
    // Debug: verificar se a chave está sendo lida (sem mostrar o valor completo)
    if (this.elevenLabsApiKey) {
      logger.info('Eleven Labs API Key configurada', {
        tem_api_key: true,
        tamanho: this.elevenLabsApiKey.length,
        prefixo: this.elevenLabsApiKey.substring(0, 5) + '...'
      });
    } else {
      logger.warn('ELEVEN_LABS_API_KEY não configurada', {
        env_var_exists: !!process.env.ELEVEN_LABS_API_KEY,
        env_value: process.env.ELEVEN_LABS_API_KEY ? 'existe mas vazia' : 'não existe'
      });
    }
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
        funcionalidades: [
          'Geração de habilidades para cargos',
          'Assistente de perfil do colaborador',
          'Geração de PDI/Metas',
          'Assistente para gestores',
          'Assistente para colaboradores',
          'Conversação por voz (Eleven Labs)'
        ],
        versao: '2.0.0'
      }, 'Informações da API de IA');
    } catch (error) {
      logger.error('Erro ao obter informações da IA', { 
        error: error.message, 
        stack: error.stack
      });
      return ApiResponse.error(res, 'Erro interno do servidor', 500);
    }
  }

  /**
   * Chat IA para preencher perfil do colaborador
   * POST /api/ia/chat/perfil
   */
  chatPerfilColaborador = async (req, res) => {
    const client = await pool.connect();
    try {
      const { id_user, mensagem, historico } = req.body;

      if (!id_user) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório'
        });
      }

      if (!mensagem || mensagem.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_MESSAGE',
          message: 'Mensagem é obrigatória'
        });
      }

      // Buscar nome do usuário
      const usuarioQuery = `SELECT nome FROM usuarios WHERE id = $1`;
      const usuarioResult = await client.query(usuarioQuery, [id_user]);
      const nomeUsuario = usuarioResult.rows[0]?.nome || 'colaborador';

      // Buscar perfil atual do colaborador
      const perfilQuery = `
        SELECT 
          (SELECT row_to_json(ip) FROM identidade_profissional ip WHERE ip.id_user = $1 LIMIT 1) as identidade_profissional,
          (SELECT COALESCE(json_agg(row_to_json(ht)), '[]'::json) FROM habilidades_tecnicas ht WHERE ht.id_user = $1) as habilidades_tecnicas,
          (SELECT row_to_json(hc) FROM habilidades_comportamentais hc WHERE hc.id_user = $1 LIMIT 1) as habilidades_comportamentais,
          (SELECT row_to_json(im) FROM interesses_motivadores im WHERE im.id_user = $1 LIMIT 1) as interesses_motivadores,
          (SELECT row_to_json(pv) FROM proposito_valores pv WHERE pv.id_user = $1 LIMIT 1) as proposito_valores,
          (SELECT row_to_json(oc) FROM objetivos_carreira oc WHERE oc.id_user = $1 LIMIT 1) as objetivos_carreira,
          (SELECT row_to_json(d) FROM disponibilidade d WHERE d.id_user = $1 LIMIT 1) as disponibilidade,
          (SELECT row_to_json(hi) FROM historico_inicial hi WHERE hi.id_user = $1 LIMIT 1) as historico_inicial
      `;
      const perfilResult = await client.query(perfilQuery, [id_user]);
      const perfilAtual = perfilResult.rows[0] || {};

      // Construir contexto para a IA
      const contexto = this.construirContextoPerfil(perfilAtual);
      
      // Preparar histórico de mensagens
      const messages = [
        {
          role: 'system',
          content: `👋 Olá! Eu sou seu Assistente de Perfil Profissional.

Meu nome é Alex e estou aqui para ajudá-lo, ${nomeUsuario}, a construir seu perfil profissional completo de forma descontraída e objetiva.

🎯 **MINHA MISSÃO:**
Auxiliá-lo a preencher todas as informações do seu perfil profissional através de uma conversa natural. Vou fazer perguntas progressivas e inteligentes para conhecer melhor você e suas experiências.

📋 **O QUE VAMOS PREENCHER JUNTOS:**
- **Identidade Profissional**: área de atuação, tempo na empresa, formação, certificações
- **Habilidades Técnicas**: tecnologias, ferramentas e competências que você domina
- **Habilidades Comportamentais**: comunicação, trabalho em equipe, organização, autonomia, liderança, resiliência e aprendizado contínuo
- **Interesses e Motivadores**: o que você gosta no trabalho, o que não gosta, suas preferências e fatores de retenção
- **Propósito e Valores**: seus valores profissionais e o que te move
- **Objetivos de Carreira**: onde você quer estar em 1, 3 e 5 anos
- **Disponibilidade**: tempo e preferências para desenvolvimento
- **Histórico**: cursos, eventos, projetos relevantes e feedbacks recebidos

💬 **MEU ESTILO:**
- Converso de forma amigável e empática
- Faço uma pergunta por vez para não sobrecarregar
- Respeito seu ritmo e suas respostas
- Após cada seção, posso resumir o que coletamos para confirmar

${contexto}

Vamos começar? Quando estiver pronto, me diga em qual área gostaria de começar ou se prefere que eu sugira por onde iniciarmos! 🚀`
        }
      ];

      // Adicionar histórico se fornecido
      if (Array.isArray(historico)) {
        messages.push(...historico.slice(-10)); // Últimas 10 mensagens
      }

      // Adicionar mensagem atual
      messages.push({
        role: 'user',
        content: mensagem
      });

      // Chamar OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      const resposta = completion.choices[0].message.content;

      logger.info('Chat de perfil executado com sucesso', { id_user });

      return ApiResponse.success(res, {
        resposta,
        id_user: parseInt(id_user)
      }, 'Resposta gerada com sucesso');

    } catch (error) {
      logger.error('Erro no chat de perfil', { error: error.message, stack: error.stack });
      return ApiResponse.error(res, 'Erro ao processar chat', 500, {
        error: 'IA_CHAT_ERROR'
      });
    } finally {
      client.release();
    }
  }

  /**
   * Gerar PDI/Metas baseado no perfil do colaborador
   * POST /api/ia/gerar-pdi
   */
  gerarPDI = async (req, res) => {
    const client = await pool.connect();
    try {
      const { id_user } = req.body;

      if (!id_user) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório'
        });
      }

      // Buscar nome do usuário e dados gerais
      const usuarioQuery = `
        SELECT 
          u.nome, 
          u.id_cliente,
          u.cargo,
          pv.orgulho_trabalho,
          pv.impacto_desejado,
          pv.nao_aceita_ambiente,
          pv.definicao_sucesso,
          d.horas_semanais_desenvolvimento,
          d.preferencia_aprendizado,
          d.aberto_mudanca,
          d.aceita_desafios
        FROM usuarios u
        LEFT JOIN proposito_valores pv ON u.id = pv.id_user
        LEFT JOIN disponibilidade d ON u.id = d.id_user
        WHERE u.id = $1
      `;
      const usuarioResult = await client.query(usuarioQuery, [id_user]);
      if (usuarioResult.rows.length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado'
        });
      }

      const { 
        nome: nomeUsuario, 
        id_cliente,
        orgulho_trabalho,
        impacto_desejado,
        nao_aceita_ambiente,
        definicao_sucesso,
        horas_semanais_desenvolvimento,
        preferencia_aprendizado,
        aberto_mudanca,
        aceita_desafios
      } = usuarioResult.rows[0];
      
      // Montar propósito e valores
      const proposito_valores = [orgulho_trabalho, impacto_desejado, nao_aceita_ambiente, definicao_sucesso]
        .filter(v => v)
        .join(' | ') || 'Não informado';

      // Buscar perfil do colaborador (identidade, habilidades, objetivos)
      let perfilResult = { rows: [{}] };
      try {
        const perfilQuery = `
          SELECT 
            (SELECT row_to_json(ip) FROM identidade_profissional ip WHERE ip.id_user = $1 LIMIT 1) as identidade,
            (SELECT COALESCE(json_agg(row_to_json(ht)), '[]'::json) FROM habilidades_tecnicas ht WHERE ht.id_user = $1) as habilidades_tecnicas,
            (SELECT row_to_json(hc) FROM habilidades_comportamentais hc WHERE hc.id_user = $1 LIMIT 1) as habilidades_comp,
            (SELECT row_to_json(oc) FROM objetivos_carreira oc WHERE oc.id_user = $1 LIMIT 1) as objetivos
        `;
        perfilResult = await client.query(perfilQuery, [id_user]);
      } catch (queryError) {
        logger.warn('Erro ao buscar perfil do colaborador', { error: queryError.message, id_user });
      }

      // Buscar árvore da vida (última)
      let arvoreResult = { rows: [{}] };
      try {
        const arvoreQuery = `
          SELECT * FROM arvore_da_vida 
          WHERE id_usuario = $1 
          ORDER BY created_at DESC 
          LIMIT 1
        `;
        arvoreResult = await client.query(arvoreQuery, [id_user]);
      } catch (queryError) {
        logger.warn('Erro ao buscar árvore da vida', { error: queryError.message, id_user });
      }

      // Buscar análise SWOT
      let swotResult = { rows: [] };
      try {
        const swotQuery = `
          SELECT 
            cs.categoria,
            json_agg(DISTINCT ts.texto) as textos
          FROM analise_swot asw
          JOIN categoria_swot cs ON asw.categoria_swot = cs.id
          JOIN textos_swot ts ON asw.id_texto_swot = ts.id
          WHERE asw.id_usuario = $1
          GROUP BY cs.id, cs.categoria
        `;
        swotResult = await client.query(swotQuery, [id_user]);
      } catch (queryError) {
        logger.warn('Erro ao buscar análise SWOT', { error: queryError.message, id_user });
      }

      // Buscar metas existentes com suas atividades
      let metasResult = { rows: [] };
      try {
        const metasQuery = `
          SELECT 
            m.id,
            m.titulo,
            m.prazo,
            m.status,
            m.resultado_3_meses,
            m.resultado_6_meses,
            m.feedback_gestor,
            json_agg(
              json_build_object(
                'id', a.id,
                'titulo', a.titulo_atividade,
                'status', a.status_atividade,
                'evidencia', a.evidencia_atividade
              )
            ) FILTER (WHERE a.id IS NOT NULL) as atividades
          FROM metas_pdi m
          LEFT JOIN atividades_pdi a ON m.id = a.id_meta_pdi
          WHERE m.id_usuario = $1
          GROUP BY m.id, m.titulo, m.prazo, m.status, m.resultado_3_meses, 
                   m.resultado_6_meses, m.feedback_gestor, m.created_at
          ORDER BY m.created_at DESC
          LIMIT 10
        `;
        metasResult = await client.query(metasQuery, [id_user]);
      } catch (queryError) {
        logger.warn('Erro ao buscar metas existentes', { error: queryError.message, id_user });
      }

      // Buscar experiência do portfólio
      let experienciaResult = { rows: [] };
      try {
        const experienciaQuery = `
          SELECT 
            id,
            titulo_experiencia,
            data_experiencia,
            acao_realizada,
            resultado_entregue
          FROM experiencia_portifolio
          WHERE id_usuario = $1
          ORDER BY data_experiencia DESC
          LIMIT 10
        `;
        experienciaResult = await client.query(experienciaQuery, [id_user]);
      } catch (queryError) {
        logger.warn('Erro ao buscar experiência do portfólio', { error: queryError.message, id_user });
      }

      // Buscar cargos disponíveis na empresa (se id_cliente existe)
      let cargosResult = { rows: [] };
      if (id_cliente) {
        try {
          const cargosQuery = `
            SELECT 
              c.id,
              c.nome_cargo,
              c.descricao,
              s.nome_setor,
              se.id as senioridade_id,
              (SELECT json_agg(json_build_object('habilidade', hc.habilidade, 'descricao', hc.descricao)) 
               FROM habilidades_cargo hc
               WHERE hc.id_cargo = c.id
              ) as habilidades_requeridas
            FROM cargo c
            LEFT JOIN setor s ON c.setor_id = s.id
            LEFT JOIN senioridade se ON c.senioridade_id = se.id
            WHERE c.id_cliente = $1
            ORDER BY se.id ASC, c.nome_cargo ASC
            LIMIT 15
          `;
          cargosResult = await client.query(cargosQuery, [id_cliente]);
        } catch (queryError) {
          logger.warn('Erro ao buscar cargos disponíveis', { error: queryError.message, id_cliente });
        }
      }

      // Construir contexto detalhado
      // Buscar habilidades do cargo do usuário (OBRIGATÓRIO)
      const usuarioCargoId = usuarioResult.rows[0] ? usuarioResult.rows[0].cargo : null;
      
      if (!usuarioCargoId) {
        return ApiResponse.badRequest(res, {
          error: 'USER_WITHOUT_JOB',
          message: 'Usuário não possui cargo atribuído. É necessário ter um cargo para gerar PDI.'
        });
      }

      let habilidadesCargoResult = { rows: [] };
      try {
        const habilidadesCargoQuery = `
          SELECT 
            id,
            habilidade,
            descricao
          FROM habilidades_cargo
          WHERE id_cargo = $1
          ORDER BY habilidade
        `;
        habilidadesCargoResult = await client.query(habilidadesCargoQuery, [usuarioCargoId]);
        
        if (habilidadesCargoResult.rows.length === 0) {
          return ApiResponse.badRequest(res, {
            error: 'CARGO_WITHOUT_SKILLS',
            message: 'O cargo do usuário não possui habilidades cadastradas. É necessário cadastrar habilidades no cargo para gerar PDI.'
          });
        }
      } catch (queryError) {
        logger.error('Erro ao buscar habilidades do cargo', { error: queryError.message, cargo_id: usuarioCargoId });
        return ApiResponse.internalError(res);
      }

      const contexto = `
📌 DADOS DO COLABORADOR: ${nomeUsuario}

🎯 **PROPÓSITO E VALORES:**
${proposito_valores || 'Não informado'}

⏰ **DISPONIBILIDADE E PREFERÊNCIAS:**
- Horas semanais para desenvolvimento: ${horas_semanais_desenvolvimento || 'Não informado'} horas
- Preferência de aprendizado: ${preferencia_aprendizado || 'Não informado'}
- Aberto a mudanças: ${aberto_mudanca === null ? 'Não informado' : aberto_mudanca ? 'Sim' : 'Não'}
- Aceita desafios: ${aceita_desafios === null ? 'Não informado' : aceita_desafios ? 'Sim' : 'Não'}

💡 **HABILIDADES DO CARGO QUE PODE DESENVOLVER:**
${habilidadesCargoResult.rows.length > 0 ? habilidadesCargoResult.rows.map(h => `- ${h.habilidade}: ${h.descricao}`).join('\n') : 'Nenhuma habilidade de cargo disponível'}

👤 **PERFIL PROFISSIONAL:**
${JSON.stringify(perfilResult.rows[0] || {}, null, 2)}

🌳 **ÁRVORE DA VIDA (ÚLTIMA AVALIAÇÃO):**
${JSON.stringify(arvoreResult.rows[0] || {}, null, 2)}

⚔️ **ANÁLISE SWOT:**
${JSON.stringify(swotResult.rows || [], null, 2)}

📚 **EXPERIÊNCIA E REALIZAÇÕES (PORTFÓLIO):**
${JSON.stringify(experienciaResult.rows || [], null, 2)}

📋 **METAS JÁ CADASTRADAS:**
${metasResult.rows.length > 0 ? JSON.stringify(metasResult.rows, null, 2) : 'Nenhuma meta cadastrada ainda'}

🏢 **CARGOS DISPONÍVEIS NA EMPRESA:**
${JSON.stringify(cargosResult.rows || [], null, 2)}
      `;

      const dataAtual = new Date();
      const prazominim = new Date(dataAtual.getTime() + 90 * 24 * 60 * 60 * 1000);
      const prazoMinString = prazominim.toISOString().split('T')[0];

      // Calcular quantidade de atividades baseado na disponibilidade
      let qtdAtividadesRecomendada = 3;
      if (horas_semanais_desenvolvimento) {
        if (horas_semanais_desenvolvimento >= 10) qtdAtividadesRecomendada = 5;
        else if (horas_semanais_desenvolvimento >= 5) qtdAtividadesRecomendada = 4;
        else qtdAtividadesRecomendada = 3;
      }

      // Determinar tom e intensidade baseado em aceita_desafios e aberto_mudanca
      let tonoIntensidade = 'moderado';
      if (aceita_desafios === true && aberto_mudanca === true) tonoIntensidade = 'desafiador e transformador';
      else if (aceita_desafios === false || aberto_mudanca === false) tonoIntensidade = 'progressivo e seguro';

      // Mapear preferência de aprendizado
      let dicas_aprendizado = 'cursos online, livros e prática no dia a dia';
      if (preferencia_aprendizado) {
        if (preferencia_aprendizado.toLowerCase().includes('pratico')) dicas_aprendizado = 'atividades práticas e projetos reais';
        else if (preferencia_aprendizado.toLowerCase().includes('teorico')) dicas_aprendizado = 'cursos estruturados e estudo independente';
        else if (preferencia_aprendizado.toLowerCase().includes('mentor')) dicas_aprendizado = 'mentoria, coaching e aprendizado com especialistas';
        else if (preferencia_aprendizado.toLowerCase().includes('grupo')) dicas_aprendizado = 'trabalho em grupo, discussões e comunidades';
      }

      const systemPrompt = `🎯 Olá! Eu sou sua Especialista em Desenvolvimento de Carreira.

Meu nome é Maya e minha função é criar Planos de Desenvolvimento Individual (PDI) personalizados, estratégicos e transformadores.

📊 **MEU PROCESSO ESTRATÉGICO:**
1. Analiso profundamente o **propósito e valores** do colaborador ${nomeUsuario}
2. Considero sua identidade profissional, habilidades técnicas e comportamentais
3. Avalio sua árvore da vida (bem-estar em 12 dimensões)
4. Estudo sua análise SWOT (forças, fraquezas, oportunidades e ameaças)
5. Reviso suas experiências e realizações no portfólio
6. Analiso as metas já cadastradas para **NÃO SER REPETITIVO**
7. Considero os cargos disponíveis na empresa que alinham com seu propósito
8. **IMPORTANTE:** Respeito a disponibilidade e preferências de desenvolvimento do ${nomeUsuario}
9. Criei um plano que leva você aos cargos que mais combinam com você, dentro da sua realidade

📋 **PERFIL DE DESENVOLVIMENTO DO ${nomeUsuario.toUpperCase()}:**
- **Disponibilidade semanal:** ${horas_semanais_desenvolvimento || 'Não especificada'} horas
- **Preferência de aprendizado:** ${dicas_aprendizado}
- **Abertura a mudanças:** ${aberto_mudanca === null ? 'Não informado' : aberto_mudanca ? 'Sim, muito aberto' : 'Prefere progressão gradual'}
- **Aceita desafios:** ${aceita_desafios === null ? 'Não informado' : aceita_desafios ? 'Sim, gosta de desafios' : 'Prefere segurança e certeza'}
- **Tone de desenvolvimento:** ${tonoIntensidade}

🔍 **FOCO PRINCIPAL - PROPÓSITO + DISPONIBILIDADE:**
Tudo que vou sugerir está 100% alinhado com:
1. O propósito e valores do ${nomeUsuario}
2. Sua disponibilidade semanal (${horas_semanais_desenvolvimento || 'não especificada'} horas)
3. Sua preferência de aprendizado (${preferencia_aprendizado || 'não especificada'})
4. Seu nível de abertura a mudanças e aceitação de desafios

As metas não são genéricas - são específicas, realizáveis dentro do seu tempo, e alinhadas com seus valores.

✅ **O QUE VOU ENTREGAR:**
Um PDI completo com 3 a 5 metas estratégicas novas (não repetindo o que já existe), onde cada meta possui:
- **titulo**: Titulo claro e objetivo, DIFERENTE das metas já cadastradas
- **atividades**: Array com ${qtdAtividadesRecomendada} atividades concretas e acionáveis (baseado em sua disponibilidade de ${horas_semanais_desenvolvimento || '?'} horas/semana)
- **prazo**: Data realista (mínimo ${prazoMinString})
- **status**: Sempre "Em Progresso" para metas novas
- **resultado_3_meses**: O que se espera alcançar em 3 meses
- **resultado_6_meses**: O que se espera alcançar em 6 meses
- **feedback_gestor**: Instruções PRÁTICAS e ESPECÍFICAS de COMO fazer cada atividade
- **id_habilidades**: Array com IDs das habilidades do cargo que serão desenvolvidas nesta meta (OBRIGATÓRIO)

⚡ **MAPEAMENTO DE HABILIDADES DO CARGO (OBRIGATÓRIO):**
Para cada meta que gerar, VOCÊ DEVE escolher 1-3 habilidades do cargo do ${nomeUsuario} que aquela meta vai desenvolver.

🎯 HABILIDADES DISPONÍVEIS DO CARGO:
${habilidadesCargoResult.rows.length > 0 ? habilidadesCargoResult.rows.map((h, idx) => `${idx + 1}. **${h.habilidade}** (ID: ${h.id})\n   Descrição: ${h.descricao || 'Sem descrição'}`).join('\n\n') : 'NENHUMA HABILIDADE DISPONÍVEL'}

⚠️ REGRAS CRÍTICAS:
- Cada meta DEVE estar vinculada a pelo menos 1 habilidade (máximo 3)
- Use APENAS os IDs das habilidades listadas acima
- Cada meta deve desenvolver habilidades específicas e relevantes
- As habilidades devem estar diretamente relacionadas ao conteúdo e objetivo da meta

📌 **FORMATO DE RESPOSTA (CRUCIAL):**
Você DEVE responder EXATAMENTE em JSON estruturado assim:
\`\`\`json
{
  "metas": [
    {
      "titulo": "Meta 1 clara e objetiva",
      "atividades": ["atividade 1", "atividade 2", "atividade 3"],
      "prazo": "${prazoMinString}",
      "status": "Em Progresso",
      "resultado_3_meses": "Descrição clara",
      "resultado_6_meses": "Descrição clara",
      "feedback_gestor": "Instruções práticas e específicas",
      "id_habilidades": [1, 3]
    },
    {
      "titulo": "Meta 2 clara e objetiva",
      "atividades": ["atividade 1", "atividade 2"],
      "prazo": "${prazoMinString}",
      "status": "Em Progresso",
      "resultado_3_meses": "Descrição clara",
      "resultado_6_meses": "Descrição clara",
      "feedback_gestor": "Instruções práticas e específicas",
      "id_habilidades": [2]
    }
  ]
}
\`\`\`

⚠️ **VALIDAÇÃO OBRIGATÓRIA:**
- SEMPRE comece com { e termine com }
- Campo principal DEVE ser "metas": [ ]
- Cada meta DEVE ter TODOS os 8 campos obrigatórios (incluindo id_habilidades)
- atividades DEVE ser um array com strings (mínimo ${qtdAtividadesRecomendada} itens)
- id_habilidades DEVE ser um array com IDs válidos das habilidades do cargo (mínimo 1)
- prazo DEVE estar no formato YYYY-MM-DD
- NÃO adicione nada antes ou depois do JSON

🚀 Vamos criar um PDI que realmente transforme a trajetória do ${nomeUsuario}, respeitando seu tempo e preferências!`;

      let completion;
      try {
        completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Com base em TODA a informação abaixo, gere um PDI estratégico e transformador com 3 a 5 metas:\n\n${contexto}\n\nLembre-se: \n1. NÃO repita metas existentes\n2. Seja MUITO específico no feedback_gestor com dicas práticas de COMO fazer\n3. Aligne TUDO com o propósito do ${nomeUsuario}\n4. RESPONDA OBRIGATORIAMENTE em JSON válido no formato especificado\n5. CAMPO PRINCIPAL DEVE SER "metas": [...]` }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        });
      } catch (openaiError) {
        logger.error('Erro ao chamar OpenAI', { 
          error: openaiError.message, 
          id_user,
          errorCode: openaiError.code
        });
        throw openaiError;
      }

      if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message) {
        throw new Error('Resposta inválida da OpenAI: estrutura não esperada');
      }

      let respostaJSON;
      try {
        respostaJSON = JSON.parse(completion.choices[0].message.content);
        logger.info('Resposta JSON parseada com sucesso', {
          id_user,
          keys: Object.keys(respostaJSON),
          tem_metas: !!respostaJSON.metas,
          metas_count: Array.isArray(respostaJSON.metas) ? respostaJSON.metas.length : 'não é array'
        });
      } catch (parseError) {
        logger.error('Erro ao fazer parse da resposta JSON da OpenAI', { 
          error: parseError.message,
          content: completion.choices[0].message.content,
          id_user
        });
        throw new Error(`Erro ao fazer parse da resposta JSON: ${parseError.message}`);
      }

      let pdiGerado = respostaJSON.metas || [];
      
      // Se pdiGerado está vazio, tenta outras chaves possíveis
      if (pdiGerado.length === 0) {
        logger.warn('Campo "metas" vazio, tentando alternativas', { id_user });
        
        // Tentar procurar metas em outros campos possíveis
        if (Array.isArray(respostaJSON.pdi)) {
          pdiGerado = respostaJSON.pdi;
          logger.warn('Encontrado em campo "pdi"', { id_user, quantidade: pdiGerado.length });
        } else if (Array.isArray(respostaJSON.plano)) {
          pdiGerado = respostaJSON.plano;
          logger.warn('Encontrado em campo "plano"', { id_user, quantidade: pdiGerado.length });
        } else if (Array.isArray(respostaJSON.objetivos)) {
          pdiGerado = respostaJSON.objetivos;
          logger.warn('Encontrado em campo "objetivos"', { id_user, quantidade: pdiGerado.length });
        }
        
        // Log completo se ainda estiver vazio
        if (pdiGerado.length === 0) {
          logger.error('PDI gerado vazio - resposta JSON completa', {
            id_user,
            keys_disponiveis: Object.keys(respostaJSON),
            respostaJSON_preview: JSON.stringify(respostaJSON).substring(0, 2000)
          });
          throw new Error('IA retornou resposta vazia - nenhum campo "metas" encontrado. Tente novamente.');
        }
      }

      // Garantir que os campos estejam corretos e compatíveis com a API
      pdiGerado = pdiGerado
        .filter(meta => {
          // Validar campos obrigatórios
          const valido = meta.titulo && meta.titulo.trim() && Array.isArray(meta.atividades) && meta.atividades.length > 0 && Array.isArray(meta.id_habilidades) && meta.id_habilidades.length > 0;
          if (!valido) {
            logger.warn('Meta inválida (campos obrigatórios faltando)', { 
              id_user, 
              meta_titulo: meta.titulo, 
              meta_atividades_count: Array.isArray(meta.atividades) ? meta.atividades.length : 0,
              meta_id_habilidades_count: Array.isArray(meta.id_habilidades) ? meta.id_habilidades.length : 0
            });
          }
          return valido;
        })
        .map(meta => {
          // Normalizar status: converter para formato aceito pela API
          let statusNormalizado = meta.status || 'Em Progresso';
          const statusMap = {
            'em_progresso': 'Em Progresso',
            'em progresso': 'Em Progresso',
            'progresso': 'Em Progresso',
            'parado': 'Parado',
            'atrasado': 'Atrasado',
            'concluida': 'Concluida',
            'concluído': 'Concluida',
            'concluído': 'Concluida'
          };
          
          const statusLower = String(statusNormalizado).toLowerCase().trim();
          statusNormalizado = statusMap[statusLower] || 'Em Progresso';
          
          return {
            titulo: meta.titulo || '',
            atividades: Array.isArray(meta.atividades) ? meta.atividades.filter(a => a && typeof a === 'string' && a.trim()) : [],
            prazo: meta.prazo || meta.data_vencimento || prazoMinString,
            status: statusNormalizado,
            resultado_3_meses: meta.resultado_3_meses || null,
            resultado_6_meses: meta.resultado_6_meses || null,
            feedback_gestor: meta.feedback_gestor || meta.observacao_gestor || '',
            id_habilidades: Array.isArray(meta.id_habilidades) ? meta.id_habilidades.filter(h => h && !isNaN(h)).map(h => parseInt(h)) : [],
            id_usuario: parseInt(id_user),
            id_usuarios: [parseInt(id_user)]
          };
        });

      if (pdiGerado.length === 0) {
        throw new Error('Nenhuma meta válida foi gerada após validação. Verifique se a IA está retornando estrutura correta.');
      }

      // Validar e filtrar id_habilidades para garantir que existem no cargo do usuário
      const habilidadesValidasQuery = `
        SELECT id FROM habilidades_cargo 
        WHERE id_cargo = (SELECT cargo FROM usuarios WHERE id = $1)
      `;
      
      const habilidadesValidasResult = await client.query(habilidadesValidasQuery, [id_user]);
      // Converter para números para comparação correta
      const habilidadesValidas = new Set(habilidadesValidasResult.rows.map(h => parseInt(h.id)));
      
      logger.info('Habilidades válidas do cargo do usuário', { 
        id_user, 
        cargo: usuarioResult.rows[0]?.cargo,
        habilidades_validas: Array.from(habilidadesValidas),
        total_habilidades_validas: habilidadesValidas.size
      });

      // Filtrar habilidades de cada meta, mantendo apenas as válidas
      pdiGerado = pdiGerado.map(meta => {
        const id_habilidades_originais = Array.isArray(meta.id_habilidades) 
          ? meta.id_habilidades.map(h => parseInt(h)) 
          : [];
        const id_habilidades_filtradas = id_habilidades_originais.filter(h => habilidadesValidas.has(h));
        
        if (id_habilidades_filtradas.length === 0) {
          logger.warn('Meta sem habilidades válidas - usando primeira habilidade disponível', {
            id_user,
            titulo_meta: meta.titulo,
            habilidades_solicitadas: id_habilidades_originais,
            habilidades_validas: Array.from(habilidadesValidas)
          });
          
          // Se nenhuma habilidade válida foi encontrada, usar a primeira disponível
          if (habilidadesValidas.size > 0) {
            id_habilidades_filtradas.push(Array.from(habilidadesValidas)[0]);
          }
        }
        
        return {
          ...meta,
          id_habilidades: id_habilidades_filtradas
        };
      });

      // Remover metas que não têm habilidades válidas
      pdiGerado = pdiGerado.filter(meta => {
        const temHabilidades = Array.isArray(meta.id_habilidades) && meta.id_habilidades.length > 0;
        if (!temHabilidades) {
          logger.warn('Meta descartada - sem habilidades válidas', {
            id_user,
            titulo_meta: meta.titulo
          });
        }
        return temHabilidades;
      });

      if (pdiGerado.length === 0) {
        throw new Error('Nenhuma meta com habilidades válidas foi gerada. Verifique se o cargo tem habilidades cadastradas.');
      }

      // GARANTIR normalização final de status antes de retornar ao cliente
      // Isso garante que mesmo que a resposta anterior não tenha sido normalizada, será normalizado aqui
      const statusMap = {
        'em_progresso': 'Em Progresso',
        'em progresso': 'Em Progresso',
        'progresso': 'Em Progresso',
        'parado': 'Parado',
        'atrasado': 'Atrasado',
        'concluida': 'Concluida',
        'concluído': 'Concluida'
      };
      
      pdiGerado = pdiGerado.map(meta => {
        let statusFinal = meta.status || 'Em Progresso';
        const statusLower = String(statusFinal).toLowerCase().trim();
        statusFinal = statusMap[statusLower] || 'Em Progresso';
        
        logger.debug('Status normalizado para resposta', {
          id_user,
          titulo_meta: meta.titulo,
          status_original: meta.status,
          status_final: statusFinal
        });
        
        return {
          ...meta,
          status: statusFinal
        };
      });
      
      // Verificar que todos têm status correto antes de prosseguir
      const todosComStatusValido = pdiGerado.every(meta => {
        const statusValido = ['Em Progresso', 'Parado', 'Atrasado', 'Concluida'].includes(meta.status);
        if (!statusValido) {
          logger.error('Meta com status INVÁLIDO APÓS NORMALIZAÇÃO', {
            id_user,
            titulo: meta.titulo,
            status: meta.status
          });
        }
        return statusValido;
      });
      
      if (!todosComStatusValido) {
        logger.error('FALHA: Algumas metas têm status inválido após normalização. Abortando...', { id_user });
        throw new Error('Erro na normalização de status. Verifique os logs.');
      }
      
      logger.info('Todos os status normalizados corretamente', {
        id_user,
        quantidade_metas: pdiGerado.length,
        status_amostra: pdiGerado[0]?.status
      });

      // Salvar as metas geradas no banco de dados
      logger.info('Iniciando salvamento das metas geradas', { id_user, quantidade_metas: pdiGerado.length });
      
      try {
        await client.query('BEGIN');
        
        const metasGeradasIds = [];
        
        for (const meta of pdiGerado) {
          try {
            // 1. Inserir meta na tabela metas_pdi
            const metaQuery = `
              INSERT INTO metas_pdi (
                titulo, prazo, status, resultado_3_meses, resultado_6_meses, 
                feedback_gestor, id_usuario
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING id
            `;
            
            const metaResult = await client.query(metaQuery, [
              meta.titulo,
              meta.prazo,
              meta.status,
              meta.resultado_3_meses,
              meta.resultado_6_meses,
              meta.feedback_gestor,
              parseInt(id_user)
            ]);
            
            const metaId = metaResult.rows[0].id;
            metasGeradasIds.push(metaId);
            
            logger.info('Meta inserida com sucesso', { meta_id: metaId, titulo: meta.titulo });
            
            // 2. Inserir atividades
            if (Array.isArray(meta.atividades) && meta.atividades.length > 0) {
              const atividadesQuery = `
                INSERT INTO atividades_pdi (
                  id_meta_pdi, titulo_atividade, status_atividade, evidencia_atividade
                ) VALUES ($1, $2, $3, $4)
              `;
              
              for (const atividade of meta.atividades) {
                await client.query(atividadesQuery, [
                  metaId,
                  atividade,
                  'backlog',
                  null
                ]);
              }
              
              logger.info('Atividades inseridas', { meta_id: metaId, atividades_count: meta.atividades.length });
            }
            
            // 3. Inserir pessoas envolvidas
            const pessoasQuery = `
              INSERT INTO pessoas_envolvidas_pdi (
                id_meta_pdi, id_usuario
              ) VALUES ($1, $2)
            `;
            
            for (const userId of meta.id_usuarios) {
              await client.query(pessoasQuery, [metaId, userId]);
            }
            
            logger.info('Pessoas envolvidas inseridas', { meta_id: metaId, usuarios_count: meta.id_usuarios.length });
            
            // 4. Inserir habilidades desenvolvidas
            if (Array.isArray(meta.id_habilidades) && meta.id_habilidades.length > 0) {
              const habilidadesQuery = `
                INSERT INTO meta_habilidades (
                  id_meta, id_habilidade, id_user
                ) VALUES ($1, $2, $3)
              `;
              
              for (const habilidadeId of meta.id_habilidades) {
                try {
                  await client.query(habilidadesQuery, [metaId, habilidadeId, parseInt(id_user)]);
                } catch (hErr) {
                  logger.warn('Erro ao inserir habilidade para meta', { 
                    meta_id: metaId, 
                    habilidade_id: habilidadeId, 
                    error: hErr.message 
                  });
                  // Continuar mesmo se uma habilidade falhar
                }
              }
              
              logger.info('Habilidades vinculadas', { meta_id: metaId, habilidades_count: meta.id_habilidades.length });
            }
            
          } catch (metaError) {
            logger.error('Erro ao inserir meta individual', { 
              error: metaError.message, 
              titulo: meta.titulo,
              id_user 
            });
            // Continuar com próxima meta mesmo com erro em uma
          }
        }
        
        await client.query('COMMIT');
        
        logger.info('Metas salvas com sucesso', { id_user, metas_salvas: metasGeradasIds.length });
        
      } catch (transactionError) {
        await client.query('ROLLBACK');
        logger.error('Erro ao fazer commit das metas', { 
          error: transactionError.message, 
          id_user 
        });
        // Não interromper - retornar o PDI mesmo que o salvamento tenha falhado
      }

      logger.info('PDI gerado com sucesso', { id_user, quantidade_metas: pdiGerado.length });

      // ÚLTIMA GARANTIA: Normalizar status EXATAMENTE ANTES de retornar ao cliente
      // Isso garante 100% que a resposta terá status correto
      const pdiComStatusCorreto = pdiGerado.map(meta => {
        const statusValido = ['Em Progresso', 'Parado', 'Atrasado', 'Concluida'];
        const statusAtual = String(meta.status || '').trim();
        
        // Se já está no formato correto, não fazer nada
        if (statusValido.includes(statusAtual)) {
          return meta;
        }
        
        // Caso contrário, normalizar
        const statusMap = {
          'em_progresso': 'Em Progresso',
          'em progresso': 'Em Progresso',
          'progresso': 'Em Progresso',
          'parado': 'Parado',
          'atrasado': 'Atrasado',
          'concluida': 'Concluida',
          'concluído': 'Concluida',
          'concluida': 'Concluida'
        };
        
        const statusLower = statusAtual.toLowerCase();
        const statusNormalizado = statusMap[statusLower] || 'Em Progresso';
        
        logger.warn('Status AINDA estava incorreto - normalizando na resposta final', {
          id_user,
          titulo: meta.titulo,
          status_anterior: meta.status,
          status_corrigido: statusNormalizado
        });
        
        return {
          ...meta,
          status: statusNormalizado
        };
      });

      // Log final de validação
      logger.info('Status FINAL validado antes de enviar ao cliente', {
        id_user,
        quantidade_metas: pdiComStatusCorreto.length,
        todos_status_corretos: pdiComStatusCorreto.every(m => 
          ['Em Progresso', 'Parado', 'Atrasado', 'Concluida'].includes(m.status)
        ),
        status_amostra: pdiComStatusCorreto[0]?.status
      });

      return ApiResponse.success(res, {
        id_user: parseInt(id_user),
        pdi: pdiComStatusCorreto,
        total_metas: pdiComStatusCorreto.length,
        gerado_por: 'OpenAI GPT-4o-mini',
        contexto_analise: {
          proposito_valores: proposito_valores || 'Não informado',
          metas_ja_cadastradas: metasResult.rows.length,
          experiencias_analisadas: experienciaResult.rows.length,
          cargos_disponiveis: cargosResult.rows.length
        },
        instrucoes: 'As metas já foram salvas automaticamente no banco de dados. Não é necessário criar novamente via API.'
      }, 'PDI gerado com sucesso');

    } catch (error) {
      logger.error('Erro ao gerar PDI', { 
        error: error.message, 
        stack: error.stack,
        id_user: req.body.id_user,
        errorType: error.constructor.name
      });
      return ApiResponse.error(res, `Erro ao gerar PDI: ${error.message}`, 500, {
        error: 'IA_PDI_GENERATION_ERROR',
        details: error.message
      });
    } finally {
      client.release();
    }
  }

  /**
   * Chat IA para auxiliar gestor
   * POST /api/ia/chat/gestor
   */
  chatGestor = async (req, res) => {
    const client = await pool.connect();
    try {
      const { id_gestor, mensagem, historico } = req.body;

      if (!id_gestor) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_GESTOR_ID',
          message: 'ID do gestor é obrigatório'
        });
      }

      if (!mensagem || mensagem.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_MESSAGE',
          message: 'Mensagem é obrigatória'
        });
      }

      // Buscar nome do gestor
      const gestorQuery = `SELECT nome FROM usuarios WHERE id = $1`;
      const gestorResult = await client.query(gestorQuery, [id_gestor]);
      const nomeGestor = gestorResult.rows[0]?.nome || 'gestor';

      // Buscar contexto completo dos colaboradores
      const contexto = await this.construirContextoGestor(client, id_gestor);

      const systemPrompt = `👔 Olá, ${nomeGestor}! Eu sou Max, seu Consultor Estratégico em Gestão de Pessoas e Desenvolvimento de Liderados.

🎯 **MINHA FUNÇÃO ESPECÍFICA:**
Sou seu assistente especializado em ajudá-lo a entender o desenvolvimento individual dos seus LIDERADOS e fornecer orientações práticas sobre como você, como gestor, pode conduzir e apoiar a carreira de cada membro da sua equipe. Também auxilio no bem-estar emocional dos colaboradores, dando direcionamentos tanto aos gestores quanto aos colaboradores visando sempre melhorar o bem-estar, desde que isso não prejudique outras pessoas nem eles mesmos.

📋 **MEU FOCO É:**
- Analisar o desenvolvimento profissional de CADA UM DOS SEUS LIDERADOS
- Identificar como você pode ajudar cada colaborador a crescer na carreira
- Sugerir estratégias específicas para você conduzir o desenvolvimento de cada pessoa da equipe
- Alertar sobre colaboradores que precisam de mais atenção ou suporte
- Recomendar ações práticas que VOCÊ, como gestor, pode tomar para apoiar cada liderado
- Monitorar o bem-estar emocional da equipe e oferecer direcionamentos de suporte
- Ajudar na melhoria contínua do bem-estar dos colaboradores de forma equilibrada

📊 **O QUE EU ANALISO DOS SEUS LIDERADOS:**
- Progresso e status das metas e PDIs de cada colaborador
- Perfis profissionais completos (habilidades, objetivos de carreira, interesses)
- Avaliações de bem-estar e satisfação (árvore da vida)
- Check-ins emocionais e notas de bem-estar dos colaboradores
- Análises SWOT individuais (forças, fraquezas, oportunidades, ameaças)
- Cargos atuais, senioridades e habilidades esperadas
- Portfólios, realizações e projetos relevantes
- Reconhecimentos recebidos e dados aos colegas

💡 **COMO POSSO AJUDÁ-LO COMO GESTOR:**
- Mostrar quem da sua equipe precisa de mais atenção no desenvolvimento
- Sugerir como você pode apoiar cada liderado em seu crescimento profissional
- Identificar gaps de desenvolvimento e como você pode ajudar a preenchê-los
- Recomendar conversas, feedbacks e ações específicas para cada colaborador
- Analisar tendências na equipe e oportunidades de desenvolvimento coletivo
- Alertar sobre riscos de retenção e estratégias para engajar cada liderado
- Orientar sobre como conduzir 1:1s e momentos de desenvolvimento
- Monitorar o bem-estar emocional e sugerir ações para melhorar a saúde mental
- Identificar colaboradores com sinais de estresse ou desconforto emocional
- Orientar sobre como apoiar o bem-estar de forma ética e equilibrada

💬 **MEU ESTILO DE COMUNICAÇÃO:**
- Direto, objetivo e estratégico
- Foco em ações práticas que VOCÊ pode tomar como gestor
- Baseado em dados concretos da sua equipe
- Empático, mas sempre com foco em resultados e desenvolvimento

🔒 **LIMITAÇÕES IMPORTANTES:**
- Trabalho APENAS com informações dos seus liderados (não do seu próprio perfil)
- Não invento ou assumo dados que não estão disponíveis
- Não respondo sobre assuntos externos (política, esportes, notícias, entretenimento, etc.)
- Se não possuo uma informação específica sobre algum colaborador, informo claramente
- Orientações sobre bem-estar SEMPRE priorizam o equilíbrio e a segurança de todos

⚡ **SUA APRESENTAÇÃO INICIAL (PRIMEIRA MENSAGEM):**
Quando a conversa iniciar, se apresente assim:
"Olá, ${nomeGestor}! Sou Max, seu consultor em gestão de pessoas. Estou aqui para ajudar você a entender o desenvolvimento dos seus liderados e orientá-lo sobre como pode apoiar a carreira de cada um deles. Também acompanho o bem-estar emocional da sua equipe e posso sugerir ações para apoiá-los de forma equilibrada. Tenho informações completas sobre sua equipe, incluindo perfis, metas, PDIs, análises, realizações e bem-estar emocional. Sobre qual colaborador ou aspecto da equipe você gostaria de saber mais? Posso começar mostrando um resumo geral ou focar em alguém específico."

${contexto}

Estou pronto para analisar sua equipe e fornecer insights valiosos! O que você gostaria de saber sobre seus colaboradores? 🚀 

SUAS RESPONSABILIDADES:
- Analisar o progresso e desenvolvimento dos colaboradores da equipe
- Identificar colaboradores que precisam de atenção (metas atrasadas, baixo progresso, problemas de desenvolvimento)
- Sugerir ações de desenvolvimento personalizadas baseadas nos perfis
- Monitorar o bem-estar emocional dos colaboradores através dos check-ins
- Alertar sobre colaboradores com notas baixas de bem-estar e recomendar ações para apoiá-los
- Orientar sobre como melhorar o bem-estar da equipe de forma ética e construtiva
- Sugerir direcionamentos que beneficiem o bem-estar individual SEM prejudicar outras pessoas nem a equipe
- Analisar tendências e padrões na equipe
- Fornecer insights estratégicos sobre a equipe
- Ajudar na tomada de decisões sobre desenvolvimento de pessoas e saúde emocional

RESTRIÇÕES CRÍTICAS DE SEGURANÇA:
⚠️ Você está AUTORIZADO a trabalhar APENAS com as informações fornecidas abaixo sobre os colaboradores da equipe.
⚠️ Você NÃO está autorizado a inventar, criar ou assumir informações que não foram fornecidas.
⚠️ Você NÃO está autorizado a responder sobre assuntos externos como: política, futebol, notícias, atualidades, entretenimento, cultura geral, etc.
⚠️ Se perguntado sobre assuntos não relacionados ao trabalho, desenvolvimento de pessoas ou gestão de equipes, você deve educadamente recusar e redirecionar para assuntos relacionados à sua função.
⚠️ Use APENAS os dados fornecidos nos perfis, metas, análises e outras informações dos colaboradores.
⚠️ Se alguma informação não estiver disponível nos dados fornecidos, informe que não possui essa informação específica.

DIRETRIZES DE ANÁLISE:
- Use os dados fornecidos para dar respostas baseadas em fatos e evidências
- Seja objetivo, mas empático ao fornecer feedback
- Forneça métricas concretas quando disponíveis
- Sugira ações acionáveis e práticas
- Considere o contexto completo: perfil, metas, árvore da vida, SWOT, cargo, portfólio e reconhecimentos
- Identifique padrões e oportunidades de desenvolvimento
- Alerte sobre riscos e necessidades de atenção

${contexto}`;

      const messages = [
        {
          role: 'system',
          content: systemPrompt
        }
      ];

      if (Array.isArray(historico)) {
        messages.push(...historico.slice(-10));
      }

      messages.push({
        role: 'user',
        content: mensagem
      });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500
      });

      const resposta = completion.choices[0].message.content;

      logger.info('Chat de gestor executado', { id_gestor });

      return ApiResponse.success(res, {
        resposta,
        id_gestor: parseInt(id_gestor)
      }, 'Resposta gerada com sucesso');

    } catch (error) {
      logger.error('Erro no chat de gestor', { error: error.message, stack: error.stack });
      return ApiResponse.error(res, 'Erro ao processar chat', 500, {
        error: 'IA_CHAT_ERROR'
      });
    } finally {
      client.release();
    }
  }

  /**
   * Chat IA para auxiliar colaborador
   * POST /api/ia/chat/colaborador
   */
  chatColaborador = async (req, res) => {
    const client = await pool.connect();
    try {
      const { id_user, mensagem, historico } = req.body;

      if (!id_user) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório'
        });
      }

      if (!mensagem || mensagem.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_MESSAGE',
          message: 'Mensagem é obrigatória'
        });
      }

      // Buscar nome do usuário
      const usuarioNomeQuery = `SELECT nome FROM usuarios WHERE id = $1`;
      const usuarioNomeResult = await client.query(usuarioNomeQuery, [id_user]);
      const nomeUsuario = usuarioNomeResult.rows[0]?.nome || 'colaborador';

      // Buscar cargo do usuário
      const usuarioQuery = `
        SELECT u.*, c.nome_cargo, c.descricao as descricao_cargo
        FROM usuarios u
        LEFT JOIN cargo c ON c.nome_cargo = u.cargo
        WHERE u.id = $1
      `;
      const usuarioResult = await client.query(usuarioQuery, [id_user]);

      // Buscar cargos disponíveis na empresa
      const cargosQuery = `
        SELECT DISTINCT nome_cargo, descricao
        FROM cargo
        WHERE id_cliente = (SELECT id_cliente FROM usuarios WHERE id = $1)
        ORDER BY nome_cargo
      `;
      const cargosResult = await client.query(cargosQuery, [id_user]);

      // Buscar cargo detalhado com habilidades se existir
      let cargoDetalhado = null;
      if (usuarioResult.rows[0]?.cargo) {
        const cargoDetalhadoQuery = `
          SELECT 
            c.*,
            json_agg(DISTINCT jsonb_build_object(
              'habilidade', hc.habilidade,
              'descricao', hc.descricao
            )) as habilidades
          FROM cargo c
          LEFT JOIN habilidades_cargo hc ON c.id = hc.id_cargo
          WHERE c.nome_cargo = $1
          GROUP BY c.id
          LIMIT 1
        `;
        const cargoDetalhadoResult = await client.query(cargoDetalhadoQuery, [usuarioResult.rows[0].cargo]);
        cargoDetalhado = cargoDetalhadoResult.rows[0] || null;
      }

      const contexto = `
INFORMAÇÕES DO COLABORADOR:
${JSON.stringify(usuarioResult.rows[0] || {}, null, 2)}

CARGO ATUAL (detalhado):
${JSON.stringify(cargoDetalhado || {}, null, 2)}

CARGOS DISPONÍVEIS NA EMPRESA:
${JSON.stringify(cargosResult.rows || [], null, 2)}
      `;

      const messages = [
        {
          role: 'system',
          content: `🎯 Olá, ${nomeUsuario}! Eu sou seu Mentor de Carreira.

Meu nome é Sofia e estou aqui para orientá-lo sobre desenvolvimento profissional, trilhas de carreira e crescimento dentro da empresa.

💼 **MINHA FUNÇÃO:**
Sou uma mentora especializada em desenvolvimento de carreira que tem acesso a todas as informações sobre os cargos disponíveis na empresa, suas exigências e habilidades necessárias.

🌟 **COMO POSSO AJUDÁ-LO:**
- Explicar seu cargo atual e as responsabilidades associadas
- Detalhar as habilidades técnicas e comportamentais necessárias para diferentes cargos
- Orientar sobre trilhas de carreira (técnica, liderança ou híbrida)
- Responder dúvidas sobre crescimento profissional e desenvolvimento
- Sugerir caminhos de desenvolvimento personalizados baseados nos cargos disponíveis na empresa
- Ajudar a identificar gaps e oportunidades de crescimento

💡 **MEU ESTILO:**
- Encorajadora e motivadora
- Prática e objetiva
- Forneço orientações claras e acionáveis
- Uso exemplos concretos dos cargos reais da empresa
- Considero seu contexto atual e seus objetivos de carreira

${contexto}

Estou pronta para ajudá-lo a traçar seu caminho de desenvolvimento! O que você gostaria de saber sobre sua carreira? 🚀`
        }
      ];

      if (Array.isArray(historico)) {
        messages.push(...historico.slice(-10));
      }

      messages.push({
        role: 'user',
        content: mensagem
      });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500
      });

      const resposta = completion.choices[0].message.content;

      logger.info('Chat de colaborador executado', { id_user });

      return ApiResponse.success(res, {
        resposta,
        id_user: parseInt(id_user)
      }, 'Resposta gerada com sucesso');

    } catch (error) {
      logger.error('Erro no chat de colaborador', { error: error.message, stack: error.stack });
      return ApiResponse.error(res, 'Erro ao processar chat', 500, {
        error: 'IA_CHAT_ERROR'
      });
    } finally {
      client.release();
    }
  }

  /**
   * Voz IA para perfil do colaborador
   * POST /api/ia/voz/perfil
   */
  vozPerfilColaborador = async (req, res) => {
    const client = await pool.connect();
    try {
      const { id_user, mensagem, historico } = req.body;

      if (!id_user) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório'
        });
      }

      if (!mensagem || mensagem.trim().length === 0) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_MESSAGE',
          message: 'Mensagem é obrigatória'
        });
      }

      // Gerar resposta de texto primeiro (lógica similar ao chat)
      const perfilQuery = `
        SELECT 
          (SELECT row_to_json(ip) FROM identidade_profissional ip WHERE ip.id_user = $1 LIMIT 1) as identidade_profissional,
          (SELECT COALESCE(json_agg(row_to_json(ht)), '[]'::json) FROM habilidades_tecnicas ht WHERE ht.id_user = $1) as habilidades_tecnicas,
          (SELECT row_to_json(hc) FROM habilidades_comportamentais hc WHERE hc.id_user = $1 LIMIT 1) as habilidades_comportamentais
      `;
      const perfilResult = await client.query(perfilQuery, [id_user]);
      const perfilAtual = perfilResult.rows[0] || {};
      const contexto = this.construirContextoPerfil(perfilAtual);

      const messages = [
        {
          role: 'system',
          content: `Você é um assistente especializado em recursos humanos que ajuda colaboradores a preencherem seu perfil profissional completo. Seja conversacional e empático. ${contexto}`
        }
      ];

      if (Array.isArray(historico)) {
        messages.push(...historico.slice(-10));
      }

      messages.push({ role: 'user', content: mensagem });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      const respostaTexto = completion.choices[0].message.content;

      // Converter para voz usando WebSocket
      const vozResponse = await this.converterTextoParaVoz(respostaTexto);

      return ApiResponse.success(res, {
        audio_url: vozResponse.audio_url || vozResponse.audio_data,
        texto: respostaTexto,
        id_user: parseInt(id_user)
      }, 'Resposta em voz gerada com sucesso');

    } catch (error) {
      logger.error('Erro na voz de perfil', { error: error.message, stack: error.stack });
      return ApiResponse.error(res, 'Erro ao processar voz', 500, {
        error: 'IA_VOICE_ERROR'
      });
    } finally {
      client.release();
    }
  }

  /**
   * Voz IA para gestor
   * POST /api/ia/voz/gestor
   */
  vozGestor = async (req, res) => {
    const client = await pool.connect();
    try {
      const { id_gestor, mensagem, historico } = req.body;

      if (!id_gestor || !mensagem) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_REQUEST',
          message: 'ID do gestor e mensagem são obrigatórios'
        });
      }

      // Gerar resposta (lógica similar ao chatGestor)
      const colaboradoresQuery = `
        SELECT u.id, u.nome, COUNT(DISTINCT m.id) as total_metas
        FROM usuarios u
        LEFT JOIN metas_pdi m ON u.id = m.id_usuario
        WHERE u.id_gestor = $1
        GROUP BY u.id, u.nome
      `;
      const colaboradoresResult = await client.query(colaboradoresQuery, [id_gestor]);

      const messages = [
        {
          role: 'system',
          content: `Você é um assistente para gestores. Analise os dados dos colaboradores e forneça insights.`
        }
      ];

      if (Array.isArray(historico)) {
        messages.push(...historico.slice(-10));
      }

      messages.push({ role: 'user', content: mensagem });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500
      });

      const respostaTexto = completion.choices[0].message.content;
      const vozResponse = await this.converterTextoParaVoz(respostaTexto);

      return ApiResponse.success(res, {
        audio_url: vozResponse.audio_url || vozResponse.audio_data,
        texto: respostaTexto,
        id_gestor: parseInt(id_gestor)
      }, 'Resposta em voz gerada com sucesso');

    } catch (error) {
      logger.error('Erro na voz de gestor', { error: error.message, stack: error.stack });
      return ApiResponse.error(res, 'Erro ao processar voz', 500);
    } finally {
      client.release();
    }
  }

  /**
   * Voz IA para colaborador
   * POST /api/ia/voz/colaborador
   */
  vozColaborador = async (req, res) => {
    const client = await pool.connect();
    try {
      const { id_user, mensagem, historico } = req.body;

      if (!id_user || !mensagem) {
        return ApiResponse.badRequest(res, {
          error: 'INVALID_REQUEST',
          message: 'ID do usuário e mensagem são obrigatórios'
        });
      }

      // Gerar resposta (lógica similar ao chatColaborador)
      const usuarioQuery = `
        SELECT u.*, c.nome_cargo, c.descricao as descricao_cargo
        FROM usuarios u
        LEFT JOIN cargo c ON c.nome_cargo = u.cargo
        WHERE u.id = $1
      `;
      const usuarioResult = await client.query(usuarioQuery, [id_user]);

      const messages = [
        {
          role: 'system',
          content: `Você é um mentor de carreira. Ajuda o colaborador com orientações sobre carreira e desenvolvimento.`
        }
      ];

      if (Array.isArray(historico)) {
        messages.push(...historico.slice(-10));
      }

      messages.push({ role: 'user', content: mensagem });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500
      });

      const respostaTexto = completion.choices[0].message.content;
      const vozResponse = await this.converterTextoParaVoz(respostaTexto);

      return ApiResponse.success(res, {
        audio_url: vozResponse.audio_url || vozResponse.audio_data,
        texto: respostaTexto,
        id_user: parseInt(id_user)
      }, 'Resposta em voz gerada com sucesso');

    } catch (error) {
      logger.error('Erro na voz de colaborador', { error: error.message, stack: error.stack });
      return ApiResponse.error(res, 'Erro ao processar voz', 500);
    } finally {
      client.release();
    }
  }

  /**
   * Métodos auxiliares
   */
  construirContextoPerfil(perfilAtual) {
    const camposVazios = [];
    const camposPreenchidos = [];

    // 1. Identidade Profissional
    const identidade = perfilAtual.identidade_profissional;
    if (!identidade) {
      camposVazios.push('Identidade Profissional (área/time, tempo de empresa, tempo de experiência, formação, certificações)');
    } else {
      const identidadeVazios = [];
      if (!identidade.area_time || identidade.area_time.trim() === '') identidadeVazios.push('área/time');
      if (!identidade.tempo_empresa_meses) identidadeVazios.push('tempo de empresa');
      if (!identidade.tempo_experiencia_total_anos) identidadeVazios.push('tempo de experiência total');
      if (!identidade.formacao_nivel || identidade.formacao_nivel.trim() === '') identidadeVazios.push('formação nível');
      if (!identidade.formacao_area || identidade.formacao_area.trim() === '') identidadeVazios.push('formação área');
      if (!identidade.certificacoes || identidade.certificacoes.trim() === '') identidadeVazios.push('certificações');
      
      if (identidadeVazios.length > 0) {
        camposVazios.push(`Identidade Profissional: ${identidadeVazios.join(', ')}`);
      } else {
        camposPreenchidos.push('Identidade Profissional (completa)');
      }
    }

    // 2. Habilidades Técnicas
    const habTecnicas = perfilAtual.habilidades_tecnicas;
    if (!habTecnicas || !Array.isArray(habTecnicas) || habTecnicas.length === 0) {
      camposVazios.push('Habilidades Técnicas (pelo menos uma habilidade com nome, nível autoavaliado, nível exigido, experiência prática, evidências)');
    } else {
      camposPreenchidos.push(`Habilidades Técnicas (${habTecnicas.length} cadastrada(s))`);
    }

    // 3. Habilidades Comportamentais
    const habComportamentais = perfilAtual.habilidades_comportamentais;
    if (!habComportamentais) {
      camposVazios.push('Habilidades Comportamentais (comunicação, trabalho em equipe, organização, autonomia, liderança, resiliência, aprendizado contínuo - escala de 1 a 5)');
    } else {
      const habCompVazios = [];
      if (habComportamentais.comunicacao === null || habComportamentais.comunicacao === undefined || habComportamentais.comunicacao < 1 || habComportamentais.comunicacao > 5) habCompVazios.push('comunicação');
      if (habComportamentais.trabalho_equipe === null || habComportamentais.trabalho_equipe === undefined || habComportamentais.trabalho_equipe < 1 || habComportamentais.trabalho_equipe > 5) habCompVazios.push('trabalho em equipe');
      if (habComportamentais.organizacao === null || habComportamentais.organizacao === undefined || habComportamentais.organizacao < 1 || habComportamentais.organizacao > 5) habCompVazios.push('organização');
      if (habComportamentais.autonomia === null || habComportamentais.autonomia === undefined || habComportamentais.autonomia < 1 || habComportamentais.autonomia > 5) habCompVazios.push('autonomia');
      if (habComportamentais.lideranca === null || habComportamentais.lideranca === undefined || habComportamentais.lideranca < 1 || habComportamentais.lideranca > 5) habCompVazios.push('liderança');
      if (habComportamentais.resiliencia === null || habComportamentais.resiliencia === undefined || habComportamentais.resiliencia < 1 || habComportamentais.resiliencia > 5) habCompVazios.push('resiliência');
      if (habComportamentais.aprendizado_continuo === null || habComportamentais.aprendizado_continuo === undefined || habComportamentais.aprendizado_continuo < 1 || habComportamentais.aprendizado_continuo > 5) habCompVazios.push('aprendizado contínuo');
      
      if (habCompVazios.length > 0) {
        camposVazios.push(`Habilidades Comportamentais: ${habCompVazios.join(', ')}`);
      } else {
        camposPreenchidos.push('Habilidades Comportamentais (completa)');
      }
    }

    // 4. Interesses e Motivadores
    const interesses = perfilAtual.interesses_motivadores;
    if (!interesses) {
      camposVazios.push('Interesses e Motivadores (o que gosta no trabalho, o que não gosta, preferência de desafio, preferência de crescimento, fator de retenção)');
    } else {
      const interessesVazios = [];
      if (!interesses.gosta_trabalho || interesses.gosta_trabalho.trim() === '') interessesVazios.push('o que gosta no trabalho');
      if (!interesses.nao_gosta_trabalho || interesses.nao_gosta_trabalho.trim() === '') interessesVazios.push('o que não gosta no trabalho');
      if (!interesses.preferencia_desafio || interesses.preferencia_desafio.trim() === '') interessesVazios.push('preferência de desafio');
      if (!interesses.preferencia_crescimento || interesses.preferencia_crescimento.trim() === '') interessesVazios.push('preferência de crescimento');
      if (!interesses.fator_retencao || interesses.fator_retencao.trim() === '') interessesVazios.push('fator de retenção');
      
      if (interessesVazios.length > 0) {
        camposVazios.push(`Interesses e Motivadores: ${interessesVazios.join(', ')}`);
      } else {
        camposPreenchidos.push('Interesses e Motivadores (completo)');
      }
    }

    // 5. Propósito e Valores
    const proposito = perfilAtual.proposito_valores;
    if (!proposito) {
      camposVazios.push('Propósito e Valores (orgulho do trabalho, impacto desejado, o que não aceita no ambiente, definição de sucesso)');
    } else {
      const propositoVazios = [];
      if (!proposito.orgulho_trabalho || proposito.orgulho_trabalho.trim() === '') propositoVazios.push('orgulho do trabalho');
      if (!proposito.impacto_desejado || proposito.impacto_desejado.trim() === '') propositoVazios.push('impacto desejado');
      if (!proposito.nao_aceita_ambiente || proposito.nao_aceita_ambiente.trim() === '') propositoVazios.push('o que não aceita no ambiente');
      if (!proposito.definicao_sucesso || proposito.definicao_sucesso.trim() === '') propositoVazios.push('definição de sucesso');
      
      if (propositoVazios.length > 0) {
        camposVazios.push(`Propósito e Valores: ${propositoVazios.join(', ')}`);
      } else {
        camposPreenchidos.push('Propósito e Valores (completo)');
      }
    }

    // 6. Objetivos de Carreira
    const objetivos = perfilAtual.objetivos_carreira;
    if (!objetivos) {
      camposVazios.push('Objetivos de Carreira (objetivo 1 ano, objetivo 3 anos, objetivo 5 anos, trilha de carreira: liderança/especialista/híbrido)');
    } else {
      const objetivosVazios = [];
      if (!objetivos.objetivo_1_ano || objetivos.objetivo_1_ano.trim() === '') objetivosVazios.push('objetivo 1 ano');
      if (!objetivos.objetivo_3_anos || objetivos.objetivo_3_anos.trim() === '') objetivosVazios.push('objetivo 3 anos');
      if (!objetivos.objetivo_5_anos || objetivos.objetivo_5_anos.trim() === '') objetivosVazios.push('objetivo 5 anos');
      if (!objetivos.trilha_carreira || objetivos.trilha_carreira.trim() === '') objetivosVazios.push('trilha de carreira');
      
      if (objetivosVazios.length > 0) {
        camposVazios.push(`Objetivos de Carreira: ${objetivosVazios.join(', ')}`);
      } else {
        camposPreenchidos.push('Objetivos de Carreira (completo)');
      }
    }

    // 7. Disponibilidade
    const disponibilidade = perfilAtual.disponibilidade;
    if (!disponibilidade) {
      camposVazios.push('Disponibilidade (horas semanais de desenvolvimento, preferência de aprendizado: cursos/prática/mentoria, aberto a mudanças, aceita desafios)');
    } else {
      const disponibilidadeVazios = [];
      if (!disponibilidade.horas_semanais_desenvolvimento) disponibilidadeVazios.push('horas semanais de desenvolvimento');
      if (!disponibilidade.preferencia_aprendizado || disponibilidade.preferencia_aprendizado.trim() === '') disponibilidadeVazios.push('preferência de aprendizado');
      if (disponibilidade.aberto_mudanca === null || disponibilidade.aberto_mudanca === undefined) disponibilidadeVazios.push('aberto a mudanças');
      if (disponibilidade.aceita_desafios === null || disponibilidade.aceita_desafios === undefined) disponibilidadeVazios.push('aceita desafios');
      
      if (disponibilidadeVazios.length > 0) {
        camposVazios.push(`Disponibilidade: ${disponibilidadeVazios.join(', ')}`);
      } else {
        camposPreenchidos.push('Disponibilidade (completa)');
      }
    }

    // 8. Histórico Inicial
    const historico = perfilAtual.historico_inicial;
    if (!historico) {
      camposVazios.push('Histórico Inicial (cursos realizados, eventos/palestras, projetos relevantes, feedbacks recebidos)');
    } else {
      const historicoVazios = [];
      if (!historico.cursos_realizados || historico.cursos_realizados.trim() === '') historicoVazios.push('cursos realizados');
      if (!historico.eventos_palestras || historico.eventos_palestras.trim() === '') historicoVazios.push('eventos/palestras');
      if (!historico.projetos_relevantes || historico.projetos_relevantes.trim() === '') historicoVazios.push('projetos relevantes');
      if (!historico.feedbacks_recebidos || historico.feedbacks_recebidos.trim() === '') historicoVazios.push('feedbacks recebidos');
      
      if (historicoVazios.length > 0) {
        camposVazios.push(`Histórico Inicial: ${historicoVazios.join(', ')}`);
      } else {
        camposPreenchidos.push('Histórico Inicial (completo)');
      }
    }

    // Construir contexto
    let contexto = '';
    
    if (camposPreenchidos.length > 0) {
      contexto += 'INFORMAÇÕES JÁ PREENCHIDAS (NÃO PRECISA AUXILIAR NESTAS):\n';
      camposPreenchidos.forEach(campo => {
        contexto += `- ${campo}\n`;
      });
      contexto += '\n';
    }

    if (camposVazios.length > 0) {
      contexto += 'CAMPOS QUE PRECISAM SER PREENCHIDOS (FOQUE APENAS NESTES):\n';
      camposVazios.forEach(campo => {
        contexto += `- ${campo}\n`;
      });
      contexto += '\n';
      contexto += 'IMPORTANTE: Auxilie o colaborador APENAS nos campos listados acima. Não faça perguntas ou mencione os campos já preenchidos. Seja conversacional, empático e faça uma pergunta por vez.';
    } else {
      contexto += 'TODOS OS CAMPOS JÁ FORAM PREENCHIDOS. Parabenize o colaborador e informe que o perfil está completo.';
    }

    return contexto;
  }

  /**
   * Construir contexto completo para o gestor com informações de todos os colaboradores
   */
  async construirContextoGestor(client, id_gestor) {
    try {
      // 1. Buscar lista de colaboradores do gestor
      const colaboradoresQuery = `
        SELECT 
          u.id,
          u.nome,
          u.email,
          u.cargo as id_cargo
        FROM usuarios u
        WHERE u.id_gestor = $1
        ORDER BY u.nome
      `;
      const colaboradoresResult = await client.query(colaboradoresQuery, [id_gestor]);
      const colaboradoresIds = colaboradoresResult.rows.map(c => c.id);

      if (colaboradoresIds.length === 0) {
        return 'Nenhum colaborador encontrado para este gestor.';
      }

      const colaboradoresData = [];

      // 2. Para cada colaborador, buscar todas as informações
      for (const colaborador of colaboradoresResult.rows) {
        const id_colaborador = colaborador.id;
        const colaboradorInfo = {
          id: colaborador.id,
          nome: colaborador.nome,
          email: colaborador.email,
          cargo_id: colaborador.id_cargo
        };

        // 2.1. Metas do colaborador
        const metasQuery = `
          SELECT 
            m.id,
            m.titulo,
            m.status,
            m.prazo,
            m.resultado_3_meses,
            m.resultado_6_meses,
            m.feedback_gestor,
            m.created_at,
            COALESCE(
              json_agg(
                DISTINCT jsonb_build_object(
                  'id', a.id,
                  'titulo', a.titulo_atividade,
                  'status', a.status_atividade
                )
              ) FILTER (WHERE a.id IS NOT NULL),
              '[]'::json
            ) as atividades
          FROM metas_pdi m
          LEFT JOIN atividades_pdi a ON m.id = a.id_meta_pdi
          WHERE m.id_usuario = $1
          GROUP BY m.id, m.titulo, m.status, m.prazo, 
                   m.resultado_3_meses, m.resultado_6_meses, m.feedback_gestor, m.created_at
          ORDER BY m.created_at DESC
          LIMIT 10
        `;
        const metasResult = await client.query(metasQuery, [id_colaborador]);
        colaboradorInfo.metas = metasResult.rows || [];

        // 2.2. Árvore da vida (última)
        const arvoreQuery = `
          SELECT 
            id, created_at, pontuacao_geral,
            criatividade_hobbie, plenitude_felicidade, espiritualidade,
            saude_disposicao, desenvolvimento_intelectual, equilibrio_emocional,
            familia, desenvolvimento_amoroso, vida_social,
            realizacao_proposito, recursos_financeiros, contribuicao_social
          FROM arvore_da_vida
          WHERE id_usuario = $1
          ORDER BY created_at DESC
          LIMIT 1
        `;
        const arvoreResult = await client.query(arvoreQuery, [id_colaborador]);
        colaboradorInfo.arvore_da_vida = arvoreResult.rows[0] || null;

        // 2.3. Perfil completo
        const perfilQuery = `
          SELECT 
            (SELECT row_to_json(ip) FROM identidade_profissional ip WHERE ip.id_user = $1 LIMIT 1) as identidade_profissional,
            (SELECT COALESCE(json_agg(row_to_json(ht)), '[]'::json) FROM habilidades_tecnicas ht WHERE ht.id_user = $1) as habilidades_tecnicas,
            (SELECT row_to_json(hc) FROM habilidades_comportamentais hc WHERE hc.id_user = $1 LIMIT 1) as habilidades_comportamentais,
            (SELECT row_to_json(im) FROM interesses_motivadores im WHERE im.id_user = $1 LIMIT 1) as interesses_motivadores,
            (SELECT row_to_json(pv) FROM proposito_valores pv WHERE pv.id_user = $1 LIMIT 1) as proposito_valores,
            (SELECT row_to_json(oc) FROM objetivos_carreira oc WHERE oc.id_user = $1 LIMIT 1) as objetivos_carreira,
            (SELECT row_to_json(d) FROM disponibilidade d WHERE d.id_user = $1 LIMIT 1) as disponibilidade,
            (SELECT row_to_json(hi) FROM historico_inicial hi WHERE hi.id_user = $1 LIMIT 1) as historico_inicial
        `;
        const perfilResult = await client.query(perfilQuery, [id_colaborador]);
        colaboradorInfo.perfil = perfilResult.rows[0] || {};

        // 2.4. Análise SWOT
        const swotQuery = `
          SELECT 
            cs.id as id_categoria_swot,
            cs.categoria,
            COALESCE(
              json_agg(
                DISTINCT jsonb_build_object(
                  'id', ts.id,
                  'texto', ts.texto
                )
              ) FILTER (WHERE ts.id IS NOT NULL),
              '[]'::json
            ) as textos
          FROM analise_swot asw
          JOIN categoria_swot cs ON asw.categoria_swot = cs.id
          JOIN textos_swot ts ON asw.id_texto_swot = ts.id
          WHERE asw.id_usuario = $1
          GROUP BY cs.id, cs.categoria
          ORDER BY cs.id
        `;
        const swotResult = await client.query(swotQuery, [id_colaborador]);
        colaboradorInfo.analise_swot = swotResult.rows || [];

        // 2.5. Cargo com detalhes (senioridade, setor, habilidades)
        if (colaborador.id_cargo) {
          const cargoQuery = `
            SELECT
              c.id,
              c.nome_cargo,
              c.descricao,
              CASE
                WHEN se.id IS NULL THEN NULL
                ELSE json_build_object('id', se.id, 'senioridade', se.senioridade)
              END AS senioridade,
              CASE
                WHEN st.id IS NULL THEN NULL
                ELSE json_build_object('id', st.id, 'nome_setor', st.nome_setor)
              END AS setor,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'id', hc.id,
                    'habilidade', hc.habilidade,
                    'descricao', hc.descricao
                  )
                ) FILTER (WHERE hc.id IS NOT NULL),
                '[]'::json
              ) AS habilidades
            FROM cargo c
            LEFT JOIN senioridade se ON se.id = c.senioridade_id
            LEFT JOIN setor st ON st.id = c.setor_id
            LEFT JOIN habilidades_cargo hc ON hc.id_cargo = c.id
            WHERE c.id = $1
            GROUP BY c.id, se.id, st.id
          `;
          const cargoResult = await client.query(cargoQuery, [colaborador.id_cargo]);
          colaboradorInfo.cargo = cargoResult.rows[0] || null;
        } else {
          colaboradorInfo.cargo = null;
        }

        // 2.6. Portfólio (experiências)
        const portfolioQuery = `
          SELECT 
            ep.id,
            ep.titulo_experiencia,
            ep.data_experiencia,
            ep.acao_realizada,
            ep.resultado_entregue,
            ep.created_at,
            COALESCE(
              json_agg(
                DISTINCT jsonb_build_object(
                  'id', mp.id,
                  'material', mp.material
                )
              ) FILTER (WHERE mp.id IS NOT NULL),
              '[]'::json
            ) as materiais,
            COALESCE(
              json_agg(
                DISTINCT jsonb_build_object(
                  'id', lp.id,
                  'link_evidencia', lp.link_evidencia
                )
              ) FILTER (WHERE lp.id IS NOT NULL),
              '[]'::json
            ) as links,
            COALESCE(
              json_agg(
                DISTINCT jsonb_build_object(
                  'id', fp.id,
                  'feedback', fp.feedback,
                  'autor', fp.autor
                )
              ) FILTER (WHERE fp.id IS NOT NULL),
              '[]'::json
            ) as feedbacks
          FROM experiencia_portifolio ep
          LEFT JOIN materiais_portifolio mp ON ep.id = mp.id_experiencia_portifolio
          LEFT JOIN links_portifolio lp ON ep.id = lp.id_experiencia_portifolio
          LEFT JOIN feedbacks_portifolio fp ON ep.id = fp.id_experiencia_portifolio
          WHERE ep.id_usuario = $1
          GROUP BY ep.id, ep.titulo_experiencia, ep.data_experiencia, 
                   ep.acao_realizada, ep.resultado_entregue, ep.created_at
          ORDER BY ep.data_experiencia DESC, ep.created_at DESC
          LIMIT 10
        `;
        const portfolioResult = await client.query(portfolioQuery, [id_colaborador]);
        colaboradorInfo.portfolio = portfolioResult.rows || [];

        // 2.7. Checkin emocional (última nota de bem-estar)
        const checkinEmocionalQuery = `
          SELECT 
            id,
            data_checkin,
            score,
            motivo,
            categoria_motivo,
            created_at
          FROM checkin_emocional
          WHERE id_user = $1
          ORDER BY data_checkin DESC, created_at DESC
          LIMIT 1
        `;
        const checkinEmocionalResult = await client.query(checkinEmocionalQuery, [id_colaborador]);
        colaboradorInfo.checkin_emocional = checkinEmocionalResult.rows[0] || null;

        // 2.8. Reconhecimentos recebidos
        const reconhecimentosRecebidosQuery = `
          SELECT 
            r.id,
            r.created_at,
            r.motivo_reconhecimento,
            tr.reconhecimento as tipo_reconhecimento,
            tr.icone_reconhecimento,
            u_reconheceu.nome as reconheceu_por
          FROM reconhecimento r
          LEFT JOIN tipo_reconhecimento tr ON r.id_tipo_reconhecimento = tr.id
          LEFT JOIN usuarios u_reconheceu ON r.id_usuario_reconheceu = u_reconheceu.id
          WHERE r.id_usuario_reconhecido = $1
          ORDER BY r.created_at DESC
          LIMIT 10
        `;
        const reconhecimentosRecebidosResult = await client.query(reconhecimentosRecebidosQuery, [id_colaborador]);
        colaboradorInfo.reconhecimentos_recebidos = reconhecimentosRecebidosResult.rows || [];

        // 2.10. Reconhecimentos dados
        const reconhecimentosDadosQuery = `
          SELECT 
            r.id,
            r.created_at,
            r.motivo_reconhecimento,
            tr.reconhecimento as tipo_reconhecimento,
            tr.icone_reconhecimento,
            u_reconhecido.nome as reconheceu_para
          FROM reconhecimento r
          LEFT JOIN tipo_reconhecimento tr ON r.id_tipo_reconhecimento = tr.id
          LEFT JOIN usuarios u_reconhecido ON r.id_usuario_reconhecido = u_reconhecido.id
          WHERE r.id_usuario_reconheceu = $1
          ORDER BY r.created_at DESC
          LIMIT 10
        `;
        const reconhecimentosDadosResult = await client.query(reconhecimentosDadosQuery, [id_colaborador]);
        colaboradorInfo.reconhecimentos_dados = reconhecimentosDadosResult.rows || [];

        colaboradoresData.push(colaboradorInfo);
      }

      // Construir contexto formatado
      let contexto = `INFORMAÇÕES COMPLETAS DA EQUIPE DO GESTOR:\n\n`;
      contexto += `Total de colaboradores: ${colaboradoresData.length}\n\n`;
      contexto += JSON.stringify(colaboradoresData, null, 2);

      return contexto;
    } catch (error) {
      logger.error('Erro ao construir contexto do gestor', {
        error: error.message,
        stack: error.stack,
        id_gestor
      });
      throw error;
    }
  }

  /**
   * Obter URL assinada para WebSocket (se necessário para agentes privados)
   */
  async obterSignedUrl(apiKey, agentId) {
    try {
      const response = await axios.get(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
        {
          headers: {
            'xi-api-key': apiKey
          }
        }
      );
      
      return response.data?.signed_url || null;
    } catch (error) {
      logger.warn('Erro ao obter signed URL, usando URL pública', {
        error: error.message,
        status: error.response?.status
      });
      return null;
    }
  }

  /**
   * Handler WebSocket para voz - Perfil do Colaborador
   * Faz bridge entre frontend e ElevenLabs com contexto do perfil
   */
  async handleWebSocketVozPerfil(clientWs, id_user) {
    try {
      const client = await pool.connect();
      
      try {
        // Buscar nome do usuário
        const usuarioQuery = `SELECT nome FROM usuarios WHERE id = $1`;
        const usuarioResult = await client.query(usuarioQuery, [id_user]);
        const nomeUsuario = usuarioResult.rows[0]?.nome || 'colaborador';

        // Buscar perfil e construir contexto
        const perfilQuery = `
          SELECT 
            (SELECT row_to_json(ip) FROM identidade_profissional ip WHERE ip.id_user = $1 LIMIT 1) as identidade_profissional,
            (SELECT COALESCE(json_agg(row_to_json(ht)), '[]'::json) FROM habilidades_tecnicas ht WHERE ht.id_user = $1) as habilidades_tecnicas,
            (SELECT row_to_json(hc) FROM habilidades_comportamentais hc WHERE hc.id_user = $1 LIMIT 1) as habilidades_comportamentais,
            (SELECT row_to_json(im) FROM interesses_motivadores im WHERE im.id_user = $1 LIMIT 1) as interesses_motivadores,
            (SELECT row_to_json(pv) FROM proposito_valores pv WHERE pv.id_user = $1 LIMIT 1) as proposito_valores,
            (SELECT row_to_json(oc) FROM objetivos_carreira oc WHERE oc.id_user = $1 LIMIT 1) as objetivos_carreira,
            (SELECT row_to_json(d) FROM disponibilidade d WHERE d.id_user = $1 LIMIT 1) as disponibilidade,
            (SELECT row_to_json(hi) FROM historico_inicial hi WHERE hi.id_user = $1 LIMIT 1) as historico_inicial
        `;
        const perfilResult = await client.query(perfilQuery, [id_user]);
        const perfilAtual = perfilResult.rows[0] || {};
        
        // Construir contexto apenas com campos vazios que precisam ser preenchidos
        const contextoPerfil = this.construirContextoPerfil(perfilAtual);

        // Criar prompt personalizado para o agente de voz
        const contextText = `👋 Olá! Eu sou seu Assistente de Perfil Profissional.

Meu nome é Alex e estou aqui para ajudá-lo, ${nomeUsuario}, a construir seu perfil profissional completo de forma descontraída e objetiva.

🎯 **MINHA MISSÃO:**
Auxiliá-lo a preencher todas as informações do seu perfil profissional através de uma conversa natural. Vou fazer perguntas progressivas e inteligentes para conhecer melhor você e suas experiências.

📋 **O QUE VAMOS PREENCHER JUNTOS:**
- **Identidade Profissional**: área de atuação, tempo na empresa, formação, certificações
- **Habilidades Técnicas**: tecnologias, ferramentas e competências que você domina
- **Habilidades Comportamentais**: comunicação, trabalho em equipe, organização, autonomia, liderança, resiliência e aprendizado contínuo
- **Interesses e Motivadores**: o que você gosta no trabalho, o que não gosta, suas preferências e fatores de retenção
- **Propósito e Valores**: seus valores profissionais e o que te move
- **Objetivos de Carreira**: onde você quer estar em 1, 3 e 5 anos
- **Disponibilidade**: tempo e preferências para desenvolvimento
- **Histórico**: cursos, eventos, projetos relevantes e feedbacks recebidos

💬 **MEU ESTILO:**
- Converso de forma amigável e empática
- Faço uma pergunta por vez para não sobrecarregar
- Respeito seu ritmo e suas respostas
- Após cada seção, posso resumir o que coletamos para confirmar

${contextoPerfil}

Vamos começar? Quando estiver pronto, me diga em qual área gostaria de começar ou se prefere que eu sugira por onde iniciarmos! 🚀`;

        // Verificar configuração ElevenLabs
        if (!this.elevenLabsApiKey || !this.elevenLabsAgentId) {
          clientWs.send(JSON.stringify({
            type: 'error',
            message: 'Configuração da Eleven Labs incompleta'
          }));
          clientWs.close();
          return;
        }

        // Criar bridge com ElevenLabs
        const wsManager = new ElevenLabsWebSocketManager(
          this.elevenLabsApiKey,
          this.elevenLabsAgentId
        );

        wsManager.bridgeConnection(clientWs, {
          text: contextText
        });

      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Erro no WebSocket voz perfil', {
        error: error.message,
        stack: error.stack,
        id_user
      });
      
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'error',
          message: 'Erro ao processar conexão',
          error: error.message
        }));
        clientWs.close();
      }
    }
  }

  /**
   * Handler WebSocket para voz - Gestor
   */
  async handleWebSocketVozGestor(clientWs, id_gestor) {
    try {
      // Verificar configuração ElevenLabs
      if (!this.elevenLabsApiKey || !this.elevenLabsAgentId) {
        clientWs.send(JSON.stringify({
          type: 'error',
          message: 'Configuração da Eleven Labs incompleta'
        }));
        clientWs.close();
        return;
      }

      // Criar contexto completo para gestor
      const client = await pool.connect();
      try {
        // Buscar nome do gestor
        const gestorQuery = `SELECT nome FROM usuarios WHERE id = $1`;
        const gestorResult = await client.query(gestorQuery, [id_gestor]);
        const nomeGestor = gestorResult.rows[0]?.nome || 'gestor';

        const contexto = await this.construirContextoGestor(client, id_gestor);

        const systemPrompt = `👔 Olá, ${nomeGestor}! Eu sou Max, seu Consultor Estratégico em Gestão de Pessoas e Desenvolvimento de Liderados.

🎯 **MINHA FUNÇÃO ESPECÍFICA:**
Sou seu assistente especializado em ajudá-lo a entender o desenvolvimento individual dos seus LIDERADOS e fornecer orientações práticas sobre como você, como gestor, pode conduzir e apoiar a carreira de cada membro da sua equipe. Também auxilio no bem-estar emocional dos colaboradores, dando direcionamentos tanto aos gestores quanto aos colaboradores visando sempre melhorar o bem-estar, desde que isso não prejudique outras pessoas nem eles mesmos.

📋 **MEU FOCO É:**
- Analisar o desenvolvimento profissional de CADA UM DOS SEUS LIDERADOS
- Identificar como você pode ajudar cada colaborador a crescer na carreira
- Sugerir estratégias específicas para você conduzir o desenvolvimento de cada pessoa da equipe
- Alertar sobre colaboradores que precisam de mais atenção ou suporte
- Recomendar ações práticas que VOCÊ, como gestor, pode tomar para apoiar cada liderado
- Monitorar o bem-estar emocional da equipe e oferecer direcionamentos de suporte
- Ajudar na melhoria contínua do bem-estar dos colaboradores de forma equilibrada

📊 **O QUE EU ANALISO DOS SEUS LIDERADOS:**
- Progresso e status das metas e PDIs de cada colaborador
- Perfis profissionais completos (habilidades, objetivos de carreira, interesses)
- Avaliações de bem-estar e satisfação (árvore da vida)
- Check-ins emocionais e notas de bem-estar dos colaboradores
- Análises SWOT individuais (forças, fraquezas, oportunidades, ameaças)
- Cargos atuais, senioridades e habilidades esperadas
- Portfólios, realizações e projetos relevantes
- Reconhecimentos recebidos e dados aos colegas

💡 **COMO POSSO AJUDÁ-LO COMO GESTOR:**
- Mostrar quem da sua equipe precisa de mais atenção no desenvolvimento
- Sugerir como você pode apoiar cada liderado em seu crescimento profissional
- Identificar gaps de desenvolvimento e como você pode ajudar a preenchê-los
- Recomendar conversas, feedbacks e ações específicas para cada colaborador
- Analisar tendências na equipe e oportunidades de desenvolvimento coletivo
- Alertar sobre riscos de retenção e estratégias para engajar cada liderado
- Orientar sobre como conduzir 1:1s e momentos de desenvolvimento
- Monitorar o bem-estar emocional e sugerir ações para melhorar a saúde mental
- Identificar colaboradores com sinais de estresse ou desconforto emocional
- Orientar sobre como apoiar o bem-estar de forma ética e equilibrada

💬 **MEU ESTILO DE COMUNICAÇÃO:**
- Direto, objetivo e estratégico
- Foco em ações práticas que VOCÊ pode tomar como gestor
- Baseado em dados concretos da sua equipe
- Empático, mas sempre com foco em resultados e desenvolvimento

🔒 **LIMITAÇÕES IMPORTANTES:**
- Trabalho APENAS com informações dos seus liderados (não do seu próprio perfil)
- Não invento ou assumo dados que não estão disponíveis
- Não respondo sobre assuntos externos (política, esportes, notícias, entretenimento, etc.)
- Se não possuo uma informação específica sobre algum colaborador, informo claramente
- Orientações sobre bem-estar SEMPRE priorizam o equilíbrio e a segurança de todos

⚡ **SUA APRESENTAÇÃO INICIAL (PRIMEIRA MENSAGEM):**
Quando a conversa iniciar, se apresente assim:
"Olá, ${nomeGestor}! Sou Max, seu consultor em gestão de pessoas. Estou aqui para ajudar você a entender o desenvolvimento dos seus liderados e orientá-lo sobre como pode apoiar a carreira de cada um deles. Também acompanho o bem-estar emocional da sua equipe e posso sugerir ações para apoiá-los de forma equilibrada. Tenho informações completas sobre sua equipe, incluindo perfis, metas, PDIs, análises, realizações e bem-estar emocional. Sobre qual colaborador ou aspecto da equipe você gostaria de saber mais? Posso começar mostrando um resumo geral ou focar em alguém específico."

${contexto}`;

        const wsManager = new ElevenLabsWebSocketManager(
          this.elevenLabsApiKey,
          this.elevenLabsAgentId
        );

        wsManager.bridgeConnection(clientWs, {
          text: systemPrompt
        });
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Erro no WebSocket voz gestor', {
        error: error.message,
        stack: error.stack,
        id_gestor
      });
      
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'error',
          message: 'Erro ao processar conexão',
          error: error.message
        }));
        clientWs.close();
      }
    }
  }

  /**
   * Handler WebSocket para voz - Colaborador
   */
  async handleWebSocketVozColaborador(clientWs, id_user) {
    try {
      // Verificar configuração ElevenLabs
      if (!this.elevenLabsApiKey || !this.elevenLabsAgentId) {
        clientWs.send(JSON.stringify({
          type: 'error',
          message: 'Configuração da Eleven Labs incompleta'
        }));
        clientWs.close();
        return;
      }

      // Buscar cargo e habilidades relacionadas
      const client = await pool.connect();
      try {
        // Buscar nome do usuário
        const usuarioNomeQuery = `SELECT nome FROM usuarios WHERE id = $1`;
        const usuarioNomeResult = await client.query(usuarioNomeQuery, [id_user]);
        const nomeUsuario = usuarioNomeResult.rows[0]?.nome || 'colaborador';

        const cargoQuery = `
          SELECT 
            c.id,
            c.nome_cargo,
            c.descricao,
            se.senioridade,
            st.nome_setor,
            COALESCE(
              json_agg(
                jsonb_build_object(
                  'habilidade', hc.habilidade,
                  'descricao', hc.descricao
                )
              ) FILTER (WHERE hc.id IS NOT NULL),
              '[]'::json
            ) as habilidades
          FROM usuarios u
          LEFT JOIN cargo c ON c.nome_cargo = u.cargo
          LEFT JOIN senioridade se ON se.id = c.senioridade_id
          LEFT JOIN setor st ON st.id = c.setor_id
          LEFT JOIN habilidades_cargo hc ON hc.id_cargo = c.id
          WHERE u.id = $1
          GROUP BY c.id, se.senioridade, st.nome_setor
        `;
        const cargoResult = await client.query(cargoQuery, [id_user]);
        const cargo = cargoResult.rows[0] || {};

        // Contexto apenas com dados dos cargos
        const cargoContext = `INFORMAÇÕES SOBRE CARGOS E HABILIDADES DISPONÍVEIS NA EMPRESA:\n\n${JSON.stringify(cargo, null, 2)}`;

        // Criar prompt personalizado para o agente de voz
        const contextText = `🎯 Olá, ${nomeUsuario}! Eu sou sua Mentora de Carreira.

Meu nome é Sofia e estou aqui para orientá-lo sobre desenvolvimento profissional, trilhas de carreira e crescimento dentro da empresa.

💼 **MINHA FUNÇÃO:**
Sou uma mentora especializada em desenvolvimento de carreira que tem acesso a todas as informações sobre os cargos disponíveis na empresa, suas exigências e habilidades necessárias.

🌟 **COMO POSSO AJUDÁ-LO:**
- Explicar seu cargo atual e as responsabilidades associadas
- Detalhar as habilidades técnicas e comportamentais necessárias para diferentes cargos
- Orientar sobre trilhas de carreira (técnica, liderança ou híbrida)
- Responder dúvidas sobre crescimento profissional e desenvolvimento
- Sugerir caminhos de desenvolvimento personalizados baseados nos cargos disponíveis na empresa
- Ajudar a identificar gaps e oportunidades de crescimento

💡 **MEU ESTILO:**
- Encorajadora e motivadora
- Prática e objetiva
- Forneço orientações claras e acionáveis
- Uso exemplos concretos dos cargos reais da empresa
- Considero seu contexto atual e seus objetivos de carreira

${cargoContext}

Estou pronta para ajudá-lo a traçar seu caminho de desenvolvimento! O que você gostaria de saber sobre sua carreira? 🚀`;

        const wsManager = new ElevenLabsWebSocketManager(
          this.elevenLabsApiKey,
          this.elevenLabsAgentId
        );

        wsManager.bridgeConnection(clientWs, {
          text: contextText
        });
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Erro no WebSocket voz colaborador', {
        error: error.message,
        stack: error.stack,
        id_user
      });
      
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'error',
          message: 'Erro ao processar conexão',
          error: error.message
        }));
        clientWs.close();
      }
    }
  }

  /**
   * Converter texto para voz usando WebSocket da Eleven Labs Conversational AI
   * MÉTODO LEGADO - mantido para compatibilidade com endpoints HTTP antigos
   * @deprecated Use WebSocket endpoints ao invés disso
   */
  async converterTextoParaVoz(texto) {
    return new Promise(async (resolve, reject) => {
      try {
        // Garantir que dotenv está carregado
        if (!process.env.ELEVEN_LABS_API_KEY) {
          require('dotenv').config();
        }

        // Ler a API key novamente do ambiente para garantir que está atualizada
        const apiKey = (process.env.ELEVEN_LABS_API_KEY || '').trim();
        const agentId = this.elevenLabsAgentId;

        if (!apiKey || !agentId) {
          logger.warn('Configuração da Eleven Labs incompleta');
          return resolve({
            audio_url: null,
            texto: texto,
            mensagem: 'Configuração da Eleven Labs incompleta. Verifique se ELEVEN_LABS_API_KEY está definida no arquivo .env'
          });
        }

        logger.info('Convertendo texto para voz via WebSocket Eleven Labs', {
          texto_length: texto.length,
          agent_id: agentId
        });

        // Tentar obter signed URL para agentes privados
        let wsUrl = await this.obterSignedUrl(apiKey, agentId);
        
        // Se não conseguiu signed URL, usar URL pública
        if (!wsUrl) {
          wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`;
        }

        logger.info('Conectando ao WebSocket', { url: wsUrl.replace(/\?token=.*/, '?token=***') });

        // Conectar ao WebSocket
        const ws = new WebSocket(wsUrl);

        const audioChunks = [];
        let agentResponse = '';
        let isComplete = false;
        let hasError = false;
        let lastAudioTime = null;
        let audioTimeout = null;

        // Timeout geral para evitar conexões infinitas
        const timeout = setTimeout(() => {
          if (!isComplete) {
            hasError = true;
            ws.close();
            reject(new Error('Timeout ao aguardar resposta do WebSocket (30s)'));
          }
        }, 30000); // 30 segundos

        ws.on('open', () => {
          logger.info('WebSocket conectado');
          
          // Enviar inicialização da conversa
          ws.send(JSON.stringify({
            type: 'conversation_initiation_client_data'
          }));

          // Aguardar um pouco para a conexão estabilizar
          setTimeout(() => {
            // Enviar texto como user_transcript para simular que o usuário falou
            // Isso deve fazer o agente processar e responder com áudio
            ws.send(JSON.stringify({
              type: 'user_transcript',
              user_transcription_event: {
                user_transcript: texto
              }
            }));
            
            logger.info('Texto enviado para o agente', { texto: texto.substring(0, 100) + '...' });
          }, 1000);
        });

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            
            // Lidar com ping
            if (message.type === 'ping') {
              ws.send(JSON.stringify({
                type: 'pong',
                event_id: message.ping_event?.event_id
              }));
              return;
            }

            // Capturar transcrição do agente
            if (message.type === 'agent_response') {
              agentResponse = message.agent_response_event?.agent_response || '';
              logger.info('Resposta do agente recebida', { resposta: agentResponse });
            }

            // Capturar chunks de áudio
            if (message.type === 'audio') {
              const audioBase64 = message.audio_event?.audio_base_64;
              if (audioBase64) {
                audioChunks.push(audioBase64);
                lastAudioTime = Date.now();
                
                logger.debug('Chunk de áudio recebido', { 
                  event_id: message.audio_event?.event_id,
                  chunk_size: audioBase64.length,
                  total_chunks: audioChunks.length
                });
                
                // Resetar timeout - se não receber mais áudio em 2 segundos, considerar completo
                if (audioTimeout) {
                  clearTimeout(audioTimeout);
                }
                audioTimeout = setTimeout(() => {
                  if (!isComplete && audioChunks.length > 0) {
                    logger.info('Nenhum chunk adicional recebido, finalizando', {
                      total_chunks: audioChunks.length
                    });
                    isComplete = true;
                    clearTimeout(timeout);
                    ws.close();
                  }
                }, 2000); // 2 segundos sem novos chunks
              }
            }

            // Capturar interrupção
            if (message.type === 'interruption') {
              logger.warn('Conversa interrompida', { 
                reason: message.interruption_event?.reason 
              });
            }

          } catch (error) {
            logger.error('Erro ao processar mensagem WebSocket', { error: error.message });
          }
        });

        ws.on('close', () => {
          clearTimeout(timeout);
          if (audioTimeout) {
            clearTimeout(audioTimeout);
          }
          
          if (hasError) {
            return;
          }

          if (audioChunks.length === 0) {
            logger.warn('Nenhum áudio recebido do WebSocket');
            return resolve({
              audio_url: null,
              texto: agentResponse || texto,
              mensagem: 'Nenhum áudio foi gerado. Retornando apenas texto.',
              debug: {
                agent_response: agentResponse,
                audio_chunks_received: audioChunks.length
              }
            });
          }

          // Concatenar todos os chunks de áudio
          const audioBase64 = audioChunks.join('');
          const mimeType = 'audio/mpeg';

          logger.info('Áudio gerado com sucesso via WebSocket', {
            total_chunks: audioChunks.length,
            tamanho_base64: audioBase64.length,
            formato: mimeType,
            agent_response: agentResponse
          });

          resolve({
            audio_url: `data:${mimeType};base64,${audioBase64}`,
            audio_data: audioBase64,
            formato: mimeType,
            texto: agentResponse || texto,
            total_chunks: audioChunks.length
          });
        });

        ws.on('error', (error) => {
          clearTimeout(timeout);
          if (audioTimeout) {
            clearTimeout(audioTimeout);
          }
          hasError = true;
          logger.error('Erro no WebSocket', { error: error.message });
          reject(error);
        });

      } catch (error) {
        logger.error('Erro ao converter texto para voz', { error: error.message, stack: error.stack });
        reject(error);
      }
    }).catch(error => {
      logger.error('Erro ao converter texto para voz', { 
        error: error.message,
        stack: error.stack
      });
      
      // Retornar apenas texto em caso de erro
      return {
        audio_url: null,
        texto: texto,
        erro: error.message,
        fallback: true,
        mensagem: 'Erro ao gerar áudio via WebSocket. Retornando apenas texto. Verifique os logs para mais detalhes.'
      };
    });
  }
}

module.exports = new IAController();
module.exports.IAController = IAController;
