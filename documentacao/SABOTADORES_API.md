# API de Sabotadores - Impulsionar Talentos

Documentação das APIs de sabotadores do sistema.

## 🔐 Endpoints

### Base URL
```
http://localhost:3002/api/sabotadores
```

---

## 📖 Buscar Perguntas Pendentes

**GET** `/:id_usuario/perguntas-pendentes`

Busca todas as perguntas dos sabotadores que ainda não foram respondidas pelo usuário.

### Parâmetros da URL
- `id_usuario` (obrigatório): ID do usuário (número inteiro positivo)

### Exemplo de Request
```
GET /api/sabotadores/1/perguntas-pendentes
```

### Response (200 - Sucesso)
```json
{
  "success": true,
  "message": "Perguntas pendentes encontradas com sucesso",
  "data": {
    "id_usuario": 1,
    "perguntas_pendentes": [
      {
        "id": 1,
        "titulo_pergunta": "Você costuma procrastinar tarefas importantes?",
        "sabotador": "Procrastinador",
        "imagem": "procrastinador.jpg"
      },
      {
        "id": 2,
        "titulo_pergunta": "Você se sente ansioso antes de apresentações?",
        "sabotador": "Ansioso",
        "imagem": "ansioso.jpg"
      }
    ],
    "total_perguntas": 2
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (404 - Não encontrado)
```json
{
  "success": false,
  "message": "Usuário não encontrado",
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

## 📝 Salvar Respostas

**POST** `/respostas`

Salva as respostas das perguntas dos sabotadores. Se todas as perguntas forem respondidas, calcula automaticamente o resultado.

### Request Body
```json
{
  "id_usuario": 1,
  "respostas": [
    {
      "id_pergunta": 1,
      "resposta": 3
    },
    {
      "id_pergunta": 2,
      "resposta": 4
    },
    {
      "id_pergunta": 3,
      "resposta": 2
    }
  ]
}
```

### Validações
- `id_usuario`: Deve ser um número inteiro positivo
- `respostas`: Deve ser um array não vazio
- `respostas.*.id_pergunta`: Deve ser um número inteiro positivo
- `respostas.*.resposta`: Deve ser um valor entre 1 e 5

### Response (200 - Respostas salvas)
```json
{
  "success": true,
  "message": "Respostas salvas com sucesso",
  "data": {
    "id_usuario": 1,
    "respostas_salvas": 3,
    "todas_perguntas_respondidas": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (200 - Respostas parciais salvas)
```json
{
  "success": true,
  "message": "Respostas salvas com sucesso",
  "data": {
    "id_usuario": 1,
    "respostas_salvas": 2,
    "todas_perguntas_respondidas": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (400 - Erro de validação)
```json
{
  "success": false,
  "message": "Resposta deve ser um valor entre 1 e 5",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔍 Buscar Resultado

**GET** `/:id_usuario/resultado`

Busca o resultado final dos sabotadores para um usuário específico.

### Parâmetros da URL
- `id_usuario` (obrigatório): ID do usuário (número inteiro positivo)

### Exemplo de Request
```
GET /api/sabotadores/1/resultado
```

### Response (200 - Sucesso)
```json
{
  "success": true,
  "message": "Resultado dos sabotadores encontrado com sucesso",
  "data": {
    "id_usuario": 1,
    "resultado": [
      {
        "sabotador": "Procrastinador",
        "nivel": "Moderado",
        "descricao": "Você tem uma tendência moderada a procrastinar tarefas importantes. Isso pode afetar sua produtividade em alguns momentos."
      },
      {
        "sabotador": "Ansioso",
        "nivel": "Baixo",
        "descricao": "Você demonstra baixa ansiedade em situações de pressão. Isso é uma qualidade positiva para seu desenvolvimento."
      },
      {
        "sabotador": "Perfeccionista",
        "nivel": "Alto",
        "descricao": "Você tem uma tendência alta ao perfeccionismo. Isso pode ser positivo para qualidade, mas pode atrasar entregas."
      }
    ],
    "total_sabotadores": 3
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (404 - Resultado não encontrado)
```json
{
  "success": false,
  "message": "Resultado dos sabotadores não encontrado. Complete o teste primeiro.",
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

## 📋 Como Usar

### Exemplo com cURL

#### Buscar perguntas pendentes
```bash
curl -X GET "http://localhost:3002/api/sabotadores/1/perguntas-pendentes"
```

#### Salvar respostas
```bash
curl -X POST "http://localhost:3002/api/sabotadores/respostas" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "respostas": [
      {"id_pergunta": 1, "resposta": 3},
      {"id_pergunta": 2, "resposta": 4},
      {"id_pergunta": 3, "resposta": 2}
    ]
  }'
```

#### Buscar resultado
```bash
curl -X GET "http://localhost:3002/api/sabotadores/1/resultado"
```

### Exemplo com JavaScript (fetch)

#### Buscar perguntas pendentes
```javascript
const response = await fetch('http://localhost:3002/api/sabotadores/1/perguntas-pendentes');
const data = await response.json();
console.log(data);
```

#### Salvar respostas
```javascript
const response = await fetch('http://localhost:3002/api/sabotadores/respostas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id_usuario: 1,
    respostas: [
      { id_pergunta: 1, resposta: 3 },
      { id_pergunta: 2, resposta: 4 },
      { id_pergunta: 3, resposta: 2 }
    ]
  })
});
const data = await response.json();
console.log(data);
```

#### Buscar resultado
```javascript
const response = await fetch('http://localhost:3002/api/sabotadores/1/resultado');
const data = await response.json();
console.log(data);
```

---

## 📊 Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso (GET, POST) |
| 400 | Erro de validação |
| 404 | Não encontrado |
| 500 | Erro interno do servidor |

---

## 🔍 Estrutura das Tabelas

A API trabalha com as seguintes tabelas:

### perguntas_sabotadores
```sql
CREATE TABLE perguntas_sabotadores (
  id SERIAL PRIMARY KEY,
  titulo_pergunta TEXT NOT NULL,
  id_sabotador BIGINT NOT NULL,
  FOREIGN KEY (id_sabotador) REFERENCES sabotadores(id)
);
```

### respostas_sabotadores
```sql
CREATE TABLE respostas_sabotadores (
  id SERIAL PRIMARY KEY,
  id_usuario BIGINT NOT NULL,
  id_pergunta BIGINT NOT NULL,
  resposta INTEGER NOT NULL CHECK (resposta >= 1 AND resposta <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_pergunta) REFERENCES perguntas_sabotadores(id)
);
```

### resultado_sabotadores
```sql
CREATE TABLE resultado_sabotadores (
  id SERIAL PRIMARY KEY,
  id_usuario BIGINT NOT NULL,
  id_sabotador BIGINT NOT NULL,
  pontuacao DECIMAL(3,2) NOT NULL,
  nivel VARCHAR(20) NOT NULL,
  id_descricao_sabotadores BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_sabotador) REFERENCES sabotadores(id),
  FOREIGN KEY (id_descricao_sabotadores) REFERENCES descricoes_sabotadores(id)
);
```

### descricoes_sabotadores
```sql
CREATE TABLE descricoes_sabotadores (
  id SERIAL PRIMARY KEY,
  id_sabotador BIGINT NOT NULL,
  nivel VARCHAR(20) NOT NULL,
  descricao TEXT NOT NULL,
  FOREIGN KEY (id_sabotador) REFERENCES sabotadores(id)
);
```

---

## 🧮 Lógica de Cálculo

### Escala de Respostas
- **1**: Discordo totalmente
- **2**: Discordo
- **3**: Neutro
- **4**: Concordo
- **5**: Concordo totalmente

### Cálculo da Média
Para cada sabotador, a média é calculada somando todas as respostas das perguntas daquele sabotador e dividindo pelo número de perguntas.

### Níveis de Sabotagem
| Média final | Nível de sabotagem |
| ----------- | ------------------ |
| 1.0 – 2.4   | **Baixo**          |
| 2.5 – 3.9   | **Moderado**       |
| 4.0 – 5.0   | **Alto**           |

---

## ⚠️ Observações

1. **Transações**: O salvamento de respostas usa transações para garantir consistência
2. **Cálculo Automático**: O resultado é calculado automaticamente quando todas as perguntas são respondidas
3. **Validações**: Todas as respostas são validadas (1-5) antes de serem salvas
4. **Atualização**: Se uma pergunta já foi respondida, a resposta é atualizada
5. **Integração**: O resultado é automaticamente vinculado ao perfil do colaborador 