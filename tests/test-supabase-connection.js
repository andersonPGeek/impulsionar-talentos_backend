const { createClient } = require('@supabase/supabase-js');

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

async function testSupabaseConnection() {
  log(`${colors.bold}🧪 Testando conexão com Supabase${colors.reset}\n`);

  const supabaseUrl = 'https://fdopxrrcvbzhwszsluwm.supabase.co';
  
  // Testar diferentes chaves
  const testKeys = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb3B4cnJjdmJ6aHdzenNsdXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk0ODc0MDAsImV4cCI6MjAyNTA2MzQwMH0.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb3B4cnJjdmJ6aHdzenNsdXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk0ODc0MDAsImV4cCI6MjAyNTA2MzQwMH0.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb3B4cnJjdmJ6aHdzenNsdXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk0ODc0MDAsImV4cCI6MjAyNTA2MzQwMH0.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q'
  ];

  for (let i = 0; i < testKeys.length; i++) {
    const key = testKeys[i];
    log(`\n${i + 1}️⃣ Testando chave ${i + 1}...`);
    
    try {
      const supabase = createClient(supabaseUrl, key);
      
      // Testar listagem de buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        log(`❌ Erro: ${bucketsError.message}`, 'red');
      } else {
        log(`✅ Sucesso! Buckets encontrados: ${buckets.length}`, 'green');
        buckets.forEach(bucket => {
          log(`   - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`, 'blue');
        });
        
        // Se funcionou, usar esta chave
        log(`\n🎉 Chave ${i + 1} funcionando! Usando esta chave.`, 'green');
        return key;
      }
    } catch (error) {
      log(`❌ Erro: ${error.message}`, 'red');
    }
  }
  
  log(`\n❌ Nenhuma chave funcionou. Verifique as credenciais do Supabase.`, 'red');
  return null;
}

// Executar se chamado diretamente
if (require.main === module) {
  testSupabaseConnection().catch(error => {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testSupabaseConnection };





