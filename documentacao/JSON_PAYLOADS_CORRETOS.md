# 📋 JSONs Corretos - Frontend para Backend

Este arquivo mostra EXATAMENTE os JSONs que o frontend deve enviar e o que o backend retorna.

---

## POST /api/controle-emocional (Registrar Check-in)

### ✅ Payload Enviado pelo Frontend

```json
{
  "id_user": 12,
  "score": 2,
  "motivo": "Cansaço extremo",
  "categoria_motivo": "cansaço"
}
```

### 📥 Resposta Retornada pelo Backend (201)

```json
{
  "success": true,
  "message": "Check-in emocional registrado com sucesso",
  "data": {
    "id": 1,
    "id_user": 12,
    "data_checkin": "2025-01-05",
    "score": 2,
    "motivo": "Cansaço extremo",
    "categoria_motivo": "cansaço",
    "gerou_acao": true,
    "acao": {
      "id": 5,
      "id_checkin": 1,
      "id_user": 12,
      "tipo_acao": "chat_agente_ia",
      "prioridade": "urgente",
      "status": "pendente",
      "observacoes": null,
      "created_at": "2025-01-05T10:30:00.000Z",
      "resolved_at": null
    },
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

## POST /api/controle-emocional (Score Alto - sem ação)

### ✅ Payload Enviado pelo Frontend

```json
{
  "id_user": 12,
  "score": 5
}
```

### 📥 Resposta Retornada pelo Backend (201)

```json
{
  "success": true,
  "message": "Check-in emocional registrado com sucesso",
  "data": {
    "id": 2,
    "id_user": 12,
    "data_checkin": "2025-01-05",
    "score": 5,
    "motivo": null,
    "categoria_motivo": null,
    "gerou_acao": false,
    "acao": null,
    "created_at": "2025-01-05T11:00:00.000Z"
  },
  "timestamp": "2025-01-05T11:00:00.000Z"
}
```

---

## GET /api/controle-emocional/:id_user/hoje

### 📥 Resposta Retornada pelo Backend (200)

```json
{
  "success": true,
  "message": "Check-in emocional de hoje",
  "data": {
    "id": 1,
    "id_user": 12,
    "data_checkin": "2025-01-05",
    "score": 2,
    "motivo": "Cansaço extremo",
    "categoria_motivo": "cansaço",
    "gerou_acao": true,
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

## PUT /api/controle-emocional/:id_checkin

### ✅ Payload Enviado pelo Frontend

```json
{
  "score": 3,
  "motivo": "Situação resolvida",
  "categoria_motivo": "outro"
}
```

### 📥 Resposta Retornada pelo Backend (200)

```json
{
  "success": true,
  "message": "Check-in emocional atualizado com sucesso",
  "data": {
    "id": 1,
    "id_user": 12,
    "data_checkin": "2025-01-05",
    "score": 3,
    "motivo": "Situação resolvida",
    "categoria_motivo": "outro",
    "gerou_acao": false,
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T11:30:00.000Z"
}
```

---

## POST /api/controle-emocional/profissionais

### ✅ Payload Enviado pelo Frontend (Completo)

```json
{
  "nome": "Dr. João Silva",
  "tipo_profissional": "psicologo",
  "crp_ou_registro": "CRP/SP 01234/2020",
  "especialidades": "Ansiedade, Depressão, Burnout",
  "telefone": "(11) 98765-4321",
  "email": "joao@example.com",
  "foto_url": "https://example.com/fotos/joao.jpg",
  "atende_online": true,
  "atende_presencial": false,
  "cidade": "São Paulo",
  "estado": "SP",
  "valor_sessao": 150.00
}
```

### ✅ Payload Enviado pelo Frontend (Mínimo)

```json
{
  "nome": "Dr. João Silva",
  "tipo_profissional": "psicologo",
  "crp_ou_registro": "CRP/SP 01234/2020"
}
```

### 📥 Resposta Retornada pelo Backend (201)

```json
{
  "success": true,
  "message": "Profissional criado com sucesso",
  "data": {
    "id": 1,
    "nome": "Dr. João Silva",
    "tipo_profissional": "psicologo",
    "crp_ou_registro": "CRP/SP 01234/2020",
    "especialidades": "Ansiedade, Depressão, Burnout",
    "telefone": "(11) 98765-4321",
    "email": "joao@example.com",
    "foto_url": "https://example.com/fotos/joao.jpg",
    "atende_online": true,
    "atende_presencial": false,
    "cidade": "São Paulo",
    "estado": "SP",
    "valor_sessao": 150.00,
    "ativo": true,
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

## GET /api/controle-emocional/profissionais

### 📥 Resposta Retornada pelo Backend (200)

```json
{
  "success": true,
  "message": "Profissionais encontrados",
  "data": {
    "total": 2,
    "limite": 30,
    "offset": 0,
    "paginas": 1,
    "registros": [
      {
        "id": 1,
        "nome": "Dr. João Silva",
        "tipo_profissional": "psicologo",
        "crp_ou_registro": "CRP/SP 01234/2020",
        "especialidades": "Ansiedade, Depressão, Burnout",
        "telefone": "(11) 98765-4321",
        "email": "joao@example.com",
        "foto_url": "https://example.com/fotos/joao.jpg",
        "atende_online": true,
        "atende_presencial": false,
        "cidade": "São Paulo",
        "estado": "SP",
        "valor_sessao": 150.00,
        "ativo": true,
        "created_at": "2025-01-05T10:30:00.000Z"
      }
    ]
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

## GET /api/controle-emocional/profissionais/:id

### 📥 Resposta Retornada pelo Backend (200)

```json
{
  "success": true,
  "message": "Profissional encontrado",
  "data": {
    "id": 1,
    "nome": "Dr. João Silva",
    "tipo_profissional": "psicologo",
    "crp_ou_registro": "CRP/SP 01234/2020",
    "especialidades": "Ansiedade, Depressão, Burnout",
    "telefone": "(11) 98765-4321",
    "email": "joao@example.com",
    "foto_url": "https://example.com/fotos/joao.jpg",
    "atende_online": true,
    "atende_presencial": false,
    "cidade": "São Paulo",
    "estado": "SP",
    "valor_sessao": 150.00,
    "ativo": true,
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

## PUT /api/controle-emocional/profissionais/:id

### ✅ Payload Enviado pelo Frontend

```json
{
  "especialidades": "Ansiedade, Depressão, Burnout, Estresse",
  "valor_sessao": 180.00,
  "ativo": true
}
```

### 📥 Resposta Retornada pelo Backend (200)

```json
{
  "success": true,
  "message": "Profissional atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "Dr. João Silva",
    "tipo_profissional": "psicologo",
    "crp_ou_registro": "CRP/SP 01234/2020",
    "especialidades": "Ansiedade, Depressão, Burnout, Estresse",
    "telefone": "(11) 98765-4321",
    "email": "joao@example.com",
    "foto_url": "https://example.com/fotos/joao.jpg",
    "atende_online": true,
    "atende_presencial": false,
    "cidade": "São Paulo",
    "estado": "SP",
    "valor_sessao": 180.00,
    "ativo": true,
    "created_at": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

## DELETE /api/controle-emocional/profissionais/:id

### 📥 Resposta Retornada pelo Backend (200)

```json
{
  "success": true,
  "message": "Profissional deletado com sucesso",
  "data": {
    "id": 1
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

## GET /api/controle-emocional/:id_user/historico

### 📥 Resposta Retornada pelo Backend (200)

```json
{
  "success": true,
  "message": "Histórico de check-ins emocionais",
  "data": {
    "id_user": 12,
    "total": 5,
    "limite": 30,
    "offset": 0,
    "paginas": 1,
    "registros": [
      {
        "id": 5,
        "id_user": 12,
        "data_checkin": "2025-01-05",
        "score": 4,
        "motivo": null,
        "categoria_motivo": null,
        "gerou_acao": false,
        "created_at": "2025-01-05T10:30:00.000Z"
      },
      {
        "id": 4,
        "id_user": 12,
        "data_checkin": "2025-01-04",
        "score": 2,
        "motivo": "Conflito com colega",
        "categoria_motivo": "conflito",
        "gerou_acao": true,
        "created_at": "2025-01-04T09:15:00.000Z"
      }
    ]
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

## GET /api/controle-emocional/:id_user/estatisticas

### 📥 Resposta Retornada pelo Backend (200)

```json
{
  "success": true,
  "message": "Estatísticas de bem-estar",
  "data": {
    "id_user": 12,
    "resumo": {
      "total_checkins": 31,
      "score_medio": 3.68,
      "score_minimo": 1,
      "score_maximo": 5,
      "dias_bom_estar": 18,
      "dias_neutro": 7,
      "dias_alerta": 6,
      "acoes_disparadas": 2
    },
    "motivos_frequentes": [
      {
        "categoria": "sobrecarga",
        "frequencia": 4
      },
      {
        "categoria": "ansiedade",
        "frequencia": 2
      }
    ]
  },
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

---

**Importante:** O Frontend deve enviar APENAS os campos listados nos "Payload Enviado pelo Frontend". Todos os outros campos (com `id`, datas) são gerados automaticamente pelo Backend.

