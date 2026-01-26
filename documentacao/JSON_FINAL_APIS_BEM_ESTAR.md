# 📊 JSON FINAL - APIs de Bem-Estar Emocional

## 🎯 ESTRUTURA MANTIDA COMO SOLICITADO

Todos os campos anteriores foram **mantidos intactos**, apenas **novos campos foram adicionados** no final dos objetos.

---

# 1️⃣ API: `/api/dashboard/rh`

## ✅ Estrutura JSON de Resposta

```json
{
  "success": true,
  "message": "Dashboard de RH buscado com sucesso",
  "data": {
    
    // ═══════════════════════════════════════════════
    // ✅ CAMPOS EXISTENTES (MANTIDOS)
    // ═══════════════════════════════════════════════
    
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
      },
      {
        "gestor": "Pedro Costa",
        "progresso_das_metas": "58% (11/19)"
      }
    ],
    
    // ═══════════════════════════════════════════════
    // ✨ NOVOS CAMPOS ADICIONADOS
    // ═══════════════════════════════════════════════
    
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
        },
        {
          "categoria": "Conflitos interpessoais",
          "quantidade": 15
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
          "status": "pendente",
          "quantidade": 45
        },
        {
          "status": "em_progresso",
          "quantidade": 30
        },
        {
          "status": "concluida",
          "quantidade": 70
        },
        {
          "status": "cancelada",
          "quantidade": 5
        }
      ]
    }
  }
}
```

---

# 2️⃣ API: Relatório Executivo Completo

## ✅ Estrutura JSON de Resposta

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
  
  // ═══════════════════════════════════════════════
  // ✨ NOVO OBJETO ADICIONADO
  // ═══════════════════════════════════════════════
  
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
  
  // ═══════════════════════════════════════════════
  // METADADOS
  // ═══════════════════════════════════════════════
  
  "data_geracao": "11/01/2026 14:35:42",
  "id_cliente": 1
}
```

---

# 📊 RESUMO VISUAL - CAMPOS NOVOS

## Dashboard RH (`/api/dashboard/rh`)

```
├── bem_estar_emocional ✨ NOVO
│   ├── total_checkins: number
│   ├── media_nota_bem_estar: number (1-5)
│   ├── checkins_agrupados_por_nota
│   │   ├── nota_1: number
│   │   ├── nota_2: number
│   │   ├── nota_3: number
│   │   ├── nota_4: number
│   │   └── nota_5: number
│   └── checkins_agrupados_por_categoria: Array
│       └── [{ categoria: string, quantidade: number }]
│
└── acoes_bem_estar ✨ NOVO
    ├── total_acoes: number
    ├── acoes_pendentes: number
    ├── acoes_em_progresso: number
    ├── acoes_concluidas: number
    ├── acoes_canceladas: number
    ├── acoes_agrupadas_por_tipo: Array
    │   └── [{ tipo_acao: string, quantidade: number }]
    ├── acoes_agrupadas_por_prioridade: Array
    │   └── [{ prioridade: string, quantidade: number }]
    └── acoes_agrupadas_por_status: Array
        └── [{ status: string, quantidade: number }]
```

---

## Relatório Executivo (`/api/relatorio-executivo`)

```
└── bem_estar_emocional ✨ NOVO
    ├── checkin_emocional
    │   ├── total_checkins: number
    │   ├── media_nota_bem_estar: number (1-5)
    │   ├── distribuicao_por_nota
    │   │   ├── nota_1: number
    │   │   ├── nota_2: number
    │   │   ├── nota_3: number
    │   │   ├── nota_4: number
    │   │   └── nota_5: number
    │   └── categorias_motivo: Array
    │       └── [{ categoria: string, quantidade: number }]
    │
    └── acoes_bem_estar
        ├── total_acoes: number
        ├── acoes_pendentes: number
        ├── acoes_em_progresso: number
        ├── acoes_concluidas: number
        ├── acoes_canceladas: number
        ├── percentual_conclusao: number (%)
        ├── acoes_por_tipo: Array
        │   └── [{ tipo_acao: string, quantidade: number }]
        └── acoes_por_prioridade: Array
            └── [{ prioridade: string, quantidade: number }]
```

---

# 🎯 DADOS AGRUPADOS PARA BIG NUMBERS

## Bem-Estar Emocional

| Campo | Tipo | Exemplo | Uso |
|-------|------|---------|-----|
| `total_checkins` | number | 450 | Total de registros |
| `media_nota_bem_estar` | float | 3.75 | Score geral de bem-estar |
| `nota_1` | number | 25 | Pessoas muito insatisfeitas |
| `nota_2` | number | 50 | Pessoas insatisfeitas |
| `nota_3` | number | 100 | Pessoas neutras |
| `nota_4` | number | 150 | Pessoas satisfeitas |
| `nota_5` | number | 125 | Pessoas muito satisfeitas |

## Ações de Bem-Estar

| Campo | Tipo | Exemplo | Uso |
|-------|------|---------|-----|
| `total_acoes` | number | 150 | Total de ações criadas |
| `acoes_concluidas` | number | 70 | Ações implementadas |
| `acoes_pendentes` | number | 45 | Ações aguardando início |
| `acoes_em_progresso` | number | 30 | Ações em andamento |
| `percentual_conclusao` | float | 47.57 | % de conclusão |

---

# ✅ CHECKLIST DE IMPLEMENTAÇÃO

- ✅ Incluídos dados de `checkin_emocional` (tabela)
- ✅ Incluídos dados de `checkin_acao` (tabela nova)
- ✅ Agrupamento por **nota** (1-5)
- ✅ Agrupamento por **categoria** de motivo
- ✅ Agrupamento por **tipo de ação**
- ✅ Agrupamento por **prioridade**
- ✅ Agrupamento por **status**
- ✅ Big numbers para **saúde emocional**
- ✅ Estrutura JSON **anterior mantida intacta**
- ✅ Novos campos em **seções separadas**
- ✅ **Sem quebra de compatibilidade** com frontend
- ✅ Implementado em `dashboard.controller.js`
- ✅ Implementado em `relatorio_executivo.controller.js`
- ✅ Queries otimizadas com agregações

---

# 🚀 COMO USAR NO FRONTEND

### Dashboard RH

```javascript
// Acessar bem-estar emocional
const mediaNotaBemEstar = response.data.bem_estar_emocional.media_nota_bem_estar;
const totalAcoes = response.data.acoes_bem_estar.total_acoes;
const acoesConcluidas = response.data.acoes_bem_estar.acoes_concluidas;

// Gráfico de distribuição por nota
const notaDistribuicao = response.data.bem_estar_emocional.checkins_agrupados_por_nota;

// Gráfico de categorias
const categorias = response.data.bem_estar_emocional.checkins_agrupados_por_categoria;
```

### Relatório Executivo

```javascript
// Acessar dados de bem-estar no relatório
const relatorio = response.data;
const mediaNotaBemEstar = relatorio.bem_estar_emocional.checkin_emocional.media_nota_bem_estar;
const statusAcoes = relatorio.bem_estar_emocional.acoes_bem_estar.acoes_agrupadas_por_status;
```

---

**Implementação Concluída com Sucesso! 🎉**
