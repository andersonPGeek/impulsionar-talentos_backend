# Testes - Impulsionar Talentos

Esta pasta contém todos os arquivos de teste para as APIs do sistema.

## 📁 Estrutura

```
tests/
├── README.md              # Esta documentação
├── auth.test.js           # Testes da API de autenticação
├── database.test.js       # Testes de conexão com banco
└── utils/                 # Utilitários para testes
    └── test-helper.js     # Funções auxiliares para testes
```

## 🧪 Como Executar Testes

### Teste Individual
```bash
node tests/auth.test.js
```

### Teste de Conexão com Banco
```bash
node tests/database.test.js
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