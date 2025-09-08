# API de Personalidade MBTI - Impulsionar Talentos

Documentação das APIs de personalidade MBTI do sistema.

## 🔐 Endpoints

### Base URL
```
http://localhost:3002/api/personalidade
```

---

## 📖 Buscar Perguntas Pendentes

**GET** `/:id_usuario/perguntas-pendentes`

Busca todas as perguntas do teste MBTI que ainda não foram respondidas pelo usuário.

### Parâmetros da URL
- `id_usuario` (obrigatório): ID do usuário (número inteiro positivo)

### Exemplo de Request
```
GET /api/personalidade/1/perguntas-pendentes
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
        "titulo_pergunta": "Você prefere trabalhar em grupo ou individualmente?",
        "dimensao": "E",
        "weight": 1
      },
      {
        "id": 2,
        "titulo_pergunta": "Você gosta de ter flexibilidade em seus horários?",
        "dimensao": "P",
        "weight": -1
      },
      {
        "id": 3,
        "titulo_pergunta": "Você toma decisões baseadas em lógica ou sentimentos?",
        "dimensao": "T",
        "weight": 1
      }
    ],
    "total_perguntas": 3
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

Salva as respostas das perguntas do teste MBTI. Se todas as perguntas forem respondidas, calcula automaticamente o tipo de personalidade.

### Request Body
```json
{
  "id_usuario": 1,
  "respostas": [
    {
      "id_pergunta": 1,
      "resposta": 4,
      "dimensao": "E",
      "weight": 1
    },
    {
      "id_pergunta": 2,
      "resposta": 3,
      "dimensao": "P",
      "weight": -1
    },
    {
      "id_pergunta": 3,
      "resposta": 5,
      "dimensao": "T",
      "weight": 1
    }
  ]
}
```

### Validações
- `id_usuario`: Deve ser um número inteiro positivo
- `respostas`: Deve ser um array não vazio
- `respostas.*.id_pergunta`: Deve ser um número inteiro positivo
- `respostas.*.resposta`: Deve ser um valor entre 1 e 5
- `respostas.*.dimensao`: Deve ser uma das letras MBTI: E, I, S, N, T, F, J, P
- `respostas.*.weight`: Deve ser um número (pode ser negativo)

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
  "message": "Dimensão deve ser uma das letras MBTI: E, I, S, N, T, F, J, P",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔍 Buscar Resultado

**GET** `/:id_usuario/resultado`

Busca o resultado final do teste MBTI para um usuário específico.

### Parâmetros da URL
- `id_usuario` (obrigatório): ID do usuário (número inteiro positivo)

### Exemplo de Request
```
GET /api/personalidade/1/resultado
```

### Response (200 - Sucesso)
```json
{
  "success": true,
  "message": "Resultado da personalidade encontrado com sucesso",
  "data": {
    "id_usuario": 1,
    "resultado": {
      "dimensao": "ENTP",
      "nome": "O Inovador",
      "descricao": "Os ENTPs são conhecidos por sua criatividade, flexibilidade e habilidade de ver possibilidades. Eles são excelentes em resolver problemas complexos e gostam de desafios intelectuais.",
      "imagem": "entp.jpg"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (404 - Resultado não encontrado)
```json
{
  "success": false,
  "message": "Resultado da personalidade não encontrado. Complete o teste primeiro.",
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
curl -X GET "http://localhost:3002/api/personalidade/1/perguntas-pendentes"
```

#### Salvar respostas
```bash
curl -X POST "http://localhost:3002/api/personalidade/respostas" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "respostas": [
      {"id_pergunta": 1, "resposta": 4, "dimensao": "E", "weight": 1},
      {"id_pergunta": 2, "resposta": 3, "dimensao": "P", "weight": -1},
      {"id_pergunta": 3, "resposta": 5, "dimensao": "T", "weight": 1}
    ]
  }'
```

#### Buscar resultado
```bash
curl -X GET "http://localhost:3002/api/personalidade/1/resultado"
```

### Exemplo com JavaScript (fetch)

#### Buscar perguntas pendentes
```javascript
const response = await fetch('http://localhost:3002/api/personalidade/1/perguntas-pendentes');
const data = await response.json();
console.log(data);
```

#### Salvar respostas
```javascript
const response = await fetch('http://localhost:3002/api/personalidade/respostas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id_usuario: 1,
    respostas: [
      { id_pergunta: 1, resposta: 4, dimensao: 'E', weight: 1 },
      { id_pergunta: 2, resposta: 3, dimensao: 'P', weight: -1 },
      { id_pergunta: 3, resposta: 5, dimensao: 'T', weight: 1 }
    ]
  })
});
const data = await response.json();
console.log(data);
```

#### Buscar resultado
```javascript
const response = await fetch('http://localhost:3002/api/personalidade/1/resultado');
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

### perguntas_personalidade
```sql
CREATE TABLE perguntas_personalidade (
  id SERIAL PRIMARY KEY,
  titulo_pergunta TEXT NOT NULL,
  dimensao VARCHAR(1) NOT NULL CHECK (dimensao IN ('E', 'I', 'S', 'N', 'T', 'F', 'J', 'P')),
  weight DECIMAL(3,2) NOT NULL
);
```

### respostas_personalidade
```sql
CREATE TABLE respostas_personalidade (
  id SERIAL PRIMARY KEY,
  id_usuario BIGINT NOT NULL,
  id_pergunta BIGINT NOT NULL,
  resposta INTEGER NOT NULL CHECK (resposta >= 1 AND resposta <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_pergunta) REFERENCES perguntas_personalidade(id)
);
```

### resultado_personalidade
```sql
CREATE TABLE resultado_personalidade (
  id SERIAL PRIMARY KEY,
  id_usuario BIGINT NOT NULL,
  id_personalidade BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_personalidade) REFERENCES dimensoes_personalidade(id)
);
```

### dimensoes_personalidade
```sql
CREATE TABLE dimensoes_personalidade (
  id SERIAL PRIMARY KEY,
  dimensao VARCHAR(4) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  imagem VARCHAR(255)
);
```

---

## 🧮 Lógica de Cálculo MBTI

### Escala de Respostas
- **1**: Discordo totalmente
- **2**: Discordo
- **3**: Neutro
- **4**: Concordo
- **5**: Concordo totalmente

### Cálculo do Score
Para cada resposta, o score é calculado como:
```
score = (resposta - 3) * weight
```

Isso transforma a resposta em um valor de -2 a +2:
- **1** → -2 (quando weight = 1)
- **3** → 0 (neutro)
- **5** → +2 (quando weight = 1)

### Weight Negativo
Quando `weight` é negativo, a pergunta é "invertida":
```json
{
  "question": "Gosto de ter flexibilidade em meus horários",
  "dimensao": "P",
  "weight": -1
}
```
- Resposta 1 (discordo) → score = (1-3) * (-1) = +2 (favorece P)
- Resposta 5 (concordo) → score = (5-3) * (-1) = -2 (favorece J)

### Cálculo por Dimensão
As pontuações são somadas por dimensão:

#### Dimensões E/I (Extroversão/Introversão)
- Se a pergunta for **E**: aumenta E e reduz I
- Se a pergunta for **I**: aumenta I e reduz E

#### Outras Dimensões
- **S/N** (Sensação/Intuição)
- **T/F** (Pensamento/Sentimento)
- **J/P** (Julgamento/Percepção)

São somadas diretamente.

### Determinação do Tipo MBTI
O tipo final é montado comparando os scores:
```javascript
type = 
  (E > I ? 'E' : 'I') +
  (S > N ? 'S' : 'N') +
  (T > F ? 'T' : 'F') +
  (J > P ? 'J' : 'P');
```

### Exemplo Prático
Suponha os scores:
- E = 4, I = 2
- S = -1, N = 3
- T = 1, F = 0
- J = -2, P = 1

**Tipo MBTI resultante**: ENTP

---

## 🎯 Tipos MBTI

O teste identifica 16 tipos de personalidade:

| Tipo | Nome | Características |
|------|------|----------------|
| ISTJ | O Inspector | Prático, responsável, organizado |
| ISFJ | O Protetor | Leal, paciente, prático |
| INFJ | O Conselheiro | Idealista, criativo, empático |
| INTJ | O Mestre | Estratégico, independente, analítico |
| ISTP | O Artesão | Flexível, tolerante, quieto |
| ISFP | O Compositor | Artístico, leal, quieto |
| INFP | O Curador | Idealista, leal, adaptável |
| INTP | O Arquiteto | Lógico, criativo, independente |
| ESTP | O Dinamizador | Flexível, tolerante, prático |
| ESFP | O Performer | Espontâneo, entusiasta, amigável |
| ENFP | O Campeão | Entusiasta, criativo, sociável |
| ENTP | O Inovador | Criativo, flexível, sociável |
| ESTJ | O Supervisor | Prático, realista, organizado |
| ESFJ | O Provedor | Consciencioso, cooperativo, amigável |
| ENFJ | O Professor | Carismático, inspirador, leal |
| ENTJ | O Comandante | Decisivo, líder, direto |

---

## ⚠️ Observações

1. **Transações**: O salvamento de respostas usa transações para garantir consistência
2. **Cálculo Automático**: O resultado é calculado automaticamente quando todas as perguntas são respondidas
3. **Validações**: Todas as respostas são validadas (1-5) e dimensões (E, I, S, N, T, F, J, P)
4. **Weight Negativo**: Permite inverter o sentido das perguntas
5. **Integração**: O resultado é automaticamente vinculado ao perfil do colaborador
6. **Logs**: O cálculo MBTI é logado para debug 