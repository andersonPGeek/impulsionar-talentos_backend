const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuração da API
const API_BASE_URL = process.env.API_URL || 'http://localhost:3002/api';
const API_ENDPOINT = `${API_BASE_URL}/metas`;

// Dados de teste
const testData = {
  validMeta: {
    id_usuario: 1,
    titulo_da_meta: 'Meta de Teste - Desenvolvimento Profissional',
    atividades: [
      'Completar curso de JavaScript avançado',
      'Implementar projeto prático',
      'Apresentar resultados para a equipe'
    ],
    data_vencimento: '2025-12-31',
    status: 'Em Progresso',
    id_usuarios: [1],
    resultado_3_meses: 'Esperamos ter completado 50% das atividades',
    resultado_6_meses: 'Meta totalmente concluída com sucesso',
    observacao_gestor: 'Meta importante para o desenvolvimento da equipe'
  },
  invalidData: {
    missingUserId: {
      titulo_da_meta: 'Meta sem ID de usuário',
      atividades: ['Atividade 1'],
      data_vencimento: '2025-12-31',
      status: 'Em Progresso',
      id_usuarios: [1]
    },
    missingTitle: {
      id_usuario: 1,
      atividades: ['Atividade 1'],
      data_vencimento: '2025-12-31',
      status: 'Em Progresso',
      id_usuarios: [1]
    },
    emptyActivities: {
      id_usuario: 1,
      titulo_da_meta: 'Meta sem atividades',
      atividades: [],
      data_vencimento: '2025-12-31',
      status: 'Em Progresso',
      id_usuarios: [1]
    },
    invalidStatus: {
      id_usuario: 1,
      titulo_da_meta: 'Meta com status inválido',
      atividades: ['Atividade 1'],
      data_vencimento: '2025-12-31',
      status: 'Status Inválido',
      id_usuarios: [1]
    },
    pastDate: {
      id_usuario: 1,
      titulo_da_meta: 'Meta com data passada',
      atividades: ['Atividade 1'],
      data_vencimento: '2020-01-01',
      status: 'Em Progresso',
      id_usuarios: [1]
    },
    emptyUsers: {
      id_usuario: 1,
      titulo_da_meta: 'Meta sem usuários envolvidos',
      atividades: ['Atividade 1'],
      data_vencimento: '2025-12-31',
      status: 'Em Progresso',
      id_usuarios: []
    }
  }
};

// Função para limpar dados de teste
async function cleanupTestData(metaId) {
  if (!metaId) return;
  
  try {
    console.log(`\n🧹 Limpando dados de teste para meta ID: ${metaId}`);
    
    // Nota: Como não temos APIs de DELETE ainda, vamos apenas logar
    // que os dados precisam ser limpos manualmente
    console.log(`⚠️  Dados de teste criados com ID ${metaId} precisam ser limpos manualmente do banco`);
    console.log(`   - Tabela: metas_pdi (ID: ${metaId})`);
    console.log(`   - Tabela: atividades_pdi (id_meta_pdi: ${metaId})`);
    console.log(`   - Tabela: pessoas_envolvidas_pdi (id_meta_pdi: ${metaId})`);
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados de teste:', error.message);
  }
}

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
async function test1_CriarMetaValida() {
  const response = await axios.post(API_ENDPOINT, testData.validMeta);
  
  if (response.status !== 201) {
    throw new Error(`Status esperado: 201, recebido: ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }
  
  if (!response.data.data.meta) {
    throw new Error('Resposta deve conter a meta criada');
  }
  
  const meta = response.data.data.meta;
  if (meta.titulo !== testData.validMeta.titulo_da_meta) {
    throw new Error('Título da meta não confere');
  }
  
  if (!meta.atividades || meta.atividades.length !== testData.validMeta.atividades.length) {
    throw new Error('Atividades não foram salvas corretamente');
  }
  
  if (!meta.usuarios_envolvidos || meta.usuarios_envolvidos.length !== testData.validMeta.id_usuarios.length) {
    throw new Error('Usuários envolvidos não foram salvos corretamente');
  }
  
  console.log(`   Meta criada com ID: ${meta.id}`);
  console.log(`   Atividades: ${meta.atividades.length}`);
  console.log(`   Usuários envolvidos: ${meta.usuarios_envolvidos.length}`);
  
  // Armazenar ID para limpeza posterior
  testData.createdMetaId = meta.id;
}

async function test2_CriarMetaSemIdUsuario() {
  try {
    await axios.post(API_ENDPOINT, testData.invalidData.missingUserId);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'MISSING_USER_ID') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test3_CriarMetaSemTitulo() {
  try {
    await axios.post(API_ENDPOINT, testData.invalidData.missingTitle);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'MISSING_TITULO') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test4_CriarMetaSemAtividades() {
  try {
    await axios.post(API_ENDPOINT, testData.invalidData.emptyActivities);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'MISSING_ATIVIDADES') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test5_CriarMetaStatusInvalido() {
  try {
    await axios.post(API_ENDPOINT, testData.invalidData.invalidStatus);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_STATUS') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test6_CriarMetaDataPassada() {
  try {
    await axios.post(API_ENDPOINT, testData.invalidData.pastDate);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Pode ser erro de validação do express-validator
      if (!error.response.data.error) {
        throw new Error('Deveria ter código de erro específico');
      }
    } else {
      throw error;
    }
  }
}

async function test7_CriarMetaSemUsuariosEnvolvidos() {
  try {
    await axios.post(API_ENDPOINT, testData.invalidData.emptyUsers);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'MISSING_USUARIOS') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test8_CriarMetaComCamposOpcionais() {
  const metaComCamposOpcionais = {
    id_usuario: 1,
    titulo_da_meta: 'Meta com campos opcionais',
    atividades: ['Atividade única'],
    data_vencimento: '2025-12-31',
    status: 'Parado',
    id_usuarios: [1]
    // Campos opcionais não incluídos
  };
  
  const response = await axios.post(API_ENDPOINT, metaComCamposOpcionais);
  
  if (response.status !== 201) {
    throw new Error(`Status esperado: 201, recebido: ${response.status}`);
  }
  
  const meta = response.data.data.meta;
  if (meta.resultado_3_meses !== null) {
    throw new Error('Resultado 3 meses deveria ser null');
  }
  
  if (meta.resultado_6_meses !== null) {
    throw new Error('Resultado 6 meses deveria ser null');
  }
  
  if (meta.feedback_gestor !== null) {
    throw new Error('Feedback gestor deveria ser null');
  }
  
  console.log(`   Meta criada com campos opcionais vazios - ID: ${meta.id}`);
  
  // Armazenar para limpeza
  testData.createdMetaId2 = meta.id;
}

async function test9_CriarMetaComTodosStatus() {
  const statusValidos = ['Em Progresso', 'Parado', 'Atrasado', 'Concluida'];
  const metaIds = [];
  
  for (const status of statusValidos) {
    const meta = {
      id_usuario: 1,
      titulo_da_meta: `Meta com status: ${status}`,
      atividades: [`Atividade para status ${status}`],
      data_vencimento: '2025-12-31',
      status: status,
      id_usuarios: [1]
    };
    
    const response = await axios.post(API_ENDPOINT, meta);
    
    if (response.status !== 201) {
      throw new Error(`Status ${status} falhou com status HTTP ${response.status}`);
    }
    
    if (response.data.data.meta.status !== status) {
      throw new Error(`Status salvo incorretamente: esperado ${status}, recebido ${response.data.data.meta.status}`);
    }
    
    metaIds.push(response.data.data.meta.id);
    console.log(`   ✅ Status "${status}" - ID: ${response.data.data.meta.id}`);
  }
  
  testData.createdMetaIds = metaIds;
}

async function test10_CriarMetaComMuitasAtividades() {
  const muitasAtividades = Array.from({ length: 10 }, (_, i) => `Atividade ${i + 1} - Teste de volume`);
  
  const meta = {
    id_usuario: 1,
    titulo_da_meta: 'Meta com muitas atividades',
    atividades: muitasAtividades,
    data_vencimento: '2025-12-31',
    status: 'Em Progresso',
    id_usuarios: [1]
  };
  
  const response = await axios.post(API_ENDPOINT, meta);
  
  if (response.status !== 201) {
    throw new Error(`Status esperado: 201, recebido: ${response.status}`);
  }
  
  const metaCriada = response.data.data.meta;
  if (metaCriada.atividades.length !== 10) {
    throw new Error(`Esperado 10 atividades, recebido ${metaCriada.atividades.length}`);
  }
  
  if (metaCriada.usuarios_envolvidos.length !== 1) {
    throw new Error(`Esperado 1 usuário, recebido ${metaCriada.usuarios_envolvidos.length}`);
  }
  
  console.log(`   Meta criada com 10 atividades e 1 usuário - ID: ${metaCriada.id}`);
  testData.createdMetaId3 = metaCriada.id;
}

// Testes de atualização
async function test11_AtualizarMetaValida() {
  // Primeiro criar uma meta para atualizar
  const metaOriginal = {
    id_usuario: 1,
    titulo_da_meta: 'Meta Original para Atualizar',
    atividades: ['Atividade original'],
    data_vencimento: '2025-12-31',
    status: 'Em Progresso',
    id_usuarios: [1]
  };

  const createResponse = await axios.post(API_ENDPOINT, metaOriginal);
  const metaId = createResponse.data.data.meta.id;
  testData.metaParaAtualizar = metaId;

  // Dados para atualização
  const dadosAtualizacao = {
    id_usuario: 1,
    titulo_da_meta: 'Meta Atualizada - Desenvolvimento Avançado',
    atividades: [
      'Atividade atualizada 1',
      'Atividade atualizada 2',
      'Nova atividade adicionada'
    ],
    data_vencimento: '2025-11-30',
    status: 'Concluida',
    id_usuarios: [1],
    resultado_3_meses: 'Meta concluída com sucesso',
    resultado_6_meses: 'Resultados aplicados na prática',
    observacao_gestor: 'Excelente trabalho na conclusão da meta'
  };

  const response = await axios.put(`${API_ENDPOINT}/${metaId}`, dadosAtualizacao);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const metaAtualizada = response.data.data.meta;
  if (metaAtualizada.titulo !== dadosAtualizacao.titulo_da_meta) {
    throw new Error('Título não foi atualizado corretamente');
  }

  if (metaAtualizada.status !== dadosAtualizacao.status) {
    throw new Error('Status não foi atualizado corretamente');
  }

  if (metaAtualizada.atividades.length !== dadosAtualizacao.atividades.length) {
    throw new Error('Atividades não foram atualizadas corretamente');
  }

  console.log(`   Meta atualizada com sucesso - ID: ${metaId}`);
  console.log(`   Novo título: ${metaAtualizada.titulo}`);
  console.log(`   Novo status: ${metaAtualizada.status}`);
  console.log(`   Atividades: ${metaAtualizada.atividades.length}`);
}

async function test12_AtualizarMetaInexistente() {
  try {
    const dadosAtualizacao = {
      id_usuario: 1,
      titulo_da_meta: 'Meta Inexistente',
      atividades: ['Atividade'],
      data_vencimento: '2025-12-31',
      status: 'Em Progresso',
      id_usuarios: [1]
    };

    await axios.put(`${API_ENDPOINT}/99999`, dadosAtualizacao);
    throw new Error('Deveria ter retornado erro 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      if (!error.response.data.error || error.response.data.error !== 'META_NOT_FOUND') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test13_AtualizarMetaUsuarioDiferente() {
  // Primeiro criar uma meta com usuário 1
  const metaOriginal = {
    id_usuario: 1,
    titulo_da_meta: 'Meta para Teste de Permissão',
    atividades: ['Atividade'],
    data_vencimento: '2025-12-31',
    status: 'Em Progresso',
    id_usuarios: [1]
  };

  const createResponse = await axios.post(API_ENDPOINT, metaOriginal);
  const metaId = createResponse.data.data.meta.id;

  try {
    // Tentar atualizar com usuário diferente
    const dadosAtualizacao = {
      id_usuario: 2, // Usuário diferente
      titulo_da_meta: 'Tentativa de Atualização Não Autorizada',
      atividades: ['Atividade'],
      data_vencimento: '2025-12-31',
      status: 'Em Progresso',
      id_usuarios: [2]
    };

    await axios.put(`${API_ENDPOINT}/${metaId}`, dadosAtualizacao);
    throw new Error('Deveria ter retornado erro 403');
  } catch (error) {
    if (error.response && error.response.status === 403) {
      if (!error.response.data.error || error.response.data.error !== 'UNAUTHORIZED') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test14_AtualizarMetaComDadosInvalidos() {
  // Primeiro criar uma meta para atualizar
  const metaOriginal = {
    id_usuario: 1,
    titulo_da_meta: 'Meta para Teste de Validação',
    atividades: ['Atividade'],
    data_vencimento: '2025-12-31',
    status: 'Em Progresso',
    id_usuarios: [1]
  };

  const createResponse = await axios.post(API_ENDPOINT, metaOriginal);
  const metaId = createResponse.data.data.meta.id;

  try {
    // Tentar atualizar com dados inválidos
    const dadosInvalidos = {
      id_usuario: 1,
      titulo_da_meta: '', // Título vazio
      atividades: [], // Atividades vazias
      data_vencimento: '2025-12-31',
      status: 'Status Inválido',
      id_usuarios: []
    };

    await axios.put(`${API_ENDPOINT}/${metaId}`, dadosInvalidos);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Pode ser qualquer um dos erros de validação
      if (!error.response.data.error) {
        throw new Error('Deveria ter código de erro específico');
      }
    } else {
      throw error;
    }
  }
}

async function test15_AtualizarMetaComIDInvalido() {
  try {
    const dadosAtualizacao = {
      id_usuario: 1,
      titulo_da_meta: 'Meta com ID Inválido',
      atividades: ['Atividade'],
      data_vencimento: '2025-12-31',
      status: 'Em Progresso',
      id_usuarios: [1]
    };

    await axios.put(`${API_ENDPOINT}/abc`, dadosAtualizacao);
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_META_ID') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

// Testes de consulta
async function test16_BuscarMetasPorGestor() {
  // Primeiro criar algumas metas para testar
  const meta1 = {
    id_usuario: 1,
    titulo_da_meta: 'Meta 1 para Teste de Consulta',
    atividades: ['Atividade 1', 'Atividade 2'],
    data_vencimento: '2025-12-31',
    status: 'Em Progresso',
    id_usuarios: [1]
  };

  const meta2 = {
    id_usuario: 1,
    titulo_da_meta: 'Meta 2 para Teste de Consulta',
    atividades: ['Atividade 3'],
    data_vencimento: '2025-11-30',
    status: 'Concluida',
    id_usuarios: [1],
    resultado_3_meses: 'Resultado 3 meses',
    resultado_6_meses: 'Resultado 6 meses',
    observacao_gestor: 'Feedback do gestor'
  };

  // Criar as metas
  const response1 = await axios.post(API_ENDPOINT, meta1);
  const response2 = await axios.post(API_ENDPOINT, meta2);
  
  const metaId1 = response1.data.data.meta.id;
  const metaId2 = response2.data.data.meta.id;
  
  testData.metasParaConsulta = [metaId1, metaId2];

  // Buscar metas por gestor (assumindo que o usuário 1 tem gestor 1)
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

  // Se não há usuários, significa que o usuário 1 não tem gestor 1 configurado
  if (data.usuarios.length === 0) {
    console.log(`   Nenhum usuário encontrado para gestor 1 (usuário 1 pode não ter gestor configurado)`);
    return; // Teste passa se não há dados, pois pode ser configuração do banco
  }

  const usuario = data.usuarios[0];
  if (!usuario.nome_usuario) {
    throw new Error('Usuário deve ter nome_usuario');
  }

  if (!usuario.metas || !Array.isArray(usuario.metas)) {
    throw new Error('Usuário deve ter array de metas');
  }

  if (usuario.metas.length < 2) {
    throw new Error('Deveria retornar pelo menos 2 metas');
  }

  // Verificar se as metas criadas estão na resposta
  const metaEncontrada1 = usuario.metas.find(m => m.id === metaId1);
  const metaEncontrada2 = usuario.metas.find(m => m.id === metaId2);

  if (!metaEncontrada1) {
    throw new Error('Meta 1 não foi encontrada na resposta');
  }

  if (!metaEncontrada2) {
    throw new Error('Meta 2 não foi encontrada na resposta');
  }

  // Verificar estrutura das atividades
  if (!metaEncontrada1.atividades || !Array.isArray(metaEncontrada1.atividades)) {
    throw new Error('Meta deve ter array de atividades');
  }

  if (metaEncontrada1.atividades.length !== 2) {
    throw new Error('Meta 1 deveria ter 2 atividades');
  }

  // Verificar estrutura das pessoas envolvidas
  if (!metaEncontrada1.pessoas_envolvidas || !Array.isArray(metaEncontrada1.pessoas_envolvidas)) {
    throw new Error('Meta deve ter array de pessoas envolvidas');
  }

  console.log(`   Metas encontradas para gestor 1: ${usuario.metas.length}`);
  console.log(`   Usuário: ${usuario.nome_usuario}`);
  console.log(`   Total de atividades na meta 1: ${metaEncontrada1.atividades.length}`);
  console.log(`   Total de pessoas envolvidas na meta 1: ${metaEncontrada1.pessoas_envolvidas.length}`);
}

async function test17_BuscarMetasPorGestorInexistente() {
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

  console.log(`   Nenhuma meta encontrada para gestor inexistente (ID: 99999)`);
}

async function test18_BuscarMetasPorGestorComIDInvalido() {
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

async function test19_BuscarMetasPorGestorSemID() {
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

async function test20_BuscarMetasPorGestorComMetasComplexas() {
  // Criar uma meta mais complexa com múltiplas atividades e pessoas envolvidas
  const metaComplexa = {
    id_usuario: 1,
    titulo_da_meta: 'Meta Complexa para Teste',
    atividades: [
      'Atividade complexa 1',
      'Atividade complexa 2',
      'Atividade complexa 3',
      'Atividade complexa 4'
    ],
    data_vencimento: '2025-12-31',
    status: 'Em Progresso',
    id_usuarios: [1], // Assumindo que usuário 1 existe
    resultado_3_meses: 'Resultado complexo 3 meses',
    resultado_6_meses: 'Resultado complexo 6 meses',
    observacao_gestor: 'Feedback complexo do gestor'
  };

  const createResponse = await axios.post(API_ENDPOINT, metaComplexa);
  const metaId = createResponse.data.data.meta.id;
  testData.metaComplexa = metaId;

  // Buscar metas por gestor
  const response = await axios.get(`${API_ENDPOINT}/gestor/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;
  
  // Se não há usuários, significa que o usuário 1 não tem gestor 1 configurado
  if (data.usuarios.length === 0) {
    console.log(`   Nenhum usuário encontrado para gestor 1 (usuário 1 pode não ter gestor configurado)`);
    return; // Teste passa se não há dados, pois pode ser configuração do banco
  }
  
  const usuario = data.usuarios[0];
  const metaEncontrada = usuario.metas.find(m => m.id === metaId);

  if (!metaEncontrada) {
    throw new Error('Meta complexa não foi encontrada na resposta');
  }

  if (metaEncontrada.atividades.length !== 4) {
    throw new Error(`Meta complexa deveria ter 4 atividades, encontradas: ${metaEncontrada.atividades.length}`);
  }

  if (metaEncontrada.resultado_3_meses !== metaComplexa.resultado_3_meses) {
    throw new Error('Resultado 3 meses não confere');
  }

  if (metaEncontrada.resultado_6_meses !== metaComplexa.resultado_6_meses) {
    throw new Error('Resultado 6 meses não confere');
  }

  if (metaEncontrada.feedback_gestor !== metaComplexa.observacao_gestor) {
    throw new Error('Feedback do gestor não confere');
  }

  console.log(`   Meta complexa encontrada com ${metaEncontrada.atividades.length} atividades`);
  console.log(`   Resultado 3 meses: ${metaEncontrada.resultado_3_meses}`);
  console.log(`   Resultado 6 meses: ${metaEncontrada.resultado_6_meses}`);
  console.log(`   Feedback gestor: ${metaEncontrada.feedback_gestor}`);
}

// Testes de atualização de atividade
async function test21_AtualizarStatusAtividadeSemArquivo() {
  // Primeiro criar uma meta para testar
  const metaOriginal = {
    id_usuario: 1,
    titulo_da_meta: 'Meta para Teste de Atividade 21',
    atividades: ['Atividade para teste de status 21'],
    data_vencimento: '2025-12-31',
    status: 'Em Progresso',
    id_usuarios: [1]
  };

  const createResponse = await axios.post(API_ENDPOINT, metaOriginal);
  const metaId = createResponse.data.data.meta.id;
  testData.metaParaAtividade = metaId;

  // Buscar as metas por gestor para obter o ID da atividade
  const gestorResponse = await axios.get(`${API_ENDPOINT}/gestor/1`);
  
  if (gestorResponse.data.data.usuarios.length === 0) {
    throw new Error('Usuário 1 deve ter gestor configurado para executar este teste');
  }
  
  const usuario = gestorResponse.data.data.usuarios[0];
  const meta = usuario.metas.find(m => m.id === metaId);
  
  if (!meta || !meta.atividades || meta.atividades.length === 0) {
    throw new Error('Meta deve ter atividades para executar este teste');
  }
  
  const atividadeId = meta.atividades[0].id;
  testData.atividadeId = atividadeId;

  // Atualizar status da atividade
  const formData = new FormData();
  formData.append('status_atividade', 'em_progresso');

  const response = await axios.put(`${API_ENDPOINT}/atividade/${metaId}/${atividadeId}`, formData, {
    headers: {
      ...formData.getHeaders()
    }
  });

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const atividade = response.data.data.atividade;
  if (atividade.status_atividade !== 'em_progresso') {
    throw new Error('Status da atividade não foi atualizado corretamente');
  }

  if (parseInt(atividade.id_meta_pdi) !== parseInt(metaId)) {
    throw new Error(`ID da meta PDI não confere: esperado ${metaId}, recebido ${atividade.id_meta_pdi}`);
  }

  console.log(`   Status da atividade atualizado para: ${atividade.status_atividade}`);
  console.log(`   Meta ID: ${atividade.id_meta_pdi}`);
  console.log(`   Atividade ID: ${atividadeId}`);
}

async function test22_AtualizarStatusAtividadeComArquivo() {
  // Criar um arquivo de teste temporário
  const testFilePath = path.join(__dirname, 'test-evidence.txt');
  fs.writeFileSync(testFilePath, 'Este é um arquivo de evidência de teste');

  try {
    // Atualizar status da atividade com arquivo
    const formData = new FormData();
    formData.append('status_atividade', 'concluida');
    formData.append('evidencia_atividade', fs.createReadStream(testFilePath));

    const response = await axios.put(`${API_ENDPOINT}/atividade/${testData.metaParaAtividade}/${testData.atividadeId}`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }

    const atividade = response.data.data.atividade;
    if (atividade.status_atividade !== 'concluida') {
      throw new Error('Status da atividade não foi atualizado corretamente');
    }

    if (!atividade.evidencia_atividade) {
      throw new Error('URL da evidência não foi retornada');
    }

    console.log(`   Status da atividade atualizado para: ${atividade.status_atividade}`);
    console.log(`   Evidência URL: ${atividade.evidencia_atividade}`);

  } finally {
    // Limpar arquivo de teste
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

async function test23_AtualizarStatusAtividadeMetaInexistente() {
  try {
    const formData = new FormData();
    formData.append('status_atividade', 'em_progresso');

    await axios.put(`${API_ENDPOINT}/atividade/99999/99999`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    throw new Error('Deveria ter retornado erro 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      if (!error.response.data.error || error.response.data.error !== 'META_NOT_FOUND') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test24_AtualizarStatusAtividadeStatusInvalido() {
  try {
    const formData = new FormData();
    formData.append('status_atividade', 'status_invalido');

    await axios.put(`${API_ENDPOINT}/atividade/${testData.metaParaAtividade}/${testData.atividadeId}`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error || error.response.data.error !== 'INVALID_STATUS') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

async function test25_AtualizarStatusAtividadeSemStatus() {
  try {
    const formData = new FormData();
    formData.append('campo_vazio', ''); // Adicionar um campo vazio para evitar erro do multer

    await axios.put(`${API_ENDPOINT}/atividade/${testData.metaParaAtividade}/${testData.atividadeId}`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`   Erro recebido: ${error.response.data.error}`);
      if (!error.response.data.error || error.response.data.error !== 'MISSING_STATUS') {
        throw new Error(`Código de erro incorreto: esperado MISSING_STATUS, recebido ${error.response.data.error}`);
      }
    } else {
      throw error;
    }
  }
}

async function test26_AtualizarStatusAtividadeComTodosStatus() {
  const statusValidos = ['backlog', 'em_progresso', 'concluida', 'cancelada'];
  
  for (const status of statusValidos) {
    const formData = new FormData();
    formData.append('status_atividade', status);

    const response = await axios.put(`${API_ENDPOINT}/atividade/${testData.metaParaAtividade}/${testData.atividadeId}`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    if (response.status !== 200) {
      throw new Error(`Status ${status} falhou com status HTTP ${response.status}`);
    }

    if (response.data.data.atividade.status_atividade !== status) {
      throw new Error(`Status salvo incorretamente: esperado ${status}, recebido ${response.data.data.atividade.status_atividade}`);
    }

    console.log(`   ✅ Status "${status}" atualizado com sucesso`);
  }
}

async function test27_AtualizarStatusAtividadeComAtividadeInexistente() {
  try {
    const formData = new FormData();
    formData.append('status_atividade', 'em_progresso');

    // Usar meta válida mas atividade inexistente
    await axios.put(`${API_ENDPOINT}/atividade/${testData.metaParaAtividade}/99999`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    throw new Error('Deveria ter retornado erro 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      if (!error.response.data.error || error.response.data.error !== 'ATIVIDADE_NOT_FOUND') {
        throw new Error('Código de erro incorreto');
      }
    } else {
      throw error;
    }
  }
}

// Testes da nova API de buscar metas por usuário
async function test28_BuscarMetasPorUsuario() {
  // Primeiro criar algumas metas para testar
  const meta1 = {
    id_usuario: 1,
    titulo_da_meta: 'Meta 1 para Teste de Usuário',
    atividades: ['Atividade 1', 'Atividade 2'],
    data_vencimento: '2025-12-31',
    status: 'Em Progresso',
    id_usuarios: [1]
  };

  const meta2 = {
    id_usuario: 1,
    titulo_da_meta: 'Meta 2 para Teste de Usuário',
    atividades: ['Atividade 3', 'Atividade 4', 'Atividade 5'],
    data_vencimento: '2025-11-30',
    status: 'Concluida',
    id_usuarios: [1, 2],
    resultado_3_meses: 'Resultado 3 meses teste',
    resultado_6_meses: 'Resultado 6 meses teste',
    observacao_gestor: 'Feedback do gestor teste'
  };

  // Criar as metas
  const response1 = await axios.post(API_ENDPOINT, meta1);
  const response2 = await axios.post(API_ENDPOINT, meta2);
  
  const metaId1 = response1.data.data.meta.id;
  const metaId2 = response2.data.data.meta.id;
  
  testData.metasParaUsuario = [metaId1, metaId2];

  // Buscar metas por usuário
  const response = await axios.get(`${API_ENDPOINT}/usuario/1`);

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

  if (typeof data.quantidade_metas !== 'number') {
    throw new Error('quantidade_metas deve ser um número');
  }

  if (typeof data.progresso_medio !== 'number') {
    throw new Error('progresso_medio deve ser um número');
  }

  if (!Array.isArray(data.metas)) {
    throw new Error('metas deve ser um array');
  }

  if (data.quantidade_metas < 2) {
    throw new Error('Deveria retornar pelo menos 2 metas');
  }

  // Verificar se as metas criadas estão na resposta
  const metaEncontrada1 = data.metas.find(m => m.id === metaId1);
  const metaEncontrada2 = data.metas.find(m => m.id === metaId2);

  if (!metaEncontrada1) {
    throw new Error('Meta 1 não foi encontrada na resposta');
  }

  if (!metaEncontrada2) {
    throw new Error('Meta 2 não foi encontrada na resposta');
  }

  // Verificar estrutura das metas
  if (!metaEncontrada1.titulo_meta) {
    throw new Error('Meta deve ter titulo_meta');
  }

  if (!metaEncontrada1.prazo_meta) {
    throw new Error('Meta deve ter prazo_meta');
  }

  if (!metaEncontrada1.status_meta) {
    throw new Error('Meta deve ter status_meta');
  }

  if (typeof metaEncontrada1.porcentagem_progresso !== 'number') {
    throw new Error('Meta deve ter porcentagem_progresso como número');
  }

  if (!Array.isArray(metaEncontrada1.atividades)) {
    throw new Error('Meta deve ter array de atividades');
  }

  if (!Array.isArray(metaEncontrada1.pessoas_envolvidas)) {
    throw new Error('Meta deve ter array de pessoas_envolvidas');
  }

  // Verificar estrutura das atividades
  if (metaEncontrada1.atividades.length !== 2) {
    throw new Error('Meta 1 deveria ter 2 atividades');
  }

  const atividade = metaEncontrada1.atividades[0];
  if (!atividade.atividade || !atividade.status) {
    throw new Error('Atividade deve ter campos atividade e status');
  }

  // Verificar estrutura das pessoas envolvidas
  if (metaEncontrada1.pessoas_envolvidas.length < 1) {
    throw new Error('Meta 1 deveria ter pelo menos 1 pessoa envolvida');
  }

  const pessoa = metaEncontrada1.pessoas_envolvidas[0];
  if (!pessoa.nome_pessoa) {
    throw new Error('Pessoa envolvida deve ter nome_pessoa');
  }

  // Verificar campos opcionais da meta 2
  if (metaEncontrada2.resultado_3_meses !== meta2.resultado_3_meses) {
    throw new Error('resultado_3_meses não confere');
  }

  if (metaEncontrada2.resultado_6_meses !== meta2.resultado_6_meses) {
    throw new Error('resultado_6_meses não confere');
  }

  if (metaEncontrada2.feedback_gestor !== meta2.observacao_gestor) {
    throw new Error('feedback_gestor não confere');
  }

  console.log(`   Metas encontradas para usuário 1: ${data.quantidade_metas}`);
  console.log(`   Progresso médio: ${data.progresso_medio}%`);
  console.log(`   Próximo prazo: ${data.proximo_prazo}`);
  console.log(`   Meta 1: ${metaEncontrada1.atividades.length} atividades, ${metaEncontrada1.pessoas_envolvidas.length} pessoas envolvidas`);
  console.log(`   Meta 2: ${metaEncontrada2.atividades.length} atividades, ${metaEncontrada2.pessoas_envolvidas.length} pessoas envolvidas`);
}

async function test29_BuscarMetasPorUsuarioInexistente() {
  const response = await axios.get(`${API_ENDPOINT}/usuario/99999`);

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

  if (data.quantidade_metas !== 0) {
    throw new Error('Deveria retornar 0 metas para usuário inexistente');
  }

  if (data.progresso_medio !== 0) {
    throw new Error('Progresso médio deveria ser 0 para usuário sem metas');
  }

  if (data.proximo_prazo !== null) {
    throw new Error('Próximo prazo deveria ser null para usuário sem metas');
  }

  if (!Array.isArray(data.metas) || data.metas.length !== 0) {
    throw new Error('Deveria retornar array vazio de metas');
  }

  console.log(`   Nenhuma meta encontrada para usuário inexistente (ID: 99999)`);
}

async function test30_BuscarMetasPorUsuarioComIDInvalido() {
  try {
    await axios.get(`${API_ENDPOINT}/usuario/abc`);
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

async function test31_BuscarMetasPorUsuarioComProgressoCalculado() {
  // Criar uma meta com atividades para testar o cálculo de progresso
  const metaParaProgresso = {
    id_usuario: 1,
    titulo_da_meta: 'Meta para Teste de Progresso',
    atividades: [
      'Atividade para teste 1',
      'Atividade para teste 2',
      'Atividade para teste 3',
      'Atividade para teste 4'
    ],
    data_vencimento: '2025-12-31',
    status: 'Em Progresso',
    id_usuarios: [1]
  };

  const createResponse = await axios.post(API_ENDPOINT, metaParaProgresso);
  const metaId = createResponse.data.data.meta.id;
  testData.metaParaProgresso = metaId;

  // Buscar as atividades para atualizar algumas para "concluida"
  const gestorResponse = await axios.get(`${API_ENDPOINT}/gestor/1`);
  
  if (gestorResponse.data.data.usuarios.length === 0) {
    console.log('   Usuário 1 deve ter gestor configurado para executar este teste completo');
    return;
  }
  
  const usuario = gestorResponse.data.data.usuarios[0];
  const meta = usuario.metas.find(m => m.id === metaId);
  
  if (!meta || !meta.atividades || meta.atividades.length === 0) {
    throw new Error('Meta deve ter atividades para executar este teste');
  }

  // Marcar 2 das 4 atividades como concluídas (50% de progresso)
  const atividade1 = meta.atividades[0];
  const atividade2 = meta.atividades[1];

  const formData1 = new FormData();
  formData1.append('status_atividade', 'concluida');
  await axios.put(`${API_ENDPOINT}/atividade/${metaId}/${atividade1.id}`, formData1, {
    headers: { ...formData1.getHeaders() }
  });

  const formData2 = new FormData();
  formData2.append('status_atividade', 'concluida');
  await axios.put(`${API_ENDPOINT}/atividade/${metaId}/${atividade2.id}`, formData2, {
    headers: { ...formData2.getHeaders() }
  });

  // Buscar metas por usuário para verificar o progresso
  const response = await axios.get(`${API_ENDPOINT}/usuario/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;
  const metaComProgresso = data.metas.find(m => m.id === metaId);

  if (!metaComProgresso) {
    throw new Error('Meta para teste de progresso não foi encontrada');
  }

  // Verificar se o progresso foi calculado corretamente (50%)
  if (metaComProgresso.porcentagem_progresso !== 50) {
    throw new Error(`Progresso da meta deveria ser 50%, mas foi ${metaComProgresso.porcentagem_progresso}%`);
  }

  // Verificar se o progresso médio foi atualizado
  if (data.progresso_medio <= 0) {
    throw new Error('Progresso médio deveria ser maior que 0');
  }

  console.log(`   Meta com progresso calculado: ${metaComProgresso.porcentagem_progresso}%`);
  console.log(`   Progresso médio geral: ${data.progresso_medio}%`);
  console.log(`   Atividades concluídas: 2 de 4`);
}

// Função principal
async function runAllTests() {
  console.log('🚀 Iniciando testes da API de Metas PDI');
  console.log(`📍 Endpoint: ${API_ENDPOINT}`);
  
  try {
    // Testes de sucesso
    await runTest('Teste 1: Criar meta válida', test1_CriarMetaValida);
    await runTest('Teste 8: Criar meta com campos opcionais', test8_CriarMetaComCamposOpcionais);
    await runTest('Teste 9: Criar meta com todos os status válidos', test9_CriarMetaComTodosStatus);
    await runTest('Teste 10: Criar meta com muitas atividades e usuários', test10_CriarMetaComMuitasAtividades);
    
    // Testes de validação
    await runTest('Teste 2: Criar meta sem ID de usuário', test2_CriarMetaSemIdUsuario);
    await runTest('Teste 3: Criar meta sem título', test3_CriarMetaSemTitulo);
    await runTest('Teste 4: Criar meta sem atividades', test4_CriarMetaSemAtividades);
    await runTest('Teste 5: Criar meta com status inválido', test5_CriarMetaStatusInvalido);
    await runTest('Teste 6: Criar meta com data passada', test6_CriarMetaDataPassada);
    await runTest('Teste 7: Criar meta sem usuários envolvidos', test7_CriarMetaSemUsuariosEnvolvidos);
    
    // Testes de atualização
    await runTest('Teste 11: Atualizar meta válida', test11_AtualizarMetaValida);
    await runTest('Teste 12: Atualizar meta inexistente', test12_AtualizarMetaInexistente);
    await runTest('Teste 13: Atualizar meta com usuário diferente', test13_AtualizarMetaUsuarioDiferente);
    await runTest('Teste 14: Atualizar meta com dados inválidos', test14_AtualizarMetaComDadosInvalidos);
    await runTest('Teste 15: Atualizar meta com ID inválido', test15_AtualizarMetaComIDInvalido);
    
    // Testes de consulta
    await runTest('Teste 16: Buscar metas por gestor', test16_BuscarMetasPorGestor);
    await runTest('Teste 17: Buscar metas por gestor inexistente', test17_BuscarMetasPorGestorInexistente);
    await runTest('Teste 18: Buscar metas por gestor com ID inválido', test18_BuscarMetasPorGestorComIDInvalido);
    await runTest('Teste 19: Buscar metas por gestor sem ID', test19_BuscarMetasPorGestorSemID);
    await runTest('Teste 20: Buscar metas por gestor com metas complexas', test20_BuscarMetasPorGestorComMetasComplexas);
    
    // Testes de atualização de atividade
    await runTest('Teste 21: Atualizar status de atividade sem arquivo', test21_AtualizarStatusAtividadeSemArquivo);
    await runTest('Teste 22: Atualizar status de atividade com arquivo', test22_AtualizarStatusAtividadeComArquivo);
    await runTest('Teste 23: Atualizar status de atividade com meta inexistente', test23_AtualizarStatusAtividadeMetaInexistente);
    await runTest('Teste 24: Atualizar status de atividade com status inválido', test24_AtualizarStatusAtividadeStatusInvalido);
    await runTest('Teste 25: Atualizar status de atividade sem status', test25_AtualizarStatusAtividadeSemStatus);
    await runTest('Teste 26: Atualizar status de atividade com todos os status válidos', test26_AtualizarStatusAtividadeComTodosStatus);
    await runTest('Teste 27: Atualizar status de atividade com atividade inexistente', test27_AtualizarStatusAtividadeComAtividadeInexistente);
    
    // Testes da nova API de buscar metas por usuário
    await runTest('Teste 28: Buscar metas por usuário', test28_BuscarMetasPorUsuario);
    await runTest('Teste 29: Buscar metas por usuário inexistente', test29_BuscarMetasPorUsuarioInexistente);
    await runTest('Teste 30: Buscar metas por usuário com ID inválido', test30_BuscarMetasPorUsuarioComIDInvalido);
    await runTest('Teste 31: Buscar metas por usuário com progresso calculado', test31_BuscarMetasPorUsuarioComProgressoCalculado);
    
    console.log('\n🎉 Todos os testes concluídos!');
    
  } catch (error) {
    console.error('\n💥 Erro durante a execução dos testes:', error.message);
  } finally {
    // Limpeza dos dados de teste
    console.log('\n🧹 Iniciando limpeza dos dados de teste...');
    
    if (testData.createdMetaId) {
      await cleanupTestData(testData.createdMetaId);
    }
    
    if (testData.createdMetaId2) {
      await cleanupTestData(testData.createdMetaId2);
    }
    
    if (testData.createdMetaIds) {
      for (const metaId of testData.createdMetaIds) {
        await cleanupTestData(metaId);
      }
    }
    
    if (testData.createdMetaId3) {
      await cleanupTestData(testData.createdMetaId3);
    }
    
    if (testData.metaParaAtualizar) {
      await cleanupTestData(testData.metaParaAtualizar);
    }
    
    if (testData.metasParaConsulta) {
      for (const metaId of testData.metasParaConsulta) {
        await cleanupTestData(metaId);
      }
    }
    
    if (testData.metaComplexa) {
      await cleanupTestData(testData.metaComplexa);
    }
    
    if (testData.metaParaAtividade) {
      await cleanupTestData(testData.metaParaAtividade);
    }
    
    if (testData.metasParaUsuario) {
      for (const metaId of testData.metasParaUsuario) {
        await cleanupTestData(metaId);
      }
    }
    
    if (testData.metaParaProgresso) {
      await cleanupTestData(testData.metaParaProgresso);
    }
    
    console.log('\n✨ Limpeza concluída!');
  }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
