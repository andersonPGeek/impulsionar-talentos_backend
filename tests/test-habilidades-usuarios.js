const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3002/api';
const TEST_USER_ID = 1;
const TEST_HABILIDADE_ID = 1;

console.log('🧪 Iniciando testes da API Habilidades de Usuários');
console.log('📍 URL Base:', BASE_URL);

// Dados de teste
const dadosHabilidade = {
  id_usuario: TEST_USER_ID,
  id_habilidade: TEST_HABILIDADE_ID,
  nivel: 3
};

const dadosHabilidadeAtualizada = {
  id_usuario: TEST_USER_ID,
  id_habilidade: TEST_HABILIDADE_ID,
  nivel: 4
};

// Função auxiliar para fazer requisições
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
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
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Teste 1: Adicionar habilidade (POST)
async function testAdicionarHabilidade() {
  console.log('\n🧪 Teste 1: Adicionar habilidade (POST)');
  
  const result = await makeRequest('POST', '/habilidades-usuarios', dadosHabilidade);
  
  if (result.success) {
    console.log('✅ Sucesso! Habilidade adicionada');
    console.log('📊 Status:', result.status);
    console.log('📝 Dados criados:', JSON.stringify(result.data.data, null, 2));
    return true;
  } else {
    console.log('❌ Falha ao adicionar habilidade');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 2: Buscar habilidades por usuário (GET)
async function testBuscarHabilidadesPorUsuario() {
  console.log('\n🧪 Teste 2: Buscar habilidades por usuário (GET)');
  
  const result = await makeRequest('GET', `/habilidades-usuarios/usuario/${TEST_USER_ID}`);
  
  if (result.success) {
    console.log('✅ Sucesso! Habilidades encontradas');
    console.log('📊 Status:', result.status);
    console.log('📝 Total habilidades:', result.data.data.total_habilidades);
    console.log('📝 Usuário:', result.data.data.usuario.nome);
    return true;
  } else {
    console.log('❌ Falha ao buscar habilidades');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 3: Adicionar habilidade novamente (POST - criação contínua)
async function testCriacaoContinua() {
  console.log('\n🧪 Teste 3: Adicionar habilidade novamente (POST - criação contínua)');
  
  const result = await makeRequest('POST', '/habilidades-usuarios', dadosHabilidadeAtualizada);
  
  if (result.success) {
    console.log('✅ Sucesso! Nova habilidade adicionada (criação contínua)');
    console.log('📊 Status:', result.status);
    console.log('📝 Dados criados:', JSON.stringify(result.data.data, null, 2));
    console.log('📝 Mensagem:', result.data.message);
    return true;
  } else {
    console.log('❌ Falha ao adicionar habilidade novamente');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 4: Verificar que GET retorna o registro mais recente
async function testVerificarRegistroMaisRecente() {
  console.log('\n🧪 Teste 4: Verificar que GET retorna o registro mais recente');
  
  const result = await makeRequest('GET', `/habilidades-usuarios/usuario/${TEST_USER_ID}`);
  
  if (result.success) {
    console.log('✅ Sucesso! Verificação do registro mais recente');
    console.log('📊 Status:', result.status);
    
    const habilidades = result.data.data.habilidades;
    const habilidadeTeste = habilidades.find(h => h.id_habilidade === TEST_HABILIDADE_ID);
    
    if (habilidadeTeste) {
      console.log('📝 Habilidade encontrada:', habilidadeTeste.titulo);
      console.log('📝 Nível atual:', habilidadeTeste.nivel);
      console.log('📝 Created at:', habilidadeTeste.created_at);
      
      // Verificar se o nível corresponde ao mais recente (4)
      if (habilidadeTeste.nivel === 4) {
        console.log('✅ GET retornou corretamente o registro mais recente (nível 4)');
        return true;
      } else {
        console.log('⚠️ GET não retornou o registro mais recente');
        return false;
      }
    } else {
      console.log('⚠️ Habilidade de teste não encontrada');
      return false;
    }
  } else {
    console.log('❌ Falha ao verificar registro mais recente');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 5: Buscar habilidade específica (GET por ID)
async function testBuscarHabilidadeEspecifica() {
  console.log('\n🧪 Teste 5: Buscar habilidade específica (GET por ID)');
  
  // Primeiro, buscar habilidades para obter um ID válido
  const habilidadesResult = await makeRequest('GET', `/habilidades-usuarios/usuario/${TEST_USER_ID}`);
  
  if (!habilidadesResult.success) {
    console.log('❌ Falha ao buscar habilidades para obter ID');
    return false;
  }
  
  const habilidades = habilidadesResult.data.data.habilidades;
  const habilidadeComId = habilidades.find(h => h.id);
  
  if (!habilidadeComId) {
    console.log('⚠️ Nenhuma habilidade com ID encontrada');
    return false;
  }
  
  const result = await makeRequest('GET', `/habilidades-usuarios/${habilidadeComId.id}`);
  
  if (result.success) {
    console.log('✅ Sucesso! Habilidade específica encontrada');
    console.log('📊 Status:', result.status);
    console.log('📝 Dados:', JSON.stringify(result.data.data, null, 2));
    return true;
  } else {
    console.log('❌ Falha ao buscar habilidade específica');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Teste 6: Validação de campos obrigatórios
async function testValidacaoCamposObrigatorios() {
  console.log('\n🧪 Teste 6: Validação de campos obrigatórios');
  
  // Teste sem id_usuario
  const dadosInvalidos = { ...dadosHabilidade };
  delete dadosInvalidos.id_usuario;
  
  const result = await makeRequest('POST', '/habilidades-usuarios', dadosInvalidos);
  
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

// Teste 7: Validação de nível inválido
async function testValidacaoNivelInvalido() {
  console.log('\n🧪 Teste 7: Validação de nível inválido');
  
  // Teste com nível inválido (6)
  const dadosInvalidos = { ...dadosHabilidade };
  dadosInvalidos.nivel = 6;
  
  const result = await makeRequest('POST', '/habilidades-usuarios', dadosInvalidos);
  
  if (!result.success && result.status === 400) {
    console.log('✅ Sucesso! Validação funcionando (nível fora do range 1-5)');
    console.log('📊 Status:', result.status);
    console.log('📝 Erro:', JSON.stringify(result.error, null, 2));
    return true;
  } else {
    console.log('❌ Falha na validação de nível inválido');
    console.log('📊 Status:', result.status);
    console.log('📝 Resposta:', JSON.stringify(result.error, null, 2));
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando execução dos testes da API Habilidades de Usuários');
  console.log('⏰', new Date().toISOString());
  
  const tests = [
    { name: 'Adicionar habilidade', fn: testAdicionarHabilidade },
    { name: 'Buscar habilidades por usuário', fn: testBuscarHabilidadesPorUsuario },
    { name: 'Criação contínua', fn: testCriacaoContinua },
    { name: 'Verificar registro mais recente', fn: testVerificarRegistroMaisRecente },
    { name: 'Buscar habilidade específica', fn: testBuscarHabilidadeEspecifica },
    { name: 'Validação campos obrigatórios', fn: testValidacaoCamposObrigatorios },
    { name: 'Validação nível inválido', fn: testValidacaoNivelInvalido }
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
  testAdicionarHabilidade,
  testBuscarHabilidadesPorUsuario,
  testCriacaoContinua,
  testVerificarRegistroMaisRecente,
  testBuscarHabilidadeEspecifica,
  testValidacaoCamposObrigatorios,
  testValidacaoNivelInvalido,
  runAllTests
};






