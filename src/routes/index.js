const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth.routes');
const perfilColaboradorRoutes = require('./perfil_colaborador.routes');
const sabotadoresRoutes = require('./sabotadores.routes');
const personalidadeRoutes = require('./personalidade.routes');
const arvoreDaVidaRoutes = require('./arvore_da_vida.routes');
const analiseSwotRoutes = require('./analise_swot.routes');
const portifolioRoutes = require('./portifolio.routes');
const metasRoutes = require('./metas.routes');
const usuariosRoutes = require('./usuarios.routes');
const dashboardRoutes = require('./dashboard.routes');
const departamentoRoutes = require('./departamento.routes');
const cargoRoutes = require('./cargo.routes');
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
      arvoreDaVida: '/api/arvore-da-vida',
      analiseSwot: '/api/analise-swot',
      portifolio: '/api/portifolio',
      metas: '/api/metas',
      usuarios: '/api/usuarios',
      dashboard: '/api/dashboard',
      departamentos: '/api/departamentos',
      cargos: '/api/cargos',
      talentos: '/api/talentos'
    }
  });
});

// Configurar rotas
router.use('/auth', authRoutes);
router.use('/perfil-colaborador', perfilColaboradorRoutes);
router.use('/sabotadores', sabotadoresRoutes);
router.use('/personalidade', personalidadeRoutes);
router.use('/arvore-da-vida', arvoreDaVidaRoutes);
router.use('/analise-swot', analiseSwotRoutes);
router.use('/portifolio', portifolioRoutes);
router.use('/metas', metasRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/departamentos', departamentoRoutes);
router.use('/cargos', cargoRoutes);
// router.use('/talentos', talentosRoutes);

module.exports = router; 