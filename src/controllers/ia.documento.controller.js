const { BaseController } = require('./index');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');
const pdf = require('pdf-parse');

const SYSTEM_PROMPT = `Você é um "Gerador de Documento Visual em HTML+CSS" especializado em documentos jurídicos brasileiros.

OBJETIVO PRINCIPAL
Você recebe o TEXTO PURO do documento (DOCUMENTO_TEXTO) e um TEMPLATE_HTML (apenas exemplo de estilo). Sua tarefa é:
1) Montar o HTML FINAL contendo TODO O CONTEÚDO do DOCUMENTO_TEXTO, preservando ordem e sentido.
2) SUBSTITUIR trechos de texto por componentes visuais quando houver gatilhos claros (ex.: percentuais → gráfico de pizza, divisão de verbas → tabela, Chave PIX → QR code).
3) O html_formatado deve ser um documento HTML COMPLETO e autocontido, com TODO o CSS dentro de <style> no <head>.

⚠️ TEMPLATE_HTML = APENAS INSPIRAÇÃO DE ESTILO
- O TEMPLATE_HTML serve SOMENTE como referência de cores, tipografia e layout. É uma inspiração visual.
- O documento gerado NÃO pode conter NENHUM texto do TEMPLATE_HTML. Todo o conteúdo vem exclusivamente do DOCUMENTO_TEXTO.
- Você tem liberdade total para gerar HTML totalmente novo, criando sua própria estrutura. Respeite apenas: identificação de gatilhos e inserção de elementos visuais.
- Se o template tiver textos como "Nome:", "Exemplo", "Lorem ipsum", etc., NUNCA use esses textos. Use apenas o que está no DOCUMENTO_TEXTO.

⚠️ REGRA CRÍTICA: CONTEÚDO
- Todo o texto do DOCUMENTO_TEXTO deve aparecer no HTML. Ou como parágrafos/seções ou DENTRO dos componentes visuais.
- O HTML NÃO pode ter apenas estrutura vazia. Cada seção do documento original deve ter seu conteúdo representado.

COMPONENTES VISUAIS – QUANDO INSERIR (GATILHOS)
Você DEVE identificar e inserir componentes visuais quando encontrar estes padrões no texto:

| Gatilho no texto | Componente | Exemplo |
|------------------|------------|---------|
| Percentuais, proporções, divisão (50%, 55%, 100%) | grafico_pizza | Pensão vs renda; divisão de despesas |
| Valores, verbas, lista comparativa | tabela | Despesas extraordinárias; partilha; verbas rescisórias |
| Chave PIX, URL, link para pagamento | qr_code | Dados para depósito; link de acesso |
| "Quanto falta", fração cumprida, progresso | barra_progresso | Tempo de contribuição; meta em % |
| Sequência de datas/eventos | timeline | Convivência; histórico; marcos |
| Passos, fluxo, se/então | fluxograma | Procedimentos; etapas |
| Requisitos, condições, checklist | checklist | ANPP; admissibilidade; compliance |
| Jurisprudência, artigos, citação legal | citacoes | Art. 784; ementas; doutrina |
| Valor destacado, prova forte, risco | destaque | R$ 750,00; laudo DNA; cláusula crítica |

EXEMPLOS CONCRETOS (Acordo de Alimentos):
- "50% para cada genitor" em despesas → TABELA com colunas (Item | Responsável | %)
- "55% do salário mínimo" → GRÁFICO DE PIZZA ou BARRA DE PROGRESSO
- Chave PIX: 12345678900 → CARD com placeholder de QR code + chave em texto
- Art. 784, IV, CPC → BLOCO de citação com destaque
- Valor R$ 750,00 → DESTAQUE ou card de valor

FORMATO OBRIGATÓRIO DO html_formatado
O html_formatado deve ser um documento COMPLETO e autocontido, começando com <!DOCTYPE html>, <html>, <head> com <style> contendo TODO o CSS, e <body> com TODO o conteúdo (texto + componentes visuais como tabelas, gráficos, qr_code). O CSS NUNCA deve ser retornado separado – tudo dentro do próprio HTML.

REGRAS
- NÃO inventar dados. Use apenas o que está no DOCUMENTO_TEXTO.
- NUNCA copie texto do TEMPLATE_HTML para o html_formatado. O template é só inspiração de estilo.
- Se faltar dado para gráfico: use placeholder "Valores não informados" no componente.
- Sem bibliotecas externas: gráficos em HTML/CSS ou SVG inline.
- Você pode gerar HTML completamente novo; use o template apenas como inspiração de paleta/estilo.`;

const OUTPUT_SCHEMA = `
VOCÊ DEVE RETORNAR UM ÚNICO JSON VÁLIDO com as chaves abaixo. Não inclua markdown nem texto fora do JSON.
O campo "html_formatado" deve conter o documento HTML COMPLETO com todo o CSS já dentro de <style> no <head>. NÃO inclua um campo "css" separado.

{
  "analysis": {
    "modelo_visual": "string",
    "tipos_identificados": ["string"],
    "justificativas": { "componente": "trecho e motivo" },
    "warnings": ["string"]
  },
  "titulo_documento": "string",
  "descricao_documento": "string",
  "sugestoes_analise": {
    "analise_semantica": "Identificar argumentos centrais e pedidos no documento.",
    "correcao_ortografica_gramatical": "Ortografia, pontuação, acentuação e digitação."
  },
  "entidade_juridica": {
    "partes": ["autor", "réu", "contratante", etc.],
    "datas_relevantes": ["array de datas"],
    "valores_monetarios": ["array de valores"]
  },
  "citacoes_de_lei": ["Artigos, leis, códigos (CPC, CC, CLT), normas citadas"],
  "resumo_documento": "Resumo executivo em até 3 frases.",
  "ementa": "Ementa estruturada da peça.",
  "resumo_alteracoes": ["Tópico 1: descreva o que foi alterado/substituído", "Tópico 2: ...", "..."],
  "html_formatado": "<!DOCTYPE html><html>... documento COMPLETO com <style> no head e todo o conteúdo no body ...</html>"
}

O campo "resumo_alteracoes" deve ser um array de strings, cada uma descrevendo em tópico o que você mudou em relação ao documento original (ex.: "Substituída a divisão de despesas extraordinárias por tabela visual", "Inserido gráfico de pizza para proporção pensão vs renda", "Criado card com QR code para Chave PIX"). Liste TODAS as alterações feitas.`;

/**
 * Converte texto puro em HTML simples (parágrafos).
 * Usado como "conteudo_texto" = HTML do texto original do PDF.
 */
function textoParaHtmlOriginal(texto) {
  if (!texto || typeof texto !== 'string') return '';
  const trimmed = texto.trim();
  if (!trimmed) return '';
  const paragrafos = trimmed.split(/\n\s*\n+/).filter(p => p.trim());
  if (paragrafos.length === 0) return `<div class="doc-original"><p>${escapeHtml(trimmed)}</p></div>`;
  const html = paragrafos.map(p => `<p>${escapeHtml(p.trim())}</p>`).join('\n');
  return `<div class="doc-original">\n${html}\n</div>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

class IADocumentoController extends BaseController {
  constructor() {
    super();
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // Google Generative AI (Gemini) - para o método ajustar
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      logger.warn('GEMINI_API_KEY não foi definida no .env. Funcionalidade de ajuste de documento via Gemini desabilitada.');
    } else {
      this.gemini = new GoogleGenerativeAI(geminiKey);
      this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  /**
   * POST /api/ia/documento/gerar
   * Recebe: template_html (arquivo), documento_pdf (arquivo).
   * Opcional: modelo_visual (string), metadados (JSON string).
   * Retorna: titulo_documento, conteudo_texto, descricao_documento, sugestoes_analise,
   *          entidade_juridica, citacoes_de_lei, html_formatado, resumo_documento, ementa.
   */
  gerar = async (req, res) => {
    try {
      const templateFile = req.files?.template_html?.[0];
      const pdfFile = req.files?.documento_pdf?.[0];
      const modeloVisual = (req.body?.modelo_visual || '').trim() || 'padrao';
      let metadados = {};
      if (req.body?.metadados) {
        try {
          metadados = typeof req.body.metadados === 'string'
            ? JSON.parse(req.body.metadados)
            : req.body.metadados;
        } catch (_) {
          metadados = {};
        }
      }

      if (!templateFile || !pdfFile) {
        return ApiResponse.badRequest(res, null, 'Envie os arquivos "template_html" e "documento_pdf" via multipart/form-data.');
      }

      logger.info('Gerando documento visual com IA', {
        template_size: templateFile.size,
        pdf_size: pdfFile.size,
        modelo_visual: modeloVisual
      });

      let documentoTexto = '';
      try {
        const pdfData = await pdf(pdfFile.buffer);
        documentoTexto = pdfData.text || '';
      } catch (err) {
        logger.error('Erro ao extrair texto do PDF', { error: err.message });
        return ApiResponse.error(res, 'Não foi possível extrair o texto do PDF. Verifique se o arquivo é um PDF válido.', 400, { error: 'PDF_PARSE_ERROR' });
      }

      if (!documentoTexto || documentoTexto.trim().length === 0) {
        return ApiResponse.error(res, 'O PDF não contém texto extraível (pode ser apenas imagens).', 400, { error: 'PDF_EMPTY_TEXT' });
      }

      const templateHtml = templateFile.buffer.toString('utf8');
      const conteudoTexto = textoParaHtmlOriginal(documentoTexto);

      const userPrompt = `ENTRADAS:

1) MODELO_VISUAL: "${modeloVisual}"

2) DOCUMENTO_TEXTO (texto puro do documento jurídico):
---
${documentoTexto}
---

3) TEMPLATE_HTML (APENAS INSPIRAÇÃO DE ESTILO – cores, tipografia; NÃO use nenhum texto do template no resultado):
---
${templateHtml}
---

4) METADADOS (opcional): ${JSON.stringify(metadados)}

INSTRUÇÕES OBRIGATÓRIAS:
1) Extraia TODO o conteúdo do DOCUMENTO_TEXTO e coloque no HTML. NUNCA use texto do TEMPLATE_HTML.
2) IDENTIFIQUE gatilhos (percentuais, divisões, Chave PIX, artigos, valores) e INSIRA os componentes visuais correspondentes.
3) O template é só inspiração; você pode gerar HTML totalmente novo. O html_formatado deve ser COMPLETO com CSS em <style> no <head>.
4) Preencha "resumo_alteracoes" com tópicos descrevendo todas as alterações feitas em relação ao documento original.
5) Retorne APENAS o JSON do esquema de saída, sem markdown.

${OUTPUT_SCHEMA}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 16384,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const raw = completion.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        logger.error('Resposta da IA não é JSON válido', { raw: raw?.slice(0, 500) });
        return ApiResponse.error(res, 'A IA retornou uma resposta inválida. Tente novamente.', 502, { error: 'IA_INVALID_JSON' });
      }

      const data = {
        titulo_documento: parsed.titulo_documento ?? '',
        conteudo_texto: conteudoTexto,
        descricao_documento: parsed.descricao_documento ?? '',
        sugestoes_analise: parsed.sugestoes_analise ?? { analise_semantica: '', correcao_ortografica_gramatical: '' },
        entidade_juridica: parsed.entidade_juridica ?? { partes: [], datas_relevantes: [], valores_monetarios: [] },
        citacoes_de_lei: Array.isArray(parsed.citacoes_de_lei) ? parsed.citacoes_de_lei : [],
        html_formatado: parsed.html_formatado ?? '',
        resumo_documento: parsed.resumo_documento ?? '',
        ementa: parsed.ementa ?? '',
        resumo_alteracoes: Array.isArray(parsed.resumo_alteracoes) ? parsed.resumo_alteracoes : [],
        analysis: parsed.analysis ?? null
      };

      logger.info('Documento visual gerado com sucesso', { titulo: data.titulo_documento });
      return ApiResponse.success(res, data, 'Documento visual gerado com sucesso');
    } catch (err) {
      logger.error('Erro ao gerar documento visual', { error: err.message, stack: err.stack });
      if (err.code === 'OPENAI_QUOTA_EXCEEDED' || err.status === 429) {
        return ApiResponse.error(res, 'Limite de uso da OpenAI excedido. Tente mais tarde.', 429, { error: 'OPENAI_QUOTA_EXCEEDED' });
      }
      if (err.code === 'OPENAI_RATE_LIMIT') {
        return ApiResponse.error(res, 'Muitas requisições. Aguarde e tente novamente.', 429, { error: 'OPENAI_RATE_LIMIT' });
      }
      return ApiResponse.internalError(res, err.message || 'Erro ao gerar documento visual.');
    }
  };

  /**
   * POST /api/ia/documento/ajustar
   * Recebe: html_formatado, conteudo_texto, prompt_usuario, e contexto jurídico.
   * Processa o HTML através da IA conforme o prompt do usuário.
   * Retorna: html_formatado (ajustado) e explicacao_ia (descrição das alterações).
   */
  ajustar = async (req, res) => {
    try {
      const {
        html_formatado,
        conteudo_texto,
        prompt_usuario,
        ementa,
        entidade_juridica,
        sugestoes_analise,
        citacoes_de_lei,
        resposta_anterior_ia
      } = req.body;

      // Validação dos campos obrigatórios
      if (!html_formatado || typeof html_formatado !== 'string' || html_formatado.trim().length === 0) {
        return ApiResponse.badRequest(res, null, 'Campo "html_formatado" é obrigatório e não pode estar vazio.');
      }

      if (!prompt_usuario || typeof prompt_usuario !== 'string' || prompt_usuario.trim().length === 0) {
        return ApiResponse.badRequest(res, null, 'Campo "prompt_usuario" é obrigatório e não pode estar vazio.');
      }

      logger.info('Iniciando ajuste de documento via IA', {
        prompt_length: prompt_usuario.length,
        html_size: html_formatado.length
      });

      // Construir contexto jurídico para a IA
      const contextoJuridico = {
        ementa: ementa || '',
        entidade_juridica: entidade_juridica || [],
        sugestoes_analise: sugestoes_analise || {},
        citacoes_de_lei: citacoes_de_lei || []
      };

      const systemPromptAjuste = `Você é um especialista em documentos jurídicos em HTML+CSS. Sua tarefa é ajustar um documento HTML conforme solicitações do usuário, mantendo a integridade jurídica e visual.

INSTRUÇÕES CRÍTICAS:
1. PRESERVAR ESTRUTURA: Mantenha toda a estrutura HTML, classes CSS e tags existentes.
2. PRESERVAR CSS: NÃO ALTERE as classes CSS ou estilos no <style>. Altere apenas o conteúdo dentro das tags.
3. COERÊNCIA JURÍDICA: Use o contexto jurídico fornecido para garantir que as alterações mantêm a coerência legal do documento.
4. PRECISÃO: Faça EXATAMENTE o que o usuário solicita. Se pedir para remover uma seção, remova. Se pedir para destacar, destaque.
5. RETORNO: Retorne APENAS JSON válido com dois campos: "html_formatado" e "explicacao_ia". Sem markdown, sem textos adicionais.

CONTEXTO JURÍDICO DO DOCUMENTO (use para manter coerência):
${JSON.stringify(contextoJuridico, null, 2)}

FORMATO DE RETORNO OBRIGATÓRIO:
{
  "html_formatado": "<!DOCTYPE html>... documento HTML completo com ajustes ...",
  "explicacao_ia": "Texto breve das alterações (máx 500 caracteres): - Alteração 1. - Alteração 2. etc."
}`;

      const userPromptAjuste = `O DOCUMENTO HTML ATUAL (que você deve ajustar):
---
${html_formatado}
---

${resposta_anterior_ia ? `\nRESPOSTA ANTERIOR DA IA (para referência/contexto):
---
${resposta_anterior_ia}
---\n` : ''}

SOLICITAÇÃO DO USUÁRIO (execute exatamente como solicitado):
---
${prompt_usuario}
---

LEMBRE-SE:
- Preserve todas as classes CSS e estrutura de tags.
- Altere apenas o conteúdo dentro das tags.
- Mantenha a coerência jurídica do documento.
- Retorne APENAS o JSON solicitado, sem markdown.`;

      // Usar Google Gemini para o método ajustar
      logger.info('Chamando Gemini para ajuste de documento', {
        modelo: 'gemini-2.5-flash',
        tam_prompt: userPromptAjuste.length
      });

      const fullPrompt = `${systemPromptAjuste}\n\n${userPromptAjuste}`;
      
      const result = await this.geminiModel.generateContent(fullPrompt);
      const responseText = result.response.text();

      // Gemini pode envoltar JSON em markdown, então remover se necessário
      let raw = responseText.trim();
      if (raw.startsWith('```json')) {
        raw = raw.slice(7); // Remove ```json
        if (raw.endsWith('```')) {
          raw = raw.slice(0, -3); // Remove ```
        }
      } else if (raw.startsWith('```')) {
        raw = raw.slice(3); // Remove ```
        if (raw.endsWith('```')) {
          raw = raw.slice(0, -3); // Remove ```
        }
      }
      raw = raw.trim();

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        logger.error('Resposta do Gemini não é JSON válido no ajuste', { raw: raw?.slice(0, 500) });
        return ApiResponse.error(res, 'A IA retornou uma resposta inválida. Tente novamente.', 502, { error: 'IA_INVALID_JSON' });
      }

      // Validar campos de saída obrigatórios
      if (!parsed.html_formatado || typeof parsed.html_formatado !== 'string' || parsed.html_formatado.trim().length === 0) {
        logger.error('IA retornou html_formatado vazio or inválido', { parsed });
        return ApiResponse.error(res, 'A IA não conseguiu processar o documento. Tente com um prompt mais específico.', 502, { error: 'IA_EMPTY_OUTPUT' });
      }

      const explicacao = (parsed.explicacao_ia || 'Alterações realizadas conforme solicitado.').substring(0, 500);

      const data = {
        html_formatado: parsed.html_formatado,
        explicacao_ia: explicacao
      };

      logger.info('Documento ajustado com sucesso pela IA', {
        explicacao_length: explicacao.length
      });

      return ApiResponse.success(res, data, 'Documento ajustado com sucesso');
    } catch (err) {
      logger.error('Erro ao ajustar documento com Gemini', { error: err.message, stack: err.stack });
      
      // Tratamento de erros específicos do Gemini
      if (err.message?.includes('PERMISSION_DENIED') || err.message?.includes('API key')) {
        return ApiResponse.error(res, 'Erro de autenticação com Gemini. Verifique a configuração.', 500, { error: 'GEMINI_AUTH_ERROR' });
      }
      
      if (err.message?.includes('RESOURCE_EXHAUSTED') || err.status === 429) {
        return ApiResponse.error(res, 'Limite de uso do Gemini excedido. Tente mais tarde.', 429, { error: 'GEMINI_QUOTA_EXCEEDED' });
      }
      
      return ApiResponse.internalError(res, err.message || 'Erro ao ajustar documento.');
    }
  };
}

module.exports = new IADocumentoController();
