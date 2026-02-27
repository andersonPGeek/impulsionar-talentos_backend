/**
 * Script de diagnóstico completo do Gemini
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function diagnosticComplete() {
  console.log('🔍 DIAGNÓSTICO COMPLETO GEMINI\n');
  console.log('========================================\n');

  const apiKey = 'AIzaSyBxueQda9d5aMOUNHJ2fSqtTi3k8kHbZ6Q';
  
  console.log(`1. Verificando chave de API:`);
  console.log(`   Tipo: ${typeof apiKey}`);
  console.log(`   Comprimento: ${apiKey.length} caracteres`);
  console.log(`   Primeiro 8 caracteres: ${apiKey.substring(0, 8)}...`);
  console.log(`   Último 8 caracteres: ...${apiKey.substring(apiKey.length - 8)}`);
  console.log('');

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log(`2. Instância GoogleGenerativeAI criada ✓`);
  console.log('');

  // Tentar obter schema do modelo (se disponível)
  console.log(`3. Tentando acessar um modelo com getGenerativeModel():\n`);
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 100
      }
    });
    console.log(`   ✓ Instância do modelo criada (teste simplificado)`);
    
    // Tentar fazer uma chamada vazia
    console.log(`\n4. Testando chamada mínima para gemini-1.5-flash:`);
    try {
      const result = await model.generateContent('Olá');
      console.log(`   ✅ SUCESSO! Modelo funcionando!`);
      console.log(`   Resposta: ${result.response.text()?.substring(0, 100)}...`);
    } catch (callError) {
      console.log(`   ❌ Erro na chamada:`);
      console.log(`      Status: ${callError.status}`);
      console.log(`      Message: ${callError.message}`);
      
      // Análise do erro
      if (callError.message.includes('404') || callError.message.includes('not found')) {
        console.log(`\n   📌 ANÁLISE: Modelo "gemini-1.5-flash" não está disponível.`);
        console.log(`      Possíveis motivos:`);
        console.log(`      - Modelo descontinuado ou mudou de nome`);
        console.log(`      - Chave de API sem acesso a esse modelo`);
        console.log(`      - Região geográfica pode ter limitações`);
      } else if (callError.message.includes('PERMISSION_DENIED')) {
        console.log(`\n   📌 ANÁLISE: Erro de permissão - chave de API inválida ou sem acesso.`);
      } else if (callError.message.includes('UNAUTHENTICATED')) {
        console.log(`\n   📌 ANÁLISE: Problema de autenticação com a chave de API.`);
      }
    }

    // Verificar e tentar variações
    console.log(`\n5. Testando variação com "-latest":`);
    try {
      const modelLatest = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      const resultLatest = await modelLatest.generateContent('Teste');
      console.log(`   ✅ gemini-1.5-flash-latest FUNCIONA!`);
    } catch (err) {
      console.log(`   ❌ gemini-1.5-flash-latest: ${err.message.substring(0, 60)}...`);
    }

  } catch (error) {
    console.log(`   ❌ Erro ao criar modelo: ${error.message}`);
  }

  console.log('\n========================================');
  console.log(`\n📋 RESUMO:`);
  console.log(`- GoogleGenerativeAI SDK versão: Verifique using require('@google/generative-ai/package.json')`);
  console.log(`- Chave de API: ${apiKey.length === 39 ? '✓ Tamanho correto (39 caracteres)' : '❌ Tamanho incorreto'}`);
  console.log(`- Recomendação: Garanta que a chave de API tenha acesso a modelos Gemini`);
  console.log(`\n`);
}

diagnosticComplete().catch(console.error);
