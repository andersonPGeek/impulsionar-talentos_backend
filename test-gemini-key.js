#!/usr/bin/env node
/**
 * Script para testar chave de API do Gemini
 * Uso: node test-gemini-key.js YOUR_API_KEY
 */

const apiKeyArg = process.argv[2];

if (!apiKeyArg) {
  console.error('❌ Uso: node test-gemini-key.js <sua_api_key>');
  console.error('\nExemplo:');
  console.error('  node test-gemini-key.js AIzaSyDxxxxxYourKeyHerexxxxxx');
  process.exit(1);
}

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiKey() {
  console.log('🧪 Testando chave de API do Gemini...\n');
  console.log(`Chave: ${apiKeyArg.substring(0, 8)}...${apiKeyArg.substring(apiKeyArg.length - 4)}`);
  console.log(`Comprimento: ${apiKeyArg.length} (esperado: 39)\n`);

  const genAI = new GoogleGenerativeAI(apiKeyArg);

  const modelsToTest = ['gemini-1.5-flash', 'gemini-2.0-flash-exp', 'gemini-pro', 'gemini-1.5-pro'];
  let found = false;

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testando modelo: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Teste simples');
      const response = result.response.text();
      
      console.log(`✅ SUCESSO! Modelo "${modelName}" está funcionando!\n`);
      console.log(`💾 Guarde este nome de modelo: "${modelName}"`);
      console.log(`\n📝 Use no código:\n`);
      console.log(`this.geminiModel = this.gemini.getGenerativeModel({ model: '${modelName}' });\n`);
      found = true;
      break;
      
    } catch (error) {
      if (error.message?.includes('404')) {
        console.log(`❌ Modelo não disponível\n`);
      } else if (error.message?.includes('PERMISSION_DENIED') || error.message?.includes('UNAUTHENTICATED')) {
        console.log(`❌ Chave de API inválida ou sem permissão\n`);
        console.log(`Erro: ${error.message}\n`);
        break;
      } else {
        console.log(`❌ Erro: ${error.message?.substring(0, 80)}...\n`);
      }
    }
  }

  if (!found) {
    console.log('\n⚠️ RESUMO:');
    console.log('   - Nenhum modelo foi encontrado com essa chave');
    console.log('   - A chave pode ser inválida ou estar com permissões limitadas');
    console.log('\n💡 SUGESTÕES:');
    console.log('   1. Verifique se a chave foi copiada completamente (sem espaços)');
    console.log('   2. Tente obter uma nova chave em: https://aistudio.google.com/app/apikey');
    console.log('   3. Se usar um projeto Google Cloud, habilite a "Generative Language API"');
  }
}

testGeminiKey().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
