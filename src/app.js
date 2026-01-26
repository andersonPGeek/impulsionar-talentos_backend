const express = require('express');
const http = require('http');
const cors = require('cors');
const { testConnection } = require('./utils/supabase');
const Logger = require('./utils/logger');
const config = require('./config/environment');

// Importar rotas
const apiRoutes = require('./routes/index');

const app = express();
const server = http.createServer(app);

// Configuração do CORS
const corsOptions = {
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
  optionsSuccessStatus: config.cors.optionsSuccessStatus
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
  console.error('❌ Erro global:', err);
  console.error('❌ Stack trace:', err.stack);
  console.error('❌ Request URL:', req.url);
  console.error('❌ Request method:', req.method);
  console.error('❌ Request body:', req.body);
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
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
      console.log(`🔄 Tentativa ${6 - retries}/5 de conexão com o banco...`);
      
      // Testar conexão com o banco de dados
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Não foi possível conectar ao banco de dados');
      }

      console.log('✅ Conexão com banco estabelecida com sucesso');

      // Inicializar WebSocket server
      const { setupWebSocketServer } = require('./routes/ia.routes');
      setupWebSocketServer(server);

      // Iniciar servidor HTTP (que também suporta WebSocket)
      server.listen(config.port, () => {
        console.log(`🚀 Servidor rodando na porta ${config.port}`);
        console.log(`🌍 Ambiente: ${config.nodeEnv}`);
        console.log(`📊 Health check: http://localhost:${config.port}/health`);
        console.log(`🔗 API base: http://localhost:${config.port}/api`);
        console.log(`🔐 Auth endpoints: http://localhost:${config.port}/api/auth`);
        console.log(`🔊 WebSocket endpoints: ws://localhost:${config.port}/ws/ia/voz/*`);
        
        if (config.isProduction) {
          console.log(`🔒 Modo produção ativo`);
          console.log(`🌐 URL pública: https://impulsionar-talentos-api.onrender.com`);
        }
      });
      
      return;
    } catch (error) {
      console.error(`❌ Tentativa ${6 - retries}/5 falhou:`, error.message);
      console.error(`Código do erro: ${error.code || 'N/A'}`);
      
      retries--;
      if (retries === 0) {
        console.error('❌ Todas as tentativas de conexão falharam');
        console.error('💡 Verifique:');
        console.error('   - DATABASE_URL está correta');
        console.error('   - Supabase está acessível');
        console.error('   - Configurações SSL estão corretas');
        process.exit(1);
      }
      
      const delay = config.isProduction ? 10000 : 5000; // 10s para produção, 5s para dev
      console.log(`⏳ Aguardando ${delay/1000}s antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

initializeApp();

// Exportar app e server
module.exports = { app, server };
// Manter compatibilidade: exportar app como default também
module.exports.default = app; 