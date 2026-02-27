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
      
      // Defaults para quando CORS_ORIGIN não está definido
      const defaultOrigins = [
        'http://localhost:8080',
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:5173'
      ];
      
      // Usar CORS_ORIGIN se definido, senão usar defaults
      let allowedOrigins = defaultOrigins;
      
      if (process.env.CORS_ORIGIN) {
        // Dividir by commas e remover espaços
        const configuredOrigins = process.env.CORS_ORIGIN
          .split(',')
          .map(o => o.trim())
          .filter(o => o.length > 0);
        
        // Se houver origins configuradas, usar elas (não adicionar aos defaults)
        if (configuredOrigins.length > 0) {
          allowedOrigins = configuredOrigins;
          
          // Em produção, adicionar localhost para desenvolvimento/debug
          if (process.env.NODE_ENV === 'production' && !configuredOrigins.some(o => o.includes('localhost'))) {
            // Não adicionar localhost automaticamente - ser explícito sobre segurança
            allowedOrigins = configuredOrigins;
          }
        }
      }
      
      // Em desenvolvimento, permitir automaticamente todos os localhost
      if (process.env.NODE_ENV === 'development') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
      }
      
      // Verificar se a origin está na lista de permitidas
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      
      // Log detalhado para debugging
      const env = process.env.NODE_ENV || 'unknown';
      const configuredValue = process.env.CORS_ORIGIN ? `"${process.env.CORS_ORIGIN}"` : 'não definido (usando defaults)';
      console.warn(
        `⚠️ CORS bloqueado\n` +
        `   Origin: ${origin}\n` +
        `   Ambiente: ${env}\n` +
        `   CORS_ORIGIN: ${configuredValue}\n` +
        `   Permitidos: ${allowedOrigins.join(', ')}`
      );
      
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