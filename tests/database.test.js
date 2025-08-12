const { testConnection, query } = require('../src/utils/supabase');
require('dotenv').config();

async function testDatabase() {
  console.log('🗄️ Testando Conexão com Supabase...\n');

  try {
    // Teste 1: Testar conexão
    console.log('1️⃣ Testando conexão com Supabase...');
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Falha na conexão com Supabase');
      return;
    }

    // Teste 2: Query simples
    console.log('\n2️⃣ Testando query simples...');
    try {
      const result = await query('SELECT 1 as test');
      console.log('✅ Query executada com sucesso');
      console.log('   Resultado:', result.rows[0]);
    } catch (error) {
      console.log('❌ Erro na query:', error.message);
    }

    // Teste 3: Verificar tabela usuarios
    console.log('\n3️⃣ Verificando tabela usuarios...');
    try {
      const result = await query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        ORDER BY ordinal_position
      `);
      
      console.log('✅ Tabela usuarios encontrada');
      console.log('   Colunas:');
      result.rows.forEach(row => {
        console.log(`     - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    } catch (error) {
      console.log('❌ Erro ao verificar tabela:', error.message);
    }

    // Teste 4: Contar usuários
    console.log('\n4️⃣ Contando usuários na tabela...');
    try {
      const result = await query('SELECT COUNT(*) as total FROM usuarios');
      console.log('✅ Contagem realizada');
      console.log(`   Total de usuários: ${result.rows[0].total}`);
    } catch (error) {
      console.log('❌ Erro ao contar usuários:', error.message);
    }

    console.log('\n🎉 Testes de banco de dados concluídos!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar testes
testDatabase(); 