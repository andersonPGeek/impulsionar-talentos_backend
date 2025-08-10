# API Impulsionar Talentos

Backend da aplicação Impulsionar Talentos desenvolvido em Node.js com Express e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **Supabase** - Plataforma de banco de dados
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas
- **express-validator** - Validação de dados

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Acesso ao banco PostgreSQL (Supabase)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd impulsionar-talentos_backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL=postgresql://postgres:EWCWeoCTBbhWOK3T@db.fdopxrrcvbzhwszsluwm.supabase.co:5432/postgres
PORT=3001
JWT_SECRET=seu_jwt_secret_aqui
NODE_ENV=development
```

## 🏃‍♂️ Executando o projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor estará disponível em `http://localhost:3001`

## 📊 Endpoints

### Health Check
- `GET /health` - Verificar status da API

### Teste
- `GET /` - Página inicial da API
- `GET /api/test` - Teste das rotas

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/validate` - Validar token (protegido)
- `POST /api/auth/change-password` - Alterar senha (protegido)

## 🏗️ Estrutura do Projeto

```
src/
├── app.js              # Arquivo principal da aplicação
├── controllers/        # Controladores da aplicação
├── middleware/         # Middlewares (auth, validation, etc.)
├── routes/            # Rotas da API
├── utils/             # Utilitários (database, logger, response)
└── config/            # Configurações
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer <seu-token-jwt>
```

## 📝 Logs

A aplicação possui sistema de logging integrado que registra:
- Requisições HTTP
- Erros de aplicação
- Conexões com banco de dados
- Operações importantes

## 🛠️ Desenvolvimento

### Criando novas rotas

1. Crie o controller em `src/controllers/`
2. Crie a rota em `src/routes/`
3. Registre a rota em `src/app.js`

### 🧪 Testes

O projeto possui uma estrutura organizada para testes na pasta `tests/`:

#### Executando Testes
```bash
# Teste de autenticação
node tests/auth.test.js

# Teste de banco de dados
node tests/database.test.js

# Teste com usuário real (configure as credenciais primeiro)
node tests/auth.test.js --real-user
```

#### Criando Novos Testes

1. **Nomenclatura**: Use `.test.js` para arquivos de teste
2. **Localização**: Coloque na pasta `tests/`
3. **Estrutura**: Siga o padrão dos testes existentes
4. **Documentação**: Consulte `tests/README.md` para detalhes

#### Padrões de Teste

- Use emojis para facilitar identificação visual
- Numere os testes (1️⃣, 2️⃣, 3️⃣)
- Use ✅ para sucesso e ❌ para erro
- Teste casos de sucesso e erro
- Use as funções auxiliares em `tests/utils/test-helper.js`

### Padrões de resposta

A API utiliza padrões consistentes de resposta:

**Sucesso:**
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Erro:**
```json
{
  "success": false,
  "message": "Mensagem de erro",
  "details": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📄 Licença

Este projeto está sob a licença MIT. 