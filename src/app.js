const express = require('express');
const cors = require('cors');
const { testConnection } = require('./utils/database');
const Logger = require('./utils/logger');
const config = require('./config/environment');

// Importar rotas
const apiRoutes = require('./routes/index');

const app = express();

// Configuração do CORS
const corsOptions = {
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(Logger.request);

// Rotas
app.use('/api', apiRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Impulsionar Talentos funcionando!',
    version: '1.0.0',
    status: 'online'
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Inicializar conexão com o banco e executar servidor
const initializeApp = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      // Testar conexão com o banco de dados
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Não foi possível conectar ao banco de dados');
      }

      // Iniciar servidor
      app.listen(config.port, () => {
        console.log(`🚀 Servidor rodando na porta ${config.port}`);
        console.log(`🌍 Ambiente: ${config.nodeEnv}`);
        console.log(`📊 Health check: http://localhost:${config.port}/health`);
        console.log(`🔗 API base: http://localhost:${config.port}/api`);
        console.log(`🔐 Auth endpoints: http://localhost:${config.port}/api/auth`);
        
        if (config.isProduction) {
          console.log(`🔒 Modo produção ativo`);
        }
      });
      
      return;
    } catch (error) {
      console.error(`❌ Tentativa ${6 - retries}/5 falhou:`, error.message);
      retries--;
      if (retries === 0) {
        console.error('❌ Todas as tentativas de conexão falharam');
        process.exit(1);
      }
      // Esperar 5 segundos antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

initializeApp();

module.exports = app; 