const axios = require('axios');

async function testRegister() {
  try {
    console.log('🧪 Testando API de registro...');
    
    const testData = {
      email: 'teste@exemplo.com',
      senha: '123456',
      nome: 'Usuário Teste',
      data_nascimento: '1990-01-01',
      cargo: 'Desenvolvedor',
      idade: 30,
      id_gestor: null,
      id_departamento: null,
      id_cliente: null,
      perfil_acesso: null
    };

    console.log('📝 Dados de teste:', testData);

    const response = await axios.post('http://localhost:3002/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registro bem-sucedido!');
    console.log('📊 Status:', response.status);
    console.log('📄 Resposta:', response.data);

  } catch (error) {
    console.error('❌ Erro no teste de registro:');
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

testRegister(); 