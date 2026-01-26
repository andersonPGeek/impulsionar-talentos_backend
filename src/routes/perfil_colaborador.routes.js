const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const perfilColaboradorController = require('../controllers/perfil_colaborador.controller');

const router = express.Router();

/**
 * Validação para ID de usuário na URL
 */
const idUserParamValidation = [
  param('id_user')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo')
];

/**
 * Validação para criação/atualização de perfil
 */
const perfilValidation = [
  body('id_user')
    .isInt({ min: 1 })
    .withMessage('ID do usuário é obrigatório e deve ser um número inteiro positivo'),
  
  body('identidade_profissional')
    .optional()
    .isObject()
    .withMessage('Identidade profissional deve ser um objeto'),
  
  body('identidade_profissional.area_time')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Área/time deve ter no máximo 100 caracteres'),
  
  body('identidade_profissional.tempo_empresa_meses')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Tempo na empresa deve ser um número inteiro positivo'),
  
  body('identidade_profissional.tempo_experiencia_total_anos')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Tempo de experiência total deve ser um número inteiro positivo'),
  
  body('identidade_profissional.formacao_nivel')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('Formação nível deve ter no máximo 50 caracteres'),
  
  body('identidade_profissional.formacao_area')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Formação área deve ter no máximo 100 caracteres'),
  
  body('habilidades_tecnicas')
    .optional()
    .isArray()
    .withMessage('Habilidades técnicas deve ser um array'),
  
  body('habilidades_tecnicas.*.nome_habilidade')
    .if(body('habilidades_tecnicas').isArray())
    .notEmpty()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Nome da habilidade é obrigatório e deve ter no máximo 100 caracteres'),
  
  body('habilidades_tecnicas.*.nivel_autoavaliado')
    .if(body('habilidades_tecnicas').isArray())
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Nível autoavaliado deve ser entre 1 e 5'),
  
  body('habilidades_tecnicas.*.nivel_exigido_cargo')
    .if(body('habilidades_tecnicas').isArray())
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Nível exigido cargo deve ser entre 1 e 5'),
  
  body('habilidades_comportamentais')
    .optional()
    .isObject()
    .withMessage('Habilidades comportamentais deve ser um objeto'),
  
  body('habilidades_comportamentais.comunicacao')
    .if(body('habilidades_comportamentais.comunicacao').exists())
    .isInt({ min: 1, max: 5 })
    .withMessage('Comunicação deve ser entre 1 e 5'),
  
  body('habilidades_comportamentais.trabalho_equipe')
    .if(body('habilidades_comportamentais.trabalho_equipe').exists())
    .isInt({ min: 1, max: 5 })
    .withMessage('Trabalho em equipe deve ser entre 1 e 5'),
  
  body('habilidades_comportamentais.organizacao')
    .if(body('habilidades_comportamentais.organizacao').exists())
    .isInt({ min: 1, max: 5 })
    .withMessage('Organização deve ser entre 1 e 5'),
  
  body('habilidades_comportamentais.autonomia')
    .if(body('habilidades_comportamentais.autonomia').exists())
    .isInt({ min: 1, max: 5 })
    .withMessage('Autonomia deve ser entre 1 e 5'),
  
  body('habilidades_comportamentais.lideranca')
    .if(body('habilidades_comportamentais.lideranca').exists())
    .isInt({ min: 1, max: 5 })
    .withMessage('Liderança deve ser entre 1 e 5'),
  
  body('habilidades_comportamentais.resiliencia')
    .if(body('habilidades_comportamentais.resiliencia').exists())
    .isInt({ min: 1, max: 5 })
    .withMessage('Resiliência deve ser entre 1 e 5'),
  
  body('habilidades_comportamentais.aprendizado_continuo')
    .if(body('habilidades_comportamentais.aprendizado_continuo').exists())
    .isInt({ min: 1, max: 5 })
    .withMessage('Aprendizado contínuo deve ser entre 1 e 5'),
  
  body('interesses_motivadores')
    .optional()
    .isObject()
    .withMessage('Interesses e motivadores deve ser um objeto'),
  
  body('interesses_motivadores.preferencia_desafio')
    .optional()
    .isIn(['tecnico', 'pessoas', 'estrategia'])
    .withMessage('Preferência de desafio deve ser: tecnico, pessoas ou estrategia'),
  
  body('interesses_motivadores.preferencia_crescimento')
    .optional()
    .isIn(['estabilidade', 'crescimento'])
    .withMessage('Preferência de crescimento deve ser: estabilidade ou crescimento'),
  
  body('objetivos_carreira')
    .optional()
    .isObject()
    .withMessage('Objetivos de carreira deve ser um objeto'),
  
  body('objetivos_carreira.trilha_carreira')
    .optional()
    .isIn(['lideranca', 'especialista', 'hibrido'])
    .withMessage('Trilha de carreira deve ser: lideranca, especialista ou hibrido'),
  
  body('disponibilidade')
    .optional()
    .isObject()
    .withMessage('Disponibilidade deve ser um objeto'),
  
  body('disponibilidade.horas_semanais_desenvolvimento')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Horas semanais deve ser um número inteiro positivo'),
  
  body('disponibilidade.preferencia_aprendizado')
    .optional()
    .isIn(['cursos', 'pratica', 'mentoria'])
    .withMessage('Preferência de aprendizado deve ser: cursos, pratica ou mentoria'),
  
  body('disponibilidade.aberto_mudanca')
    .optional()
    .isBoolean()
    .withMessage('Aberto a mudança deve ser um valor booleano'),
  
  body('disponibilidade.aceita_desafios')
    .optional()
    .isBoolean()
    .withMessage('Aceita desafios deve ser um valor booleano')
];

/**
 * @route GET /api/perfil-colaborador/:id_user
 * @desc Buscar perfil completo do colaborador
 * @access Private
 */
router.get('/:id_user',
  idUserParamValidation,
  validateRequest,
  perfilColaboradorController.buscarPerfil.bind(perfilColaboradorController)
);

/**
 * @route POST /api/perfil-colaborador
 * @desc Criar perfil completo do colaborador
 * @access Private
 */
router.post('/',
  perfilValidation,
  validateRequest,
  perfilColaboradorController.criarPerfil.bind(perfilColaboradorController)
);

/**
 * @route PUT /api/perfil-colaborador
 * @desc Atualizar perfil completo do colaborador
 * @access Private
 */
router.put('/',
  perfilValidation,
  validateRequest,
  perfilColaboradorController.atualizarPerfil.bind(perfilColaboradorController)
);

/**
 * @route DELETE /api/perfil-colaborador/:id_user
 * @desc Deletar perfil completo do colaborador
 * @access Private
 */
router.delete('/:id_user',
  idUserParamValidation,
  validateRequest,
  perfilColaboradorController.deletarPerfil.bind(perfilColaboradorController)
);

module.exports = router;
