/**
 * Exemplo de Integração Frontend - POST /api/ia/documento/ajustar
 * 
 * Este arquivo demonstra como integrar o novo endpoint de ajuste de documentos
 * em uma aplicação React/Vue/Angular.
 */

// =====================================================
// EXEMPLO 1: React Hook para Ajustar Documento
// =====================================================

import { useState } from 'react';

export function useAjustarDocumento() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ajustar = async (
    htmlFormatado,
    promptUsuario,
    contextoJuridico = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        html_formatado: htmlFormatado,
        prompt_usuario: promptUsuario,
        ...contextoJuridico
      };

      const response = await fetch('/api/ia/documento/ajustar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Erro ao ajustar documento');
      }

      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { ajustar, loading, error };
}

// =====================================================
// EXEMPLO 2: Componente React de Ajuste de Documento
// =====================================================

import React, { useState } from 'react';

export function AjustarDocumentoComponent({ documentoHtml, contextoJuridico }) {
  const { ajustar, loading, error } = useAjustarDocumento();
  const [prompt, setPrompt] = useState('');
  const [htmlAjustado, setHtmlAjustado] = useState(null);
  const [explicacao, setExplicacao] = useState('');

  const handleAjustar = async () => {
    if (!prompt.trim()) {
      alert('Digite uma instrução para ajustar o documento');
      return;
    }

    try {
      const resultado = await ajustar(documentoHtml, prompt, contextoJuridico);
      setHtmlAjustado(resultado.html_formatado);
      setExplicacao(resultado.explicacao_ia);
      setPrompt(''); // Limpar input
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {/* Painel de Controle */}
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Ajustar Documento</h3>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Aumente os títulos para 18pt e destaque valores em ouro..."
          rows={6}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}
        />

        <button
          onClick={handleAjustar}
          disabled={loading}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processando...' : 'Ajustar Documento'}
        </button>

        {error && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {explicacao && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#d1ecf1',
            color: '#0c5460',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <strong>Alterações realizadas:</strong>
            <p>{explicacao}</p>
          </div>
        )}
      </div>

      {/* Preview do Documento */}
      <div style={{
        overflow: 'auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        {htmlAjustado ? (
          <iframe
            srcDoc={htmlAjustado}
            style={{
              width: '100%',
              height: '600px',
              border: 'none'
            }}
            title="Preview do Documento Ajustado"
          />
        ) : (
          <div style={{ padding: '20px', color: '#999' }}>
            Preview aparecerá aqui após ajuste
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// EXEMPLO 3: Serviço de API (Reutilizável)
// =====================================================

export class DocumentoService {
  static baseUrl = '/api/ia/documento';

  /**
   * Ajusta um documento conforme instrução do usuário
   */
  static async ajustar(payload) {
    const response = await fetch(`${this.baseUrl}/ajustar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data;
  }

  /**
   * Constrói o payload com validações
   */
  static construirPayload(htmlFormatado, promptUsuario, contextoOpcional = {}) {
    if (!htmlFormatado || htmlFormatado.trim().length === 0) {
      throw new Error('HTML formatado é obrigatório');
    }

    if (!promptUsuario || promptUsuario.trim().length === 0) {
      throw new Error('Prompt do usuário é obrigatório');
    }

    return {
      html_formatado: htmlFormatado,
      prompt_usuario: promptUsuario,
      ...contextoOpcional
    };
  }
}

// =====================================================
// EXEMPLO 4: Uso Simples (Vanilla JavaScript)
// =====================================================

async function ajustarDocumentoSimples() {
  const htmlFormatado = document.getElementById('documento-html').innerHTML;
  const promptUsuario = document.getElementById('input-prompt').value;

  const payload = {
    html_formatado: htmlFormatado,
    prompt_usuario: promptUsuario
  };

  try {
    const response = await fetch('/api/ia/documento/ajustar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      document.getElementById('preview').innerHTML = result.data.html_formatado;
      document.getElementById('explicacao').textContent = result.data.explicacao_ia;
    } else {
      alert('Erro: ' + result.message);
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao ajustar documento');
  }
}

// =====================================================
// EXEMPLO 5: Vue 3 Composable
// =====================================================

import { ref, reactive } from 'vue';

export function useAjustarDocumentoVue() {
  const estado = reactive({
    loading: false,
    error: null,
    htmlAjustado: null,
    explicacao: ''
  });

  const ajustar = async (htmlFormatado, promptUsuario, contexto = {}) => {
    estado.loading = true;
    estado.error = null;

    try {
      const payload = {
        html_formatado: htmlFormatado,
        prompt_usuario: promptUsuario,
        ...contexto
      };

      const response = await fetch('/api/ia/documento/ajustar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      estado.htmlAjustado = result.data.html_formatado;
      estado.explicacao = result.data.explicacao_ia;
      return result.data;
    } catch (error) {
      estado.error = error.message;
      throw error;
    } finally {
      estado.loading = false;
    }
  };

  return { estado, ajustar };
}

// =====================================================
// EXEMPLO 6: Integração com FormData (Se necessário)
// =====================================================

async function ajustarComContextoCompleto(htmlFormatado, promptUsuario) {
  const contextoJuridico = {
    ementa: {
      titulo: 'ACORDO EXTRAJUDICIAL DE ALIMENTOS',
      subtitulo: 'PENSÃO ALIMENTÍCIA'
    },
    entidade_juridica: [
      { papel: 'GENITORA', parte: 'Carolina Ribeiro Martins' },
      { papel: 'GENITOR', parte: 'Felipe Augusto Nascimento' }
    ],
    sugestoes_analise: {
      analise_semantica: {
        pedidos: ['Pagamento de pensão mensal'],
        argumentos_centrais: ['Estabelecimento de acordo']
      }
    },
    citacoes_de_lei: [
      { norma: 'CPC', artigo: '784, IV', texto_citado: 'título executivo extrajudicial' }
    ]
  };

  const payload = {
    html_formatado: htmlFormatado,
    prompt_usuario: promptUsuario,
    ...contextoJuridico
  };

  const response = await fetch('/api/ia/documento/ajustar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return await response.json();
}

// =====================================================
// EXEMPLO 7: Tratamento de Erro Avançado
// =====================================================

async function ajustarComTratamentoErro(htmlFormatado, promptUsuario) {
  try {
    const payload = {
      html_formatado: htmlFormatado,
      prompt_usuario: promptUsuario
    };

    const response = await fetch('/api/ia/documento/ajustar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: 30000 // 30 segundos
    });

    const result = await response.json();

    if (!response.ok) {
      // Tratamento específico por status
      if (response.status === 400) {
        throw new Error(`Validação: ${result.message}`);
      } else if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Aguarde alguns minutos.');
      } else if (response.status === 502) {
        throw new Error('Erro ao processar. Tente com um prompt mais específico.');
      } else {
        throw new Error(result.message || 'Erro desconhecido');
      }
    }

    return result.data;
  } catch (error) {
    console.error('Erro ao ajustar:', error);
    throw error;
  }
}

// =====================================================
// EXEMPLO 8: HTML de Teste
// =====================================================

const htmlTesteDocumento = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Acordo</title>
  <style>
    body { font-family: Arial; }
    .titulo { font-size: 16pt; color: #333; }
    .valor { color: gold; font-weight: bold; }
  </style>
</head>
<body>
  <h1 class="titulo">ACORDO EXTRAJUDICIAL</h1>
  <p>Valor: <span class="valor">R$ 820,00</span></p>
</body>
</html>`;

// =====================================================
// COMO USAR NO HTML
// =====================================================

/**
 * HTML:
 * 
 * <div id="app">
 *   <textarea id="input-prompt" placeholder="Digite a instrução..."></textarea>
 *   <button onclick="ajustarDocumentoSimples()">Ajustar</button>
 *   <div id="preview"></div>
 *   <div id="explicacao"></div>
 * </div>
 * 
 * Script:
 * <script src="path/to/this-file.js"></script>
 */

// =====================================================
// EXEMPLO DE USO PRÁTICO
// =====================================================

/*
// 1. Importar o hook/serviço
import { useAjustarDocumento } from './hooks/useAjustarDocumento';

// 2. Usar no componente
function MeuComponente() {
  const { ajustar, loading } = useAjustarDocumento();
  
  async function handleAjustar() {
    const resultado = await ajustar(
      documentoHTML,
      'Aumente os títulos para 18pt'
    );
    // resultado.html_formatado = novo HTML
    // resultado.explicacao_ia = descrição das alterações
  }
}

// 3. Usar com contexto completo
const resultado = await ajustar(
  documentoHTML,
  'Destaque valores em ouro',
  {
    ementa: { titulo: 'ACORDO' },
    entidade_juridica: [...],
    citacoes_de_lei: [...]
  }
);
*/

export default {
  useAjustarDocumento,
  AjustarDocumentoComponent,
  DocumentoService,
  ajustarDocumentoSimples,
  ajustarComContextoCompleto,
  ajustarComTratamentoErro
};
