/**
 * Script de diagnóstico para listar modelos Gemini disponíveis
 * Ajuda a identificar o nome correto do modelo a usar
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
  try {
    const genAI = new GoogleGenerativeAI('AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q');
    
    console.log('🔍 Listando modelos disponíveis...\n');
    
    const models = await genAI.listModels();
    
    console.log('✅ Modelos disponíveis:\n');
    models.models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Input token limit: ${model.inputTokenLimit}`);
      console.log(`   Output token limit: ${model.outputTokenLimit}`);
      console.log(`   Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });

    // Procurar especificamente por modelos Gemini 1.5
    console.log('\n📌 Models com "1.5" no nome:');
    const gemini15Models = models.models.filter(m => m.name.includes('1.5'));
    if (gemini15Models.length > 0) {
      gemini15Models.forEach(model => {
        console.log(`  - ${model.name}`);
      });
    } else {
      console.log('  Nenhum modelo 1.5 encontrado');
    }

    // Sugerir o modelo mais recente disponível
    console.log('\n💡 Sugestão: Use um dos modelos listados acima no seu código.');
    
  } catch (error) {
    console.error('❌ Erro ao listar modelos:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

listAvailableModels();
