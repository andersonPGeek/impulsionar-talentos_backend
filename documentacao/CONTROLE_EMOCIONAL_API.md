# API de Controle Emocional / Check-in de Bem-estar

Esta documentação descreve a API relacionada ao monitoramento do bem-estar emocional dos usuários da plataforma Impulsionar Talentos.

## Base URL

```
http://localhost:3002/api/controle-emocional
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header `Authorization`.

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Registrar Check-in Emocional

Registra ou atualiza o check-in emocional do dia para um usuário. Se já existe um registro para hoje, ele é atualizado; caso contrário, um novo é criado.

**Endpoint:** `POST /api/controle-emocional`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_user": 12,
  "score": 5
}
```

**Ou com motivo (se score <= 3):**
```json
{
  "id_user": 12,
  "score": 2,
  "motivo": "Motivo da baixa pontuação",
  "categoria_motivo": "categoria"
}
```

**Campos Gerados Automaticamente pelo Backend (NÃO enviar):**
- `id` ou `id_checkin` - Gerado automaticamente após inserção na tabela
- `data_checkin` - Gerado automaticamente como CURRENT_DATE
- `created_at` - Gerado automaticamente como now()
- `gerou_acao` - Definido automaticamente baseado no score

**Parâmetros:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id_user` | integer | ✅ | ID do usuário |
| `score` | integer (1-5) | ✅ | Nota de bem-estar de 1 a 5 |
| `motivo` | string | ⚠️ | Obrigatório se score <= 3 (max 500 caracteres) |
| `categoria_motivo` | string | ❌ | Categoria do motivo (max 100 caracteres) |

**Validações do Payload:**
- `id_user`: Deve ser um número inteiro positivo e existir no banco de dados
- `score`: Deve ser um número de 1 a 5
- Se `score` é 1, 2 ou 3: `motivo` é **obrigatório** e não pode ser vazio
- Se `score` é 4 ou 5: `motivo` é opcional (pode ser omitido ou enviar `null`)
- Campos opcionais podem ser omitidos ou enviados como `null`

**⚠️ IMPORTANTE - O que o Frontend NÃO deve enviar:**
- `id` ou `id_checkin` - Será gerado automaticamente pelo banco
- `data_checkin` - Será gerado automaticamente como CURRENT_DATE
- `created_at` - Será gerado automaticamente como now()
- `gerou_acao` - Será definido automaticamente pelo backend baseado no score
- Qualquer informação de ação - A ação é criada automaticamente pelo backend se score ≤ 3

**Categorias de Motivo Sugeridas:**
- `sobrecarga` - Excesso de trabalho ou responsabilidades
- `ansiedade` - Preocupações e ansiedade
- `conflito` - Conflitos interpessoais ou problemas relacionais
- `desmotivacao` - Falta de motivação ou engajamento
- `cansaço` - Fadiga física ou mental
- `duvida` - Dúvidas sobre carreira ou decisões
- `outro` - Outro motivo

**Resposta de Sucesso (201 - Novo):**
```json
{
  "success": true,
  "message": "Check-in emocional registrado com sucesso",
  "data": {
    "id": 1,
    "id_user": 12,
    "data_checkin": "2025-01-05",
    "score": 4,
    "motivo": null,
    "categoria_motivo": null,
    "gerou_acao": false,
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

**Resposta de Sucesso (200 - Atualizado):**
```json
{
  "success": true,
  "message": "Check-in emocional registrado com sucesso",
  "data": {
    "id": 1,
    "id_user": 12,
    "data_checkin": "2025-01-05",
    "score": 3,
    "motivo": "Bastante ocupado com projeto importante",
    "categoria_motivo": "sobrecarga",
    "gerou_acao": false,
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": {
    "error": "MISSING_MOTIVO",
    "message": "Motivo é obrigatório quando o score é menor ou igual a 3"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

### 2. Buscar Check-in de Hoje

Busca o check-in emocional registrado para hoje.

**Endpoint:** `GET /api/controle-emocional/:id_user/hoje`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_user` (integer): ID do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Check-in emocional de hoje",
  "data": {
    "id": 1,
    "id_user": 12,
    "data_checkin": "2025-01-05",
    "score": 4,
    "motivo": null,
    "categoria_motivo": null,
    "gerou_acao": false,
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

**Resposta quando não há check-in de hoje (404):**
```json
{
  "success": false,
  "message": {
    "error": "CHECKIN_NOT_FOUND",
    "message": "Nenhum check-in emocional registrado para hoje"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

### 3. Buscar Histórico de Check-ins

Busca o histórico de check-ins emocionais com paginação e filtros opcionais.

**Endpoint:** `GET /api/controle-emocional/:id_user/historico?limite=30&offset=0&data_inicio=2025-01-01&data_fim=2025-01-31`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_user` (integer): ID do usuário

**Query Parameters:**
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `limite` | integer | 30 | Número de registros por página (1-100) |
| `offset` | integer | 0 | Número de registros a pular |
| `data_inicio` | date | - | Data inicial (YYYY-MM-DD) |
| `data_fim` | date | - | Data final (YYYY-MM-DD) |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Histórico de check-ins emocionais",
  "data": {
    "id_user": 12,
    "total": 15,
    "limite": 30,
    "offset": 0,
    "paginas": 1,
    "registros": [
      {
        "id": 5,
        "id_user": 12,
        "data_checkin": "2025-01-05",
        "score": 4,
        "motivo": null,
        "categoria_motivo": null,
        "gerou_acao": false,
        "created_at": "2025-01-05T10:30:00.000Z"
      },
      {
        "id": 4,
        "id_user": 12,
        "data_checkin": "2025-01-04",
        "score": 2,
        "motivo": "Conflito com colega",
        "categoria_motivo": "conflito",
        "gerou_acao": true,
        "created_at": "2025-01-04T09:15:00.000Z"
      }
    ]
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

### 4. Buscar Estatísticas de Bem-estar

Busca estatísticas agregadas do bem-estar do usuário em um período.

**Endpoint:** `GET /api/controle-emocional/:id_user/estatisticas?data_inicio=2025-01-01&data_fim=2025-01-31`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_user` (integer): ID do usuário

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `data_inicio` | date | Data inicial (YYYY-MM-DD) |
| `data_fim` | date | Data final (YYYY-MM-DD) |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Estatísticas de bem-estar",
  "data": {
    "id_user": 12,
    "resumo": {
      "total_checkins": 31,
      "score_medio": 3.68,
      "score_minimo": 1,
      "score_maximo": 5,
      "dias_bom_estar": 18,
      "dias_neutro": 7,
      "dias_alerta": 6,
      "acoes_disparadas": 2
    },
    "motivos_frequentes": [
      {
        "categoria": "sobrecarga",
        "frequencia": 4
      },
      {
        "categoria": "ansiedade",
        "frequencia": 2
      },
      {
        "categoria": "cansaço",
        "frequencia": 2
      }
    ]
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

**Interpretação das Estatísticas:**
- `score_medio`: Média dos scores (0-5)
- `dias_bom_estar`: Dias com score >= 4 (verde)
- `dias_neutro`: Dias com score == 3 (amarelo)
- `dias_alerta`: Dias com score <= 2 (vermelho)
- `motivos_frequentes`: Categorias de motivos mais comuns (apenas scores <= 3)

---

### 5. Atualizar Check-in Emocional

Atualiza um check-in emocional existente.

**Endpoint:** `PUT /api/controle-emocional/:id_checkin`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_checkin` (integer): ID do check-in (obtido da resposta do POST)

**Body - Exatamente o JSON que o Frontend DEVE Enviar:**
```json
{
  "score": 2,
  "motivo": "Conflito com colega",
  "categoria_motivo": "conflito"
}
```

**⚠️ NÃO enviar:**
- `id_checkin` (já está na URL)
- `id_user` (não pode ser alterado)
- `data_checkin` (permanece original)
- `created_at` (permanece original)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Check-in emocional atualizado com sucesso",
  "data": {
    "id": 4,
    "id_user": 12,
    "data_checkin": "2025-01-04",
    "score": 2,
    "motivo": "Conflito com colega",
    "categoria_motivo": "conflito",
    "gerou_acao": false,
    "created_at": "2025-01-04T09:15:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

## Estrutura dos Dados

### Tabela: `checkin_emocional`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT | ID único do check-in |
| `id_user` | BIGINT | ID do usuário (FK) |
| `data_checkin` | DATE | Data do check-in (padrão: hoje) |
| `score` | SMALLINT | Score de 1 a 5 |
| `motivo` | TEXT | Descrição do motivo (se score <= 3) |
| `categoria_motivo` | VARCHAR(100) | Categoria estruturada do motivo |
| `gerou_acao` | BOOLEAN | Indica se gerou ação (padrão: false) |
| `created_at` | TIMESTAMP | Data de criação |

### Constraints

- **Unique:** (id_user, data_checkin) - Apenas um check-in por usuário por dia
- **Check:** score BETWEEN 1 AND 5
- **FK:** id_user referencia usuarios(id) com ON DELETE CASCADE

---

## Validações

### Check-in Emocional

1. **Score:**
   - Obrigatório
   - Deve ser um número entre 1 e 5

2. **Motivo:**
   - Obrigatório se score <= 3
   - Máximo 500 caracteres
   - Mínimo 1 caractere (não pode ser vazio)

3. **Categoria do Motivo:**
   - Opcional
   - Máximo 100 caracteres
   - Valores sugeridos: `sobrecarga`, `ansiedade`, `conflito`, `desmotivacao`, `cansaço`, `duvida`, `outro`

4. **Regra de Negócio:**
   - Um check-in por usuário por dia
   - Se já existe um registro para hoje, é atualizado
   - Se não existe, um novo é criado

---

## Exemplos de Uso

### Exemplo 1: Registrar Check-in (Bem-estar Alto - sem motivo)

**Frontend envia apenas:**
```bash
curl -X POST "http://localhost:3002/api/controle-emocional" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_user": 12,
    "score": 5
  }'
```

**Backend retorna com IDs e datas geradas automaticamente**

### Exemplo 2: Registrar Check-in (Bem-estar Baixo)

**Frontend envia:**
```bash
curl -X POST "http://localhost:3002/api/controle-emocional" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_user": 12,
    "score": 2,
    "motivo": "Bastante cansado, muitos deadlines próximos",
    "categoria_motivo": "cansaço"
  }'
```

**Backend:**
1. Cria o check-in (gera id, data_checkin, created_at)
2. Detecta score 2 <= 3
3. Cria ação automática com tipo='chat_agente_ia' e prioridade='urgente'
4. Retorna check-in + ação com todos os IDs e datas gerados

### Exemplo 3: Buscar Check-in de Hoje

```bash
curl -X GET "http://localhost:3002/api/controle-emocional/12/hoje" \
  -H "Authorization: Bearer <token>"
```

### Exemplo 4: Buscar Histórico com Filtros

```bash
curl -X GET "http://localhost:3002/api/controle-emocional/12/historico?limite=10&offset=0&data_inicio=2025-01-01&data_fim=2025-01-31" \
  -H "Authorization: Bearer <token>"
```

### Exemplo 5: Buscar Estatísticas

```bash
curl -X GET "http://localhost:3002/api/controle-emocional/12/estatisticas?data_inicio=2024-12-01&data_fim=2025-01-31" \
  -H "Authorization: Bearer <token>"
```

### Exemplo 6: Atualizar Check-in

```bash
curl -X PUT "http://localhost:3002/api/controle-emocional/4" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "score": 3,
    "motivo": "Resolveu o conflito, estou melhor",
    "categoria_motivo": null
  }'
```

---

## Troubleshooting - Erros Comuns

### Erro 400 ao registrar check-in

**Problema:** Recebe erro 400 quando tenta registrar um novo check-in

**Possíveis causas:**

1. **Faltando `id_user`:**
   ```json
   // ❌ ERRADO
   {
     "score": 4
   }
   ```
   Solução: Sempre incluir `id_user` no body
   ```json
   // ✅ CORRETO
   {
     "id_user": 12,
     "score": 4
   }
   ```

2. **Score fora do intervalo:**
   ```json
   // ❌ ERRADO
   {
     "id_user": 12,
     "score": 6  // score deve ser 1-5
   }
   ```
   Solução: Usar valor entre 1 e 5

3. **Motivo obrigatório faltando (score <= 3):**
   ```json
   // ❌ ERRADO - score = 2, sem motivo
   {
     "id_user": 12,
     "score": 2
   }
   ```
   Solução: Adicionar motivo quando score é <= 3
   ```json
   // ✅ CORRETO
   {
     "id_user": 12,
     "score": 2,
     "motivo": "Motivo aqui",
     "categoria_motivo": "cansaço"
   }
   ```

4. **Motivo null com score baixo:**
   ```json
   // ❌ ERRADO
   {
     "id_user": 12,
     "score": 2,
     "motivo": null  // motivo é obrigatório quando score <= 3
   }
   ```
   Solução: Enviar motivo preenchido quando score <= 3
   ```json
   // ✅ CORRETO
   {
     "id_user": 12,
     "score": 2,
     "motivo": "Cansaço extremo",
     "categoria_motivo": "cansaço"
   }
   ```

5. **Motivo vazio (string branca) com score baixo:**
   ```json
   // ❌ ERRADO
   {
     "id_user": 12,
     "score": 2,
     "motivo": "   "  // só espaços em branco
   }
   ```
   Solução: Motivo não pode conter apenas espaços
   ```json
   // ✅ CORRETO
   {
     "id_user": 12,
     "score": 2,
     "motivo": "Cansado de muito trabalho"
   }
   ```

5. **Enviando `null` para campos opcionais com score alto (score > 3):**
   ```json
   // ✅ CORRETO - Pode enviar null para score > 3
   {
     "id_user": 12,
     "score": 5,
     "motivo": null,
     "categoria_motivo": null
   }
   ```
   
   ```json
   // ✅ TAMBÉM CORRETO - Pode omitir os campos para score > 3
   {
     "id_user": 12,
     "score": 5
   }
   ```

### Erro 400 - Usuário não encontrado

**Problema:** `id_user` não existe no banco de dados

```json
{
  "success": false,
  "message": {
    "error": "INVALID_USER_ID",
    "message": "Usuário não encontrado"
  }
}
```

Solução: Verificar se o `id_user` existe na tabela `usuarios`

### Erro 404 - Nenhum check-in de hoje

**Problema:** Ao buscar o check-in de hoje, retorna 404

```bash
GET /api/controle-emocional/12/hoje
```

Significa que ainda não foi registrado nenhum check-in para hoje. Registre um novo com:

```bash
POST /api/controle-emocional
```

---

| Código | HTTP | Descrição |
|--------|------|-----------|
| `INVALID_USER_ID` | 400 | ID do usuário inválido ou não fornecido |
| `INVALID_SCORE` | 400 | Score inválido (deve ser 1-5) |
| `MISSING_MOTIVO` | 400 | Motivo obrigatório quando score <= 3 |
| `INVALID_CHECKIN_ID` | 400 | ID do check-in inválido |
| `CHECKIN_NOT_FOUND` | 404 | Check-in não encontrado |
| `DUPLICATE_CHECKIN` | 400 | Já existe um check-in para este usuário hoje |
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |

---

## Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso (GET, PUT) |
| 201 | Criado com sucesso (POST) |
| 400 | Erro de validação ou dados inválidos |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## Notas Importantes

1. **Check-in Único por Dia:** Apenas um check-in é permitido por usuário por dia. Múltiplas tentativas no mesmo dia atualizam o existente.

2. **Motivo Obrigatório APENAS para Score Baixo:** 
   - Se o score for 1, 2 ou 3: motivo é obrigatório
   - Se o score for 4 ou 5: motivo é opcional
   
   **Comportamento com score >= 4:**
   - Você pode omitir `motivo` e `categoria_motivo`
   - Você pode enviar `null` para `motivo` e `categoria_motivo`
   - Ambos são aceitos e armazenados como NULL no banco

3. **Categorias de Motivo:** As categorias sugeridas são para organizar dados e análises. Você pode usar valores diferentes se necessário.

4. **Histórico e Estatísticas:** 
   - O histórico retorna em ordem DESC (mais recentes primeiro)
   - As estatísticas consideram apenas check-ins no período especificado
   - Se nenhum período é especificado, considera todos os registros

5. **Ações Disparadas:** O campo `gerou_acao` pode ser usado por processos internos para indicar se alguma ação (ex: alerta RH, mentoria) foi disparada com base no check-in.

6. **Dados Sensíveis:** Os dados de bem-estar são sensíveis e devem ser tratados com confidencialidade. Apenas o usuário e administradores autorizados devem acessar.

---

## Integração com Outros Módulos

### Com Sistema de RH
- Alertas quando múltiplos usuários têm scores baixos
- Identificação de padrões de bem-estar por departamento

### Com Sistema de Mentoria
- Recomendação de mentoria quando bem-estar está baixo
- Histórico para acompanhamento de progresso

### Com Dashboard Executivo
- Visualização de tendências de bem-estar
- Relatórios de satisfação e engajamento

---

## Segurança

- Todas as rotas requerem autenticação JWT
- Usuários só podem acessar seus próprios check-ins
- Admins podem acessar todos os check-ins
- Dados sensíveis são tratados com confidencialidade
