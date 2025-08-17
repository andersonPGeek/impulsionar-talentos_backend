# API de Autenticação - Impulsionar Talentos

Documentação das APIs de autenticação do sistema.

## 🔐 Endpoints

### Base URL
```
http://localhost:3002/api/auth
```

---

## 📝 Registro

**POST** `/register`

Cria um novo usuário e retorna um token JWT.

### Request Body
```json
{
  "email": "novo@exemplo.com",
  "senha": "MinhaSenha123",
  "nome": "João Silva",
  "data_nascimento": "1990-01-01T00:00:00.000Z",
  "cargo": "Desenvolvedor",
  "idade": 30,
  "id_gestor": 1,
  "id_departamento": 1,
  "id_cliente": 1,
  "perfil_acesso": 1
}
```

### Validações
- `email`: Deve ser um email válido e único
- `senha`: Mínimo 6 caracteres, deve conter maiúscula, minúscula e número
- `nome`: Entre 2 e 100 caracteres (obrigatório)
- `data_nascimento`: Data no formato ISO 8601 (opcional)
- `cargo`: Máximo 100 caracteres (opcional)
- `idade`: Número entre 0 e 150 (opcional)
- `id_gestor`: ID de um usuário gestor existente (opcional)
- `id_departamento`: ID de um departamento existente (opcional)
- `id_cliente`: ID de um cliente existente (opcional)
- `perfil_acesso`: ID de um perfil de acesso existente (opcional)

### Response (201 - Sucesso)
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "user": {
      "id": 2,
      "email": "novo@exemplo.com",
      "nome": "João Silva",
      "data_nascimento": "1990-01-01T00:00:00.000Z",
      "cargo": "Desenvolvedor",
      "idade": 30,
      "id_gestor": 1,
      "id_departamento": 1,
      "id_cliente": 1,
      "perfil_acesso": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (400 - Erro)
```json
{
  "success": false,
  "message": "Email já está em uso",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📝 Login

**POST** `/login`

Realiza o login do usuário e retorna um token JWT.

### Request Body
```json
{
  "email": "usuario@exemplo.com",
  "senha": "MinhaSenha123"
}
```

### Validações
- `email`: Deve ser um email válido
- `senha`: Mínimo 6 caracteres

### Response (200 - Sucesso)
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@exemplo.com",
      "data_nascimento": "1990-01-01T00:00:00.000Z",
      "id_gestor": 2,
      "id_departamento": 1,
      "perfil_acesso": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (401 - Erro)
```json
{
  "success": false,
  "message": "Email ou senha inválidos",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔍 Validar Token

**GET** `/validate`

Valida se o token JWT é válido e retorna os dados do usuário.

### Headers
```
Authorization: Bearer <seu-token-jwt>
```

### Response (200 - Token válido)
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@exemplo.com",
      "data_nascimento": "1990-01-01T00:00:00.000Z",
      "id_gestor": 2,
      "id_departamento": 1,
      "perfil_acesso": 1
    },
    "valid": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (401 - Token inválido)
```json
{
  "success": false,
  "message": "Token expirado ou inválido",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔑 Alterar Senha

**POST** `/change-password`

Altera a senha do usuário autenticado.

### Headers
```
Authorization: Bearer <seu-token-jwt>
```

### Request Body
```json
{
  "senhaAtual": "SenhaAtual123",
  "novaSenha": "NovaSenha456"
}
```

### Validações
- `senhaAtual`: Mínimo 6 caracteres
- `novaSenha`: Mínimo 6 caracteres, deve conter maiúscula, minúscula e número

### Response (200 - Sucesso)
```json
{
  "success": true,
  "message": "Senha alterada com sucesso",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (401 - Senha atual incorreta)
```json
{
  "success": false,
  "message": "Senha atual incorreta",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚀 Como Usar

### 1. Registro
```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@exemplo.com",
    "senha": "MinhaSenha123",
    "nome": "João Silva",
    "data_nascimento": "1990-01-01T00:00:00.000Z",
    "cargo": "Desenvolvedor",
    "idade": 30
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@exemplo.com",
    "senha": "SuaSenha123"
  }'
```

### 2. Usar Token em Requisições Protegidas
```bash
curl -X GET http://localhost:3002/api/auth/validate \
  -H "Authorization: Bearer <seu-token-jwt>"
```

### 3. Alterar Senha
```bash
curl -X POST http://localhost:3002/api/auth/change-password \
  -H "Authorization: Bearer <seu-token-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "senhaAtual": "SenhaAtual123",
    "novaSenha": "NovaSenha456"
  }'
```

---

## 🗄️ Estrutura da Tabela

A API utiliza a tabela `usuarios` com a seguinte estrutura:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | bigint | Chave primária (auto-incremento) |
| data_nascimento | timestamptz | Data de nascimento do usuário |
| email | text | Email do usuário (único) |
| senha | text | Senha criptografada |
| id_gestor | bigint | ID do gestor (FK para usuarios) |
| id_departamento | bigint | ID do departamento (FK para departamento) |

---

## 📋 Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

---

## 🔒 Segurança

- Senhas são criptografadas com bcrypt (salt rounds: 10)
- Tokens JWT expiram em 24 horas
- Validação rigorosa de dados de entrada
- Sanitização automática de dados
- Logs de todas as operações de autenticação 