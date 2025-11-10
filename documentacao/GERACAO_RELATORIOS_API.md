# APIs de Geração de Relatórios Executivos

Este documento descreve as 2 novas APIs criadas para gerar relatórios executivos completos em formato PDF e Excel, consolidando todos os dados das 29 APIs existentes.

## Base URLs
```
/api/relatorio-executivo/gerar-pdf/:id_cliente
/api/relatorio-executivo/gerar-excel/:id_cliente
```

## Autenticação
Todas as rotas requerem autenticação via JWT token no header:
```
Authorization: Bearer <seu-token-jwt>
```

## Parâmetros
- `id_cliente` (path parameter): ID do cliente para gerar o relatório

---

## 📊 APIs Implementadas

### 1. Gerar PDF do Relatório Executivo
**GET** `/api/relatorio-executivo/gerar-pdf/:id_cliente`

Gera um relatório executivo completo em formato PDF com todos os KPIs e métricas organizadas por categorias.

**Funcionalidades:**
- Coleta dados de todas as 29 APIs existentes
- Organiza informações em 7 categorias principais
- Gera PDF profissional com design moderno
- Inclui gráficos visuais e tabelas detalhadas
- Download automático do arquivo

**Resposta:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="relatorio-executivo-cliente-{id_cliente}-{data}.pdf"`
- **Body:** Buffer do arquivo PDF

**Exemplo de uso:**
```bash
curl -X GET \
  http://localhost:3000/api/relatorio-executivo/gerar-pdf/1 \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  --output relatorio-executivo.pdf
```

### 2. Gerar Excel do Relatório Executivo
**GET** `/api/relatorio-executivo/gerar-excel/:id_cliente`

Gera um relatório executivo completo em formato Excel com múltiplas abas organizadas por categorias.

**Funcionalidades:**
- Coleta dados de todas as 29 APIs existentes
- Cria planilha com 7 abas organizadas
- Inclui tabelas detalhadas e rankings
- Formatação profissional para análise
- Download automático do arquivo

**Resposta:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="relatorio-executivo-cliente-{id_cliente}-{data}.xlsx"`
- **Body:** Buffer do arquivo Excel

**Exemplo de uso:**
```bash
curl -X GET \
  http://localhost:3000/api/relatorio-executivo/gerar-excel/1 \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  --output relatorio-executivo.xlsx
```

---

## 📋 Estrutura dos Relatórios

### Categorias Incluídas:

#### 1. **📊 Visão Geral**
- Índice de Engajamento Geral (IEG)
- Taxa de Evolução de Desenvolvimento (TED)
- Nível Médio de Reconhecimento (NMR)
- Índice de Satisfação Interna (ISI)
- Maturidade de Carreira (MC)

#### 2. **🌳 Árvore da Vida**
- Índice de Plenitude
- Índice de Vitalidade
- Índice de Propósito e Contribuição
- Índice Profissional Global

#### 3. **🔍 Análise SWOT**
- Forças vs Fraquezas Ratio (FFR)
- Oportunidades Aproveitadas (%)
- Ameaças Monitoradas (%)

#### 4. **📈 PDI (Plano de Desenvolvimento Individual)**
- Progresso Médio do PDI
- Taxa de Metas em Progresso
- Aderência ao Prazo
- Engajamento com Mentoria

#### 5. **💼 Portfólio**
- Taxa de Atualização do Portfólio
- Índice de Feedbacks Positivos
- Conquistas Validadas (%)
- Ações de Melhoria

#### 6. **🏆 Programa de Reconhecimento**
- Reconhecimentos por Colaborador
- Top Skills Reconhecidas
- Tempo Médio entre Reconhecimentos
- Distribuição de Reconhecimento por Área

#### 7. **📊 KPIs de Tendência**
- Índice de Reconhecimento Recíproco
- Índice de Bem-Estar Organizacional
- Tempo Médio de Evolução de Meta

---

## 🎨 Características do PDF

### Design Profissional:
- **Header:** Gradiente moderno com informações do relatório
- **Layout:** Cards organizados em grid responsivo
- **Cores:** Paleta profissional (#667eea, #764ba2)
- **Tipografia:** Segoe UI para melhor legibilidade
- **Margens:** Otimizadas para impressão A4

### Estrutura Visual:
- **Seções:** Cada categoria em card separado
- **Métricas:** Valores destacados com descrições
- **Tabelas:** Para dados detalhados (Top Skills, Distribuição por Área)
- **Footer:** Informações de geração e sistema

### Otimizações:
- **Page-break:** Evita quebra de seções
- **Print-friendly:** Estilos otimizados para impressão
- **Responsive:** Adapta-se a diferentes tamanhos

---

## 📊 Características do Excel

### Estrutura Organizada:
- **7 Abas:** Uma para cada categoria principal
- **Headers:** Cabeçalhos com formatação destacada
- **Dados:** Valores numéricos e percentuais formatados
- **Descrições:** Explicações detalhadas de cada métrica

### Abas Detalhadas:

#### **Aba 1: Visão Geral**
| Métrica | Valor | Descrição |
|---------|-------|-----------|
| Índice de Engajamento Geral | 7.5 | Média ponderada dos pilares da Árvore da Vida |
| Taxa de Evolução de Desenvolvimento | 75.5% | Atividades concluídas ÷ Atividades planejadas no PDI |
| ... | ... | ... |

#### **Aba 2: Árvore da Vida**
| Métrica | Valor | Descrição |
|---------|-------|-----------|
| Índice de Plenitude | 8.0 | Média dos pilares Plenitude, Felicidade e Realização |
| ... | ... | ... |

#### **Aba 3: Análise SWOT**
| Métrica | Valor | Descrição |
|---------|-------|-----------|
| Forças vs Fraquezas Ratio | 1.2 | Nº de forças ÷ Nº de fraquezas |
| ... | ... | ... |

#### **Aba 4: PDI**
| Métrica | Valor | Descrição |
|---------|-------|-----------|
| Progresso Médio do PDI | 68.5% | Atividades concluídas |
| ... | ... | ... |

#### **Aba 5: Portfólio**
| Métrica | Valor | Descrição |
|---------|-------|-----------|
| Taxa de Atualização do Portfólio | 60.0% | Colaboradores com experiências nos últimos 90 dias |
| ... | ... | ... |

#### **Aba 6: Reconhecimento**
- **Métricas principais** em formato tabela
- **Top Skills Reconhecidas** com frequência
- **Distribuição por Área** com percentuais

#### **Aba 7: Tendências**
| Métrica | Valor | Descrição |
|---------|-------|-----------|
| Índice de Reconhecimento Recíproco | 35.0% | Reconhecimentos dados e recebidos por par |
| ... | ... | ... |

---

## ⚡ Performance e Otimização

### Coleta de Dados:
- **Execução Paralela:** Todas as consultas SQL executadas simultaneamente
- **Consultas Otimizadas:** Queries específicas para cada categoria
- **Cache Implícito:** Dados coletados uma única vez por relatório
- **Tratamento de Erros:** Valores padrão para dados ausentes

### Geração de Arquivos:
- **PDF:** Puppeteer com configurações otimizadas
- **Excel:** XLSX com estrutura eficiente
- **Headers:** Configurados para download direto
- **Buffer:** Transmissão otimizada via stream

---

## 🔧 Exemplos de Uso

### JavaScript (Fetch)
```javascript
// Gerar PDF
const gerarPDF = async (idCliente) => {
  try {
    const response = await fetch(`/api/relatorio-executivo/gerar-pdf/${idCliente}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-executivo-cliente-${idCliente}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  }
};

// Gerar Excel
const gerarExcel = async (idCliente) => {
  try {
    const response = await fetch(`/api/relatorio-executivo/gerar-excel/${idCliente}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-executivo-cliente-${idCliente}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
  }
};
```

### React/React Native
```javascript
const RelatorioExecutivo = () => {
  const [loading, setLoading] = useState(false);

  const gerarRelatorio = async (tipo, idCliente) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/relatorio-executivo/gerar-${tipo}/${idCliente}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        // Implementar download baseado na plataforma
        downloadFile(blob, `relatorio-executivo.${tipo}`);
      }
    } catch (error) {
      console.error(`Erro ao gerar ${tipo}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={() => gerarRelatorio('pdf', clienteId)}
        disabled={loading}
      >
        {loading ? 'Gerando PDF...' : 'Gerar PDF'}
      </button>
      
      <button 
        onClick={() => gerarRelatorio('excel', clienteId)}
        disabled={loading}
      >
        {loading ? 'Gerando Excel...' : 'Gerar Excel'}
      </button>
    </div>
  );
};
```

### cURL
```bash
# Gerar PDF
curl -X GET \
  http://localhost:3000/api/relatorio-executivo/gerar-pdf/1 \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  --output relatorio-executivo-cliente-1.pdf

# Gerar Excel
curl -X GET \
  http://localhost:3000/api/relatorio-executivo/gerar-excel/1 \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  --output relatorio-executivo-cliente-1.xlsx
```

---

## 🚨 Códigos de Erro

### 400 - Bad Request
```json
{
  "success": false,
  "message": "ID do cliente é obrigatório e deve ser um número válido"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Erro ao gerar relatório"
}
```

---

## 📝 Notas Importantes

### Dependências:
- **Puppeteer:** Para geração de PDF (requer Chrome/Chromium)
- **XLSX:** Para geração de Excel
- **Node.js:** Versão 14+ recomendada

### Performance:
- **Tempo de geração:** 5-15 segundos dependendo da quantidade de dados
- **Tamanho dos arquivos:** PDF ~500KB-2MB, Excel ~100KB-1MB
- **Memória:** Pico de uso durante geração de PDF

### Limitações:
- **Dados vazios:** Relatórios gerados mesmo sem dados (valores zero)
- **Formato:** PDF sempre em A4, Excel sempre .xlsx
- **Idioma:** Interface em português brasileiro

### Segurança:
- **Autenticação:** Obrigatória via JWT
- **Filtros:** Dados filtrados por cliente automaticamente
- **Logs:** Todas as operações são logadas

---

## 🎯 Casos de Uso

1. **Relatórios Mensais:** Gerar relatórios consolidados para apresentações
2. **Análise Executiva:** Documentos para tomada de decisão
3. **Compliance:** Relatórios para auditoria e conformidade
4. **Apresentações:** Material para reuniões e stakeholders
5. **Backup:** Arquivos para arquivamento e histórico
6. **Compartilhamento:** Envio por email ou sistemas externos

---

## 🔄 Fluxo de Funcionamento

1. **Validação:** Verifica ID do cliente e autenticação
2. **Coleta:** Executa todas as consultas SQL em paralelo
3. **Processamento:** Calcula métricas e organiza dados
4. **Geração:** Cria arquivo PDF ou Excel
5. **Download:** Retorna arquivo para download direto

As APIs estão prontas para uso e fornecem relatórios executivos completos e profissionais!




