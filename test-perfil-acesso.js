const axios = require('axios');

async function testPerfilAcesso() {
  const baseURL = 'http://localhost:3002';
  
  console.log('🧪 Testando inclusão do campo perfil_acesso no login...\n');

  try {
    // Teste 1: Verificar se o servidor está rodando
    console.log('1️⃣ Verificando se o servidor está rodando...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Servidor funcionando:', healthResponse.data.status);
    
    // Teste 2: Fazer login e verificar se perfil_acesso está no retorno
    console.log('\n2️⃣ Testando login com verificação do perfil_acesso...');
    
    const loginData = {
      email: 'teste.registro@exemplo.com',
      senha: 'MinhaSenha123'
    };
    
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, loginData);
    
    console.log('✅ Login realizado com sucesso');
    console.log('📋 Dados do usuário retornados:');
    
    const userData = loginResponse.data.data.user;
    console.log('   - ID:', userData.id);
    console.log('   - Email:', userData.email);
    console.log('   - Data Nascimento:', userData.data_nascimento);
    console.log('   - ID Gestor:', userData.id_gestor);
    console.log('   - ID Departamento:', userData.id_departamento);
    console.log('   - Perfil Acesso:', userData.perfil_acesso);
    
    // Verificar se perfil_acesso está presente
    if (userData.perfil_acesso !== undefined) {
      console.log('\n🎉 Campo perfil_acesso está sendo retornado corretamente!');
    } else {
      console.log('\n⚠️ Campo perfil_acesso não está sendo retornado');
    }
    
    // Teste 3: Validar token e verificar se perfil_acesso está no retorno
    console.log('\n3️⃣ Testando validação de token...');
    
    const token = loginResponse.data.data.token;
    const validateResponse = await axios.get(`${baseURL}/api/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Token validado com sucesso');
    console.log('📋 Dados do usuário no token:');
    
    const tokenUserData = validateResponse.data.data.user;
    console.log('   - ID:', tokenUserData.id);
    console.log('   - Email:', tokenUserData.email);
    console.log('   - Data Nascimento:', tokenUserData.data_nascimento);
    console.log('   - ID Gestor:', tokenUserData.id_gestor);
    console.log('   - ID Departamento:', tokenUserData.id_departamento);
    console.log('   - Perfil Acesso:', tokenUserData.perfil_acesso);
    
    if (tokenUserData.perfil_acesso !== undefined) {
      console.log('\n🎉 Campo perfil_acesso está sendo retornado na validação do token!');
    } else {
      console.log('\n⚠️ Campo perfil_acesso não está sendo retornado na validação do token');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

// Executar teste
testPerfilAcesso().catch(console.error); 