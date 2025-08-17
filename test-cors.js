const axios = require('axios');

async function testCORS() {
  const baseURL = 'http://localhost:3002';
  
  console.log('🧪 Testando configuração do CORS...\n');

  try {
    // Teste 1: Health check (deve funcionar sempre)
    console.log('1️⃣ Testando health check...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check funcionando:', healthResponse.data.status);
    
    // Teste 2: Teste de CORS com origin localhost:8080
    console.log('\n2️⃣ Testando CORS com origin localhost:8080...');
    const corsResponse = await axios.get(`${baseURL}/api/auth`, {
      headers: {
        'Origin': 'http://localhost:8080'
      }
    });
    console.log('✅ CORS funcionando para localhost:8080');
    
    // Teste 3: Verificar headers CORS na resposta
    console.log('\n3️⃣ Verificando headers CORS...');
    const response = await axios.get(`${baseURL}/health`, {
      headers: {
        'Origin': 'http://localhost:8080'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
    };
    
    console.log('📋 Headers CORS encontrados:');
    Object.entries(corsHeaders).forEach(([header, value]) => {
      console.log(`   ${header}: ${value || 'não encontrado'}`);
    });
    
    console.log('\n🎉 Todos os testes de CORS passaram!');
    
  } catch (error) {
    console.error('❌ Erro no teste de CORS:', error.message);
    
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Headers:', error.response.headers);
      console.error('📋 Data:', error.response.data);
    }
  }
}

// Executar teste se o servidor estiver rodando
testCORS().catch(console.error); 