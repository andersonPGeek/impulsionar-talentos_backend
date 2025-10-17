// Utilitário para padronizar respostas da API
class ApiResponse {
  // Resposta de sucesso
  static success(res, data = null, message = 'Operação realizada com sucesso', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Resposta de erro
  static error(res, message = 'Erro interno do servidor', statusCode = 500, details = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Resposta de validação
  static validationError(res, errors, message = 'Dados inválidos') {
    return res.status(400).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  // Resposta de erro de requisição
  static badRequest(res, data = null, message = 'Requisição inválida') {
    return res.status(400).json({
      success: false,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Resposta de criado
  static created(res, data = null, message = 'Recurso criado com sucesso') {
    return res.status(201).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Resposta de erro interno
  static internalError(res, message = 'Erro interno do servidor') {
    return res.status(500).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Resposta de não encontrado
  static notFound(res, message = 'Recurso não encontrado') {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Resposta de acesso negado
  static forbidden(res, message = 'Acesso negado') {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Resposta de não autorizado
  static unauthorized(res, message = 'Não autorizado') {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Resposta de lista paginada
  static paginated(res, data, page, limit, total, message = 'Lista recuperada com sucesso') {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext,
        hasPrev
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse; 