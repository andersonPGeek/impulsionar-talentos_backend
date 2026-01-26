# Documentação - APIs de Bem-Estar Emocional

## 📊 Estrutura JSON - Após Modificações

---

## 1️⃣ **API: Dashboard de RH**
**Endpoint:** `GET /api/dashboard/rh`

### JSON de Resposta Completo:

```json
{
  "success": true,
  "message": "Dashboard de RH buscado com sucesso",
  "data": {
    "total_colaboradores": 150,
    "gestores_ativos": 12,
    "metas_concluidas": 45,
    "metas_abertas": 85,
    "metas_departamento": [
      {
        "departamento": "Recursos Humanos",
        "progresso_das_metas": "60% (18/30)"
      },
      {
        "departamento": "Tecnologia",
        "progresso_das_metas": "50% (15/30)"
      },
      {
        "departamento": "Financeiro",
        "progresso_das_metas": "70% (21/30)"
      }
    ],
    "metas_gestor": [
      {
        "gestor": "João Silva",
        "progresso_das_metas": "65% (13/20)"
      },
      {
        "gestor": "Maria Santos",
        "progresso_das_metas": "75% (15/20)"
      }
    ],
    "bem_estar_emocional": {
      "total_checkins": 450,
      "media_nota_bem_estar": 3.75,
      "checkins_agrupados_por_nota": {
        "nota_1": 25,
        "nota_2": 50,
        "nota_3": 100,
        "nota_4": 150,
        "nota_5": 125
      },
      "checkins_agrupados_por_categoria": [
        {
          "categoria": "Estresse no trabalho",
          "quantidade": 85
        },
        {
          "categoria": "Problemas pessoais",
          "quantidade": 60
        },
        {
          "categoria": "Falta de motivação",
          "quantidade": 45
        },
        {
          "categoria": "Saúde",
          "quantidade": 30
        },
        {
          "categoria": "Problemas familiares",
          "quantidade": 25
        }
      ]
    },
    "acoes_bem_estar": {
      "total_acoes": 150,
      "acoes_pendentes": 45,
      "acoes_em_progresso": 30,
      "acoes_concluidas": 70,
      "acoes_canceladas": 5,
      "acoes_agrupadas_por_tipo": [
        {
          "tipo_acao": "Mentoria",
          "quantidade": 45
        },
        {
          "tipo_acao": "Aconselhamento profissional",
          "quantidade": 40
        },
        {
          "tipo_acao": "Flexibilidade de horário",
          "quantidade": 35
        },
        {
          "tipo_acao": "Programa de bem-estar",
          "quantidade": 30
        }
      ],
      "acoes_agrupadas_por_prioridade": [
        {
          "prioridade": "alta",
          "quantidade": 50
        },
        {
          "prioridade": "normal",
          "quantidade": 80
        },
        {
          "prioridade": "baixa",
          "quantidade": 20
        }
      ],
      "acoes_agrupadas_por_status": [
        {
          "status": "cancelada",
          "quantidade": 5
        },
        {
          "status": "concluida",
          "quantidade": 70
        },
        {
          "status": "em_progresso",
          "quantidade": 30
        },
        {
          "status": "pendente",
          "quantidade": 45
        }
      ]
    }
  }
}
```

---

## 2️⃣ **API: Relatório Executivo**
**Endpoint:** `GET /api/relatorio-executivo/relatorio-completo/:id_cliente`

### JSON de Resposta Completo (coletarTodosOsDados):

```json
{
  "visao_geral": {
    "indice_engajamento_geral": 7.25,
    "taxa_evolucao_desenvolvimento": 68.5,
    "nivel_medio_reconhecimento": 3.2,
    "indice_satisfacao_interna": 82.5,
    "maturidade_carreira": 4.8
  },
  "arvore_da_vida": {
    "indice_plenitude": 7.1,
    "indice_vitalidade": 6.8,
    "indice_proposito_contribuicao": 7.5,
    "indice_profissional_global": 7.3
  },
  "analise_swot": {
    "total_forcas": 450,
    "total_fraquezas": 280,
    "total_oportunidades": 320,
    "total_ameacas": 150
  },
  "pdi": {
    "progresso_medio": 65.3,
    "taxa_metas_progresso": 72.5,
    "aderencia_prazo": 81.2,
    "engajamento_mentoria": 68.9
  },
  "portfolio": {
    "taxa_atualizacao": 75.4,
    "indice_feedbacks_positivos": 88.5,
    "conquistas_validadas": 125,
    "acoes_melhoria": 45
  },
  "reconhecimento": {
    "reconhecimentos_por_colaborador": 3.5,
    "top_skills_reconhecidas": [
      {
        "skill": "Liderança",
        "quantidade": 85
      },
      {
        "skill": "Inovação",
        "quantidade": 72
      },
      {
        "skill": "Colaboração",
        "quantidade": 68
      }
    ],
    "tempo_medio_entre_reconhecimentos": 12.5,
    "distribuicao_por_area": [
      {
        "area": "Tecnologia",
        "quantidade": 95
      },
      {
        "area": "Recursos Humanos",
        "quantidade": 78
      },
      {
        "area": "Financeiro",
        "quantidade": 65
      }
    ]
  },
  "tendencia": {
    "indice_reconhecimento_reciproco": 4.2,
    "indice_bem_estar_organizacional": 7.6,
    "tempo_medio_evolucao_meta": 5.8
  },
  "bem_estar_emocional": {
    "checkin_emocional": {
      "total_checkins": 520,
      "media_nota_bem_estar": 3.82,
      "distribuicao_por_nota": {
        "nota_1": 28,
        "nota_2": 58,
        "nota_3": 115,
        "nota_4": 175,
        "nota_5": 144
      },
      "categorias_motivo": [
        {
          "categoria": "Estresse no trabalho",
          "quantidade": 98
        },
        {
          "categoria": "Problemas pessoais",
          "quantidade": 72
        },
        {
          "categoria": "Falta de motivação",
          "quantidade": 55
        },
        {
          "categoria": "Saúde",
          "quantidade": 38
        },
        {
          "categoria": "Problemas familiares",
          "quantidade": 32
        },
        {
          "categoria": "Conflitos interpessoais",
          "quantidade": 22
        }
      ]
    },
    "acoes_bem_estar": {
      "total_acoes": 185,
      "acoes_pendentes": 52,
      "acoes_em_progresso": 38,
      "acoes_concluidas": 88,
      "acoes_canceladas": 7,
      "percentual_conclusao": 47.57,
      "acoes_por_tipo": [
        {
          "tipo_acao": "Mentoria",
          "quantidade": 55
        },
        {
          "tipo_acao": "Aconselhamento profissional",
          "quantidade": 48
        },
        {
          "tipo_acao": "Flexibilidade de horário",
          "quantidade": 42
        },
        {
          "tipo_acao": "Programa de bem-estar",
          "quantidade": 40
        }
      ],
      "acoes_por_prioridade": [
        {
          "prioridade": "alta",
          "quantidade": 65
        },
        {
          "prioridade": "normal",
          "quantidade": 95
        },
        {
          "prioridade": "baixa",
          "quantidade": 25
        }
      ]
    }
  },
  "data_geracao": "11/01/2026 14:35:42",
  "id_cliente": 1
}
```

---

## 📈 **Big Numbers - Saúde Emocional**

### Métricas Principais para Dashboard/Relatório:

| Métrica | Valor | Descrição |
|---------|-------|-----------|
| **Total de Check-ins** | 450+ | Quantidade total de registros de bem-estar |
| **Média de Bem-estar** | 3.75 | Escala 1-5 (ideal: acima de 3.5) |
| **Taxa de Notas Altas (4-5)** | 61% | Colaboradores com bem-estar elevado |
| **Taxa de Notas Baixas (1-2)** | 17% | Colaboradores que precisam de suporte |
| **Total de Ações** | 150 | Ações de bem-estar criadas |
| **Taxa de Conclusão de Ações** | 47% | Ações de bem-estar já concluídas |
| **Ações Pendentes** | 45 | Ações que aguardam implementação |
| **Principais Categorias** | 5 | Principais motivos de desconforto |

---

## 🔄 **Comparação Antes vs Depois**

### Dashboard RH - Antes:
```json
{
  "total_colaboradores": 150,
  "gestores_ativos": 12,
  "metas_concluidas": 45,
  "metas_abertas": 85,
  "metas_departamento": [...],
  "metas_gestor": [...]
}
```

### Dashboard RH - Depois:
```json
{
  "total_colaboradores": 150,
  "gestores_ativos": 12,
  "metas_concluidas": 45,
  "metas_abertas": 85,
  "metas_departamento": [...],
  "metas_gestor": [...],
  "bem_estar_emocional": { ... },      // ✨ NOVO
  "acoes_bem_estar": { ... }            // ✨ NOVO
}
```

---

## 🎯 **Informações Disponíveis para Análise**

### Bem-Estar Emocional (checkin_emocional):
✅ Total de check-ins realizados  
✅ Média de nota de bem-estar (1-5)  
✅ Distribuição por nota (quantidade de pessoas em cada nível)  
✅ Agrupamento por categoria de motivo (estresse, saúde, família, etc.)  

### Ações de Bem-Estar (checkin_acao):
✅ Total de ações criadas  
✅ Status das ações (pendente, em progresso, concluída, cancelada)  
✅ Prioridade das ações (alta, normal, baixa)  
✅ Tipo de ação (mentoria, aconselhamento, flexibilidade, programa)  
✅ Percentual de conclusão de ações  

---

## 💡 **Casos de Uso**

### 1. **Monitoramento de Saúde Mental Corporativa**
- Acompanhar evolução da média de bem-estar ao longo do tempo
- Identificar tendências de queda ou melhoria
- Alertar quando média fica abaixo de 3.0

### 2. **Análise de Categorias de Desconforto**
- Identificar os principais motivos de estresse na empresa
- Focar em ações para resolver problemas recorrentes
- Criar programas específicos por categoria

### 3. **Acompanhamento de Ações de Bem-Estar**
- Monitorar taxa de conclusão de ações
- Priorizar ações de alta prioridade
- Acompanhar gestores na implementação

### 4. **Relatório Executivo**
- Apresentar saúde emocional como KPI importante
- Incluir tendências em análises de engajamento
- Demonstrar ROI de programas de bem-estar

---

## 🔐 **Integrações Mantidas**

✅ Estrutura JSON anterior **totalmente preservada**  
✅ Novos campos adicionados em **seções separadas**  
✅ Sem quebra de compatibilidade com frontend  
✅ Escalável para adicionar mais métricas no futuro  

---

## 📝 **Notas Técnicas**

- **Query Performance:** Todas as queries foram otimizadas com GROUP BY e agregações
- **Compatibilidade:** Usa `0` como valor padrão quando dados não existem
- **Tipo de Dados:** Números arredondados para 2 casas decimais onde necessário
- **Ordenação:** Resultados ordenados por quantidade (descending) para priorização

---

**Data da Documentação:** 11 de Janeiro de 2026  
**Versão:** 1.0
