#!/usr/bin/env node
/**
 * Script inteligente para investigar chave de API Gemini
 * Sem adivinhar - consultando diretamente o Google quais modelos estão disponíveis
 * 
 * Uso: node investigar-chave-gemini.js <sua_api_key>
 */

const apiKeyArg = process.argv[2];

if (!apiKeyArg) {
  console.error('❌ Uso: node investigar-chave-gemini.js <sua_api_key>');
  console.error('\nExemplo:');
  console.error('  node investigar-chave-gemini.js AIzaSyDxxxxxYourKeyHerexxxxxx');
  process.exit(1);
}

async function investigarChave() {
  console.log('\n🔍 Investigando chave de API Gemini...\n');
  console.log(`Chave: ${apiKeyArg.substring(0, 8)}...${apiKeyArg.substring(apiKeyArg.length - 4)}`);
  console.log(`Comprimento: ${apiKeyArg.length} caracteres`);
  console.log('\n========================================\n');

  try {
    // Consultar diretamente o Google pela lista de modelos
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeyArg}`;
    
    console.log('📡 Consultando Google API...\n');
    const response = await fetch(url);
    const data = await response.json();

    // Verificar erros
    if (data.error) {
      console.error('❌ ERRO RETORNADO PELO GOOGLE:\n');
      console.error(`Status: ${data.error.code || data.error.status}`);
      console.error(`Mensagem: ${data.error.message}\n`);
      
      if (data.error.status === 'PERMISSION_DENIED' || data.error.code === 403) {
        console.log('💡 PROBLEMA: Sua chave não tem permissão para acessar Gemini API\n');
        console.log('SOLUÇÕES:');
        console.log('1️⃣  Se você usou chave do AI Studio (aistudio.google.com):');
        console.log('    - Verifique se a chave foi copiada completamente (sem espaços)');
        console.log('    - Tente gerar uma NOVA chave em: https://aistudio.google.com/app/apikey\n');
        console.log('2️⃣  Se você usou chave do Google Cloud Console:');
        console.log('    - Vá para: https://console.cloud.google.com');
        console.log('    - Selecione seu projeto');
        console.log('    - APIs & Services → Library');
        console.log('    - Procure por "Generative Language API"');
        console.log('    - Clique em "Enable"\n');
      }
      
      if (data.error.status === 'UNAUTHENTICATED' || data.error.code === 401) {
        console.log('💡 PROBLEMA: Chave de API inválida ou expirada\n');
        console.log('SOLUÇÃO: Obtenha uma nova chave em https://aistudio.google.com/app/apikey\n');
      }
      
      console.log('========================================\n');
      return;
    }

    // Se chegou aqui, a requisição foi bem-sucedida
    if (!data.models || data.models.length === 0) {
      console.log('⚠️  A chave é válida, mas nenhum modelo foi retornado.\n');
      console.log('Isso pode significar que a API ainda está sendo configurada.\n');
      console.log('========================================\n');
      return;
    }

    // Filtrar apenas modelos que suportam generateContent
    const generativeModels = data.models.filter(m => 
      m.supportedGenerationMethods && 
      m.supportedGenerationMethods.includes('generateContent')
    );

    if (generativeModels.length === 0) {
      console.log('⚠️  Não foram encontrados modelos que suportam generateContent.\n');
      console.log('Modelos disponíveis (outros tipos):');
      data.models.forEach(m => {
        console.log(`  - ${m.name} (Métodos: ${m.supportedGenerationMethods?.join(', ') || 'nenhum'})`);
      });
      console.log('\n========================================\n');
      return;
    }

    // SUCESSO! Listar modelos disponíveis
    console.log('✅ SUCESSO! SUA CHAVE TEM ACESSO AOS SEGUINTES MODELOS:\n');
    
    generativeModels.forEach((model, index) => {
      const modelName = model.name.replace('models/', '');
      const version = model.version || 'latest';
      const displayName = model.displayName || modelName;
      
      console.log(`${index + 1}️⃣  ${modelName}`);
      console.log(`   Display: ${displayName}`);
      if (model.description) {
        console.log(`   Descrição: ${model.description.substring(0, 100)}...`);
      }
      console.log(`   Version: ${version}`);
      console.log(`   Input tokens: ${model.inputTokenLimit || 'unlimited'}`);
      console.log(`   Output tokens: ${model.outputTokenLimit || 'unlimited'}`);
      console.log('');
    });

    // RECOMENDAÇÃO
    console.log('========================================\n');
    console.log('💾 QUAL MODELO USAR?\n');
    
    const flashModels = generativeModels.filter(m => m.name.includes('flash'));
    const proModels = generativeModels.filter(m => m.name.includes('pro') && !m.name.includes('flash'));
    
    if (flashModels.length > 0) {
      const recommended = flashModels[0].name.replace('models/', '');
      console.log(`✨ RECOMENDADO (mais rápido e barato):`);
      console.log(`   ${recommended}\n`);
      console.log(`📝 Use no código:\n`);
      console.log(`this.geminiModel = this.gemini.getGenerativeModel({ model: '${recommended}' });\n`);
    }
    
    if (proModels.length > 0) {
      const proBest = proModels[0].name.replace('models/', '');
      console.log(`🚀 ALTERNATIVA (mais poderoso):`);
      console.log(`   ${proBest}\n`);
    }
    
    console.log('========================================\n');

  } catch (err) {
    if (err.message.includes('fetch')) {
      console.error('❌ ERRO DE CONEXÃO:\n');
      console.error(`Não consegui conectar ao Google: ${err.message}\n`);
      console.error('Verifique sua conexão com a internet.\n');
    } else {
      console.error('❌ ERRO INESPERADO:\n');
      console.error(err.message);
      console.error(err.stack);
    }
    console.log('========================================\n');
  }
}

investigarChave();
