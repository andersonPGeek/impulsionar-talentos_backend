const { Pool } = require('pg');

// Configuração do pool de conexões
const pool = new Pool({
  host: 'db.fdopxrrcvbzhwszsluwm.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'EWCWeoCTBbhWOK3T',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

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
    console.log('✅ Conexão com banco de dados estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    return false;
  } finally {
    client.release();
  }
};

// Função para executar queries com retry
const queryWithRetry = async (text, params, retries = 5, interval = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Tentativa ${i + 1} falhou. Tentando novamente em ${interval/1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
};

// Evento para quando o pool estabelece uma nova conexão
pool.on('connect', () => {
  console.log('🔗 Nova conexão estabelecida com o banco de dados');
});

// Evento para quando ocorre um erro no pool
pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões:', err);
});

module.exports = {
  query,
  testConnection,
  queryWithRetry,
  pool
}; 