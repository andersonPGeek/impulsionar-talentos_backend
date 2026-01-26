# 🧪 Guia de Teste: Metas com Habilidades

**Data:** Janeiro 2026  
**Status:** Pronto para testar

---

## 📋 Resumo

Este guia descreve como testar a nova funcionalidade de associação de metas a habilidades implementada no sistema.

---

## 🚀 Passo 1: Validar Habilidades Disponíveis

Antes de criar uma meta, você precisa saber quais habilidades estão disponíveis para um cargo.

### Request: Listar Habilidades de um Cargo

```bash
curl -X GET "http://localhost:3000/api/metas/habilidades-cargo/1" \
  -H "Content-Type: application/json"
```

### Response Esperada (200 OK):

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

**⚠️ Importante:** Anote os IDs das habilidades! Você vai precisar deles no próximo passo.

---

## 🎯 Passo 2: Criar uma Meta com Habilidades

Agora que você sabe quais habilidades estão disponíveis, pode criar uma meta associando-a com uma ou mais habilidades.

### Request: Criar Meta

```bash
curl -X POST "http://localhost:3000/api/metas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_jwt" \
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

### Response Esperada (201 Created):

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
      "created_at": "2026-01-12T02:50:00Z",
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

### Cenários de Erro:

#### ❌ Erro 1: Faltam Habilidades

**Request:**
```bash
curl -X POST "http://localhost:3000/api/metas" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 5,
    "titulo_da_meta": "Teste sem habilidades",
    "atividades": ["Atividade 1"],
    "data_vencimento": "2025-06-30",
    "status": "Em Progresso",
    "id_usuarios": [5],
    "observacao_gestor": "Teste"
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "MISSING_HABILIDADES",
  "message": "Array de habilidades é obrigatório e deve conter pelo menos uma habilidade a desenvolver"
}
```

---

#### ❌ Erro 2: Habilidade Inválida

**Request:**
```bash
curl -X POST "http://localhost:3000/api/metas" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 5,
    "titulo_da_meta": "Teste com habilidade inválida",
    "atividades": ["Atividade 1"],
    "data_vencimento": "2025-06-30",
    "status": "Em Progresso",
    "id_usuarios": [5],
    "id_habilidades": [999, 1000]
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "INVALID_HABILIDADES",
  "message": "Uma ou mais habilidades não existem",
  "habilidades_invalidas": [999, 1000]
}
```

---

## 📊 Passo 3: Buscar Metas com Habilidades

Depois de criar uma meta, você pode buscar todas as metas de um usuário e ver as habilidades associadas.

### Request: Buscar Metas do Usuário

```bash
curl -X GET "http://localhost:3000/api/metas/usuario/5" \
  -H "Content-Type: application/json"
```

### Response Esperada (200 OK):

```json
{
  "success": true,
  "message": "Metas buscadas com sucesso",
  "data": {
    "usuario_id": 5,
    "quantidade_metas": 2,
    "progresso_medio": 50,
    "proximo_prazo": "2025-03-31",
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

---

## 🎓 Passo 4: Buscar Habilidades com Metas Associadas

Você pode ver quais metas estão ajudando a desenvolver cada habilidade.

### Request: Buscar Habilidades do Usuário

```bash
curl -X GET "http://localhost:3000/api/habilidades-usuarios/usuario/5" \
  -H "Content-Type: application/json"
```

### Response Esperada (200 OK):

```json
{
  "success": true,
  "message": "Habilidades buscadas com sucesso",
  "data": {
    "usuario_id": 5,
    "quantidade_habilidades": 3,
    "habilidades": [
      {
        "id": 1,
        "titulo": "Comunicação",
        "descricao": "Capacidade de se comunicar de forma clara e eficaz",
        "nivel": 3,
        "created_at": "2024-01-15T10:30:00Z",
        "metas_associadas": [
          {
            "id": 42,
            "titulo": "Melhorar comunicação em apresentações",
            "prazo": "2025-06-30",
            "status": "Em Progresso",
            "resultado_3_meses": "Ter completado 50% do curso",
            "resultado_6_meses": "Dominar técnicas de apresentação"
          }
        ]
      },
      {
        "id": 5,
        "titulo": "Trabalho em Equipe",
        "descricao": "Capacidade de trabalhar em equipe",
        "nivel": 2,
        "created_at": "2024-01-20T14:45:00Z",
        "metas_associadas": [
          {
            "id": 42,
            "titulo": "Melhorar comunicação em apresentações",
            "prazo": "2025-06-30",
            "status": "Em Progresso",
            "resultado_3_meses": "Ter completado 50% do curso",
            "resultado_6_meses": "Dominar técnicas de apresentação"
          },
          {
            "id": 45,
            "titulo": "Desenvolvendo liderança em projetos",
            "prazo": "2025-09-30",
            "status": "Planejamento",
            "resultado_3_meses": "Projeto iniciado",
            "resultado_6_meses": "Projeto concluído com sucesso"
          }
        ]
      }
    ]
  }
}
```

---

## 🤖 Passo 5: Gerar PDI com IA (com Habilidades)

A IA agora gera metas que já vêm associadas com habilidades.

### Request: Gerar PDI

```bash
curl -X POST "http://localhost:3000/api/ia/gerar-pdi" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_jwt" \
  -d '{
    "id_user": 5,
    "descricao_usuario": "Desenvolvedor Senior em Java com 5 anos de experiência",
    "expectativas_gestor": "Melhorar habilidades de liderança e comunicação",
    "desafios": "Dificuldade em delegação de tarefas"
  }'
```

### Response Esperada (200 OK):

```json
{
  "success": true,
  "id_user": 5,
  "pdi": [
    {
      "titulo": "Desenvolver liderança através de mentoria",
      "atividades": [
        "Fazer curso de liderança ágil",
        "Mentorizar 2 desenvolvedores juniors",
        "Participar de reuniões de liderança"
      ],
      "prazo": "2025-06-30",
      "status": "Em Progresso",
      "resultado_3_meses": "Mentoria iniciada com 2 juniors",
      "resultado_6_meses": "Juniors desenvolvidos, feedback positivo do time",
      "feedback_gestor": "Investir em desenvolvimento de liderança",
      "id_habilidades": [2, 5]
    },
    {
      "titulo": "Aprimorar comunicação estratégica",
      "atividades": [
        "Fazer workshop de comunicação executiva",
        "Apresentar roadmap técnico mensalmente",
        "Documentar arquitetura de projetos"
      ],
      "prazo": "2025-06-30",
      "status": "Em Progresso",
      "resultado_3_meses": "Primeiras apresentações executivas realizadas",
      "resultado_6_meses": "Ser referência em comunicação técnica",
      "feedback_gestor": "Aprimorar articulação de ideias",
      "id_habilidades": [1]
    }
  ],
  "total_metas": 2,
  "gerado_por": "OpenAI GPT-4o-mini"
}
```

**✅ Note:** A IA automaticamente selecionou `id_habilidades` para cada meta!

---

## 🐛 Troubleshooting

### Problema: Foreign Key Constraint Error

**Erro:**
```
insert or update on table "meta_habilidades" violates foreign key constraint "meta_habilidades_id_habilidade_fkey"
```

**Solução:**
1. Verifique se o `id_habilidade` existe na tabela `habilidades_cargo`
2. Use o endpoint `GET /api/metas/habilidades-cargo/:id_cargo` para ver os IDs disponíveis
3. Certifique-se de enviar IDs válidos no array `id_habilidades`

### Problema: Array Vazio de Habilidades

**Erro:**
```json
{
  "success": false,
  "error": "MISSING_HABILIDADES",
  "message": "Array de habilidades é obrigatório e deve conter pelo menos uma habilidade a desenvolver"
}
```

**Solução:**
Sempre envie pelo menos uma habilidade no array `id_habilidades`.

### Problema: Habilidades Inválidas

**Erro:**
```json
{
  "success": false,
  "error": "INVALID_HABILIDADES",
  "message": "Uma ou mais habilidades não existem",
  "habilidades_invalidas": [999, 1000]
}
```

**Solução:**
1. Use o endpoint de listar habilidades para confirmar os IDs válidos
2. Verifique se está usando o cargo correto
3. Confirme que não há typos nos IDs

---

## ✅ Checklist de Validação

- [ ] Endpoint `GET /api/metas/habilidades-cargo/:id_cargo` retorna habilidades disponíveis
- [ ] Endpoint `POST /api/metas` rejeita quando `id_habilidades` não é fornecido
- [ ] Endpoint `POST /api/metas` rejeita quando `id_habilidades` contém IDs inválidos
- [ ] Endpoint `POST /api/metas` cria meta com sucesso quando `id_habilidades` é válido
- [ ] Meta criada aparece com `habilidades_desenvolvidas` ao buscar
- [ ] Habilidades aparecem com `metas_associadas` ao buscar
- [ ] IA gera metas com `id_habilidades` preenchido
- [ ] Metas geradas pela IA são salvas corretamente com habilidades associadas

---

## 📞 Contato

Se encontrar problemas durante o teste:
1. Verifique os logs do servidor
2. Consulte a documentação ATUALIZACAO_METAS_HABILIDADES.md
3. Verifique os IDs no banco de dados diretamente

---

**Versão:** 1.0  
**Data:** Janeiro 2026  
**Status:** Pronto para Teste
