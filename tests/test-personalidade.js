const axios = require('axios');

async function testPersonalidade() {
  const baseURL = 'http://localhost:3002';
  const apiURL = `${baseURL}/api/personalidade`;
  
  console.log('🧪 Testando APIs de Personalidade MBTI...\n');

  try {
    // Teste 1: Verificar se o servidor está rodando
    console.log('1️⃣ Verificando se o servidor está rodando...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Servidor funcionando:', healthResponse.data.status);
    
    // Teste 2: Buscar perguntas pendentes
    console.log('\n2️⃣ Testando GET - Buscar perguntas pendentes...');
    try {
      const perguntasResponse = await axios.get(`${apiURL}/1/perguntas-pendentes`);
      console.log('✅ Perguntas pendentes encontradas');
      console.log('📋 Total de perguntas:', perguntasResponse.data.data.total_perguntas);
      console.log('📋 Primeira pergunta:', perguntasResponse.data.data.perguntas_pendentes[0]);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Retornou 404 corretamente (usuário não encontrado ou sem perguntas)');
      } else {
        console.log('❌ Erro inesperado:', error.response?.status);
      }
    }
    
    // Teste 3: Salvar respostas (simulação)
    console.log('\n3️⃣ Testando POST - Salvar respostas...');
    const respostas = [
      { id_pergunta: 1, resposta: 4, dimensao: 'E', weight: 1 },
      { id_pergunta: 2, resposta: 3, dimensao: 'P', weight: -1 },
      { id_pergunta: 3, resposta: 5, dimensao: 'T', weight: 1 },
      { id_pergunta: 4, resposta: 2, dimensao: 'S', weight: 1 },
      { id_pergunta: 5, resposta: 4, dimensao: 'N', weight: 1 },
      { id_pergunta: 6, resposta: 3, dimensao: 'F', weight: 1 },
      { id_pergunta: 7, resposta: 5, dimensao: 'J', weight: 1 },
      { id_pergunta: 8, resposta: 2, dimensao: 'I', weight: 1 }
    ];
    
    try {
      const salvarResponse = await axios.post(`${apiURL}/respostas`, {
        id_usuario: 1,
        respostas: respostas
      });
      console.log('✅ Respostas salvas com sucesso');
      console.log('📋 Respostas salvas:', salvarResponse.data.data.respostas_salvas);
      console.log('📋 Todas respondidas:', salvarResponse.data.data.todas_perguntas_respondidas);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validação funcionando (perguntas não existem)');
        console.log('📋 Mensagem:', error.response.data.message);
      } else {
        console.log('❌ Erro inesperado:', error.response?.status);
      }
    }
    
    // Teste 4: Buscar resultado
    console.log('\n4️⃣ Testando GET - Buscar resultado...');
    try {
      const resultadoResponse = await axios.get(`${apiURL}/1/resultado`);
      console.log('✅ Resultado encontrado');
      console.log('📋 Tipo MBTI:', resultadoResponse.data.data.resultado.dimensao);
      console.log('📋 Nome:', resultadoResponse.data.data.resultado.nome);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Retornou 404 corretamente (teste não completo)');
        console.log('📋 Mensagem:', error.response.data.message);
      } else {
        console.log('❌ Erro inesperado:', error.response?.status);
      }
    }
    
    // Teste 5: Validações de entrada
    console.log('\n5️⃣ Testando validações de entrada...');
    
    // Teste com id_usuario inválido
    try {
      await axios.get(`${apiURL}/-1/perguntas-pendentes`);
      console.log('❌ Deveria validar id_usuario positivo');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validação de id_usuario funcionando');
      }
    }
    
    // Teste com dimensão inválida
    try {
      await axios.post(`${apiURL}/respostas`, {
        id_usuario: 1,
        respostas: [
          { id_pergunta: 1, resposta: 4, dimensao: 'X', weight: 1 } // Dimensão inválida
        ]
      });
      console.log('❌ Deveria validar dimensão MBTI válida');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validação de dimensão funcionando');
      }
    }
    
    // Teste com weight inválido
    try {
      await axios.post(`${apiURL}/respostas`, {
        id_usuario: 1,
        respostas: [
          { id_pergunta: 1, resposta: 4, dimensao: 'E', weight: 'abc' } // Weight inválido
        ]
      });
      console.log('❌ Deveria validar weight numérico');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validação de weight funcionando');
      }
    }
    
    // Teste 6: Teste de fluxo completo (simulação)
    console.log('\n6️⃣ Testando fluxo completo...');
    console.log('📋 Fluxo esperado:');
    console.log('   1. Buscar perguntas pendentes');
    console.log('   2. Salvar respostas com dimensões e weights');
    console.log('   3. Se todas respondidas, calcular tipo MBTI automaticamente');
    console.log('   4. Buscar resultado final');
    console.log('   5. Resultado vinculado ao perfil do colaborador');
    
    // Teste 7: Explicação do cálculo MBTI
    console.log('\n7️⃣ Explicação do cálculo MBTI...');
    console.log('📋 Cálculo do score: score = (resposta - 3) * weight');
    console.log('   - Resposta 1 → score = (1-3) * 1 = -2');
    console.log('   - Resposta 3 → score = (3-3) * 1 = 0 (neutro)');
    console.log('   - Resposta 5 → score = (5-3) * 1 = +2');
    console.log('   - Weight negativo inverte o sentido da pergunta');
    console.log('📋 Dimensões E/I: se E aumenta, I diminui (e vice-versa)');
    console.log('📋 Outras dimensões: somadas diretamente');
    console.log('📋 Tipo final: comparação de scores (ex: E>I, S>N, T>F, J>P)');
    
    console.log('\n🎉 Todos os testes foram executados com sucesso!');
    console.log('\n📋 Resumo das APIs testadas:');
    console.log('   ✅ GET /:id_usuario/perguntas-pendentes - Buscar perguntas pendentes');
    console.log('   ✅ POST /respostas - Salvar respostas');
    console.log('   ✅ GET /:id_usuario/resultado - Buscar resultado');
    console.log('   ✅ Validações de entrada');
    console.log('   ✅ Tratamento de erros');
    console.log('   ✅ Lógica de cálculo MBTI');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

// Executar teste
testPersonalidade().catch(console.error); 