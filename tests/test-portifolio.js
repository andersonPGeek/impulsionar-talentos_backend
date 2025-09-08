const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuração
const BASE_URL = 'http://localhost:3002';
const API_URL = `${BASE_URL}/api/portifolio`;

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Função para log colorido
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para criar arquivo de teste temporário
function createTestFile(filename, content = 'Test file content') {
  const testDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  const filePath = path.join(testDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
}

// Função para limpar arquivos temporários
function cleanupTempFiles() {
  const testDir = path.join(__dirname, 'temp');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

// Função para limpar dados de teste
async function cleanupTestData() {
  try {
    // Deletar portfólios de teste dos usuários 1 e 4
    await axios.delete(`${API_URL}/1`);
    await axios.delete(`${API_URL}/4`);
    log(`   Dados de teste limpos`, 'blue');
  } catch (error) {
    // Ignorar erros de limpeza (usuário pode não existir)
  }
}

// Função para executar teste
async function runTest(testName, testFunction) {
  try {
    log(`\n${colors.bold}🧪 Executando: ${testName}${colors.reset}`);
    await testFunction();
    log(`✅ ${testName} - PASSOU`, 'green');
  } catch (error) {
    log(`❌ ${testName} - FALHOU`, 'red');
    log(`   Erro: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

// Testes
async function test1_SalvarPortifolioBasico() {
  const formData = new FormData();
  formData.append('id_usuario', '1');
  formData.append('experiencias', JSON.stringify([
    {
      titulo_experiencia: "Desenvolvimento de Sistema Web",
      data_experiencia: "2024-01-15",
      acao_realizada: "Desenvolvi um sistema completo de gestão de vendas",
      resultado_entregue: "Sistema implementado com sucesso, aumentando vendas em 30%"
    }
  ]));

  const response = await axios.post(API_URL, formData, {
    headers: {
      ...formData.getHeaders()
    }
  });

  if (response.status !== 201) {
    throw new Error(`Status esperado: 201, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response success deve ser true');
  }

  if (response.data.data.experiencias_salvas !== 1) {
    throw new Error('Deve ter salvo 1 experiência');
  }

  log(`   Experiência salva com ID: ${response.data.data.experiencias[0].id_experiencia_portifolio}`, 'blue');
}

async function test2_SalvarPortifolioComLinksEFeedbacks() {
  const formData = new FormData();
  formData.append('id_usuario', '1');
  formData.append('experiencias', JSON.stringify([
    {
      titulo_experiencia: "Projeto de Machine Learning",
      data_experiencia: "2024-02-20",
      acao_realizada: "Implementei um modelo de predição de vendas",
      resultado_entregue: "Modelo com 85% de precisão implementado",
      links: [
        { link_evidencia: "https://github.com/usuario/ml-project" },
        { link_evidencia: "https://demo.example.com" }
      ],
      feedbacks: [
        { feedback: "Excelente trabalho, muito inovador!", autor: "Maria Silva" },
        { feedback: "O modelo superou nossas expectativas", autor: "João Santos" }
      ]
    }
  ]));

  const response = await axios.post(API_URL, formData, {
    headers: {
      ...formData.getHeaders()
    }
  });

  if (response.status !== 201) {
    throw new Error(`Status esperado: 201, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response success deve ser true');
  }

  log(`   Experiência salva com ID: ${response.data.data.experiencias[0].id_experiencia_portifolio}`, 'blue');
}

async function test3_SalvarPortifolioComArquivos() {
  // Criar arquivos de teste
  const imageFile = createTestFile('screenshot.png', 'fake image content');
  const pdfFile = createTestFile('documento.pdf', 'fake pdf content');

  const formData = new FormData();
  formData.append('id_usuario', '1');
  formData.append('experiencias', JSON.stringify([
    {
      titulo_experiencia: "Projeto com Documentação",
      data_experiencia: "2024-03-10",
      acao_realizada: "Desenvolvi um sistema com documentação completa",
      resultado_entregue: "Sistema documentado e entregue no prazo"
    }
  ]));
  
  // Adicionar arquivos
  formData.append('materiais', fs.createReadStream(imageFile));
  formData.append('materiais', fs.createReadStream(pdfFile));

  const response = await axios.post(API_URL, formData, {
    headers: {
      ...formData.getHeaders()
    }
  });

  if (response.status !== 201) {
    throw new Error(`Status esperado: 201, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response success deve ser true');
  }

  log(`   Experiência salva com ID: ${response.data.data.experiencias[0].id_experiencia_portifolio}`, 'blue');
  
  // Limpar arquivos temporários
  cleanupTempFiles();
}

async function test4_SalvarPortifolioMultiplasExperiencias() {
  const formData = new FormData();
  formData.append('id_usuario', '4');
  formData.append('experiencias', JSON.stringify([
    {
      titulo_experiencia: "Primeira Experiência",
      data_experiencia: "2024-01-01",
      acao_realizada: "Primeira ação realizada",
      resultado_entregue: "Primeiro resultado entregue"
    },
    {
      titulo_experiencia: "Segunda Experiência",
      data_experiencia: "2024-02-01",
      acao_realizada: "Segunda ação realizada",
      resultado_entregue: "Segundo resultado entregue",
      links: [
        { link_evidencia: "https://example1.com" }
      ]
    },
    {
      titulo_experiencia: "Terceira Experiência",
      data_experiencia: "2024-03-01",
      acao_realizada: "Terceira ação realizada",
      resultado_entregue: "Terceiro resultado entregue",
      feedbacks: [
        { feedback: "Feedback da terceira experiência", autor: "Teste Autor" }
      ]
    }
  ]));

  const response = await axios.post(API_URL, formData, {
    headers: {
      ...formData.getHeaders()
    }
  });

  if (response.status !== 201) {
    throw new Error(`Status esperado: 201, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response success deve ser true');
  }

  if (response.data.data.experiencias_salvas !== 3) {
    throw new Error('Deve ter salvo 3 experiências');
  }

  log(`   ${response.data.data.experiencias_salvas} experiências salvas com sucesso`, 'blue');
}

async function test5_BuscarPortifolio() {
  const response = await axios.get(`${API_URL}/1`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response success deve ser true');
  }

  if (!response.data.data.experiencias || !Array.isArray(response.data.data.experiencias)) {
    throw new Error('Deve retornar array de experiências');
  }

  log(`   Portfólio encontrado com ${response.data.data.total_experiencias} experiências`, 'blue');
}

async function test6_BuscarPortifolioInexistente() {
  const response = await axios.get(`${API_URL}/999`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response success deve ser true');
  }

  if (response.data.data.total_experiencias !== 0) {
    throw new Error('Deve retornar 0 experiências para usuário inexistente');
  }

  log(`   Portfólio vazio retornado corretamente`, 'blue');
}

async function test7_ValidacaoIdUsuarioObrigatorio() {
  try {
    const formData = new FormData();
    formData.append('experiencias', JSON.stringify([
      {
        titulo_experiencia: "Teste",
        data_experiencia: "2024-01-01",
        acao_realizada: "Teste",
        resultado_entregue: "Teste"
      }
    ]));

    await axios.post(API_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (error.response.data.error !== 'MISSING_USER_ID') {
        throw new Error(`Erro esperado: MISSING_USER_ID, recebido: ${error.response.data.error}`);
      }
    } else {
      throw error;
    }
  }
}

async function test8_ValidacaoExperienciasObrigatorias() {
  try {
    const formData = new FormData();
    formData.append('id_usuario', '1');

    await axios.post(API_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (error.response.data.error !== 'MISSING_EXPERIENCIAS') {
        throw new Error(`Erro esperado: MISSING_EXPERIENCIAS, recebido: ${error.response.data.error}`);
      }
    } else {
      throw error;
    }
  }
}

async function test9_ValidacaoFormatoExperiencias() {
  try {
    const formData = new FormData();
    formData.append('id_usuario', '1');
    formData.append('experiencias', 'formato-invalido');

    await axios.post(API_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (!error.response.data.error.includes('INVALID_EXPERIENCIAS_FORMAT')) {
        throw new Error(`Erro esperado: INVALID_EXPERIENCIAS_FORMAT, recebido: ${error.response.data.error}`);
      }
    } else {
      throw error;
    }
  }
}

async function test10_ValidacaoExperienciaIncompleta() {
  try {
    const formData = new FormData();
    formData.append('id_usuario', '1');
    formData.append('experiencias', JSON.stringify([
      {
        titulo_experiencia: "Teste Incompleto"
        // Faltam campos obrigatórios
      }
    ]));

    await axios.post(API_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    throw new Error('Deveria ter retornado erro 400');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (error.response.data.error !== 'INCOMPLETE_EXPERIENCIA') {
        throw new Error(`Erro esperado: INCOMPLETE_EXPERIENCIA, recebido: ${error.response.data.error}`);
      }
    } else {
      throw error;
    }
  }
}

async function test11_AtualizarPortifolio() {
  // Primeiro, criar um portfólio
  const formData = new FormData();
  formData.append('id_usuario', '1');
  formData.append('experiencias', JSON.stringify([
    {
      titulo_experiencia: "Experiência Original",
      data_experiencia: "2024-01-01",
      acao_realizada: "Ação original",
      resultado_entregue: "Resultado original"
    }
  ]));

  const createResponse = await axios.post(API_URL, formData, {
    headers: {
      ...formData.getHeaders()
    }
  });

  const id_experiencia = createResponse.data.data.experiencias[0].id_experiencia_portifolio;

  // Agora atualizar a experiência específica
  const updateFormData = new FormData();
  updateFormData.append('experiencias', JSON.stringify([
    {
      titulo_experiencia: "Experiência Atualizada",
      data_experiencia: "2024-02-01",
      acao_realizada: "Ação atualizada",
      resultado_entregue: "Resultado atualizado",
      links: [
        { link_evidencia: "https://github.com/atualizado" }
      ]
    }
  ]));

  const response = await axios.put(`${API_URL}/1/${id_experiencia}`, updateFormData, {
    headers: {
      ...updateFormData.getHeaders()
    }
  });

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response success deve ser true');
  }

  if (!response.data.data.id_experiencia_portifolio) {
    throw new Error('Deve retornar o ID da experiência atualizada');
  }

  log(`   Experiência atualizada com sucesso - ID: ${response.data.data.id_experiencia_portifolio}`, 'blue');
}

async function test12_DeletarPortifolio() {
  // Primeiro, criar um portfólio para o usuário 1 (que já existe)
  const formData = new FormData();
  formData.append('id_usuario', '1');
  formData.append('experiencias', JSON.stringify([
    {
      titulo_experiencia: "Experiência para Deletar",
      data_experiencia: "2024-01-01",
      acao_realizada: "Ação para deletar",
      resultado_entregue: "Resultado para deletar"
    }
  ]));

  const createResponse = await axios.post(API_URL, formData, {
    headers: {
      ...formData.getHeaders()
    }
  });

  const id_experiencia = createResponse.data.data.experiencias[0].id_experiencia_portifolio;

  // Agora deletar a experiência específica
  const response = await axios.delete(`${API_URL}/1/${id_experiencia}`);

  if (response.status !== 200) {
    throw new Error(`Status esperado: 200, recebido: ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response success deve ser true');
  }

  if (!response.data.data.id_experiencia_portifolio) {
    throw new Error('Deve retornar o ID da experiência deletada');
  }

  log(`   Experiência deletada com sucesso - ID: ${response.data.data.id_experiencia_portifolio}`, 'blue');
}

async function test13_DeletarPortifolioInexistente() {
  try {
    await axios.delete(`${API_URL}/999/999`);
    throw new Error('Deveria ter retornado erro 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      if (error.response.data.error !== 'EXPERIENCE_NOT_FOUND') {
        throw new Error(`Erro esperado: EXPERIENCE_NOT_FOUND, recebido: ${error.response.data.error}`);
      }
    } else {
      throw error;
    }
  }

  log(`   Experiência inexistente retornou erro 404 corretamente`, 'blue');
}

// Função principal
async function runAllTests() {
  log(`${colors.bold}🚀 Iniciando testes da API de Portfólio${colors.reset}`);
  log(`${colors.blue}Base URL: ${BASE_URL}${colors.reset}`);
  log(`${colors.blue}API URL: ${API_URL}${colors.reset}\n`);

  // Verificar se o servidor está rodando
  try {
    await axios.get(`${BASE_URL}/api/test`);
    log(`${colors.green}✅ Servidor está rodando${colors.reset}\n`);
  } catch (error) {
    log(`${colors.red}❌ Servidor não está rodando. Execute: npm run dev${colors.reset}`);
    process.exit(1);
  }

  // Limpeza inicial
  log(`${colors.yellow}🧹 Limpando dados de teste anteriores...${colors.reset}`);
  await cleanupTestData();

  // Executar testes
  await runTest('1. Salvar Portfólio Básico', test1_SalvarPortifolioBasico);
  await runTest('2. Salvar Portfólio com Links e Feedbacks', test2_SalvarPortifolioComLinksEFeedbacks);
  await runTest('3. Salvar Portfólio com Arquivos', test3_SalvarPortifolioComArquivos);
  await runTest('4. Salvar Portfólio Múltiplas Experiências', test4_SalvarPortifolioMultiplasExperiencias);
  await runTest('5. Buscar Portfólio', test5_BuscarPortifolio);
  await runTest('6. Buscar Portfólio Inexistente', test6_BuscarPortifolioInexistente);
  await runTest('7. Validação - ID Usuário Obrigatório', test7_ValidacaoIdUsuarioObrigatorio);
  await runTest('8. Validação - Experiências Obrigatórias', test8_ValidacaoExperienciasObrigatorias);
  await runTest('9. Validação - Formato Experiências', test9_ValidacaoFormatoExperiencias);
  await runTest('10. Validação - Experiência Incompleta', test10_ValidacaoExperienciaIncompleta);
  await runTest('11. Atualizar Portfólio', test11_AtualizarPortifolio);
  await runTest('12. Deletar Portfólio', test12_DeletarPortifolio);
  await runTest('13. Deletar Portfólio Inexistente', test13_DeletarPortifolioInexistente);

  // Limpeza final
  log(`\n${colors.yellow}🧹 Limpando dados de teste...${colors.reset}`);
  await cleanupTestData();
  cleanupTempFiles();

  log(`\n${colors.bold}🎉 Testes da API de Portfólio concluídos!${colors.reset}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n${colors.red}❌ Erro fatal: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { runAllTests };

