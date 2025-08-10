const { 
  testValidation, 
  testAuthentication, 
  testLogin, 
  makeRequest 
} = require('./utils/test-helper');

async function testAuthAPI() {
  console.log('🧪 Testando API de Autenticação...\n');

  try {
    // Teste 1: Validação de dados de entrada
    console.log('1️⃣ Testando validações de entrada...');
    
    // Teste de senha muito curta
    await testValidation('/auth/login', {
      email: 'teste@exemplo.com',
      senha: '123'
    });

    // Teste de email inválido
    await testValidation('/auth/login', {
      email: 'email-invalido',
      senha: 'Senha123'
    });

    // Teste 2: Login com usuário inexistente
    console.log('\n2️⃣ Testando login com usuário inexistente...');
    await testLogin('usuario@inexistente.com', 'Senha123', false);

    // Teste 3: Proteção de rotas autenticadas
    console.log('\n3️⃣ Testando proteção de rotas...');
    
    // Teste sem token
    await testAuthentication('/auth/validate');
    
    // Teste com token inválido
    await testAuthentication('/auth/validate', 'token-invalido');

    // Teste 4: Validação de alteração de senha
    console.log('\n4️⃣ Testando validação de alteração de senha...');
    
    // Teste sem autenticação
    await testValidation('/auth/change-password', {
      senhaAtual: '123',
      novaSenha: 'NovaSenha123'
    }, 401);

    console.log('\n🎉 Todos os testes de validação e proteção passaram!');
    console.log('\n📝 Para testar com usuário real:');
    console.log('   1. Tenha um usuário na tabela usuarios');
    console.log('   2. Execute: node tests/auth.test.js --real-user');
    console.log('   3. Configure as credenciais no arquivo de teste');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Verificar se deve testar com usuário real
if (process.argv.includes('--real-user')) {
  console.log('🔐 Testando com usuário real...\n');
  
  // Aqui você pode configurar um usuário real para teste
  const realUserTest = async () => {
    try {
      // Substitua pelos dados de um usuário real
      const email = 'usuario@real.com';
      const senha = 'SenhaReal123';
      
      console.log('1️⃣ Testando login com usuário real...');
      const token = await testLogin(email, senha, true);
      
      if (token) {
        console.log('\n2️⃣ Testando validação de token...');
        await testAuthentication('/auth/validate', token);
        
        console.log('\n3️⃣ Testando alteração de senha...');
        const changeResult = await makeRequest('POST', '/auth/change-password', {
          senhaAtual: senha,
          novaSenha: 'NovaSenha456'
        }, { 'Authorization': `Bearer ${token}` });
        
        if (changeResult.success) {
          console.log('✅ Alteração de senha funcionando');
        } else {
          console.log('❌ Erro na alteração de senha:', changeResult.data.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro no teste com usuário real:', error.message);
    }
  };
  
  realUserTest();
} else {
  testAuthAPI();
} 