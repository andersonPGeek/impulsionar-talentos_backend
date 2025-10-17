# API de Reconhecimento

Esta documentação descreve os endpoints da API de Reconhecimento do sistema Impulsionar Talentos.

## Visão Geral

A API de Reconhecimento permite que usuários reconheçam e sejam reconhecidos por outros usuários dentro da organização. O sistema suporta diferentes tipos de reconhecimento e mantém um histórico completo de todas as interações.

## Base URL

```
/api/reconhecimento
```

## Autenticação

Todos os endpoints requerem autenticação via JWT token no header:

```
Authorization: Bearer <seu-token-jwt>
```

---

## Endpoints de Reconhecimento

### 1. Buscar Reconhecimentos Recebidos por Usuário

**GET** `/usuario/:id_usuario`

Busca todos os reconhecimentos recebidos por um usuário específico.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id_usuario` | Integer | Sim | ID do usuário que recebeu os reconhecimentos |

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Reconhecimentos buscados com sucesso",
  "data": {
    "usuario_id": 1,
    "reconhecimentos": [
      {
        "id": 1,
        "created_at": "2024-01-15T10:30:00Z",
        "motivo_reconhecimento": "Excelente trabalho no projeto X",
        "usuario_reconhecido": {
          "id": 1,
          "nome": "João Silva"
        },
        "usuario_reconheceu": {
          "id": 2,
          "nome": "Maria Santos"
        },
        "tipo_reconhecimento": {
          "id": 1,
          "reconhecimento": "Excelente Trabalho em Equipe",
          "icone_reconhecimento": "👥"
        }
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Resposta de Erro (400)

```json
{
  "success": false,
  "error": "INVALID_USER_ID",
  "message": "ID do usuário é obrigatório e deve ser um número válido",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 2. Buscar Reconhecimentos Dados por Usuário

**GET** `/dados-por/:id_usuario`

Busca todos os reconhecimentos dados por um usuário específico.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id_usuario` | Integer | Sim | ID do usuário que deu os reconhecimentos |

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Reconhecimentos dados buscados com sucesso",
  "data": {
    "usuario_id": 2,
    "reconhecimentos": [
      {
        "id": 1,
        "created_at": "2024-01-15T10:30:00Z",
        "motivo_reconhecimento": "Excelente trabalho no projeto X",
        "usuario_reconhecido": {
          "id": 1,
          "nome": "João Silva"
        },
        "usuario_reconheceu": {
          "id": 2,
          "nome": "Maria Santos"
        },
        "tipo_reconhecimento": {
          "id": 1,
          "reconhecimento": "Excelente Trabalho em Equipe",
          "icone_reconhecimento": "👥"
        }
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 3. Criar Reconhecimento

**POST** `/`

Cria um novo reconhecimento entre usuários.

#### Corpo da Requisição

```json
{
  "id_usuario_reconhecido": 1,
  "id_usuario_reconheceu": 2,
  "motivo_reconhecimento": "Demonstrou excelente colaboração no projeto X",
  "id_tipo_reconhecimento": 1
}
```

#### Validações

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `id_usuario_reconhecido` | Integer | Sim | Deve ser um número inteiro positivo |
| `id_usuario_reconheceu` | Integer | Sim | Deve ser um número inteiro positivo |
| `motivo_reconhecimento` | String | Sim | Entre 1 e 1000 caracteres |
| `id_tipo_reconhecimento` | Integer | Sim | Deve ser um número inteiro positivo |

#### Resposta de Sucesso (201)

```json
{
  "success": true,
  "message": "Reconhecimento criado com sucesso",
  "data": {
    "id": 1,
    "id_usuario_reconhecido": 1,
    "id_usuario_reconheceu": 2,
    "motivo_reconhecimento": "Demonstrou excelente colaboração no projeto X",
    "id_tipo_reconhecimento": 1,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Resposta de Erro (400)

```json
{
  "success": false,
  "error": "SELF_RECOGNITION",
  "message": "Um usuário não pode reconhecer a si mesmo",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 4. Atualizar Reconhecimento

**PUT** `/:id`

Atualiza um reconhecimento existente.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | Integer | Sim | ID do reconhecimento a ser atualizado |

#### Corpo da Requisição

```json
{
  "motivo_reconhecimento": "Demonstrou excelente colaboração no projeto X - Atualizado",
  "id_tipo_reconhecimento": 2
}
```

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Reconhecimento atualizado com sucesso",
  "data": {
    "id": 1,
    "id_usuario_reconhecido": 1,
    "id_usuario_reconheceu": 2,
    "motivo_reconhecimento": "Demonstrou excelente colaboração no projeto X - Atualizado",
    "id_tipo_reconhecimento": 2,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 5. Deletar Reconhecimento

**DELETE** `/:id`

Remove um reconhecimento do sistema.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | Integer | Sim | ID do reconhecimento a ser deletado |

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Reconhecimento excluído com sucesso",
  "data": {
    "id": 1
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Resposta de Erro (404)

```json
{
  "success": false,
  "error": "RECOGNITION_NOT_FOUND",
  "message": "Reconhecimento não encontrado",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 6. Buscar Reconhecimento Específico

**GET** `/:id`

Busca um reconhecimento específico com todas as informações relacionadas.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | Integer | Sim | ID do reconhecimento |

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Reconhecimento buscado com sucesso",
  "data": {
    "id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "motivo_reconhecimento": "Excelente trabalho no projeto X",
    "usuario_reconhecido": {
      "id": 1,
      "nome": "João Silva"
    },
    "usuario_reconheceu": {
      "id": 2,
      "nome": "Maria Santos"
    },
    "tipo_reconhecimento": {
      "id": 1,
      "reconhecimento": "Excelente Trabalho em Equipe",
      "icone_reconhecimento": "👥"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Endpoints de Tipos de Reconhecimento

### 7. Buscar Todos os Tipos de Reconhecimento

**GET** `/tipos`

Lista todos os tipos de reconhecimento disponíveis no sistema.

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Tipos de reconhecimento buscados com sucesso",
  "data": {
    "tipos": [
      {
        "id": 1,
        "reconhecimento": "Excelente Trabalho em Equipe",
        "icone_reconhecimento": "👥",
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "reconhecimento": "Inovação e Criatividade",
        "icone_reconhecimento": "💡",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 8. Criar Tipo de Reconhecimento

**POST** `/tipos`

Cria um novo tipo de reconhecimento.

#### Corpo da Requisição

```json
{
  "reconhecimento": "Excelente Trabalho em Equipe",
  "icone_reconhecimento": "👥"
}
```

#### Validações

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `reconhecimento` | String | Sim | Entre 1 e 100 caracteres |
| `icone_reconhecimento` | String | Não | Máximo 255 caracteres |

#### Resposta de Sucesso (201)

```json
{
  "success": true,
  "message": "Tipo de reconhecimento criado com sucesso",
  "data": {
    "id": 1,
    "reconhecimento": "Excelente Trabalho em Equipe",
    "icone_reconhecimento": "👥",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Resposta de Erro (400)

```json
{
  "success": false,
  "error": "RECOGNITION_TYPE_ALREADY_EXISTS",
  "message": "Já existe um tipo de reconhecimento com este nome",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 9. Atualizar Tipo de Reconhecimento

**PUT** `/tipos/:id`

Atualiza um tipo de reconhecimento existente.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | Integer | Sim | ID do tipo de reconhecimento |

#### Corpo da Requisição

```json
{
  "reconhecimento": "Excelente Trabalho em Equipe - Atualizado",
  "icone_reconhecimento": "🌟"
}
```

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Tipo de reconhecimento atualizado com sucesso",
  "data": {
    "id": 1,
    "reconhecimento": "Excelente Trabalho em Equipe - Atualizado",
    "icone_reconhecimento": "🌟",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 10. Deletar Tipo de Reconhecimento

**DELETE** `/tipos/:id`

Remove um tipo de reconhecimento do sistema.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | Integer | Sim | ID do tipo de reconhecimento |

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Tipo de reconhecimento excluído com sucesso",
  "data": {
    "id": 1
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Resposta de Erro (400)

```json
{
  "success": false,
  "error": "RECOGNITION_TYPE_HAS_RECOGNITIONS",
  "message": "Não é possível excluir o tipo pois há 5 reconhecimento(s) usando este tipo",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `INVALID_USER_ID` | ID do usuário inválido ou não fornecido |
| `INVALID_RECOGNITION_ID` | ID do reconhecimento inválido ou não fornecido |
| `INVALID_RECOGNITION_TYPE_ID` | ID do tipo de reconhecimento inválido ou não fornecido |
| `INVALID_RECOGNITION_REASON` | Motivo do reconhecimento inválido ou não fornecido |
| `INVALID_RECOGNITION_TYPE` | Nome do tipo de reconhecimento inválido ou não fornecido |
| `INVALID_RECOGNIZED_USER_ID` | ID do usuário reconhecido inválido ou não fornecido |
| `INVALID_RECOGNIZER_USER_ID` | ID do usuário que reconheceu inválido ou não fornecido |
| `RECOGNITION_NOT_FOUND` | Reconhecimento não encontrado |
| `RECOGNITION_TYPE_NOT_FOUND` | Tipo de reconhecimento não encontrado |
| `RECOGNITION_TYPE_ALREADY_EXISTS` | Tipo de reconhecimento já existe |
| `RECOGNITION_TYPE_HAS_RECOGNITIONS` | Tipo de reconhecimento possui reconhecimentos associados |
| `SELF_RECOGNITION` | Usuário tentando reconhecer a si mesmo |
| `USERS_NOT_FOUND` | Um ou ambos os usuários não foram encontrados |
| `DIFFERENT_CLIENTS` | Usuários pertencem a clientes diferentes |

---

## Regras de Negócio

### Reconhecimentos

1. **Validação de Usuários:**
   - Ambos os usuários (reconhecido e reconhecedor) devem existir no sistema
   - Usuários devem pertencer ao mesmo cliente
   - Um usuário não pode reconhecer a si mesmo

2. **Validação de Tipos:**
   - O tipo de reconhecimento deve existir no sistema
   - Tipos não podem ser deletados se houver reconhecimentos associados

3. **Integridade dos Dados:**
   - Motivo do reconhecimento é obrigatório
   - Data de criação é automática
   - Relacionamentos são validados via foreign keys

### Tipos de Reconhecimento

1. **Unicidade:**
   - Nomes de tipos devem ser únicos no sistema
   - Ícones são opcionais

2. **Integridade:**
   - Tipos não podem ser deletados se houver reconhecimentos usando-os
   - Nomes devem ter entre 1 e 100 caracteres

---

## Validações

### Validações de Entrada

1. **ID do Usuário:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório

2. **ID do Reconhecimento:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório

3. **ID do Tipo de Reconhecimento:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório

4. **Motivo do Reconhecimento:**
   - Deve ter entre 1 e 1000 caracteres
   - Campo obrigatório

5. **Nome do Tipo de Reconhecimento:**
   - Deve ter entre 1 e 100 caracteres
   - Campo obrigatório

6. **Ícone do Reconhecimento:**
   - Máximo 255 caracteres
   - Campo opcional

---

## Estrutura do Banco de Dados

### Tabela: `reconhecimento`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT PRIMARY KEY | ID único do reconhecimento |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `id_usuario_reconhecido` | BIGINT | ID do usuário reconhecido (FK) |
| `id_usuario_reconheceu` | BIGINT | ID do usuário que reconheceu (FK) |
| `motivo_reconhecimento` | TEXT | Motivo do reconhecimento |
| `id_tipo_reconhecimento` | BIGINT | ID do tipo de reconhecimento (FK) |

**Relacionamentos:**
- `reconhecimento.id_usuario_reconhecido` → `usuarios(id)` (Foreign Key)
- `reconhecimento.id_usuario_reconheceu` → `usuarios(id)` (Foreign Key)
- `reconhecimento.id_tipo_reconhecimento` → `tipo_reconhecimento(id)` (Foreign Key)

### Tabela: `tipo_reconhecimento`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT PRIMARY KEY | ID único do tipo de reconhecimento |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `reconhecimento` | TEXT | Nome do tipo de reconhecimento |
| `icone_reconhecimento` | TEXT | Ícone do reconhecimento (opcional) |

### Tabela: `usuarios`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT PRIMARY KEY | ID único do usuário |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `id_cliente` | BIGINT | ID do cliente (FK) |
| `nome` | TEXT | Nome do usuário |
| `email` | TEXT | Email do usuário |
| `cargo` | TEXT | Cargo do usuário |
| `perfil_acesso` | INT8 | ID do perfil de acesso (FK) |
| `idade` | INT4 | Idade do usuário |
| `data_nascimento` | TIMESTAMPTZ | Data de nascimento |
| `senha` | TEXT | Senha do usuário (hash) |
| `id_gestor` | BIGINT | ID do gestor (FK) |
| `id_departamento` | BIGINT | ID do departamento (FK) |

---

## Exemplos de Uso

### Exemplo 1: Criar um Reconhecimento

```bash
curl -X POST http://localhost:3002/api/reconhecimento \
  -H "Authorization: Bearer <seu-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario_reconhecido": 1,
    "id_usuario_reconheceu": 2,
    "motivo_reconhecimento": "Excelente trabalho no projeto X",
    "id_tipo_reconhecimento": 1
  }'
```

### Exemplo 2: Buscar Reconhecimentos de um Usuário

```bash
curl -X GET http://localhost:3002/api/reconhecimento/usuario/1 \
  -H "Authorization: Bearer <seu-token>"
```

### Exemplo 3: Criar um Tipo de Reconhecimento

```bash
curl -X POST http://localhost:3002/api/reconhecimento/tipos \
  -H "Authorization: Bearer <seu-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reconhecimento": "Inovação e Criatividade",
    "icone_reconhecimento": "💡"
  }'
```

---

## Testes

Para executar os testes da API de Reconhecimento:

```bash
node tests/test-reconhecimento.js
```

Os testes cobrem:
- Criação, atualização e exclusão de tipos de reconhecimento
- Criação, atualização e exclusão de reconhecimentos
- Busca de reconhecimentos por usuário
- Validações de negócio (auto reconhecimento, usuários inexistentes, etc.)
- Tratamento de erros

---

## Notas de Implementação

1. **Autenticação:** Todos os endpoints requerem autenticação JWT
2. **Validação:** Validações são aplicadas tanto no middleware quanto no controller
3. **Logs:** Todas as operações são logadas para auditoria
4. **Transações:** Operações complexas usam transações de banco de dados
5. **Respostas Padronizadas:** Todas as respostas seguem o padrão da ApiResponse
6. **Sanitização:** Entradas são sanitizadas para prevenir ataques
7. **Relacionamentos:** Foreign keys garantem integridade referencial




