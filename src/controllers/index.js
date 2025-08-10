// Arquivo de índice para controllers
// Será usado para centralizar a importação dos controllers

// Exemplo de estrutura de controller base
class BaseController {
  constructor() {
    this.handleError = this.handleError.bind(this);
  }

  // Método para tratar erros de forma consistente
  handleError(res, error, message = 'Erro interno do servidor') {
    console.error('Controller Error:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        message: 'Dados já existem no sistema',
        error: error.detail
      });
    }

    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        message: 'Referência inválida',
        error: error.detail
      });
    }

    return res.status(500).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }

  // Método para validar se um registro existe
  async validateExists(query, params, errorMessage = 'Registro não encontrado') {
    const result = await query(params);
    if (result.rows.length === 0) {
      throw new Error(errorMessage);
    }
    return result.rows[0];
  }
}

module.exports = {
  BaseController
}; 