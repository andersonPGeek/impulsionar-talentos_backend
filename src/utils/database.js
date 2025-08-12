const { Pool } = require('pg');

// Forçar uso de IPv4 em produção para evitar problemas de conectividade
if (process.env.NODE_ENV === 'production') {
  // Configurar Node.js para preferir IPv4
  process.env.UV_THREADPOOL_SIZE = '4';
  
  // Forçar resolução DNS para IPv4
  const dns = require('dns');
  dns.setDefaultResultOrder('ipv4first');
}

// Configuração do pool de conexões
const getPoolConfig = () => {
  // Configuração para produção (Render)
  if (process.env.NODE_ENV === 'production') {
    console.log('🔧 Configurando banco para PRODUÇÃO');
    
    // Usar configuração manual para evitar problemas de IPv6
    return {
      host: 'db.fdopxrrcvbzhwszsluwm.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'EWCWeoCTBbhWOK3T',
      ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000
    };
  }
  
  // Configuração para desenvolvimento local
  console.log('🔧 Configurando banco para DESENVOLVIMENTO');
  
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
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    return false;
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