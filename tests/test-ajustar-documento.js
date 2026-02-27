#!/usr/bin/env node

/**
 * Teste prático para o novo endpoint POST /api/ia/documento/ajustar
 * Execute: node tests/test-ajustar-documento.js
 * 
 * Objetivo: Testar o ajuste de documentos jurídicos via IA
 */

const http = require('http');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

/**
 * Função para fazer requisição POST
 */
function makeRequest(path, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SERVER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * HTML de exemplo do payload fornecido
 */
const HTML_EXEMPLO = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acordo Extrajudicial de Alimentos</title>
  <style>
    :root {
      --navy-blue: #14213d;
      --gold: #fca311;
      --light-bg: #fffbf0;
      --text-main: #333333;
    }
    body {
      font-family: 'Open Sans', sans-serif;
      color: var(--text-main);
      padding: 20px;
    }
    .page {
      background-color: white;
      max-width: 800px;
      margin: 0 auto;
    }
    header {
      border-bottom: 2px solid var(--gold);
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .document-title {
      font-weight: 700;
      font-size: 20pt;
      color: var(--navy-blue);
      text-transform: uppercase;
    }
    .clause-item {
      margin: 15px 0;
      line-height: 1.6;
    }
    .highlight-gold {
      color: var(--gold);
      font-weight: 700;
    }
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
      font-size: 8pt;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <div class="document-title">ACORDO EXTRAJUDICIAL DE ALIMENTOS</div>
    </header>
    <main class="content">
      <p class="clause-item">Este acordo extrajudicial de alimentos é firmado entre <strong>Carolina Ribeiro Martins</strong> (GENITORA) e <strong>Felipe Augusto Nascimento</strong> (GENITOR).</p>
      
      <h2 style="color: var(--navy-blue); font-size: 14pt;">CLÁUSULA 1 — PENSÃO MENSAL</h2>
      <p class="clause-item">1.1. O GENITOR pagará pensão mensal no valor de <span class="highlight-gold">R$ 820,00 (oitocentos e vinte reais)</span>, todo dia 05 de cada mês.</p>
      <p class="clause-item">1.2. O pagamento será via PIX para a GENITORA: chave <span class="highlight-gold">22233344455</span>.</p>
      <p class="clause-item">1.3. A pensão inclui a parcela proporcional do <strong>13º</strong>, a ser paga em dezembro.</p>
      
      <h2 style="color: var(--navy-blue); font-size: 14pt;">CLÁUSULA 2 — DESPESAS EXTRAORDINÁRIAS</h2>
      <p class="clause-item">2.1. Despesas médicas e odontológicas não cobertas por plano, bem como material escolar e uniforme, serão divididas <span class="highlight-gold">50% para cada genitor</span>, mediante apresentação de comprovantes.</p>
      
      <h2 style="color: var(--navy-blue); font-size: 14pt;">CLÁUSULA 3 — INADIMPLÊNCIA</h2>
      <p class="clause-item">3.1. Atraso implica <span class="highlight-gold">multa de 10%</span>, correção monetária e juros legais.</p>
    </main>
    <footer>
      <p>Belo Horizonte/MG, 18 de fevereiro de 2026.</p>
    </footer>
  </div>
</body>
</html>`;

/**
 * Teste 1: Ajuste simples (aumentar destaque de valores)
 */
async function teste1_AumentarDestaqueValores() {
  console.log('\n========================================');
  console.log('TESTE 1: Aumentar Destaque de Valores');
  console.log('========================================\n');

  const payload = {
    html_formatado: HTML_EXEMPLO,
    prompt_usuario: 'Aumente o tamanho de fonte de todos os valores monetários (R$ 820,00, etc) para 14pt e faça-os em negrito. Também destaque a palavra "50%" em negrito.'
  };

  try {
    console.log('📤 Enviando requisição...');
    const response = await makeRequest('/api/ia/documento/ajustar', payload);

    console.log(`\n✅ Status: ${response.status}`);
    
    if (response.data.success) {
      console.log('\n📝 Resposta da IA:');
      console.log(`   Explicação: ${response.data.data.explicacao_ia}\n`);
      console.log('   HTML Ajustado (primeiros 500 chars):');
      console.log(`   ${response.data.data.html_formatado.substring(0, 500)}...\n`);
    } else {
      console.log(`\n❌ Erro: ${response.data.message}`);
    }
  } catch (error) {
    console.error('\n❌ Erro na requisição:', error.message);
  }
}

/**
 * Teste 2: Validação de campo obrigatório
 */
async function teste2_CampoObrigatorio() {
  console.log('\n========================================');
  console.log('TESTE 2: Validação - Campo Obrigatório');
  console.log('========================================\n');

  const payload = {
    html_formatado: HTML_EXEMPLO
    // prompt_usuario está faltando
  };

  try {
    console.log('📤 Enviando requisição sem prompt_usuario...');
    const response = await makeRequest('/api/ia/documento/ajustar', payload);

    console.log(`\n✅ Status: ${response.status}`);
    console.log(`   Mensagem: ${response.data.message}`);
    
    if (response.status === 400) {
      console.log('   ✓ Validação funcionando corretamente!');
    }
  } catch (error) {
    console.error('\n❌ Erro na requisição:', error.message);
  }
}

/**
 * Teste 3: Com contexto jurídico completo
 */
async function teste3_ComContextoJuridico() {
  console.log('\n========================================');
  console.log('TESTE 3: Com Contexto Jurídico');
  console.log('========================================\n');

  const payload = {
    html_formatado: HTML_EXEMPLO,
    prompt_usuario: 'Adicione um destaque visual em vermelho (#d32f2f) na CLÁUSULA 3 (INADIMPLÊNCIA) para destacar a importância desta cláusula.',
    ementa: {
      titulo: 'ACORDO EXTRAJUDICIAL DE ALIMENTOS',
      subtitulo: 'PENSÃO ALIMENTÍCIA. DESPESAS EXTRAORDINÁRIAS. TÍTULO EXECUTIVO EXTRAJUDICIAL.'
    },
    entidade_juridica: [
      { papel: 'GENITORA', parte: 'Carolina Ribeiro Martins' },
      { papel: 'GENITOR', parte: 'Felipe Augusto Nascimento' },
      { papel: 'Menor (Representado)', parte: 'Matheus Ribeiro Nascimento' }
    ],
    citacoes_de_lei: [
      { norma: 'CPC', artigo: '784, IV', texto_citado: 'título executivo extrajudicial' }
    ]
  };

  try {
    console.log('📤 Enviando requisição com contexto jurídico...');
    const response = await makeRequest('/api/ia/documento/ajustar', payload);

    console.log(`\n✅ Status: ${response.status}`);
    
    if (response.data.success) {
      console.log('\n📝 Resposta da IA:');
      console.log(`   Explicação:\n   ${response.data.data.explicacao_ia}\n`);
      console.log('   ✓ Contexto jurídico processado com sucesso!');
    } else {
      console.log(`\n❌ Erro: ${response.data.message}`);
    }
  } catch (error) {
    console.error('\n❌ Erro na requisição:', error.message);
  }
}

/**
 * Teste 4: HTML vazio
 */
async function teste4_HTMLVazio() {
  console.log('\n========================================');
  console.log('TESTE 4: Validação - HTML Vazio');
  console.log('========================================\n');

  const payload = {
    html_formatado: '',
    prompt_usuario: 'Qualquer coisa'
  };

  try {
    console.log('📤 Enviando requisição com HTML vazio...');
    const response = await makeRequest('/api/ia/documento/ajustar', payload);

    console.log(`\n✅ Status: ${response.status}`);
    console.log(`   Mensagem: ${response.data.message}`);
    
    if (response.status === 400) {
      console.log('   ✓ Validação de HTML vazio funcionando!');
    }
  } catch (error) {
    console.error('\n❌ Erro na requisição:', error.message);
  }
}

/**
 * Executar testes
 */
async function executarTestes() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  TESTES - POST /api/ia/documento/ajustar              ║');
  console.log('║  Ambiente: ' + SERVER_URL.padEnd(42) + '║');
  console.log('╚════════════════════════════════════════════════════════╝');

  try {
    // Executar testes de validação (rápidos)
    await teste2_CampoObrigatorio();
    await teste4_HTMLVazio();

    // Testes que envolvem IA (mais lento)
    await teste1_AumentarDestaqueValores();
    await teste3_ComContextoJuridico();

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  TESTES CONCLUÍDOS                                     ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar
executarTestes();
