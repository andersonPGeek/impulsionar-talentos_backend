const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth.routes');
const perfilColaboradorRoutes = require('./perfil_colaborador.routes');
const sabotadoresRoutes = require('./sabotadores.routes');
const personalidadeRoutes = require('./personalidade.routes');
// const usuariosRoutes = require('./usuarios.routes');
// const talentosRoutes = require('./talentos.routes');

// Rota de teste da API
router.get('/test', (req, res) => {
  res.json({
    message: 'API Impulsionar Talentos - Rotas funcionando!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      perfilColaborador: '/api/perfil-colaborador',
      sabotadores: '/api/sabotadores',
      personalidade: '/api/personalidade',
      usuarios: '/api/usuarios',
      talentos: '/api/talentos'
    }
  });
});

// Configurar rotas
router.use('/auth', authRoutes);
router.use('/perfil-colaborador', perfilColaboradorRoutes);
router.use('/sabotadores', sabotadoresRoutes);
router.use('/personalidade', personalidadeRoutes);
// router.use('/usuarios', usuariosRoutes);
// router.use('/talentos', talentosRoutes);

module.exports = router; 