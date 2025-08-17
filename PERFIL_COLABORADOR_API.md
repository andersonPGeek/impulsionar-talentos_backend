# API de Perfil do Colaborador - Impulsionar Talentos

Documentação das APIs de perfil do colaborador do sistema.

## 🔐 Endpoints

### Base URL
```
http://localhost:3002/api/perfil-colaborador
```

---

## 📖 Buscar Perfil

**GET** `/:id_usuario`

Busca o perfil de um colaborador específico.

### Parâmetros da URL
- `id_usuario` (obrigatório): ID do usuário (número inteiro positivo)

### Exemplo de Request
```
GET /api/perfil-colaborador/1
```

### Response (200 - Sucesso)
```json
{
  "success": true,
  "message": "Perfil do colaborador encontrado com sucesso",
  "data": {
    "id_usuario": 1,
    "sobre_perfil": "Sou um desenvolvedor apaixonado por tecnologia...",
    "id_resultado_personalidades": 3,
    "id_resultado_sabotadores": 2
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (404 - Não encontrado)
```json
{
  "success": false,
  "message": "Perfil do colaborador não encontrado",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (400 - Erro de validação)
```json
{
  "success": false,
  "message": "ID do usuário deve ser um número inteiro positivo",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📝 Criar Perfil

**POST** `/`

Cria um novo perfil para um colaborador.

### Request Body
```json
{
  "id_usuario": 1,
  "sobre_perfil": "Sou um desenvolvedor apaixonado por tecnologia e inovação. Gosto de trabalhar em equipe e sempre busco aprender novas tecnologias."
}
```

### Validações
- `id_usuario`: Deve ser um número inteiro positivo
- `sobre_perfil`: Deve ser uma string entre 1 e 2000 caracteres

### Response (201 - Criado com sucesso)
```json
{
  "success": true,
  "message": "Perfil do colaborador criado com sucesso",
  "data": {
    "id_usuario": 1,
    "sobre_perfil": "Sou um desenvolvedor apaixonado por tecnologia e inovação. Gosto de trabalhar em equipe e sempre busco aprender novas tecnologias.",
    "id_resultado_personalidades": null,
    "id_resultado_sabotadores": null
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (400 - Erro de validação)
```json
{
  "success": false,
  "message": "Campo sobre_perfil é obrigatório",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (400 - Perfil já existe)
```json
{
  "success": false,
  "message": "Já existe um perfil para este usuário. Use PUT para atualizar.",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔄 Atualizar Perfil

**PUT** `/`

Atualiza o perfil de um colaborador existente.

### Request Body
```json
{
  "id_usuario": 1,
  "sobre_perfil": "Sou um desenvolvedor full-stack com 5 anos de experiência. Especializado em React, Node.js e PostgreSQL. Gosto de trabalhar em projetos desafiadores."
}
```

### Validações
- `id_usuario`: Deve ser um número inteiro positivo
- `sobre_perfil`: Deve ser uma string entre 1 e 2000 caracteres

### Response (200 - Atualizado com sucesso)
```json
{
  "success": true,
  "message": "Perfil do colaborador atualizado com sucesso",
  "data": {
    "id_usuario": 1,
    "sobre_perfil": "Sou um desenvolvedor full-stack com 5 anos de experiência. Especializado em React, Node.js e PostgreSQL. Gosto de trabalhar em projetos desafiadores.",
    "id_resultado_personalidades": 3,
    "id_resultado_sabotadores": 2
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (404 - Perfil não encontrado)
```json
{
  "success": false,
  "message": "Perfil do colaborador não encontrado. Use POST para criar.",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (400 - Erro de validação)
```json
{
  "success": false,
  "message": "Campo sobre_perfil é obrigatório",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📋 Como Usar

### Exemplo com cURL

#### Buscar perfil
```bash
curl -X GET "http://localhost:3002/api/perfil-colaborador/1"
```

#### Criar perfil
```bash
curl -X POST "http://localhost:3002/api/perfil-colaborador" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "sobre_perfil": "Sou um desenvolvedor apaixonado por tecnologia..."
  }'
```

#### Atualizar perfil
```bash
curl -X PUT "http://localhost:3002/api/perfil-colaborador" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "sobre_perfil": "Sou um desenvolvedor full-stack com experiência..."
  }'
```

### Exemplo com JavaScript (fetch)

#### Buscar perfil
```javascript
const response = await fetch('http://localhost:3002/api/perfil-colaborador/1');
const data = await response.json();
console.log(data);
```

#### Criar perfil
```javascript
const response = await fetch('http://localhost:3002/api/perfil-colaborador', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id_usuario: 1,
    sobre_perfil: 'Sou um desenvolvedor apaixonado por tecnologia...'
  })
});
const data = await response.json();
console.log(data);
```

#### Atualizar perfil
```javascript
const response = await fetch('http://localhost:3002/api/perfil-colaborador', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id_usuario: 1,
    sobre_perfil: 'Sou um desenvolvedor full-stack com experiência...'
  })
});
const data = await response.json();
console.log(data);
```

---

## 📊 Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso (GET, PUT) |
| 201 | Criado com sucesso (POST) |
| 400 | Erro de validação ou perfil já existe |
| 404 | Perfil não encontrado |
| 500 | Erro interno do servidor |

---

## 🔍 Estrutura da Tabela

A API trabalha com a tabela `perfil_colaborador` que possui a seguinte estrutura:

```sql
CREATE TABLE perfil_colaborador (
  id SERIAL PRIMARY KEY,
  id_usuario BIGINT NOT NULL,
  sobre_perfil TEXT,
  id_resultado_personalidades BIGINT,
  id_resultado_sabotadores BIGINT,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);
```

### Campos

- **id**: Chave primária (auto-incremento)
- **id_usuario**: ID do usuário (FK para tabela usuarios)
- **sobre_perfil**: Texto descritivo sobre o perfil do colaborador
- **id_resultado_personalidades**: ID do resultado de personalidades (opcional)
- **id_resultado_sabotadores**: ID do resultado de sabotadores (opcional)

---

## ⚠️ Observações

1. **Validações**: Todas as requisições são validadas automaticamente
2. **Duplicação**: Não é possível criar dois perfis para o mesmo usuário
3. **Campos opcionais**: `id_resultado_personalidades` e `id_resultado_sabotadores` são gerenciados por outras APIs
4. **Consistência**: A API garante que o `id_usuario` existe na tabela `usuarios` 