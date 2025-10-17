# API de Senioridades

Esta documentação descreve a API relacionada ao gerenciamento de senioridades organizacionais.

## Base URL

```
http://localhost:3002/api/senioridades
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header `Authorization`.

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Buscar Senioridades por Cliente

Busca todas as senioridades de um cliente específico.

**Endpoint:** `GET /api/senioridades/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Senioridades buscadas com sucesso",
  "data": {
    "cliente_id": 1,
    "senioridades": [
      {
        "id": 1,
        "senioridade": "Estagiário",
        "client_id": 1,
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "senioridade": "Júnior",
        "client_id": 1,
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 3,
        "senioridade": "Pleno",
        "client_id": 1,
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 4,
        "senioridade": "Sênior",
        "client_id": 1,
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 5,
        "senioridade": "Especialista",
        "client_id": 1,
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Resposta quando cliente não tem senioridades (200):**
```json
{
  "success": true,
  "message": "Nenhuma senioridade encontrada para este cliente",
  "data": {
    "cliente_id": 1,
    "senioridades": []
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_CLIENT_ID",
  "message": "ID do cliente é obrigatório e deve ser um número válido"
}
```

---

### 2. Criar Senioridade

Cria uma nova senioridade para um cliente específico.

**Endpoint:** `POST /api/senioridades/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parâmetros da URL:**
- `id_cliente` (integer): ID do cliente

**Corpo da Requisição:**
```json
{
  "senioridade": "Coordenador"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Senioridade criada com sucesso",
  "data": {
    "id": 6,
    "senioridade": "Coordenador",
    "client_id": 1,
    "created_at": "2024-01-15T12:30:00.000Z"
  }
}
```

**Resposta de Erro (400) - Senioridade Duplicada:**
```json
{
  "success": false,
  "error": "SENIORIDADE_ALREADY_EXISTS",
  "message": "Já existe uma senioridade com este nome para este cliente"
}
```

**Resposta de Erro (400) - Dados Inválidos:**
```json
{
  "success": false,
  "error": "INVALID_SENIORIDADE_NAME",
  "message": "Nome da senioridade é obrigatório"
}
```

---

### 3. Buscar Senioridade Específica

Busca uma senioridade específica de um cliente.

**Endpoint:** `GET /api/senioridades/:id_senioridade/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_senioridade` (integer): ID da senioridade
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Senioridade buscada com sucesso",
  "data": {
    "id": 3,
    "senioridade": "Pleno",
    "client_id": 1,
    "total_cargos": 12,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "SENIORIDADE_NOT_FOUND",
  "message": "Senioridade não encontrada para este cliente"
}
```

---

### 4. Atualizar Senioridade

Atualiza uma senioridade específica de um cliente.

**Endpoint:** `PUT /api/senioridades/:id_senioridade/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parâmetros da URL:**
- `id_senioridade` (integer): ID da senioridade
- `id_cliente` (integer): ID do cliente

**Corpo da Requisição:**
```json
{
  "senioridade": "Pleno II"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Senioridade atualizada com sucesso",
  "data": {
    "id": 3,
    "senioridade": "Pleno II",
    "client_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (400) - Nome Duplicado:**
```json
{
  "success": false,
  "error": "SENIORIDADE_ALREADY_EXISTS",
  "message": "Já existe outra senioridade com este nome para este cliente"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "SENIORIDADE_NOT_FOUND",
  "message": "Senioridade não encontrada para este cliente"
}
```

---

### 5. Deletar Senioridade

Deleta uma senioridade específica de um cliente.

**Endpoint:** `DELETE /api/senioridades/:id_senioridade/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_senioridade` (integer): ID da senioridade
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Senioridade excluída com sucesso",
  "data": {
    "id": 6,
    "senioridade": "Coordenador",
    "client_id": 1
  }
}
```

**Resposta de Erro (400) - Senioridade com Cargos:**
```json
{
  "success": false,
  "error": "SENIORIDADE_HAS_CARGOS",
  "message": "Não é possível excluir a senioridade pois há 5 cargo(s) vinculado(s) a ela"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "SENIORIDADE_NOT_FOUND",
  "message": "Senioridade não encontrada para este cliente"
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `INVALID_CLIENT_ID` | ID do cliente inválido ou não fornecido |
| `INVALID_SENIORIDADE_ID` | ID da senioridade inválido ou não fornecido |
| `INVALID_SENIORIDADE_NAME` | Nome da senioridade inválido ou não fornecido |
| `SENIORIDADE_ALREADY_EXISTS` | Já existe uma senioridade com o mesmo nome |
| `SENIORIDADE_NOT_FOUND` | Senioridade não encontrada |
| `SENIORIDADE_HAS_CARGOS` | Senioridade possui cargos vinculados |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

## Campos de Resposta

### Buscar Senioridades por Cliente

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `cliente_id` | integer | ID do cliente consultado |
| `senioridades` | array[object] | Lista com objetos de senioridades completos |

### Senioridade Detalhada

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único da senioridade |
| `senioridade` | string | Nome da senioridade |
| `client_id` | integer | ID do cliente proprietário |
| `total_cargos` | integer | Quantidade de cargos com esta senioridade (apenas GET específico) |
| `created_at` | string | Data de criação no formato ISO 8601 |

---

## Validações

### Validações de Entrada

1. **ID do Cliente:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório

2. **ID da Senioridade:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório (para operações específicas)

3. **Nome da Senioridade:**
   - Deve ser uma string não vazia
   - Espaços em branco no início e fim são removidos automaticamente
   - Não pode ser duplicado para o mesmo cliente

### Regras de Negócio

1. **Criação:**
   - Nome da senioridade deve ser único por cliente
   - Comparação é case-insensitive

2. **Atualização:**
   - Nome da senioridade deve ser único por cliente (exceto o próprio)
   - Senioridade deve existir e pertencer ao cliente

3. **Exclusão:**
   - Senioridade não pode ter cargos vinculados
   - Senioridade deve existir e pertencer ao cliente

---

## Estrutura do Banco de Dados

### Tabela: `senioridade`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT PRIMARY KEY | ID único da senioridade |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `senioridade` | TEXT | Nome da senioridade |
| `client_id` | BIGINT | ID do cliente (FK) |

**Relacionamentos:**
- `senioridade.client_id` → `clientes(id)` (Foreign Key)
- Referenciado por `cargo(senioridade_id)` através do ID

### Tabela: `clientes`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do cliente |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `nome_cliente` | TEXT | Nome do cliente |

### Relacionamento com Cargos

A vinculação entre senioridade e cargos é feita através do campo `senioridade_id` na tabela `cargo`, que armazena o ID da senioridade (foreign key). Esta abordagem garante integridade referencial.

---

## Exemplos de Uso

### Exemplo 1: Buscar Senioridades de um Cliente

```bash
curl -X GET http://localhost:3002/api/senioridades/cliente/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 2: Criar Nova Senioridade

```bash
curl -X POST http://localhost:3002/api/senioridades/cliente/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "senioridade": "Diretor"
  }'
```

### Exemplo 3: Buscar Senioridade Específica

```bash
curl -X GET http://localhost:3002/api/senioridades/3/cliente/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 4: Atualizar Senioridade

```bash
curl -X PUT http://localhost:3002/api/senioridades/3/cliente/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "senioridade": "Pleno Avançado"
  }'
```

### Exemplo 5: Deletar Senioridade

```bash
curl -X DELETE http://localhost:3002/api/senioridades/6/cliente/1 \
  -H "Authorization: Bearer <token>"
```

---

## Testes

Para executar os testes da API de Senioridades:

```bash
# Executar todos os testes
node tests/test-senioridade.js

# Ou com URL específica
API_URL=http://localhost:3002/api node tests/test-senioridade.js
```

Os testes incluem:

**Testes CRUD:**
- ✅ Criar senioridade
- ✅ Buscar senioridades por cliente
- ✅ Buscar senioridade específica
- ✅ Atualizar senioridade
- ✅ Deletar senioridade

**Testes de Validação:**
- ✅ Criar senioridade duplicada (deve falhar)
- ✅ Buscar senioridade inexistente (deve retornar 404)
- ✅ Atualizar senioridade inexistente (deve retornar 404)
- ✅ Criar senioridade com dados inválidos (deve falhar)
- ✅ Buscar senioridades de cliente inexistente (deve retornar array vazio)
- ✅ Validar parâmetros inválidos (deve retornar 400)
- ✅ Deletar senioridade inexistente (deve retornar 404)
- ✅ Deletar senioridade com cargos vinculados (deve falhar)
- ✅ Verificar senioridade deletada (deve retornar 404)

---

## Notas Importantes

1. **Segurança:** Todas as operações verificam se a senioridade pertence ao cliente especificado.

2. **Integridade:** Não é possível excluir senioridades que possuem cargos vinculados.

3. **Unicidade:** Nomes de senioridades são únicos por cliente (case-insensitive).

4. **Simplicidade:** Senioridade é uma entidade simples, sem relacionamentos opcionais.

5. **Ordenação:** A listagem de senioridades é ordenada alfabeticamente.

6. **Performance:** Queries otimizadas com índices apropriados.

7. **Logs:** Todas as operações são logadas para auditoria.

8. **Relacionamento:** A vinculação com cargos é feita através do ID da senioridade (foreign key).

9. **Cascata:** Ao deletar uma senioridade, verifica-se se há cargos vinculados antes da exclusão.

---

## Hierarquia Sugerida de Senioridades

Exemplos comuns de hierarquia de senioridades (em ordem crescente):

1. **Estagiário** - Nível inicial, aprendizado
2. **Júnior** - Iniciante com conhecimento básico
3. **Pleno** - Conhecimento intermediário, autonomia
4. **Sênior** - Conhecimento avançado, liderança técnica
5. **Especialista** - Expertise em área específica
6. **Coordenador** - Liderança de equipe
7. **Gerente** - Gestão de departamento
8. **Diretor** - Gestão estratégica

> **Nota:** Esta é apenas uma sugestão. Cada organização pode definir sua própria hierarquia de senioridades.

---

## Diferenças em Relação aos Setores

1. **Simplicidade:** 
   - Senioridades são entidades simples (apenas nome)
   - Setores podem ter departamentos opcionais

2. **Verificação de Uso:**
   - Senioridades: Busca por `cargo.senioridade_id = senioridade.id`
   - Setores: Busca por `cargo.setor_id = setor.id`

3. **Flexibilidade:**
   - Senioridades são mais simples e diretas
   - Setores permitem mais estrutura organizacional

---

## Próximas Implementações

- [ ] API para migrar cargos entre senioridades
- [ ] API para estatísticas de senioridades
- [ ] API para histórico de alterações
- [ ] API para importação/exportação em massa
- [ ] API para hierarquia de senioridades
- [ ] API para busca de cargos por nível de senioridade
- [ ] Sincronização automática com tabela de cargos
- [ ] Validação de permissões por senioridade
- [ ] API para templates de senioridades
- [ ] API para análise de distribuição de senioridades



