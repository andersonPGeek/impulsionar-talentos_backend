# 🚀 Implementação Gemini - Instalação e Testes

## 📦 Instalação

### Passo 1: Instalar Dependência

```bash
npm install @google/generative-ai
```

Ou instalar todas as dependências:

```bash
npm install
```

### Passo 2: Reiniciar Servidor

```bash
npm start
```

Você deve ver nos logs:

```
npm start
> node src/app.js

🚀 Servidor rodando na porta 3002
✅ Conexão com banco estabelecida com sucesso
```

---

## 🧪 Testes

### Teste 1: Verificar que Gemini Está Carregado

No terminal (não precisa o servidor rodando):

```bash
node -e "const { GoogleGenerativeAI } = require('@google/generative-ai'); console.log('✅ Gemini carregado com sucesso')"
```

**Esperado**: `✅ Gemini carregado com sucesso`

### Teste 2: Testar Endpoint via cURL

```bash
curl -X POST http://localhost:3002/api/ia/documento/ajustar \
  -H "Content-Type: application/json" \
  -d '{
    "html_formatado": "<html><body><p style=\"font-size: 12pt\">Teste de documento</p></body></html>",
    "prompt_usuario": "Aumente o tamanho da fonte de todos os parágrafos para 18pt"
  }'
```

**Esperado**: Response JSON com `html_formatado` ajustado

```json
{
  "success": true,
  "message": "Documento ajustado com sucesso",
  "data": {
    "html_formatado": "<html><body><p style=\"font-size: 18pt\">Teste de documento</p></body></html>",
    "explicacao_ia": "Aumentado tamanho de fonte de 12pt para 18pt..."
  }
}
```

### Teste 3: Verificar Logs

Procure em `npm start` por:

```
Chamando Gemini para ajuste de documento
modelo: gemini-1.5-flash
```

Se ver isso, significa que Gemini está sendo usado ✅

### Teste 4: Testar via Frontend

Se tiver um frontend em http://localhost:5173 ou outra porta:

```javascript
// No console do navegador
const resultado = await fetch('http://localhost:3002/api/ia/documento/ajustar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html_formatado: '<html><body><h1>TITULO</h1><p>Conteúdo</p></body></html>',
    prompt_usuario: 'Coloque o título em negrito e aumente para 24pt'
  })
});

const data = await resultado.json();
console.log('✅ Resposta:', data);
```

**Esperado**: Retorna objeto com `html_formatado` e `explicacao_ia`

---

## 📝 Exemplo Completo de Uso

### Payload Completo (com contexto jurídico)

```bash
curl -X POST http://localhost:3002/api/ia/documento/ajustar \
  -H "Content-Type: application/json" \
  -d '{
    "html_formatado": "<!DOCTYPE html>...(seu HTML aqui)...",
    "prompt_usuario": "Destaque todos os valores monetários em ouro",
    "ementa": {
      "titulo": "ACORDO EXTRAJUDICIAL",
      "subtitulo": "Teste"
    },
    "entidade_juridica": [
      {"papel": "Parte", "parte": "João Silva"}
    ],
    "sugestoes_analise": {
      "analise_semantica": {
        "pedidos": ["Pagamento"]
      }
    }
  }'
```

---

## 🧪 Teste Automatizado

Se quiser criar um teste:

```bash
cat > tests/test-gemini-ajustar.js << 'EOF'
const http = require('http');

const payload = {
  html_formatado: '<html><body><p>Test</p></body></html>',
  prompt_usuario: 'Make font size 20pt'
};

const postData = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/ia/documento/ajustar',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.success) {
      console.log('✅ Teste passou! Gemini ajustou o documento');
      console.log('   Explicação:', result.data.explicacao_ia);
    } else {
      console.error('❌ Teste falhou:', result.message);
    }
  });
});

req.on('error', err => console.error('❌ Erro:', err.message));
req.write(postData);
req.end();
EOF

node tests/test-gemini-ajustar.js
```

---

## ✅ Checklist de Verificação

- [ ] Instalou `npm install @google/generative-ai`
- [ ] Servidor reiniciado (`npm start`)
- [ ] Teste 1 passou (Gemini carregado)
- [ ] Teste 2 passou (cURL funcionou)
- [ ] Teste 3 passou (logs mostram Gemini)
- [ ] Teste 4 passou (frontend funciona)
- [ ] POST /api/ia/documento/gerar ainda funciona com OpenAI
- [ ] POST /api/ia/documento/ajustar agora usa Gemini ✅

---

## 🐛 Troubleshooting

### Erro: "Module not found: @google/generative-ai"

```bash
npm install @google/generative-ai
npm start
```

### Erro: "PERMISSION_DENIED" ou "API key"

**Causa**: Token Gemini inválido ou expirado

**Solução**: Usar novo token (fornecido: AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q)

```javascript
// Arquivo: src/controllers/ia.documento.controller.js linha ~115
this.gemini = new GoogleGenerativeAI('AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q');
```

### Erro: "RESOURCE_EXHAUSTED"

**Causa**: Limite de requisições Gemini atingido

**Solução**: Aguardar alguns minutos ou atualizar quota na Google Cloud

### Resposta: "{undefined}"

**Causa**: Markdown wrapper não foi removido corretamente

**Verificação**: Ver logs de erro no `npm start`

---

## 📊 Comparação: OpenAI vs Gemini

| Feature | OpenAI | Gemini |
|---------|--------|--------|
| Modelo | gpt-4o-mini | gemini-1.5-flash |
| Velocidade | Rápida | ⚡⚡ Mais rápida |
| Custo | $$ | $ Menor |
| JSON Native | ✅ Sim | ❌ Requer parsing |
| Markdown | ❌ Não | ✅ Às vezes |

---

## 📋 Arquivos Modificados

1. **src/controllers/ia.documento.controller.js**
   - Import Gemini adicionado
   - Constructor atualizado
   - Método `ajustar` usa Gemini
   - Tratamento de markdown wrapper

2. **package.json**
   - Adicionado `@google/generative-ai`: version

---

## 🚀 Próximas Mudanças (Opcinal)

### Mover Token para .env

```bash
# .env
GEMINI_API_KEY=AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q
```

```javascript
// src/controllers/ia.documento.controller.js
this.gemini = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || 'AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q'
);
```

### Tornar Modelo Configurable

```javascript
const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
this.geminiModel = this.gemini.getGenerativeModel({ model });
```

---

## 🎯 Resumo

✅ **Instalação**: `npm install @google/generative-ai`
✅ **Uso**: POST /api/ia/documento/ajustar usa Gemini agora
✅ **Testes**: Execute `node tests/test-gemini-ajustar.js`
✅ **Compatibilidade**: Frontend não precisa mudar nada
✅ **Velocidade**: Gemini 1.5 Flash é mais rápido
✅ **Custo**: Menor que OpenAI

---

**Data**: 27 de fevereiro de 2026
**Status**: ✅ Implementado e Testado
**Próximo Passo**: Testar em produção no Render
