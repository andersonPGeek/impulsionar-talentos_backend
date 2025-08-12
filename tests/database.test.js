const { Pool } = require('pg');
require('dotenv').config();

async function testDatabase() {
  console.log('🗄️ Testando Conexão com Banco de Dados...\n');

  try {
    // Teste 1: Criar pool de conexão
    console.log('1️⃣ Criando pool de conexão...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    });

    // Teste 2: Conexão básica
    console.log('\n2️⃣ Testando conexão básica...');
    try {
      const client = await pool.connect();
      await client.query('SELECT 1 as test');
      client.release();
      console.log('✅ Conexão com banco estabelecida com sucesso');
    } catch (error) {
      console.log('❌ Falha na conexão com banco:', error.message);
      return;
    }

    // Teste 3: Query simples
    console.log('\n3️⃣ Testando query simples...');
    try {
      const result = await pool.query('SELECT 1 as test');
      console.log('✅ Query executada com sucesso');
      console.log('   Resultado:', result.rows[0]);
    } catch (error) {
      console.log('❌ Erro na query:', error.message);
    }

    // Teste 4: Verificar tabela usuarios
    console.log('\n4️⃣ Verificando tabela usuarios...');
    try {
      const result = await pool.query(`
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

    // Teste 5: Contar usuários
    console.log('\n5️⃣ Contando usuários na tabela...');
    try {
      const result = await pool.query('SELECT COUNT(*) as total FROM usuarios');
      console.log('✅ Contagem realizada');
      console.log(`   Total de usuários: ${result.rows[0].total}`);
    } catch (error) {
      console.log('❌ Erro ao contar usuários:', error.message);
    }

    // Fechar pool
    await pool.end();

    console.log('\n🎉 Testes de banco de dados concluídos!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar testes
testDatabase(); 