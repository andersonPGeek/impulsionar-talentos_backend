const axios = require('axios');
require('dotenv').config();

// Configurações para testes
const API_BASE = `http://localhost:${process.env.PORT || 3002}/api`;

// Função para fazer requisições com tratamento de erro
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    if (error.response) {
      return { 
        success: false, 
        data: error.response.data, 
        status: error.response.status 
      };
    }
    throw error;
  }
}

// Função para testar validação
async function testValidation(endpoint, data, expectedStatus = 400) {
  const result = await makeRequest('POST', endpoint, data);
  
  if (result.status === expectedStatus) {
    console.log('✅ Validação funcionando corretamente');
    if (result.data && result.data.details) {
      console.log('   Erros:', result.data.details.map(e => `${e.field}: ${e.message}`).join(', '));
    }
    return true;
  } else {
    console.log('❌ Validação falhou - Status esperado:', expectedStatus, 'Recebido:', result.status);
    return false;
  }
}

// Função para testar autenticação
async function testAuthentication(endpoint, token = null) {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const result = await makeRequest('GET', endpoint, null, headers);
  
  if (result.status === 401) {
    console.log('✅ Proteção de autenticação funcionando');
    return true;
  } else if (result.status === 200) {
    console.log('✅ Acesso autorizado');
    return true;
  } else {
    console.log('❌ Erro inesperado - Status:', result.status);
    return false;
  }
}

// Função para testar login
async function testLogin(email, senha, shouldSucceed = false) {
  const result = await makeRequest('POST', '/auth/login', { email, senha });
  
  if (shouldSucceed && result.success) {
    console.log('✅ Login realizado com sucesso');
    return result.data.token;
  } else if (!shouldSucceed && !result.success) {
    console.log('✅ Login falhou como esperado');
    return null;
  } else {
    console.log('❌ Resultado inesperado do login');
    return null;
  }
}

// Função para limpar console
function clearConsole() {
  console.clear();
}

// Função para aguardar
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  API_BASE,
  makeRequest,
  testValidation,
  testAuthentication,
  testLogin,
  clearConsole,
  wait
}; 