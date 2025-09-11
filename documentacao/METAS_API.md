# API Metas PDI

Esta documentação descreve as APIs relacionadas ao gerenciamento de metas do Plano de Desenvolvimento Individual (PDI).

## Base URL

```
http://localhost:3002/api/metas
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header `Authorization`.

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Criar Meta PDI

Cria uma nova meta PDI com atividades e pessoas envolvidas.

**Endpoint:** `POST /api/metas`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_usuario": 1,
  "titulo_da_meta": "Desenvolvimento em JavaScript Avançado",
  "atividades": [
    "Completar curso de JavaScript avançado",
    "Implementar projeto prático com Node.js",
    "Apresentar resultados para a equipe"
  ],
  "data_vencimento": "2024-12-31",
  "status": "Em Progresso",
  "id_usuarios": [1, 2, 3],
  "resultado_3_meses": "Esperamos ter completado 50% das atividades planejadas",
  "resultado_6_meses": "Meta totalmente concluída com sucesso e aplicação prática",
  "observacao_gestor": "Meta importante para o desenvolvimento da equipe de tecnologia"
}
```

**Parâmetros:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id_usuario` | integer | ✅ | ID do usuário responsável pela meta |
| `titulo_da_meta` | string | ✅ | Título da meta (máx. 255 caracteres) |
| `atividades` | array[string] | ✅ | Lista de atividades da meta (mín. 1 atividade) |
| `data_vencimento` | string (ISO 8601) | ✅ | Data de vencimento da meta (formato: YYYY-MM-DD) |
| `status` | string | ✅ | Status da meta: "Em Progresso", "Parado", "Atrasado", "Concluida" |
| `id_usuarios` | array[integer] | ✅ | Lista de IDs dos usuários envolvidos (mín. 1 usuário) |
| `resultado_3_meses` | string | ❌ | Resultado esperado em 3 meses (máx. 1000 caracteres) |
| `resultado_6_meses` | string | ❌ | Resultado esperado em 6 meses (máx. 1000 caracteres) |
| `observacao_gestor` | string | ❌ | Observações do gestor (máx. 1000 caracteres) |

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Meta PDI criada com sucesso",
  "data": {
    "meta": {
      "id": 1,
      "titulo": "Desenvolvimento em JavaScript Avançado",
      "prazo": "2024-12-31",
      "status": "Em Progresso",
      "resultado_3_meses": "Esperamos ter completado 50% das atividades planejadas",
      "resultado_6_meses": "Meta totalmente concluída com sucesso e aplicação prática",
      "feedback_gestor": "Meta importante para o desenvolvimento da equipe de tecnologia",
      "id_usuario": 1,
      "created_at": "2024-01-15T10:30:00.000Z",
      "atividades": [
        "Completar curso de JavaScript avançado",
        "Implementar projeto prático com Node.js",
        "Apresentar resultados para a equipe"
      ],
      "usuarios_envolvidos": [1, 2, 3]
    }
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "MISSING_USER_ID",
  "message": "ID do usuário é obrigatório"
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `MISSING_USER_ID` | ID do usuário não fornecido |
| `MISSING_TITULO` | Título da meta não fornecido |
| `MISSING_ATIVIDADES` | Array de atividades vazio ou não fornecido |
| `MISSING_DATA_VENCIMENTO` | Data de vencimento não fornecida |
| `MISSING_STATUS` | Status não fornecido |
| `MISSING_USUARIOS` | Array de usuários envolvidos vazio ou não fornecido |
| `INVALID_STATUS` | Status inválido (deve ser: Em Progresso, Parado, Atrasado, Concluida) |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

### 2. Atualizar Meta PDI

Atualiza uma meta PDI existente com novas informações.

**Endpoint:** `PUT /api/metas/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id` (integer): ID da meta a ser atualizada

**Body:**
```json
{
  "id_usuario": 1,
  "titulo_da_meta": "Meta Atualizada - Desenvolvimento Avançado",
  "atividades": [
    "Atividade atualizada 1",
    "Atividade atualizada 2",
    "Nova atividade adicionada"
  ],
  "data_vencimento": "2025-11-30",
  "status": "Concluida",
  "id_usuarios": [1],
  "resultado_3_meses": "Meta concluída com sucesso",
  "resultado_6_meses": "Resultados aplicados na prática",
  "observacao_gestor": "Excelente trabalho na conclusão da meta"
}
```

**Parâmetros:** (mesmos da API POST)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id_usuario` | integer | ✅ | ID do usuário responsável pela meta |
| `titulo_da_meta` | string | ✅ | Título da meta (máx. 255 caracteres) |
| `atividades` | array[string] | ✅ | Lista de atividades da meta (mín. 1 atividade) |
| `data_vencimento` | string (ISO 8601) | ✅ | Data de vencimento da meta (formato: YYYY-MM-DD) |
| `status` | string | ✅ | Status da meta: "Em Progresso", "Parado", "Atrasado", "Concluida" |
| `id_usuarios` | array[integer] | ✅ | Lista de IDs dos usuários envolvidos (mín. 1 usuário) |
| `resultado_3_meses` | string | ❌ | Resultado esperado em 3 meses (máx. 1000 caracteres) |
| `resultado_6_meses` | string | ❌ | Resultado esperado em 6 meses (máx. 1000 caracteres) |
| `observacao_gestor` | string | ❌ | Observações do gestor (máx. 1000 caracteres) |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Meta PDI atualizada com sucesso",
  "data": {
    "meta": {
      "id": 1,
      "titulo": "Meta Atualizada - Desenvolvimento Avançado",
      "prazo": "2025-11-30",
      "status": "Concluida",
      "resultado_3_meses": "Meta concluída com sucesso",
      "resultado_6_meses": "Resultados aplicados na prática",
      "feedback_gestor": "Excelente trabalho na conclusão da meta",
      "id_usuario": 1,
      "created_at": "2024-01-15T10:30:00.000Z",
      "atividades": [
        "Atividade atualizada 1",
        "Atividade atualizada 2",
        "Nova atividade adicionada"
      ],
      "usuarios_envolvidos": [1]
    }
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_META_ID",
  "message": "ID da meta é obrigatório e deve ser um número válido"
}
```

**Resposta de Erro (403):**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Você não tem permissão para atualizar esta meta"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "META_NOT_FOUND",
  "message": "Meta não encontrada"
}
```

**Códigos de Erro Adicionais:**

| Código | Descrição |
|--------|-----------|
| `INVALID_META_ID` | ID da meta inválido ou não fornecido |
| `META_NOT_FOUND` | Meta não encontrada |
| `UNAUTHORIZED` | Usuário não tem permissão para atualizar esta meta |

---

### 3. Buscar Metas por Gestor

Busca todas as metas dos usuários que têm um gestor específico.

**Endpoint:** `GET /api/metas/gestor/:id_gestor`

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
  "message": "Metas buscadas com sucesso",
  "data": {
    "gestor_id": 1,
    "usuarios": [
      {
        "id": 1,
        "nome_usuario": "João Silva",
        "email_usuario": "joao@empresa.com",
        "quantidade_metas": 2,
        "metas": [
          {
            "id": 1,
            "titulo_meta": "Desenvolvimento em JavaScript Avançado",
            "status": "Em Progresso",
            "prazo": "2025-12-31",
            "resultado_3_meses": "Esperamos ter completado 50% das atividades planejadas",
            "resultado_6_meses": "Meta totalmente concluída com sucesso e aplicação prática",
            "feedback_gestor": "Meta importante para o desenvolvimento da equipe de tecnologia",
            "created_at": "2024-01-15T10:30:00.000Z",
            "atividades": [
              {
                "id": 1,
                "titulo_atividade": "Completar curso de JavaScript avançado",
                "status": "backlog",
                "evidencia_atividade": null
              },
              {
                "id": 2,
                "titulo_atividade": "Implementar projeto prático com Node.js",
                "status": "backlog",
                "evidencia_atividade": null
              }
            ],
            "pessoas_envolvidas": [
              {
                "id": 1,
                "nome": "João Silva",
                "email": "joao@empresa.com"
              },
              {
                "id": 2,
                "nome": "Maria Santos",
                "email": "maria@empresa.com"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**Resposta quando não há metas (200):**
```json
{
  "success": true,
  "message": "Nenhuma meta encontrada para este gestor",
  "data": {
    "gestor_id": 1,
    "usuarios": []
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

---

### 4. Buscar Metas por Usuário

Busca todas as metas de um usuário específico com informações detalhadas e cálculos de progresso.

**Endpoint:** `GET /api/metas/usuario/:id_usuario`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_usuario` (integer): ID do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Metas buscadas com sucesso",
  "data": {
    "usuario_id": 1,
    "quantidade_metas": 2,
    "progresso_medio": 75,
    "proximo_prazo": "2025-11-30",
    "metas": [
      {
        "id": 1,
        "titulo_meta": "Desenvolvimento em JavaScript Avançado",
        "prazo_meta": "2025-12-31",
        "status_meta": "Em Progresso",
        "porcentagem_progresso": 50,
        "atividades": [
          {
            "id": 1,
            "atividade": "Completar curso de JavaScript avançado",
            "status": "concluida"
          },
          {
            "id": 2,
            "atividade": "Implementar projeto prático com Node.js",
            "status": "backlog"
          }
        ],
        "pessoas_envolvidas": [
          {
            "id": 1,
            "nome_pessoa": "João Silva"
          },
          {
            "id": 2,
            "nome_pessoa": "Maria Santos"
          }
        ],
        "resultado_3_meses": "Esperamos ter completado 50% das atividades planejadas",
        "resultado_6_meses": "Meta totalmente concluída com sucesso e aplicação prática",
        "feedback_gestor": "Meta importante para o desenvolvimento da equipe de tecnologia"
      },
      {
        "id": 2,
        "titulo_meta": "Certificação AWS Solutions Architect",
        "prazo_meta": "2025-11-30",
        "status_meta": "Concluida",
        "porcentagem_progresso": 100,
        "atividades": [
          {
            "id": 3,
            "atividade": "Estudar fundamentos de AWS",
            "status": "concluida"
          },
          {
            "id": 4,
            "atividade": "Fazer laboratórios práticos",
            "status": "concluida"
          },
          {
            "id": 5,
            "atividade": "Agendar e fazer o exame",
            "status": "concluida"
          }
        ],
        "pessoas_envolvidas": [
          {
            "id": 1,
            "nome_pessoa": "João Silva"
          }
        ],
        "resultado_3_meses": "Ter completado 70% do conteúdo teórico",
        "resultado_6_meses": "Certificação obtida com sucesso",
        "feedback_gestor": "Meta estratégica para a empresa. Apoio total da gestão."
      }
    ]
  }
}
```

**Resposta quando não há metas (200):**
```json
{
  "success": true,
  "message": "Nenhuma meta encontrada para este usuário",
  "data": {
    "usuario_id": 1,
    "quantidade_metas": 0,
    "progresso_medio": 0,
    "proximo_prazo": null,
    "metas": []
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_USER_ID",
  "message": "ID do usuário é obrigatório e deve ser um número válido"
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_USER_ID` | ID do usuário inválido ou não fornecido |
| `INTERNAL_ERROR` | Erro interno do servidor |

**Campos de Resposta:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `usuario_id` | integer | ID do usuário consultado |
| `quantidade_metas` | integer | Total de metas cadastradas para o usuário |
| `progresso_medio` | integer | Progresso médio em % (atividades concluídas / total de atividades) |
| `proximo_prazo` | string/null | Data mais próxima entre todas as metas (formato: YYYY-MM-DD) |
| `metas` | array | Array de metas do usuário |

**Campos da Meta:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único da meta |
| `titulo_meta` | string | Título da meta |
| `prazo_meta` | string | Data de vencimento da meta (formato: YYYY-MM-DD) |
| `status_meta` | string | Status da meta |
| `porcentagem_progresso` | integer | Progresso da meta em % (atividades concluídas / total de atividades) |
| `atividades` | array | Array de atividades da meta |
| `pessoas_envolvidas` | array | Array de pessoas envolvidas na meta |
| `resultado_3_meses` | string/null | Resultado esperado em 3 meses |
| `resultado_6_meses` | string/null | Resultado esperado em 6 meses |
| `feedback_gestor` | string/null | Feedback do gestor |

**Campos da Atividade:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único da atividade |
| `atividade` | string | Título da atividade |
| `status` | string | Status da atividade (backlog, em_progresso, concluida, cancelada) |

**Campos da Pessoa Envolvida:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID do usuário |
| `nome_pessoa` | string | Nome da pessoa |

---

### 5. Atualizar Status de Atividade

Atualiza o status de uma atividade específica e faz upload de arquivo de evidência.

**Endpoint:** `PUT /api/metas/atividade/:id_meta_pdi/:id_atividade`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_meta_pdi` (integer): ID da meta PDI
- `id_atividade` (integer): ID da atividade específica

**Body (multipart/form-data):**
- `status_atividade` (string): Status da atividade (obrigatório)
- `evidencia_atividade` (file): Arquivo de evidência (opcional)

**Status válidos:**
- `backlog`: Atividade em backlog
- `em_progresso`: Atividade em progresso
- `concluida`: Atividade concluída
- `cancelada`: Atividade cancelada

**Tipos de arquivo aceitos:**
- Imagens: JPEG, PNG, GIF
- Documentos: PDF
- Texto: TXT
- Tamanho máximo: 10MB

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Status da atividade atualizado com sucesso",
  "data": {
    "atividade": {
      "id": 1,
      "id_meta_pdi": 1,
      "titulo_atividade": "Completar curso de JavaScript avançado",
      "status_atividade": "concluida",
      "evidencia_atividade": "https://supabase-url.com/evidencia_atividade/1/1/1_1234567890_certificado.pdf"
    }
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_STATUS",
  "message": "Status inválido. Valores aceitos: backlog, em_progresso, concluida, cancelada"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "META_NOT_FOUND",
  "message": "Meta PDI não encontrada"
}
```

**Resposta de Erro (500):**
```json
{
  "success": false,
  "error": "UPLOAD_ERROR",
  "message": "Erro ao fazer upload do arquivo de evidência"
}
```

**Códigos de Erro:**

| Código | Descrição |
|--------|-----------|
| `INVALID_META_ID` | ID da meta PDI inválido ou não fornecido |
| `INVALID_ATIVIDADE_ID` | ID da atividade inválido ou não fornecido |
| `MISSING_STATUS` | Status da atividade não fornecido |
| `INVALID_STATUS` | Status inválido |
| `META_NOT_FOUND` | Meta PDI não encontrada |
| `ATIVIDADE_NOT_FOUND` | Atividade não encontrada para esta meta PDI |
| `UPLOAD_ERROR` | Erro ao fazer upload do arquivo |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

## Validações

### Validações de Entrada

1. **ID do Usuário:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório

2. **Título da Meta:**
   - Deve ter entre 1 e 255 caracteres
   - Campo obrigatório

3. **Atividades:**
   - Deve ser um array com pelo menos 1 atividade
   - Cada atividade deve ser uma string não vazia
   - Campo obrigatório

4. **Data de Vencimento:**
   - Deve estar no formato ISO 8601 (YYYY-MM-DD)
   - Não pode ser anterior à data atual
   - Campo obrigatório

5. **Status:**
   - Deve ser um dos valores: "Em Progresso", "Parado", "Atrasado", "Concluida"
   - Campo obrigatório

6. **Usuários Envolvidos:**
   - Deve ser um array com pelo menos 1 usuário
   - Cada ID deve ser um número inteiro positivo
   - Campo obrigatório

7. **Campos Opcionais:**
   - `resultado_3_meses`: máximo 1000 caracteres
   - `resultado_6_meses`: máximo 1000 caracteres
   - `observacao_gestor`: máximo 1000 caracteres

---

## Estrutura do Banco de Dados

### Tabela: `metas_pdi`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único da meta |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `titulo` | TEXT | Título da meta |
| `prazo` | DATE | Data de vencimento |
| `status` | TEXT | Status da meta |
| `resultado_3_meses` | TEXT | Resultado esperado em 3 meses |
| `resultado_6_meses` | TEXT | Resultado esperado em 6 meses |
| `feedback_gestor` | TEXT | Observações do gestor |
| `id_usuario` | INT8 | ID do usuário responsável (FK) |

### Tabela: `atividades_pdi`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único da atividade |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `id_meta_pdi` | INT8 | ID da meta (FK) |
| `titulo_atividade` | TEXT | Título da atividade |
| `status_atividade` | TEXT | Status da atividade (sempre "backlog" na criação) |
| `evidencia_atividade` | TEXT | Evidência da atividade (sempre null na criação) |

### Tabela: `pessoas_envolvidas_pdi`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do registro |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `id_meta_pdi` | INT8 | ID da meta (FK) |
| `id_usuario` | INT8 | ID do usuário envolvido (FK) |

---

## Exemplos de Uso

### Exemplo 1: Meta Simples

```bash
curl -X POST http://localhost:3002/api/metas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_usuario": 1,
    "titulo_da_meta": "Aprender React",
    "atividades": [
      "Fazer curso básico de React",
      "Criar projeto prático"
    ],
    "data_vencimento": "2024-06-30",
    "status": "Em Progresso",
    "id_usuarios": [1, 2]
  }'
```

### Exemplo 2: Meta Completa

```bash
curl -X POST http://localhost:3002/api/metas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_usuario": 1,
    "titulo_da_meta": "Certificação AWS Solutions Architect",
    "atividades": [
      "Estudar fundamentos de AWS",
      "Fazer laboratórios práticos",
      "Revisar exames anteriores",
      "Agendar e fazer o exame"
    ],
    "data_vencimento": "2024-12-31",
    "status": "Em Progresso",
    "id_usuarios": [1, 3, 5],
    "resultado_3_meses": "Ter completado 70% do conteúdo teórico",
    "resultado_6_meses": "Certificação obtida com sucesso",
    "observacao_gestor": "Meta estratégica para a empresa. Apoio total da gestão."
  }'
```

### Exemplo 3: Meta com Status "Concluida"

```bash
curl -X POST http://localhost:3002/api/metas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_usuario": 2,
    "titulo_da_meta": "Implementar sistema de CI/CD",
    "atividades": [
      "Configurar pipeline no GitLab",
      "Implementar testes automatizados",
      "Configurar deploy automático"
    ],
    "data_vencimento": "2024-03-15",
    "status": "Concluida",
    "id_usuarios": [2, 4, 6],
    "resultado_3_meses": "Pipeline funcionando",
    "resultado_6_meses": "Sistema totalmente implementado",
    "observacao_gestor": "Excelente trabalho! Meta concluída antes do prazo."
  }'
```

### Exemplo 4: Atualizar Meta Existente

```bash
curl -X PUT http://localhost:3002/api/metas/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_usuario": 1,
    "titulo_da_meta": "Meta Atualizada - Desenvolvimento Avançado",
    "atividades": [
      "Atividade atualizada 1",
      "Atividade atualizada 2",
      "Nova atividade adicionada"
    ],
    "data_vencimento": "2025-11-30",
    "status": "Concluida",
    "id_usuarios": [1],
    "resultado_3_meses": "Meta concluída com sucesso",
    "resultado_6_meses": "Resultados aplicados na prática",
    "observacao_gestor": "Excelente trabalho na conclusão da meta"
  }'
```

### Exemplo 5: Buscar Metas por Gestor

```bash
curl -X GET http://localhost:3002/api/metas/gestor/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 6: Buscar Metas por Usuário

```bash
curl -X GET http://localhost:3002/api/metas/usuario/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 7: Atualizar Status de Atividade

```bash
# Atualizar apenas o status (sem arquivo)
curl -X PUT http://localhost:3002/api/metas/atividade/1/2 \
  -H "Authorization: Bearer <token>" \
  -F "status_atividade=em_progresso"

# Atualizar status com arquivo de evidência
curl -X PUT http://localhost:3002/api/metas/atividade/1/2 \
  -H "Authorization: Bearer <token>" \
  -F "status_atividade=concluida" \
  -F "evidencia_atividade=@/caminho/para/certificado.pdf"
```

---

## Testes

Para executar os testes da API de Metas:

```bash
# Executar todos os testes
node tests/test-metas.js

# Ou com URL específica
API_URL=http://localhost:3002/api node tests/test-metas.js
```

Os testes incluem:

**Testes de Criação (POST):**
- ✅ Criação de meta válida
- ✅ Criação com campos opcionais
- ✅ Validação de todos os status válidos
- ✅ Validação com muitas atividades e usuários
- ❌ Validação de campos obrigatórios
- ❌ Validação de status inválido
- ❌ Validação de data passada
- ❌ Validação de arrays vazios

**Testes de Atualização (PUT):**
- ✅ Atualização de meta válida
- ❌ Atualização de meta inexistente
- ❌ Atualização com usuário diferente (sem permissão)
- ❌ Atualização com dados inválidos
- ❌ Atualização com ID inválido

**Testes de Consulta (GET):**
- ✅ Buscar metas por gestor válido
- ✅ Buscar metas por gestor inexistente (retorna vazio)
- ❌ Buscar metas por gestor com ID inválido
- ❌ Buscar metas por gestor sem ID (rota não encontrada)
- ✅ Buscar metas por gestor com metas complexas

**Testes de Consulta por Usuário (GET):**
- ✅ Buscar metas por usuário válido
- ✅ Buscar metas por usuário inexistente (retorna vazio)
- ❌ Buscar metas por usuário com ID inválido
- ✅ Buscar metas por usuário com progresso calculado
- ✅ Verificar cálculos de progresso médio
- ✅ Verificar próximo prazo mais próximo

**Testes de Atualização de Atividade (PUT):**
- ✅ Atualizar status de atividade sem arquivo
- ✅ Atualizar status de atividade com arquivo
- ❌ Atualizar status de atividade com meta inexistente
- ❌ Atualizar status de atividade com atividade inexistente
- ❌ Atualizar status de atividade com status inválido
- ❌ Atualizar status de atividade sem status
- ✅ Atualizar status de atividade com todos os status válidos

---

## Notas Importantes

1. **Transações:** A criação de uma meta envolve inserções em 3 tabelas diferentes, todas executadas em uma transação para garantir consistência.

2. **Status das Atividades:** Todas as atividades são criadas com status "backlog" e evidência null.

3. **Limpeza de Dados:** Os testes criam dados temporários que precisam ser limpos manualmente do banco de dados após a execução.

4. **Validação de Data:** A data de vencimento não pode ser anterior à data atual.

5. **Relacionamentos:** A API valida que os usuários envolvidos existam no sistema (validação implícita via foreign key).

6. **Campos Opcionais:** Os campos `resultado_3_meses`, `resultado_6_meses` e `observacao_gestor` são opcionais e serão salvos como null se não fornecidos.

---

## Próximas Implementações

- [x] API POST para criar meta PDI
- [x] API PUT para atualizar meta existente
- [x] API GET para buscar metas por gestor
- [x] API PUT para atualizar status de atividade e evidência
- [x] API GET para listar metas de um usuário específico
- [ ] API DELETE para remover meta
- [ ] API para listar pessoas envolvidas em uma meta
- [ ] API para relatórios de progresso
- [ ] API para notificações de prazos próximos
