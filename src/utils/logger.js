// Utilitário para logging
class Logger {
  static info(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp} - ${message}`, error ? error.stack || error : '');
  }

  static warn(message, data = null) {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`[DEBUG] ${timestamp} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  // Log de requisições HTTP
  static request(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const method = req.method;
      const url = req.originalUrl;
      const userAgent = req.get('User-Agent') || 'Unknown';
      
      const logMessage = `${method} ${url} - ${status} - ${duration}ms - ${userAgent}`;
      
      if (status >= 400) {
        Logger.error(logMessage);
      } else {
        Logger.info(logMessage);
      }
    });
    
    next();
  }
}

module.exports = Logger; 