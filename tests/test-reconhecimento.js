const axios = require('axios');

// Configuração da API
const API_BASE_URL = process.env.API_URL || 'http://localhost:3002/api';
const API_ENDPOINT = `${API_BASE_URL}/reconhecimento`;

// Variáveis globais para testes
let testUsuarioId1 = null;
let testUsuarioId2 = null;
let testTipoReconhecimentoId = null;
let testReconhecimentoId = null;
let authToken = null;

// Função para executar teste
async function runTest(testName, testFunction) {
  console.log(`\n🧪 Executando: ${testName}`);
  try {
    await testFunction();
    console.log(`✅ ${testName} - PASSOU`);
  } catch (error) {
    console.log(`❌ ${testName} - FALHOU`);
    console.log(`   Erro: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Resposta: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Função para obter token de autenticação e configurar usuários de teste
async function obterToken() {
  try {
    // Primeiro, vamos tentar criar usuários de teste se não existirem
    try {
      const response1 = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: 'test1@reconhecimento.com',
        senha: '123456',
        nome: 'Usuário Teste 1',
        id_cliente: 1
      });
      console.log('✅ Usuário de teste 1 criado');
      testUsuarioId1 = response1.data.data.id;
    } catch (registerError) {
      console.log('ℹ️  Usuário de teste 1 já existe ou erro na criação');
      if (registerError.response && registerError.response.status === 400) {
        console.log('   Tentando fazer login com usuário existente...');
      }
    }

    try {
      const response2 = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: 'test2@reconhecimento.com',
        senha: '123456',
        nome: 'Usuário Teste 2',
        id_cliente: 1
      });
      console.log('✅ Usuário de teste 2 criado');
      testUsuarioId2 = response2.data.data.id;
    } catch (registerError) {
      console.log('ℹ️  Usuário de teste 2 já existe ou erro na criação');
    }

    // Agora tentamos fazer login com o primeiro usuário
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test1@reconhecimento.com',
      senha: '123456'
    });
    
    console.log('Resposta do login:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.data.success && loginResponse.data.data && loginResponse.data.data.token) {
      authToken = loginResponse.data.data.token;
      console.log('✅ Token de autenticação obtido com sucesso');
      
      // Se não temos os IDs dos usuários, buscar agora
      if (!testUsuarioId1 || !testUsuarioId2) {
        await buscarUsuariosTeste();
      }
    } else {
      throw new Error('Falha ao obter token de autenticação - estrutura de resposta inesperada');
    }
  } catch (error) {
    console.log('⚠️  Não foi possível obter token de autenticação. Testes podem falhar.');
    console.log(`   Erro: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Resposta: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Função para buscar IDs dos usuários de teste
async function buscarUsuariosTeste() {
  try {
    // Buscar usuários por email
    const response1 = await axios.get(`${API_BASE_URL}/usuarios/buscar?email=test1@reconhecimento.com&id_cliente=1`);
    if (response1.data.success && response1.data.data.usuarios.length > 0) {
      testUsuarioId1 = response1.data.data.usuarios[0].id;
      console.log(`✅ ID do usuário 1 obtido: ${testUsuarioId1}`);
    }

    const response2 = await axios.get(`${API_BASE_URL}/usuarios/buscar?email=test2@reconhecimento.com&id_cliente=1`);
    if (response2.data.success && response2.data.data.usuarios.length > 0) {
      testUsuarioId2 = response2.data.data.usuarios[0].id;
      console.log(`✅ ID do usuário 2 obtido: ${testUsuarioId2}`);
    }

    // Se não encontrou os usuários, usar IDs padrão
    if (!testUsuarioId1) {
      testUsuarioId1 = 1;
      console.log('⚠️  Usando ID padrão para usuário 1');
    }
    if (!testUsuarioId2) {
      testUsuarioId2 = 2;
      console.log('⚠️  Usando ID padrão para usuário 2');
    }
  } catch (error) {
    console.log('⚠️  Erro ao buscar usuários de teste, usando IDs padrão');
    testUsuarioId1 = 1;
    testUsuarioId2 = 2;
  }
}

// Configuração do axios com token
const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token automaticamente
apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Testes para Tipos de Reconhecimento
async function test1_BuscarTiposReconhecimento() {
  const response = await apiClient.get('/tipos');

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (!data.tipos || !Array.isArray(data.tipos)) {
    throw new Error('Resposta deve conter array de tipos');
  }

  console.log(`   Tipos de reconhecimento encontrados: ${data.tipos.length}`);
  
  if (data.tipos.length > 0) {
    const tipo = data.tipos[0];
    console.log(`   Primeiro tipo: ${tipo.reconhecimento} (ID: ${tipo.id})`);
    testTipoReconhecimentoId = tipo.id;
  } else {
    console.log('   Nenhum tipo encontrado, será criado um novo no próximo teste');
  }
}

async function test2_CriarTipoReconhecimento() {
  const novoTipo = {
    reconhecimento: 'Excelente Trabalho em Equipe',
    icone_reconhecimento: '👥'
  };

  const response = await apiClient.post('/tipos', novoTipo);

  if (response.status !== 201) {
    throw new Error(`Status esperado: 201, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (!data.id) {
    throw new Error('Resposta deve conter ID do tipo criado');
  }

  if (data.reconhecimento !== novoTipo.reconhecimento) {
    throw new Error('Nome do tipo na resposta não confere');
  }

  testTipoReconhecimentoId = data.id;
  console.log(`   Tipo de reconhecimento criado: ${data.reconhecimento} (ID: ${data.id})`);
}

async function test3_CriarTipoReconhecimentoDuplicado() {
  const tipoDuplicado = {
    reconhecimento: 'Excelente Trabalho em Equipe',
    icone_reconhecimento: '👥'
  };

  try {
    await apiClient.post('/tipos', tipoDuplicado);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'RECOGNITION_TYPE_ALREADY_EXISTS') {
        throw new Error(`Código de erro incorreto: ${error.response.data.error}`);
      }
      console.log('   Tipo duplicado rejeitado corretamente');
    } else {
      throw error;
    }
  }
}

async function test4_AtualizarTipoReconhecimento() {
  if (!testTipoReconhecimentoId) {
    console.log('   ⚠️  Pulando teste - ID do tipo de reconhecimento não disponível');
    return;
  }

  const dadosAtualizacao = {
    reconhecimento: 'Excelente Trabalho em Equipe - Atualizado',
    icone_reconhecimento: '🌟'
  };

  const response = await apiClient.put(`/tipos/${testTipoReconhecimentoId}`, dadosAtualizacao);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (data.reconhecimento !== dadosAtualizacao.reconhecimento) {
    throw new Error('Nome do tipo atualizado não confere');
  }

  console.log(`   Tipo de reconhecimento atualizado: ${data.reconhecimento}`);
}

// Testes para Reconhecimentos
async function test5_CriarReconhecimento() {
  if (!testTipoReconhecimentoId) {
    console.log('   ⚠️  Pulando teste - ID do tipo de reconhecimento não disponível');
    return;
  }

  const novoReconhecimento = {
    id_usuario_reconhecido: testUsuarioId1,
    id_usuario_reconheceu: testUsuarioId2,
    motivo_reconhecimento: 'Demonstrou excelente colaboração no projeto X',
    id_tipo_reconhecimento: testTipoReconhecimentoId
  };

  const response = await apiClient.post('/', novoReconhecimento);

  if (response.status !== 201) {
    throw new Error(`Status esperado: 201, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (!data.id) {
    throw new Error('Resposta deve conter ID do reconhecimento criado');
  }

  if (data.id_usuario_reconhecido !== novoReconhecimento.id_usuario_reconhecido) {
    throw new Error('ID do usuário reconhecido na resposta não confere');
  }

  testReconhecimentoId = data.id;
  console.log(`   Reconhecimento criado: ID ${data.id} para usuário ${data.id_usuario_reconhecido}`);
}

async function test6_CriarReconhecimentoAutoReconhecimento() {
  if (!testTipoReconhecimentoId) {
    console.log('   ⚠️  Pulando teste - ID do tipo de reconhecimento não disponível');
    return;
  }

  const reconhecimentoAuto = {
    id_usuario_reconhecido: testUsuarioId1,
    id_usuario_reconheceu: testUsuarioId1, // Mesmo usuário
    motivo_reconhecimento: 'Auto reconhecimento',
    id_tipo_reconhecimento: testTipoReconhecimentoId
  };

  try {
    await apiClient.post('/', reconhecimentoAuto);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'SELF_RECOGNITION') {
        throw new Error('Código de erro incorreto');
      }
      console.log('   Auto reconhecimento rejeitado corretamente');
    } else {
      throw error;
    }
  }
}

async function test7_BuscarReconhecimentoEspecifico() {
  if (!testReconhecimentoId) {
    console.log('   ⚠️  Pulando teste - ID do reconhecimento não disponível');
    return;
  }

  const response = await apiClient.get(`/${testReconhecimentoId}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (data.id !== testReconhecimentoId) {
    throw new Error('ID do reconhecimento na resposta não confere');
  }

  if (!data.usuario_reconhecido || !data.usuario_reconheceu) {
    throw new Error('Dados dos usuários não encontrados na resposta');
  }

  console.log(`   Reconhecimento encontrado: ${data.motivo_reconhecimento}`);
  console.log(`   Reconhecido: ${data.usuario_reconhecido.nome}`);
  console.log(`   Reconheceu: ${data.usuario_reconheceu.nome}`);
}

async function test8_BuscarReconhecimentosPorUsuario() {
  const response = await apiClient.get(`/usuario/${testUsuarioId1}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (!data.reconhecimentos || !Array.isArray(data.reconhecimentos)) {
    throw new Error('Resposta deve conter array de reconhecimentos');
  }

  if (data.usuario_id !== testUsuarioId1) {
    throw new Error('ID do usuário na resposta não confere');
  }

  console.log(`   Reconhecimentos recebidos pelo usuário ${testUsuarioId1}: ${data.reconhecimentos.length}`);
  
  if (data.reconhecimentos.length > 0) {
    const reconhecimento = data.reconhecimentos[0];
    console.log(`   Primeiro reconhecimento: ${reconhecimento.motivo_reconhecimento}`);
  }
}

async function test9_BuscarReconhecimentosDadosPorUsuario() {
  const response = await apiClient.get(`/dados-por/${testUsuarioId2}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (!data.reconhecimentos || !Array.isArray(data.reconhecimentos)) {
    throw new Error('Resposta deve conter array de reconhecimentos');
  }

  if (data.usuario_id !== testUsuarioId2) {
    throw new Error('ID do usuário na resposta não confere');
  }

  console.log(`   Reconhecimentos dados pelo usuário ${testUsuarioId2}: ${data.reconhecimentos.length}`);
  
  if (data.reconhecimentos.length > 0) {
    const reconhecimento = data.reconhecimentos[0];
    console.log(`   Primeiro reconhecimento dado: ${reconhecimento.motivo_reconhecimento}`);
  }
}

async function test10_AtualizarReconhecimento() {
  if (!testReconhecimentoId) {
    console.log('   ⚠️  Pulando teste - ID do reconhecimento não disponível');
    return;
  }

  const dadosAtualizacao = {
    motivo_reconhecimento: 'Demonstrou excelente colaboração no projeto X - Atualizado',
    id_tipo_reconhecimento: testTipoReconhecimentoId
  };

  const response = await apiClient.put(`/${testReconhecimentoId}`, dadosAtualizacao);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (data.motivo_reconhecimento !== dadosAtualizacao.motivo_reconhecimento) {
    throw new Error('Motivo do reconhecimento atualizado não confere');
  }

  console.log(`   Reconhecimento atualizado: ${data.motivo_reconhecimento}`);
}

async function test11_BuscarReconhecimentoInexistente() {
  try {
    await apiClient.get('/99999');
    throw new Error('Deveria ter retornado erro 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      if (!error.response.data.error || error.response.data.error !== 'RECOGNITION_NOT_FOUND') {
        throw new Error('Código de erro incorreto');
      }
      console.log('   Reconhecimento inexistente rejeitado corretamente');
    } else {
      throw error;
    }
  }
}

async function test12_BuscarReconhecimentosUsuarioInexistente() {
  try {
    await apiClient.get('/usuario/99999');
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_USER_ID') {
        throw new Error('Código de erro incorreto');
      }
      console.log('   Usuário inexistente rejeitado corretamente');
    } else {
      throw error;
    }
  }
}

async function test13_DeletarReconhecimento() {
  if (!testReconhecimentoId) {
    console.log('   ⚠️  Pulando teste - ID do reconhecimento não disponível');
    return;
  }

  const response = await apiClient.delete(`/${testReconhecimentoId}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (data.id !== testReconhecimentoId) {
    throw new Error('ID do reconhecimento deletado não confere');
  }

  console.log(`   Reconhecimento deletado: ID ${data.id}`);
}

async function test14_DeletarTipoReconhecimento() {
  if (!testTipoReconhecimentoId) {
    console.log('   ⚠️  Pulando teste - ID do tipo de reconhecimento não disponível');
    return;
  }

  const response = await apiClient.delete(`/tipos/${testTipoReconhecimentoId}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (data.id !== testTipoReconhecimentoId) {
    throw new Error('ID do tipo de reconhecimento deletado não confere');
  }

  console.log(`   Tipo de reconhecimento deletado: ID ${data.id}`);
}

// Função principal para executar todos os testes
async function executarTestes() {
  console.log('🚀 Iniciando testes da API de Reconhecimento');
  console.log('===============================================');

  // Obter token de autenticação
  await obterToken();

  // Executar testes
  await runTest('1. Buscar tipos de reconhecimento', test1_BuscarTiposReconhecimento);
  await runTest('2. Criar tipo de reconhecimento', test2_CriarTipoReconhecimento);
  await runTest('3. Criar tipo de reconhecimento duplicado', test3_CriarTipoReconhecimentoDuplicado);
  await runTest('4. Atualizar tipo de reconhecimento', test4_AtualizarTipoReconhecimento);
  await runTest('5. Criar reconhecimento', test5_CriarReconhecimento);
  await runTest('6. Criar reconhecimento (auto reconhecimento)', test6_CriarReconhecimentoAutoReconhecimento);
  await runTest('7. Buscar reconhecimento específico', test7_BuscarReconhecimentoEspecifico);
  await runTest('8. Buscar reconhecimentos por usuário', test8_BuscarReconhecimentosPorUsuario);
  await runTest('9. Buscar reconhecimentos dados por usuário', test9_BuscarReconhecimentosDadosPorUsuario);
  await runTest('10. Atualizar reconhecimento', test10_AtualizarReconhecimento);
  await runTest('11. Buscar reconhecimento inexistente', test11_BuscarReconhecimentoInexistente);
  await runTest('12. Buscar reconhecimentos usuário inexistente', test12_BuscarReconhecimentosUsuarioInexistente);
  await runTest('13. Deletar reconhecimento', test13_DeletarReconhecimento);
  await runTest('14. Deletar tipo de reconhecimento', test14_DeletarTipoReconhecimento);

  console.log('\n===============================================');
  console.log('✅ Testes da API de Reconhecimento concluídos!');
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  executarTestes().catch(console.error);
}

module.exports = {
  executarTestes,
  runTest
};
