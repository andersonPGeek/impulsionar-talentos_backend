# API de Habilidades de Usuários

Esta documentação descreve a API relacionada ao gerenciamento de habilidades dos usuários, permitindo associar habilidades do cargo com níveis de proficiência.

## Base URL

```
http://localhost:3002/api/habilidades-usuarios
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header `Authorization`.

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Buscar Habilidades por Usuário

Busca todas as habilidades de um usuário específico, retornando sempre o registro mais recente para cada habilidade (baseado no `created_at`).

**Endpoint:** `GET /api/habilidades-usuarios/usuario/:id_usuario`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_usuario` (integer): ID do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Habilidades do usuário buscadas com sucesso",
  "data": {
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "cargo": "Desenvolvedor Full Stack"
    },
    "habilidades": [
      {
        "id": 1,
        "id_habilidade": 5,
        "titulo": "JavaScript",
        "descricao": "Linguagem de programação essencial para desenvolvimento frontend e backend",
        "nivel": 4,
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "id_habilidade": 6,
        "titulo": "React",
        "descricao": "Framework JavaScript para construção de interfaces de usuário",
        "nivel": 3,
        "created_at": "2024-01-15T11:00:00.000Z"
      }
    ],
    "total_habilidades": 2
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Resposta de Erro (400) - Usuário sem cargo:**
```json
{
  "success": false,
  "message": "Usuário não possui cargo atribuído",
  "details": {
    "error": "USER_WITHOUT_JOB"
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "message": "Usuário não encontrado",
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

---

### 2. Adicionar Habilidade de Usuário

Adiciona uma nova habilidade para um usuário. **Sempre cria um novo registro**, nunca atualiza existentes.

**Endpoint:** `POST /api/habilidades-usuarios`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "id_usuario": 1,
  "id_habilidade": 5,
  "nivel": 4
}
```

**Resposta de Sucesso (200) - Habilidade adicionada:**
```json
{
  "success": true,
  "message": "Habilidade adicionada com sucesso",
  "data": {
    "id": 3,
    "id_usuario": 1,
    "id_habilidade": 7,
    "titulo": "Node.js",
    "descricao": "Runtime JavaScript para desenvolvimento backend",
    "nivel": 3,
    "created_at": "2024-01-15T12:30:00.000Z"
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Resposta de Erro (400) - Nível inválido:**
```json
{
  "success": false,
  "message": "Nível da habilidade deve estar entre 1 e 5",
  "details": {
    "error": "INVALID_SKILL_LEVEL_RANGE"
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Resposta de Erro (404) - Habilidade não encontrada:**
```json
{
  "success": false,
  "message": "Habilidade não encontrada para o cargo do usuário",
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

---

### 3. Buscar Habilidade Específica de Usuário

Busca uma habilidade específica de um usuário, retornando sempre o registro mais recente (baseado no `created_at`).

**Endpoint:** `GET /api/habilidades-usuarios/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id` (integer): ID da habilidade do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Habilidade do usuário buscada com sucesso",
  "data": {
    "id": 1,
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "cargo": "Desenvolvedor Full Stack",
      "id_cargo": 5
    },
    "habilidade": {
      "id": 5,
      "titulo": "JavaScript",
      "descricao": "Linguagem de programação essencial para desenvolvimento frontend e backend"
    },
    "nivel": 4,
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "message": "Habilidade do usuário não encontrada",
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

---

### 4. Remover Habilidade de Usuário

Remove uma habilidade específica de um usuário.

**Endpoint:** `DELETE /api/habilidades-usuarios/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id` (integer): ID da habilidade do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Habilidade removida com sucesso",
  "data": {
    "id": 1,
    "id_usuario": 1,
    "nome_usuario": "João Silva",
    "habilidade": "JavaScript",
    "nivel_removido": 4
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "message": "Habilidade do usuário não encontrada",
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `INVALID_USER_ID` | ID do usuário inválido ou não fornecido |
| `INVALID_SKILL_ID` | ID da habilidade inválido ou não fornecido |
| `INVALID_SKILL_LEVEL` | Nível da habilidade inválido ou não fornecido |
| `INVALID_SKILL_LEVEL_RANGE` | Nível da habilidade fora do range (1-5) |
| `INVALID_ID` | ID inválido ou não fornecido |
| `USER_WITHOUT_JOB` | Usuário não possui cargo atribuído |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

## Campos de Requisição

### Adicionar/Atualizar Habilidade

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id_usuario` | integer | ID do usuário (obrigatório) |
| `id_habilidade` | integer | ID da habilidade do cargo (obrigatório) |
| `nivel` | integer | Nível de proficiência de 1 a 5 (obrigatório) |

---

## Campos de Resposta

### Usuário

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único do usuário |
| `nome` | string | Nome do usuário |
| `cargo` | string | Nome do cargo do usuário |
| `id_cargo` | integer | ID do cargo (apenas em respostas específicas) |

### Habilidade do Usuário

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único da habilidade do usuário |
| `id_habilidade` | integer | ID da habilidade no cargo |
| `titulo` | string | Nome/título da habilidade |
| `descricao` | string | Descrição da habilidade |
| `nivel` | integer | Nível de proficiência (1-5) |
| `created_at` | string | Data de criação no formato ISO 8601 |

### Lista de Habilidades

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `usuario` | object | Dados do usuário |
| `habilidades` | array[object] | Lista de habilidades do usuário |
| `total_habilidades` | integer | Quantidade total de habilidades |

---

## Validações

### Validações de Entrada

1. **ID do Usuário:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório
   - Usuário deve existir
   - Usuário deve ter cargo atribuído

2. **ID da Habilidade:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório
   - Habilidade deve existir
   - Habilidade deve pertencer ao cargo do usuário

3. **Nível da Habilidade:**
   - Deve ser um número inteiro
   - Campo obrigatório
   - Deve estar entre 1 e 5 (inclusive)

### Regras de Negócio

1. **Associação de Habilidades:**
   - Usuário só pode ter habilidades do seu cargo
   - **Sempre cria um novo registro**: POST nunca atualiza registros existentes
   - **Histórico preservado**: Todos os registros são mantidos no banco de dados
   - **GET retorna o mais recente**: Consultas sempre retornam o registro com `created_at` mais recente

2. **Níveis de Proficiência:**
   - **1**: Iniciante
   - **2**: Básico
   - **3**: Intermediário
   - **4**: Avançado
   - **5**: Especialista

3. **Integridade Referencial:**
   - Habilidades são vinculadas às habilidades do cargo
   - Usuário deve ter cargo válido
   - Habilidade deve existir no cargo do usuário

4. **Comportamento de Criação Contínua:**
   - **POST**: Sempre cria um novo registro com timestamp atual
   - **GET**: Retorna o registro mais recente (maior `created_at`)
   - **Histórico**: Todos os registros anteriores são preservados
   - **Evolução**: Permite acompanhar a evolução dos níveis ao longo do tempo

---

## Estrutura do Banco de Dados

### Tabela: `habilidades_usuarios`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT PRIMARY KEY | ID único da habilidade do usuário |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `id_habilidade` | BIGINT | ID da habilidade do cargo (FK) |
| `id_usuario` | BIGINT | ID do usuário (FK) |
| `nivel` | SMALLINT | Nível de proficiência (1-5) |

**Relacionamentos:**
- `habilidades_usuarios.id_habilidade` → `habilidades_cargo(id)` (Foreign Key)
- `habilidades_usuarios.id_usuario` → `usuarios(id)` (Foreign Key)

### Tabela: `usuarios`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT PRIMARY KEY | ID único do usuário |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `id_cliente` | BIGINT | ID do cliente (FK) |
| `nome` | TEXT | Nome do usuário |
| `cargo` | BIGINT | ID do cargo (FK) |
| `email` | TEXT | Email do usuário |
| `idade` | INTEGER | Idade do usuário |
| `data_nascimento` | TIMESTAMPTZ | Data de nascimento |
| `id_gestor` | BIGINT | ID do gestor (FK para usuarios) |
| `id_departamento` | BIGINT | ID do departamento (FK) |

### Tabela: `habilidades_cargo`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT PRIMARY KEY | ID único da habilidade |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `habilidade` | TEXT | Nome da habilidade |
| `descricao` | TEXT | Descrição da habilidade |
| `id_cargo` | BIGINT | ID do cargo (FK) |

---

## 🔄 Comportamento da API

### Operação de Criação Contínua

A API implementa uma lógica de **criação contínua**:

1. **POST**: Sempre cria um novo registro com timestamp atual
2. **GET**: Retorna o registro mais recente (maior `created_at`)
3. **Histórico**: Todos os registros anteriores são preservados
4. **Evolução**: Permite acompanhar a evolução dos níveis ao longo do tempo

### Exemplo Prático

**Primeira criação:**
```json
POST /api/habilidades-usuarios
{
  "id_usuario": 1,
  "id_habilidade": 5,
  "nivel": 3
}
```
**Resultado:** Registro criado com `id: 1, created_at: 2025-01-01 10:00:00`

**Segunda criação (mesmo usuário e habilidade):**
```json
POST /api/habilidades-usuarios
{
  "id_usuario": 1,
  "id_habilidade": 5,
  "nivel": 4
}
```
**Resultado:** Novo registro criado com `id: 2, created_at: 2025-01-01 11:00:00`

**GET /api/habilidades-usuarios/usuario/1:**
**Retorna:** Registro com `id: 2` (mais recente) para a habilidade 5

---

## Exemplos de Uso

### Exemplo 1: Buscar Habilidades de um Usuário

```bash
curl -X GET http://localhost:3002/api/habilidades-usuarios/usuario/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 2: Adicionar Nova Habilidade

```bash
curl -X POST http://localhost:3002/api/habilidades-usuarios \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "id_habilidade": 5,
    "nivel": 4
  }'
```

### Exemplo 3: Adicionar Nova Habilidade (Criação Contínua)

```bash
curl -X POST http://localhost:3002/api/habilidades-usuarios \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "id_habilidade": 5,
    "nivel": 5
  }'
```

### Exemplo 4: Buscar Habilidade Específica

```bash
curl -X GET http://localhost:3002/api/habilidades-usuarios/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 5: Remover Habilidade

```bash
curl -X DELETE http://localhost:3002/api/habilidades-usuarios/1 \
  -H "Authorization: Bearer <token>"
```

---

## Testes

Para executar os testes da API de Habilidades de Usuários:

```bash
# Executar todos os testes
node tests/test-habilidades-usuarios.js

# Ou com URL específica
API_URL=http://localhost:3002/api node tests/test-habilidades-usuarios.js
```

Os testes incluem:

**Testes CRUD:**
- ✅ Buscar habilidades por usuário (registro mais recente)
- ✅ Adicionar nova habilidade (sempre INSERT)
- ✅ Criação contínua (múltiplos POSTs)
- ✅ Buscar habilidade específica (registro mais recente)
- ✅ Remover habilidade

**Testes de Validação:**
- ✅ Usuário sem cargo (deve falhar)
- ✅ Habilidade não encontrada (deve retornar 404)
- ✅ Nível inválido (deve retornar 400)
- ✅ IDs inválidos (deve retornar 400)
- ✅ Usuário não encontrado (deve retornar 404)

---

## Notas Importantes

1. **Segurança:** Todas as operações verificam se o usuário possui cargo e se a habilidade pertence ao cargo do usuário.

2. **Integridade:** Não é possível associar habilidades que não pertencem ao cargo do usuário.

3. **Criação Contínua:** POST sempre cria novos registros, preservando histórico completo.

4. **Níveis:** Sistema de 5 níveis de proficiência (1-5).

5. **Histórico:** Todos os registros são preservados, permitindo análise de evolução.

6. **Performance:** Queries otimizadas com JOINs apropriados e LATERAL JOINs para registros mais recentes.

7. **Logs:** Todas as operações são logadas para auditoria.

8. **Relacionamentos:** Forte integridade referencial entre usuários, cargos e habilidades.

9. **Evolução:** Permite acompanhar a evolução dos níveis de habilidade ao longo do tempo.

---

## Próximas Implementações

- [ ] API para estatísticas de habilidades por usuário
- [ ] API para comparação de habilidades entre usuários
- [ ] API para histórico de evolução de habilidades
- [ ] API para recomendações de desenvolvimento
- [ ] API para relatórios de habilidades por departamento
- [ ] API para importação/exportação em massa
- [ ] API para metas de habilidades
- [ ] API para avaliações de habilidades por terceiros
- [ ] API para certificações e badges
- [ ] API para análise de gaps de habilidades


