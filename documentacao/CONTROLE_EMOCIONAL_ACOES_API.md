# API de Controle Emocional - Ações e Profissionais

Este documento descreve a expansão da API de Controle Emocional para incluir registro automático de ações e gerenciamento de profissionais de saúde mental.

## Base URL

```
http://localhost:3002/api/controle-emocional
```

---

## Estrutura dos Dados

### Tabela: `checkin_acao`

Registra automaticamente ações relacionadas a check-ins com scores baixos (≤3).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT | ID único da ação |
| `id_checkin` | BIGINT | ID do check-in (FK) |
| `id_user` | BIGINT | ID do usuário (FK) |
| `tipo_acao` | TEXT | Tipo de ação: `alerta_gestor`, `chat_agente_ia`, `encaminhamento_profissional`, `nenhuma` |
| `prioridade` | TEXT | Prioridade: `normal` (score=3), `urgente` (score≤2) |
| `id_gestor` | BIGINT | ID do gestor responsável (FK opcional) |
| `id_profissional` | BIGINT | ID do profissional encaminhado (FK opcional) |
| `status` | TEXT | Status: `pendente`, `em_andamento`, `concluida`, `cancelada` |
| `observacoes` | TEXT | Observações adicionais |
| `created_at` | TIMESTAMP | Data de criação |
| `resolved_at` | TIMESTAMP | Data de resolução |

### Tabela: `profissionais_saude_mental`

Cadastro de profissionais de saúde mental disponíveis para encaminhamento.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT | ID único do profissional |
| `nome` | TEXT | Nome completo do profissional |
| `tipo_profissional` | TEXT | Tipo: `psicologo`, `psiquiatra`, `terapeuta` |
| `crp_ou_registro` | TEXT | CRP/CRPB ou número de registro (único) |
| `especialidades` | TEXT | Lista de especialidades (ex: ansiedade, depressão) |
| `telefone` | TEXT | Telefone de contato |
| `email` | TEXT | Email de contato |
| `foto_url` | TEXT | URL da foto de perfil |
| `atende_online` | BOOLEAN | Se atende online (padrão: true) |
| `atende_presencial` | BOOLEAN | Se atende presencial (padrão: false) |
| `cidade` | TEXT | Cidade de atuação |
| `estado` | TEXT | Estado (sigla) |
| `valor_sessao` | NUMERIC(10,2) | Valor da sessão em reais |
| `ativo` | BOOLEAN | Se está ativo (padrão: true) |
| `created_at` | TIMESTAMP | Data de criação |

---

## Alterações na API Existente

### 1. POST /api/controle-emocional (Registrar Check-in)

Agora retorna informações da ação criada automaticamente quando score ≤ 3.

**Body - O que o Frontend DEVE Enviar:**
```json
{
  "id_user": 12,
  "score": 2,
  "motivo": "Cansaço extremo",
  "categoria_motivo": "cansaço"
}
```

**Campos Gerados Automaticamente pelo Backend (NÃO enviar):**
- `id` ou `id_checkin` - Gerado automaticamente após inserção
- `data_checkin` - Gerado automaticamente (CURRENT_DATE)
- `created_at` - Gerado automaticamente (now())
- `gerou_acao` - Definido automaticamente baseado no score
- Ação completa: `id`, `created_at`, `resolved_at` - Tudo gerado automaticamente

**Resposta de Sucesso (201 - Novo Check-in com Ação):**
```json
{
  "success": true,
  "message": "Check-in emocional registrado com sucesso",
  "data": {
    "id": 1,
    "id_user": 12,
    "score": 2,
    "motivo": "Cansaço extremo",
    "categoria_motivo": "cansaço",
    "acao": {
      "tipo_acao": "chat_agente_ia",
      "prioridade": "urgente",
      "status": "pendente",
      "observacoes": null,
      "resolved_at": null
    },
  }
}
```

**Lógica de Criação Automática:**
- Score = 1 ou 2: `tipo_acao = 'chat_agente_ia'`, `prioridade = 'urgente'`
- Score = 3: `tipo_acao = 'alerta_gestor'`, `prioridade = 'normal'`
- Score >= 4: Nenhuma ação criada

---

## Endpoints de Profissionais de Saúde Mental

### 1. Criar Profissional

**Endpoint:** `POST /api/controle-emocional/profissionais`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nome": "Dr. João Silva",
  "tipo_profissional": "psicologo",
  "crp_ou_registro": "CRP/SP 01234/2020",
  "especialidades": "Ansiedade, Depressão, Burnout",
  "telefone": "(11) 98765-4321",
  "email": "joao@example.com",
  "foto_url": "https://example.com/fotos/joao.jpg",
  "atende_online": true,
  "atende_presencial": false,
  "cidade": "São Paulo",
  "estado": "SP",
  "valor_sessao": 150.00
}
```

**Parâmetros:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nome` | string | ✅ | Nome completo (max 255 caracteres) |
| `tipo_profissional` | string | ✅ | `psicologo`, `psiquiatra` ou `terapeuta` |
| `crp_ou_registro` | string | ✅ | Número de registro único (max 50 caracteres) |
| `especialidades` | string | ❌ | Lista de especialidades (max 500 caracteres) |
| `telefone` | string | ❌ | Telefone (max 20 caracteres) |
| `email` | string | ❌ | Email válido |
| `foto_url` | string | ❌ | URL da foto (max 500 caracteres) |
| `atende_online` | boolean | ❌ | Padrão: true |
| `atende_presencial` | boolean | ❌ | Padrão: false |
| `cidade` | string | ❌ | Cidade (max 100 caracteres) |
| `estado` | string | ❌ | Sigla do estado (2 caracteres) |
| `valor_sessao` | decimal | ❌ | Valor em reais (até 2 casas decimais) |

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Profissional criado com sucesso",
  "data": {
    "id": 1,
    "nome": "Dr. João Silva",
    "tipo_profissional": "psicologo",
    "crp_ou_registro": "CRP/SP 01234/2020",
    "especialidades": "Ansiedade, Depressão, Burnout",
    "telefone": "(11) 98765-4321",
    "email": "joao@example.com",
    "foto_url": "https://example.com/fotos/joao.jpg",
    "atende_online": true,
    "atende_presencial": false,
    "cidade": "São Paulo",
    "estado": "SP",
    "valor_sessao": 150.00,
    "ativo": true,
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

**Resposta de Erro (400 - CRP já registrado):**
```json
{
  "success": false,
  "message": {
    "error": "DUPLICATE_REGISTRO",
    "message": "Já existe um profissional com este CRP/Registro"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

### 2. Listar Profissionais

**Endpoint:** `GET /api/controle-emocional/profissionais?tipo_profissional=psicologo&atende_online=true&limite=30&offset=0`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `tipo_profissional` | string | - | Filtrar por: `psicologo`, `psiquiatra`, `terapeuta` |
| `ativo` | boolean | true | Filtrar por status ativo |
| `atende_online` | boolean | - | Filtrar se atende online |
| `atende_presencial` | boolean | - | Filtrar se atende presencial |
| `limite` | integer | 30 | Número de registros por página (1-100) |
| `offset` | integer | 0 | Número de registros a pular |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Profissionais encontrados",
  "data": {
    "total": 15,
    "limite": 30,
    "offset": 0,
    "paginas": 1,
    "registros": [
      {
        "id": 1,
        "nome": "Dr. João Silva",
        "tipo_profissional": "psicologo",
        "crp_ou_registro": "CRP/SP 01234/2020",
        "especialidades": "Ansiedade, Depressão, Burnout",
        "telefone": "(11) 98765-4321",
        "email": "joao@example.com",
        "foto_url": "https://example.com/fotos/joao.jpg",
        "atende_online": true,
        "atende_presencial": false,
        "cidade": "São Paulo",
        "estado": "SP",
        "valor_sessao": 150.00,
        "ativo": true,
        "created_at": "2025-01-05T10:30:00.000Z"
      }
    ]
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

### 3. Buscar Profissional por ID

**Endpoint:** `GET /api/controle-emocional/profissionais/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id` (integer): ID do profissional

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Profissional encontrado",
  "data": {
    "id": 1,
    "nome": "Dr. João Silva",
    "tipo_profissional": "psicologo",
    "crp_ou_registro": "CRP/SP 01234/2020",
    "especialidades": "Ansiedade, Depressão, Burnout",
    "telefone": "(11) 98765-4321",
    "email": "joao@example.com",
    "foto_url": "https://example.com/fotos/joao.jpg",
    "atende_online": true,
    "atende_presencial": false,
    "cidade": "São Paulo",
    "estado": "SP",
    "valor_sessao": 150.00,
    "ativo": true,
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "message": {
    "error": "PROFISSIONAL_NOT_FOUND",
    "message": "Profissional não encontrado"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

### 4. Atualizar Profissional

**Endpoint:** `PUT /api/controle-emocional/profissionais/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id` (integer): ID do profissional

**Body (todos os campos opcionais):**
```json
{
  "nome": "Dr. João Silva Atualizado",
  "especialidades": "Ansiedade, Depressão, Burnout, Estresse",
  "valor_sessao": 180.00,
  "ativo": true
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Profissional atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "Dr. João Silva Atualizado",
    "tipo_profissional": "psicologo",
    "crp_ou_registro": "CRP/SP 01234/2020",
    "especialidades": "Ansiedade, Depressão, Burnout, Estresse",
    "telefone": "(11) 98765-4321",
    "email": "joao@example.com",
    "foto_url": "https://example.com/fotos/joao.jpg",
    "atende_online": true,
    "atende_presencial": false,
    "cidade": "São Paulo",
    "estado": "SP",
    "valor_sessao": 180.00,
    "ativo": true,
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

### 5. Deletar Profissional

**Endpoint:** `DELETE /api/controle-emocional/profissionais/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id` (integer): ID do profissional

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Profissional deletado com sucesso",
  "data": {
    "id": 1
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

## Exemplos de Uso

### Exemplo 1: Registrar Check-in com Score Baixo (Cria Ação Automática)

**Payload do Frontend (apenas informações necessárias):**
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

**O que o Backend faz automaticamente:**
1. Gera `id` do check-in (auto-incremental)
2. Gera `data_checkin` = CURRENT_DATE
3. Gera `created_at` = now()
4. Verifica: score 2 <= 3? Sim
5. Cria ação com `tipo_acao='chat_agente_ia'` e `prioridade='urgente'`
6. Retorna check-in + ação criada

**Resposta com IDs e datas geradas:**
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
  }
}
```

### Exemplo 2: Criar Profissional de Saúde Mental

```bash
curl -X POST "http://localhost:3002/api/controle-emocional/profissionais" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "nome": "Dra. Maria Santos",
    "tipo_profissional": "psiquiatra",
    "crp_ou_registro": "CRM/SP 123456",
    "especialidades": "Depressão, Ansiedade, TDAH",
    "telefone": "(11) 99999-8888",
    "email": "maria@example.com",
    "atende_online": true,
    "atende_presencial": true,
    "cidade": "São Paulo",
    "estado": "SP",
    "valor_sessao": 300.00
  }'
```

### Exemplo 3: Buscar Psicólogos que Atendem Online

```bash
curl -X GET "http://localhost:3002/api/controle-emocional/profissionais?tipo_profissional=psicologo&atende_online=true&limite=10" \
  -H "Authorization: Bearer <token>"
```

### Exemplo 4: Atualizar Status de Ativo de um Profissional

```bash
curl -X PUT "http://localhost:3002/api/controle-emocional/profissionais/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "ativo": false
  }'
```

### Exemplo 5: Deletar Profissional

```bash
curl -X DELETE "http://localhost:3002/api/controle-emocional/profissionais/1" \
  -H "Authorization: Bearer <token>"
```

---

## Integração com Fluxos de Negócio

### Fluxo 1: Check-in com Score Baixo

1. Usuário registra check-in com score ≤ 3
2. API cria automaticamente uma ação (`checkin_acao`) com status `pendente`
3. Sistema notifica o gestor (se tipo_acao = 'alerta_gestor')
4. Sistema pode encadear chat com IA (se tipo_acao = 'chat_agente_ia')
5. Gestor ou sistema pode encaminhar para profissional (update da ação com id_profissional)

### Fluxo 2: Encaminhamento para Profissional

1. Gestor recebe alerta de check-in baixo
2. Consulta lista de profissionais disponíveis
3. Encaminha usuário para profissional específico
4. Sistema registra id_profissional na ação
5. Profissional é notificado do encaminhamento

### Fluxo 3: Estatísticas de Bem-estar com Ações

1. Dashboard executivo lista check-ins com ações associadas
2. Mostra estatísticas: total de ações, por tipo, status, etc.
3. Permite filtrar por profissional encaminhado
4. Tracks resolução de ações para acompanhamento

---

## Validações

### Profissional

1. **Nome:** Obrigatório, max 255 caracteres
2. **Tipo Profissional:** Obrigatório, valores: `psicologo`, `psiquiatra`, `terapeuta`
3. **CRP/Registro:** Obrigatório, único no banco, max 50 caracteres
4. **Email:** Se fornecido, deve ser um email válido
5. **Estado:** Se fornecido, deve ser sigla de 2 caracteres
6. **Valor Sessão:** Se fornecido, deve ser decimal com até 2 casas decimais

---

## Códigos de Erro

| Código | HTTP | Descrição |
|--------|------|-----------|
| `MISSING_NOME` | 400 | Nome é obrigatório |
| `INVALID_TIPO_PROFISSIONAL` | 400 | Tipo profissional inválido |
| `MISSING_REGISTRO` | 400 | CRP/Registro é obrigatório |
| `DUPLICATE_REGISTRO` | 400 | CRP/Registro já existe |
| `PROFISSIONAL_NOT_FOUND` | 404 | Profissional não encontrado |
| `INVALID_ID` | 400 | ID inválido |
| `INVALID_PAGINATION` | 400 | Parâmetros de paginação inválidos |
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |

---

## Segurança e Acessibilidade

- Todos os endpoints requerem autenticação JWT
- Endpoints de criação/atualização/deleção devem exigir permissão de Admin
- Dados de profissionais são públicos (podem ser listados por qualquer usuário)
- Ações são privadas (cada usuário só vê suas próprias ações)
- Dados de bem-estar são confidenciais (LGPD compliance)
