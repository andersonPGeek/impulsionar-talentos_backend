# API de Relatórios Executivos

Este documento descreve as 29 APIs de relatórios executivos criadas para fornecer métricas e KPIs abrangentes sobre o desenvolvimento de talentos na organização.

## Base URL
```
/api/relatorio-executivo
```

## Autenticação
Todas as rotas requerem autenticação via JWT token no header:
```
Authorization: Bearer <seu-token-jwt>
```

## Parâmetros
Todas as APIs recebem apenas um parâmetro obrigatório:
- `id_cliente` (path parameter): ID do cliente para filtrar os dados

---

## 📊 APIs de Visão Geral (5 APIs)

### 1. Índice de Engajamento Geral (IEG)
**GET** `/indice-engajamento-geral/:id_cliente`

Média ponderada dos pilares da Árvore da Vida.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "indice_engajamento_geral": 7.5,
    "detalhes": {
      "pontuacao_geral": 8.0,
      "criatividade_hobbie": 7.0,
      "plenitude_felicidade": 8.5,
      "espiritualidade": 6.5,
      "saude_disposicao": 7.5,
      "desenvolvimento_intelectual": 8.0,
      "equilibrio_emocional": 7.0,
      "familia": 8.0,
      "desenvolvimento_amoroso": 7.5,
      "vida_social": 7.0,
      "realizacao_proposito": 8.5,
      "recursos_financeiros": 7.0,
      "contribuicao_social": 7.5
    }
  }
}
```

### 2. Taxa de Evolução de Desenvolvimento (TED)
**GET** `/taxa-evolucao-desenvolvimento/:id_cliente`

(Atividades concluídas ÷ Atividades planejadas no PDI) × 100

**Resposta:**
```json
{
  "success": true,
  "data": {
    "taxa_evolucao_desenvolvimento": 75.5,
    "detalhes": {
      "atividades_concluidas": 151,
      "total_atividades": 200
    }
  }
}
```

### 3. Nível Médio de Reconhecimento (NMR)
**GET** `/nivel-medio-reconhecimento/:id_cliente`

Total de reconhecimentos dados + recebidos ÷ Colaboradores ativos

**Resposta:**
```json
{
  "success": true,
  "data": {
    "nivel_medio_reconhecimento": 3.2,
    "detalhes": {
      "total_reconhecimentos": 320,
      "colaboradores_ativos": 100
    }
  }
}
```

### 4. Índice de Satisfação Interna (ISI)
**GET** `/indice-satisfacao-interna/:id_cliente`

Média ponderada de feedbacks positivos no portfólio

**Resposta:**
```json
{
  "success": true,
  "data": {
    "indice_satisfacao_interna": 82.5,
    "detalhes": {
      "feedbacks_positivos": 165,
      "total_feedbacks": 200
    }
  }
}
```

### 5. Maturidade de Carreira (MC)
**GET** `/maturidade-carreira/:id_cliente`

(Metas concluídas + Evoluções de Portfólio) ÷ Tempo de casa

**Resposta:**
```json
{
  "success": true,
  "data": {
    "maturidade_carreira": 12.5,
    "detalhes": {
      "metas_concluidas": 50,
      "evolucoes_portfolio": 75,
      "tempo_medio_casa_anos": 10.0
    }
  }
}
```

---

## 🌳 APIs de Árvore da Vida (4 APIs)

### 6. Índice de Plenitude
**GET** `/indice-plenitude/:id_cliente`

Média dos pilares Plenitude, Felicidade e Realização

**Resposta:**
```json
{
  "success": true,
  "data": {
    "indice_plenitude": 8.0,
    "detalhes": {
      "plenitude_felicidade": 8.5,
      "realizacao_proposito": 7.5
    }
  }
}
```

### 7. Índice de Vitalidade
**GET** `/indice-vitalidade/:id_cliente`

Média dos pilares Saúde, Equilíbrio Emocional e Energia

**Resposta:**
```json
{
  "success": true,
  "data": {
    "indice_vitalidade": 7.3,
    "detalhes": {
      "saude_disposicao": 7.5,
      "equilibrio_emocional": 7.0,
      "energia": 7.5
    }
  }
}
```

### 8. Índice de Propósito e Contribuição
**GET** `/indice-proposito-contribuicao/:id_cliente`

Média de Espiritualidade + Contribuição Social

**Resposta:**
```json
{
  "success": true,
  "data": {
    "indice_proposito_contribuicao": 7.0,
    "detalhes": {
      "espiritualidade": 6.5,
      "contribuicao_social": 7.5
    }
  }
}
```

### 9. Índice Profissional Global
**GET** `/indice-profissional-global/:id_cliente`

Média de Profissional + Desenvolvimento Intelectual + Recursos Financeiros

**Resposta:**
```json
{
  "success": true,
  "data": {
    "indice_profissional_global": 7.7,
    "detalhes": {
      "profissional": 8.0,
      "desenvolvimento_intelectual": 8.0,
      "recursos_financeiros": 7.0
    }
  }
}
```

---

## 🔍 APIs de Análise SWOT (3 APIs)

### 10. Forças vs Fraquezas Ratio (FFR)
**GET** `/forcas-vs-fraquezas-ratio/:id_cliente`

Nº de forças ÷ Nº de fraquezas

**Resposta:**
```json
{
  "success": true,
  "data": {
    "forcas_vs_fraquezas_ratio": 1.2,
    "detalhes": {
      "total_forcas": 120,
      "total_fraquezas": 100
    }
  }
}
```

### 11. Oportunidades Aproveitadas (%)
**GET** `/oportunidades-aproveitadas/:id_cliente`

Oportunidades transformadas em ações do PDI ÷ Total de oportunidades

**Resposta:**
```json
{
  "success": true,
  "data": {
    "oportunidades_aproveitadas": 65.0,
    "detalhes": {
      "usuarios_com_oportunidades": 80,
      "usuarios_com_pdi": 52
    }
  }
}
```

### 12. Ameaças Monitoradas (%)
**GET** `/ameacas-monitoradas/:id_cliente`

Ameaças com plano mitigado ÷ Total de ameaças

**Resposta:**
```json
{
  "success": true,
  "data": {
    "ameacas_monitoradas": 45.0,
    "detalhes": {
      "total_ameacas": 60,
      "ameacas_com_plano": 27
    }
  }
}
```

---

## 📈 APIs de PDI (4 APIs)

### 13. Progresso Médio do PDI
**GET** `/progresso-medio-pdi/:id_cliente`

% de atividades concluídas

**Resposta:**
```json
{
  "success": true,
  "data": {
    "progresso_medio_pdi": 68.5,
    "detalhes": {
      "atividades_concluidas": 137,
      "total_atividades": 200
    }
  }
}
```

### 14. Taxa de Metas em Progresso
**GET** `/taxa-metas-progresso/:id_cliente`

Metas "em andamento" ÷ Total de metas

**Resposta:**
```json
{
  "success": true,
  "data": {
    "taxa_metas_progresso": 40.0,
    "detalhes": {
      "metas_em_andamento": 20,
      "total_metas": 50
    }
  }
}
```

### 15. Aderência ao Prazo
**GET** `/aderencia-prazo/:id_cliente`

Metas dentro do prazo ÷ Total de metas

**Resposta:**
```json
{
  "success": true,
  "data": {
    "aderencia_prazo": 85.0,
    "detalhes": {
      "metas_no_prazo": 42,
      "total_metas": 50
    }
  }
}
```

### 16. Engajamento com Mentoria
**GET** `/engajamento-mentoria/:id_cliente`

Participações em mentorias ÷ Colaboradores ativos

**Resposta:**
```json
{
  "success": true,
  "data": {
    "engajamento_mentoria": 30.0,
    "detalhes": {
      "usuarios_com_mentoria": 30,
      "colaboradores_ativos": 100
    }
  }
}
```

---

## 💼 APIs de Portfólio (4 APIs)

### 17. Taxa de Atualização do Portfólio
**GET** `/taxa-atualizacao-portfolio/:id_cliente`

Colaboradores com experiências registradas nos últimos 90 dias ÷ Total

**Resposta:**
```json
{
  "success": true,
  "data": {
    "taxa_atualizacao_portfolio": 60.0,
    "detalhes": {
      "usuarios_atualizados": 60,
      "total_colaboradores": 100
    }
  }
}
```

### 18. Índice de Feedbacks Positivos
**GET** `/indice-feedbacks-positivos/:id_cliente`

Feedbacks positivos ÷ Total de feedbacks

**Resposta:**
```json
{
  "success": true,
  "data": {
    "indice_feedbacks_positivos": 78.5,
    "detalhes": {
      "feedbacks_positivos": 157,
      "total_feedbacks": 200
    }
  }
}
```

### 19. Conquistas Validadas (%)
**GET** `/conquistas-validadas/:id_cliente`

Experiências com evidências comprovadas ÷ Total

**Resposta:**
```json
{
  "success": true,
  "data": {
    "conquistas_validadas": 70.0,
    "detalhes": {
      "experiencias_com_evidencias": 140,
      "total_experiencias": 200
    }
  }
}
```

### 20. Ações de Melhoria
**GET** `/acoes-melhoria/:id_cliente`

Média de ações registradas por colaborador

**Resposta:**
```json
{
  "success": true,
  "data": {
    "acoes_melhoria": 2.5,
    "detalhes": {
      "total_experiencias": 250,
      "colaboradores_ativos": 100
    }
  }
}
```

---

## 🏆 APIs de Programa de Reconhecimento (4 APIs)

### 21. Reconhecimentos por Colaborador
**GET** `/reconhecimentos-por-colaborador/:id_cliente`

Total de reconhecimentos ÷ Total de colaboradores

**Resposta:**
```json
{
  "success": true,
  "data": {
    "reconhecimentos_por_colaborador": 3.2,
    "detalhes": {
      "total_reconhecimentos": 320,
      "total_colaboradores": 100
    }
  }
}
```

### 22. Top Skills Reconhecidas
**GET** `/top-skills-reconhecidas/:id_cliente`

Habilidades mais citadas nos reconhecimentos

**Resposta:**
```json
{
  "success": true,
  "data": {
    "top_skills_reconhecidas": [
      {
        "skill": "Liderança",
        "frequencia": 45
      },
      {
        "skill": "Comunicação",
        "frequencia": 38
      },
      {
        "skill": "Trabalho em equipe",
        "frequencia": 32
      }
    ]
  }
}
```

### 23. Tempo Médio entre Reconhecimentos
**GET** `/tempo-medio-entre-reconhecimentos/:id_cliente`

Dias médios entre reconhecimentos por colaborador

**Resposta:**
```json
{
  "success": true,
  "data": {
    "tempo_medio_entre_reconhecimentos": 45.5
  }
}
```

### 24. Distribuição de Reconhecimento por Área
**GET** `/distribuicao-reconhecimento-por-area/:id_cliente`

Percentual por departamento

**Resposta:**
```json
{
  "success": true,
  "data": {
    "distribuicao_reconhecimento_por_area": [
      {
        "departamento": "Tecnologia",
        "total_reconhecimentos": 120,
        "colaboradores_departamento": 40,
        "percentual": 37.5
      },
      {
        "departamento": "Vendas",
        "total_reconhecimentos": 80,
        "colaboradores_departamento": 30,
        "percentual": 25.0
      }
    ]
  }
}
```

---

## 📊 KPIs de Tendência (3 APIs)

### 25. Índice de Reconhecimento Recíproco
**GET** `/indice-reconhecimento-reciproco/:id_cliente`

Reconhecimentos dados e recebidos por par

**Resposta:**
```json
{
  "success": true,
  "data": {
    "indice_reconhecimento_reciproco": 35.0,
    "detalhes": {
      "pares_reciprocos": 35,
      "total_pares": 100
    }
  }
}
```

### 26. Índice de Bem-Estar Organizacional
**GET** `/indice-bem-estar-organizacional/:id_cliente`

Média de Plenitude + Saúde + Equilíbrio emocional

**Resposta:**
```json
{
  "success": true,
  "data": {
    "indice_bem_estar_organizacional": 7.5,
    "detalhes": {
      "plenitude_felicidade": 8.0,
      "saude_disposicao": 7.5,
      "equilibrio_emocional": 7.0
    }
  }
}
```

### 27. Tempo Médio de Evolução de Meta
**GET** `/tempo-medio-evolucao-meta/:id_cliente`

Dias até conclusão de metas

**Resposta:**
```json
{
  "success": true,
  "data": {
    "tempo_medio_evolucao_meta": 90.5
  }
}
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
  "message": "Erro interno do servidor",
  "error": "Detalhes do erro (apenas em desenvolvimento)"
}
```

---

## 📝 Notas Importantes

1. **Filtros por Cliente**: Todas as APIs filtram dados apenas do cliente especificado no parâmetro `id_cliente`.

2. **Cálculos**: Os cálculos são feitos em tempo real com base nos dados atuais do banco de dados.

3. **Performance**: Para melhor performance, considere implementar cache para consultas frequentes.

4. **Dados Vazios**: Quando não há dados, as APIs retornam valores zero ao invés de erro.

5. **Precisão**: Valores percentuais são arredondados para 2 casas decimais.

6. **Colaboradores Ativos**: Apenas usuários com status 'ativo' são considerados nos cálculos.

---

## 🔧 Exemplos de Uso

### cURL
```bash
# Obter índice de engajamento geral
curl -X GET \
  http://localhost:3000/api/relatorio-executivo/indice-engajamento-geral/1 \
  -H "Authorization: Bearer SEU_TOKEN_JWT"

# Obter top skills reconhecidas
curl -X GET \
  http://localhost:3000/api/relatorio-executivo/top-skills-reconhecidas/1 \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### JavaScript (Fetch)
```javascript
const response = await fetch('/api/relatorio-executivo/indice-engajamento-geral/1', {
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_JWT'
  }
});

const data = await response.json();
console.log(data);
```





