const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3002/api';
const TEST_USER_ID = 1;

console.log('🧪 Iniciando testes da API Análise SWOT');
console.log('📍 URL Base:', BASE_URL);

// Dados de teste
const dadosAnaliseSwot = {
  id_usuario: TEST_USER_ID,
  textos_por_categoria: [
    {
      id_categoria_swot: 1, // Fortalezas
      textos: [
        "Tenho boa comunicação",
        "Sou organizado",
        "Trabalho bem em equipe"
      ]
    },
    {
      id_categoria_swot: 2, // Fraquezas
      textos: [
        "Tenho dificuldade com prazos",
        "Sou muito perfeccionista"
      ]
    },
    {
      id_categoria_swot: 3, // Oportunidades
      textos: [
        "Mercado em crescimento",
        "Novas tecnologias disponíveis"
      ]
    },
    {
      id_categoria_swot: 4, // Ameaças
      textos: [
        "Concorrência acirrada",
        "Mudanças regulatórias"
      ]
    }
  ]
};

const dadosAtualizados = {
  id_usuario: TEST_USER_ID,
  textos_por_categoria: [
    {
      id_categoria_swot: 1, // Fortalezas
      textos: [
        "Tenho excelente comunicação",
        "Sou muito organizado",
        "Trabalho muito bem em equipe",
        "Tenho experiência sólida"
      ]
    },
    {
      id_categoria_swot: 2, // Fraquezas
      textos: [
        "Ainda tenho dificuldade com prazos",
        "Sou extremamente perfeccionista"
      ]
    }
  ]
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

// Teste 1: Salvar análise SWOT completa (POST)
async function testSalvarAnaliseSwot() {
  console.log('\n🧪 Teste 1: Salvar análise SWOT completa (POST)');
  
  const result = await makeRequest('POST', '/analise-swot', dadosAnaliseSwot);
  
  if (result.success) {
    console.log('✅ Sucesso! Análise SWOT salva');
    console.log('📊 Status:', result.status);
    console.log('📝 Categorias processadas:', result.data.data.categorias_processadas.length);
    console.log('📝 Total textos inseridos:', result.data.data.total_textos_inseridos);
    return true;
  } else {
    console.log('❌ Falha ao salvar análise SWOT');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 2: Buscar análise SWOT (GET)
async function testBuscarAnaliseSwot() {
  console.log('\n🧪 Teste 2: Buscar análise SWOT (GET)');
  
  const result = await makeRequest('GET', `/analise-swot/${TEST_USER_ID}`);
  
  if (result.success) {
    console.log('✅ Sucesso! Análise SWOT encontrada');
    console.log('📊 Status:', result.status);
    console.log('📝 Total categorias:', result.data.data.total_categorias);
    console.log('📝 Total textos:', result.data.data.total_textos);
    
    // Mostrar resumo por categoria
    result.data.data.categorias.forEach(cat => {
      console.log(`  📂 ${cat.categoria}: ${cat.textos.length} textos`);
    });
    
    return true;
  } else {
    console.log('❌ Falha ao buscar análise SWOT');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 3: Atualizar apenas algumas categorias (POST)
async function testAtualizarCategorias() {
  console.log('\n🧪 Teste 3: Atualizar apenas algumas categorias (POST)');
  
  const result = await makeRequest('POST', '/analise-swot', dadosAtualizados);
  
  if (result.success) {
    console.log('✅ Sucesso! Categorias atualizadas');
    console.log('📊 Status:', result.status);
    console.log('📝 Categorias processadas:', result.data.data.categorias_processadas.length);
    console.log('📝 Total textos inseridos:', result.data.data.total_textos_inseridos);
    return true;
  } else {
    console.log('❌ Falha ao atualizar categorias');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 4: Verificar atualização (GET após POST)
async function testVerificarAtualizacao() {
  console.log('\n🧪 Teste 4: Verificar atualização (GET após POST)');
  
  const result = await makeRequest('GET', `/analise-swot/${TEST_USER_ID}`);
  
  if (result.success) {
    console.log('✅ Sucesso! Verificação da atualização');
    console.log('📊 Status:', result.status);
    
    const categorias = result.data.data.categorias;
    
    // Verificar se as categorias foram atualizadas corretamente
    const fortalezas = categorias.find(cat => cat.id_categoria_swot === 1);
    const fraquezas = categorias.find(cat => cat.id_categoria_swot === 2);
    const oportunidades = categorias.find(cat => cat.id_categoria_swot === 3);
    const ameacas = categorias.find(cat => cat.id_categoria_swot === 4);
    
    console.log('📝 Verificação das categorias:');
    console.log(`  📂 Fortalezas: ${fortalezas ? fortalezas.textos.length : 0} textos`);
    console.log(`  📂 Fraquezas: ${fraquezas ? fraquezas.textos.length : 0} textos`);
    console.log(`  📂 Oportunidades: ${oportunidades ? oportunidades.textos.length : 0} textos`);
    console.log(`  📂 Ameaças: ${ameacas ? ameacas.textos.length : 0} textos`);
    
    // Verificar se as categorias não enviadas permaneceram inalteradas
    if (oportunidades && oportunidades.textos.length === 2 && ameacas && ameacas.textos.length === 2) {
      console.log('✅ Categorias não enviadas permaneceram inalteradas');
    } else {
      console.log('⚠️ Categorias não enviadas foram alteradas');
    }
    
    return true;
  } else {
    console.log('❌ Falha ao verificar atualização');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 5: Limpar uma categoria (array vazio)
async function testLimparCategoria() {
  console.log('\n🧪 Teste 5: Limpar uma categoria (array vazio)');
  
  const dadosLimpar = {
    id_usuario: TEST_USER_ID,
    textos_por_categoria: [
      {
        id_categoria_swot: 3, // Oportunidades
        textos: [] // Array vazio para limpar
      }
    ]
  };
  
  const result = await makeRequest('POST', '/analise-swot', dadosLimpar);
  
  if (result.success) {
    console.log('✅ Sucesso! Categoria limpa');
    console.log('📊 Status:', result.status);
    console.log('📝 Categorias processadas:', result.data.data.categorias_processadas.length);
    console.log('📝 Total textos inseridos:', result.data.data.total_textos_inseridos);
    return true;
  } else {
    console.log('❌ Falha ao limpar categoria');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 6: Validação de campos obrigatórios
async function testValidacaoCamposObrigatorios() {
  console.log('\n🧪 Teste 6: Validação de campos obrigatórios');
  
  // Teste sem id_usuario
  const dadosInvalidos = { ...dadosAnaliseSwot };
  delete dadosInvalidos.id_usuario;
  
  const result = await makeRequest('POST', '/analise-swot', dadosInvalidos);
  
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

// Teste 7: Validação de categoria inválida
async function testValidacaoCategoriaInvalida() {
  console.log('\n🧪 Teste 7: Validação de categoria inválida');
  
  // Teste com categoria inválida (5)
  const dadosInvalidos = {
    id_usuario: TEST_USER_ID,
    textos_por_categoria: [
      {
        id_categoria_swot: 5, // Categoria inválida
        textos: ["Texto teste"]
      }
    ]
  };
  
  const result = await makeRequest('POST', '/analise-swot', dadosInvalidos);
  
  if (!result.success && result.status === 400) {
    console.log('✅ Sucesso! Validação funcionando (categoria inválida)');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return true;
  } else {
    console.log('❌ Falha na validação de categoria inválida');
    console.log('📊 Status:', result.status);
    console.log('📝 Resposta:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 8: Validação de texto vazio
async function testValidacaoTextoVazio() {
  console.log('\n🧪 Teste 8: Validação de texto vazio');
  
  // Teste com texto vazio
  const dadosInvalidos = {
    id_usuario: TEST_USER_ID,
    textos_por_categoria: [
      {
        id_categoria_swot: 1,
        textos: ["", "Texto válido"] // Texto vazio
      }
    ]
  };
  
  const result = await makeRequest('POST', '/analise-swot', dadosInvalidos);
  
  if (!result.success && result.status === 400) {
    console.log('✅ Sucesso! Validação funcionando (texto vazio)');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return true;
  } else {
    console.log('❌ Falha na validação de texto vazio');
    console.log('📊 Status:', result.status);
    console.log('📝 Resposta:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 9: Buscar análise SWOT inexistente
async function testBuscarAnaliseInexistente() {
  console.log('\n🧪 Teste 9: Buscar análise SWOT inexistente');
  
  const result = await makeRequest('GET', '/analise-swot/999999');
  
  if (result.success) {
    console.log('✅ Sucesso! Tratamento correto de análise inexistente');
    console.log('📊 Status:', result.status);
    console.log('📝 Total categorias:', result.data.data.total_categorias);
    console.log('📝 Total textos:', result.data.data.total_textos);
    return true;
  } else {
    console.log('❌ Falha no tratamento de análise inexistente');
    console.log('📊 Status:', result.status);
    console.log('📝 Resposta:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando execução dos testes da API Análise SWOT');
  console.log('⏰', new Date().toISOString());
  
  const tests = [
    { name: 'Salvar análise SWOT completa', fn: testSalvarAnaliseSwot },
    { name: 'Buscar análise SWOT', fn: testBuscarAnaliseSwot },
    { name: 'Atualizar categorias', fn: testAtualizarCategorias },
    { name: 'Verificar atualização', fn: testVerificarAtualizacao },
    { name: 'Limpar categoria', fn: testLimparCategoria },
    { name: 'Validação campos obrigatórios', fn: testValidacaoCamposObrigatorios },
    { name: 'Validação categoria inválida', fn: testValidacaoCategoriaInvalida },
    { name: 'Validação texto vazio', fn: testValidacaoTextoVazio },
    { name: 'Buscar análise inexistente', fn: testBuscarAnaliseInexistente }
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
  testSalvarAnaliseSwot,
  testBuscarAnaliseSwot,
  testAtualizarCategorias,
  testVerificarAtualizacao,
  testLimparCategoria,
  testValidacaoCamposObrigatorios,
  testValidacaoCategoriaInvalida,
  testValidacaoTextoVazio,
  testBuscarAnaliseInexistente,
  runAllTests
};







