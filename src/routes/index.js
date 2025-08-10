const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth.routes');
// const usuariosRoutes = require('./usuarios.routes');
// const talentosRoutes = require('./talentos.routes');

// Rota de teste da API
router.get('/test', (req, res) => {
  res.json({
    message: 'API Impulsionar Talentos - Rotas funcionando!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      talentos: '/api/talentos'
    }
  });
});

// Configurar rotas
router.use('/auth', authRoutes);
// router.use('/usuarios', usuariosRoutes);
// router.use('/talentos', talentosRoutes);

module.exports = router; 