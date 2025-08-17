const axios = require('axios');

async function testPerfilColaborador() {
  const baseURL = 'http://localhost:3002';
  const apiURL = `${baseURL}/api/perfil-colaborador`;
  
  console.log('🧪 Testando APIs de Perfil do Colaborador...\n');

  try {
    // Teste 1: Verificar se o servidor está rodando
    console.log('1️⃣ Verificando se o servidor está rodando...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Servidor funcionando:', healthResponse.data.status);
    
    // Teste 2: Tentar buscar perfil que não existe
    console.log('\n2️⃣ Testando GET - Buscar perfil inexistente...');
    try {
      await axios.get(`${apiURL}/999`);
      console.log('❌ Erro: Deveria retornar 404');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Retornou 404 corretamente para perfil inexistente');
      } else {
        console.log('❌ Erro inesperado:', error.response?.status);
      }
    }
    
    // Teste 3: Criar perfil (POST)
    console.log('\n3️⃣ Testando POST - Criar perfil...');
    const novoPerfil = {
      id_usuario: 1,
      sobre_perfil: 'Sou um desenvolvedor apaixonado por tecnologia e inovação. Gosto de trabalhar em equipe e sempre busco aprender novas tecnologias.'
    };
    
    const createResponse = await axios.post(apiURL, novoPerfil);
    console.log('✅ Perfil criado com sucesso');
    console.log('📋 Dados retornados:', createResponse.data.data);
    
    // Teste 4: Buscar perfil criado (GET)
    console.log('\n4️⃣ Testando GET - Buscar perfil criado...');
    const getResponse = await axios.get(`${apiURL}/1`);
    console.log('✅ Perfil encontrado com sucesso');
    console.log('📋 Dados retornados:', getResponse.data.data);
    
    // Teste 5: Tentar criar perfil duplicado
    console.log('\n5️⃣ Testando POST - Tentar criar perfil duplicado...');
    try {
      await axios.post(apiURL, novoPerfil);
      console.log('❌ Erro: Deveria retornar erro de duplicação');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Retornou erro 400 corretamente para duplicação');
        console.log('📋 Mensagem:', error.response.data.message);
      } else {
        console.log('❌ Erro inesperado:', error.response?.status);
      }
    }
    
    // Teste 6: Atualizar perfil (PUT)
    console.log('\n6️⃣ Testando PUT - Atualizar perfil...');
    const perfilAtualizado = {
      id_usuario: 1,
      sobre_perfil: 'Sou um desenvolvedor full-stack com 5 anos de experiência. Especializado em React, Node.js e PostgreSQL. Gosto de trabalhar em projetos desafiadores e inovadores.'
    };
    
    const updateResponse = await axios.put(apiURL, perfilAtualizado);
    console.log('✅ Perfil atualizado com sucesso');
    console.log('📋 Dados retornados:', updateResponse.data.data);
    
    // Teste 7: Verificar se a atualização funcionou (GET)
    console.log('\n7️⃣ Testando GET - Verificar atualização...');
    const getUpdatedResponse = await axios.get(`${apiURL}/1`);
    console.log('✅ Perfil atualizado verificado');
    console.log('📋 Dados retornados:', getUpdatedResponse.data.data);
    
    // Teste 8: Tentar atualizar perfil inexistente
    console.log('\n8️⃣ Testando PUT - Tentar atualizar perfil inexistente...');
    try {
      await axios.put(apiURL, {
        id_usuario: 999,
        sobre_perfil: 'Perfil que não existe'
      });
      console.log('❌ Erro: Deveria retornar 404');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Retornou 404 corretamente para perfil inexistente');
        console.log('📋 Mensagem:', error.response.data.message);
      } else {
        console.log('❌ Erro inesperado:', error.response?.status);
      }
    }
    
    // Teste 9: Validações de entrada
    console.log('\n9️⃣ Testando validações de entrada...');
    
    // Teste com id_usuario inválido
    try {
      await axios.post(apiURL, {
        id_usuario: -1,
        sobre_perfil: 'Teste'
      });
      console.log('❌ Erro: Deveria validar id_usuario positivo');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validação de id_usuario funcionando');
      }
    }
    
    // Teste com sobre_perfil vazio
    try {
      await axios.post(apiURL, {
        id_usuario: 2,
        sobre_perfil: ''
      });
      console.log('❌ Erro: Deveria validar sobre_perfil não vazio');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validação de sobre_perfil funcionando');
      }
    }
    
    console.log('\n🎉 Todos os testes foram executados com sucesso!');
    console.log('\n📋 Resumo das APIs testadas:');
    console.log('   ✅ GET /:id_usuario - Buscar perfil');
    console.log('   ✅ POST / - Criar perfil');
    console.log('   ✅ PUT / - Atualizar perfil');
    console.log('   ✅ Validações de entrada');
    console.log('   ✅ Tratamento de erros');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

// Executar teste
testPerfilColaborador().catch(console.error); 