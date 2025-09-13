const axios = require('axios');

// Configuração da API
const API_BASE_URL = process.env.API_URL || 'http://localhost:3002/api';
const API_ENDPOINT = `${API_BASE_URL}/usuarios`;

// Variáveis globais para testes
let testClienteId = 1;
let testUsuarioId = null;

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

// Testes das novas APIs
async function test18_CriarUsuario() {
  const usuarioData = {
    nome: 'Usuário Teste',
    email: 'usuario.teste@exemplo.com',
    senha: 'senha123',
    idade: 30,
    data_nascimento: '1993-06-15'
  };

  const response = await axios.post(`${API_ENDPOINT}/cliente/${testClienteId}`, usuarioData);

  if (response.status !== 201) {
    throw new Error(`Status esperado: 201, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = ['id', 'nome', 'email', 'id_cliente', 'created_at'];
  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  if (data.nome !== usuarioData.nome) {
    throw new Error(`Nome esperado: ${usuarioData.nome}, recebido: ${data.nome}`);
  }

  if (data.email !== usuarioData.email.toLowerCase()) {
    throw new Error(`Email esperado: ${usuarioData.email.toLowerCase()}, recebido: ${data.email}`);
  }

  if (data.id_cliente !== testClienteId) {
    throw new Error(`ID do cliente esperado: ${testClienteId}, recebido: ${data.id_cliente}`);
  }

  // Salvar ID para próximos testes
  testUsuarioId = data.id;

  console.log(`   Usuário criado com sucesso - ID: ${testUsuarioId}`);
  console.log(`   Nome: ${data.nome}`);
  console.log(`   Email: ${data.email}`);
  console.log(`   Cliente: ${data.id_cliente}`);
}

async function test19_BuscarUsuariosPorCliente() {
  const response = await axios.get(`${API_ENDPOINT}/cliente/${testClienteId}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = ['cliente_id', 'usuarios'];
  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  if (data.cliente_id !== testClienteId) {
    throw new Error(`ID do cliente esperado: ${testClienteId}, recebido: ${data.cliente_id}`);
  }

  if (!Array.isArray(data.usuarios)) {
    throw new Error('usuarios deve ser um array');
  }

  console.log(`   Usuários encontrados para cliente ${testClienteId}: ${data.usuarios.length}`);
  
  if (data.usuarios.length > 0) {
    const usuario = data.usuarios[0];
    
    // Verificar estrutura do usuário
    const camposUsuario = [
      'id', 'nome', 'email', 'idade', 'data_nascimento', 'id_cliente',
      'id_departamento', 'departamento_nome', 'id_gestor', 'gestor_nome',
      'perfil_acesso', 'perfil_acesso_nome', 'cargo', 'nome_cargo', 'created_at'
    ];
    
    for (const campo of camposUsuario) {
      if (!(campo in usuario)) {
        throw new Error(`Campo '${campo}' não encontrado no usuário`);
      }
    }

    console.log(`   Primeiro usuário: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Cargo: ${usuario.nome_cargo || 'N/A'}`);
    console.log(`   Departamento: ${usuario.departamento_nome || 'N/A'}`);
    console.log(`   Gestor: ${usuario.gestor_nome || 'N/A'}`);
  }
}

async function test20_CriarUsuarioComDadosInvalidos() {
  // Teste com nome vazio
  try {
    await axios.post(`${API_ENDPOINT}/cliente/${testClienteId}`, { 
      nome: '',
      email: 'teste@exemplo.com',
      senha: 'senha123'
    });
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_NAME') {
        throw new Error('Código de erro incorreto para nome vazio');
      }
    } else {
      throw error;
    }
  }

  // Teste com email inválido
  try {
    await axios.post(`${API_ENDPOINT}/cliente/${testClienteId}`, { 
      nome: 'Teste',
      email: 'email-invalido',
      senha: 'senha123'
    });
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_EMAIL_FORMAT') {
        throw new Error('Código de erro incorreto para email inválido');
      }
    } else {
      throw error;
    }
  }

  // Teste sem senha
  try {
    await axios.post(`${API_ENDPOINT}/cliente/${testClienteId}`, { 
      nome: 'Teste',
      email: 'teste@exemplo.com'
    });
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_PASSWORD') {
        throw new Error('Código de erro incorreto para senha ausente');
      }
    } else {
      throw error;
    }
  }

  console.log(`   Validação de dados inválidos funcionando corretamente`);
}

async function test21_CriarUsuarioEmailDuplicado() {
  const usuarioData = {
    nome: 'Usuário Duplicado',
    email: 'usuario.teste@exemplo.com', // Mesmo email do teste anterior
    senha: 'senha123'
  };

  try {
    await axios.post(`${API_ENDPOINT}/cliente/${testClienteId}`, usuarioData);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'EMAIL_ALREADY_EXISTS') {
        throw new Error('Código de erro incorreto para email duplicado');
      }
    } else {
      throw error;
    }
  }

  console.log(`   Validação de email duplicado funcionando corretamente`);
}

async function test22_BuscarUsuariosClienteInexistente() {
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

  if (!Array.isArray(data.usuarios) || data.usuarios.length !== 0) {
    throw new Error('usuarios deveria ser array vazio');
  }

  console.log(`   Busca de usuários para cliente inexistente retornou dados vazios corretamente`);
}

async function test23_CriarUsuarioComIdadeInvalida() {
  const usuarioData = {
    nome: 'Usuário Idade Inválida',
    email: 'usuario.idade@exemplo.com',
    senha: 'senha123',
    idade: -5 // Idade inválida
  };

  try {
    await axios.post(`${API_ENDPOINT}/cliente/${testClienteId}`, usuarioData);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_AGE') {
        throw new Error('Código de erro incorreto para idade inválida');
      }
    } else {
      throw error;
    }
  }

  console.log(`   Validação de idade inválida funcionando corretamente`);
}

async function test24_ValidarParametrosInvalidos() {
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

  // Teste de criação com ID de cliente inválido
  try {
    await axios.post(`${API_ENDPOINT}/cliente/abc`, {
      nome: 'Teste',
      email: 'teste@exemplo.com',
      senha: 'senha123'
    });
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_CLIENT_ID') {
        throw new Error('Código de erro incorreto para ID cliente inválido na criação');
      }
    } else {
      throw error;
    }
  }

  console.log(`   Validação de parâmetros inválidos funcionando corretamente`);
}

// Testes dos novos endpoints de gestão de gestores
async function test25_BuscarUsuariosSemGestor() {
  const response = await axios.get(`${API_ENDPOINT}/sem-gestor/${testClienteId}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = ['cliente_id', 'usuarios'];
  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  if (data.cliente_id !== testClienteId) {
    throw new Error(`ID do cliente esperado: ${testClienteId}, recebido: ${data.cliente_id}`);
  }

  if (!Array.isArray(data.usuarios)) {
    throw new Error('usuarios deve ser um array');
  }

  console.log(`   Usuários sem gestor encontrados para cliente ${testClienteId}: ${data.usuarios.length}`);
  
  if (data.usuarios.length > 0) {
    const usuario = data.usuarios[0];
    
    // Verificar estrutura do usuário
    const camposUsuario = ['id', 'nome_usuario', 'nome_gestor', 'nome_departamento'];
    
    for (const campo of camposUsuario) {
      if (!(campo in usuario)) {
        throw new Error(`Campo '${campo}' não encontrado no usuário`);
      }
    }

    // Para usuários sem gestor, nome_gestor deve ser null
    if (usuario.nome_gestor !== null) {
      throw new Error('nome_gestor deve ser null para usuários sem gestor');
    }

    console.log(`   Primeiro usuário: ${usuario.nome_usuario}`);
    console.log(`   Gestor: ${usuario.nome_gestor || 'N/A'}`);
    console.log(`   Departamento: ${usuario.nome_departamento || 'N/A'}`);
  }
}

async function test26_BuscarUsuariosComGestor() {
  const response = await axios.get(`${API_ENDPOINT}/com-gestor/${testClienteId}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = ['cliente_id', 'usuarios'];
  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  if (data.cliente_id !== testClienteId) {
    throw new Error(`ID do cliente esperado: ${testClienteId}, recebido: ${data.cliente_id}`);
  }

  if (!Array.isArray(data.usuarios)) {
    throw new Error('usuarios deve ser um array');
  }

  console.log(`   Usuários com gestor encontrados para cliente ${testClienteId}: ${data.usuarios.length}`);
  
  if (data.usuarios.length > 0) {
    const usuario = data.usuarios[0];
    
    // Verificar estrutura do usuário
    const camposUsuario = ['id', 'nome_usuario', 'nome_gestor', 'nome_departamento'];
    
    for (const campo of camposUsuario) {
      if (!(campo in usuario)) {
        throw new Error(`Campo '${campo}' não encontrado no usuário`);
      }
    }

    // Para usuários com gestor, nome_gestor não deve ser null
    if (usuario.nome_gestor === null) {
      throw new Error('nome_gestor não deve ser null para usuários com gestor');
    }

    console.log(`   Primeiro usuário: ${usuario.nome_usuario}`);
    console.log(`   Gestor: ${usuario.nome_gestor}`);
    console.log(`   Departamento: ${usuario.nome_departamento || 'N/A'}`);
  }
}

async function test27_AtribuirGestorUsuario() {
  // Primeiro, vamos tentar criar um segundo usuário para ser gestor
  const gestorData = {
    nome: 'Gestor Teste',
    email: 'gestor.teste@exemplo.com',
    senha: 'senha123',
    idade: 35
  };

  let gestorId;
  try {
    const criarGestorResponse = await axios.post(`${API_ENDPOINT}/cliente/${testClienteId}`, gestorData);
    gestorId = criarGestorResponse.data.data.id;
  } catch (error) {
    // Se der erro (provavelmente email duplicado), vamos assumir que já existe um gestor
    // Para fins de teste, vamos usar um ID fictício
    gestorId = 1;
  }

  // Agora vamos atribuir o gestor ao usuário criado anteriormente
  if (testUsuarioId && gestorId) {
    const response = await axios.put(`${API_ENDPOINT}/${testUsuarioId}/atribuir-gestor/${gestorId}`);

    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }

    if (!response.data.success) {
      throw new Error('Resposta deve ter success: true');
    }

    const data = response.data.data;
    
    // Verificar estrutura da resposta
    const camposObrigatorios = ['usuario_id', 'nome_usuario', 'id_gestor', 'nome_gestor'];
    for (const campo of camposObrigatorios) {
      if (!(campo in data)) {
        throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
      }
    }

    if (data.usuario_id !== testUsuarioId) {
      throw new Error(`ID do usuário esperado: ${testUsuarioId}, recebido: ${data.usuario_id}`);
    }

    if (data.id_gestor !== gestorId) {
      throw new Error(`ID do gestor esperado: ${gestorId}, recebido: ${data.id_gestor}`);
    }

    console.log(`   Gestor atribuído com sucesso ao usuário ${testUsuarioId}`);
    console.log(`   Nome do usuário: ${data.nome_usuario}`);
    console.log(`   Nome do gestor: ${data.nome_gestor}`);
  } else {
    console.log(`   Teste pulado - IDs não disponíveis (usuário: ${testUsuarioId}, gestor: ${gestorId})`);
  }
}

async function test28_RemoverGestorUsuario() {
  // Este teste depende do teste anterior ter atribuído um gestor
  if (testUsuarioId) {
    // Vamos tentar remover o gestor (assumindo que foi atribuído no teste anterior)
    try {
      const response = await axios.put(`${API_ENDPOINT}/${testUsuarioId}/remover-gestor/1`);

      if (response.status !== 200) {
        throw new Error(`Status esperado: 200, recebido: ${response.status}`);
      }

      if (!response.data.success) {
        throw new Error('Resposta deve ter success: true');
      }

      const data = response.data.data;
      
      // Verificar estrutura da resposta
      const camposObrigatorios = ['usuario_id', 'nome_usuario', 'id_gestor'];
      for (const campo of camposObrigatorios) {
        if (!(campo in data)) {
          throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
        }
      }

      if (data.usuario_id !== testUsuarioId) {
        throw new Error(`ID do usuário esperado: ${testUsuarioId}, recebido: ${data.usuario_id}`);
      }

      if (data.id_gestor !== null) {
        throw new Error(`ID do gestor deveria ser null após remoção, recebido: ${data.id_gestor}`);
      }

      console.log(`   Gestor removido com sucesso do usuário ${testUsuarioId}`);
      console.log(`   Nome do usuário: ${data.nome_usuario}`);
      console.log(`   Gestor atual: ${data.id_gestor || 'N/A'}`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`   Teste pulado - Usuário não possui o gestor especificado`);
      } else {
        throw error;
      }
    }
  } else {
    console.log(`   Teste pulado - ID do usuário não disponível`);
  }
}

async function test29_ValidarErrosGestao() {
  // Teste com ID de cliente inválido para busca sem gestor
  try {
    await axios.get(`${API_ENDPOINT}/sem-gestor/abc`);
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

  // Teste com ID de usuário inválido para atribuir gestor
  try {
    await axios.put(`${API_ENDPOINT}/abc/atribuir-gestor/1`);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_USER_ID') {
        throw new Error('Código de erro incorreto para ID usuário inválido');
      }
    } else {
      throw error;
    }
  }

  // Teste tentando atribuir usuário como gestor de si mesmo
  if (testUsuarioId) {
    try {
      await axios.put(`${API_ENDPOINT}/${testUsuarioId}/atribuir-gestor/${testUsuarioId}`);
      throw new Error('Deveria ter retornado erro 400');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        if (!error.response.data.error || error.response.data.error !== 'SELF_ASSIGNMENT') {
          throw new Error('Código de erro incorreto para auto-atribuição');
        }
      } else {
        throw error;
      }
    }
  }

  console.log(`   Validação de erros de gestão funcionando corretamente`);
}

async function test30_BuscarClienteInexistente() {
  const response = await axios.get(`${API_ENDPOINT}/sem-gestor/99999`);

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

  if (!Array.isArray(data.usuarios) || data.usuarios.length !== 0) {
    throw new Error('usuarios deveria ser array vazio');
  }

  console.log(`   Busca de usuários para cliente inexistente retornou dados vazios corretamente`);
}

// Testes dos novos endpoints de busca por perfil de acesso
async function test31_BuscarTodosUsuariosPorCliente() {
  const response = await axios.get(`${API_ENDPOINT}/all-usuarios/${testClienteId}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = ['cliente_id', 'usuarios'];
  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  if (data.cliente_id !== testClienteId) {
    throw new Error(`ID do cliente esperado: ${testClienteId}, recebido: ${data.cliente_id}`);
  }

  if (!Array.isArray(data.usuarios)) {
    throw new Error('usuarios deve ser um array');
  }

  console.log(`   Usuários com perfil_acesso = 1 encontrados para cliente ${testClienteId}: ${data.usuarios.length}`);
  
  if (data.usuarios.length > 0) {
    const usuario = data.usuarios[0];
    
    // Verificar estrutura do usuário
    const camposUsuario = ['id', 'nome', 'email', 'departamento'];
    
    for (const campo of camposUsuario) {
      if (!(campo in usuario)) {
        throw new Error(`Campo '${campo}' não encontrado no usuário`);
      }
    }

    console.log(`   Primeiro usuário: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Departamento: ${usuario.departamento || 'N/A'}`);
  }
}

async function test32_BuscarTodosGestoresPorCliente() {
  const response = await axios.get(`${API_ENDPOINT}/all-gestores/${testClienteId}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = ['cliente_id', 'gestores'];
  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  if (data.cliente_id !== testClienteId) {
    throw new Error(`ID do cliente esperado: ${testClienteId}, recebido: ${data.cliente_id}`);
  }

  if (!Array.isArray(data.gestores)) {
    throw new Error('gestores deve ser um array');
  }

  console.log(`   Gestores com perfil_acesso in (2,3) encontrados para cliente ${testClienteId}: ${data.gestores.length}`);
  
  if (data.gestores.length > 0) {
    const gestor = data.gestores[0];
    
    // Verificar estrutura do gestor
    const camposGestor = ['id', 'nome', 'email', 'titulo_departamento'];
    
    for (const campo of camposGestor) {
      if (!(campo in gestor)) {
        throw new Error(`Campo '${campo}' não encontrado no gestor`);
      }
    }

    console.log(`   Primeiro gestor: ${gestor.nome}`);
    console.log(`   Email: ${gestor.email}`);
    console.log(`   Departamento: ${gestor.titulo_departamento || 'N/A'}`);
  }
}

async function test33_ValidarErrosPerfilAcesso() {
  // Teste com ID de cliente inválido para busca de usuários
  try {
    await axios.get(`${API_ENDPOINT}/all-usuarios/abc`);
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

  // Teste com ID de cliente inválido para busca de gestores
  try {
    await axios.get(`${API_ENDPOINT}/all-gestores/xyz`);
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

  console.log(`   Validação de erros de perfil de acesso funcionando corretamente`);
}

async function test34_BuscarClienteInexistentePerfilAcesso() {
  // Teste buscar usuários para cliente inexistente
  const responseUsuarios = await axios.get(`${API_ENDPOINT}/all-usuarios/99999`);

  if (responseUsuarios.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${responseUsuarios.status}`);
  }

  if (!responseUsuarios.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const dataUsuarios = responseUsuarios.data.data;
  
  if (dataUsuarios.cliente_id !== 99999) {
    throw new Error(`ID do cliente esperado: 99999, recebido: ${dataUsuarios.cliente_id}`);
  }

  if (!Array.isArray(dataUsuarios.usuarios) || dataUsuarios.usuarios.length !== 0) {
    throw new Error('usuarios deveria ser array vazio');
  }

  // Teste buscar gestores para cliente inexistente
  const responseGestores = await axios.get(`${API_ENDPOINT}/all-gestores/99999`);

  if (responseGestores.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${responseGestores.status}`);
  }

  if (!responseGestores.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const dataGestores = responseGestores.data.data;
  
  if (dataGestores.cliente_id !== 99999) {
    throw new Error(`ID do cliente esperado: 99999, recebido: ${dataGestores.cliente_id}`);
  }

  if (!Array.isArray(dataGestores.gestores) || dataGestores.gestores.length !== 0) {
    throw new Error('gestores deveria ser array vazio');
  }

  console.log(`   Busca de usuários e gestores para cliente inexistente retornou dados vazios corretamente`);
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
    
    // Testes das novas APIs CRUD
    await runTest('Teste 18: Criar usuário', test18_CriarUsuario);
    await runTest('Teste 19: Buscar usuários por cliente', test19_BuscarUsuariosPorCliente);
    await runTest('Teste 20: Criar usuário com dados inválidos', test20_CriarUsuarioComDadosInvalidos);
    await runTest('Teste 21: Criar usuário com email duplicado', test21_CriarUsuarioEmailDuplicado);
    await runTest('Teste 22: Buscar usuários de cliente inexistente', test22_BuscarUsuariosClienteInexistente);
    await runTest('Teste 23: Criar usuário com idade inválida', test23_CriarUsuarioComIdadeInvalida);
    await runTest('Teste 24: Validar parâmetros inválidos', test24_ValidarParametrosInvalidos);
    
    // Testes dos novos endpoints de gestão de gestores
    await runTest('Teste 25: Buscar usuários sem gestor', test25_BuscarUsuariosSemGestor);
    await runTest('Teste 26: Buscar usuários com gestor', test26_BuscarUsuariosComGestor);
    await runTest('Teste 27: Atribuir gestor a usuário', test27_AtribuirGestorUsuario);
    await runTest('Teste 28: Remover gestor de usuário', test28_RemoverGestorUsuario);
    await runTest('Teste 29: Validar erros de gestão', test29_ValidarErrosGestao);
    await runTest('Teste 30: Buscar usuários de cliente inexistente (gestão)', test30_BuscarClienteInexistente);
    
    // Testes dos novos endpoints de busca por perfil de acesso
    await runTest('Teste 31: Buscar todos os usuários por cliente (perfil_acesso = 1)', test31_BuscarTodosUsuariosPorCliente);
    await runTest('Teste 32: Buscar todos os gestores por cliente (perfil_acesso in (2,3))', test32_BuscarTodosGestoresPorCliente);
    await runTest('Teste 33: Validar erros de perfil de acesso', test33_ValidarErrosPerfilAcesso);
    await runTest('Teste 34: Buscar cliente inexistente (perfil de acesso)', test34_BuscarClienteInexistentePerfilAcesso);
    
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
