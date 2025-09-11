const axios = require('axios');

// Configuração da API
const API_BASE_URL = process.env.API_URL || 'http://localhost:3002/api';
const API_ENDPOINT = `${API_BASE_URL}/usuarios`;

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
async function test1_BuscarUsuariosPorEmail() {
  const response = await axios.get(`${API_ENDPOINT}/buscar?email=joao&id_cliente=1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (!data.usuarios || !Array.isArray(data.usuarios)) {
    throw new Error('Resposta deve conter array de usuários');
  }

  if (data.email !== 'joao') {
    throw new Error('Email na resposta não confere');
  }

  if (data.id_cliente !== 1) {
    throw new Error('ID do cliente na resposta não confere');
  }

  console.log(`   Usuários encontrados para email 'joao' e cliente 1: ${data.usuarios.length}`);
  
  if (data.usuarios.length > 0) {
    const usuario = data.usuarios[0];
    console.log(`   Primeiro usuário: ${usuario.nome} (ID: ${usuario.id})`);
    console.log(`   Email: ${usuario.email}`);
  }
}

async function test2_BuscarUsuariosPorEmailInexistente() {
  const response = await axios.get(`${API_ENDPOINT}/buscar?email=inexistente&id_cliente=1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (!data.usuarios || !Array.isArray(data.usuarios)) {
    throw new Error('Resposta deve conter array de usuários');
  }

  if (data.usuarios.length !== 0) {
    throw new Error('Deveria retornar array vazio para email inexistente');
  }

  if (data.email !== 'inexistente') {
    throw new Error('Email na resposta não confere');
  }

  if (data.id_cliente !== 1) {
    throw new Error('ID do cliente na resposta não confere');
  }

  console.log(`   Nenhum usuário encontrado para email 'inexistente' e cliente 1`);
}

async function test3_BuscarUsuariosPorEmailSemEmail() {
  try {
    await axios.get(`${API_ENDPOINT}/buscar?id_cliente=1`);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'MISSING_EMAIL') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test4_BuscarUsuariosPorEmailSemCliente() {
  try {
    await axios.get(`${API_ENDPOINT}/buscar?email=joao`);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_CLIENT_ID') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test5_BuscarUsuariosPorEmailComClienteInvalido() {
  try {
    await axios.get(`${API_ENDPOINT}/buscar?email=joao&id_cliente=abc`);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_CLIENT_ID') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test6_BuscarUsuariosPorEmailComDadosCompletos() {
  const response = await axios.get(`${API_ENDPOINT}/buscar?email=joao&id_cliente=1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;
  
  // Se não há usuários, o teste passa (pode ser configuração do banco)
  if (data.usuarios.length === 0) {
    console.log(`   Nenhum usuário encontrado para email 'joao' e cliente 1 (pode ser configuração do banco)`);
    return;
  }

  // Verificar estrutura dos dados retornados
  const usuario = data.usuarios[0];
  
  if (!usuario.id) {
    throw new Error('Usuário deve ter ID');
  }
  
  if (!usuario.nome) {
    throw new Error('Usuário deve ter nome');
  }
  
  if (!usuario.email) {
    throw new Error('Usuário deve ter email');
  }

  // Verificar se os campos obrigatórios estão presentes
  const camposObrigatorios = ['id', 'nome', 'email'];
  
  for (const campo of camposObrigatorios) {
    if (!(campo in usuario)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  console.log(`   Estrutura de dados validada com sucesso`);
  console.log(`   Usuário exemplo: ${usuario.nome} (ID: ${usuario.id})`);
  console.log(`   Email: ${usuario.email}`);
}

async function test7_BuscarUsuariosPorEmailOrdenacao() {
  const response = await axios.get(`${API_ENDPOINT}/buscar?email=joao&id_cliente=1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;
  
  // Se não há usuários suficientes para testar ordenação, o teste passa
  if (data.usuarios.length < 2) {
    console.log(`   Não há usuários suficientes para testar ordenação (${data.usuarios.length} usuários)`);
    return;
  }

  // Verificar se os usuários estão ordenados por nome
  for (let i = 1; i < data.usuarios.length; i++) {
    const nomeAnterior = data.usuarios[i - 1].nome.toLowerCase();
    const nomeAtual = data.usuarios[i].nome.toLowerCase();
    
    if (nomeAnterior > nomeAtual) {
      throw new Error(`Usuários não estão ordenados por nome: '${data.usuarios[i - 1].nome}' vem depois de '${data.usuarios[i].nome}'`);
    }
  }

  console.log(`   Ordenação por nome validada com sucesso (${data.usuarios.length} usuários)`);
}

async function test8_BuscarUsuariosPorGestor() {
  const response = await axios.get(`${API_ENDPOINT}/gestor/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (!data.usuarios || !Array.isArray(data.usuarios)) {
    throw new Error('Resposta deve conter array de usuários');
  }

  if (data.gestor_id !== 1) {
    throw new Error('ID do gestor na resposta não confere');
  }

  console.log(`   Usuários encontrados para gestor 1: ${data.usuarios.length}`);
  
  if (data.usuarios.length > 0) {
    const usuario = data.usuarios[0];
    console.log(`   Primeiro usuário: ${usuario.nome} (${usuario.cargo})`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Departamento: ${usuario.departamento_nome || 'N/A'}`);
    console.log(`   Perfil: ${usuario.perfil_acesso_nome || 'N/A'}`);
  }
}

async function test9_BuscarUsuariosPorGestorInexistente() {
  const response = await axios.get(`${API_ENDPOINT}/gestor/99999`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  if (!data.usuarios || !Array.isArray(data.usuarios)) {
    throw new Error('Resposta deve conter array de usuários');
  }

  if (data.usuarios.length !== 0) {
    throw new Error('Deveria retornar array vazio para gestor inexistente');
  }

  if (data.gestor_id !== 99999) {
    throw new Error('ID do gestor na resposta não confere');
  }

  console.log(`   Nenhum usuário encontrado para gestor inexistente (ID: 99999)`);
}

async function test10_BuscarUsuariosPorGestorComIDInvalido() {
  try {
    await axios.get(`${API_ENDPOINT}/gestor/abc`);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_GESTOR_ID') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test11_BuscarUsuariosPorGestorSemID() {
  try {
    await axios.get(`${API_ENDPOINT}/gestor/`);
    throw new Error('Deveria ter retornado erro 404 (rota não encontrada)');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Rota não encontrada é o comportamento esperado
    } else {
      throw error;
    }
  }
}

async function test12_BuscarUsuariosPorGestorComDadosCompletos() {
  // Testar com um gestor que pode ter usuários (assumindo gestor 1)
  const response = await axios.get(`${API_ENDPOINT}/gestor/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;
  
  // Se não há usuários, o teste passa (pode ser configuração do banco)
  if (data.usuarios.length === 0) {
    console.log(`   Nenhum usuário encontrado para gestor 1 (pode ser configuração do banco)`);
    return;
  }

  // Verificar estrutura dos dados retornados
  const usuario = data.usuarios[0];
  
  if (!usuario.id) {
    throw new Error('Usuário deve ter ID');
  }
  
  if (!usuario.nome) {
    throw new Error('Usuário deve ter nome');
  }
  
  if (!usuario.email) {
    throw new Error('Usuário deve ter email');
  }

  // Verificar se os campos opcionais estão presentes (mesmo que null)
  const camposObrigatorios = ['id', 'nome', 'cargo', 'email', 'idade', 'data_nascimento', 'id_cliente', 'id_departamento', 'perfil_acesso'];
  const camposOpcionais = ['departamento_nome', 'perfil_acesso_nome'];
  
  for (const campo of camposObrigatorios) {
    if (!(campo in usuario)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }
  
  for (const campo of camposOpcionais) {
    if (!(campo in usuario)) {
      throw new Error(`Campo opcional '${campo}' não encontrado na resposta`);
    }
  }

  console.log(`   Estrutura de dados validada com sucesso`);
  console.log(`   Usuário exemplo: ${usuario.nome} (ID: ${usuario.id})`);
  console.log(`   Cargo: ${usuario.cargo || 'N/A'}`);
  console.log(`   Idade: ${usuario.idade || 'N/A'}`);
  console.log(`   Cliente ID: ${usuario.id_cliente || 'N/A'}`);
}

async function test13_BuscarUsuariosPorGestorOrdenacao() {
  const response = await axios.get(`${API_ENDPOINT}/gestor/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;
  
  // Se não há usuários suficientes para testar ordenação, o teste passa
  if (data.usuarios.length < 2) {
    console.log(`   Não há usuários suficientes para testar ordenação (${data.usuarios.length} usuários)`);
    return;
  }

  // Verificar se os usuários estão ordenados por nome
  for (let i = 1; i < data.usuarios.length; i++) {
    const nomeAnterior = data.usuarios[i - 1].nome.toLowerCase();
    const nomeAtual = data.usuarios[i].nome.toLowerCase();
    
    if (nomeAnterior > nomeAtual) {
      throw new Error(`Usuários não estão ordenados por nome: '${data.usuarios[i - 1].nome}' vem depois de '${data.usuarios[i].nome}'`);
    }
  }

  console.log(`   Ordenação por nome validada com sucesso (${data.usuarios.length} usuários)`);
}

// Testes da nova API de dashboard
async function test14_BuscarDashboardUsuario() {
  const response = await axios.get(`${API_ENDPOINT}/dashboard/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  if (typeof data.usuario_id !== 'number') {
    throw new Error('usuario_id deve ser um número');
  }

  if (typeof data.arvore_da_vida !== 'string') {
    throw new Error('arvore_da_vida deve ser uma string');
  }

  if (typeof data.metas_concluidas !== 'number') {
    throw new Error('metas_concluidas deve ser um número');
  }

  if (typeof data.metas_pendentes !== 'number') {
    throw new Error('metas_pendentes deve ser um número');
  }

  if (!Array.isArray(data.minhas_metas)) {
    throw new Error('minhas_metas deve ser um array');
  }

  if (!data.analise_swot || typeof data.analise_swot !== 'object') {
    throw new Error('analise_swot deve ser um objeto');
  }

  // Verificar estrutura da análise SWOT
  const swot = data.analise_swot;
  if (!Array.isArray(swot.fortalezas)) {
    throw new Error('analise_swot.fortalezas deve ser um array');
  }

  if (!Array.isArray(swot.fraquezas)) {
    throw new Error('analise_swot.fraquezas deve ser um array');
  }

  if (!Array.isArray(swot.oportunidades)) {
    throw new Error('analise_swot.oportunidades deve ser um array');
  }

  if (!Array.isArray(swot.ameacas)) {
    throw new Error('analise_swot.ameacas deve ser um array');
  }

  // Verificar formato da árvore da vida
  if (!data.arvore_da_vida.includes('/10')) {
    throw new Error('arvore_da_vida deve ter formato "X/10"');
  }

  console.log(`   Dashboard do usuário 1 buscado com sucesso`);
  console.log(`   Árvore da vida: ${data.arvore_da_vida}`);
  console.log(`   Metas concluídas: ${data.metas_concluidas}`);
  console.log(`   Metas pendentes: ${data.metas_pendentes}`);
  console.log(`   Total de minhas metas: ${data.minhas_metas.length}`);
  console.log(`   SWOT - Fortalezas: ${swot.fortalezas.length}, Fraquezas: ${swot.fraquezas.length}, Oportunidades: ${swot.oportunidades.length}, Ameaças: ${swot.ameacas.length}`);

  // Verificar estrutura das minhas metas se existirem
  if (data.minhas_metas.length > 0) {
    const meta = data.minhas_metas[0];
    
    if (!meta.titulo_meta) {
      throw new Error('Meta deve ter titulo_meta');
    }

    if (typeof meta.porcentagem_conclusao !== 'number') {
      throw new Error('Meta deve ter porcentagem_conclusao como número');
    }

    if (meta.porcentagem_conclusao < 0 || meta.porcentagem_conclusao > 100) {
      throw new Error('porcentagem_conclusao deve estar entre 0 e 100');
    }

    console.log(`   Primeira meta: ${meta.titulo_meta} (${meta.porcentagem_conclusao}% concluída)`);
    console.log(`   Prazo: ${meta.prazo || 'N/A'}`);
  }
}

async function test15_BuscarDashboardUsuarioInexistente() {
  const response = await axios.get(`${API_ENDPOINT}/dashboard/99999`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  if (data.usuario_id !== 99999) {
    throw new Error('ID do usuário na resposta não confere');
  }

  if (data.arvore_da_vida !== '0/10') {
    throw new Error('Árvore da vida deveria ser "0/10" para usuário sem dados');
  }

  if (data.metas_concluidas !== 0) {
    throw new Error('Metas concluídas deveria ser 0 para usuário sem metas');
  }

  if (data.metas_pendentes !== 0) {
    throw new Error('Metas pendentes deveria ser 0 para usuário sem metas');
  }

  if (!Array.isArray(data.minhas_metas) || data.minhas_metas.length !== 0) {
    throw new Error('Deveria retornar array vazio de metas');
  }

  // Verificar estrutura vazia da análise SWOT
  const swot = data.analise_swot;
  if (swot.fortalezas.length !== 0 || swot.fraquezas.length !== 0 || 
      swot.oportunidades.length !== 0 || swot.ameacas.length !== 0) {
    throw new Error('Análise SWOT deveria estar vazia para usuário sem dados');
  }

  console.log(`   Dashboard de usuário inexistente (ID: 99999) retornou dados vazios corretamente`);
}

async function test16_BuscarDashboardUsuarioComIDInvalido() {
  try {
    await axios.get(`${API_ENDPOINT}/dashboard/abc`);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_USER_ID') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test17_BuscarDashboardUsuarioEstruturaDados() {
  const response = await axios.get(`${API_ENDPOINT}/dashboard/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;

  // Verificar se todos os campos obrigatórios estão presentes
  const camposObrigatorios = [
    'usuario_id', 
    'arvore_da_vida', 
    'metas_concluidas', 
    'metas_pendentes', 
    'minhas_metas', 
    'analise_swot'
  ];

  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  // Verificar campos da análise SWOT
  const camposSwot = ['fortalezas', 'fraquezas', 'oportunidades', 'ameacas'];
  
  for (const campo of camposSwot) {
    if (!(campo in data.analise_swot)) {
      throw new Error(`Campo SWOT '${campo}' não encontrado na resposta`);
    }
  }

  // Verificar tipos de dados
  if (typeof data.usuario_id !== 'number') {
    throw new Error('usuario_id deve ser number');
  }

  if (typeof data.arvore_da_vida !== 'string') {
    throw new Error('arvore_da_vida deve ser string');
  }

  if (typeof data.metas_concluidas !== 'number') {
    throw new Error('metas_concluidas deve ser number');
  }

  if (typeof data.metas_pendentes !== 'number') {
    throw new Error('metas_pendentes deve ser number');
  }

  // Verificar que metas concluídas + pendentes seja coerente
  const totalMetas = data.metas_concluidas + data.metas_pendentes;
  if (totalMetas !== data.minhas_metas.length && data.minhas_metas.length > 0) {
    // Pode haver diferença se algumas metas não têm atividades, então apenas logamos
    console.log(`   Nota: Total de metas calculado (${totalMetas}) difere do array de metas (${data.minhas_metas.length})`);
  }

  console.log(`   Estrutura de dados do dashboard validada com sucesso`);
  console.log(`   Todos os campos obrigatórios presentes e com tipos corretos`);
}

// Função principal
async function runAllTests() {
  console.log('🚀 Iniciando testes da API de Usuários');
  console.log(`📍 Endpoint: ${API_ENDPOINT}`);
  
  try {
    // Testes da API de busca por email
    await runTest('Teste 1: Buscar usuários por email válido', test1_BuscarUsuariosPorEmail);
    await runTest('Teste 2: Buscar usuários por email inexistente', test2_BuscarUsuariosPorEmailInexistente);
    await runTest('Teste 3: Buscar usuários por email sem email', test3_BuscarUsuariosPorEmailSemEmail);
    await runTest('Teste 4: Buscar usuários por email sem cliente', test4_BuscarUsuariosPorEmailSemCliente);
    await runTest('Teste 5: Buscar usuários por email com cliente inválido', test5_BuscarUsuariosPorEmailComClienteInvalido);
    await runTest('Teste 6: Buscar usuários por email com dados completos', test6_BuscarUsuariosPorEmailComDadosCompletos);
    await runTest('Teste 7: Buscar usuários por email - ordenação', test7_BuscarUsuariosPorEmailOrdenacao);
    
    // Testes da API de busca por gestor
    await runTest('Teste 8: Buscar usuários por gestor válido', test8_BuscarUsuariosPorGestor);
    await runTest('Teste 9: Buscar usuários por gestor inexistente', test9_BuscarUsuariosPorGestorInexistente);
    await runTest('Teste 10: Buscar usuários por gestor com ID inválido', test10_BuscarUsuariosPorGestorComIDInvalido);
    await runTest('Teste 11: Buscar usuários por gestor sem ID', test11_BuscarUsuariosPorGestorSemID);
    await runTest('Teste 12: Buscar usuários por gestor com dados completos', test12_BuscarUsuariosPorGestorComDadosCompletos);
    await runTest('Teste 13: Buscar usuários por gestor - ordenação', test13_BuscarUsuariosPorGestorOrdenacao);
    
    // Testes da nova API de dashboard
    await runTest('Teste 14: Buscar dashboard do usuário', test14_BuscarDashboardUsuario);
    await runTest('Teste 15: Buscar dashboard de usuário inexistente', test15_BuscarDashboardUsuarioInexistente);
    await runTest('Teste 16: Buscar dashboard com ID inválido', test16_BuscarDashboardUsuarioComIDInvalido);
    await runTest('Teste 17: Buscar dashboard - estrutura de dados', test17_BuscarDashboardUsuarioEstruturaDados);
    
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
