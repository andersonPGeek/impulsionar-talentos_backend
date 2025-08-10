const { testConnection, query } = require('../src/utils/database');

async function testDatabase() {
  console.log('🗄️ Testando Conexão com Banco de Dados...\n');

  try {
    // Teste 1: Conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Conexão com banco estabelecida com sucesso');
    } else {
      console.log('❌ Falha na conexão com banco');
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

    // Teste 5: Verificar estrutura da tabela
    console.log('\n5️⃣ Verificando estrutura da tabela...');
    try {
      const result = await query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        ORDER BY ordinal_position
      `);
      
      const expectedColumns = [
        { name: 'id', type: 'bigint' },
        { name: 'data_nascimento', type: 'timestamp with time zone' },
        { name: 'email', type: 'text' },
        { name: 'senha', type: 'text' },
        { name: 'id_gestor', type: 'bigint' },
        { name: 'id_departamento', type: 'bigint' }
      ];

      console.log('✅ Estrutura da tabela verificada');
      
      const foundColumns = result.rows.map(row => ({
        name: row.column_name,
        type: row.data_type
      }));

      expectedColumns.forEach(expected => {
        const found = foundColumns.find(col => col.name === expected.name);
        if (found) {
          console.log(`   ✅ ${expected.name} (${found.type})`);
        } else {
          console.log(`   ❌ ${expected.name} - NÃO ENCONTRADO`);
        }
      });

    } catch (error) {
      console.log('❌ Erro ao verificar estrutura:', error.message);
    }

    console.log('\n🎉 Testes de banco de dados concluídos!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar testes
testDatabase(); 