# Testes - Impulsionar Talentos

Esta pasta contém todos os arquivos de teste para as APIs do sistema.

## 📁 Estrutura

```
tests/
├── README.md                    # Esta documentação
├── auth.test.js                 # Testes da API de autenticação
├── database.test.js             # Testes de conexão com banco
├── test-cors.js                 # Testes de configuração CORS
├── test-perfil-acesso.js        # Testes de perfil de acesso no login
├── test-perfil-colaborador.js   # Testes da API de perfil do colaborador
├── test-sabotadores.js          # Testes da API de sabotadores
├── test-personalidade.js        # Testes da API de personalidade MBTI
├── test-arvore-da-vida.js       # Testes da API de árvore da vida
├── test-analise-swot.js         # Testes da API de análise SWOT
└── utils/                       # Utilitários para testes
    └── test-helper.js           # Funções auxiliares para testes
```

## 🧪 Como Executar Testes

### Teste Individual
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
```

## 📋 Padrões para Novos Testes

### 1. Nomenclatura
- Use `.test.js` para arquivos de teste
- Nome do arquivo deve corresponder ao módulo testado
- Ex: `usuarios.test.js` para testar APIs de usuários

### 2. Estrutura do Teste
```javascript
const axios = require('axios');
const { API_BASE } = require('./utils/test-helper');

async function testModule() {
  console.log('🧪 Testando [Nome do Módulo]...\n');

  try {
    // Teste 1: Descrição do teste
    console.log('1️⃣ Testando [funcionalidade]...');
    // Implementação do teste
    
    // Teste 2: Descrição do teste
    console.log('\n2️⃣ Testando [funcionalidade]...');
    // Implementação do teste

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testModule();
```

### 3. Validações
- Sempre teste casos de sucesso e erro
- Teste validações de entrada
- Teste autenticação quando necessário
- Use try/catch para capturar erros esperados

### 4. Logs
- Use emojis para facilitar identificação visual
- Numere os testes (1️⃣, 2️⃣, 3️⃣)
- Use ✅ para sucesso e ❌ para erro
- Inclua detalhes relevantes na resposta

## 🔧 Configuração

### Variáveis de Ambiente
Os testes usam as mesmas variáveis de ambiente do projeto principal:
- `DATABASE_URL` - Conexão com banco
- `PORT` - Porta do servidor (padrão: 3002)

### Servidor
Certifique-se de que o servidor está rodando antes de executar os testes:
```bash
npm run dev
```

## 📝 Tipos de Testes

### Testes de Funcionalidade
- **`auth.test.js`** - Testa APIs de autenticação (login, registro, validação de token)
- **`database.test.js`** - Testa conexão com banco de dados e estrutura das tabelas
- **`test-perfil-colaborador.js`** - Testa APIs de perfil do colaborador (CRUD completo)
- **`test-sabotadores.js`** - Testa APIs de sabotadores (perguntas, respostas, resultado)
- **`test-personalidade.js`** - Testa APIs de personalidade MBTI (perguntas, respostas, resultado)
- **`test-arvore-da-vida.js`** - Testa APIs de árvore da vida (criar, buscar, atualizar)
- **`test-analise-swot.js`** - Testa APIs de análise SWOT (salvar, buscar, atualizar por categoria)

### Testes de Configuração
- **`test-cors.js`** - Verifica se a configuração CORS está funcionando corretamente
- **`test-perfil-acesso.js`** - Testa se o campo `perfil_acesso` está sendo retornado no login

## 📝 Exemplos

### Teste de API Pública
```javascript
// Teste de login
const response = await axios.post(`${API_BASE}/auth/login`, {
  email: 'teste@exemplo.com',
  senha: 'Senha123'
});
```

### Teste de API Protegida
```javascript
// Teste com token
const response = await axios.get(`${API_BASE}/auth/validate`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Teste de Validação
```javascript
// Teste de erro esperado
try {
  await axios.post(`${API_BASE}/auth/login`, {
    email: 'email-invalido',
    senha: '123'
  });
  console.log('❌ Deveria ter falhado');
} catch (error) {
  if (error.response && error.response.status === 400) {
    console.log('✅ Validação funcionando');
  }
}
```