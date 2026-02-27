# ⚠️ SOLUÇÃO: Erro 404 - Modelo Gemini Não Disponível

## 🔴 Problema Identificado

A chave de API `AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q` não tem acesso ao modelo `gemini-1.5-flash`.

O erro específico:
```
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta, 
or is not supported for generateContent.
```

---

## ✅ SOLUÇÕES

### Opção 1: Obter Nova Chave de API do Google AI Studio (RECOMENDADO)

1. Acesse: https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key" (Criar Chave de API)
4. Copie a chave gerada (nova chave terá acesso aos modelos atuais)
5. Substitua a chave no `ia.documento.controller.js` (linha 111):

```javascript
this.gemini = new GoogleGenerativeAI('SUA_NOVA_CHAVE_AQUI');
```

6. Reinicie o servidor

---

### Opção 2: Usar modelo alternativo que pode estar disponível

Se você não conseguir obter uma nova chave, tente usar um modelo mais antigo disponível.

No arquivo `ia.documento.controller.js`, linha 112, mude de:
```javascript
this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

Para uma das alternativas abaixo (teste uma por vez):

```javascript
// Tentar em ordem:
this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
// ou
this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
// ou
this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

---

### Opção 3: Usar API Key do Google Cloud Console (Para Produção)

1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto ou selecione um existente
3. Vá em "APIs & Services" > "Credentials"
4. Crie uma chave de API (Application Default Credentials)
5. Habilite a API "Generative Language API"
6. Use a nova chave

---

### Opção 4: Voltar para OpenAI (Fallback)

Se preferir evitar o Gemini por enquanto, você pode:

1. Manter OpenAI para o `ajustar` também
2. Remover as linhas de inicialização do Gemini
3. Usar o `this.openai` para ambos os endpoints

---

## 🔍 Diagnóstico Executado

Todos os testes realizados falharam:
- ❌ `gemini-1.5-flash` - API v1beta: 404 Not Found
- ❌ `gemini-1.5-flash-latest` - 404 Not Found  
- ❌ `gemini-pro` - 404 Not Found
- ❌ `gemini-2.0-flash` - 404 Not Found
- ✅ Chave de API: Formato válido (39 caracteres)
- ✅ SDK @google/generative-ai instalado: v0.24.1

---

## 📝 Próximos Passos (Por Ordem de Recomendação)

### PASSO 1: Obter Nova Chave (Mais Rápido)
```bash
# Visite: https://aistudio.google.com/app/apikey
# Copie a nova chave e substitua no código
```

### PASSO 2: Atualizar o código com a nova chave
```javascript
// Em src/controllers/ia.documento.controller.js, linha 111
this.gemini = new GoogleGenerativeAI('SUA_NOVA_CHAVE_OBTIDA_DO_GOOGLE_AI_STUDIO');
```

### PASSO 3: Reiniciar o servidor
```bash
npm start
```

### PASSO 4: Testar a nova chave
```bash
curl -X POST http://localhost:3002/api/ia/documento/ajustar \
  -H "Content-Type: application/json" \
  -d '{
    "html_formatado": "<html><body><p>Teste</p></body></html>",
    "conteudo_texto": "Teste",
    "prompt_usuario": "Remova a tag <p>"
  }'
```

---

## 💡 Se Continuar com Erro 404

1. Verifique se não há espaços em branco na chave de API
2. Confirme que está usando a chave CORRETA do Google AI Studio
3. Tente limpar cache e reinstalar:

```bash
rm -r node_modules package-lock.json
npm install
npm start
```

4. Se ainda falhar, considere usar a chave de um projeto Google Cloud com Generative Language API habilitada

---

## ⚠️ Importante

**NÃO compartilhe sua chave de API em repositórios públicos!**

Coloque a chave em um arquivo `.env`:

```bash
# .env
GOOGLE_GENERATIVE_AI_KEY=sua_chave_aqui
```

Depois atualize o código:

```javascript
this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);
```
