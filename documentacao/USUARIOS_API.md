# API Usuários

Esta documentação descreve as APIs relacionadas ao gerenciamento de usuários.

## Base URL

```
http://localhost:3002/api/usuarios
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header `Authorization`.

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Buscar Usuários por Email e Cliente

Busca usuários que tenham email similar ao informado e pertençam ao cliente especificado.

**Endpoint:** `GET /api/usuarios/buscar`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da Query:**
- `email` (string): Email para busca (usando LIKE)
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuários buscados com sucesso",
  "data": {
    "email": "joao",
    "id_cliente": 1,
    "usuarios": [
      {
        "id": 2,
        "nome": "João Silva",
        "email": "joao@empresa.com"
      },
      {
        "id": 5,
        "nome": "João Santos",
        "email": "joao.santos@empresa.com"
      }
    ]
  }
}
```

**Resposta quando não há usuários (200):**
```json
{
  "success": true,
  "message": "Nenhum usuário encontrado para os critérios informados",
  "data": {
    "email": "inexistente",
    "id_cliente": 1,
    "usuarios": []
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "MISSING_EMAIL",
  "message": "Email é obrigatório"
}
```

```json
{
  "success": false,
  "error": "INVALID_CLIENT_ID",
  "message": "ID do cliente é obrigatório e deve ser um número válido"
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `MISSING_EMAIL` | Email não fornecido ou vazio |
| `INVALID_CLIENT_ID` | ID do cliente inválido ou não fornecido |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

### 2. Buscar Usuários por Gestor

Busca todos os usuários que têm um gestor específico.

**Endpoint:** `GET /api/usuarios/gestor/:id_gestor`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_gestor` (integer): ID do gestor

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuários buscados com sucesso",
  "data": {
    "gestor_id": 1,
    "usuarios": [
      {
        "id": 2,
        "nome": "João Silva",
        "cargo": "Desenvolvedor",
        "email": "joao@empresa.com",
        "idade": 28,
        "data_nascimento": "1995-05-15T00:00:00.000Z",
        "id_cliente": 1,
        "id_departamento": 1,
        "departamento_nome": "Tecnologia",
        "perfil_acesso": 2,
        "perfil_acesso_nome": "Colaborador"
      },
      {
        "id": 3,
        "nome": "Maria Santos",
        "cargo": "Analista",
        "email": "maria@empresa.com",
        "idade": 32,
        "data_nascimento": "1991-08-22T00:00:00.000Z",
        "id_cliente": 1,
        "id_departamento": 2,
        "departamento_nome": "Recursos Humanos",
        "perfil_acesso": 2,
        "perfil_acesso_nome": "Colaborador"
      }
    ]
  }
}
```

**Resposta quando não há usuários (200):**
```json
{
  "success": true,
  "message": "Nenhum usuário encontrado para este gestor",
  "data": {
    "gestor_id": 1,
    "usuarios": []
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_GESTOR_ID",
  "message": "ID do gestor é obrigatório e deve ser um número válido"
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_GESTOR_ID` | ID do gestor inválido ou não fornecido |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

### 3. Buscar Dashboard do Usuário

Busca informações consolidadas do dashboard de um usuário específico, incluindo árvore da vida, metas e análise SWOT.

**Endpoint:** `GET /api/usuarios/dashboard/:id_usuario`

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
  "message": "Dashboard do usuário buscado com sucesso",
  "data": {
    "usuario_id": 1,
    "arvore_da_vida": "8/10",
    "metas_concluidas": 3,
    "metas_pendentes": 2,
    "minhas_metas": [
      {
        "id": 1,
        "titulo_meta": "Desenvolvimento Profissional",
        "prazo": "2025-12-31",
        "porcentagem_conclusao": 75
      },
      {
        "id": 2,
        "titulo_meta": "Certificação AWS",
        "prazo": "2025-11-30",
        "porcentagem_conclusao": 100
      },
      {
        "id": 3,
        "titulo_meta": "Liderança de Equipe",
        "prazo": "2025-10-15",
        "porcentagem_conclusao": 25
      }
    ],
    "analise_swot": {
      "fortalezas": [
        "Boa comunicação",
        "Conhecimento técnico sólido",
        "Proatividade"
      ],
      "fraquezas": [
        "Gestão de tempo",
        "Apresentações públicas"
      ],
      "oportunidades": [
        "Curso de liderança disponível",
        "Projeto internacional em andamento"
      ],
      "ameacas": [
        "Concorrência no mercado",
        "Mudanças tecnológicas rápidas"
      ]
    }
  }
}
```

**Resposta quando usuário não tem dados (200):**
```json
{
  "success": true,
  "message": "Dashboard do usuário buscado com sucesso",
  "data": {
    "usuario_id": 1,
    "arvore_da_vida": "0/10",
    "metas_concluidas": 0,
    "metas_pendentes": 0,
    "minhas_metas": [],
    "analise_swot": {
      "fortalezas": [],
      "fraquezas": [],
      "oportunidades": [],
      "ameacas": []
    }
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_USER_ID",
  "message": "ID do usuário é obrigatório e deve ser um número válido"
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_USER_ID` | ID do usuário inválido ou não fornecido |
| `INTERNAL_ERROR` | Erro interno do servidor |

**Campos de Resposta:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `usuario_id` | integer | ID do usuário consultado |
| `arvore_da_vida` | string | Pontuação geral da árvore da vida no formato "X/10" |
| `metas_concluidas` | integer | Quantidade de metas com status "Concluida" |
| `metas_pendentes` | integer | Quantidade de metas que não estão "Concluida" |
| `minhas_metas` | array | Array de metas do usuário |
| `analise_swot` | object | Análise SWOT do usuário |

**Campos da Meta:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único da meta |
| `titulo_meta` | string | Título da meta |
| `prazo` | string/null | Data de vencimento da meta (formato: YYYY-MM-DD) |
| `porcentagem_conclusao` | integer | Percentual de conclusão baseado nas atividades (0-100) |

**Campos da Análise SWOT:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `fortalezas` | array[string] | Lista de fortalezas do usuário |
| `fraquezas` | array[string] | Lista de fraquezas do usuário |
| `oportunidades` | array[string] | Lista de oportunidades identificadas |
| `ameacas` | array[string] | Lista de ameaças identificadas |

---

### 4. Criar Usuário

Cria um novo usuário para um cliente específico.

**Endpoint:** `POST /api/usuarios/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parâmetros da URL:**
- `id_cliente` (integer): ID do cliente

**Corpo da Requisição:**
```json
{
  "nome": "João Silva",
  "email": "joao.silva@empresa.com",
  "senha": "minhasenha123",
  "cargo": 5,
  "perfil_acesso": 2,
  "idade": 28,
  "data_nascimento": "1995-05-15T00:00:00.000Z",
  "id_gestor": 1,
  "id_departamento": 3
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id": 15,
    "nome": "João Silva",
    "email": "joao.silva@empresa.com",
    "id_cliente": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (400) - Email Duplicado:**
```json
{
  "success": false,
  "error": "EMAIL_ALREADY_EXISTS",
  "message": "Já existe um usuário com este email"
}
```

**Resposta de Erro (400) - Dados Inválidos:**
```json
{
  "success": false,
  "error": "INVALID_NAME",
  "message": "Nome é obrigatório"
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_CLIENT_ID` | ID do cliente inválido ou não fornecido |
| `INVALID_NAME` | Nome não fornecido ou vazio |
| `INVALID_EMAIL` | Email não fornecido ou vazio |
| `INVALID_EMAIL_FORMAT` | Formato de email inválido |
| `INVALID_PASSWORD` | Senha não fornecida ou vazia |
| `INVALID_CARGO_ID` | ID do cargo inválido |
| `INVALID_PERFIL_ACESSO_ID` | ID do perfil de acesso inválido |
| `INVALID_GESTOR_ID` | ID do gestor inválido |
| `INVALID_DEPARTAMENTO_ID` | ID do departamento inválido |
| `INVALID_AGE` | Idade inválida (deve estar entre 0 e 120) |
| `EMAIL_ALREADY_EXISTS` | Email já cadastrado |
| `CLIENT_NOT_FOUND` | Cliente não encontrado |
| `CARGO_NOT_FOUND` | Cargo não encontrado para este cliente |
| `DEPARTAMENTO_NOT_FOUND` | Departamento não encontrado para este cliente |
| `PERFIL_NOT_FOUND` | Perfil de acesso não encontrado |
| `GESTOR_NOT_FOUND` | Gestor não encontrado para este cliente |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

### 5. Buscar Usuários por Cliente

Busca todos os usuários de um cliente específico com informações detalhadas.

**Endpoint:** `GET /api/usuarios/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuários buscados com sucesso",
  "data": {
    "cliente_id": 1,
    "usuarios": [
      {
        "id": 2,
        "nome": "João Silva",
        "email": "joao.silva@empresa.com",
        "idade": 28,
        "data_nascimento": "1995-05-15T00:00:00.000Z",
        "id_cliente": 1,
        "id_departamento": 3,
        "departamento_nome": "Tecnologia",
        "id_gestor": 1,
        "gestor_nome": "Maria Santos",
        "perfil_acesso": 2,
        "perfil_acesso_nome": "Colaborador",
        "cargo": 5,
        "nome_cargo": "Desenvolvedor Sênior",
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 3,
        "nome": "Pedro Costa",
        "email": "pedro.costa@empresa.com",
        "idade": 32,
        "data_nascimento": "1991-08-22T00:00:00.000Z",
        "id_cliente": 1,
        "id_departamento": 2,
        "departamento_nome": "Marketing",
        "id_gestor": 1,
        "gestor_nome": "Maria Santos",
        "perfil_acesso": 2,
        "perfil_acesso_nome": "Colaborador",
        "cargo": 8,
        "nome_cargo": "Analista de Marketing",
        "created_at": "2024-01-10T14:20:00.000Z"
      }
    ]
  }
}
```

**Resposta quando não há usuários (200):**
```json
{
  "success": true,
  "message": "Nenhum usuário encontrado para este cliente",
  "data": {
    "cliente_id": 1,
    "usuarios": []
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_CLIENT_ID",
  "message": "ID do cliente é obrigatório e deve ser um número válido"
}
```

**Campos de Resposta do Usuário:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único do usuário |
| `nome` | string | Nome completo do usuário |
| `email` | string | Email do usuário |
| `idade` | integer/null | Idade do usuário |
| `data_nascimento` | string/null | Data de nascimento no formato ISO 8601 |
| `id_cliente` | integer | ID do cliente proprietário |
| `id_departamento` | integer/null | ID do departamento |
| `departamento_nome` | string/null | Nome do departamento |
| `id_gestor` | integer/null | ID do gestor |
| `gestor_nome` | string/null | Nome do gestor |
| `perfil_acesso` | integer/null | ID do perfil de acesso |
| `perfil_acesso_nome` | string/null | Nome do perfil de acesso |
| `cargo` | integer/null | ID do cargo |
| `nome_cargo` | string/null | Nome do cargo |
| `created_at` | string | Data de criação no formato ISO 8601 |

---

### 6. Buscar Usuários sem Gestor

Busca todos os usuários de um cliente que não possuem gestor atribuído (id_gestor is null).

**Endpoint:** `GET /api/usuarios/sem-gestor/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuários sem gestor buscados com sucesso",
  "data": {
    "cliente_id": 1,
    "usuarios": [
      {
        "id": 2,
        "nome_usuario": "João Silva",
        "nome_gestor": null,
        "nome_departamento": "Tecnologia"
      },
      {
        "id": 5,
        "nome_usuario": "Ana Costa",
        "nome_gestor": null,
        "nome_departamento": "Recursos Humanos"
      }
    ]
  }
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_CLIENT_ID` | ID do cliente inválido ou não fornecido |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

### 7. Buscar Usuários com Gestor

Busca todos os usuários de um cliente que possuem gestor atribuído (id_gestor is not null).

**Endpoint:** `GET /api/usuarios/com-gestor/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuários com gestor buscados com sucesso",
  "data": {
    "cliente_id": 1,
    "usuarios": [
      {
        "id": 3,
        "nome_usuario": "Pedro Santos",
        "nome_gestor": "Maria Oliveira",
        "nome_departamento": "Vendas"
      },
      {
        "id": 4,
        "nome_usuario": "Carlos Lima",
        "nome_gestor": "João Silva",
        "nome_departamento": "Marketing"
      }
    ]
  }
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_CLIENT_ID` | ID do cliente inválido ou não fornecido |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

### 8. Remover Gestor de Usuário

Remove o gestor de um usuário específico, definindo id_gestor como NULL.

**Endpoint:** `PUT /api/usuarios/:id_usuario/remover-gestor/:id_usuario_gestor`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_usuario` (integer): ID do usuário
- `id_usuario_gestor` (integer): ID do gestor atual (para validação)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Gestor removido do usuário com sucesso",
  "data": {
    "usuario_id": 3,
    "nome_usuario": "Pedro Santos",
    "id_gestor": null
  }
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "USER_GESTOR_NOT_FOUND",
  "message": "Usuário não encontrado ou não possui o gestor especificado"
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_USER_ID` | ID do usuário inválido ou não fornecido |
| `INVALID_GESTOR_ID` | ID do gestor inválido ou não fornecido |
| `USER_GESTOR_NOT_FOUND` | Usuário não encontrado ou não possui o gestor especificado |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

### 9. Atribuir Gestor a Usuário

Atribui um gestor a um usuário específico, atualizando o campo id_gestor.

**Endpoint:** `PUT /api/usuarios/:id_usuario/atribuir-gestor/:id_usuario_gestor`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_usuario` (integer): ID do usuário
- `id_usuario_gestor` (integer): ID do usuário que será o gestor

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Gestor atribuído ao usuário com sucesso",
  "data": {
    "usuario_id": 3,
    "nome_usuario": "Pedro Santos",
    "id_gestor": 1,
    "nome_gestor": "Maria Oliveira"
  }
}
```

**Resposta de Erro (400) - Auto-atribuição:**
```json
{
  "success": false,
  "error": "SELF_ASSIGNMENT",
  "message": "Um usuário não pode ser gestor de si mesmo"
}
```

**Resposta de Erro (400) - Clientes diferentes:**
```json
{
  "success": false,
  "error": "DIFFERENT_CLIENTS",
  "message": "Usuário e gestor devem pertencer ao mesmo cliente"
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_USER_ID` | ID do usuário inválido ou não fornecido |
| `INVALID_GESTOR_ID` | ID do gestor inválido ou não fornecido |
| `USER_NOT_FOUND` | Usuário não encontrado |
| `GESTOR_NOT_FOUND` | Gestor não encontrado |
| `DIFFERENT_CLIENTS` | Usuário e gestor pertencem a clientes diferentes |
| `SELF_ASSIGNMENT` | Tentativa de auto-atribuição como gestor |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

### 10. Buscar Todos os Usuários por Cliente

Busca todos os usuários de um cliente que possuem perfil de acesso = 1.

**Endpoint:** `GET /api/usuarios/all-usuarios/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuários buscados com sucesso",
  "data": {
    "cliente_id": 1,
    "usuarios": [
      {
        "id": 2,
        "nome": "João Silva",
        "email": "joao.silva@empresa.com",
        "departamento": "Tecnologia"
      },
      {
        "id": 5,
        "nome": "Ana Costa",
        "email": "ana.costa@empresa.com",
        "departamento": "Recursos Humanos"
      }
    ]
  }
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_CLIENT_ID` | ID do cliente inválido ou não fornecido |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

### 11. Buscar Todos os Gestores por Cliente

Busca todos os gestores de um cliente que possuem perfil de acesso 2 ou 3.

**Endpoint:** `GET /api/usuarios/all-gestores/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Gestores buscados com sucesso",
  "data": {
    "cliente_id": 1,
    "gestores": [
      {
        "id": 1,
        "nome": "Maria Oliveira",
        "email": "maria.oliveira@empresa.com",
        "titulo_departamento": "Gerência Geral"
      },
      {
        "id": 3,
        "nome": "Pedro Santos",
        "email": "pedro.santos@empresa.com",
        "titulo_departamento": "Vendas"
      }
    ]
  }
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_CLIENT_ID` | ID do cliente inválido ou não fornecido |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

## Validações

### Validações de Entrada

1. **ID do Cliente:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório

2. **Nome:**
   - Deve ser uma string não vazia
   - Espaços em branco no início e fim são removidos automaticamente
   - Campo obrigatório

3. **Email:**
   - Deve ser uma string não vazia
   - Deve seguir formato de email válido (user@domain.com)
   - Deve ser único no sistema (case-insensitive)
   - Convertido automaticamente para minúsculas
   - Campo obrigatório

4. **Senha:**
   - Deve ser uma string não vazia
   - Campo obrigatório
   - **Nota:** Em produção, deve ser hash da senha

5. **Idade:**
   - Deve ser um número inteiro entre 0 e 120
   - Campo opcional

6. **IDs de Relacionamento:**
   - **Cargo:** Deve existir na tabela `cargo` e pertencer ao cliente
   - **Departamento:** Deve existir na tabela `departamento` e pertencer ao cliente
   - **Gestor:** Deve existir na tabela `usuarios` e pertencer ao mesmo cliente
   - **Perfil de Acesso:** Deve existir na tabela `perfil_usuario`
   - Todos os IDs de relacionamento são opcionais

7. **Data de Nascimento:**
   - Deve estar no formato ISO 8601 (YYYY-MM-DDTHH:MM:SS.sssZ)
   - Campo opcional

---

## Estrutura do Banco de Dados

### Tabela: `usuarios`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do usuário |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `id_cliente` | INT8 | ID do cliente |
| `nome` | TEXT | Nome do usuário |
| `cargo` | TEXT | Cargo do usuário |
| `perfil_acesso` | INT8 | ID do perfil de acesso (FK) |
| `idade` | INT4 | Idade do usuário |
| `data_nascimento` | TIMESTAMPTZ | Data de nascimento |
| `email` | TEXT | Email do usuário |
| `senha` | TEXT | Senha do usuário (hash) |
| `id_gestor` | INT8 | ID do gestor (FK) |
| `id_departamento` | INT8 | ID do departamento (FK) |

### Tabela: `perfil_usuario`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do perfil |
| `nome` | TEXT | Nome do perfil |

### Tabela: `departamento`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do departamento |
| `nome` | TEXT | Nome do departamento |

### Tabela: `arvore_da_vida`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do registro |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `pontuacao_geral` | SMALLINT | Pontuação geral da árvore da vida (0-10) |
| `criatividade_hobbie` | SMALLINT | Pontuação para criatividade e hobbies |
| `plenitude_felicidade` | SMALLINT | Pontuação para plenitude e felicidade |
| `espiritualidade` | SMALLINT | Pontuação para espiritualidade |
| `saude_disposicao` | SMALLINT | Pontuação para saúde e disposição |
| `desenvolvimento_intelectual` | SMALLINT | Pontuação para desenvolvimento intelectual |
| `equilibrio_emocional` | SMALLINT | Pontuação para equilíbrio emocional |
| `familia` | SMALLINT | Pontuação para família |
| `desenvolvimento_amoroso` | SMALLINT | Pontuação para desenvolvimento amoroso |
| `vida_social` | SMALLINT | Pontuação para vida social |
| `realizacao_proposito` | SMALLINT | Pontuação para realização e propósito |
| `recursos_financeiros` | SMALLINT | Pontuação para recursos financeiros |
| `contribuicao_social` | SMALLINT | Pontuação para contribuição social |
| `id_usuario` | INT8 | ID do usuário (FK) |

### Tabela: `metas_pdi`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único da meta |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `titulo` | TEXT | Título da meta |
| `prazo` | DATE | Data de vencimento da meta |
| `status` | TEXT | Status da meta |
| `resultado_3_meses` | TEXT | Resultado esperado em 3 meses |
| `resultado_6_meses` | TEXT | Resultado esperado em 6 meses |
| `feedback_gestor` | TEXT | Feedback do gestor |
| `id_usuario` | INT8 | ID do usuário (FK) |

### Tabela: `atividades_pdi`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único da atividade |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `id_meta_pdi` | INT8 | ID da meta (FK) |
| `titulo_atividade` | TEXT | Título da atividade |
| `status_atividade` | TEXT | Status da atividade |
| `evidencia_atividade` | TEXT | URL da evidência |

### Tabela: `categoria_swot`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único da categoria |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `categoria` | TEXT | Nome da categoria SWOT |

### Tabela: `textos_swot`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do texto |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `texto` | TEXT | Texto da análise SWOT |
| `id_categoria_swot` | INT8 | ID da categoria SWOT (FK) |
| `id_usuario` | INT8 | ID do usuário (FK) |

---

## Exemplos de Uso

### Exemplo 1: Buscar Usuários por Email e Cliente

```bash
curl -X GET "http://localhost:3002/api/usuarios/buscar?email=joao&id_cliente=1" \
  -H "Authorization: Bearer <token>"
```

### Exemplo 2: Buscar Usuários por Email Inexistente

```bash
curl -X GET "http://localhost:3002/api/usuarios/buscar?email=inexistente&id_cliente=1" \
  -H "Authorization: Bearer <token>"
```

### Exemplo 3: Buscar Usuários por Gestor

```bash
curl -X GET http://localhost:3002/api/usuarios/gestor/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 4: Buscar Usuários por Gestor Inexistente

```bash
curl -X GET http://localhost:3002/api/usuarios/gestor/99999 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 5: Buscar Dashboard do Usuário

```bash
curl -X GET http://localhost:3002/api/usuarios/dashboard/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 6: Criar Usuário

```bash
curl -X POST http://localhost:3002/api/usuarios/cliente/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao.silva@empresa.com",
    "senha": "minhasenha123",
    "cargo": 5,
    "perfil_acesso": 2,
    "idade": 28,
    "data_nascimento": "1995-05-15T00:00:00.000Z",
    "id_gestor": 1,
    "id_departamento": 3
  }'
```

### Exemplo 7: Buscar Usuários por Cliente

```bash
curl -X GET http://localhost:3002/api/usuarios/cliente/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 8: Buscar Usuários sem Gestor

```bash
curl -X GET http://localhost:3002/api/usuarios/sem-gestor/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 9: Buscar Usuários com Gestor

```bash
curl -X GET http://localhost:3002/api/usuarios/com-gestor/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 10: Atribuir Gestor a Usuário

```bash
curl -X PUT http://localhost:3002/api/usuarios/3/atribuir-gestor/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 11: Remover Gestor de Usuário

```bash
curl -X PUT http://localhost:3002/api/usuarios/3/remover-gestor/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 12: Buscar Todos os Usuários por Cliente

```bash
curl -X GET http://localhost:3002/api/usuarios/all-usuarios/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 13: Buscar Todos os Gestores por Cliente

```bash
curl -X GET http://localhost:3002/api/usuarios/all-gestores/1 \
  -H "Authorization: Bearer <token>"
```

---

## Testes

Para executar os testes da API de Usuários:

```bash
# Executar todos os testes
node tests/test-usuarios.js

# Ou com URL específica
API_URL=http://localhost:3002/api node tests/test-usuarios.js
```

Os testes incluem:

**Testes de Busca por Email (GET /buscar):**
- ✅ Buscar usuários por email válido
- ✅ Buscar usuários por email inexistente (retorna vazio)
- ❌ Buscar usuários por email sem email
- ❌ Buscar usuários por email sem cliente
- ❌ Buscar usuários por email com cliente inválido
- ✅ Buscar usuários por email com dados completos
- ✅ Buscar usuários por email - ordenação

**Testes de Busca por Gestor (GET /gestor/:id):**
- ✅ Buscar usuários por gestor válido
- ✅ Buscar usuários por gestor inexistente (retorna vazio)
- ❌ Buscar usuários por gestor com ID inválido
- ❌ Buscar usuários por gestor sem ID (rota não encontrada)
- ✅ Buscar usuários por gestor com dados completos
- ✅ Buscar usuários por gestor - ordenação

**Testes de Dashboard (GET /dashboard/:id):**
- ✅ Buscar dashboard do usuário válido
- ✅ Buscar dashboard de usuário inexistente (retorna dados vazios)
- ❌ Buscar dashboard com ID inválido
- ✅ Validar estrutura completa dos dados retornados
- ✅ Verificar cálculos de porcentagem de conclusão
- ✅ Validar formato da árvore da vida
- ✅ Verificar estrutura da análise SWOT

**Testes de Criação (POST /cliente/:id):**
- ✅ Criar usuário com dados válidos
- ❌ Criar usuário com nome vazio
- ❌ Criar usuário com email inválido
- ❌ Criar usuário sem senha
- ❌ Criar usuário com email duplicado
- ❌ Criar usuário com idade inválida
- ❌ Criar usuário com ID de cliente inválido

**Testes de Busca por Cliente (GET /cliente/:id):**
- ✅ Buscar usuários de cliente válido
- ✅ Buscar usuários de cliente inexistente (retorna array vazio)
- ❌ Buscar usuários com ID de cliente inválido
- ✅ Validar estrutura completa dos dados retornados
- ✅ Verificar relacionamentos (cargo, departamento, gestor, perfil)

**Testes de Gestão de Gestores:**
- ✅ Buscar usuários sem gestor (GET /sem-gestor/:id)
- ✅ Buscar usuários com gestor (GET /com-gestor/:id)
- ✅ Atribuir gestor a usuário (PUT /:id/atribuir-gestor/:id)
- ✅ Remover gestor de usuário (PUT /:id/remover-gestor/:id)
- ❌ Validar erros de gestão (IDs inválidos, auto-atribuição)
- ✅ Buscar usuários para cliente inexistente (gestão)

**Testes de Busca por Perfil de Acesso:**
- ✅ Buscar todos os usuários por cliente (GET /all-usuarios/:id)
- ✅ Buscar todos os gestores por cliente (GET /all-gestores/:id)
- ❌ Validar erros de perfil de acesso (IDs inválidos)
- ✅ Buscar para cliente inexistente (perfil de acesso)

---

## Notas Importantes

1. **Ordenação:** Os usuários são retornados ordenados por nome em ordem alfabética.

2. **Relacionamentos:** A API faz JOIN com as tabelas `perfil_usuario` e `departamento` para retornar os nomes dos perfis e departamentos.

3. **Campos Opcionais:** Os campos `departamento_nome` e `perfil_acesso_nome` podem ser null se não houver relacionamento.

4. **Segurança:** A senha do usuário não é retornada na resposta por questões de segurança.

5. **Performance:** A query utiliza índices nas foreign keys para melhor performance.

---

## Próximas Implementações

- [x] API GET para buscar usuários por email e cliente
- [x] API GET para buscar usuários por gestor
- [x] API GET para buscar dashboard do usuário
- [x] API POST para criar usuário
- [x] API GET para buscar usuários por cliente
- [x] API GET para buscar usuários sem gestor
- [x] API GET para buscar usuários com gestor
- [x] API PUT para remover gestor de usuário
- [x] API PUT para atribuir gestor a usuário
- [x] API GET para buscar todos os usuários por cliente (perfil_acesso = 1)
- [x] API GET para buscar todos os gestores por cliente (perfil_acesso in (2,3))
- [ ] API GET para buscar usuário por ID
- [ ] API PUT para atualizar usuário
- [ ] API DELETE para remover usuário
- [ ] API para buscar usuários por departamento
- [ ] API para buscar usuários por perfil de acesso
- [ ] API para atualizar árvore da vida
- [ ] API para gerenciar análise SWOT
