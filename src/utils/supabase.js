const { Pool } = require('pg');

// Configuração do pool de conexões para Supabase
const getPoolConfig = () => {
  // Configuração para produção (Render)
  if (process.env.NODE_ENV === 'production') {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000
    };
  }
  
  // Configuração para desenvolvimento local
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql://')) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    };
  }
  
  // Fallback para configuração manual
  return {
    host: 'db.fdopxrrcvbzhwszsluwm.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'EWCWeoCTBbhWOK3T',
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  };
};

const pool = new Pool(getPoolConfig());

// Função para executar queries
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const start = Date.now();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  } finally {
    client.release();
  }
};

// Função para verificar a conexão
const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('✅ Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error);
    return false;
  } finally {
    client.release();
  }
};

// Evento para quando o pool estabelece uma nova conexão
pool.on('connect', () => {
  console.log('🔗 Nova conexão estabelecida com o Supabase');
});

// Evento para quando ocorre um erro no pool
pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões:', err);
});

module.exports = {
  query,
  testConnection,
  pool
}; 