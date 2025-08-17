# Deploy no Render - Impulsionar Talentos

Guia completo para fazer o deploy da API no Render.

## 🚀 Deploy Automático

### 1. Conectar Repositório

1. Acesse [render.com](https://render.com)
2. Faça login ou crie uma conta
3. Clique em "New +" e selecione "Web Service"
4. Conecte seu repositório GitHub/GitLab
5. Selecione o repositório `impulsionar-talentos_backend`

### 2. Configurar Serviço

Use o arquivo `render.yaml` já configurado ou configure manualmente:

**Configurações Básicas:**
- **Name**: `impulsionar-talentos-api`
- **Environment**: `Node`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Variáveis de Ambiente

Configure as seguintes variáveis no Render:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `PORT` | `10000` | Porta do servidor (Render define automaticamente) |
| `DATABASE_URL` | `sua_string_de_conexao` | URL do banco PostgreSQL |
| `JWT_SECRET` | `seu_jwt_secret` | Chave secreta para JWT |
| `JWT_EXPIRES_IN` | `24h` | Tempo de expiração do token |
| `CORS_ORIGIN` | `https://seu-frontend.onrender.com` | Origem permitida para CORS |
| `LOG_LEVEL` | `info` | Nível de log |

### 4. Banco de Dados

#### Opção 1: Banco do Render
1. Crie um novo "PostgreSQL" no Render
2. Use a string de conexão fornecida
3. Configure `DATABASE_URL` com essa string

#### Opção 2: Supabase (Recomendado)
1. Use seu banco Supabase existente
2. Configure `DATABASE_URL` com a string do Supabase

### 5. Deploy

1. Clique em "Create Web Service"
2. Aguarde o build e deploy
3. O serviço estará disponível em: `https://impulsionar-talentos-backend.onrender.com`

## 🔧 Configurações Avançadas

### Health Check

O Render usa automaticamente o endpoint `/health` para verificar se o serviço está funcionando.

### Auto Deploy

O serviço está configurado para fazer deploy automático quando houver push para a branch `main`.

### Logs

Acesse os logs em tempo real no painel do Render:
- Build logs
- Runtime logs
- Error logs

## 🧪 Testando o Deploy

### 1. Health Check
```bash
curl https://impulsionar-talentos-backend.onrender.com/health
```

### 2. Teste da API
```bash
curl https://impulsionar-talentos-backend.onrender.com/api/test
```

### 3. Teste de Autenticação
```bash
curl -X POST https://impulsionar-talentos-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@exemplo.com", "senha": "Senha123"}'
```

## 🔒 Segurança

### Variáveis Sensíveis
- `JWT_SECRET`: Use uma string aleatória forte
- `DATABASE_URL`: Mantenha segura
- `CORS_ORIGIN`: Configure apenas as origens necessárias

## 🛠️ Troubleshooting

### Erro: ENETUNREACH - Conexão com Banco

**Sintomas:**
```
❌ Tentativa 1/5 falhou: connect ENETUNREACH 2600:1f1e:75b:4b03:7946:9ca4:235b:4ef7:5432
```

**Causa:**
O erro `ENETUNREACH` com endereço IPv6 indica problemas de conectividade entre o Render e o Supabase via IPv6.

**Soluções Implementadas:**

1. **Forçar IPv4**
   - ✅ Configuração DNS para preferir IPv4
   - ✅ Configuração manual do host para evitar resolução IPv6
   - ✅ Configuração específica para produção

2. **Configuração SSL Otimizada**
   - ✅ SSL com `rejectUnauthorized: false`
   - ✅ `sslmode: 'require'` para Supabase
   - ✅ Timeout aumentado para 15s

3. **Configuração Manual**
   - ✅ Usar parâmetros individuais em vez de string de conexão
   - ✅ Evitar problemas de parse da URL
   - ✅ Configuração específica para Render

4. **Logs Melhorados**
   - ✅ Logs detalhados para debug
   - ✅ Código de erro exibido
   - ✅ Dicas de troubleshooting

**Status:** ✅ **RESOLVIDO** - O projeto agora usa o pooler do Supabase que funciona no Render

### Solução Implementada

O problema foi resolvido usando o **pooler do Supabase** em vez da conexão direta:

1. **Pooler do Supabase** - `aws-0-sa-east-1.pooler.supabase.com:6543`
2. **Credenciais específicas** - `postgres.eyyaxdotkcwzogtksnol` / `c2y4cbH0oFgYZkzJ`
3. **Configuração SSL correta** - `sslmode: 'require'` para pooler
4. **Configuração condicional** - Pooler para produção, conexão direta para desenvolvimento

### Por que o Pooler Resolve o Problema?

O erro `ENETUNREACH` com IPv6 ocorria porque:

- **Conexão direta** (`db.fdopxrrcvbzhwszsluwm.supabase.co:5432`) usa IPv6
- **Pooler do Supabase** (`aws-0-sa-east-1.pooler.supabase.com:6543`) usa IPv4
- **Render** tem problemas de conectividade IPv6 com Supabase
- **Pooler** é otimizado para conexões externas e funciona perfeitamente

### Diferenças de Configuração

| Aspecto | Conexão Direta | Pooler |
|---------|----------------|--------|
| **Host** | `db.fdopxrrcvbzhwszsluwm.supabase.co` | `aws-0-sa-east-1.pooler.supabase.com` |
| **Porta** | `5432` | `6543` |
| **Usuário** | `postgres` | `postgres.eyyaxdotkcwzogtksnol` |
| **SSL** | `rejectUnauthorized: false` | `sslmode: 'require'` |
| **IPv6** | ❌ Problemas | ✅ IPv4 apenas |

### Erro: Build Failed

**Soluções:**
1. Verifique se todas as dependências estão no `package.json`
2. Confirme que o `start` script está correto
3. Verifique os logs de build no Render

### Erro: Health Check Failed

**Soluções:**
1. Verifique se o endpoint `/health` está funcionando
2. Confirme que a porta está correta
3. Verifique se o servidor está iniciando corretamente

### SSL
O Render fornece SSL automático para todos os serviços.

## 📊 Monitoramento

### Métricas Disponíveis
- Uptime
- Response time
- Error rate
- CPU/Memory usage

### Alertas
Configure alertas para:
- Serviço down
- High error rate
- High response time

## 🚨 Troubleshooting

### Problemas Comuns

1. **Build falha**
   - Verifique se todas as dependências estão no `package.json`
   - Confirme se o `start` script está correto

2. **Erro de conexão com banco**
   - Verifique se `DATABASE_URL` está correta
   - Confirme se o banco aceita conexões externas

3. **Erro de CORS**
   - Configure `CORS_ORIGIN` corretamente
   - Verifique se o frontend está na origem permitida

4. **Serviço não inicia**
   - Verifique os logs no painel do Render
   - Confirme se a porta está configurada corretamente

### Logs Úteis

```bash
# Ver logs em tempo real
# Acesse o painel do Render > Seu Serviço > Logs
```

## 🔄 Atualizações

### Deploy Manual
1. Faça push para a branch `main`
2. O Render fará deploy automático
3. Monitore os logs

### Rollback
1. Vá para "Deploys" no painel
2. Selecione uma versão anterior
3. Clique em "Rollback"

## 📞 Suporte

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Status Page**: [status.render.com](https://status.render.com)
- **Community**: [community.render.com](https://community.render.com) 