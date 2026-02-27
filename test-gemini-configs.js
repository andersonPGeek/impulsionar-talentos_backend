/**
 * Teste com diferentes configurações de URL e versões de API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testWithDifferentConfigs() {
  const apiKey = 'AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q';
  
  console.log('🧪 Testando com diferentes configurações...\n');

  // Teste 1: Tentar forçar baseUrl para v1
  console.log('1️⃣  Teste com baseUrl (v1)');
  try {
    const genAI1 = new GoogleGenerativeAI({
      apiKey: apiKey,
      baseUrl: 'https://generativelanguage.googleapis.com/v1'
    });
    const model1 = genAI1.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result1 = await model1.generateContent('Teste');
    console.log('   ✅ SUCESSO com v1!\n');
  } catch (err) {
    console.log(`   ❌ ${err.message.substring(0, 100)}\n`);
  }

  // Teste 2: Tentar com gemini-pro (modelo mais antigo)
  console.log('2️⃣  Teste com gemini-pro');
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Teste');
    console.log('   ✅ SUCESSO com gemini-pro!\n');
  } catch (err) {
    console.log(`   ❌ ${err.message.substring(0, 100)}\n`);
  }

  // Teste 3: Verificar versão da biblioteca
  console.log('3️⃣  Verificar versão @google/generative-ai:');
  try {
    const packageJson = require('@google/generative-ai/package.json');
    console.log(`   Versão: ${packageJson.version}\n`);
  } catch (err) {
    console.log('   ❌ Não conseguiu ler package.json\n');
  }

  // Teste 4: Tentar REST API diretamente
  console.log('4️⃣  Teste direto com REST API (curl equivalente):');
  try {
    const axios = require('axios');
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: 'Teste' }]
        }]
      }
    );
    console.log('   ✅ SUCESSO com REST API v1!\n');
  } catch (err) {
    if (err.response?.status === 404) {
      console.log(`   ❌ Modelo não encontrado na v1\n`);
    } else {
      console.log(`   ❌ ${err.message?.substring(0, 100)}\n`);
    }
  }

  // Teste 5: Tentar com v1beta em REST
  console.log('5️⃣  Teste direto com v1beta REST API:');
  try {
    const axios = require('axios');
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: 'Teste' }]
        }]
      }
    );
    console.log('   ✅ SUCESSO com REST API v1beta!\n');
  } catch (err) {
    if (err.response?.data?.error?.message) {
      console.log(`   ❌ ${err.response.data.error.message}\n`);
    } else {
      console.log(`   ❌ ${err.message?.substring(0, 100)}\n`);
    }
  }
}

testWithDifferentConfigs().catch(console.error);
