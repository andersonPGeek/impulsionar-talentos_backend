# 🔧 Guia de Resolução - CORS para localhost:5173

## ✅ Status Atual

A aplicação **já suporta** `http://localhost:5173` em CORS. Aqui está como está configurado:

### Configuração em `src/config/environment.js`:

```javascript
cors: {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'];
    
    // Em DESENVOLVIMENTO: permite todos os localhost automaticamente
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Em PRODUÇÃO: verifica lista específica
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}
```

---

## 📋 Checklist de Configuração

### ✅ Para Desenvolvimento Local

1. **Criar arquivo `.env`** (copiar de `env.example`):
   ```bash
   cp env.example .env
   ```

2. **Configurar variáveis no `.env`**:
   ```env
   NODE_ENV=development
   PORT=3002
   CORS_ORIGIN=http://localhost:8080,http://localhost:3000,http://localhost:5173
   # ... outras configurações
   ```

3. **Em desenvolvimento**, o CORS permite **automaticamente** qualquer um que venha de `localhost` ou `127.0.0.1`:
   ```javascript
   if (process.env.NODE_ENV === 'development') {
     if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
       return callback(null, true);  // ✅ Permitido
     }
   }
   ```

### ✅ Para Produção

1. **Definir variável de ambiente**:
   ```env
   NODE_ENV=production
   CORS_ORIGIN=https://seu-dominio.com,https://outro-dominio.com
   ```

2. **Em produção**, CORS é restritivo - só permite o que está em `CORS_ORIGIN`:
   ```javascript
   if (allowedOrigins.includes(origin)) {
     return callback(null, true);  // ✅ Permitido
   }
   ```

---

## 🔍 Diagnóstico de Problemas

### Problema 1: "Access to XMLHttpRequest blocked by CORS"

**Causa**: Servidor CORS configurado em produção sem `CORS_ORIGIN`

**Solução**:
```env
NODE_ENV=development  # Ou configurar CORS_ORIGIN para produção
```

### Problema 2: CORS funciona com alguns endpoints, mas não com outros

**Causa**: Alguns endpoints não têm CORS configurado

**Verificar**: Todos os endpoints usam o middleware CORS? 
```javascript
// app.js - deve estar ANTES das rotas
app.use(cors(corsOptions));
app.use('/api', apiRoutes);
```

### Problema 3: Requisições com credenciais falhando

**Causa**: Frontend não enviando credenciais ou servidor não permitindo

**Solução Frontend**:
```javascript
fetch(url, {
  method: 'POST',
  credentials: 'include',  // ✅ Incluir cookies/auth
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({...})
})
```

**Solução Backend**: (já configurado)
```javascript
credentials: true,  // ✅ Já está
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
```

### Problema 4: CORS bloqueia mesmo com localhost:5173 configurado

**Causas possíveis**:

1. **Variável de ambiente não lida**:
   ```bash
   # Verificar se o arquivo .env existe
   ls -la .env
   ```

2. **Servidor não reiniciado após alterar `.env`**:
   ```bash
   npm start  # Reiniciar servidor
   ```

3. **Cache do navegador**:
   - Abrir DevTools (F12)
   - Network → Disable cache
   - Ou usar Ctrl+Shift+R para limpar cache forçadamente

4. **NODE_ENV em produção sem CORS_ORIGIN**:
   ```bash
   # Se NODE_ENV=production, SEMPRE definir CORS_ORIGIN
   echo "NODE_ENV=development" >> .env
   ```

---

## 🧪 Testes de Verificação

### Teste 1: Verificar se CORS está funcionando

```bash
# Do terminal (não há restrição CORS sem origin)
curl -X GET http://localhost:3002/api/health
# Esperado: 200 OK

# Do navegador em http://localhost:5173
fetch('http://localhost:3002/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ CORS OK', data))
  .catch(err => console.error('❌ CORS Erro:', err))
```

### Teste 2: Verificar headers CORS

```bash
curl -i -X OPTIONS http://localhost:3002/api/health \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"
```

**Esperado**: Headers incluem `Access-Control-Allow-Origin: http://localhost:5173`

### Teste 3: Verificar logs do servidor

```bash
npm start  # Inicia com logs visíveis
# Procure por linhas como:
# "⚠️ CORS bloqueado para origin: ..." (se houver erro)
```

---

## 📝 Configuração Recomendada por Ambiente

### Desenvolvimento Local

**`.env`**:
```env
NODE_ENV=development
PORT=3002
CORS_ORIGIN=http://localhost:8080,http://localhost:3000,http://localhost:5173
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET=dev_secret_key
```

**Por quê**: Em desenvolvimento, todos os localhost são automaticamente permitidos, mas a variável deixa explícito.

### Produção

**Variáveis de Ambiente (no servidor)**:
```env
NODE_ENV=production
PORT=3002
CORS_ORIGIN=https://seu-dominio-frontend.com
DATABASE_URL=postgresql://prod_user:prod_pass@prod.db/prod_db
JWT_SECRET=prod_secret_key_muito_segura
```

**Por quê**: Em produção, você precisa ser explícito e só permitir domínios conhecidos.

### Staging

**Variáveis de Ambiente**:
```env
NODE_ENV=production
CORS_ORIGIN=https://staging-frontend.seu-dominio.com
# ... resto da config
```

---

## 🚀 Passos para Ativar CORS para localhost:5173

### 1️⃣ Criar/Atualizar `.env`

```bash
# Copiar do exemplo
cp env.example .env

# Editar e garantir:
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080,http://localhost:3000,http://localhost:5173
```

### 2️⃣ Reiniciar Servidor

```bash
# Se tiver rodando, parar com Ctrl+C
npm start
```

### 3️⃣ Limpar Cache do Navegador

```
DevTools (F12) → Application → Clear site data
Ou: Ctrl+Shift+Del → Limpar cache
```

### 4️⃣ Testar Requisição

```javascript
// No console do navegador em http://localhost:5173
fetch('http://localhost:3002/api/health', {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => console.log('✅ Funcionando!', data))
.catch(err => console.error('❌ Erro:', err))
```

### 5️⃣ Se Ainda Não Funcionar

```bash
# Verificar logs do servidor
npm start

# Em outro terminal, fazer requisição
curl -X GET http://localhost:3002/api/health

# Se funcionar via curl mas não no navegador, é CORS
# Verificar DevTools → Console para mensagem de erro exata
```

---

## 📊 Tabela de Referência Rápida

| Ambiente | NODE_ENV | CORS_ORIGIN | Localhost Automático? |
|----------|:--------:|:----------:|:-----:|
| Desenvolvimento | `development` | ✅ Qualquer local | ✅ Sim |
| Produção | `production` | ✅ Obrigatório | ❌ Não |
| Staging | `production` | ✅ Específico | ❌ Não |

---

## ❓ FAQ

**P: Por que localhost:5173 não funciona mesmo com a configuração?**
A: Provavelmente `NODE_ENV=production` sem `CORS_ORIGIN` definido. Altere para `development` no `.env`.

**P: Como testo CORS sem reimiciar o servidor?**
A: Não é possível. Reinicie com `Ctrl+C` e `npm start`.

**P: Posso usar `*` para aceitar qualquer origem?**
A: ⚠️ **Não recomendado em produção**. Use dominios específicos.

**P: CORS funciona com WebSockets?**
A: Parcialmente. WebSockets usam `origem` mas não exactamente igual. Configure origem em socket.io também.

---

## 🔗 Referências

- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [npm cors package](https://npmjs.com/package/cors)
- [Express CORS middleware](https://expressjs.com/en/resources/middleware/cors.html)

---

**Última atualização**: 27 de fevereiro de 2026
**Status**: ✅ Funcionando com localhost:5173
