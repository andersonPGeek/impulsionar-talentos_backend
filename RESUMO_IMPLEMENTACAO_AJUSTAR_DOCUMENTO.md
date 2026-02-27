# Resumo da Implementação - Endpoint de Ajuste de Documentos via IA

## 📋 O que foi implementado

Um novo endpoint **POST /api/ia/documento/ajustar** que permite ajustar documentos HTML jurídicos através de instrução do usuário, processado por IA, mantendo a integridade CSS e estrutura HTML original.

---

## 📦 Arquivos Modificados/Criados

### 1. **[src/controllers/ia.documento.controller.js](src/controllers/ia.documento.controller.js)**
**Modificação**: Adicionado novo método `ajustar`

**O que faz**:
- ✅ Recebe payload JSON com `html_formatado`, `prompt_usuario` e contexto jurídico
- ✅ Valida campos obrigatórios
- ✅ Envia à OpenAI com system prompt específico para preservação de CSS
- ✅ Retorna apenas dois campos: `html_formatado` (ajustado) e `explicacao_ia`
- ✅ Tratamento completo de erros (rate limit, quota, validação)
- ✅ Logging detalhado de operações

**Principais características do método**:
```javascript
ajustar = async (req, res) => {
  // Valida campos obrigatórios
  // Constrói contexto jurídico
  // Faz chamada à IA com temperature 0.2 (determinístico)
  // Retorna resposta formatada
  // Trata erros específicos da OpenAI
}
```

---

### 2. **[src/routes/ia.documento.routes.js](src/routes/ia.documento.routes.js)**
**Modificação**: Adicionada nova rota

**Rota criada**:
```
POST /api/ia/documento/ajustar
```

**Características**:
- ✅ Aceita JSON (body parser já configurado em app.js)
- ✅ Sem autenticação (público)
- ✅ Integrada ao router existente de documentos

---

### 3. **[TESTE_AJUSTAR_DOCUMENTO.md](TESTE_AJUSTAR_DOCUMENTO.md)** (Novo)
**Documentação Completa**:
- 📖 URL e método HTTP
- 📋 Campos de requisição (obrigatórios e opcionais)
- 📝 Exemplo de requisição curl
- 🎯 Exemplo de resposta (sucesso e erros)
- 📊 Tabelas de campos e status
- 💡 Exemplos de prompts para diferentes casos de uso
- 🔗 Integração frontend em JavaScript/React
- ⚙️ Observações técnicas (modelo, temperature, tokens)

---

### 4. **[tests/test-ajustar-documento.js](tests/test-ajustar-documento.js)** (Novo)
**Arquivo de Teste Executável**:
- ✅ Teste 1: Aumentar destaque de valores
- ✅ Teste 2: Validação de campo obrigatório
- ✅ Teste 3: Com contexto jurídico completo
- ✅ Teste 4: Validação de HTML vazio

**Como executar**:
```bash
node tests/test-ajustar-documento.js
```

---

## 🎯 Especificação Técnica

### Payload de Entrada (Body JSON)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `html_formatado` | string | ✅ | HTML completo do documento |
| `prompt_usuario` | string | ✅ | Instrução de ajuste |
| `conteudo_texto` | string | ❌ | Texto puro original |
| `ementa` | object/string | ❌ | Ementa do documento |
| `entidade_juridica` | array | ❌ | Partes envolvidas |
| `sugestoes_analise` | object | ❌ | Contexto análise jurídica |
| `citacoes_de_lei` | array | ❌ | Referências legais |
| `resposta_anterior_ia` | string | ❌ | Resposta anterior para contexto |

### Payload de Saída (Response 200 OK)

```json
{
  "success": true,
  "message": "Documento ajustado com sucesso",
  "data": {
    "html_formatado": "<!DOCTYPE html>... documento ajustado ...",
    "explicacao_ia": "Descrição das alterações realizadas"
  },
  "timestamp": "2026-02-27T..."
}
```

---

## 🔐 Validações Implementadas

### ✅ Validações de Input
1. Campo `html_formatado` não pode estar vazio
2. Campo `prompt_usuario` não pode estar vazio
3. Ambos devem ser strings

### ✅ Validações de Output
1. IA deve retornar JSON válido
2. Campo `html_formatado` não pode estar vazio
3. Campo `explicacao_ia` é limitado a 500 caracteres

### ✅ Error Handling
- **400 Bad Request**: Campos obrigatórios faltando
- **429 Rate Limit**: Limite de requisições OpenAI excedido
- **502 Service Unavailable**: JSON inválido da IA
- **500 Internal Server Error**: Erro geral do servidor

---

## 🤖 System Prompt da IA

O sistema foi instruído a:
1. **Preservar**: Toda estrutura HTML, classes CSS, atributos
2. **Alterar**: Conteúdo de texto, inline styles, valores
3. **Usar contexto**: Campos jurídicos para manter coerência legal
4. **Retornar**: JSON com exatamente 2 campos

---

## 📊 Padrões Seguidos

✅ **Arquitetura**: Segue padrão existente (BaseController, ApiResponse, Logger)
✅ **Nomenclatura**: `ajustar` (coerente com projeto)
✅ **Tratamento de Erros**: Idêntico ao método `gerar` existente
✅ **Logging**: Usa logger do projeto
✅ **Resposta**: Formato ApiResponse consistente
✅ **IA**: Usa OpenAI já configurada no projeto

---

## 🚀 Como Usar

### cURL
```bash
curl -X POST http://localhost:3000/api/ia/documento/ajustar \
  -H "Content-Type: application/json" \
  -d '{
    "html_formatado": "<html>...conteúdo...</html>",
    "prompt_usuario": "Aumente os títulos para 18pt e destaque valores em ouro"
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('/api/ia/documento/ajustar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html_formatado: documentHTML,
    prompt_usuario: "Sua instrução aqui"
  })
});
const result = await response.json();
```

### Python/Requests
```python
import requests

payload = {
  "html_formatado": "<html>...</html>",
  "prompt_usuario": "Sua instrução"
}

response = requests.post(
  'http://localhost:3000/api/ia/documento/ajustar',
  json=payload
)
result = response.json()
```

---

## 📋 Exemplo de Payload Completo

```json
{
  "html_formatado": "<!DOCTYPE html><html>...",
  "conteudo_texto": "Texto original do documento...",
  "prompt_usuario": "Aumente o tamanho de todos os títulos para 18pt",
  "ementa": {
    "titulo": "ACORDO EXTRAJUDICIAL DE ALIMENTOS",
    "subtitulo": "PENSÃO ALIMENTÍCIA"
  },
  "entidade_juridica": [
    { "papel": "GENITORA", "parte": "Carolina Ribeiro Martins" },
    { "papel": "GENITOR", "parte": "Felipe Augusto Nascimento" }
  ],
  "sugestoes_analise": {
    "analise_semantica": {
      "pedidos": ["Pagamento de pensão"],
      "argumentos_centrais": ["Estabelecimento de acordo"]
    }
  },
  "citacoes_de_lei": [
    { "norma": "CPC", "artigo": "784", "texto_citado": "título executivo" }
  ]
}
```

---

## ✨ Casos de Uso

1. **Ajustar Formatação**: Aumentar/diminuir fontes, espaçamento
2. **Destacar Seções**: Adicionar cores, bordas em cláusulas importantes
3. **Realçar Valores**: Colocar em negrito, outras cores, destacar R$ e %
4. **Remover/Adicionar Seções**: Modificar estrutura conforme necessário
5. **Iterar Mudanças**: Usar `resposta_anterior_ia` para ajustes posteriores

---

## ⚙️ Configurações Técnicas

- **Modelo IA**: `gpt-4o-mini`
- **Temperature**: 0.2 (mais determinístico)
- **Max Tokens**: 16384 (suficiente para documentos grandes)
- **Timeout**: Sem timeout (usar padrão do servidor)
- **Response Format**: JSON obrigatório

---

## 📝 Status

| Componente | Status |
|------------|:------:|
| Método no controller | ✅ |
| Rota HTTP | ✅ |
| Validações | ✅ |
| Tratamento de erros | ✅ |
| Logging | ✅ |
| Documentação | ✅ |
| Testes | ✅ |
| Integração padrões projeto | ✅ |

---

## 🔗 Integração com Frontend

O frontend pode:
1. Capturar HTML do documento renderizado
2. Receber instrução do usuário (caixa de texto)
3. Enviar POST com ID do documento ou contexto
4. Receber HTML ajustado
5. Renderizar novo preview

**Exemplo de fluxo**:
```
User Input (prompt)
    ↓
POST /api/ia/documento/ajustar
    ↓
Backend: Valida → IA Processa (0.2s-2s)
    ↓
Response: html_formatado + explicacao_ia
    ↓
Frontend: Update DOM → Exibir preview
```

---

## 📚 Referências

- Documentação completa: [TESTE_AJUSTAR_DOCUMENTO.md](TESTE_AJUSTAR_DOCUMENTO.md)
- Teste prático: [tests/test-ajustar-documento.js](tests/test-ajustar-documento.js)
- Endpoint gerador original: POST /api/ia/documento/gerar
- Padrão arquitetura: [src/controllers/](src/controllers/)

---

**Implementação concluída em**: 27 de fevereiro de 2026
**Desenvolvedor**: Senior Node.js
**Status**: ✅ Pronto para testes e deploy
