# API Dashboard de Gestão

Esta documentação descreve a API relacionada ao dashboard de gestão para gestores acompanharem suas equipes.

## Base URL

```
http://localhost:3002/api/dashboard
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header `Authorization`.

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Buscar Dashboard de Gestão

Busca informações consolidadas do dashboard de gestão para um gestor específico, incluindo métricas da equipe, atividades, metas, árvore da vida e análise SWOT.

**Endpoint:** `GET /api/dashboard/gestor/:id_gestor`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_gestor` (integer): ID do gestor

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Dashboard de gestão buscado com sucesso",
  "data": {
    "gestor_id": 1,
    "membros_equipe": 5,
    "atividades_concluidas": 23,
    "total_atividades": 45,
    "metas_concluidas": 8,
    "total_metas": 15,
    "media_arvore_vida_equipe": 7,
    "pontuacao_geral_usuarios": [
      {
        "usuario_id": 2,
        "usuario_nome": "João Silva",
        "pontuacao_geral": 8
      },
      {
        "usuario_id": 3,
        "usuario_nome": "Maria Santos",
        "pontuacao_geral": 6
      },
      {
        "usuario_id": 4,
        "usuario_nome": "Pedro Costa",
        "pontuacao_geral": 9
      }
    ],
    "quantidade_swot_por_pilar": {
      "fortalezas": 15,
      "fraquezas": 8,
      "oportunidades": 12,
      "ameacas": 5
    },
    "pilar_swot_por_colaborador": [
      {
        "usuario_id": 2,
        "usuario_nome": "João Silva",
        "fortalezas": 5,
        "fraquezas": 2,
        "oportunidades": 4,
        "ameacas": 1
      },
      {
        "usuario_id": 3,
        "usuario_nome": "Maria Santos",
        "fortalezas": 4,
        "fraquezas": 3,
        "oportunidades": 3,
        "ameacas": 2
      }
    ],
    "experiencias_por_colaborador": [
      {
        "usuario_id": 2,
        "usuario_nome": "João Silva",
        "quantidade_experiencias": 12
      },
      {
        "usuario_id": 3,
        "usuario_nome": "Maria Santos",
        "quantidade_experiencias": 8
      }
    ],
    "feedbacks_por_colaborador": [
      {
        "usuario_id": 2,
        "usuario_nome": "João Silva",
        "quantidade_feedbacks": 25
      },
      {
        "usuario_id": 3,
        "usuario_nome": "Maria Santos",
        "quantidade_feedbacks": 18
      }
    ]
  }
}
```

**Resposta quando gestor não tem equipe (200):**
```json
{
  "success": true,
  "message": "Nenhum membro encontrado para este gestor",
  "data": {
    "gestor_id": 1,
    "membros_equipe": 0,
    "atividades_concluidas": 0,
    "total_atividades": 0,
    "metas_concluidas": 0,
    "total_metas": 0,
    "media_arvore_vida_equipe": 0,
    "pontuacao_geral_usuarios": [],
    "quantidade_swot_por_pilar": {
      "fortalezas": 0,
      "fraquezas": 0,
      "oportunidades": 0,
      "ameacas": 0
    },
    "pilar_swot_por_colaborador": [],
    "experiencias_por_colaborador": [],
    "feedbacks_por_colaborador": []
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_GESTOR_ID",
  "message": "ID do gestor é obrigatório e deve ser um número válido"
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_GESTOR_ID` | ID do gestor inválido ou não fornecido |
| `INTERNAL_ERROR` | Erro interno do servidor |

**Campos de Resposta:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `gestor_id` | integer | ID do gestor consultado |
| `membros_equipe` | integer | Quantidade de usuários com o gestor especificado |
| `atividades_concluidas` | integer | Quantidade de atividades com status "concluida" da equipe |
| `total_atividades` | integer | Total de atividades da equipe (todos os status) |
| `metas_concluidas` | integer | Quantidade de metas com status "Concluida" da equipe |
| `total_metas` | integer | Total de metas da equipe (todos os status) |
| `media_arvore_vida_equipe` | integer | Média da pontuação geral da árvore da vida da equipe |
| `pontuacao_geral_usuarios` | array | Pontuação individual de cada membro da equipe |
| `quantidade_swot_por_pilar` | object | Quantidade total de itens SWOT por categoria |
| `pilar_swot_por_colaborador` | array | Quantidade de itens SWOT por categoria para cada colaborador |
| `experiencias_por_colaborador` | array | Quantidade de experiências de portfólio por colaborador |
| `feedbacks_por_colaborador` | array | Quantidade de feedbacks por colaborador |

**Campos da Pontuação Geral por Usuário:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `usuario_id` | integer | ID do usuário |
| `usuario_nome` | string | Nome do usuário |
| `pontuacao_geral` | integer | Pontuação geral da árvore da vida (0-10) |

**Campos da Quantidade SWOT por Pilar:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `fortalezas` | integer | Quantidade total de fortalezas da equipe |
| `fraquezas` | integer | Quantidade total de fraquezas da equipe |
| `oportunidades` | integer | Quantidade total de oportunidades da equipe |
| `ameacas` | integer | Quantidade total de ameaças da equipe |

**Campos do Pilar SWOT por Colaborador:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `usuario_id` | integer | ID do usuário |
| `usuario_nome` | string | Nome do usuário |
| `fortalezas` | integer | Quantidade de fortalezas do colaborador |
| `fraquezas` | integer | Quantidade de fraquezas do colaborador |
| `oportunidades` | integer | Quantidade de oportunidades do colaborador |
| `ameacas` | integer | Quantidade de ameaças do colaborador |

**Campos das Experiências por Colaborador:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `usuario_id` | integer | ID do usuário |
| `usuario_nome` | string | Nome do usuário |
| `quantidade_experiencias` | integer | Quantidade de experiências de portfólio |

**Campos dos Feedbacks por Colaborador:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `usuario_id` | integer | ID do usuário |
| `usuario_nome` | string | Nome do usuário |
| `quantidade_feedbacks` | integer | Quantidade de feedbacks recebidos |

---

## Validações

### Validações de Entrada

1. **ID do Gestor:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório

---

## Estrutura do Banco de Dados

### Tabela: `usuarios`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do usuário |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `id_cliente` | INT8 | ID do cliente |
| `nome` | TEXT | Nome do usuário |
| `cargo` | TEXT | Cargo do usuário |
| `perfil_acesso` | INT8 | ID do perfil de acesso (FK) |
| `idade` | INT4 | Idade do usuário |
| `data_nascimento` | TIMESTAMPTZ | Data de nascimento |
| `email` | TEXT | Email do usuário |
| `senha` | TEXT | Senha do usuário (hash) |
| `id_gestor` | INT8 | ID do gestor (FK) |
| `id_departamento` | INT8 | ID do departamento (FK) |

### Tabela: `metas_pdi`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único da meta |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `titulo` | TEXT | Título da meta |
| `prazo` | DATE | Data de vencimento da meta |
| `status` | TEXT | Status da meta |
| `resultado_3_meses` | TEXT | Resultado esperado em 3 meses |
| `resultado_6_meses` | TEXT | Resultado esperado em 6 meses |
| `feedback_gestor` | TEXT | Feedback do gestor |
| `id_usuario` | INT8 | ID do usuário (FK) |

### Tabela: `atividades_pdi`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único da atividade |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `id_meta_pdi` | INT8 | ID da meta (FK) |
| `titulo_atividade` | TEXT | Título da atividade |
| `status_atividade` | TEXT | Status da atividade |
| `evidencia_atividade` | TEXT | URL da evidência |

### Tabela: `arvore_da_vida`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do registro |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `pontuacao_geral` | SMALLINT | Pontuação geral da árvore da vida (0-10) |
| `criatividade_hobbie` | SMALLINT | Pontuação para criatividade e hobbies |
| `plenitude_felicidade` | SMALLINT | Pontuação para plenitude e felicidade |
| `espiritualidade` | SMALLINT | Pontuação para espiritualidade |
| `saude_disposicao` | SMALLINT | Pontuação para saúde e disposição |
| `desenvolvimento_intelectual` | SMALLINT | Pontuação para desenvolvimento intelectual |
| `equilibrio_emocional` | SMALLINT | Pontuação para equilíbrio emocional |
| `familia` | SMALLINT | Pontuação para família |
| `desenvolvimento_amoroso` | SMALLINT | Pontuação para desenvolvimento amoroso |
| `vida_social` | SMALLINT | Pontuação para vida social |
| `realizacao_proposito` | SMALLINT | Pontuação para realização e propósito |
| `recursos_financeiros` | SMALLINT | Pontuação para recursos financeiros |
| `contribuicao_social` | SMALLINT | Pontuação para contribuição social |
| `id_usuario` | INT8 | ID do usuário (FK) |

### Tabela: `analise_swot`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do registro |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `id_usuario` | INT8 | ID do usuário (FK) |
| `categoria_swot` | INT8 | ID da categoria SWOT (FK) |
| `id_texto_swot` | INT8 | ID do texto SWOT (FK) |

### Tabela: `categoria_swot`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único da categoria |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `categoria` | TEXT | Nome da categoria SWOT |

### Tabela: `textos_swot`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do texto |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `texto` | TEXT | Texto da análise SWOT |

### Tabela: `experiencia_portifolio`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único da experiência |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `titulo_experiencia` | TEXT | Título da experiência |
| `data_experiencia` | DATE | Data da experiência |
| `acao_realizada` | TEXT | Ação realizada |
| `resultado_entregue` | TEXT | Resultado entregue |
| `id_usuario` | INT8 | ID do usuário (FK) |

### Tabela: `feedbacks_portifolio`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do feedback |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `feedback` | TEXT | Texto do feedback |
| `id_experiencia_portifolio` | INT8 | ID da experiência (FK) |
| `autor` | TEXT | Autor do feedback |

---

### 2. Buscar Árvore da Vida da Equipe por Gestor

Busca informações consolidadas da árvore da vida de todos os colaboradores de um gestor específico, incluindo estatísticas gerais e detalhamento individual.

**Endpoint:** `GET /api/dashboard/arvore-da-vida/:id_gestor`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_gestor` (integer): ID do gestor

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Árvore da vida da equipe buscada com sucesso",
  "data": {
    "gestor_id": 1,
    "total_colaboradores": 3,
    "media_geral": 7,
    "maior_pontuacao": 9,
    "colaborador": [
      {
        "nome": "João Silva",
        "pontuacao_geral": 8,
        "criatividade_hobbie": 7,
        "plenitude_felicidade": 8,
        "espiritualidade": 6,
        "saude_disposicao": 9,
        "desenvolvimento_intelectual": 8,
        "equilibrio_emocional": 7,
        "familia": 9,
        "desenvolvimento_amoroso": 8,
        "vida_social": 7,
        "realizacao_proposito": 9,
        "recursos_financeiros": 6,
        "contribuicao_social": 8
      },
      {
        "nome": "Maria Santos",
        "pontuacao_geral": 6,
        "criatividade_hobbie": 5,
        "plenitude_felicidade": 6,
        "espiritualidade": 7,
        "saude_disposicao": 6,
        "desenvolvimento_intelectual": 7,
        "equilibrio_emocional": 5,
        "familia": 8,
        "desenvolvimento_amoroso": 6,
        "vida_social": 6,
        "realizacao_proposito": 7,
        "recursos_financeiros": 5,
        "contribuicao_social": 6
      },
      {
        "nome": "Pedro Costa",
        "pontuacao_geral": 9,
        "criatividade_hobbie": 8,
        "plenitude_felicidade": 9,
        "espiritualidade": 8,
        "saude_disposicao": 9,
        "desenvolvimento_intelectual": 9,
        "equilibrio_emocional": 8,
        "familia": 10,
        "desenvolvimento_amoroso": 9,
        "vida_social": 8,
        "realizacao_proposito": 10,
        "recursos_financeiros": 7,
        "contribuicao_social": 9
      }
    ]
  }
}
```

**Resposta quando gestor não tem equipe (200):**
```json
{
  "success": true,
  "message": "Nenhum colaborador encontrado para este gestor",
  "data": {
    "gestor_id": 1,
    "total_colaboradores": 0,
    "media_geral": 0,
    "maior_pontuacao": 0,
    "colaborador": []
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_GESTOR_ID",
  "message": "ID do gestor é obrigatório e deve ser um número válido"
}
```

**Campos de Resposta da Árvore da Vida:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `gestor_id` | integer | ID do gestor consultado |
| `total_colaboradores` | integer | Quantidade total de colaboradores da equipe |
| `media_geral` | integer | Média arredondada das pontuações gerais da equipe (0-10) |
| `maior_pontuacao` | integer | Maior pontuação geral encontrada na equipe (0-10) |
| `colaborador` | array | Array com dados detalhados de cada colaborador |

**Campos de Cada Colaborador:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | string | Nome do colaborador |
| `pontuacao_geral` | integer | Pontuação geral da árvore da vida (0-10) |
| `criatividade_hobbie` | integer | Pontuação para criatividade e hobbies (0-10) |
| `plenitude_felicidade` | integer | Pontuação para plenitude e felicidade (0-10) |
| `espiritualidade` | integer | Pontuação para espiritualidade (0-10) |
| `saude_disposicao` | integer | Pontuação para saúde e disposição (0-10) |
| `desenvolvimento_intelectual` | integer | Pontuação para desenvolvimento intelectual (0-10) |
| `equilibrio_emocional` | integer | Pontuação para equilíbrio emocional (0-10) |
| `familia` | integer | Pontuação para relacionamentos familiares (0-10) |
| `desenvolvimento_amoroso` | integer | Pontuação para desenvolvimento amoroso (0-10) |
| `vida_social` | integer | Pontuação para vida social (0-10) |
| `realizacao_proposito` | integer | Pontuação para realização e propósito (0-10) |
| `recursos_financeiros` | integer | Pontuação para recursos financeiros (0-10) |
| `contribuicao_social` | integer | Pontuação para contribuição social (0-10) |

---

### 3. Buscar Análise SWOT da Equipe por Gestor

Busca informações consolidadas da análise SWOT de todos os colaboradores de um gestor específico, incluindo totais por categoria e detalhamento individual por pilares.

**Endpoint:** `GET /api/dashboard/analise-swot/:id_gestor`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_gestor` (integer): ID do gestor

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Análise SWOT da equipe buscada com sucesso",
  "data": {
    "gestor_id": 1,
    "total_forcas": 8,
    "total_fraquezas": 6,
    "total_oportunidades": 5,
    "total_ameacas": 4,
    "colaborador": [
      {
        "nome": "João Silva",
        "pilar1": [
          "Boa comunicação",
          "Liderança natural",
          "Proatividade"
        ],
        "pilar2": [
          "Impaciência",
          "Perfeccionismo excessivo"
        ],
        "pilar3": [
          "Crescimento no mercado",
          "Novas tecnologias"
        ],
        "pilar4": [
          "Concorrência forte"
        ]
      },
      {
        "nome": "Maria Santos",
        "pilar1": [
          "Organização",
          "Dedicação",
          "Conhecimento técnico"
        ],
        "pilar2": [
          "Timidez",
          "Resistência a mudanças"
        ],
        "pilar3": [
          "Capacitação",
          "Networking"
        ],
        "pilar4": [
          "Instabilidade econômica",
          "Mudanças regulatórias"
        ]
      },
      {
        "nome": "Pedro Costa",
        "pilar1": [
          "Criatividade",
          "Flexibilidade"
        ],
        "pilar2": [
          "Procrastinação",
          "Falta de foco"
        ],
        "pilar3": [
          "Inovação"
        ],
        "pilar4": [
          "Pressão por resultados"
        ]
      }
    ]
  }
}
```

**Resposta quando gestor não tem equipe (200):**
```json
{
  "success": true,
  "message": "Nenhuma análise SWOT encontrada para este gestor",
  "data": {
    "gestor_id": 1,
    "total_forcas": 0,
    "total_fraquezas": 0,
    "total_oportunidades": 0,
    "total_ameacas": 0,
    "colaborador": []
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_GESTOR_ID",
  "message": "ID do gestor é obrigatório e deve ser um número válido"
}
```

**Campos de Resposta da Análise SWOT:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `gestor_id` | integer | ID do gestor consultado |
| `total_forcas` | integer | Total de itens de forças de toda a equipe |
| `total_fraquezas` | integer | Total de itens de fraquezas de toda a equipe |
| `total_oportunidades` | integer | Total de itens de oportunidades de toda a equipe |
| `total_ameacas` | integer | Total de itens de ameaças de toda a equipe |
| `colaborador` | array | Array com dados SWOT detalhados de cada colaborador |

**Campos de Cada Colaborador:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | string | Nome do colaborador |
| `pilar1` | array[string] | Array com textos de forças do colaborador |
| `pilar2` | array[string] | Array com textos de fraquezas do colaborador |
| `pilar3` | array[string] | Array com textos de oportunidades do colaborador |
| `pilar4` | array[string] | Array com textos de ameaças do colaborador |

**Mapeamento de Categorias SWOT:**
- **pilar1**: Forças (forças, forcas, força, forca)
- **pilar2**: Fraquezas (fraquezas, fraqueza)
- **pilar3**: Oportunidades (oportunidades, oportunidade)
- **pilar4**: Ameaças (ameaças, ameacas, ameaça, ameaca)

---

### 4. Buscar Portfólio da Equipe por Gestor

Busca informações consolidadas do portfólio de todos os colaboradores de um gestor específico, incluindo quantidades de links, feedbacks, ações e resultados, além do detalhamento das experiências de cada colaborador.

**Endpoint:** `GET /api/dashboard/portifolio/:id_gestor`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_gestor` (integer): ID do gestor

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Portfólio da equipe buscado com sucesso",
  "data": {
    "gestor_id": 1,
    "quantidade_links": 12,
    "quantidade_feedbacks": 18,
    "quantidade_acoes": 15,
    "quantidade_resultados": 13,
    "colaborador": [
      {
        "nome": "João Silva",
        "experiencia1": {
          "titulo": "Implementação de Sistema CRM",
          "data": "2024-03-15",
          "acao_realizada": "Desenvolvi e implementei um sistema CRM personalizado para otimizar o atendimento ao cliente",
          "resultado_entregue": "Aumento de 35% na satisfação do cliente e redução de 20% no tempo de resposta",
          "feedback": "Excelente trabalho na implementação; Sistema muito intuitivo",
          "link": "https://exemplo.com/projeto-crm; https://github.com/joao/crm-system"
        },
        "experiencia2": {
          "titulo": "Treinamento de Equipe",
          "data": "2024-02-20",
          "acao_realizada": "Conduzi treinamento sobre metodologias ágeis para a equipe de desenvolvimento",
          "resultado_entregue": "Equipe capacitada em Scrum e Kanban, com melhoria na produtividade",
          "feedback": "Treinamento muito didático e prático",
          "link": "https://exemplo.com/material-treinamento"
        }
      },
      {
        "nome": "Maria Santos",
        "experiencia1": {
          "titulo": "Análise de Mercado Digital",
          "data": "2024-04-10",
          "acao_realizada": "Realizei pesquisa completa do mercado digital para identificar oportunidades",
          "resultado_entregue": "Relatório detalhado com 15 oportunidades de negócio identificadas",
          "feedback": "Análise muito completa e estratégica; Insights valiosos para o negócio",
          "link": "https://exemplo.com/relatorio-mercado"
        }
      }
    ]
  }
}
```

**Resposta quando gestor não tem equipe (200):**
```json
{
  "success": true,
  "message": "Nenhum portfólio encontrado para este gestor",
  "data": {
    "gestor_id": 1,
    "quantidade_links": 0,
    "quantidade_feedbacks": 0,
    "quantidade_acoes": 0,
    "quantidade_resultados": 0,
    "colaborador": []
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_GESTOR_ID",
  "message": "ID do gestor é obrigatório e deve ser um número válido"
}
```

**Campos de Resposta do Portfólio:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `gestor_id` | integer | ID do gestor consultado |
| `quantidade_links` | integer | Total de links/materiais de toda a equipe |
| `quantidade_feedbacks` | integer | Total de feedbacks recebidos pela equipe |
| `quantidade_acoes` | integer | Total de ações realizadas pela equipe |
| `quantidade_resultados` | integer | Total de resultados entregues pela equipe |
| `colaborador` | array | Array com dados do portfólio de cada colaborador |

**Campos de Cada Colaborador:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | string | Nome do colaborador |
| `experiencia1`, `experiencia2`, etc. | object | Objetos com detalhes de cada experiência do colaborador |

**Campos de Cada Experiência:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `titulo` | string | Título da experiência |
| `data` | string/null | Data da experiência no formato YYYY-MM-DD |
| `acao_realizada` | string | Descrição da ação realizada |
| `resultado_entregue` | string | Descrição do resultado entregue |
| `feedback` | string | Feedbacks recebidos (concatenados se múltiplos) |
| `link` | string | Links/materiais relacionados (concatenados se múltiplos) |

---

### 5. Buscar Dashboard de Gestão de RH

Busca informações consolidadas do dashboard de gestão de RH, incluindo total de colaboradores, gestores ativos, metas concluídas/abertas e progresso por departamento e gestor.

**Endpoint:** `GET /api/dashboard/rh`

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Dashboard de RH buscado com sucesso",
  "data": {
    "total_colaboradores": 45,
    "gestores_ativos": 8,
    "metas_concluidas": 23,
    "metas_abertas": 17,
    "metas_departamento": [
      {
        "departamento": "Desenvolvimento",
        "progresso_das_metas": "75% (12/16)"
      },
      {
        "departamento": "Marketing",
        "progresso_das_metas": "60% (6/10)"
      },
      {
        "departamento": "Vendas",
        "progresso_das_metas": "80% (8/10)"
      }
    ],
    "metas_gestor": [
      {
        "gestor": "Ana Silva",
        "progresso_das_metas": "85% (11/13)"
      },
      {
        "gestor": "Carlos Santos",
        "progresso_das_metas": "70% (7/10)"
      },
      {
        "gestor": "Maria Costa",
        "progresso_das_metas": "90% (9/10)"
      }
    ]
  }
}
```

**Resposta de Erro (500):**
```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "Erro interno do servidor"
}
```

**Campos de Resposta do Dashboard de RH:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `total_colaboradores` | integer | Total de usuários cadastrados no sistema |
| `gestores_ativos` | integer | Quantidade de usuários que são gestores de outros usuários |
| `metas_concluidas` | integer | Total de metas com status "Concluida" (C maiúsculo) |
| `metas_abertas` | integer | Total de metas com status diferente de "Concluida" |
| `metas_departamento` | array | Progresso das metas agrupado por departamento |
| `metas_gestor` | array | Progresso das metas agrupado por gestor |

**Campos de Metas por Departamento:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `departamento` | string | Nome do departamento |
| `progresso_das_metas` | string | Progresso no formato "XX% (concluídas/total)" |

**Campos de Metas por Gestor:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `gestor` | string | Nome do gestor |
| `progresso_das_metas` | string | Progresso no formato "XX% (concluídas/total)" |

---

## Exemplos de Uso

### Exemplo 1: Buscar Dashboard de Gestão

```bash
curl -X GET http://localhost:3002/api/dashboard/gestor/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 2: Buscar Árvore da Vida da Equipe

```bash
curl -X GET http://localhost:3002/api/dashboard/arvore-da-vida/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 3: Buscar Análise SWOT da Equipe

```bash
curl -X GET http://localhost:3002/api/dashboard/analise-swot/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 4: Buscar Portfólio da Equipe

```bash
curl -X GET http://localhost:3002/api/dashboard/portifolio/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 5: Buscar Dashboard de RH

```bash
curl -X GET http://localhost:3002/api/dashboard/rh \
  -H "Authorization: Bearer <token>"
```

### Exemplo 6: Buscar Dashboard de Gestor Inexistente

```bash
curl -X GET http://localhost:3002/api/dashboard/gestor/99999 \
  -H "Authorization: Bearer <token>"
```

---

## Testes

Para executar os testes da API de Dashboard:

```bash
# Executar todos os testes
node tests/test-dashboard.js

# Ou com URL específica
API_URL=http://localhost:3002/api node tests/test-dashboard.js
```

Os testes incluem:

**Testes de Dashboard (GET /gestor/:id):**
- ✅ Buscar dashboard do gestor válido
- ✅ Buscar dashboard de gestor inexistente (retorna dados vazios)
- ❌ Buscar dashboard com ID inválido
- ✅ Validar cálculos e coerência dos dados
- ✅ Verificar estrutura completa dos dados retornados
- ✅ Validar tipos de dados e ranges de valores
- ✅ Confirmar arrays e objetos aninhados

**Testes de Árvore da Vida por Gestor (GET /arvore-da-vida/:id):**
- ✅ Buscar árvore da vida da equipe por gestor válido
- ✅ Buscar árvore da vida de gestor inexistente (retorna dados vazios)
- ❌ Buscar árvore da vida com ID inválido
- ✅ Validar cálculos de média geral e maior pontuação
- ✅ Verificar estrutura detalhada dos colaboradores
- ✅ Validar tipos de dados e ranges de pontuações (0-10)
- ✅ Confirmar consistência entre total_colaboradores e array

**Testes de Análise SWOT por Gestor (GET /analise-swot/:id):**
- ✅ Buscar análise SWOT da equipe por gestor válido
- ✅ Buscar análise SWOT de gestor inexistente (retorna dados vazios)
- ❌ Buscar análise SWOT com ID inválido
- ✅ Validar cálculos de totais por categoria SWOT
- ✅ Verificar estrutura detalhada dos pilares por colaborador
- ✅ Validar tipos de dados e conteúdo dos textos
- ✅ Confirmar consistência entre totais e somas dos pilares

**Testes de Portfólio por Gestor (GET /portifolio/:id):**
- ✅ Buscar portfólio da equipe por gestor válido
- ✅ Buscar portfólio de gestor inexistente (retorna dados vazios)
- ❌ Buscar portfólio com ID inválido
- ✅ Validar cálculos de quantidades (links, feedbacks, ações, resultados)
- ✅ Verificar estrutura detalhada das experiências por colaborador
- ✅ Validar tipos de dados e formato das datas
- ✅ Confirmar consistência entre contadores e experiências

**Testes de Dashboard de RH (GET /rh):**
- ✅ Buscar dashboard de RH com dados válidos
- ✅ Validar cálculos de colaboradores, gestores e metas
- ✅ Verificar estrutura detalhada dos dados por departamento e gestor
- ✅ Validar tipos de dados e formato do progresso
- ✅ Confirmar coerência entre totais e progressos individuais

---

## Notas Importantes

1. **Performance:** A API executa múltiplas queries otimizadas para buscar dados de diferentes tabelas relacionadas.

2. **Cálculos:** Todas as métricas são calculadas em tempo real baseadas nos dados atuais do banco.

3. **Média da Árvore da Vida:** Considera apenas usuários que possuem pontuação registrada, ignorando valores null.

4. **Análise SWOT:** Agrupa dados por categoria e usuário, fornecendo tanto totais gerais quanto detalhamento por colaborador.

5. **Relacionamentos:** A API navega por múltiplas tabelas relacionadas através de foreign keys para consolidar informações.

6. **Arrays Vazios:** Quando um gestor não possui equipe, todos os arrays retornam vazios e contadores ficam em zero.

7. **Árvore da Vida:** Colaboradores sem árvore da vida cadastrada retornam pontuações zeradas em todos os campos.

8. **Cálculos Estatísticos:** Média geral e maior pontuação consideram apenas colaboradores com pontuação_geral > 0.

9. **Análise SWOT:** Categorias são mapeadas de forma flexível (com e sem acentos) para os pilares correspondentes.

10. **Textos SWOT:** Colaboradores sem análise SWOT não aparecem no resultado; apenas colaboradores com dados são incluídos.

11. **Portfólio:** Experiências são numeradas dinamicamente (experiencia1, experiencia2, etc.) baseadas na ordem de criação.

12. **Múltiplos Feedbacks/Links:** Quando uma experiência possui múltiplos feedbacks ou links, eles são concatenados com "; " como separador.

13. **Dashboard de RH:** Não requer parâmetros e fornece uma visão geral de toda a organização.

14. **Progresso das Metas:** Calculado como (metas concluídas / total de metas) * 100, formatado como "XX% (Y/Z)".

---

## Próximas Implementações

- [x] API GET para dashboard de gestão por gestor
- [x] API GET para árvore da vida da equipe por gestor
- [x] API GET para análise SWOT da equipe por gestor
- [x] API GET para portfólio da equipe por gestor
- [x] API GET para dashboard de gestão de RH
- [ ] API GET para dashboard comparativo entre gestores
- [ ] API GET para métricas históricas da equipe
- [ ] API GET para ranking de performance da equipe
- [ ] API GET para alertas e notificações do gestor
- [ ] API para exportar dados do dashboard
- [ ] API para configurar metas da equipe
- [ ] API para relatórios personalizados

