# 🔴 SOLUÇÃO IMEDIATA - CORS Bloqueado em Produção

## O Problema

Seu frontend em `http://localhost:5173` não consegue acessar `https://impulsionar-talentos-backend.onrender.com` porque CORS está bloqueado.

**Log de erro**:
```
⚠️ CORS bloqueado para origin: http://localhost:5173
❌ Erro global: Error: Não permitido pelo CORS
```

---

## Causa

Em produção (Render), a variável `CORS_ORIGIN` não está definida com `http://localhost:5173`.

---

## ✅ Solução (3 minutos)

### 1️⃣ Ir ao Render Dashboard

```
https://dashboard.render.com
```

### 2️⃣ Selecionar seu Backend

```
impulsionar-talentos-backend
```

### 3️⃣ Ir para Environment

```
Clique em "Environment Variables"
```

### 4️⃣ Procurar por `CORS_ORIGIN`

- Se **não existe**: Criar nova variável
- Se **existe**: Editar

### 5️⃣ Adicionar o Valor

```
CORS_ORIGIN=http://localhost:5173,https://seu-dominio-frontend.com
```

**OU** (para apenas desenvolvimento local):

```
CORS_ORIGIN=http://localhost:5173
```

### 6️⃣ Salvar

```
Clique em "Save"
```

### 7️⃣ Aguardar Deploy

```
Status muda para "Deploying" → "Live" (~2 minutos)
```

### 8️⃣ Limpar Cache e Testar

```
No navegador (F12):
DevTools → Application → Clear site data
Ou: Ctrl+Shift+Del
```

### 9️⃣ Fazer Requisição

```javascript
// Console do navegador em http://localhost:5173
fetch('https://impulsionar-talentos-backend.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ CORS OK!', d))
  .catch(e => console.error('❌ Errro:', e))
```

**Esperado**: ✅ Funcionar

---

## 📸 Instruções Visuais

### Tela 1: Dashboard Render

```
https://dashboard.render.com
     ↓
[impulsionar-talentos-backend]
     ↓
```

### Tela 2: Serviço

```
impulsionar-talentos-backend
├─ Overview
├─ Logs       ← Vemos os erros aqui
├─ Settings
└─ Environment   ← CLIQUE AQUI
```

### Tela 3: Environment Variables

```
[+ New Environment Variable]

Name:  CORS_ORIGIN
Value: http://localhost:5173,https://seu-site.com

[Save Changes]
```

---

## 🧪 Validar

### Verificar que foi setado

```
Render Dashboard > seu serviço > Environment
```

Procure por `CORS_ORIGIN=http://localhost:5173`

### Ver logs

```
Render Dashboard > seu serviço > Logs
```

Se vir:
```
⚠️ CORS bloqueado para origin: http://localhost:5173
```

Significa que **ainda não fez deploy**, aguarde mais 2 minutos.

Se NÃO vir mais esse erro:
```
✅ CORS está funcionando!
```

---

## 🆘 Se Ainda Não Funcionar

### Passo 1: Verificar Deploy

```
Render > seu serviço > Overview
```

Procure por:
- Status: `Live` ✅
- Deploy ID: Mude? (se mudou, novo deploy foi feito)

### Passo 2: Manual Deploy

```
Render > seu serviço > Overview
[Manual Deploy v]
> Latest Commit ← Clique
```

Vai forçar novo deploy

### Passo 3: Verificar Log de Deploy

```
Render > seu serviço > Logs
```

Procure por:
```
Build started
...
Build successful ✓
...
```

### Passo 4: Limpar Cache do Navegador

```
F12 > Application > Clear site data
```

Ou:
```
Ctrl+Shift+Del > "All time" > Clear
```

### Passo 5: Testar com cURL (não tem CORS)

```bash
curl https://impulsionar-talentos-backend.onrender.com/api/health
```

Se retornar JSON sim, backend está ok. Problema é browser.

### Passo 6: Ver erro exato no DevTools

```
F12 > Console
```

Procure por erro exato. Exemplo:

```
GET https://impulsionar-talentos-backend.onrender.com/api/health
Access to XMLHttpRequest has been blocked by CORS policy
```

---

## 📋 Checklist

- [ ] Render dashboard aberto
- [ ] Encontrei meu serviço backend
- [ ] Fui para Environment
- [ ] Criei/atualizei CORS_ORIGIN
- [ ] Incluí http://localhost:5173
- [ ] Salvei
- [ ] Deploy foi feito (status Live)
- [ ] Aguardei 2-3 minutos
- [ ] Limpei cache (Ctrl+Shift+Del)
- [ ] Testei no console
- [ ] ✅ Funcionando!

---

## 📚 Referência: Valores Comuns

### Para Testar Localmente (Dev)

```
CORS_ORIGIN=http://localhost:5173
```

### Para Produção

```
CORS_ORIGIN=https://seu-dominio.com,https://www.seu-dominio.com
```

### Para Staging + Produção

```
CORS_ORIGIN=https://seu-dominio.com,https://staging.seu-dominio.com
```

### Para Múltiplos Frontends

```
CORS_ORIGIN=https://site1.com,https://site2.com,https://admin.seu-dominio.com
```

### Para Teste Local Contra Produção

```
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://seu-dominio.com
```

---

## 💡 Dicas

1. **Separar por vírgula, sem espaços extras**
   ```
   ✅ http://localhost:5173,https://seu-site.com
   ❌ http://localhost:5173 , https://seu-site.com (espaços extras!)
   ```

2. **Usar https em produção**
   ```
   ✅ https://seu-site.com
   ❌ http://seu-site.com (inseguro)
   ```

3. **Não usar * em produção**
   ```
   ❌ CORS_ORIGIN=* (perigoso!)
   ```

4. **Fazer teste de debug via cURL primeiro**
   ```bash
   curl https://impulsionar-talentos-backend.onrender.com/api/health
   ```
   Se funciona via cURL, problema é CORS do navegador.

---

## 🎯 Próximo Passo

1. Vá ao Render agora
2. Configure `CORS_ORIGIN`
3. Aguarde deploy
4. Teste
5. Volte aqui se tiver dúvidas ✅

---

**Tempo estimado**: 5 minutos
**Dificuldade**: Fácil ⭐
**Prioridade**: 🔴 ALTA - Bloqueia uso
