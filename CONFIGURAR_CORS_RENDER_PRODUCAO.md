# 🚀 Configurar CORS no Render (Produção)

## 🔴 Problema Detectado

Em produção (Render), o CORS está bloqueando:
- ❌ `http://localhost:5173` (seu frontend em desenvolvimento local)
- ❌ Qualquer frontend que não esteja na lista `CORS_ORIGIN`

**Erro**: `Error: Não permitido pelo CORS` na linha 44 de `environment.js`

---

## ✅ Solução Rápida

### Passo 1: Acessar Dashboard Render

1. Vá para [render.com](https://render.com)
2. Clique no seu serviço `impulsionar-talentos-backend`
3. Vá para **Environment** → **Environment Variables**

### Passo 2: Adicionar/Atualizar Variável

**Opção A: Para permitir testes locais contra produção**

```
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://localhost:8080,https://seu-dominio-frontend.com
```

**Opção B: Apenas domínios de produção (mais seguro)**

```
CORS_ORIGIN=https://seu-dominio-frontend.com,https://www.seu-dominio-frontend.com
```

**Opção C: Deixar vazio (usa defaults)**

```
# Deixar em branco a variável CORS_ORIGIN
# O sistema usará: http://localhost:8080,http://localhost:3000,http://localhost:3002,http://localhost:5173
```

### Passo 3: Salvar e Fazer Deploy

1. Clique **Save**
2. Render automaticamente fará redeploy
3. Aguarde ~2 minutos
4. Tente acessar novamente

---

## 🎯 Recomendações por Cenário

### Cenário 1: Frontend Local em Testes contra Produção

**Variável no Render**:
```
CORS_ORIGIN=http://localhost:5173
```

**Quando usar**: Apenas durante desenvolvimento/debug

**⚠️ Risco**: Qualquer um em localhost:5173 consegue acessar

---

### Cenário 2: Frontend em Produção Separado

**Variável no Render**:
```
CORS_ORIGIN=https://seu-site.com,https://app.seu-site.com,https://admin.seu-site.com
```

**Quando usar**: Em produção real

**✅ Seguro**: Só permite domínios conhecidos

---

### Cenário 3: Multiple Ambientes (Staging + Produção)

**Para Backend em Produção**:
```
CORS_ORIGIN=https://seu-site.com,https://staging.seu-site.com
```

**Para Backend em Staging** (serviço diferente no Render):
```
CORS_ORIGIN=https://staging.seu-site.com,http://localhost:5173
```

---

## 📋 Passo a Passo Detalhado

### 1. Entrar no Render

```
https://dashboard.render.com
```

### 2. Selecionar Serviço

- Procure por `impulsionar-talentos-backend`
- Clique nele

### 3. Ir para Environment

```
impulsionar-talentos-backend > Environment
```

### 4. Verificar Variáveis Atuais

Procure por:
- `NODE_ENV` (deve ser `production`)
- `CORS_ORIGIN` (pode estar vazio ou não configurado)

### 5. Adicionar/Atualizar CORS_ORIGIN

```
Key: CORS_ORIGIN
Value: http://localhost:5173,https://seu-site.com
```

### 6. Salvar

Clique em **Save Changes**

### 7. Aguardar Deploy

Status muda para **Deploying** → **Live**

---

## 🧪 Testar Após Configurar

### Via Frontend Local

```javascript
// No console em http://localhost:5173
fetch('https://impulsionar-talentos-backend.onrender.com/api/health', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('✅ CORS OK', d))
.catch(e => console.error('❌ CORS Error', e))
```

### Via cURL

```bash
curl -i -X OPTIONS https://impulsionar-talentos-backend.onrender.com/api/health \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"
```

**Esperado**: Response incluir header:
```
Access-Control-Allow-Origin: http://localhost:5173
```

---

## 🔍 Verificar Logs

### Ver Logs no Render

1. Dashboard → Seu serviço
2. Aba **Logs**
3. Procure por:
   ```
   ⚠️ CORS bloqueado para origin:
   ```

Se ver essa mensagem, significa que:
- A origin não está na lista `CORS_ORIGIN`
- `NODE_ENV` está `production`
- Precisa adicionar a origin

---

## 🛠️ Modificação no Código (Alternativa)

Se não quiser usar variáveis de ambiente, editar `src/config/environment.js`:

```javascript
cors: {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Permitir localmente em produção? (porte para debug)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);  // CUIDADO: Diminui segurança!
    }
    
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : [];
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    console.warn(`⚠️ CORS bloqueado: ${origin}`);
    return callback(new Error('CORS bloqueado'));
  },
  // ...
}
```

**⚠️ Não recomendado**: Diminui segurança em produção!

---

## ✅ Checklist

- [ ] Acessei dashboard.render.com
- [ ] Encontrei serviço `impulsionar-talentos-backend`
- [ ] Fui para aba **Environment**
- [ ] Adicionei/Atualizei `CORS_ORIGIN`
- [ ] Incluí `http://localhost:5173` (se for testar local) OU domínios reais
- [ ] Cliquei **Save Changes**
- [ ] Aguardei deploy (~2 minutos)
- [ ] Testar frontend local contra produção

---

## 🆘 Se Ainda Não Funcionar

### Debug 1: Verificar se variável foi setada

```
Render Dashboard → seu serviço → Environment
```

Confirmar que `CORS_ORIGIN` está visível e correto

### Debug 2: Verificar NODE_ENV

```
NODE_ENV deve ser: production
```

### Debug 3: Ver logs recentes

```
Render Dashboard → seu serviço → Logs
```

Procurar por última vez que fez requisição

### Debug 4: Forçar redeploy

```
Render Dashboard → seu serviço → Manual Deploy
```

### Debug 5: Limpar cache

```
DevTools (F12) → Application → Clear site data
Ou: Ctrl+Shift+Del → Limpar cache
```

---

## 📚 Referência Rápida

| Variável | Valor | Efeito |
|----------|-------|--------|
| `NODE_ENV` | `production` | CORS restritivo |
| `CORS_ORIGIN` | não definido | Usa defaults (inclui localhost:5173) |
| `CORS_ORIGIN` | `http://localhost:5173` | Permite apenas localhost:5173 |
| `CORS_ORIGIN` | `https://seu-site.com` | Permite apenas seu-site.com |
| `CORS_ORIGIN` | url1,url2,url3 | Permite múltiplos |

---

## 🎓 Conceitos

**CORS (Cross-Origin Resource Sharing)**:
- Mecanismo de segurança do navegador
- Bloqueia requisições de domínios não autorizados
- Configuração do servidor define quem pode acessar

**Origin**:
- Combinação: `protocolo + domínio + porta`
- Exemplos:
  - `http://localhost:5173`
  - `https://seu-site.com`
  - `https://api.seu-site.com:8443`

**Em Desenvolvimento**:
- `localhost` geralmente permitido automaticamente
- Flexível para testes

**Em Produção**:
- Apenas domínios específicos permitidos
- Mais seguro, menos flexível

---

**Última atualização**: 27 de fevereiro de 2026
**Prioridade**: 🔴 ALTA - Bloqueia acesso em produção
