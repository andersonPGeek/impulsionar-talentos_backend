/**
 * Script para testar diferentes nomes de modelo Gemini
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-2.0-flash-exp'
  ];

  console.log('🧪 Testando diferentes nomes de modelos Gemini...\n');

  const genAI = new GoogleGenerativeAI('AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q');

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testando: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Tentar uma requisição simples para validar se funciona
      const testResult = await model.generateContent('Teste rápido');
      console.log(`✅ SUCESSO: ${modelName} está disponível!\n`);
      
    } catch (error) {
      const errorMsg = error.message || error.toString();
      if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        console.log(`❌ ${modelName}: Modelo não encontrado\n`);
      } else if (errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('API key')) {
        console.log(`⚠️  ${modelName}: Erro de autenticação com API key\n`);
      } else if (errorMsg.includes('RESOURCE_EXHAUSTED')) {
        console.log(`⚠️  ${modelName}: Limite de quota atingido\n`);
      } else {
        console.log(`❌ ${modelName}: Erro - ${errorMsg.substring(0, 100)}\n`);
      }
    }
  }

  console.log('✅ Testes completos!');
}

testModels().catch(console.error);
