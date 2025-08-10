const express = require('express');
const cors = require('cors');
const { testConnection } = require('./utils/database');
const Logger = require('./utils/logger');
require('dotenv').config();

// Importar rotas
const apiRoutes = require('./routes/index');

const app = express();

// Middlewares
app.use(cors());
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
      const PORT = process.env.PORT || 3002;
      app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🔗 API base: http://localhost:${PORT}/api`);
        console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
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