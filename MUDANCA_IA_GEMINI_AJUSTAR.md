# ✅ Mudança de IA - Gemini para /api/ia/documento/ajustar

## 📋 O Que Foi Mudado

### ✅ Método: `ajustar` (POST /api/ia/documento/ajustar)
- **De**: OpenAI GPT-4o-mini
- **Para**: Google Gemini 1.5 Flash (versão mais rápida)
- **Token**: AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q
- **Status**: ✅ Implementado

### ❌ Método: `gerar` (POST /api/ia/documento/gerar)
- **Mantém**: OpenAI GPT-4o-mini
- **Status**: ✅ Sem mudanças

---

## 🔧 Detalhes Técnicos

### Imports Adicionados
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
```

### Constructor Atualizado
```javascript
constructor() {
  super();
  this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Google Generative AI (Gemini) - para o método ajustar
  this.gemini = new GoogleGenerativeAI('AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q');
  this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
}
```

### Mudanças no Método `ajustar`

**Antes** (OpenAI):
```javascript
const completion = await this.openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: systemPromptAjuste },
    { role: 'user', content: userPromptAjuste }
  ],
  max_tokens: 16384,
  temperature: 0.2,
  response_format: { type: 'json_object' }
});

const raw = completion.choices[0].message.content;
```

**Depois** (Gemini):
```javascript
const fullPrompt = `${systemPromptAjuste}\n\n${userPromptAjuste}`;

const result = await this.geminiModel.generateContent(fullPrompt);
const responseText = result.response.text();

// Gemini pode envolver JSON em markdown, então remover se necessário
let raw = responseText.trim();
if (raw.startsWith('```json')) {
  raw = raw.slice(7); // Remove ```json
  if (raw.endsWith('```')) {
    raw = raw.slice(0, -3); // Remove ```
  }
}
// ... parsing JSON
```

### Tratamento de Erros Atualizado

**Novo (Gemini-específico)**:
```javascript
if (err.message?.includes('PERMISSION_DENIED') || err.message?.includes('API key')) {
  return ApiResponse.error(res, 'Erro de autenticação com Gemini...', 500, { error: 'GEMINI_AUTH_ERROR' });
}

if (err.message?.includes('RESOURCE_EXHAUSTED') || err.status === 429) {
  return ApiResponse.error(res, 'Limite de uso do Gemini excedido...', 429, { error: 'GEMINI_QUOTA_EXCEEDED' });
}
```

---

## 📊 Comparação OpenAI vs Gemini

| Aspecto | OpenAI | Gemini 1.5 Flash |
|--------|--------|------------------|
| **Modelo** | GPT-4o-mini | Gemini 1.5 Flash |
| **Velocidade** | Rápida | ⚡ Mais rápida |
| **Custo** | Médio | Menor |
| **Token Max** | 16384 | 8000 (recomendado) |
| **JSON Response** | Nativo | Via parsing |
| **Markdown Wrapper** | Não | Às vezes |

---

## 🚀 Benefícios da Mudança

✅ **Gemini 1.5 Flash é mais rápido que GPT-4o-mini**
- Respostas mais ágeis
- Ideal para documentos jurídicos

✅ **Custo menor**
- Gemini tem pricing mais acessível

✅ **Mantém qualidade**
- Mesmos prompts funcionam
- Mesmo formato de resposta

✅ **Outras rotas não afetadas**
- Método `gerar` mantém OpenAI
- Nenhuma quebra de compatibilidade

---

## 🧪 Como Testar

### 1. Certificar que o pacote está instalado

```bash
npm list @google/generative-ai
```

Se não estiver, instalar:
```bash
npm install @google/generative-ai
```

### 2. Testar Endpoint

```bash
curl -X POST http://localhost:3002/api/ia/documento/ajustar \
  -H "Content-Type: application/json" \
  -d '{
    "html_formatado": "<html><body><p>Teste</p></body></html>",
    "prompt_usuario": "Aumente o tamanho da fonte para 18pt"
  }'
```

### 3. Verificar Logs

```
npm start
# Procure por: "Chamando Gemini para ajuste de documento"
```

### 4. Testar no Frontend

```javascript
// Em http://localhost:5173 ou seu frontend
const resultado = await fetch('http://localhost:3002/api/ia/documento/ajustar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html_formatado: "<html>...</html>",
    prompt_usuario: "Sua instrução aqui"
  })
});

const data = await resultado.json();
console.log('✅ Resultado:', data);
```

---

## 📝 Requisitos

1. **Pacote Google Generative AI** incluído no `package.json`
   ```json
   {
     "@google/generative-ai": "^0.x.x"
   }
   ```

2. **Token Gemini** já está hardcoded
   ```
   AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q
   ```

---

## 📋 Arquivos Modificados

- ✅ `src/controllers/ia.documento.controller.js`
  - Importação de Google Generative AI
  - Constructor atualizado com Gemini
  - Método `ajustar` modificado para usar Gemini
  - Erro handling específico do Gemini
  - Método `gerar` **não modificado** (mantém OpenAI)

---

## ⚠️ Notas Importantes

1. **Token está hardcoded**
   - O token Gemini está diretamente no código
   - Considerar mover para `.env` em produção por segurança
   - Por enquanto, funcionará assim

2. **Markdown wrapper**
   - Gemini às vezes envolve JSON em ```json```
   - Código detecta e remove automaticamente

3. **Compatibilidade**
   - Resposta continua sendo: `{ html_formatado, explicacao_ia }`
   - Frontend não precisa mudar nada
   - API signature mantém igual

---

## 🔄 Próximos Passos (Opcional)

### Melhoramentos Futuros

1. **Mover token para .env**
   ```env
   GEMINI_API_KEY=AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q
   ```

2. **Fazer token configurável**
   ```javascript
   const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q';
   this.gemini = new GoogleGenerativeAI(geminiKey);
   ```

3. **Adicionar suporte a trocar modelo via config**
   ```javascript
   const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
   this.geminiModel = this.gemini.getGenerativeModel({ model: modelName });
   ```

---

## ✅ Checklist de Implementação

- [x] Import do Google Generative AI adicionado
- [x] Gemini inicializado no constructor
- [x] Método `ajustar` modificado
- [x] Markdown wrapper adicionado
- [x] Error handling específico do Gemini
- [x] Método `gerar` mantém OpenAI
- [x] Logging atualizado
- [x] Documentação criada

---

## 🎯 Resultado Final

✅ **POST /api/ia/documento/ajustar** agora usa **Google Gemini 1.5 Flash**
✅ **Mais rápido** que GPT-4o-mini
✅ **Custo menor**
✅ **Compatibilidade total** com frontend
✅ **POST /api/ia/documento/gerar** continua com **OpenAI**

---

**Data**: 27 de fevereiro de 2026
**Status**: ✅ Implementado e Pronto para Testes
**Prioridade**: ⭐⭐ - Mudança de IA
