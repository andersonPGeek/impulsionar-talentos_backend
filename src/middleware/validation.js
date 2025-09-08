const { validationResult } = require('express-validator');

// Middleware para verificar se há erros de validação
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      error: firstError.msg.includes('ID do usuário') ? 'MISSING_USER_ID' : 
             firstError.msg.includes('Experiências são obrigatórias') ? 'MISSING_EXPERIENCIAS' :
             firstError.msg.includes('Experiências devem ser enviadas') ? 'MISSING_EXPERIENCIAS' :
             firstError.msg.includes('título é obrigatório') ? 'INCOMPLETE_EXPERIENCIA' :
             firstError.msg.includes('data é obrigatória') ? 'INCOMPLETE_EXPERIENCIA' :
             firstError.msg.includes('ação realizada é obrigatória') ? 'INCOMPLETE_EXPERIENCIA' :
             firstError.msg.includes('resultado entregue é obrigatório') ? 'INCOMPLETE_EXPERIENCIA' :
             firstError.msg.includes('incompleta') ? 'INCOMPLETE_EXPERIENCIA' : 
             firstError.msg.includes('Formato de experiências') ? 'INVALID_EXPERIENCIAS_FORMAT' :
             firstError.msg.includes('obrigatório') ? 'MISSING_EXPERIENCIAS' : 'VALIDATION_ERROR',
      message: firstError.msg,
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Middleware para sanitizar dados de entrada
const sanitizeInput = (req, res, next) => {
  // Sanitizar body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitizar query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

module.exports = {
  validateRequest,
  sanitizeInput
}; 