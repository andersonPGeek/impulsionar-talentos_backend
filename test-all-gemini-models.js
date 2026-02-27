/**
 * Teste completo de modelos Gemini disponíveis
 * Testa múltiplas variações de nomes de modelos
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAllGeminiModels() {
  const apiKey = 'AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q';
  
  // Lista expandida de modelos diferentes
  const modelsToTest = [
    // Versões 1.5
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    
    // Versões 2.0
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-2.0-pro-exp-02-05',
    
    // Versões antigas
    'gemini-pro',
    'gemini-pro-vision',
    
    // Com prefixo models/
    'models/gemini-1.5-flash',
    'models/gemini-pro',
    
    // Experimental
    'gemini-exp-1114',
    'gemini-exp-1121',
  ];

  console.log('🧪 TESTE COMPLETO DE MODELOS GEMINI\n');
  console.log(`Chave: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}\n`);
  console.log('========================================\n');

  const genAI = new GoogleGenerativeAI(apiKey);
  const results = { sucesso: [], falha: [] };

  for (const modelName of modelsToTest) {
    try {
      console.log(`⏳ Testando: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Teste');
      const response = result.response.text();
      
      console.log(`   ✅ SUCESSO! ${modelName} está funciona!\n`);
      results.sucesso.push(modelName);
      
    } catch (error) {
      const msg = error.message || error.toString();
      
      if (msg.includes('404') || msg.includes('not found')) {
        console.log(`   ❌ Modelo não encontrado\n`);
      } else if (msg.includes('PERMISSION_DENIED') || msg.includes('UNAUTHENTICATED')) {
        console.log(`   ❌ Erro de autenticação\n`);
      } else if (msg.includes('RESOURCE_EXHAUSTED')) {
        console.log(`   ⚠️  Quota atingida\n`);
      } else if (msg.includes('400')) {
        console.log(`   ❌ Bad Request\n`);
      } else {
        console.log(`   ❌ Erro: ${msg.substring(0, 60)}...\n`);
      }
      results.falha.push(modelName);
    }
  }

  console.log('\n========================================');
  console.log('📊 RESUMO DOS TESTES\n');
  
  if (results.sucesso.length > 0) {
    console.log('✅ MODELOS QUE FUNCIONAM:');
    results.sucesso.forEach(m => console.log(`   - ${m}`));
    console.log('\n💾 Use um destes no código:\n');
    console.log(`this.geminiModel = this.gemini.getGenerativeModel({ model: '${results.sucesso[0]}' });\n`);
  } else {
    console.log('❌ NENHUM MODELO FUNCIONOU\n');
    console.log('💡 Possíveis soluções:');
    console.log('   1. Chave de API inválida ou sem permissão');
    console.log('   2. Conta Google sem acesso a Gemini API');
    console.log('   3. Projeto sem "Generative Language API" habilitada\n');
  }
  
  console.log(`Total de modelos testados: ${modelsToTest.length}`);
  console.log(`Sucesso: ${results.sucesso.length} | Falha: ${results.falha.length}\n`);
}

testAllGeminiModels().catch(console.error);
