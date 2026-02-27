# 🔓 Como Adicionar Novos Domínios ao CORS

## Cenários Comuns

### Cenário 1: Adicionar novo domínio local (ex: app.local:3000)

**Arquivo**: `.env`

```env
CORS_ORIGIN=http://localhost:8080,http://localhost:3000,http://localhost:5173,http://app.local:3000
```

Reinicie o servidor:
```bash
npm start
```

---

### Cenário 2: Adicionar domínio em produção

**Variável de Ambiente** (no servidor de produção):

```
CORS_ORIGIN=https://seu-site.com,https://www.seu-site.com,https://admin.seu-site.com
NODE_ENV=production
```

---

### Cenário 3: Múltiplos ambientes (staging + produção)

**Desenvolvimento** (`.env`):
```env
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080,http://localhost:3000,http://localhost:5173
```

**Staging** (Render/servidor staging):
```
NODE_ENV=production
CORS_ORIGIN=https://staging.seu-site.com
```

**Produção** (Render/servidor principal):
```
NODE_ENV=production
CORS_ORIGIN=https://seu-site.com,https://www.seu-site.com
```

---

## ⚠️ Boas Práticas

### ✅ DO (Faça):

```env
# ✅ Adicionar https em produção
CORS_ORIGIN=https://seu-site.com

# ✅ Separar com vírgula
CORS_ORIGIN=https://site1.com,https://site2.com

# ✅ Usar NODE_ENV=production
NODE_ENV=production
```

### ❌ DON'T (Não faça):

```env
# ❌ Não usar localhost em produção
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000

# ❌ Não usar * em produção (permite qualquer origem)
CORS_ORIGIN=*

# ❌ Não deixar em desenvolvimento acidentalmente
NODE_ENV=development  # Segurança reduzida
```

---

## 🔍 Verificar Configuração Atual

### No Terminal

```bash
# Ver variáveis de ambiente
grep CORS_ORIGIN .env
grep NODE_ENV .env
```

### No Código

Arquivo: `src/config/environment.js`

```javascript
// Linha atual (default)
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'];
```

---

## 🧪 Testar Novo Domínio

### Via cURL

```bash
curl -i -X OPTIONS http://localhost:3002/api/health \
  -H "Origin: http://seu-novo-dominio.com" \
  -H "Access-Control-Request-Method: GET"
```

**Esperado**: Response header inclui:
```
Access-Control-Allow-Origin: http://seu-novo-dominio.com
```

### Via Script

```bash
node scripts/test-cors.js
```

---

## 📱 Adição em Tempo Real (Desenvolvimento)

Em desenvolvimento, você **não precisa** adicionar explicitamente à `CORS_ORIGIN` se usar `localhost`:

```javascript
// Automático em desenvolvimento (src/config/environment.js)
if (process.env.NODE_ENV === 'development') {
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return callback(null, true);  // ✅ Permitido
  }
}
```

**Exemplo**: Todos funcionam em `NODE_ENV=development`:
- http://localhost:3000
- http://localhost:5173
- http://localhost:8000
- http://127.0.0.1:5173

---

## 🚀 Para Produção: Passo a Passo

### 1. Preparar lista de domínios

```env
CORS_ORIGIN=https://seu-site.com,https://www.seu-site.com
NODE_ENV=production
```

### 2. Fazer deploy

```bash
git add .env
git commit -m "Update CORS_ORIGIN for production"
git push origin main
```

(O Render automaticamente detecta e redeploy)

### 3. Validar

```bash
# Do seu frontend em produção
fetch('https://api.seu-site.com/api/health', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('✅ Funcionando', data))
.catch(err => console.error('❌ CORS Error:', err))
```

---

## 🔐 Middleware CORS Customizado (Avançado)

Se precisar de lógica mais complexa, editar `src/config/environment.js`:

```javascript
cors: {
  origin: function (origin, callback) {
    // Sua lógica customizada
    if (origin === 'https://seu-site.com') {
      return callback(null, true);
    }
    
    // Verificar em banco de dados, etc.
    return callback(new Error('CORS bloqueado'));
  }
}
```

---

## ❓ FAQ

**P: Preciso remover CORS após adicionar?**
A: Não, uma vez adicionado, permanece até ser removido manualmente.

**P: Posso usar subdominios com *?**
A: Não, CORS não suporta wildcards em domínios. Use cada um explicitamente.

**P: Qual é o impacto de desempenho?**
A: Negligenciável, CORS é aplicado apenas no header da requisição.

**P: CORS bloqueia dados confidenciais?**
A: Não, é apenas validação de origem. Use JWT/Auth para dados sensíveis.

---

## 📋 Checklist para Adicionar Novo Domínio

- [ ] Definir domínio exato (com protocolo: http ou https)
- [ ] Adicionar a `CORS_ORIGIN` em `.env`
- [ ] Separar com vírgula (sem espaços extras)
- [ ] Reiniciar servidor
- [ ] Limpar cache do navegador
- [ ] Testar com script ou cURL
- [ ] Verificar DevTools > Network > Headers
- [ ] Confirmar `Access-Control-Allow-Origin` na resposta

---

**Última atualização**: 27 de fevereiro de 2026
**Referência**: [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
