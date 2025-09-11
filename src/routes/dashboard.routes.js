const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

/**
 * @route GET /api/dashboard/gestor/:id_gestor
 * @desc Buscar dashboard de gestão
 * @access Private
 */
router.get('/gestor/:id_gestor', dashboardController.buscarDashboardGestor);

/**
 * @route GET /api/dashboard/arvore-da-vida/:id_gestor
 * @desc Buscar árvore da vida da equipe por gestor
 * @access Private
 */
router.get('/arvore-da-vida/:id_gestor', dashboardController.buscarArvoreDaVidaPorGestor);

/**
 * @route GET /api/dashboard/analise-swot/:id_gestor
 * @desc Buscar análise SWOT da equipe por gestor
 * @access Private
 */
router.get('/analise-swot/:id_gestor', dashboardController.buscarAnaliseSwotPorGestor);

/**
 * @route GET /api/dashboard/portifolio/:id_gestor
 * @desc Buscar portfólio da equipe por gestor
 * @access Private
 */
router.get('/portifolio/:id_gestor', dashboardController.buscarPortifolioPorGestor);

module.exports = router;

