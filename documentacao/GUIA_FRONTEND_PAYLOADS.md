# 📋 Guia: O que o Frontend Deve e Não Deve Enviar

## Resumo Executivo

O **frontend deve enviar apenas informações que ele possui**. IDs e datas são **gerados automaticamente pelo backend**.

---

## ✅ O QUE O FRONTEND DEVE ENVIAR

### POST /api/controle-emocional (Registrar Check-in)

```json
{
  "id_user": 12,
  "score": 5,
  "motivo": "Opcional - apenas se score <= 3",
  "categoria_motivo": "Opcional - classificação do motivo"
}
```

**Campos obrigatórios:**
- `id_user` - ID do usuário logado
- `score` - Nota de 1 a 5

**Campos opcionais:**
- `motivo` - OBRIGATÓRIO se score <= 3, opcional se score > 3
- `categoria_motivo` - Sempre opcional

---

## ❌ O QUE O FRONTEND NÃO DEVE ENVIAR

| Campo | Por Que | Quem Gera |
|-------|---------|-----------|
| `id` ou `id_checkin` | Gerado automaticamente pelo banco | Backend |
| `id` (da ação) | Gerado automaticamente pelo banco | Backend |
| `data_checkin` | Sempre usa a data atual (CURRENT_DATE) | Backend |
| `created_at` | Sempre usa a hora atual (now()) | Backend |
| `created_at` (da ação) | Sempre usa a hora atual (now()) | Backend |
| `resolved_at` | Inicializado como NULL, atualizado internamente | Backend |
| `gerou_acao` | Definido automaticamente baseado no score | Backend |
| `status` (da ação) | Sempre inicia como 'pendente' | Backend |
| `prioridade` (da ação) | Definida automaticamente baseado no score | Backend |
| `tipo_acao` (da ação) | Definido automaticamente baseado no score | Backend |

---

## 🔄 Fluxo Completo

### Passo 1: Frontend Envia

```bash
curl -X POST "http://localhost:3002/api/controle-emocional" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_user": 12,
    "score": 2,
    "motivo": "Cansaço extremo",
    "categoria_motivo": "cansaço"
  }'
```

### Passo 2: Backend Processa

```
1. Valida dados recebidos
   ✓ id_user existe?
   ✓ score está entre 1-5?
   ✓ Se score <= 3, motivo foi enviado e não está vazio?

2. Insere check-in na tabela e gera:
   - id = auto-incremental (ex: 1)
   - data_checkin = CURRENT_DATE (ex: 2025-01-05)
   - created_at = now() (ex: 2025-01-05T10:30:00Z)

3. Verifica: score <= 3?
   SIM → Cria ação automaticamente com:
   - id = auto-incremental (ex: 5)
   - id_checkin = 1
   - id_user = 12
   - tipo_acao = 'chat_agente_ia' (se score <= 2) ou 'alerta_gestor' (se score == 3)
   - prioridade = 'urgente' (se score <= 2) ou 'normal' (se score == 3)
   - status = 'pendente'
   - created_at = now()
   - resolved_at = NULL
   
   NÃO → Sem ação

4. Retorna check-in + ação com todos os dados
```

### Passo 3: Backend Retorna

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

### Passo 4: Frontend Usa os Dados

O frontend pode agora:
- Armazenar `id` (1) para atualizações futuras via PUT
- Exibir a ação criada ao usuário se `gerou_acao = true`
- Usar `data_checkin` para exibir a data do registro
- Usar `created_at` para fins de auditoria

---

## 💡 Casos de Uso

### Caso 1: Score Alto (sem ação)

**Frontend:**
```json
{ "id_user": 12, "score": 5 }
```

**Backend retorna:**
```json
{
  "id": 2,
  "id_user": 12,
  "data_checkin": "2025-01-05",
  "score": 5,
  "motivo": null,
  "categoria_motivo": null,
  "gerou_acao": false,
  "acao": null,
  "created_at": "2025-01-05T11:00:00.000Z"
}
```

✅ Simples! Sem ação criada.

### Caso 2: Score Médio (ação normal)

**Frontend:**
```json
{
  "id_user": 12,
  "score": 3,
  "motivo": "Dia desafiador",
  "categoria_motivo": "outro"
}
```

**Backend retorna:**
```json
{
  "id": 3,
  "id_user": 12,
  "data_checkin": "2025-01-05",
  "score": 3,
  "motivo": "Dia desafiador",
  "categoria_motivo": "outro",
  "gerou_acao": true,
  "acao": {
    "id": 6,
    "id_checkin": 3,
    "tipo_acao": "alerta_gestor",
    "prioridade": "normal",
    "status": "pendente",
    "created_at": "2025-01-05T11:10:00.000Z"
  }
}
```

⚠️ Ação criada com prioridade normal.

### Caso 3: Score Baixo (ação urgente)

**Frontend:**
```json
{
  "id_user": 12,
  "score": 1,
  "motivo": "Crise emocional",
  "categoria_motivo": "ansiedade"
}
```

**Backend retorna:**
```json
{
  "id": 4,
  "id_user": 12,
  "data_checkin": "2025-01-05",
  "score": 1,
  "motivo": "Crise emocional",
  "categoria_motivo": "ansiedade",
  "gerou_acao": true,
  "acao": {
    "id": 7,
    "id_checkin": 4,
    "tipo_acao": "chat_agente_ia",
    "prioridade": "urgente",
    "status": "pendente",
    "created_at": "2025-01-05T11:20:00.000Z"
  }
}
```

🚨 Ação criada com prioridade urgente.

---

## 📝 Validações no Frontend

Antes de enviar dados para o backend, o frontend deve validar:

```javascript
// Validar id_user
if (!id_user || id_user <= 0) {
  throw new Error('ID do usuário inválido');
}

// Validar score
if (!score || score < 1 || score > 5) {
  throw new Error('Score deve ser entre 1 e 5');
}

// Validar motivo se score <= 3
if (score <= 3 && (!motivo || motivo.trim() === '')) {
  throw new Error('Motivo é obrigatório quando score <= 3');
}
```

---

## 🔍 Exemplo Completo (JavaScript/React)

```javascript
async function registrarCheckIn(idUser, score, motivo, categoria) {
  // Validação
  if (!idUser || score < 1 || score > 5) {
    throw new Error('Dados inválidos');
  }
  if (score <= 3 && !motivo) {
    throw new Error('Motivo é obrigatório para scores baixos');
  }

  // Preparar payload (APENAS estes campos)
  const payload = {
    id_user: idUser,
    score: score,
    ...(motivo && { motivo }),           // Opcional
    ...(categoria && { categoria_motivo: categoria }) // Opcional
  };

  // Enviar
  const response = await fetch('http://localhost:3002/api/controle-emocional', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  // Usar resposta
  if (data.success) {
    const checkInId = data.data.id;        // Gerado pelo backend
    const acaoId = data.data.acao?.id;     // Gerado pelo backend se score <= 3
    const dataCriacao = data.data.created_at; // Gerado pelo backend

    console.log(`Check-in ${checkInId} criado em ${dataCriacao}`);
    if (data.data.gerou_acao) {
      console.log(`Ação ${acaoId} criada automaticamente`);
    }
  }

  return data;
}
```

---

## ✨ Resumo Final

| Aspecto | O que fazer |
|---------|------------|
| **IDs** | ❌ Não enviar. Use os retornados pelo backend |
| **Datas** | ❌ Não enviar. Backend gera automaticamente |
| **Status/Prioridade** | ❌ Não enviar. Backend define automaticamente |
| **Dados do Usuário** | ✅ Enviar apenas `id_user` |
| **Score** | ✅ Sempre enviar (1-5) |
| **Motivo** | ✅ Enviar se score <= 3, opcional se > 3 |

---

**Data:** Janeiro 5, 2026  
**Versão:** 1.0
