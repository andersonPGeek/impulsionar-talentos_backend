const crypto = require('crypto');

// Gerar JWT_SECRET seguro
const generateJWTSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Gerar string de conexão de exemplo
const generateExampleEnv = () => {
  const jwtSecret = generateJWTSecret();
  
  return `# Configurações do Banco de Dados
DATABASE_URL=postgresql://postgres:t9Rgcvq8jlpYt7sG@db.fdopxrrcvbzhwszsluwm.supabase.co:5432/postgres

# Configurações do Servidor
PORT=3002
NODE_ENV=development

# Configurações de Segurança
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=24h

# Configurações de CORS (para produção)
CORS_ORIGIN=http://localhost:3000

# Configurações de Log
LOG_LEVEL=info`;
};

// Executar
console.log('🔐 Gerando configurações de ambiente...\n');

const jwtSecret = generateJWTSecret();
console.log('✅ JWT_SECRET gerado:');
console.log(jwtSecret);
console.log('\n📝 Copie este valor para sua variável de ambiente JWT_SECRET\n');

console.log('📄 Exemplo de arquivo .env:');
console.log('='.repeat(50));
console.log(generateExampleEnv());
console.log('='.repeat(50));

console.log('\n💡 Dica: Nunca compartilhe ou commite o JWT_SECRET no repositório!'); 