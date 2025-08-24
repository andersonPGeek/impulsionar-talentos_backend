const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3002/api';
const TEST_USER_ID = 1;

console.log('🧪 Iniciando testes da API Árvore da Vida');
console.log('📍 URL Base:', BASE_URL);

// Dados de teste
const dadosArvoreDaVida = {
  id_usuario: TEST_USER_ID,
  pontuacao_geral: 7,
  criatividade_hobbie: 8,
  plenitude_felicidade: 6,
  espiritualidade: 5,
  saude_disposicao: 7,
  desenvolvimento_intelectual: 8,
  equilibrio_emocional: 6,
  familia: 9,
  desenvolvimento_amoroso: 7,
  vida_social: 6,
  realizacao_proposito: 8,
  recursos_financeiros: 5,
  contribuicao_social: 7
};

const dadosAtualizados = {
  id_usuario: TEST_USER_ID,
  pontuacao_geral: 8,
  criatividade_hobbie: 9,
  plenitude_felicidade: 7,
  espiritualidade: 6,
  saude_disposicao: 8,
  desenvolvimento_intelectual: 9,
  equilibrio_emocional: 7,
  familia: 9,
  desenvolvimento_amoroso: 8,
  vida_social: 7,
  realizacao_proposito: 9,
  recursos_financeiros: 6,
  contribuicao_social: 8
};

// Função auxiliar para fazer requisições
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Teste 1: Criar árvore da vida (POST)
async function testCriarArvoreDaVida() {
  console.log('\n🧪 Teste 1: Criar árvore da vida (POST)');
  
  const result = await makeRequest('POST', '/arvore-da-vida', dadosArvoreDaVida);
  
  if (result.success) {
    console.log('✅ Sucesso! Árvore da vida criada');
    console.log('📊 Status:', result.status);
    console.log('📝 Dados criados:', JSON.stringify(result.data.data.arvore_da_vida, null, 2));
    return true;
  } else {
    console.log('❌ Falha ao criar árvore da vida');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 2: Buscar árvore da vida (GET)
async function testBuscarArvoreDaVida() {
  console.log('\n🧪 Teste 2: Buscar árvore da vida (GET)');
  
  const result = await makeRequest('GET', `/arvore-da-vida/${TEST_USER_ID}`);
  
  if (result.success) {
    console.log('✅ Sucesso! Árvore da vida encontrada');
    console.log('📊 Status:', result.status);
    console.log('📝 Dados encontrados:', JSON.stringify(result.data.data.arvore_da_vida, null, 2));
    return true;
  } else {
    console.log('❌ Falha ao buscar árvore da vida');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 3: Atualizar árvore da vida (PUT)
async function testAtualizarArvoreDaVida() {
  console.log('\n🧪 Teste 3: Atualizar árvore da vida (PUT)');
  
  const result = await makeRequest('PUT', '/arvore-da-vida', dadosAtualizados);
  
  if (result.success) {
    console.log('✅ Sucesso! Árvore da vida atualizada');
    console.log('📊 Status:', result.status);
    console.log('📝 Dados atualizados:', JSON.stringify(result.data.data.arvore_da_vida, null, 2));
    return true;
  } else {
    console.log('❌ Falha ao atualizar árvore da vida');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 4: Verificar atualização (GET após PUT)
async function testVerificarAtualizacao() {
  console.log('\n🧪 Teste 4: Verificar atualização (GET após PUT)');
  
  const result = await makeRequest('GET', `/arvore-da-vida/${TEST_USER_ID}`);
  
  if (result.success) {
    console.log('✅ Sucesso! Verificação da atualização');
    console.log('📊 Status:', result.status);
    
    const arvore = result.data.data.arvore_da_vida;
    const mudancas = [];
    
    // Verificar se os valores foram atualizados
    Object.keys(dadosAtualizados).forEach(key => {
      if (key !== 'id_usuario' && arvore[key] !== dadosAtualizados[key]) {
        mudancas.push(`${key}: ${dadosArvoreDaVida[key]} → ${arvore[key]}`);
      }
    });
    
    if (mudancas.length > 0) {
      console.log('📝 Mudanças detectadas:', mudancas);
    } else {
      console.log('⚠️ Nenhuma mudança detectada');
    }
    
    console.log('📝 Dados finais:', JSON.stringify(arvore, null, 2));
    return true;
  } else {
    console.log('❌ Falha ao verificar atualização');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 5: Validação de campos obrigatórios
async function testValidacaoCamposObrigatorios() {
  console.log('\n🧪 Teste 5: Validação de campos obrigatórios');
  
  // Teste sem id_usuario
  const dadosInvalidos = { ...dadosArvoreDaVida };
  delete dadosInvalidos.id_usuario;
  
  const result = await makeRequest('POST', '/arvore-da-vida', dadosInvalidos);
  
  if (!result.success && result.status === 400) {
    console.log('✅ Sucesso! Validação funcionando (id_usuario obrigatório)');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return true;
  } else {
    console.log('❌ Falha na validação de campos obrigatórios');
    console.log('📊 Status:', result.status);
    console.log('📝 Resposta:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 6: Validação de valores de pontuação
async function testValidacaoValoresPontuacao() {
  console.log('\n🧪 Teste 6: Validação de valores de pontuação');
  
  // Teste com valor inválido (11)
  const dadosInvalidos = { ...dadosArvoreDaVida };
  dadosInvalidos.pontuacao_geral = 11;
  
  const result = await makeRequest('POST', '/arvore-da-vida', dadosInvalidos);
  
  if (!result.success && result.status === 400) {
    console.log('✅ Sucesso! Validação funcionando (valor fora do range 0-10)');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return true;
  } else {
    console.log('❌ Falha na validação de valores de pontuação');
    console.log('📊 Status:', result.status);
    console.log('📝 Resposta:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 7: Buscar árvore da vida inexistente
async function testBuscarArvoreInexistente() {
  console.log('\n🧪 Teste 7: Buscar árvore da vida inexistente');
  
  const result = await makeRequest('GET', '/arvore-da-vida/999999');
  
  if (!result.success && result.status === 404) {
    console.log('✅ Sucesso! Tratamento correto de árvore inexistente');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return true;
  } else {
    console.log('❌ Falha no tratamento de árvore inexistente');
    console.log('📊 Status:', result.status);
    console.log('📝 Resposta:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando execução dos testes da API Árvore da Vida');
  console.log('⏰', new Date().toISOString());
  
  const tests = [
    { name: 'Criar árvore da vida', fn: testCriarArvoreDaVida },
    { name: 'Buscar árvore da vida', fn: testBuscarArvoreDaVida },
    { name: 'Atualizar árvore da vida', fn: testAtualizarArvoreDaVida },
    { name: 'Verificar atualização', fn: testVerificarAtualizacao },
    { name: 'Validação campos obrigatórios', fn: testValidacaoCamposObrigatorios },
    { name: 'Validação valores pontuação', fn: testValidacaoValoresPontuacao },
    { name: 'Buscar árvore inexistente', fn: testBuscarArvoreInexistente }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ Erro no teste "${test.name}":`, error.message);
      failed++;
    }
  }
  
  console.log('\n📊 Resumo dos Testes');
  console.log('==================');
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  console.log(`🎯 Taxa de sucesso: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 Todos os testes passaram!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
    process.exit(1);
  }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Erro fatal durante execução dos testes:', error);
    process.exit(1);
  });
}

module.exports = {
  testCriarArvoreDaVida,
  testBuscarArvoreDaVida,
  testAtualizarArvoreDaVida,
  testVerificarAtualizacao,
  testValidacaoCamposObrigatorios,
  testValidacaoValoresPontuacao,
  testBuscarArvoreInexistente,
  runAllTests
};
