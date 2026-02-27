#!/usr/bin/env node

/**
 * Script de Teste CORS
 * Valida se a configuração de CORS está funcionando corretamente para localhost:5173
 * 
 * Uso: node scripts/test-cors.js
 */

const http = require('http');
const url = require('url');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002';
const TEST_ENDPOINTS = [
  '/health',
  '/api/health',
  '/api/auth/login'  // Existente se houver
];

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║         🧪 Teste de Configuração CORS                 ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Fazer requisição com header de origem
 */
function testCorsRequest(endpoint, origin) {
  return new Promise((resolve) => {
    const urlObj = new URL(endpoint, BASE_URL);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    };

    const req = http.request(options, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers,
        allowOrigin: res.headers['access-control-allow-origin'],
        allowMethods: res.headers['access-control-allow-methods'],
        allowHeaders: res.headers['access-control-allow-headers'],
        allowCredentials: res.headers['access-control-allow-credentials']
      });
    });

    req.on('error', (err) => {
      resolve({
        error: err.message,
        status: 0
      });
    });

    req.end();
  });
}

/**
 * Teste principal
 */
async function runTests() {
  const origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://example.com' // Para testar bloqueio
  ];

  console.log(`📍 Server: ${colors.cyan}${BASE_URL}${colors.reset}\n`);

  // Teste 1: Verificar se servidor está rodando
  log(colors.blue, '▶ Teste 1: Verificando conectividade do servidor...\n');
  
  try {
    const result = await testCorsRequest('/health', 'http://localhost:5173');
    if (result.error) {
      log(colors.red, `❌ Servidor não está respondendo: ${result.error}`);
      log(colors.yellow, '\n💡 Solução: Inicie o servidor com "npm start"');
      return;
    } else {
      log(colors.green, `✅ Servidor está respondendo (status ${result.status})\n`);
    }
  } catch (err) {
    log(colors.red, `❌ Erro ao conectar: ${err.message}`);
    return;
  }

  // Teste 2: Testar CORS com diferentes origens
  log(colors.blue, '▶ Teste 2: Testando CORS com diferentes origens...\n');

  for (const endpoint of TEST_ENDPOINTS) {
    console.log(`  📍 Endpoint: ${colors.cyan}${endpoint}${colors.reset}`);
    
    for (const origin of origins) {
      const result = await testCorsRequest(endpoint, origin);
      
      if (result.error) {
        log(colors.red, `    ❌ ${origin}: ${result.error}`);
        continue;
      }

      const allowed = result.allowOrigin === origin || result.allowOrigin === '*';
      const status = allowed ? '✅' : '❌';
      const color = allowed ? colors.green : colors.red;

      log(color, `    ${status} ${origin}`);
      
      if (result.allowOrigin) {
        console.log(`       ├─ Allow-Origin: ${colors.cyan}${result.allowOrigin}${colors.reset}`);
      }
      if (result.allowMethods) {
        console.log(`       ├─ Allow-Methods: ${colors.cyan}${result.allowMethods}${colors.reset}`);
      }
      if (result.allowCredentials === 'true') {
        console.log(`       └─ Allow-Credentials: ${colors.cyan}true${colors.reset}`);
      }
    }
    console.log('');
  }

  // Teste 3: Verificar variáveis de ambiente
  log(colors.blue, '▶ Teste 3: Verificando variáveis de ambiente...\n');

  const nodeEnv = process.env.NODE_ENV || 'não definido';
  const corsOrigin = process.env.CORS_ORIGIN || 'não definido';

  console.log(`  NODE_ENV: ${colors.cyan}${nodeEnv}${colors.reset}`);
  console.log(`  CORS_ORIGIN: ${colors.cyan}${corsOrigin}${colors.reset}\n`);

  if (nodeEnv === 'development') {
    log(colors.green, '✅ Em DESENVOLVIMENTO: localhost automaticamente permitido\n');
  } else if (nodeEnv === 'production') {
    if (corsOrigin === 'não definido') {
      log(colors.red, '❌ Em PRODUÇÃO: CORS_ORIGIN não configurado!\n');
      log(colors.yellow, '💡 Solução: Defina CORS_ORIGIN no .env\n');
    } else {
      log(colors.green, '✅ Em PRODUÇÃO: CORS_ORIGIN configurado\n');
    }
  }

  // Resumo
  log(colors.blue, '▶ Resumo:\n');
  
  const configOk = nodeEnv === 'development' || corsOrigin.includes('5173');
  if (configOk) {
    log(colors.green, '✅ localhost:5173 deve funcionar\n');
  } else {
    log(colors.red, '❌ localhost:5173 pode não funcionar\n');
    log(colors.yellow, '💡 Verifique:\n');
    console.log('   1. NODE_ENV está definido como "development"?');
    console.log('   2. CORS_ORIGIN inclui "http://localhost:5173"?');
    console.log('   3. Servidor foi reiniciado após alterar .env?\n');
  }

  // Dicas de debugging
  log(colors.blue, '▶ Dicas de Debugging:\n');
  console.log('  1. Abra DevTools do navegador (F12)');
  console.log('  2. Aba "Network" → procure pela requisição');
  console.log('  3. Em "Response Headers", procure por "Access-Control-Allow-Origin"');
  console.log('  4. Se não houver, CORS está bloqueado\n');

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                   Teste Concluído                      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
}

// Executar testes
runTests().catch(console.error);
