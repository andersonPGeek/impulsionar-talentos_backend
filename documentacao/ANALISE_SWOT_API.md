# API Análise SWOT

Esta documentação descreve as APIs relacionadas à Análise SWOT do sistema Impulsionar Talentos.

## 📋 Tabela de Conteúdo

- [Visão Geral](#visão-geral)
- [Endpoints](#endpoints)
- [Estrutura das Tabelas](#estrutura-das-tabelas)
- [Exemplos de Uso](#exemplos-de-uso)
- [Validações](#validações)
- [Códigos de Resposta](#códigos-de-resposta)

## 🔍 Visão Geral

A Análise SWOT é uma ferramenta estratégica que permite aos usuários avaliarem suas **Fortalezas**, **Fraquezas**, **Oportunidades** e **Ameaças**. Esta API permite salvar e recuperar textos organizados por categoria.

### Categorias SWOT

1. **Fortalezas** (id: 1) - Pontos fortes internos
2. **Fraquezas** (id: 2) - Pontos fracos internos  
3. **Oportunidades** (id: 3) - Fatores externos favoráveis
4. **Ameaças** (id: 4) - Fatores externos desfavoráveis

## 🔗 Endpoints

### 1. GET /api/analise-swot/:id_usuario

Busca a análise SWOT de um usuário específico, agrupada por categoria.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| id_usuario | Integer | Sim | ID do usuário |

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Análise SWOT encontrada com sucesso",
  "data": {
    "id_usuario": 1,
    "categorias": [
      {
        "id_categoria_swot": 1,
        "categoria": "Fortalezas",
        "textos": [
          {
            "id_texto_swot": 1,
            "texto": "Tenho boa comunicação",
            "created_at": "2025-08-17T23:44:57.481Z"
          },
          {
            "id_texto_swot": 2,
            "texto": "Sou organizado",
            "created_at": "2025-08-17T23:44:58.123Z"
          }
        ]
      },
      {
        "id_categoria_swot": 2,
        "categoria": "Fraquezas",
        "textos": [
          {
            "id_texto_swot": 3,
            "texto": "Tenho dificuldade com prazos",
            "created_at": "2025-08-17T23:44:59.456Z"
          }
        ]
      }
    ],
    "total_categorias": 2,
    "total_textos": 3
  },
  "timestamp": "2025-08-17T23:44:57.481Z"
}
```

#### Resposta de Sucesso - Sem Dados (200)

```json
{
  "success": true,
  "message": "Análise SWOT encontrada com sucesso",
  "data": {
    "id_usuario": 1,
    "categorias": [],
    "total_categorias": 0,
    "total_textos": 0
  },
  "timestamp": "2025-08-17T23:44:57.481Z"
}
```

### 2. POST /api/analise-swot

Adiciona novos textos à análise SWOT de um usuário. Esta operação **insere apenas textos novos** que ainda não existem para cada categoria, mantendo os textos existentes.

#### Body da Requisição

```json
{
  "id_usuario": 1,
  "textos_por_categoria": [
    {
      "id_categoria_swot": 1,
      "textos": [
        "Tenho boa comunicação",
        "Sou organizado",
        "Trabalho bem em equipe"
      ]
    },
    {
      "id_categoria_swot": 2,
      "textos": [
        "Tenho dificuldade com prazos",
        "Sou muito perfeccionista"
      ]
    },
    {
      "id_categoria_swot": 3,
      "textos": [
        "Mercado em crescimento",
        "Novas tecnologias disponíveis"
      ]
    },
    {
      "id_categoria_swot": 4,
      "textos": [
        "Concorrência acirrada",
        "Mudanças regulatórias"
      ]
    }
  ]
}
```

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Análise SWOT atualizada com sucesso - apenas textos novos foram inseridos",
  "data": {
    "id_usuario": 1,
    "categorias_processadas": [
      {
        "id_categoria_swot": 1,
        "textos_existentes": 2,
        "textos_novos": 1,
        "textos_inseridos": 1,
        "textos_novos_lista": [
          "Trabalho bem em equipe"
        ]
      },
      {
        "id_categoria_swot": 2,
        "textos_existentes": 0,
        "textos_novos": 2,
        "textos_inseridos": 2,
        "textos_novos_lista": [
          "Tenho dificuldade com prazos",
          "Sou muito perfeccionista"
        ]
      },
      {
        "id_categoria_swot": 3,
        "textos_existentes": 0,
        "textos_novos": 2,
        "textos_inseridos": 2,
        "textos_novos_lista": [
          "Mercado em crescimento",
          "Novas tecnologias disponíveis"
        ]
      },
      {
        "id_categoria_swot": 4,
        "textos_existentes": 0,
        "textos_novos": 2,
        "textos_inseridos": 2,
        "textos_novos_lista": [
          "Concorrência acirrada",
          "Mudanças regulatórias"
        ]
      }
    ],
    "total_textos_inseridos": 7,
    "total_textos_existentes": 2,
    "total_textos_novos": 7
  },
  "timestamp": "2025-08-17T23:44:57.481Z"
}
```

## 📊 Estrutura das Tabelas

### Tabela: `categoria_swot`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária (auto-incremento) |
| created_at | TIMESTAMP | Data/hora de criação (automático) |
| categoria | TEXT | Nome da categoria (Fortalezas, Fraquezas, etc.) |

**Dados pré-cadastrados:**
- id: 1, categoria: "Fortalezas"
- id: 2, categoria: "Fraquezas"  
- id: 3, categoria: "Oportunidades"
- id: 4, categoria: "Ameaças"

### Tabela: `textos_swot`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária (auto-incremento) |
| created_at | TIMESTAMP | Data/hora de criação (automático) |
| texto | TEXT | Conteúdo do texto da análise |

### Tabela: `analise_swot`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária (auto-incremento) |
| created_at | TIMESTAMP | Data/hora de criação (automático) |
| id_usuario | INTEGER | Chave estrangeira para tabela usuarios |
| categoria_swot | INTEGER | Chave estrangeira para tabela categoria_swot |
| id_texto_swot | INTEGER | Chave estrangeira para tabela textos_swot |

## 📝 Exemplos de Uso

### Exemplo 1: Salvar Análise SWOT Completa

```bash
curl -X POST http://localhost:3002/api/analise-swot \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "textos_por_categoria": [
      {
        "id_categoria_swot": 1,
        "textos": [
          "Tenho boa comunicação",
          "Sou organizado",
          "Trabalho bem em equipe"
        ]
      },
      {
        "id_categoria_swot": 2,
        "textos": [
          "Tenho dificuldade com prazos",
          "Sou muito perfeccionista"
        ]
      },
      {
        "id_categoria_swot": 3,
        "textos": [
          "Mercado em crescimento",
          "Novas tecnologias disponíveis"
        ]
      },
      {
        "id_categoria_swot": 4,
        "textos": [
          "Concorrência acirrada",
          "Mudanças regulatórias"
        ]
      }
    ]
  }'
```

### Exemplo 2: Buscar Análise SWOT

```bash
curl -X GET http://localhost:3002/api/analise-swot/1
```

### Exemplo 3: Atualizar Apenas Fortalezas

```bash
curl -X POST http://localhost:3002/api/analise-swot \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "textos_por_categoria": [
      {
        "id_categoria_swot": 1,
        "textos": [
          "Tenho excelente comunicação",
          "Sou muito organizado",
          "Trabalho muito bem em equipe",
          "Tenho experiência sólida"
        ]
      }
    ]
  }'
```

### Exemplo 4: Limpar Todas as Categorias

```bash
curl -X POST http://localhost:3002/api/analise-swot \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "textos_por_categoria": []
  }'
```

## ✅ Validações

### Validações de Entrada

- **id_usuario**: Deve ser um número inteiro positivo
- **textos_por_categoria**: Deve ser um array com pelo menos uma categoria
- **id_categoria_swot**: Deve ser 1, 2, 3 ou 4
- **textos**: Deve ser um array de strings
- **Cada texto**: Deve ser uma string entre 1 e 1000 caracteres

### Validações de Negócio

- **Inserção incremental**: Para cada categoria enviada, apenas textos novos (que não existem) são inseridos
- **Preservação de dados**: Textos existentes são mantidos e não são alterados ou removidos
- **Categorias não enviadas**: Categorias não incluídas na requisição permanecem inalteradas
- **Array vazio**: Se uma categoria tiver array vazio, nenhuma alteração é feita nessa categoria
- **Comparação de texto**: A comparação é feita por texto exato (após trim), ignorando espaços em branco

## 📋 Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso (GET, POST) |
| 400 | Dados inválidos |
| 500 | Erro interno do servidor |

## 🔍 Logs de Debug

A API inclui logs detalhados para facilitar o debug:

- **Início das operações**: Parâmetros recebidos
- **Validações**: Detalhes de validações que falham
- **Operações de banco**: Queries executadas e resultados
- **Transações**: Início, commit e rollback
- **Processamento por categoria**: Detalhes de cada categoria processada
- **Erros**: Stack trace completo de erros

### Exemplo de Logs

```
🔍 [ANALISE_SWOT] Iniciando salvarAnaliseSwot
📝 [ANALISE_SWOT] Request body: {...}
✅ [ANALISE_SWOT] id_usuario válido: 1
✅ [ANALISE_SWOT] textos_por_categoria válido: 4 categorias
✅ [ANALISE_SWOT] Todos os dados válidos
🔄 [ANALISE_SWOT] Iniciando transação
🔄 [ANALISE_SWOT] Processando categoria 1 com 3 textos
🗑️ [ANALISE_SWOT] Deletando textos existentes...
➕ [ANALISE_SWOT] Inserindo novos textos...
📝 [ANALISE_SWOT] Texto inserido com ID: 1
✅ [ANALISE_SWOT] Relação inserida: usuário 1, categoria 1, texto 1
✅ [ANALISE_SWOT] Commit da transação
```

## 🚀 Considerações de Implementação

1. **Transações**: Todas as operações de escrita usam transações para garantir consistência
2. **Inserção Incremental**: Cada categoria é processada independentemente, inserindo apenas textos novos
3. **Preservação de Dados**: Textos existentes nunca são removidos ou alterados
4. **Logs Detalhados**: Implementação de logs para facilitar debug e monitoramento
5. **Validação Robusta**: Validação completa de todos os campos obrigatórios
6. **Flexibilidade**: Permite adicionar textos a apenas algumas categorias
7. **Padrão de Resposta**: Respostas padronizadas seguindo o padrão da API
8. **Comparação Inteligente**: Comparação de textos após trim para evitar duplicatas por espaços

## 🔄 Comportamento da API

### Operação de Inserção Incremental

A API implementa uma lógica de **inserção incremental por categoria**:

1. **Para cada categoria** na requisição:
   - Busca todos os textos existentes para aquela categoria e usuário
   - Compara os textos enviados com os existentes
   - Insere apenas os textos que ainda não existem

2. **Categorias não incluídas** na requisição:
   - Permanecem inalteradas no banco de dados

3. **Array vazio** para uma categoria:
   - Nenhuma alteração é feita nessa categoria

### Exemplo Prático

**Estado inicial:**
- Fortalezas: ["Comunicação", "Organização"]
- Fraquezas: ["Prazos"]

**Requisição:**
```json
{
  "id_usuario": 1,
  "textos_por_categoria": [
    {
      "id_categoria_swot": 1,
      "textos": ["Comunicação", "Organização", "Trabalho em equipe"]
    },
    {
      "id_categoria_swot": 2,
      "textos": ["Prazos", "Perfeccionismo"]
    }
  ]
}
```

**Estado final:**
- Fortalezas: ["Comunicação", "Organização", "Trabalho em equipe"] (adicionado "Trabalho em equipe")
- Fraquezas: ["Prazos", "Perfeccionismo"] (adicionado "Perfeccionismo")
- Oportunidades: (inalterado)
- Ameaças: (inalterado)

**Resposta da API:**
```json
{
  "success": true,
  "message": "Análise SWOT atualizada com sucesso - apenas textos novos foram inseridos",
  "data": {
    "categorias_processadas": [
      {
        "id_categoria_swot": 1,
        "textos_existentes": 2,
        "textos_novos": 1,
        "textos_inseridos": 1,
        "textos_novos_lista": ["Trabalho em equipe"]
      },
      {
        "id_categoria_swot": 2,
        "textos_existentes": 1,
        "textos_novos": 1,
        "textos_inseridos": 1,
        "textos_novos_lista": ["Perfeccionismo"]
      }
    ],
    "total_textos_inseridos": 2,
    "total_textos_existentes": 3,
    "total_textos_novos": 2
  }
}
```







