const axios = require('axios');

// Configuração da API
const API_BASE_URL = process.env.API_URL || 'http://localhost:3002/api';
const API_ENDPOINT = `${API_BASE_URL}/dashboard`;

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
async function test1_BuscarDashboardGestor() {
  const response = await axios.get(`${API_ENDPOINT}/gestor/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = [
    'gestor_id',
    'membros_equipe',
    'atividades_concluidas',
    'total_atividades',
    'metas_concluidas',
    'total_metas',
    'media_arvore_vida_equipe',
    'pontuacao_geral_usuarios',
    'quantidade_swot_por_pilar',
    'pilar_swot_por_colaborador',
    'experiencias_por_colaborador',
    'feedbacks_por_colaborador'
  ];

  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  // Verificar tipos de dados
  if (typeof data.gestor_id !== 'number') {
    throw new Error('gestor_id deve ser um número');
  }

  if (typeof data.membros_equipe !== 'number') {
    throw new Error('membros_equipe deve ser um número');
  }

  if (typeof data.atividades_concluidas !== 'number') {
    throw new Error('atividades_concluidas deve ser um número');
  }

  if (typeof data.total_atividades !== 'number') {
    throw new Error('total_atividades deve ser um número');
  }

  if (typeof data.metas_concluidas !== 'number') {
    throw new Error('metas_concluidas deve ser um número');
  }

  if (typeof data.total_metas !== 'number') {
    throw new Error('total_metas deve ser um número');
  }

  if (typeof data.media_arvore_vida_equipe !== 'number') {
    throw new Error('media_arvore_vida_equipe deve ser um número');
  }

  if (!Array.isArray(data.pontuacao_geral_usuarios)) {
    throw new Error('pontuacao_geral_usuarios deve ser um array');
  }

  if (!Array.isArray(data.pilar_swot_por_colaborador)) {
    throw new Error('pilar_swot_por_colaborador deve ser um array');
  }

  if (!Array.isArray(data.experiencias_por_colaborador)) {
    throw new Error('experiencias_por_colaborador deve ser um array');
  }

  if (!Array.isArray(data.feedbacks_por_colaborador)) {
    throw new Error('feedbacks_por_colaborador deve ser um array');
  }

  // Verificar estrutura da quantidade SWOT por pilar
  const swot = data.quantidade_swot_por_pilar;
  if (typeof swot !== 'object' || swot === null) {
    throw new Error('quantidade_swot_por_pilar deve ser um objeto');
  }

  const pilaresSwot = ['fortalezas', 'fraquezas', 'oportunidades', 'ameacas'];
  for (const pilar of pilaresSwot) {
    if (!(pilar in swot)) {
      throw new Error(`Pilar SWOT '${pilar}' não encontrado`);
    }
    if (typeof swot[pilar] !== 'number') {
      throw new Error(`Pilar SWOT '${pilar}' deve ser um número`);
    }
  }

  console.log(`   Dashboard do gestor 1 buscado com sucesso`);
  console.log(`   Membros da equipe: ${data.membros_equipe}`);
  console.log(`   Atividades concluídas: ${data.atividades_concluidas}/${data.total_atividades}`);
  console.log(`   Metas concluídas: ${data.metas_concluidas}/${data.total_metas}`);
  console.log(`   Média árvore da vida: ${data.media_arvore_vida_equipe}`);
  console.log(`   SWOT - F:${swot.fortalezas}, Fr:${swot.fraquezas}, O:${swot.oportunidades}, A:${swot.ameacas}`);

  // Verificar estrutura dos arrays se não estiverem vazios
  if (data.pontuacao_geral_usuarios.length > 0) {
    const usuario = data.pontuacao_geral_usuarios[0];
    if (!usuario.usuario_id || !usuario.usuario_nome || typeof usuario.pontuacao_geral !== 'number') {
      throw new Error('Estrutura de pontuacao_geral_usuarios incorreta');
    }
    console.log(`   Primeiro usuário: ${usuario.usuario_nome} (Pontuação: ${usuario.pontuacao_geral})`);
  }

  if (data.pilar_swot_por_colaborador.length > 0) {
    const colaborador = data.pilar_swot_por_colaborador[0];
    const camposSwotColaborador = ['usuario_id', 'usuario_nome', 'fortalezas', 'fraquezas', 'oportunidades', 'ameacas'];
    for (const campo of camposSwotColaborador) {
      if (!(campo in colaborador)) {
        throw new Error(`Campo '${campo}' não encontrado em pilar_swot_por_colaborador`);
      }
    }
    console.log(`   SWOT ${colaborador.usuario_nome}: F:${colaborador.fortalezas}, Fr:${colaborador.fraquezas}, O:${colaborador.oportunidades}, A:${colaborador.ameacas}`);
  }

  if (data.experiencias_por_colaborador.length > 0) {
    const experiencia = data.experiencias_por_colaborador[0];
    if (!experiencia.usuario_id || !experiencia.usuario_nome || typeof experiencia.quantidade_experiencias !== 'number') {
      throw new Error('Estrutura de experiencias_por_colaborador incorreta');
    }
    console.log(`   Experiências ${experiencia.usuario_nome}: ${experiencia.quantidade_experiencias}`);
  }

  if (data.feedbacks_por_colaborador.length > 0) {
    const feedback = data.feedbacks_por_colaborador[0];
    if (!feedback.usuario_id || !feedback.usuario_nome || typeof feedback.quantidade_feedbacks !== 'number') {
      throw new Error('Estrutura de feedbacks_por_colaborador incorreta');
    }
    console.log(`   Feedbacks ${feedback.usuario_nome}: ${feedback.quantidade_feedbacks}`);
  }
}

async function test2_BuscarDashboardGestorInexistente() {
  const response = await axios.get(`${API_ENDPOINT}/gestor/99999`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  if (data.gestor_id !== 99999) {
    throw new Error('ID do gestor na resposta não confere');
  }

  if (data.membros_equipe !== 0) {
    throw new Error('Membros da equipe deveria ser 0 para gestor inexistente');
  }

  if (data.atividades_concluidas !== 0) {
    throw new Error('Atividades concluídas deveria ser 0 para gestor sem equipe');
  }

  if (data.total_atividades !== 0) {
    throw new Error('Total de atividades deveria ser 0 para gestor sem equipe');
  }

  if (data.metas_concluidas !== 0) {
    throw new Error('Metas concluídas deveria ser 0 para gestor sem equipe');
  }

  if (data.total_metas !== 0) {
    throw new Error('Total de metas deveria ser 0 para gestor sem equipe');
  }

  if (data.media_arvore_vida_equipe !== 0) {
    throw new Error('Média árvore da vida deveria ser 0 para gestor sem equipe');
  }

  // Verificar arrays vazios
  if (!Array.isArray(data.pontuacao_geral_usuarios) || data.pontuacao_geral_usuarios.length !== 0) {
    throw new Error('pontuacao_geral_usuarios deveria ser array vazio');
  }

  if (!Array.isArray(data.pilar_swot_por_colaborador) || data.pilar_swot_por_colaborador.length !== 0) {
    throw new Error('pilar_swot_por_colaborador deveria ser array vazio');
  }

  if (!Array.isArray(data.experiencias_por_colaborador) || data.experiencias_por_colaborador.length !== 0) {
    throw new Error('experiencias_por_colaborador deveria ser array vazio');
  }

  if (!Array.isArray(data.feedbacks_por_colaborador) || data.feedbacks_por_colaborador.length !== 0) {
    throw new Error('feedbacks_por_colaborador deveria ser array vazio');
  }

  // Verificar SWOT zerado
  const swot = data.quantidade_swot_por_pilar;
  if (swot.fortalezas !== 0 || swot.fraquezas !== 0 || swot.oportunidades !== 0 || swot.ameacas !== 0) {
    throw new Error('SWOT deveria estar zerado para gestor sem equipe');
  }

  console.log(`   Dashboard de gestor inexistente (ID: 99999) retornou dados vazios corretamente`);
}

async function test3_BuscarDashboardGestorComIDInvalido() {
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

async function test4_BuscarDashboardGestorValidarCalculos() {
  const response = await axios.get(`${API_ENDPOINT}/gestor/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;

  // Validar que atividades concluídas <= total de atividades
  if (data.atividades_concluidas > data.total_atividades) {
    throw new Error('Atividades concluídas não pode ser maior que total de atividades');
  }

  // Validar que metas concluídas <= total de metas
  if (data.metas_concluidas > data.total_metas) {
    throw new Error('Metas concluídas não pode ser maior que total de metas');
  }

  // Validar que média da árvore da vida está entre 0 e 10
  if (data.media_arvore_vida_equipe < 0 || data.media_arvore_vida_equipe > 10) {
    throw new Error('Média da árvore da vida deve estar entre 0 e 10');
  }

  // Validar que número de membros confere com arrays de dados
  if (data.membros_equipe > 0) {
    if (data.pontuacao_geral_usuarios.length !== data.membros_equipe) {
      throw new Error('Número de usuários na pontuação geral deve conferir com membros da equipe');
    }

    if (data.experiencias_por_colaborador.length !== data.membros_equipe) {
      throw new Error('Número de usuários em experiências deve conferir com membros da equipe');
    }

    if (data.feedbacks_por_colaborador.length !== data.membros_equipe) {
      throw new Error('Número de usuários em feedbacks deve conferir com membros da equipe');
    }
  }

  // Validar valores não negativos
  const camposNumericos = [
    'membros_equipe', 'atividades_concluidas', 'total_atividades',
    'metas_concluidas', 'total_metas', 'media_arvore_vida_equipe'
  ];

  for (const campo of camposNumericos) {
    if (data[campo] < 0) {
      throw new Error(`Campo '${campo}' não pode ser negativo`);
    }
  }

  // Validar SWOT não negativo
  const swot = data.quantidade_swot_por_pilar;
  const pilaresSwot = ['fortalezas', 'fraquezas', 'oportunidades', 'ameacas'];
  for (const pilar of pilaresSwot) {
    if (swot[pilar] < 0) {
      throw new Error(`SWOT '${pilar}' não pode ser negativo`);
    }
  }

  console.log(`   Cálculos do dashboard validados com sucesso`);
  console.log(`   Coerência entre dados verificada`);
  console.log(`   Valores não negativos confirmados`);
}

async function test5_BuscarDashboardGestorEstruturaDados() {
  const response = await axios.get(`${API_ENDPOINT}/gestor/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;

  // Verificar estrutura detalhada dos arrays
  if (data.pontuacao_geral_usuarios.length > 0) {
    const usuario = data.pontuacao_geral_usuarios[0];
    const camposUsuario = ['usuario_id', 'usuario_nome', 'pontuacao_geral'];
    
    for (const campo of camposUsuario) {
      if (!(campo in usuario)) {
        throw new Error(`Campo '${campo}' não encontrado em pontuacao_geral_usuarios`);
      }
    }

    if (typeof usuario.usuario_id !== 'number') {
      throw new Error('usuario_id deve ser number');
    }

    if (typeof usuario.usuario_nome !== 'string') {
      throw new Error('usuario_nome deve ser string');
    }

    if (typeof usuario.pontuacao_geral !== 'number') {
      throw new Error('pontuacao_geral deve ser number');
    }

    if (usuario.pontuacao_geral < 0 || usuario.pontuacao_geral > 10) {
      throw new Error('pontuacao_geral deve estar entre 0 e 10');
    }
  }

  if (data.pilar_swot_por_colaborador.length > 0) {
    const colaborador = data.pilar_swot_por_colaborador[0];
    const camposColaborador = ['usuario_id', 'usuario_nome', 'fortalezas', 'fraquezas', 'oportunidades', 'ameacas'];
    
    for (const campo of camposColaborador) {
      if (!(campo in colaborador)) {
        throw new Error(`Campo '${campo}' não encontrado em pilar_swot_por_colaborador`);
      }
    }

    const camposNumericos = ['usuario_id', 'fortalezas', 'fraquezas', 'oportunidades', 'ameacas'];
    for (const campo of camposNumericos) {
      if (typeof colaborador[campo] !== 'number') {
        throw new Error(`Campo '${campo}' deve ser number em pilar_swot_por_colaborador`);
      }
      if (colaborador[campo] < 0) {
        throw new Error(`Campo '${campo}' não pode ser negativo`);
      }
    }
  }

  if (data.experiencias_por_colaborador.length > 0) {
    const experiencia = data.experiencias_por_colaborador[0];
    const camposExperiencia = ['usuario_id', 'usuario_nome', 'quantidade_experiencias'];
    
    for (const campo of camposExperiencia) {
      if (!(campo in experiencia)) {
        throw new Error(`Campo '${campo}' não encontrado em experiencias_por_colaborador`);
      }
    }

    if (typeof experiencia.quantidade_experiencias !== 'number' || experiencia.quantidade_experiencias < 0) {
      throw new Error('quantidade_experiencias deve ser number não negativo');
    }
  }

  if (data.feedbacks_por_colaborador.length > 0) {
    const feedback = data.feedbacks_por_colaborador[0];
    const camposFeedback = ['usuario_id', 'usuario_nome', 'quantidade_feedbacks'];
    
    for (const campo of camposFeedback) {
      if (!(campo in feedback)) {
        throw new Error(`Campo '${campo}' não encontrado em feedbacks_por_colaborador`);
      }
    }

    if (typeof feedback.quantidade_feedbacks !== 'number' || feedback.quantidade_feedbacks < 0) {
      throw new Error('quantidade_feedbacks deve ser number não negativo');
    }
  }

  console.log(`   Estrutura detalhada dos dados validada com sucesso`);
  console.log(`   Tipos de dados corretos confirmados`);
  console.log(`   Validações de range aplicadas corretamente`);
}

// Testes da nova API - Árvore da Vida por Gestor
async function test6_BuscarArvoreDaVidaPorGestor() {
  const response = await axios.get(`${API_ENDPOINT}/arvore-da-vida/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = [
    'gestor_id',
    'total_colaboradores',
    'media_geral',
    'maior_pontuacao',
    'colaborador'
  ];

  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  // Verificar tipos de dados
  if (typeof data.gestor_id !== 'number') {
    throw new Error('gestor_id deve ser um número');
  }

  if (typeof data.total_colaboradores !== 'number') {
    throw new Error('total_colaboradores deve ser um número');
  }

  if (typeof data.media_geral !== 'number') {
    throw new Error('media_geral deve ser um número');
  }

  if (typeof data.maior_pontuacao !== 'number') {
    throw new Error('maior_pontuacao deve ser um número');
  }

  if (!Array.isArray(data.colaborador)) {
    throw new Error('colaborador deve ser um array');
  }

  console.log(`   Árvore da vida do gestor 1 buscada com sucesso`);
  console.log(`   Total de colaboradores: ${data.total_colaboradores}`);
  console.log(`   Média geral: ${data.media_geral}`);
  console.log(`   Maior pontuação: ${data.maior_pontuacao}`);

  // Verificar estrutura dos colaboradores se não estiver vazio
  if (data.colaborador.length > 0) {
    const colaborador = data.colaborador[0];
    const camposColaborador = [
      'nome', 'pontuacao_geral', 'criatividade_hobbie', 'plenitude_felicidade',
      'espiritualidade', 'saude_disposicao', 'desenvolvimento_intelectual',
      'equilibrio_emocional', 'familia', 'desenvolvimento_amoroso',
      'vida_social', 'realizacao_proposito', 'recursos_financeiros',
      'contribuicao_social'
    ];
    
    for (const campo of camposColaborador) {
      if (!(campo in colaborador)) {
        throw new Error(`Campo '${campo}' não encontrado em colaborador`);
      }
    }

    if (typeof colaborador.nome !== 'string') {
      throw new Error('nome do colaborador deve ser string');
    }

    const camposNumericos = camposColaborador.filter(c => c !== 'nome');
    for (const campo of camposNumericos) {
      if (typeof colaborador[campo] !== 'number') {
        throw new Error(`${campo} deve ser number`);
      }
      if (colaborador[campo] < 0 || colaborador[campo] > 10) {
        throw new Error(`${campo} deve estar entre 0 e 10`);
      }
    }

    console.log(`   Primeiro colaborador: ${colaborador.nome} (Pontuação geral: ${colaborador.pontuacao_geral})`);
  }
}

async function test7_BuscarArvoreDaVidaGestorInexistente() {
  const response = await axios.get(`${API_ENDPOINT}/arvore-da-vida/99999`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  if (data.gestor_id !== 99999) {
    throw new Error('ID do gestor na resposta não confere');
  }

  if (data.total_colaboradores !== 0) {
    throw new Error('Total de colaboradores deveria ser 0 para gestor inexistente');
  }

  if (data.media_geral !== 0) {
    throw new Error('Média geral deveria ser 0 para gestor sem equipe');
  }

  if (data.maior_pontuacao !== 0) {
    throw new Error('Maior pontuação deveria ser 0 para gestor sem equipe');
  }

  if (!Array.isArray(data.colaborador) || data.colaborador.length !== 0) {
    throw new Error('colaborador deveria ser array vazio');
  }

  console.log(`   Árvore da vida de gestor inexistente (ID: 99999) retornou dados vazios corretamente`);
}

async function test8_BuscarArvoreDaVidaComIDInvalido() {
  try {
    await axios.get(`${API_ENDPOINT}/arvore-da-vida/abc`);
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

async function test9_ValidarCalculosArvoreDaVida() {
  const response = await axios.get(`${API_ENDPOINT}/arvore-da-vida/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;

  // Validar que média geral está entre 0 e 10
  if (data.media_geral < 0 || data.media_geral > 10) {
    throw new Error('Média geral deve estar entre 0 e 10');
  }

  // Validar que maior pontuação está entre 0 e 10
  if (data.maior_pontuacao < 0 || data.maior_pontuacao > 10) {
    throw new Error('Maior pontuação deve estar entre 0 e 10');
  }

  // Validar que total de colaboradores confere com array
  if (data.total_colaboradores !== data.colaborador.length) {
    throw new Error('Total de colaboradores deve conferir com tamanho do array');
  }

  // Validar valores não negativos
  const camposNumericos = ['total_colaboradores', 'media_geral', 'maior_pontuacao'];
  for (const campo of camposNumericos) {
    if (data[campo] < 0) {
      throw new Error(`Campo '${campo}' não pode ser negativo`);
    }
  }

  // Se há colaboradores, validar consistência dos cálculos
  if (data.colaborador.length > 0) {
    const pontuacoesValidas = data.colaborador
      .map(c => c.pontuacao_geral)
      .filter(p => p > 0);

    if (pontuacoesValidas.length > 0) {
      const mediaCalculada = Math.round(pontuacoesValidas.reduce((sum, p) => sum + p, 0) / pontuacoesValidas.length);
      const maiorCalculada = Math.max(...pontuacoesValidas);

      if (data.media_geral !== mediaCalculada) {
        throw new Error(`Média geral incorreta. Esperado: ${mediaCalculada}, Recebido: ${data.media_geral}`);
      }

      if (data.maior_pontuacao !== maiorCalculada) {
        throw new Error(`Maior pontuação incorreta. Esperado: ${maiorCalculada}, Recebido: ${data.maior_pontuacao}`);
      }
    }
  }

  console.log(`   Cálculos da árvore da vida validados com sucesso`);
  console.log(`   Coerência entre dados verificada`);
  console.log(`   Valores não negativos confirmados`);
}

async function test10_ValidarEstruturaDadosArvoreDaVida() {
  const response = await axios.get(`${API_ENDPOINT}/arvore-da-vida/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;

  // Verificar estrutura detalhada dos colaboradores
  if (data.colaborador.length > 0) {
    for (const colaborador of data.colaborador) {
      // Verificar todos os campos obrigatórios
      const camposObrigatorios = [
        'nome', 'pontuacao_geral', 'criatividade_hobbie', 'plenitude_felicidade',
        'espiritualidade', 'saude_disposicao', 'desenvolvimento_intelectual',
        'equilibrio_emocional', 'familia', 'desenvolvimento_amoroso',
        'vida_social', 'realizacao_proposito', 'recursos_financeiros',
        'contribuicao_social'
      ];

      for (const campo of camposObrigatorios) {
        if (!(campo in colaborador)) {
          throw new Error(`Campo '${campo}' não encontrado no colaborador ${colaborador.nome || 'sem nome'}`);
        }
      }

      // Verificar tipos
      if (typeof colaborador.nome !== 'string') {
        throw new Error(`Nome deve ser string para colaborador ${colaborador.nome}`);
      }

      // Verificar ranges das pontuações
      const camposNumericos = camposObrigatorios.filter(c => c !== 'nome');
      for (const campo of camposNumericos) {
        if (typeof colaborador[campo] !== 'number') {
          throw new Error(`${campo} deve ser number para colaborador ${colaborador.nome}`);
        }
        if (colaborador[campo] < 0 || colaborador[campo] > 10) {
          throw new Error(`${campo} deve estar entre 0 e 10 para colaborador ${colaborador.nome}. Valor: ${colaborador[campo]}`);
        }
      }
    }
  }

  console.log(`   Estrutura detalhada da árvore da vida validada com sucesso`);
  console.log(`   Tipos de dados corretos confirmados`);
  console.log(`   Validações de range aplicadas corretamente`);
}

// Testes da nova API - Análise SWOT por Gestor
async function test11_BuscarAnaliseSwotPorGestor() {
  const response = await axios.get(`${API_ENDPOINT}/analise-swot/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = [
    'gestor_id',
    'total_forcas',
    'total_fraquezas',
    'total_oportunidades',
    'total_ameacas',
    'colaborador'
  ];

  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  // Verificar tipos de dados
  if (typeof data.gestor_id !== 'number') {
    throw new Error('gestor_id deve ser um número');
  }

  const camposNumericos = ['total_forcas', 'total_fraquezas', 'total_oportunidades', 'total_ameacas'];
  for (const campo of camposNumericos) {
    if (typeof data[campo] !== 'number') {
      throw new Error(`${campo} deve ser um número`);
    }
    if (data[campo] < 0) {
      throw new Error(`${campo} não pode ser negativo`);
    }
  }

  if (!Array.isArray(data.colaborador)) {
    throw new Error('colaborador deve ser um array');
  }

  console.log(`   Análise SWOT do gestor 1 buscada com sucesso`);
  console.log(`   Total de forças: ${data.total_forcas}`);
  console.log(`   Total de fraquezas: ${data.total_fraquezas}`);
  console.log(`   Total de oportunidades: ${data.total_oportunidades}`);
  console.log(`   Total de ameaças: ${data.total_ameacas}`);

  // Verificar estrutura dos colaboradores se não estiver vazio
  if (data.colaborador.length > 0) {
    const colaborador = data.colaborador[0];
    const camposColaborador = ['nome', 'pilar1', 'pilar2', 'pilar3', 'pilar4'];
    
    for (const campo of camposColaborador) {
      if (!(campo in colaborador)) {
        throw new Error(`Campo '${campo}' não encontrado em colaborador`);
      }
    }

    if (typeof colaborador.nome !== 'string') {
      throw new Error('nome do colaborador deve ser string');
    }

    const pilares = ['pilar1', 'pilar2', 'pilar3', 'pilar4'];
    for (const pilar of pilares) {
      if (!Array.isArray(colaborador[pilar])) {
        throw new Error(`${pilar} deve ser um array`);
      }
      // Verificar se todos os itens do pilar são strings
      for (const texto of colaborador[pilar]) {
        if (typeof texto !== 'string') {
          throw new Error(`Todos os textos em ${pilar} devem ser strings`);
        }
      }
    }

    console.log(`   Primeiro colaborador: ${colaborador.nome}`);
    console.log(`   Pilares: pilar1=${colaborador.pilar1.length}, pilar2=${colaborador.pilar2.length}, pilar3=${colaborador.pilar3.length}, pilar4=${colaborador.pilar4.length}`);
  }
}

async function test12_BuscarAnaliseSwotGestorInexistente() {
  const response = await axios.get(`${API_ENDPOINT}/analise-swot/99999`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  if (data.gestor_id !== 99999) {
    throw new Error('ID do gestor na resposta não confere');
  }

  const camposZerados = ['total_forcas', 'total_fraquezas', 'total_oportunidades', 'total_ameacas'];
  for (const campo of camposZerados) {
    if (data[campo] !== 0) {
      throw new Error(`${campo} deveria ser 0 para gestor sem equipe`);
    }
  }

  if (!Array.isArray(data.colaborador) || data.colaborador.length !== 0) {
    throw new Error('colaborador deveria ser array vazio');
  }

  console.log(`   Análise SWOT de gestor inexistente (ID: 99999) retornou dados vazios corretamente`);
}

async function test13_BuscarAnaliseSwotComIDInvalido() {
  try {
    await axios.get(`${API_ENDPOINT}/analise-swot/abc`);
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

  console.log(`   Validação de ID inválido funcionando corretamente`);
}

async function test14_ValidarCalculosAnaliseSwot() {
  const response = await axios.get(`${API_ENDPOINT}/analise-swot/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;

  // Validar valores não negativos
  const camposNumericos = ['total_forcas', 'total_fraquezas', 'total_oportunidades', 'total_ameacas'];
  for (const campo of camposNumericos) {
    if (data[campo] < 0) {
      throw new Error(`Campo '${campo}' não pode ser negativo`);
    }
  }

  // Se há colaboradores, validar consistência dos cálculos
  if (data.colaborador.length > 0) {
    let contadorForcas = 0;
    let contadorFraquezas = 0;
    let contadorOportunidades = 0;
    let contadorAmeacas = 0;

    for (const colaborador of data.colaborador) {
      contadorForcas += colaborador.pilar1.length;
      contadorFraquezas += colaborador.pilar2.length;
      contadorOportunidades += colaborador.pilar3.length;
      contadorAmeacas += colaborador.pilar4.length;
    }

    if (data.total_forcas !== contadorForcas) {
      throw new Error(`Total de forças incorreto. Esperado: ${contadorForcas}, Recebido: ${data.total_forcas}`);
    }

    if (data.total_fraquezas !== contadorFraquezas) {
      throw new Error(`Total de fraquezas incorreto. Esperado: ${contadorFraquezas}, Recebido: ${data.total_fraquezas}`);
    }

    if (data.total_oportunidades !== contadorOportunidades) {
      throw new Error(`Total de oportunidades incorreto. Esperado: ${contadorOportunidades}, Recebido: ${data.total_oportunidades}`);
    }

    if (data.total_ameacas !== contadorAmeacas) {
      throw new Error(`Total de ameaças incorreto. Esperado: ${contadorAmeacas}, Recebido: ${data.total_ameacas}`);
    }
  }

  console.log(`   Cálculos da análise SWOT validados com sucesso`);
  console.log(`   Coerência entre totais e pilares verificada`);
  console.log(`   Valores não negativos confirmados`);
}

async function test15_ValidarEstruturaDadosAnaliseSwot() {
  const response = await axios.get(`${API_ENDPOINT}/analise-swot/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;

  // Verificar estrutura detalhada dos colaboradores
  if (data.colaborador.length > 0) {
    for (const colaborador of data.colaborador) {
      // Verificar todos os campos obrigatórios
      const camposObrigatorios = ['nome', 'pilar1', 'pilar2', 'pilar3', 'pilar4'];

      for (const campo of camposObrigatorios) {
        if (!(campo in colaborador)) {
          throw new Error(`Campo '${campo}' não encontrado no colaborador ${colaborador.nome || 'sem nome'}`);
        }
      }

      // Verificar tipos
      if (typeof colaborador.nome !== 'string') {
        throw new Error(`Nome deve ser string para colaborador ${colaborador.nome}`);
      }

      // Verificar pilares
      const pilares = ['pilar1', 'pilar2', 'pilar3', 'pilar4'];
      for (const pilar of pilares) {
        if (!Array.isArray(colaborador[pilar])) {
          throw new Error(`${pilar} deve ser array para colaborador ${colaborador.nome}`);
        }

        // Verificar conteúdo dos pilares
        for (let i = 0; i < colaborador[pilar].length; i++) {
          const texto = colaborador[pilar][i];
          if (typeof texto !== 'string') {
            throw new Error(`Texto ${i + 1} em ${pilar} deve ser string para colaborador ${colaborador.nome}`);
          }
          if (texto.trim().length === 0) {
            throw new Error(`Texto ${i + 1} em ${pilar} não pode estar vazio para colaborador ${colaborador.nome}`);
          }
        }
      }
    }
  }

  console.log(`   Estrutura detalhada da análise SWOT validada com sucesso`);
  console.log(`   Tipos de dados corretos confirmados`);
  console.log(`   Validações de conteúdo aplicadas corretamente`);
}

// Testes da nova API - Portfólio por Gestor
async function test16_BuscarPortifolioPorGestor() {
  const response = await axios.get(`${API_ENDPOINT}/portifolio/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  // Verificar estrutura da resposta
  const camposObrigatorios = [
    'gestor_id',
    'quantidade_links',
    'quantidade_feedbacks',
    'quantidade_acoes',
    'quantidade_resultados',
    'colaborador'
  ];

  for (const campo of camposObrigatorios) {
    if (!(campo in data)) {
      throw new Error(`Campo obrigatório '${campo}' não encontrado na resposta`);
    }
  }

  // Verificar tipos de dados
  if (typeof data.gestor_id !== 'number') {
    throw new Error('gestor_id deve ser um número');
  }

  const camposNumericos = ['quantidade_links', 'quantidade_feedbacks', 'quantidade_acoes', 'quantidade_resultados'];
  for (const campo of camposNumericos) {
    if (typeof data[campo] !== 'number') {
      throw new Error(`${campo} deve ser um número`);
    }
    if (data[campo] < 0) {
      throw new Error(`${campo} não pode ser negativo`);
    }
  }

  if (!Array.isArray(data.colaborador)) {
    throw new Error('colaborador deve ser um array');
  }

  console.log(`   Portfólio do gestor 1 buscado com sucesso`);
  console.log(`   Quantidade de links: ${data.quantidade_links}`);
  console.log(`   Quantidade de feedbacks: ${data.quantidade_feedbacks}`);
  console.log(`   Quantidade de ações: ${data.quantidade_acoes}`);
  console.log(`   Quantidade de resultados: ${data.quantidade_resultados}`);

  // Verificar estrutura dos colaboradores se não estiver vazio
  if (data.colaborador.length > 0) {
    const colaborador = data.colaborador[0];
    
    if (!colaborador.nome || typeof colaborador.nome !== 'string') {
      throw new Error('nome do colaborador deve ser string');
    }

    // Verificar se há experiências (experiencia1, experiencia2, etc.)
    const experiencias = Object.keys(colaborador).filter(key => key.startsWith('experiencia'));
    
    if (experiencias.length > 0) {
      const primeiraExperiencia = colaborador[experiencias[0]];
      const camposExperiencia = ['titulo', 'data', 'acao_realizada', 'resultado_entregue', 'feedback', 'link'];
      
      for (const campo of camposExperiencia) {
        if (!(campo in primeiraExperiencia)) {
          throw new Error(`Campo '${campo}' não encontrado na experiência`);
        }
      }

      console.log(`   Primeiro colaborador: ${colaborador.nome}`);
      console.log(`   Experiências encontradas: ${experiencias.length}`);
      console.log(`   Primeira experiência: ${primeiraExperiencia.titulo || 'Sem título'}`);
    } else {
      console.log(`   Primeiro colaborador: ${colaborador.nome} (sem experiências)`);
    }
  }
}

async function test17_BuscarPortifolioGestorInexistente() {
  const response = await axios.get(`${API_ENDPOINT}/portifolio/99999`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Resposta deve ter success: true');
  }

  const data = response.data.data;
  
  if (data.gestor_id !== 99999) {
    throw new Error('ID do gestor na resposta não confere');
  }

  const camposZerados = ['quantidade_links', 'quantidade_feedbacks', 'quantidade_acoes', 'quantidade_resultados'];
  for (const campo of camposZerados) {
    if (data[campo] !== 0) {
      throw new Error(`${campo} deveria ser 0 para gestor sem equipe`);
    }
  }

  if (!Array.isArray(data.colaborador) || data.colaborador.length !== 0) {
    throw new Error('colaborador deveria ser array vazio');
  }

  console.log(`   Portfólio de gestor inexistente (ID: 99999) retornou dados vazios corretamente`);
}

async function test18_BuscarPortifolioComIDInvalido() {
  try {
    await axios.get(`${API_ENDPOINT}/portifolio/abc`);
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

  console.log(`   Validação de ID inválido funcionando corretamente`);
}

async function test19_ValidarCalculosPortifolio() {
  const response = await axios.get(`${API_ENDPOINT}/portifolio/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;

  // Validar valores não negativos
  const camposNumericos = ['quantidade_links', 'quantidade_feedbacks', 'quantidade_acoes', 'quantidade_resultados'];
  for (const campo of camposNumericos) {
    if (data[campo] < 0) {
      throw new Error(`Campo '${campo}' não pode ser negativo`);
    }
  }

  // Se há colaboradores, validar consistência dos dados
  if (data.colaborador.length > 0) {
    let contadorExperiencias = 0;

    for (const colaborador of data.colaborador) {
      // Contar experiências do colaborador
      const experiencias = Object.keys(colaborador).filter(key => key.startsWith('experiencia'));
      contadorExperiencias += experiencias.length;

      // Validar estrutura de cada experiência
      for (const expKey of experiencias) {
        const experiencia = colaborador[expKey];
        
        // Verificar se é um objeto
        if (typeof experiencia !== 'object' || experiencia === null) {
          throw new Error(`Experiência ${expKey} deve ser um objeto para colaborador ${colaborador.nome}`);
        }

        // Verificar campos obrigatórios
        const camposObrigatorios = ['titulo', 'data', 'acao_realizada', 'resultado_entregue', 'feedback', 'link'];
        for (const campo of camposObrigatorios) {
          if (!(campo in experiencia)) {
            throw new Error(`Campo '${campo}' não encontrado em ${expKey} do colaborador ${colaborador.nome}`);
          }
        }

        // Verificar tipos de dados
        const camposString = ['titulo', 'acao_realizada', 'resultado_entregue', 'feedback', 'link'];
        for (const campo of camposString) {
          if (typeof experiencia[campo] !== 'string') {
            throw new Error(`Campo '${campo}' deve ser string em ${expKey} do colaborador ${colaborador.nome}`);
          }
        }

        // Data pode ser string (formato YYYY-MM-DD) ou null
        if (experiencia.data !== null && typeof experiencia.data !== 'string') {
          throw new Error(`Campo 'data' deve ser string ou null em ${expKey} do colaborador ${colaborador.nome}`);
        }
      }
    }
  }

  console.log(`   Cálculos do portfólio validados com sucesso`);
  console.log(`   Coerência entre dados verificada`);
  console.log(`   Valores não negativos confirmados`);
}

async function test20_ValidarEstruturaDadosPortifolio() {
  const response = await axios.get(`${API_ENDPOINT}/portifolio/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  const data = response.data.data;

  // Verificar estrutura detalhada dos colaboradores
  if (data.colaborador.length > 0) {
    for (const colaborador of data.colaborador) {
      // Verificar nome obrigatório
      if (!colaborador.nome || typeof colaborador.nome !== 'string') {
        throw new Error(`Nome deve ser string não vazia para colaborador`);
      }

      // Verificar experiências
      const experiencias = Object.keys(colaborador).filter(key => key.startsWith('experiencia'));
      
      for (const expKey of experiencias) {
        const experiencia = colaborador[expKey];
        
        // Verificar estrutura completa da experiência
        const camposObrigatorios = ['titulo', 'data', 'acao_realizada', 'resultado_entregue', 'feedback', 'link'];
        
        for (const campo of camposObrigatorios) {
          if (!(campo in experiencia)) {
            throw new Error(`Campo '${campo}' não encontrado em ${expKey} do colaborador ${colaborador.nome}`);
          }
        }

        // Validar tipos específicos
        if (typeof experiencia.titulo !== 'string') {
          throw new Error(`Título deve ser string em ${expKey} do colaborador ${colaborador.nome}`);
        }

        if (experiencia.data !== null && (typeof experiencia.data !== 'string' || !experiencia.data.match(/^\d{4}-\d{2}-\d{2}$/))) {
          throw new Error(`Data deve ser string no formato YYYY-MM-DD ou null em ${expKey} do colaborador ${colaborador.nome}`);
        }

        if (typeof experiencia.acao_realizada !== 'string') {
          throw new Error(`Ação realizada deve ser string em ${expKey} do colaborador ${colaborador.nome}`);
        }

        if (typeof experiencia.resultado_entregue !== 'string') {
          throw new Error(`Resultado entregue deve ser string em ${expKey} do colaborador ${colaborador.nome}`);
        }

        if (typeof experiencia.feedback !== 'string') {
          throw new Error(`Feedback deve ser string em ${expKey} do colaborador ${colaborador.nome}`);
        }

        if (typeof experiencia.link !== 'string') {
          throw new Error(`Link deve ser string em ${expKey} do colaborador ${colaborador.nome}`);
        }
      }
    }
  }

  console.log(`   Estrutura detalhada do portfólio validada com sucesso`);
  console.log(`   Tipos de dados corretos confirmados`);
  console.log(`   Validações de conteúdo aplicadas corretamente`);
}

// Função principal
async function runAllTests() {
  console.log('🚀 Iniciando testes da API de Dashboard');
  console.log(`📍 Endpoint: ${API_ENDPOINT}`);
  
  try {
    // Testes da API de dashboard
    await runTest('Teste 1: Buscar dashboard do gestor', test1_BuscarDashboardGestor);
    await runTest('Teste 2: Buscar dashboard de gestor inexistente', test2_BuscarDashboardGestorInexistente);
    await runTest('Teste 3: Buscar dashboard com ID inválido', test3_BuscarDashboardGestorComIDInvalido);
    await runTest('Teste 4: Validar cálculos do dashboard', test4_BuscarDashboardGestorValidarCalculos);
    await runTest('Teste 5: Validar estrutura detalhada dos dados', test5_BuscarDashboardGestorEstruturaDados);
    
    // Testes da nova API - Árvore da Vida por Gestor
    await runTest('Teste 6: Buscar árvore da vida por gestor', test6_BuscarArvoreDaVidaPorGestor);
    await runTest('Teste 7: Buscar árvore da vida de gestor inexistente', test7_BuscarArvoreDaVidaGestorInexistente);
    await runTest('Teste 8: Buscar árvore da vida com ID inválido', test8_BuscarArvoreDaVidaComIDInvalido);
    await runTest('Teste 9: Validar cálculos da árvore da vida', test9_ValidarCalculosArvoreDaVida);
    await runTest('Teste 10: Validar estrutura detalhada da árvore da vida', test10_ValidarEstruturaDadosArvoreDaVida);
    
    // Testes da nova API - Análise SWOT por Gestor
    await runTest('Teste 11: Buscar análise SWOT por gestor', test11_BuscarAnaliseSwotPorGestor);
    await runTest('Teste 12: Buscar análise SWOT de gestor inexistente', test12_BuscarAnaliseSwotGestorInexistente);
    await runTest('Teste 13: Buscar análise SWOT com ID inválido', test13_BuscarAnaliseSwotComIDInvalido);
    await runTest('Teste 14: Validar cálculos da análise SWOT', test14_ValidarCalculosAnaliseSwot);
    await runTest('Teste 15: Validar estrutura detalhada da análise SWOT', test15_ValidarEstruturaDadosAnaliseSwot);
    
    // Testes da nova API - Portfólio por Gestor
    await runTest('Teste 16: Buscar portfólio por gestor', test16_BuscarPortifolioPorGestor);
    await runTest('Teste 17: Buscar portfólio de gestor inexistente', test17_BuscarPortifolioGestorInexistente);
    await runTest('Teste 18: Buscar portfólio com ID inválido', test18_BuscarPortifolioComIDInvalido);
    await runTest('Teste 19: Validar cálculos do portfólio', test19_ValidarCalculosPortifolio);
    await runTest('Teste 20: Validar estrutura detalhada do portfólio', test20_ValidarEstruturaDadosPortifolio);
    
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

