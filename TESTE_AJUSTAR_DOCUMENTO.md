# Documentação: POST /api/ia/documento/ajustar

## Resumo
Novo endpoint que ajusta um documento HTML conforme instrução do usuário, processado através de IA. Preserva a estrutura CSS e as tags HTML, alterando apenas o conteúdo conforme solicitado.

---

## URL e Método
```
POST /api/ia/documento/ajustar
```

---

## Requisição (Body - JSON)

### Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `html_formatado` | string | Código HTML completo do documento a ser ajustado |
| `prompt_usuario` | string | Instrução de ajuste solicitada pelo usuário |

### Campos Opcionais (Contexto Jurídico)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `conteudo_texto` | string | Texto puro do documento original |
| `ementa` | object\|string | Ementa do documento (JSON ou string) |
| `entidade_juridica` | array | Array com partes envolvidas e seus papéis |
| `sugestoes_analise` | object | Contexto de análise jurídica |
| `citacoes_de_lei` | array | Array de referências legais (artigos, leis) |
| `resposta_anterior_ia` | string | Resposta anterior da IA (para contexto/histórico) |

---

## Exemplo de Requisição Completa

```bash
curl -X POST http://localhost:3000/api/ia/documento/ajustar \
  -H "Content-Type: application/json" \
  -d '{
    "html_formatado": "<!DOCTYPE html>\n<html>...<body>\n<p>Texto original</p>...</body></html>",
    "prompt_usuario": "Aumente o tamanho da fonte dos títulos para 18pt e destaque todos os valores monetários em cores de ouro (#fca311)",
    "ementa": {
      "titulo": "ACORDO EXTRAJUDICIAL",
      "subtitulo": "Descrição do acordo"
    },
    "entidade_juridica": [
      { "papel": "GENITORA", "parte": "Carolina Ribeiro Martins" },
      { "papel": "GENITOR", "parte": "Felipe Augusto Nascimento" }
    ],
    "sugestoes_analise": {
      "analise_semantica": {
        "pedidos": ["Pagamento de pensão mensal"],
        "argumentos_centrais": ["Estabelecimento de acordo"]
      }
    },
    "citacoes_de_lei": [
      { "norma": "CPC", "artigo": "784", "texto_citado": "título executivo extrajudicial" }
    ]
  }'
```

---

## Resposta (200 OK - Sucesso)

```json
{
  "success": true,
  "message": "Documento ajustado com sucesso",
  "data": {
    "html_formatado": "<!DOCTYPE html>\n<html>...<body>\n<p style='font-size: 18pt; color: #fca311;'>Texto ajustado</p>...</body></html>",
    "explicacao_ia": "Alterações realizadas: - Aumentado tamanho de fonte dos títulos para 18pt. - Destacadas em ouro (#fca311) todas as referências de valores monetários. - Mantida estrutura CSS original."
  },
  "timestamp": "2026-02-27T10:30:45.123Z"
}
```

---

## Resposta de Erro

### 400 - Bad Request (Campo Obrigatório Faltando)
```json
{
  "success": false,
  "message": "Campo \"html_formatado\" é obrigatório e não pode estar vazio.",
  "error": null,
  "timestamp": "2026-02-27T10:30:45.123Z"
}
```

### 429 - Rate Limit (Limite de Requisições da OpenAI Excedido)
```json
{
  "success": false,
  "message": "Limite de uso da OpenAI excedido. Tente mais tarde.",
  "error": "OPENAI_QUOTA_EXCEEDED",
  "timestamp": "2026-02-27T10:30:45.123Z"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Erro ao ajustar documento.",
  "error": null,
  "timestamp": "2026-02-27T10:30:45.123Z"
}
```

---

## Regras Importantes

### ✅ O que a IA Preserva
- ✓ Todas as classes CSS (`.header-bar`, `.scope-box`, etc.)
- ✓ Toda a estrutura de tags HTML
- ✓ O arquivo `<style>` do `<head>`
- ✓ Atributos HTML (id, class, data-*, etc.)
- ✓ Coerência jurídica do documento

### ✅ O que a IA Altera
- ✓ Conteúdo de texto dentro de tags
- ✓ Inline styles (`style=""`) conforme solicitado
- ✓ Valores e datas
- ✓ Formatação de seções
- ✓ Destaque e ênfase visual

---

## Exemplos de Prompts Usuário

### Exemplo 1: Aumentar Destaque de Valores
```
"Destaque todos os valores monetários (ex: R$ 820,00) em negrito e com cor verde (#0d7710)."
```

### Exemplo 2: Modificar Estrutura Visual
```
"Remova a seção de QR Code PIX e substitua por um texto simples: 'Chave PIX: 22233344455'"
```

### Exemplo 3: Destacar Cláusulas Importantes
```
"Adicione uma borda vermelha ao redor da CLÁUSULA 3 (INADIMPLÊNCIA) e coloque o texto em vermelho."
```

### Exemplo 4: Resumir Documento
```
"Remova a seção de TESTEMUNHAS e adicione um resumo padrão de 2 linhas no início do documento sobre o que é o documento."
```

### Exemplo 5: Ajustar Formatação Geral
```
"Aumentar todos os parágrafos de 10pt para 12pt, aumentar o espaço entre linhas (line-height) para 1.8, e centralizar os títulos das cláusulas."
```

---

## Fluxo de Uso Recomendado

1. **Frontend envia**: POST com `html_formatado`, `prompt_usuario` e contexto jurídico
2. **Backend processa**: Valida payload e envia à IA com system prompt específico
3. **IA ajusta**: Preserva estrutura CSS, altera apenas conforme solicitado
4. **Resposta retorna**: Apenas `html_formatado` (ajustado) + `explicacao_ia`
5. **Frontend exibe**: Novo HTML no preview do documento

---

## Observações Técnicas

- **Modelo IA**: `gpt-4o-mini`
- **Temperature**: 0.2 (mais determinístico)
- **Max Tokens**: 16384
- **Validação**: JSON Schema forçado (`response_format: { type: 'json_object' }`)
- **Tratamento de Erros**: Implementado com tratamento de rate limit e quota exceeded
- **Logging**: Completo com informações de tamanho de HTML e prompts
- **Timeout**: Sem timeout configurado (usar comportamento padrão do servidor)

---

## Integração Frontend - Exemplo em JavaScript/React

```javascript
async function ajustarDocumento(htmlFormatado, promptUsuario, contexto = {}) {
  try {
    const payload = {
      html_formatado: htmlFormatado,
      prompt_usuario: promptUsuario,
      ...contexto // Espalha campos opcionais: ementa, entidade_juridica, etc.
    };

    const response = await fetch('/api/ia/documento/ajustar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      console.log('Documento ajustado:', result.data.html_formatado);
      console.log('Explicação:', result.data.explicacao_ia);
      return result.data;
    } else {
      console.error('Erro:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// Uso:
const htmlAjustado = await ajustarDocumento(
  htmlOriginal,
  "Destaque todos os valores em ouro",
  {
    ementa: { titulo: "ACORDO" },
    entidade_juridica: [ { papel: "Parte", parte: "Nome" } ]
  }
);
```

---

## Status da Implementação

✅ **Concluído**
- [x] Método `ajustar` implementado no controller
- [x] Rota POST `/api/ia/documento/ajustar` criada
- [x] Validação de campos obrigatórios
- [x] System prompt específico para preservação de CSS
- [x] Tratamento de erros com OpenAI
- [x] Logging detalhado
- [x] Resposta formatada conforme especificação (apenas 2 campos)
- [x] Suporte a contexto jurídico opcional

