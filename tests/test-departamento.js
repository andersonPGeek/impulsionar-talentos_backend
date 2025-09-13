const axios = require('axios');

// Configuração da API
const API_BASE_URL = process.env.API_URL || 'http://localhost:3002/api';
const API_ENDPOINT = `${API_BASE_URL}/departamentos`;

// Variáveis globais para testes
let testClienteId = 1;
let testDepartamentoId = null;
let testDepartamentoNome = 'Departamento Teste';

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

// Testes
async function test1_CriarDepartamento() {
  const departamentoData = {
    titulo_departamento: testDepartamentoNome
  };

  const response = await axios.post(`${API_ENDPOINT}/cliente/${testClienteId}`, departamentoData);

  if (response.status !== 201) {
    throw new Error(`Status esperado: 201, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = ['id', 'titulo_departamento', 'id_cliente', 'created_at'];
  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  if (data.titulo_departamento !== testDepartamentoNome) {
    throw new Error(`Título esperado: ${testDepartamentoNome}, recebido: ${data.titulo_departamento}`);
  }

  if (data.id_cliente !== testClienteId) {
    throw new Error(`ID do cliente esperado: ${testClienteId}, recebido: ${data.id_cliente}`);
  }

  // Salvar ID para próximos testes
  testDepartamentoId = data.id;

  console.log(`   Departamento criado com sucesso - ID: ${testDepartamentoId}`);
  console.log(`   Nome: ${data.titulo_departamento}`);
  console.log(`   Cliente: ${data.id_cliente}`);
}

async function test2_BuscarDepartamentosPorCliente() {
  const response = await axios.get(`${API_ENDPOINT}/cliente/${testClienteId}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = ['cliente_id', 'departamentos'];
  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  if (data.cliente_id !== testClienteId) {
    throw new Error(`ID do cliente esperado: ${testClienteId}, recebido: ${data.cliente_id}`);
  }

  if (!Array.isArray(data.departamentos)) {
    throw new Error('departamentos deve ser um array');
  }

  // Verificar se o departamento criado está na lista
  if (!data.departamentos.includes(testDepartamentoNome)) {
    throw new Error(`Departamento '${testDepartamentoNome}' não encontrado na lista`);
  }

  console.log(`   Departamentos encontrados para cliente ${testClienteId}: ${data.departamentos.length}`);
  console.log(`   Lista: ${data.departamentos.join(', ')}`);
}

async function test3_BuscarDepartamentoEspecifico() {
  const response = await axios.get(`${API_ENDPOINT}/${testDepartamentoId}/cliente/${testClienteId}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = ['id', 'titulo_departamento', 'id_cliente', 'total_usuarios', 'created_at'];
  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  if (data.id !== testDepartamentoId) {
    throw new Error(`ID esperado: ${testDepartamentoId}, recebido: ${data.id}`);
  }

  if (data.titulo_departamento !== testDepartamentoNome) {
    throw new Error(`Título esperado: ${testDepartamentoNome}, recebido: ${data.titulo_departamento}`);
  }

  if (data.id_cliente !== testClienteId) {
    throw new Error(`ID do cliente esperado: ${testClienteId}, recebido: ${data.id_cliente}`);
  }

  if (typeof data.total_usuarios !== 'number') {
    throw new Error('total_usuarios deve ser um número');
  }

  console.log(`   Departamento específico encontrado - ID: ${data.id}`);
  console.log(`   Nome: ${data.titulo_departamento}`);
  console.log(`   Total de usuários: ${data.total_usuarios}`);
}

async function test4_AtualizarDepartamento() {
  const novoNome = 'Departamento Teste Atualizado';
  const departamentoData = {
    titulo_departamento: novoNome
  };

  const response = await axios.put(`${API_ENDPOINT}/${testDepartamentoId}/cliente/${testClienteId}`, departamentoData);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  if (data.titulo_departamento !== novoNome) {
    throw new Error(`Título esperado: ${novoNome}, recebido: ${data.titulo_departamento}`);
  }

  if (data.id !== testDepartamentoId) {
    throw new Error(`ID esperado: ${testDepartamentoId}, recebido: ${data.id}`);
  }

  // Atualizar nome para próximos testes
  testDepartamentoNome = novoNome;

  console.log(`   Departamento atualizado com sucesso - ID: ${data.id}`);
  console.log(`   Novo nome: ${data.titulo_departamento}`);
}

async function test5_CriarDepartamentoDuplicado() {
  const departamentoData = {
    titulo_departamento: testDepartamentoNome // Mesmo nome do departamento existente
  };

  try {
    await axios.post(`${API_ENDPOINT}/cliente/${testClienteId}`, departamentoData);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'DEPARTMENT_ALREADY_EXISTS') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }

  console.log(`   Validação de departamento duplicado funcionando corretamente`);
}

async function test6_BuscarDepartamentoInexistente() {
  try {
    await axios.get(`${API_ENDPOINT}/99999/cliente/${testClienteId}`);
    throw new Error('Deveria ter retornado erro 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      if (!error.response.data.error || error.response.data.error !== 'DEPARTMENT_NOT_FOUND') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }

  console.log(`   Validação de departamento inexistente funcionando corretamente`);
}

async function test7_AtualizarDepartamentoInexistente() {
  const departamentoData = {
    titulo_departamento: 'Nome Qualquer'
  };

  try {
    await axios.put(`${API_ENDPOINT}/99999/cliente/${testClienteId}`, departamentoData);
    throw new Error('Deveria ter retornado erro 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      if (!error.response.data.error || error.response.data.error !== 'DEPARTMENT_NOT_FOUND') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }

  console.log(`   Validação de atualização de departamento inexistente funcionando corretamente`);
}

async function test8_CriarDepartamentoComDadosInvalidos() {
  // Teste com título vazio
  try {
    await axios.post(`${API_ENDPOINT}/cliente/${testClienteId}`, { titulo_departamento: '' });
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_DEPARTMENT_TITLE') {
        throw new Error('Código de erro incorreto para título vazio');
      }
    } else {
      throw error;
    }
  }

  // Teste com título null
  try {
    await axios.post(`${API_ENDPOINT}/cliente/${testClienteId}`, { titulo_departamento: null });
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_DEPARTMENT_TITLE') {
        throw new Error('Código de erro incorreto para título null');
      }
    } else {
      throw error;
    }
  }

  console.log(`   Validação de dados inválidos funcionando corretamente`);
}

async function test9_BuscarDepartamentosClienteInexistente() {
  const response = await axios.get(`${API_ENDPOINT}/cliente/99999`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  if (data.cliente_id !== 99999) {
    throw new Error(`ID do cliente esperado: 99999, recebido: ${data.cliente_id}`);
  }

  if (!Array.isArray(data.departamentos) || data.departamentos.length !== 0) {
    throw new Error('departamentos deveria ser array vazio');
  }

  console.log(`   Busca de departamentos para cliente inexistente retornou dados vazios corretamente`);
}

async function test10_ValidarParametrosInvalidos() {
  // Teste com ID de cliente inválido
  try {
    await axios.get(`${API_ENDPOINT}/cliente/abc`);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_CLIENT_ID') {
        throw new Error('Código de erro incorreto para ID cliente inválido');
      }
    } else {
      throw error;
    }
  }

  // Teste com ID de departamento inválido
  try {
    await axios.get(`${API_ENDPOINT}/abc/cliente/${testClienteId}`);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_DEPARTMENT_ID') {
        throw new Error('Código de erro incorreto para ID departamento inválido');
      }
    } else {
      throw error;
    }
  }

  console.log(`   Validação de parâmetros inválidos funcionando corretamente`);
}

async function test11_DeletarDepartamento() {
  const response = await axios.delete(`${API_ENDPOINT}/${testDepartamentoId}/cliente/${testClienteId}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  if (data.id !== testDepartamentoId) {
    throw new Error(`ID esperado: ${testDepartamentoId}, recebido: ${data.id}`);
  }

  if (data.titulo_departamento !== testDepartamentoNome) {
    throw new Error(`Título esperado: ${testDepartamentoNome}, recebido: ${data.titulo_departamento}`);
  }

  console.log(`   Departamento deletado com sucesso - ID: ${data.id}`);
  console.log(`   Nome: ${data.titulo_departamento}`);
}

async function test12_DeletarDepartamentoInexistente() {
  try {
    await axios.delete(`${API_ENDPOINT}/99999/cliente/${testClienteId}`);
    throw new Error('Deveria ter retornado erro 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      if (!error.response.data.error || error.response.data.error !== 'DEPARTMENT_NOT_FOUND') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }

  console.log(`   Validação de exclusão de departamento inexistente funcionando corretamente`);
}

async function test13_VerificarDepartamentoDeletado() {
  try {
    await axios.get(`${API_ENDPOINT}/${testDepartamentoId}/cliente/${testClienteId}`);
    throw new Error('Deveria ter retornado erro 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      if (!error.response.data.error || error.response.data.error !== 'DEPARTMENT_NOT_FOUND') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }

  console.log(`   Confirmação de exclusão: departamento não pode mais ser encontrado`);
}

// Função principal
async function runAllTests() {
  console.log('🚀 Iniciando testes da API de Departamentos');
  console.log(`📍 Endpoint: ${API_ENDPOINT}`);
  console.log(`🏢 Cliente de teste: ${testClienteId}`);
  
  try {
    // Testes CRUD
    await runTest('Teste 1: Criar departamento', test1_CriarDepartamento);
    await runTest('Teste 2: Buscar departamentos por cliente', test2_BuscarDepartamentosPorCliente);
    await runTest('Teste 3: Buscar departamento específico', test3_BuscarDepartamentoEspecifico);
    await runTest('Teste 4: Atualizar departamento', test4_AtualizarDepartamento);
    
    // Testes de validação
    await runTest('Teste 5: Criar departamento duplicado', test5_CriarDepartamentoDuplicado);
    await runTest('Teste 6: Buscar departamento inexistente', test6_BuscarDepartamentoInexistente);
    await runTest('Teste 7: Atualizar departamento inexistente', test7_AtualizarDepartamentoInexistente);
    await runTest('Teste 8: Criar departamento com dados inválidos', test8_CriarDepartamentoComDadosInvalidos);
    await runTest('Teste 9: Buscar departamentos de cliente inexistente', test9_BuscarDepartamentosClienteInexistente);
    await runTest('Teste 10: Validar parâmetros inválidos', test10_ValidarParametrosInvalidos);
    
    // Testes de exclusão
    await runTest('Teste 11: Deletar departamento', test11_DeletarDepartamento);
    await runTest('Teste 12: Deletar departamento inexistente', test12_DeletarDepartamentoInexistente);
    await runTest('Teste 13: Verificar departamento deletado', test13_VerificarDepartamentoDeletado);
    
    console.log('\n🎉 Todos os testes concluídos!');
    
  } catch (error) {
    console.error('\n💥 Erro durante a execução dos testes:', error.message);
  }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };

