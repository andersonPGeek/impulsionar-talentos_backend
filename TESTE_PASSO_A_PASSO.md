# 🚀 Instruções: Como Testar as Correções

**Arquivo:** RESUMO_CORRECOES_V2.1.md  
**Data:** 12 Janeiro 2026

---

## 📌 Antes de Começar

Certifique-se de que:
- ✅ O servidor está rodando: `npm run dev`
- ✅ Você tem acesso ao banco de dados
- ✅ Você sabe o ID de um cargo válido (ex: 1, 2, 3)
- ✅ Você tem um token JWT válido (se a rota tiver autenticação)

---

## 🎯 Teste 1: Listar Habilidades de um Cargo

Este teste mostra quais habilidades estão disponíveis para um cargo específico.

### Comando:

```bash
curl -X GET "http://localhost:3000/api/metas/habilidades-cargo/1" \
  -H "Content-Type: application/json"
```

### Resposta Esperada (200 OK):

```json
{
  "success": true,
  "message": "Habilidades do cargo buscadas com sucesso",
  "data": {
    "id_cargo": 1,
    "quantidade_habilidades": 5,
    "habilidades": [
      {
        "id": 1,
        "nome": "Comunicação",
        "descricao": "Capacidade de se comunicar de forma clara e eficaz"
      },
      {
        "id": 2,
        "nome": "Liderança",
        "descricao": "Capacidade de liderar equipes"
      },
      {
        "id": 3,
        "nome": "Pensamento Estratégico",
        "descricao": "Capacidade de pensar estrategicamente"
      },
      {
        "id": 4,
        "nome": "Gestão de Tempo",
        "descricao": "Capacidade de gerenciar o tempo eficientemente"
      },
      {
        "id": 5,
        "nome": "Trabalho em Equipe",
        "descricao": "Capacidade de trabalhar em equipe"
      }
    ]
  }
}
```

**✅ O que isso significa:**
- As habilidades com IDs 1, 2, 3, 4, 5 são válidas para o cargo 1
- Você pode usar esses IDs na criação de metas
- Anote os IDs para o próximo teste!

---

## ✅ Teste 2: Criar Meta com Habilidades VÁLIDAS

Agora você vai criar uma meta usando habilidades que existem (validadas no Teste 1).

### Comando:

```bash
curl -X POST "http://localhost:3000/api/metas" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 5,
    "titulo_da_meta": "Melhorar comunicação em apresentações",
    "atividades": [
      "Fazer curso de apresentação executiva",
      "Praticar em reuniões internas",
      "Apresentar para stakeholders"
    ],
    "data_vencimento": "2025-06-30",
    "status": "Em Progresso",
    "id_usuarios": [5],
    "resultado_3_meses": "Ter completado 50% do curso",
    "resultado_6_meses": "Dominar técnicas de apresentação",
    "observacao_gestor": "Foco em clareza e impacto",
    "id_habilidades": [1, 5]
  }'
```

**⚠️ Importante:**
- Substitua `"id_habilidades": [1, 5]` pelos IDs que você anotou no Teste 1
- Certifique-se de que `id_usuario` e `id_usuarios` existem no seu banco

### Resposta Esperada (201 Created):

```json
{
  "success": true,
  "message": "Meta PDI criada com sucesso",
  "data": {
    "meta": {
      "id": 42,
      "id_usuario": 5,
      "titulo": "Melhorar comunicação em apresentações",
      "prazo": "2025-06-30",
      "status": "Em Progresso",
      "resultado_3_meses": "Ter completado 50% do curso",
      "resultado_6_meses": "Dominar técnicas de apresentação",
      "created_at": "2026-01-12T15:30:00Z",
      "atividades": [
        "Fazer curso de apresentação executiva",
        "Praticar em reuniões internas",
        "Apresentar para stakeholders"
      ],
      "usuarios_envolvidos": [5],
      "habilidades_desenvolvidas": [
        {
          "id": 1,
          "habilidade": "Comunicação",
          "descricao": "Capacidade de se comunicar de forma clara e eficaz"
        },
        {
          "id": 5,
          "habilidade": "Trabalho em Equipe",
          "descricao": "Capacidade de trabalhar em equipe"
        }
      ]
    }
  }
}
```

**✅ O que isso significa:**
- Meta foi criada com sucesso
- Está associada às habilidades 1 e 5
- O campo `habilidades_desenvolvidas` mostra quais habilidades serão desenvolvidas
- Anote o `id` da meta para testes futuros!

---

## ❌ Teste 3: Criar Meta com Habilidades INVÁLIDAS

Agora você vai tentar criar uma meta com IDs de habilidades que NÃO existem. O sistema deve rejeitar com uma mensagem clara.

### Comando:

```bash
curl -X POST "http://localhost:3000/api/metas" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 5,
    "titulo_da_meta": "Teste com habilidades inválidas",
    "atividades": ["Atividade 1"],
    "data_vencimento": "2025-06-30",
    "status": "Em Progresso",
    "id_usuarios": [5],
    "id_habilidades": [999, 1000]
  }'
```

### Resposta Esperada (400 Bad Request):

```json
{
  "success": false,
  "error": "INVALID_HABILIDADES",
  "message": "Uma ou mais habilidades não existem",
  "habilidades_invalidas": [999, 1000]
}
```

**✅ O que isso significa:**
- O sistema identificou que os IDs 999 e 1000 não existem
- A meta NÃO foi criada (salvou o banco de dados!)
- Você sabe exatamente quais IDs eram inválidos
- **Isso resolve o erro de constraint que você estava tendo!**

---

## ❌ Teste 4: Criar Meta SEM Habilidades

Teste o que acontece quando você não fornece habilidades (obrigatório).

### Comando:

```bash
curl -X POST "http://localhost:3000/api/metas" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 5,
    "titulo_da_meta": "Meta sem habilidades",
    "atividades": ["Atividade 1"],
    "data_vencimento": "2025-06-30",
    "status": "Em Progresso",
    "id_usuarios": [5]
  }'
```

### Resposta Esperada (400 Bad Request):

```json
{
  "success": false,
  "error": "MISSING_HABILIDADES",
  "message": "Array de habilidades é obrigatório e deve conter pelo menos uma habilidade a desenvolver"
}
```

---

## 📊 Teste 5: Buscar Metas com Habilidades

Buscar as metas que você criou e verificar que as habilidades aparecem.

### Comando:

```bash
curl -X GET "http://localhost:3000/api/metas/usuario/5" \
  -H "Content-Type: application/json"
```

### Resposta Esperada (200 OK):

```json
{
  "success": true,
  "message": "Metas buscadas com sucesso",
  "data": {
    "usuario_id": 5,
    "quantidade_metas": 1,
    "progresso_medio": 0,
    "proximo_prazo": "2025-06-30",
    "metas": [
      {
        "id": 42,
        "titulo": "Melhorar comunicação em apresentações",
        "prazo": "2025-06-30",
        "status": "Em Progresso",
        "resultado_3_meses": "Ter completado 50% do curso",
        "resultado_6_meses": "Dominar técnicas de apresentação",
        "habilidades_desenvolvidas": [
          {
            "id": 1,
            "habilidade": "Comunicação",
            "descricao": "Capacidade de se comunicar de forma clara e eficaz"
          },
          {
            "id": 5,
            "habilidade": "Trabalho em Equipe",
            "descricao": "Capacidade de trabalhar em equipe"
          }
        ],
        "atividades": [
          "Fazer curso de apresentação executiva",
          "Praticar em reuniões internas",
          "Apresentar para stakeholders"
        ],
        "usuarios_envolvidos": [5]
      }
    ]
  }
}
```

**✅ O que isso significa:**
- As metas retornam com `habilidades_desenvolvidas`
- Você pode ver quais habilidades cada meta desenvolve
- O sistema está funcionando corretamente!

---

## 🎯 Resumo dos Testes

| Teste | Descrição | Resultado Esperado |
|-------|-----------|-------------------|
| 1️⃣ Teste 1 | Listar habilidades de um cargo | Lista com IDs válidos |
| 2️⃣ Teste 2 | Criar meta com habilidades válidas | Meta criada com sucesso (201) |
| 3️⃣ Teste 3 | Criar meta com habilidades inválidas | Erro claro indicando IDs inválidos (400) |
| 4️⃣ Teste 4 | Criar meta sem habilidades | Erro indicando que faltam habilidades (400) |
| 5️⃣ Teste 5 | Buscar metas do usuário | Retorna metas com habilidades_desenvolvidas |

---

## ✅ Checklist: O Erro Original Foi Resolvido?

- [ ] Teste 1: Você consegue listar habilidades de um cargo
- [ ] Teste 2: Você consegue criar uma meta com habilidades válidas
- [ ] Teste 3: Ao tentar criar com habilidades inválidas, recebe erro CLARO (não constraint error do DB)
- [ ] Teste 4: Sem habilidades, recebe erro solicitando que forneça
- [ ] Teste 5: Metas aparecem com habilidades_desenvolvidas quando busca

**Se todos os testes passarem: ✅ O problema foi resolvido!**

---

## 🐛 Se Ainda Tiver Erros

### Erro: Ainda vejo "foreign key constraint"

**Solução:**
1. Execute o Teste 1 para confirmar os IDs válidos
2. Use apenas esses IDs no Teste 2
3. A validação agora previne esse erro ANTES de tentar inserir

### Erro: Endpoint `/habilidades-cargo/:id_cargo` não encontrado

**Solução:**
1. Certifique-se de que o servidor foi reiniciado depois que o código foi alterado
2. Teste: `curl http://localhost:3000/api/metas/habilidades-cargo/1`
3. Verifique se a rota foi adicionada em `src/routes/metas.routes.js`

### Erro: "id_usuario" não existe

**Solução:**
1. Substitua `5` por um ID de usuário que existe no seu banco
2. Query: `SELECT id FROM usuarios LIMIT 5;`

### Erro: "id_cargo" não existe

**Solução:**
1. Substitua `1` por um ID de cargo que existe no seu banco
2. Query: `SELECT id FROM cargos LIMIT 5;`

---

## 📚 Documentação de Referência

- **Resumo Completo:** RESUMO_CORRECOES_V2.1.md
- **Documentação API:** ATUALIZACAO_METAS_HABILIDADES.md
- **Guia Detalhado de Testes:** GUIA_TESTE_METAS_HABILIDADES.md

---

**Versão:** 2.1  
**Data:** 12 Janeiro 2026  
**Status:** ✅ Pronto para Testar

Boa sorte com os testes! 🎉
