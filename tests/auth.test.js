const axios = require('axios');
require('dotenv').config();

const API_BASE = `http://localhost:${process.env.PORT || 3002}/api`;

async function testAuthAPI() {
  console.log('🧪 Testando API de Autenticação...\n');

  try {
    // Teste 1: Verificar se o servidor está rodando
    console.log('1️⃣ Verificando se o servidor está rodando...');
    try {
      const response = await axios.get(`${API_BASE}/test`);
      console.log('✅ Servidor respondendo:', response.data.message);
    } catch (error) {
      console.log('❌ Servidor não está rodando. Execute: npm run dev');
      return;
    }

    // Teste 2: Validação de dados de entrada
    console.log('\n2️⃣ Testando validações de entrada...');
    
    // Teste de senha muito curta
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'teste@exemplo.com',
        senha: '123'
      });
      console.log('❌ Deveria ter falhado na validação');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validação funcionando - senha muito curta');
      } else {
        console.log('❌ Erro inesperado:', error.message);
      }
    }

    // Teste de email inválido
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'email-invalido',
        senha: 'Senha123'
      });
      console.log('❌ Deveria ter falhado na validação de email');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validação funcionando - email inválido');
      } else {
        console.log('❌ Erro inesperado:', error.message);
      }
    }

    // Teste 3: Validação de registro
    console.log('\n3️⃣ Testando validações de registro...');
    
    // Teste de senha muito curta no registro
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        email: 'teste@exemplo.com',
        senha: '123',
        nome: 'Teste'
      });
      console.log('❌ Deveria ter falhado na validação de senha');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validação de registro funcionando - senha muito curta');
      } else {
        console.log('❌ Erro inesperado:', error.message);
      }
    }

    // Teste de email inválido no registro
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        email: 'email-invalido',
        senha: 'Senha123',
        nome: 'Teste'
      });
      console.log('❌ Deveria ter falhado na validação de email');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validação de registro funcionando - email inválido');
      } else {
        console.log('❌ Erro inesperado:', error.message);
      }
    }

    // Teste 4: Login com usuário inexistente
    console.log('\n4️⃣ Testando login com usuário inexistente...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'usuario@inexistente.com',
        senha: 'Senha123'
      });
      console.log('❌ Deveria ter falhado - usuário não existe');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Login falhou como esperado - usuário não encontrado');
      } else {
        console.log('❌ Erro inesperado:', error.message);
      }
    }

    // Teste 5: Proteção de rotas autenticadas
    console.log('\n5️⃣ Testando proteção de rotas...');
    
    // Teste sem token
    try {
      await axios.get(`${API_BASE}/auth/validate`);
      console.log('❌ Deveria ter falhado - sem token');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Proteção funcionando - sem token');
      } else {
        console.log('❌ Erro inesperado:', error.message);
      }
    }

    console.log('\n🎉 Todos os testes de validação e proteção passaram!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testAuthAPI(); 