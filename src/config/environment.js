require('dotenv').config();

const config = {
  // Configurações do servidor
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configurações do banco de dados
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
    maxConnections: process.env.NODE_ENV === 'production' ? 10 : 20
  },
  
  // Configurações de segurança
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // Configurações de CORS
  cors: {
    origin: function (origin, callback) {
      // Permitir requisições sem origin (como mobile apps ou Postman)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
        : ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'];
      
      // Em desenvolvimento, permitir todos os localhost
      if (process.env.NODE_ENV === 'development') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
      }
      
      // Verificar se a origin está na lista de permitidas
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      
      console.warn(`⚠️ CORS bloqueado para origin: ${origin}`);
      return callback(new Error('Não permitido pelo CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
  },
  
  // Configurações de log
  log: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  // Configurações específicas por ambiente
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
};

// Validações de configuração
const validateConfig = () => {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Variáveis de ambiente não encontradas: ${missing.join(', ')}`);
    return false;
  }
  
  if (config.isProduction && !process.env.CORS_ORIGIN) {
    console.warn('⚠️ CORS_ORIGIN não configurado em produção. Usando "*"');
  }
  
  return true;
};

// Executar validações apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

module.exports = config; 