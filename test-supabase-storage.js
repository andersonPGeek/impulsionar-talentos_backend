const { supabase } = require('./src/config/supabase-storage');

async function testSupabaseStorage() {
  console.log('🧪 Testando conexão com Supabase Storage...');
  
  try {
    // Testar listagem de buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError);
      return;
    }
    
    console.log('✅ Buckets encontrados:', buckets.map(b => b.name));
    
    // Verificar se o bucket 'portifolio' existe
    const portifolioBucket = buckets.find(b => b.name === 'portifolio');
    
    if (!portifolioBucket) {
      console.log('⚠️  Bucket "portifolio" não encontrado. Buckets disponíveis:', buckets.map(b => b.name));
      return;
    }
    
    console.log('✅ Bucket "portifolio" encontrado!');
    
    // Testar listagem de arquivos no bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('portifolio')
      .list('', { limit: 10 });
    
    if (filesError) {
      console.error('❌ Erro ao listar arquivos:', filesError);
      return;
    }
    
    console.log('✅ Arquivos no bucket:', files.length);
    
    // Testar upload de um arquivo simples
    const testContent = 'Teste de upload';
    const testFileName = `teste_${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portifolio')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Erro no upload de teste:', uploadError);
      return;
    }
    
    console.log('✅ Upload de teste realizado com sucesso:', uploadData);
    
    // Limpar arquivo de teste
    const { error: deleteError } = await supabase.storage
      .from('portifolio')
      .remove([testFileName]);
    
    if (deleteError) {
      console.warn('⚠️  Erro ao deletar arquivo de teste:', deleteError);
    } else {
      console.log('✅ Arquivo de teste removido');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testSupabaseStorage();




