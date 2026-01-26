# 🎨 Exemplos de Integração Frontend - Relatórios Executivos

Este documento fornece exemplos práticos de como integrar os novos endpoints de relatórios no frontend.

---

## 📋 Índice

1. [React com Axios](#react-com-axios)
2. [Vue.js com Fetch](#vuejs-com-fetch)
3. [JavaScript Vanilla](#javascript-vanilla)
4. [HTML/CSS para Visualização](#htmlcss-para-visualização)
5. [Angular com HttpClient](#angular-com-httpclient)

---

## React com Axios

### Instalação
```bash
npm install axios
```

### Hook Custom para Relatórios
```javascript
import { useState, useCallback } from 'react';
import axios from 'axios';

export const useRelatorioExecutivo = (idCliente, token) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Buscar relatório JSON
  const buscarRelatorio = useCallback(async (periodo = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `/api/relatorio-executivo/${idCliente}${periodo ? `?periodo=${periodo}` : ''}`;
      const response = await axios.get(url, { headers });
      setData(response.data.data);
      return response.data.data;
    } catch (err) {
      const mensagem = err.response?.data?.message || 'Erro ao buscar relatório';
      setError(mensagem);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [idCliente, headers]);

  // Baixar PDF
  const baixarPDF = useCallback(async (periodo = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `/api/relatorio-executivo/gerar-pdf/${idCliente}${periodo ? `?periodo=${periodo}` : ''}`;
      const response = await axios.get(url, {
        headers,
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `relatorio-executivo-${idCliente}-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (err) {
      setError('Erro ao gerar PDF');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [idCliente, headers]);

  // Baixar Excel
  const baixarExcel = useCallback(async (periodo = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `/api/relatorio-executivo/gerar-excel/${idCliente}${periodo ? `?periodo=${periodo}` : ''}`;
      const response = await axios.get(url, {
        headers,
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `relatorio-executivo-${idCliente}-${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (err) {
      setError('Erro ao gerar Excel');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [idCliente, headers]);

  return {
    data,
    loading,
    error,
    buscarRelatorio,
    baixarPDF,
    baixarExcel
  };
};
```

### Componente React
```javascript
import React, { useState } from 'react';
import { useRelatorioExecutivo } from './hooks/useRelatorioExecutivo';

export const RelatorioExecutivoPage = ({ idCliente, token }) => {
  const [periodo, setPeriodo] = useState(null);
  const { data, loading, error, buscarRelatorio, baixarPDF, baixarExcel } = useRelatorioExecutivo(idCliente, token);

  const handleBuscar = async () => {
    await buscarRelatorio(periodo);
  };

  const handleBaixarPDF = async () => {
    await baixarPDF(periodo);
  };

  const handleBaixarExcel = async () => {
    await baixarExcel(periodo);
  };

  return (
    <div className="relatorio-container">
      <h1>📊 Relatório Executivo</h1>
      
      <div className="filtros">
        <select value={periodo || ''} onChange={(e) => setPeriodo(e.target.value || null)}>
          <option value="">Histórico Completo</option>
          <option value="ultimo_mes">Último Mês</option>
          <option value="ultimo_trimestre">Último Trimestre</option>
          <option value="ultimo_semestre">Último Semestre</option>
          <option value="ultimo_ano">Último Ano</option>
        </select>
      </div>

      <div className="acoes">
        <button onClick={handleBuscar} disabled={loading}>
          {loading ? '⏳ Carregando...' : '📋 Ver Relatório'}
        </button>
        <button onClick={handleBaixarPDF} disabled={loading}>
          {loading ? '⏳ Gerando...' : '📄 Baixar PDF'}
        </button>
        <button onClick={handleBaixarExcel} disabled={loading}>
          {loading ? '⏳ Gerando...' : '📊 Baixar Excel'}
        </button>
      </div>

      {error && <div className="erro">{error}</div>}

      {data && (
        <div className="relatorio-dados">
          <section>
            <h2>📈 Visão Geral</h2>
            <div className="metricas-grid">
              <div className="metrica">
                <span className="label">Engajamento Geral:</span>
                <span className="valor">{data.visao_geral.indice_engajamento_geral}</span>
              </div>
              <div className="metrica">
                <span className="label">Evolução Desenvolvimento:</span>
                <span className="valor">{data.visao_geral.taxa_evolucao_desenvolvimento}%</span>
              </div>
              <div className="metrica">
                <span className="label">Reconhecimento Médio:</span>
                <span className="valor">{data.visao_geral.nivel_medio_reconhecimento}</span>
              </div>
              <div className="metrica">
                <span className="label">Satisfação Interna:</span>
                <span className="valor">{data.visao_geral.indice_satisfacao_interna}%</span>
              </div>
            </div>
          </section>

          <section>
            <h2>🌳 Bem-Estar Emocional</h2>
            <div className="bem-estar-stats">
              <div className="stat">
                <span className="label">Total de Check-ins:</span>
                <span className="valor">{data.bem_estar_emocional.checkin_emocional.total_checkins}</span>
              </div>
              <div className="stat">
                <span className="label">Média de Bem-Estar:</span>
                <span className="valor">{data.bem_estar_emocional.checkin_emocional.media_nota_bem_estar}/5</span>
              </div>
              <div className="stat">
                <span className="label">Ações Concluídas:</span>
                <span className="valor">{data.bem_estar_emocional.acoes_bem_estar.acoes_concluidas}/{data.bem_estar_emocional.acoes_bem_estar.total_acoes}</span>
              </div>
            </div>
          </section>

          <section>
            <h2>⏱️ Período do Relatório</h2>
            <p>Gerado em: {data.data_geracao}</p>
            <p>Período: {data.periodo_filtro}</p>
          </section>
        </div>
      )}
    </div>
  );
};
```

### CSS Estilo
```css
.relatorio-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.filtros {
  margin: 20px 0;
}

.filtros select {
  padding: 10px 15px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 16px;
}

.acoes {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.acoes button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.acoes button:hover {
  background-color: #0056b3;
}

.acoes button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.metricas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.metrica {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.metrica .label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #666;
}

.metrica .valor {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.erro {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px;
  border-radius: 5px;
  margin: 20px 0;
}
```

---

## Vue.js com Fetch

### Componente Vue 3
```vue
<template>
  <div class="relatorio-container">
    <h1>📊 Relatório Executivo</h1>
    
    <div class="filtros">
      <select v-model="periodo">
        <option value="">Histórico Completo</option>
        <option value="ultimo_mes">Último Mês</option>
        <option value="ultimo_trimestre">Último Trimestre</option>
        <option value="ultimo_semestre">Último Semestre</option>
        <option value="ultimo_ano">Último Ano</option>
      </select>
    </div>

    <div class="acoes">
      <button @click="buscarRelatorio" :disabled="loading">
        {{ loading ? '⏳ Carregando...' : '📋 Ver Relatório' }}
      </button>
      <button @click="baixarPDF" :disabled="loading">
        {{ loading ? '⏳ Gerando...' : '📄 Baixar PDF' }}
      </button>
      <button @click="baixarExcel" :disabled="loading">
        {{ loading ? '⏳ Gerando...' : '📊 Baixar Excel' }}
      </button>
    </div>

    <div v-if="error" class="erro">{{ error }}</div>

    <div v-if="relatorio" class="relatorio-dados">
      <section>
        <h2>📈 Visão Geral</h2>
        <div class="metricas-grid">
          <div class="metrica">
            <span class="label">Engajamento Geral:</span>
            <span class="valor">{{ relatorio.visao_geral.indice_engajamento_geral }}</span>
          </div>
          <div class="metrica">
            <span class="label">Evolução Desenvolvimento:</span>
            <span class="valor">{{ relatorio.visao_geral.taxa_evolucao_desenvolvimento }}%</span>
          </div>
          <div class="metrica">
            <span class="label">Reconhecimento Médio:</span>
            <span class="valor">{{ relatorio.visao_geral.nivel_medio_reconhecimento }}</span>
          </div>
          <div class="metrica">
            <span class="label">Satisfação Interna:</span>
            <span class="valor">{{ relatorio.visao_geral.indice_satisfacao_interna }}%</span>
          </div>
        </div>
      </section>

      <section>
        <h2>🌳 Bem-Estar Emocional</h2>
        <div class="bem-estar-stats">
          <div class="stat">
            <span class="label">Total de Check-ins:</span>
            <span class="valor">{{ relatorio.bem_estar_emocional.checkin_emocional.total_checkins }}</span>
          </div>
          <div class="stat">
            <span class="label">Média de Bem-Estar:</span>
            <span class="valor">{{ relatorio.bem_estar_emocional.checkin_emocional.media_nota_bem_estar }}/5</span>
          </div>
          <div class="stat">
            <span class="label">Ações Concluídas:</span>
            <span class="valor">{{ relatorio.bem_estar_emocional.acoes_bem_estar.acoes_concluidas }}/{{ relatorio.bem_estar_emocional.acoes_bem_estar.total_acoes }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  idCliente: Number,
  token: String
});

const loading = ref(false);
const error = ref(null);
const relatorio = ref(null);
const periodo = ref('');

const headers = {
  'Authorization': `Bearer ${props.token}`,
  'Content-Type': 'application/json'
};

const buscarRelatorio = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const url = `/api/relatorio-executivo/${props.idCliente}${periodo.value ? `?periodo=${periodo.value}` : ''}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) throw new Error('Erro ao buscar relatório');
    
    const data = await response.json();
    relatorio.value = data.data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const baixarPDF = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const url = `/api/relatorio-executivo/gerar-pdf/${props.idCliente}${periodo.value ? `?periodo=${periodo.value}` : ''}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) throw new Error('Erro ao gerar PDF');
    
    const blob = await response.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = `relatorio-executivo-${props.idCliente}-${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlBlob);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const baixarExcel = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const url = `/api/relatorio-executivo/gerar-excel/${props.idCliente}${periodo.value ? `?periodo=${periodo.value}` : ''}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) throw new Error('Erro ao gerar Excel');
    
    const blob = await response.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = `relatorio-executivo-${props.idCliente}-${new Date().getTime()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlBlob);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.relatorio-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.filtros {
  margin: 20px 0;
}

.filtros select {
  padding: 10px 15px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 16px;
}

.acoes {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.acoes button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.acoes button:hover {
  background-color: #0056b3;
}

.acoes button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.metricas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.metrica {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.metrica .label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #666;
}

.metrica .valor {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.erro {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px;
  border-radius: 5px;
  margin: 20px 0;
}
</style>
```

---

## JavaScript Vanilla

### Classe para Gerenciar Relatórios
```javascript
class RelatorioExecutivoAPI {
  constructor(idCliente, token, baseURL = '/api') {
    this.idCliente = idCliente;
    this.token = token;
    this.baseURL = baseURL;
    this.headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Buscar relatório JSON
  async buscarRelatorio(periodo = null) {
    const url = `${this.baseURL}/relatorio-executivo/${this.idCliente}${periodo ? `?periodo=${periodo}` : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) throw new Error('Erro ao buscar relatório');
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      throw error;
    }
  }

  // Baixar PDF
  async baixarPDF(periodo = null) {
    const url = `${this.baseURL}/relatorio-executivo/gerar-pdf/${this.idCliente}${periodo ? `?periodo=${periodo}` : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) throw new Error('Erro ao gerar PDF');
      
      const blob = await response.blob();
      this.downloadFile(blob, 'relatorio-executivo.pdf', 'application/pdf');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      throw error;
    }
  }

  // Baixar Excel
  async baixarExcel(periodo = null) {
    const url = `${this.baseURL}/relatorio-executivo/gerar-excel/${this.idCliente}${periodo ? `?periodo=${periodo}` : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) throw new Error('Erro ao gerar Excel');
      
      const blob = await response.blob();
      this.downloadFile(blob, 'relatorio-executivo.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } catch (error) {
      console.error('Erro ao baixar Excel:', error);
      throw error;
    }
  }

  // Helper para download de arquivos
  downloadFile(blob, filename, mimeType) {
    const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Uso
const api = new RelatorioExecutivoAPI(1, 'seu-token-jwt');

// Buscar relatório
api.buscarRelatorio('ultimo_mes').then(data => {
  console.log('Relatório:', data);
});

// Baixar PDF
document.getElementById('btn-pdf').addEventListener('click', () => {
  api.baixarPDF('ultimo_trimestre');
});

// Baixar Excel
document.getElementById('btn-excel').addEventListener('click', () => {
  api.baixarExcel('ultimo_ano');
});
```

---

## HTML/CSS para Visualização

### HTML Estático
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Executivo</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório Executivo - Impulsionar Talentos</h1>
      <p class="subtitle">Dashboard de KPIs e Métricas de Desenvolvimento</p>
    </div>

    <div class="controles">
      <div class="filtro-grupo">
        <label for="periodo">Período:</label>
        <select id="periodo">
          <option value="">Histórico Completo</option>
          <option value="ultimo_mes">Último Mês</option>
          <option value="ultimo_trimestre">Último Trimestre</option>
          <option value="ultimo_semestre">Último Semestre</option>
          <option value="ultimo_ano">Último Ano</option>
        </select>
      </div>

      <div class="botoes-acao">
        <button id="btn-ver" class="btn btn-primario">📋 Ver Relatório</button>
        <button id="btn-pdf" class="btn btn-secundario">📄 Baixar PDF</button>
        <button id="btn-excel" class="btn btn-terciario">📊 Baixar Excel</button>
      </div>
    </div>

    <div id="carregamento" class="carregamento" style="display: none;">
      <div class="spinner"></div>
      <p>Carregando...</p>
    </div>

    <div id="erro" class="erro" style="display: none;"></div>

    <div id="relatorio-container" class="relatorio-container">
      <!-- Conteúdo será inserido aqui -->
    </div>
  </div>

  <script src="relatorio-api.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

### CSS Avançado (styles.css)
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  text-align: center;
}

.header h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.header .subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.controles {
  padding: 20px 40px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filtro-grupo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filtro-grupo label {
  font-weight: 600;
  color: #333;
}

.filtro-grupo select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  min-width: 200px;
}

.botoes-acao {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primario {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primario:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secundario {
  background-color: #28a745;
  color: white;
}

.btn-secundario:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
}

.btn-terciario {
  background-color: #007bff;
  color: white;
}

.btn-terciario:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.carregamento {
  padding: 40px;
  text-align: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.erro {
  padding: 20px 40px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  color: #721c24;
  margin: 20px 40px;
}

.relatorio-container {
  padding: 40px;
}

.secao {
  margin-bottom: 40px;
}

.secao h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.metricas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.card-metrica {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-metrica:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.card-metrica .label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  font-size: 14px;
}

.card-metrica .valor {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
}

.tabela {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.tabela thead {
  background: #f8f9fa;
}

.tabela th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #dee2e6;
}

.tabela td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
}

.tabela tbody tr:hover {
  background: #f8f9fa;
}

.rodape {
  padding: 20px 40px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  text-align: center;
  color: #666;
  font-size: 14px;
}
```

### JavaScript Integrado (app.js)
```javascript
class RelatorioUI {
  constructor(idCliente, token) {
    this.api = new RelatorioExecutivoAPI(idCliente, token);
    this.periodo = null;
    this.setup();
  }

  setup() {
    // Elementos
    this.periodoSelect = document.getElementById('periodo');
    this.btnVer = document.getElementById('btn-ver');
    this.btnPdf = document.getElementById('btn-pdf');
    this.btnExcel = document.getElementById('btn-excel');
    this.carregamento = document.getElementById('carregamento');
    this.erro = document.getElementById('erro');
    this.container = document.getElementById('relatorio-container');

    // Event listeners
    this.btnVer.addEventListener('click', () => this.buscarRelatorio());
    this.btnPdf.addEventListener('click', () => this.baixarPDF());
    this.btnExcel.addEventListener('click', () => this.baixarExcel());
    this.periodoSelect.addEventListener('change', (e) => {
      this.periodo = e.target.value || null;
    });
  }

  mostrarCarregamento(visible = true) {
    this.carregamento.style.display = visible ? 'block' : 'none';
    [this.btnVer, this.btnPdf, this.btnExcel].forEach(btn => {
      btn.disabled = visible;
    });
  }

  mostrarErro(mensagem) {
    this.erro.textContent = mensagem;
    this.erro.style.display = 'block';
    setTimeout(() => {
      this.erro.style.display = 'none';
    }, 5000);
  }

  async buscarRelatorio() {
    this.mostrarCarregamento();
    try {
      const dados = await this.api.buscarRelatorio(this.periodo);
      this.renderizarRelatorio(dados);
    } catch (error) {
      this.mostrarErro('Erro ao carregar relatório');
    } finally {
      this.mostrarCarregamento(false);
    }
  }

  async baixarPDF() {
    this.mostrarCarregamento();
    try {
      await this.api.baixarPDF(this.periodo);
    } catch (error) {
      this.mostrarErro('Erro ao gerar PDF');
    } finally {
      this.mostrarCarregamento(false);
    }
  }

  async baixarExcel() {
    this.mostrarCarregamento();
    try {
      await this.api.baixarExcel(this.periodo);
    } catch (error) {
      this.mostrarErro('Erro ao gerar Excel');
    } finally {
      this.mostrarCarregamento(false);
    }
  }

  renderizarRelatorio(dados) {
    const html = `
      <div class="secao">
        <h2>📈 Visão Geral</h2>
        <div class="metricas-grid">
          ${this.criarCard('Engajamento Geral', dados.visao_geral.indice_engajamento_geral)}
          ${this.criarCard('Evolução Desenvolvimento', dados.visao_geral.taxa_evolucao_desenvolvimento + '%')}
          ${this.criarCard('Reconhecimento Médio', dados.visao_geral.nivel_medio_reconhecimento)}
          ${this.criarCard('Satisfação Interna', dados.visao_geral.indice_satisfacao_interna + '%')}
        </div>
      </div>

      <div class="secao">
        <h2>🌳 Bem-Estar Emocional</h2>
        <div class="metricas-grid">
          ${this.criarCard('Total Check-ins', dados.bem_estar_emocional.checkin_emocional.total_checkins)}
          ${this.criarCard('Média Bem-Estar', dados.bem_estar_emocional.checkin_emocional.media_nota_bem_estar + '/5')}
          ${this.criarCard('Ações Concluídas', dados.bem_estar_emocional.acoes_bem_estar.acoes_concluidas + '/' + dados.bem_estar_emocional.acoes_bem_estar.total_acoes)}
          ${this.criarCard('Taxa Conclusão', dados.bem_estar_emocional.acoes_bem_estar.percentual_conclusao + '%')}
        </div>
      </div>

      <div class="rodape">
        <p>Relatório gerado em: ${dados.data_geracao}</p>
        <p>Período: ${dados.periodo_filtro}</p>
      </div>
    `;

    this.container.innerHTML = html;
  }

  criarCard(label, valor) {
    return `
      <div class="card-metrica">
        <span class="label">${label}</span>
        <span class="valor">${valor}</span>
      </div>
    `;
  }
}

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Obter token do localStorage ou variável global
  const token = localStorage.getItem('token') || window.TOKEN;
  const idCliente = window.ID_CLIENTE || 1;

  new RelatorioUI(idCliente, token);
});
```

---

## Angular com HttpClient

### Serviço Angular
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelatorioExecutivoService {
  private apiUrl = '/api/relatorio-executivo';

  constructor(private http: HttpClient) {}

  buscarRelatorio(idCliente: number, periodo?: string): Observable<any> {
    let url = `${this.apiUrl}/${idCliente}`;
    if (periodo) {
      url += `?periodo=${periodo}`;
    }
    return this.http.get<any>(url);
  }

  gerarPDF(idCliente: number, periodo?: string): Observable<Blob> {
    let url = `${this.apiUrl}/gerar-pdf/${idCliente}`;
    if (periodo) {
      url += `?periodo=${periodo}`;
    }
    return this.http.get(url, { responseType: 'blob' });
  }

  gerarExcel(idCliente: number, periodo?: string): Observable<Blob> {
    let url = `${this.apiUrl}/gerar-excel/${idCliente}`;
    if (periodo) {
      url += `?periodo=${periodo}`;
    }
    return this.http.get(url, { responseType: 'blob' });
  }

  downloadArquivo(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
```

### Componente Angular
```typescript
import { Component, OnInit } from '@angular/core';
import { RelatorioExecutivoService } from './services/relatorio-executivo.service';

@Component({
  selector: 'app-relatorio-executivo',
  templateUrl: './relatorio-executivo.component.html',
  styleUrls: ['./relatorio-executivo.component.css']
})
export class RelatorioExecutivoComponent implements OnInit {
  relatorio: any = null;
  loading = false;
  error: string | null = null;
  periodo: string = '';
  idCliente = 1;

  constructor(private relatorioService: RelatorioExecutivoService) {}

  ngOnInit() {}

  buscarRelatorio() {
    this.loading = true;
    this.error = null;

    this.relatorioService.buscarRelatorio(this.idCliente, this.periodo || undefined)
      .subscribe({
        next: (response) => {
          this.relatorio = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao buscar relatório';
          this.loading = false;
        }
      });
  }

  baixarPDF() {
    this.loading = true;
    this.error = null;

    this.relatorioService.gerarPDF(this.idCliente, this.periodo || undefined)
      .subscribe({
        next: (blob) => {
          this.relatorioService.downloadArquivo(blob, `relatorio-executivo-${this.idCliente}.pdf`);
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao gerar PDF';
          this.loading = false;
        }
      });
  }

  baixarExcel() {
    this.loading = true;
    this.error = null;

    this.relatorioService.gerarExcel(this.idCliente, this.periodo || undefined)
      .subscribe({
        next: (blob) => {
          this.relatorioService.downloadArquivo(blob, `relatorio-executivo-${this.idCliente}.xlsx`);
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao gerar Excel';
          this.loading = false;
        }
      });
  }
}
```

### Template Angular
```html
<div class="relatorio-container">
  <h1>📊 Relatório Executivo</h1>
  
  <div class="controles">
    <select [(ngModel)]="periodo">
      <option value="">Histórico Completo</option>
      <option value="ultimo_mes">Último Mês</option>
      <option value="ultimo_trimestre">Último Trimestre</option>
      <option value="ultimo_semestre">Último Semestre</option>
      <option value="ultimo_ano">Último Ano</option>
    </select>

    <button (click)="buscarRelatorio()" [disabled]="loading">
      {{ loading ? '⏳ Carregando...' : '📋 Ver Relatório' }}
    </button>
    <button (click)="baixarPDF()" [disabled]="loading">
      {{ loading ? '⏳ Gerando...' : '📄 Baixar PDF' }}
    </button>
    <button (click)="baixarExcel()" [disabled]="loading">
      {{ loading ? '⏳ Gerando...' : '📊 Baixar Excel' }}
    </button>
  </div>

  <div *ngIf="error" class="erro">{{ error }}</div>

  <div *ngIf="relatorio" class="relatorio-dados">
    <section>
      <h2>📈 Visão Geral</h2>
      <div class="metricas">
        <div class="metrica">
          <span>Engajamento Geral</span>
          <strong>{{ relatorio.visao_geral.indice_engajamento_geral }}</strong>
        </div>
        <div class="metrica">
          <span>Evolução Desenvolvimento</span>
          <strong>{{ relatorio.visao_geral.taxa_evolucao_desenvolvimento }}%</strong>
        </div>
        <div class="metrica">
          <span>Reconhecimento Médio</span>
          <strong>{{ relatorio.visao_geral.nivel_medio_reconhecimento }}</strong>
        </div>
        <div class="metrica">
          <span>Satisfação Interna</span>
          <strong>{{ relatorio.visao_geral.indice_satisfacao_interna }}%</strong>
        </div>
      </div>
    </section>

    <section>
      <h2>🌳 Bem-Estar Emocional</h2>
      <div class="metricas">
        <div class="metrica">
          <span>Total Check-ins</span>
          <strong>{{ relatorio.bem_estar_emocional.checkin_emocional.total_checkins }}</strong>
        </div>
        <div class="metrica">
          <span>Média Bem-Estar</span>
          <strong>{{ relatorio.bem_estar_emocional.checkin_emocional.media_nota_bem_estar }}/5</strong>
        </div>
        <div class="metrica">
          <span>Ações Concluídas</span>
          <strong>{{ relatorio.bem_estar_emocional.acoes_bem_estar.acoes_concluidas }}/{{ relatorio.bem_estar_emocional.acoes_bem_estar.total_acoes }}</strong>
        </div>
      </div>
    </section>

    <footer>
      <p>Gerado em: {{ relatorio.data_geracao }}</p>
      <p>Período: {{ relatorio.periodo_filtro }}</p>
    </footer>
  </div>
</div>
```

---

## 📞 Suporte

Para dúvidas ou problemas na integração, consulte:
- Documentação da API: `documentacao/RELATORIO_EXECUTIVO_API.md`
- Arquivo de atualizações: `ATUALIZACOES_RELATORIO_EXECUTIVO.md`

---

**Última atualização:** 11/01/2026
