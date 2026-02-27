# 🚀 Quick Reference - POST /api/ia/documento/ajustar

## Endpoint Overview

**Método**: POST
**URL**: `/api/ia/documento/ajustar`
**Autenticação**: Não requerida
**Content-Type**: `application/json`

---

## Minimal Request

```bash
curl -X POST http://localhost:3000/api/ia/documento/ajustar \
  -H "Content-Type: application/json" \
  -d '{\n    \"html_formatado\": \"<html><body>...</body></html>\",\n    \"prompt_usuario\": \"Sua instrução aqui\"\n  }'\n```

---

## Minimal Response

```json
{
  \"success\": true,
  \"message\": \"Documento ajustado com sucesso\",
  \"data\": {
    \"html_formatado\": \"<html>...<\/html>\",
    \"explicacao_ia\": \"Alterações: ...\"\n  }\n}\n```

---

## Body Parameters

| Param | Type | Required | Max Length |\n|-------|------|:--------:|:-----------:|\n| `html_formatado` | string | ✅ | N/A |\n| `prompt_usuario` | string | ✅ | N/A |\n| `ementa` | object | ❌ | N/A |\n| `entidade_juridica` | array | ❌ | N/A |\n| `sugestoes_analise` | object | ❌ | N/A |\n| `citacoes_de_lei` | array | ❌ | N/A |\n| `conteudo_texto` | string | ❌ | N/A |\n| `resposta_anterior_ia` | string | ❌ | N/A |\n\n---\n\n## JavaScript Example\n\n```javascript\nconst resultado = await fetch('/api/ia/documento/ajustar', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    html_formatado: htmlString,\n    prompt_usuario: 'Aumente títulos para 18pt'\n  })\n});\nconst data = await resultado.json();\n```\n\n---\n\n## Common Prompts\n\n- \"Aumente todos os títulos para 18pt\"\n- \"Destaque valores monetários em ouro (#fca311)\"\n- \"Remova a seção de testemunhas\"\n- \"Coloque títulos em negrito\"\n- \"Adicione borda vermelha na Cláusula 3\"\n- \"Aumente espaçamento entre parágrafos (line-height: 1.8)\"\n\n---\n\n## HTTP Status Codes\n\n| Status | Meanings |\n|--------|----------|\n| **200** | ✅ Sucesso |\n| **400** | ❌ Campo obrigatório faltando ou vazio |\n| **429** | ❌ Rate limit OpenAI excedido |\n| **500** | ❌ Erro servidor |\n| **502** | ❌ IA retornou resposta inválida |\n\n---\n\n## Files Involved\n\n```\nsrc/\n├── controllers/\n│   └── ia.documento.controller.js  [método ajustar adicionado]\n└── routes/\n    └── ia.documento.routes.js      [rota POST /ajustar adicionada]\n\nDocs/\n├── TESTE_AJUSTAR_DOCUMENTO.md      [documentação API]\n├── RESUMO_IMPLEMENTACAO_*.md        [técnico]\n├── EXEMPLOS_INTEGRACAO_*.js        [código frontend]\n└── CHECKLIST_IMPLEMENTACAO_*.md    [validação]\n```\n\n---\n\n## Key Features\n\n✅ **Preserves**: CSS classes, HTML structure, tags\n✅ **Alters**: Content, inline styles, values\n✅ **Uses**: AI context for legal coherence\n✅ **Returns**: 2 fields - html_formatado + explicacao_ia\n✅ **Supports**: Iterative adjustments (resposta_anterior_ia)\n\n---\n\n## Error Example\n\n```bash\n# Missing prompt_usuario\ncurl -X POST ... -d '{ \"html_formatado\": \"...\" }'\n\n# Response:\n{\n  \"success\": false,\n  \"message\": \"Campo \\\"prompt_usuario\\\" é obrigatório\",\n  \"error\": null\n}\n```\n\n---\n\n## React Hook\n\n```javascript\nconst { ajustar, loading, error } = useAjustarDocumento();\n\nconst resultado = await ajustar(\n  htmlFormatado,\n  'Sua instrução',\n  { ementa: {...} }\n);\n```\n\n---\n\n## Implementation Details\n\n- **Model**: gpt-4o-mini\n- **Temperature**: 0.2 (deterministic)\n- **Max Tokens**: 16384\n- **Response Format**: JSON obligatory\n- **Timeout**: Server default\n\n---\n\n## Test\n\n```bash\nnode tests/test-ajustar-documento.js\n```\n\n---\n\n**Last Updated**: 27/02/2026\n**Status**: ✅ Production Ready\n