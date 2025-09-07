# API Árvore da Vida

Esta documentação descreve as APIs relacionadas à Árvore da Vida do sistema Impulsionar Talentos.

## 📋 Tabela de Conteúdo

- [Visão Geral](#visão-geral)
- [Endpoints](#endpoints)
- [Estrutura da Tabela](#estrutura-da-tabela)
- [Exemplos de Uso](#exemplos-de-uso)
- [Validações](#validações)
- [Códigos de Resposta](#códigos-de-resposta)

## 🌳 Visão Geral

A Árvore da Vida é uma ferramenta de avaliação que permite aos usuários pontuarem diferentes aspectos de suas vidas em uma escala de 0 a 10, fornecendo uma visão holística do seu bem-estar e satisfação em diversas áreas.

### Aspectos Avaliados

1. **Pontuação Geral** - Visão geral da satisfação com a vida
2. **Criatividade/Hobbie** - Satisfação com atividades criativas e hobbies
3. **Plenitude/Felicidade** - Sensação de plenitude e felicidade
4. **Espiritualidade** - Satisfação com aspectos espirituais
5. **Saúde/Disposição** - Estado de saúde física e disposição
6. **Desenvolvimento Intelectual** - Crescimento e aprendizado intelectual
7. **Equilíbrio Emocional** - Estabilidade e bem-estar emocional
8. **Família** - Relacionamentos familiares
9. **Desenvolvimento Amoroso** - Relacionamentos românticos
10. **Vida Social** - Relacionamentos sociais e amizades
11. **Realização/Propósito** - Senso de propósito e realização
12. **Recursos Financeiros** - Situação financeira
13. **Contribuição Social** - Impacto e contribuição para a sociedade

## 🔗 Endpoints

### 1. GET /api/arvore-da-vida/:id_usuario

Busca a árvore da vida de um usuário específico.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| id_usuario | Integer | Sim | ID do usuário |

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Árvore da vida encontrada com sucesso",
  "data": {
    "id_usuario": 1,
    "arvore_da_vida": {
      "id": 1,
      "created_at": "2025-08-17T23:44:57.481Z",
      "pontuacao_geral": 7,
      "criatividade_hobbie": 8,
      "plenitude_felicidade": 6,
      "espiritualidade": 5,
      "saude_disposicao": 7,
      "desenvolvimento_intelectual": 8,
      "equilibrio_emocional": 6,
      "familia": 9,
      "desenvolvimento_amoroso": 7,
      "vida_social": 6,
      "realizacao_proposito": 8,
      "recursos_financeiros": 5,
      "contribuicao_social": 7,
      "id_usuario": 1
    }
  },
  "timestamp": "2025-08-17T23:44:57.481Z"
}
```

#### Resposta de Erro (404)

```json
{
  "success": false,
  "message": "Árvore da vida não encontrada. Complete o teste primeiro.",
  "data": null,
  "timestamp": "2025-08-17T23:44:57.481Z"
}
```

### 2. POST /api/arvore-da-vida

Cria uma nova árvore da vida para um usuário.

### 3. PUT /api/arvore-da-vida

Atualiza a árvore da vida existente de um usuário.

#### Body da Requisição

```json
{
  "id_usuario": 1,
  "pontuacao_geral": 7,
  "criatividade_hobbie": 8,
  "plenitude_felicidade": 6,
  "espiritualidade": 5,
  "saude_disposicao": 7,
  "desenvolvimento_intelectual": 8,
  "equilibrio_emocional": 6,
  "familia": 9,
  "desenvolvimento_amoroso": 7,
  "vida_social": 6,
  "realizacao_proposito": 8,
  "recursos_financeiros": 5,
  "contribuicao_social": 7
}
```

#### Resposta de Sucesso - Criação (201)

```json
{
  "success": true,
  "message": "Árvore da vida criada com sucesso",
  "data": {
    "id_usuario": 1,
    "arvore_da_vida": {
      "id": 1,
      "created_at": "2025-08-17T23:44:57.481Z",
      "pontuacao_geral": 7,
      "criatividade_hobbie": 8,
      "plenitude_felicidade": 6,
      "espiritualidade": 5,
      "saude_disposicao": 7,
      "desenvolvimento_intelectual": 8,
      "equilibrio_emocional": 6,
      "familia": 9,
      "desenvolvimento_amoroso": 7,
      "vida_social": 6,
      "realizacao_proposito": 8,
      "recursos_financeiros": 5,
      "contribuicao_social": 7,
      "id_usuario": 1
    },
    "operacao": "criado"
  },
  "timestamp": "2025-08-17T23:44:57.481Z"
}
```

#### Resposta de Sucesso - Atualização (200)

```json
{
  "success": true,
  "message": "Árvore da vida atualizada com sucesso",
  "data": {
    "id_usuario": 1,
    "arvore_da_vida": {
      "id": 1,
      "created_at": "2025-08-17T23:44:57.481Z",
      "pontuacao_geral": 8,
      "criatividade_hobbie": 9,
      "plenitude_felicidade": 7,
      "espiritualidade": 6,
      "saude_disposicao": 8,
      "desenvolvimento_intelectual": 9,
      "equilibrio_emocional": 7,
      "familia": 9,
      "desenvolvimento_amoroso": 8,
      "vida_social": 7,
      "realizacao_proposito": 9,
      "recursos_financeiros": 6,
      "contribuicao_social": 8,
      "id_usuario": 1
    },
    "operacao": "atualizado"
  },
  "timestamp": "2025-08-17T23:44:57.481Z"
}
```

## 📊 Estrutura da Tabela

### Tabela: `arvore_da_vida`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária (auto-incremento) |
| created_at | TIMESTAMP | Data/hora de criação (automático) |
| pontuacao_geral | INTEGER | Pontuação geral (0-10) |
| criatividade_hobbie | INTEGER | Criatividade/Hobbie (0-10) |
| plenitude_felicidade | INTEGER | Plenitude/Felicidade (0-10) |
| espiritualidade | INTEGER | Espiritualidade (0-10) |
| saude_disposicao | INTEGER | Saúde/Disposição (0-10) |
| desenvolvimento_intelectual | INTEGER | Desenvolvimento intelectual (0-10) |
| equilibrio_emocional | INTEGER | Equilíbrio emocional (0-10) |
| familia | INTEGER | Família (0-10) |
| desenvolvimento_amoroso | INTEGER | Desenvolvimento amoroso (0-10) |
| vida_social | INTEGER | Vida social (0-10) |
| realizacao_proposito | INTEGER | Realização/Propósito (0-10) |
| recursos_financeiros | INTEGER | Recursos financeiros (0-10) |
| contribuicao_social | INTEGER | Contribuição social (0-10) |
| id_usuario | INTEGER | Chave estrangeira para tabela usuarios |

## 📝 Exemplos de Uso

### Exemplo 1: Criar Árvore da Vida

```bash
curl -X POST http://localhost:3002/api/arvore-da-vida \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "pontuacao_geral": 7,
    "criatividade_hobbie": 8,
    "plenitude_felicidade": 6,
    "espiritualidade": 5,
    "saude_disposicao": 7,
    "desenvolvimento_intelectual": 8,
    "equilibrio_emocional": 6,
    "familia": 9,
    "desenvolvimento_amoroso": 7,
    "vida_social": 6,
    "realizacao_proposito": 8,
    "recursos_financeiros": 5,
    "contribuicao_social": 7
  }'
```

### Exemplo 2: Buscar Árvore da Vida

```bash
curl -X GET http://localhost:3002/api/arvore-da-vida/1
```

### Exemplo 3: Atualizar Árvore da Vida

```bash
curl -X PUT http://localhost:3002/api/arvore-da-vida \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "pontuacao_geral": 8,
    "criatividade_hobbie": 9,
    "plenitude_felicidade": 7,
    "espiritualidade": 6,
    "saude_disposicao": 8,
    "desenvolvimento_intelectual": 9,
    "equilibrio_emocional": 7,
    "familia": 9,
    "desenvolvimento_amoroso": 8,
    "vida_social": 7,
    "realizacao_proposito": 9,
    "recursos_financeiros": 6,
    "contribuicao_social": 8
  }'
```

## ✅ Validações

### Validações de Entrada

- **id_usuario**: Deve ser um número inteiro positivo
- **Todos os campos de pontuação**: Devem ser números inteiros entre 0 e 10

### Validações de Negócio

- Se não existir registro para o usuário, será criado um novo
- Se já existir registro, será atualizado o existente
- Todos os campos de pontuação são obrigatórios

## 📋 Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso (GET, PUT) |
| 201 | Criado com sucesso (POST) |
| 400 | Dados inválidos |
| 404 | Árvore da vida não encontrada |
| 500 | Erro interno do servidor |

## 🔍 Logs de Debug

A API inclui logs detalhados para facilitar o debug:

- **Início das operações**: Parâmetros recebidos
- **Validações**: Detalhes de validações que falham
- **Operações de banco**: Queries executadas e resultados
- **Transações**: Início, commit e rollback
- **Erros**: Stack trace completo de erros

### Exemplo de Logs

```
🔍 [ARVORE_DA_VIDA] Iniciando salvarArvoreDaVida
📝 [ARVORE_DA_VIDA] Request body: {...}
✅ [ARVORE_DA_VIDA] id_usuario válido: 1
✅ [ARVORE_DA_VIDA] Todos os campos válidos
🔄 [ARVORE_DA_VIDA] Iniciando transação
🔍 [ARVORE_DA_VIDA] Verificando se já existe registro...
➕ [ARVORE_DA_VIDA] Inserindo novo registro
✅ [ARVORE_DA_VIDA] Registro criado com sucesso
✅ [ARVORE_DA_VIDA] Commit da transação
```

## 🚀 Considerações de Implementação

1. **Transações**: Todas as operações de escrita usam transações para garantir consistência
2. **Logs Detalhados**: Implementação de logs para facilitar debug e monitoramento
3. **Validação Robusta**: Validação completa de todos os campos obrigatórios
4. **Flexibilidade**: Suporte para criação e atualização com o mesmo endpoint
5. **Padrão de Resposta**: Respostas padronizadas seguindo o padrão da API

