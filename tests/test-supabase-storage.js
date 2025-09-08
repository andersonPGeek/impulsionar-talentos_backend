const { supabase } = require('../src/config/supabase-storage');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Função para log colorido
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSupabaseStorage() {
  log(`${colors.bold}🧪 Testando conexão com Supabase Storage${colors.reset}\n`);

  try {
    // Teste 1: Verificar se o cliente está funcionando
    log('1️⃣ Testando cliente Supabase...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError && authError.message !== 'Invalid JWT') {
      log(`❌ Erro de autenticação: ${authError.message}`, 'red');
    } else {
      log('✅ Cliente Supabase configurado corretamente', 'green');
    }

    // Teste 2: Listar buckets existentes
    log('\n2️⃣ Listando buckets existentes...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      log(`❌ Erro ao listar buckets: ${bucketsError.message}`, 'red');
    } else {
      log(`✅ Buckets encontrados: ${buckets.length}`, 'green');
      buckets.forEach(bucket => {
        log(`   - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`, 'blue');
      });
    }

    // Teste 3: Verificar se o bucket 'portifolio' existe
    log('\n3️⃣ Verificando bucket "portifolio"...');
    const portfolioBucket = buckets?.find(bucket => bucket.name === 'portifolio');
    
    if (portfolioBucket) {
      log('✅ Bucket "portifolio" encontrado', 'green');
      log(`   - Público: ${portfolioBucket.public}`, 'blue');
      log(`   - Criado em: ${portfolioBucket.created_at}`, 'blue');
    } else {
      log('⚠️ Bucket "portifolio" não encontrado', 'yellow');
      
      // Teste 4: Tentar criar o bucket
      log('\n4️⃣ Tentando criar bucket "portifolio"...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('portifolio', {
        public: true,
        allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        log(`❌ Erro ao criar bucket: ${createError.message}`, 'red');
      } else {
        log('✅ Bucket "portifolio" criado com sucesso', 'green');
      }
    }

    // Teste 5: Testar upload de arquivo (se o bucket existir)
    if (portfolioBucket || newBucket) {
      log('\n5️⃣ Testando upload de arquivo...');
      
      const testFile = new Blob(['Teste de upload'], { type: 'text/plain' });
      const fileName = `teste_${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portifolio')
        .upload(fileName, testFile);
      
      if (uploadError) {
        log(`❌ Erro no upload: ${uploadError.message}`, 'red');
      } else {
        log('✅ Upload de teste realizado com sucesso', 'green');
        log(`   - Arquivo: ${uploadData.path}`, 'blue');
        
        // Teste 6: Obter URL pública
        log('\n6️⃣ Testando URL pública...');
        const { data: urlData } = supabase.storage
          .from('portifolio')
          .getPublicUrl(fileName);
        
        log(`✅ URL pública: ${urlData.publicUrl}`, 'green');
        
        // Teste 7: Remover arquivo de teste
        log('\n7️⃣ Removendo arquivo de teste...');
        const { error: deleteError } = await supabase.storage
          .from('portifolio')
          .remove([fileName]);
        
        if (deleteError) {
          log(`⚠️ Erro ao remover arquivo de teste: ${deleteError.message}`, 'yellow');
        } else {
          log('✅ Arquivo de teste removido', 'green');
        }
      }
    }

    log(`\n${colors.bold}🎉 Teste do Supabase Storage concluído!${colors.reset}`);

  } catch (error) {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    log(`Stack: ${error.stack}`, 'red');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testSupabaseStorage().catch(error => {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testSupabaseStorage };





