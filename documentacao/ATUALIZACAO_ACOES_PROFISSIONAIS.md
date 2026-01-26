# Atualização: Ações e Profissionais de Saúde Mental

## Resumo das Mudanças

Este documento descreve as atualizações realizadas na API de Controle Emocional para incluir:

1. **Registro Automático de Ações** - Quando um check-in tem score ≤ 3
2. **Gerenciamento de Profissionais de Saúde Mental** - CRUD completo para profissionais

---

## 1. Tabelas Criadas

### `checkin_acao`
Registra automaticamente ações relacionadas a check-ins com scores baixos.

```sql
create table public.checkin_acao (
  id bigint primary key,
  id_checkin bigint not null,
  id_user bigint not null,
  tipo_acao text not null, -- 'alerta_gestor', 'chat_agente_ia', 'encaminhamento_profissional', 'nenhuma'
  prioridade text not null, -- 'normal', 'urgente'
  id_gestor bigint null,
  id_profissional bigint null,
  status text not null, -- 'pendente', 'em_andamento', 'concluida', 'cancelada'
  observacoes text null,
  created_at timestamp,
  resolved_at timestamp
);
```

### `profissionais_saude_mental`
Cadastro de profissionais de saúde mental.

```sql
create table public.profissionais_saude_mental (
  id bigint primary key,
  nome text not null,
  tipo_profissional text not null, -- 'psicologo', 'psiquiatra', 'terapeuta'
  crp_ou_registro text not null unique,
  especialidades text null,
  telefone text null,
  email text null,
  foto_url text null,
  atende_online boolean,
  atende_presencial boolean,
  cidade text null,
  estado text null,
  valor_sessao numeric,
  ativo boolean,
  created_at timestamp
);
```

---

## 2. Instalação e Configuração

### Passo 1: Criar Tabelas

Execute o script SQL:

```bash
# Usando psql
psql -h seu_host -d seu_banco -U seu_usuario -f scripts/criar_tabelas_acoes_profissionais.sql

# Ou copie e cole direto no Supabase SQL Editor
```

### Passo 2: Verificar Atualizações na Controller

A controller `controle.emocional.controller.js` foi atualizada com:

- Lógica automática de criação de ações no método `registrarCheckIn()`
- 5 novos métodos para CRUD de profissionais:
  - `criarProfissional()`
  - `buscarProfissional()`
  - `listarProfissionais()`
  - `atualizarProfissional()`
  - `deletarProfissional()`

### Passo 3: Verificar Rotas

O arquivo `controle.emocional.routes.js` foi atualizado com novos endpoints.

---

## 3. Fluxo de Criação de Ações

### Quando o Check-in é Registrado:

```
1. Usuario registra check-in
   ↓
2. API valida dados
   ↓
3. API insere check-in no banco
   ↓
4. Se score <= 3:
   ├─ Score == 1 ou 2:
   │  └─ Cria ação com tipo='chat_agente_ia' e prioridade='urgente'
   └─ Score == 3:
      └─ Cria ação com tipo='alerta_gestor' e prioridade='normal'
   ↓
5. API retorna check-in + ação criada
```

### Exemplo: Check-in com Score 2

**Request:**
```bash
curl -X POST "http://localhost:3002/api/controle-emocional" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_user": 12,
    "score": 2,
    "motivo": "Cansaço extremo",
    "categoria_motivo": "cansaço"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "Check-in emocional registrado com sucesso",
  "data": {
    "id": 1,
    "id_user": 12,
    "data_checkin": "2025-01-05",
    "score": 2,
    "motivo": "Cansaço extremo",
    "categoria_motivo": "cansaço",
    "gerou_acao": true,
    "acao": {
      "id": 5,
      "id_checkin": 1,
      "id_user": 12,
      "tipo_acao": "chat_agente_ia",
      "prioridade": "urgente",
      "status": "pendente",
      "observacoes": null,
      "created_at": "2025-01-05T10:30:00.000Z",
      "resolved_at": null
    },
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

## 4. APIs de Profissionais

### 4.1 Criar Profissional

```bash
POST /api/controle-emocional/profissionais

Body:
{
  "nome": "Dr. João Silva",
  "tipo_profissional": "psicologo",
  "crp_ou_registro": "CRP/SP 01234/2020",
  "especialidades": "Ansiedade, Depressão",
  "telefone": "(11) 98765-4321",
  "email": "joao@example.com",
  "atende_online": true,
  "atende_presencial": false,
  "cidade": "São Paulo",
  "estado": "SP",
  "valor_sessao": 150.00
}
```

### 4.2 Listar Profissionais

```bash
GET /api/controle-emocional/profissionais?tipo_profissional=psicologo&atende_online=true&limite=30&offset=0
```

**Query Parameters:**
- `tipo_profissional` - Filtrar por tipo: psicologo, psiquiatra, terapeuta
- `ativo` - Filtrar por status ativo (default: true)
- `atende_online` - Filtrar se atende online
- `atende_presencial` - Filtrar se atende presencial
- `limite` - Itens por página (default: 30)
- `offset` - Paginação (default: 0)

### 4.3 Buscar Profissional por ID

```bash
GET /api/controle-emocional/profissionais/:id
```

### 4.4 Atualizar Profissional

```bash
PUT /api/controle-emocional/profissionais/:id

Body (todos opcionais):
{
  "nome": "Dr. João Silva Atualizado",
  "especialidades": "Ansiedade, Depressão, Burnout, Estresse",
  "valor_sessao": 180.00,
  "ativo": true
}
```

### 4.5 Deletar Profissional

```bash
DELETE /api/controle-emocional/profissionais/:id
```

---

## 5. Exemplos de Casos de Uso

### Caso 1: Alerta de Bem-estar Baixo

Um usuário registra um check-in com score 2:
1. Check-in é criado
2. Ação é criada automaticamente com `tipo_acao='chat_agente_ia'` e `prioridade='urgente'`
3. Sistema pode iniciar um chat com IA para suporte imediato
4. Gestor pode consultar as ações pendentes no dashboard

### Caso 2: Encaminhamento para Profissional

1. Sistema detecta múltiplos check-ins baixos (padrão preocupante)
2. Gestor busca profissionais psicólogos disponíveis
3. Gestor atualiza a ação adicionando `id_profissional`
4. Profissional é notificado do encaminhamento
5. Ação passa para status `em_andamento`

### Caso 3: Estatísticas de Bem-estar

1. Dashboard executa queries nas tabelas:
   - `checkin_emocional` - para histórico e estatísticas
   - `checkin_acao` - para rastreamento de ações
   - `profissionais_saude_mental` - para dados dos profissionais
2. Exibe tendências de bem-estar por departamento
3. Mostra efetividade de encaminhamentos

---

## 6. Considerações de Segurança

### Permissões Recomendadas

```
GET /profissionais          → Qualquer usuário autenticado
POST /profissionais         → Admin apenas
PUT /profissionais/:id      → Admin apenas
DELETE /profissionais/:id   → Admin apenas

POST /                      → Qualquer usuário
GET /:id_user/...          → Usuário próprio ou Admin
```

### LGPD Compliance

- Dados de bem-estar são confidenciais
- Profissionais só veem ações do seu encaminhamento
- Gestor só vê ações de sua equipe
- Admin vê tudo

---

## 7. Testes

Rode o script de teste:

```bash
chmod +x tests/test-controle-emocional-completo.sh
./tests/test-controle-emocional-completo.sh
```

---

## 8. Documentação Completa

Ver arquivo [CONTROLE_EMOCIONAL_ACOES_API.md](./CONTROLE_EMOCIONAL_ACOES_API.md) para:

- Detalhes de cada endpoint
- Parâmetros completos
- Respostas de sucesso e erro
- Exemplos práticos
- Validações

---

## 9. Próximas Melhorias

- [ ] Notificações em tempo real quando ação é criada
- [ ] Integração com sistema de chat IA
- [ ] Dashboard de profissionais
- [ ] Agendamento de sessões
- [ ] Feedback pós-encaminhamento
- [ ] Análise de efetividade de profissionais

---

## 10. Suporte

Em caso de dúvidas:

1. Consulte a documentação completa em `CONTROLE_EMOCIONAL_ACOES_API.md`
2. Execute os testes para validar a implementação
3. Verifique os logs da aplicação para erros específicos

---

## Arquivos Modificados

```
src/controllers/controle.emocional.controller.js   (Atualizado)
src/routes/controle.emocional.routes.js             (Atualizado)
scripts/criar_tabelas_acoes_profissionais.sql       (Novo)
documentacao/CONTROLE_EMOCIONAL_ACOES_API.md        (Novo)
tests/test-controle-emocional-completo.sh          (Novo)
```

---

**Data de Atualização:** Janeiro 5, 2026
**Versão:** 2.0
