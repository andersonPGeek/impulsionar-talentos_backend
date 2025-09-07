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

4. Gere um JWT_SECRET seguro:
```bash
npm run generate-secret
```

5. Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL=postgresql://postgres:t9Rgcvq8jlpYt7sG@db.fdopxrrcvbzhwszsluwm.supabase.co:5432/postgres
PORT=3002
JWT_SECRET=seu_jwt_secret_gerado
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080,http://localhost:3000
```

### Configuração do CORS

O projeto está configurado para aceitar requisições dos seguintes domínios:

- **Desenvolvimento**: `http://localhost:8080`, `http://localhost:3000`, `http://localhost:3002`
- **Produção**: Configurado via variável `CORS_ORIGIN`

Para adicionar novos domínios, edite a variável `CORS_ORIGIN` no arquivo `.env`:

```bash
# Múltiplos domínios separados por vírgula
CORS_ORIGIN=http://localhost:8080,http://localhost:3000,https://seu-dominio.com
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

### Testes
```bash
# Todos os testes
npm test

# Teste específico
npm run test:auth
npm run test:db
```

O servidor estará disponível em `http://localhost:3002`

## 🚀 Deploy

### Render (Recomendado)
O projeto está configurado para deploy automático no Render.

1. Conecte seu repositório no Render
2. Use o arquivo `render.yaml` para configuração automática
3. Configure as variáveis de ambiente
4. Deploy automático a cada push

**Documentação completa**: [DEPLOY.md](./DEPLOY.md)

### Outras Plataformas
O projeto pode ser deployado em qualquer plataforma que suporte Node.js:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk

## 📊 Endpoints

### Health Check
- `GET /health` - Verificar status da API

### Teste
- `GET /` - Página inicial da API
- `GET /api/test` - Teste das rotas

### Autenticação
- `POST /api/auth/register` - Criar novo usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/validate` - Validar token (protegido)
- `POST /api/auth/change-password` - Alterar senha (protegido)

### Perfil do Colaborador
- `GET /api/perfil-colaborador/:id_usuario` - Buscar perfil do colaborador
- `POST /api/perfil-colaborador` - Criar perfil do colaborador
- `PUT /api/perfil-colaborador` - Atualizar perfil do colaborador

### Sabotadores
- `GET /api/sabotadores/:id_usuario/perguntas-pendentes` - Buscar perguntas pendentes
- `POST /api/sabotadores/respostas` - Salvar respostas das perguntas
- `GET /api/sabotadores/:id_usuario/resultado` - Buscar resultado dos sabotadores

### Personalidade MBTI
- `GET /api/personalidade/:id_usuario/perguntas-pendentes` - Buscar perguntas pendentes
- `POST /api/personalidade/respostas` - Salvar respostas das perguntas
- `GET /api/personalidade/:id_usuario/resultado` - Buscar resultado da personalidade

### Árvore da Vida
- `GET /api/arvore-da-vida/:id_usuario` - Buscar árvore da vida do usuário
- `POST /api/arvore-da-vida` - Criar árvore da vida
- `PUT /api/arvore-da-vida` - Atualizar árvore da vida

### Análise SWOT
- `GET /api/analise-swot/:id_usuario` - Buscar análise SWOT do usuário
- `POST /api/analise-swot` - Salvar/atualizar análise SWOT

## 🏗️ Estrutura do Projeto

```
src/
├── app.js              # Arquivo principal da aplicação
├── controllers/        # Controladores da aplicação
├── middleware/         # Middlewares (auth, validation, etc.)
├── routes/            # Rotas da API
├── utils/             # Utilitários (supabase, logger, response)
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

# Teste de CORS
node tests/test-cors.js

# Teste de perfil de acesso
node tests/test-perfil-acesso.js

# Teste de perfil do colaborador
node tests/test-perfil-colaborador.js

# Teste de sabotadores
node tests/test-sabotadores.js

# Teste de personalidade MBTI
node tests/test-personalidade.js

# Teste de árvore da vida
node tests/test-arvore-da-vida.js

# Teste de análise SWOT
node tests/test-analise-swot.js

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

## 📚 Documentação

- [API de Autenticação](AUTH_API.md)
- [API de Perfil do Colaborador](PERFIL_COLABORADOR_API.md)
- [API de Sabotadores](SABOTADORES_API.md)
- [API de Personalidade MBTI](PERSONALIDADE_API.md)
- [API de Árvore da Vida](ARVORE_DA_VIDA_API.md)
- [API de Análise SWOT](ANALISE_SWOT_API.md)
- [Guia de Deploy](DEPLOY.md)

## 📄 Licença

Este projeto está sob a licença MIT.