# API de Departamentos

Esta documentação descreve a API relacionada ao gerenciamento de departamentos organizacionais.

## Base URL

```
http://localhost:3002/api/departamentos
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header `Authorization`.

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Buscar Departamentos por Cliente

Busca todos os departamentos de um cliente específico.

**Endpoint:** `GET /api/departamentos/cliente/:id_cliente`

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
  "message": "Departamentos buscados com sucesso",
  "data": {
    "cliente_id": 1,
    "departamentos": [
      "Desenvolvimento",
      "Marketing",
      "Recursos Humanos",
      "Vendas"
    ]
  }
}
```

**Resposta quando cliente não tem departamentos (200):**
```json
{
  "success": true,
  "message": "Nenhum departamento encontrado para este cliente",
  "data": {
    "cliente_id": 1,
    "departamentos": []
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

### 2. Criar Departamento

Cria um novo departamento para um cliente específico.

**Endpoint:** `POST /api/departamentos/cliente/:id_cliente`

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
  "titulo_departamento": "Novo Departamento"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Departamento criado com sucesso",
  "data": {
    "id": 15,
    "titulo_departamento": "Novo Departamento",
    "id_cliente": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (400) - Departamento Duplicado:**
```json
{
  "success": false,
  "error": "DEPARTMENT_ALREADY_EXISTS",
  "message": "Já existe um departamento com este nome para este cliente"
}
```

**Resposta de Erro (400) - Dados Inválidos:**
```json
{
  "success": false,
  "error": "INVALID_DEPARTMENT_TITLE",
  "message": "Título do departamento é obrigatório"
}
```

---

### 3. Buscar Departamento Específico

Busca um departamento específico de um cliente.

**Endpoint:** `GET /api/departamentos/:id_departamento/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_departamento` (integer): ID do departamento
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Departamento buscado com sucesso",
  "data": {
    "id": 15,
    "titulo_departamento": "Desenvolvimento",
    "id_cliente": 1,
    "total_usuarios": 8,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "DEPARTMENT_NOT_FOUND",
  "message": "Departamento não encontrado para este cliente"
}
```

---

### 4. Atualizar Departamento

Atualiza um departamento específico de um cliente.

**Endpoint:** `PUT /api/departamentos/:id_departamento/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parâmetros da URL:**
- `id_departamento` (integer): ID do departamento
- `id_cliente` (integer): ID do cliente

**Corpo da Requisição:**
```json
{
  "titulo_departamento": "Desenvolvimento Atualizado"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Departamento atualizado com sucesso",
  "data": {
    "id": 15,
    "titulo_departamento": "Desenvolvimento Atualizado",
    "id_cliente": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (400) - Nome Duplicado:**
```json
{
  "success": false,
  "error": "DEPARTMENT_ALREADY_EXISTS",
  "message": "Já existe outro departamento com este nome para este cliente"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "DEPARTMENT_NOT_FOUND",
  "message": "Departamento não encontrado para este cliente"
}
```

---

### 5. Deletar Departamento

Deleta um departamento específico de um cliente.

**Endpoint:** `DELETE /api/departamentos/:id_departamento/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_departamento` (integer): ID do departamento
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Departamento excluído com sucesso",
  "data": {
    "id": 15,
    "titulo_departamento": "Desenvolvimento",
    "id_cliente": 1
  }
}
```

**Resposta de Erro (400) - Departamento com Usuários:**
```json
{
  "success": false,
  "error": "DEPARTMENT_HAS_USERS",
  "message": "Não é possível excluir o departamento pois há 8 usuário(s) vinculado(s) a ele"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "DEPARTMENT_NOT_FOUND",
  "message": "Departamento não encontrado para este cliente"
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `INVALID_CLIENT_ID` | ID do cliente inválido ou não fornecido |
| `INVALID_DEPARTMENT_ID` | ID do departamento inválido ou não fornecido |
| `INVALID_DEPARTMENT_TITLE` | Título do departamento inválido ou não fornecido |
| `DEPARTMENT_ALREADY_EXISTS` | Já existe um departamento com o mesmo nome |
| `DEPARTMENT_NOT_FOUND` | Departamento não encontrado |
| `DEPARTMENT_HAS_USERS` | Departamento possui usuários vinculados |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

## Campos de Resposta

### Buscar Departamentos por Cliente

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `cliente_id` | integer | ID do cliente consultado |
| `departamentos` | array[string] | Lista com nomes dos departamentos |

### Departamento Detalhado

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único do departamento |
| `titulo_departamento` | string | Nome do departamento |
| `id_cliente` | integer | ID do cliente proprietário |
| `total_usuarios` | integer | Quantidade de usuários no departamento (apenas GET específico) |
| `created_at` | string | Data de criação no formato ISO 8601 |

---

## Validações

### Validações de Entrada

1. **ID do Cliente:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório

2. **ID do Departamento:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório (para operações específicas)

3. **Título do Departamento:**
   - Deve ser uma string não vazia
   - Espaços em branco no início e fim são removidos automaticamente
   - Não pode ser duplicado para o mesmo cliente

### Regras de Negócio

1. **Criação:**
   - Nome do departamento deve ser único por cliente
   - Comparação é case-insensitive

2. **Atualização:**
   - Nome do departamento deve ser único por cliente (exceto o próprio)
   - Departamento deve existir e pertencer ao cliente

3. **Exclusão:**
   - Departamento não pode ter usuários vinculados
   - Departamento deve existir e pertencer ao cliente

---

## Estrutura do Banco de Dados

### Tabela: `departamento`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do departamento |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `titulo_departamento` | TEXT | Nome do departamento |
| `id_cliente` | INT8 | ID do cliente (FK) |

**Relacionamentos:**
- `id_cliente` → `clientes(id)` (Foreign Key)
- Referenciado por `usuarios(id_departamento)`

---

## Exemplos de Uso

### Exemplo 1: Buscar Departamentos de um Cliente

```bash
curl -X GET http://localhost:3002/api/departamentos/cliente/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 2: Criar Novo Departamento

```bash
curl -X POST http://localhost:3002/api/departamentos/cliente/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo_departamento": "Inovação e Tecnologia"
  }'
```

### Exemplo 3: Buscar Departamento Específico

```bash
curl -X GET http://localhost:3002/api/departamentos/15/cliente/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 4: Atualizar Departamento

```bash
curl -X PUT http://localhost:3002/api/departamentos/15/cliente/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo_departamento": "Tecnologia e Inovação"
  }'
```

### Exemplo 5: Deletar Departamento

```bash
curl -X DELETE http://localhost:3002/api/departamentos/15/cliente/1 \
  -H "Authorization: Bearer <token>"
```

---

## Testes

Para executar os testes da API de Departamentos:

```bash
# Executar todos os testes
node tests/test-departamento.js

# Ou com URL específica
API_URL=http://localhost:3002/api node tests/test-departamento.js
```

Os testes incluem:

**Testes CRUD:**
- ✅ Criar departamento
- ✅ Buscar departamentos por cliente
- ✅ Buscar departamento específico
- ✅ Atualizar departamento
- ✅ Deletar departamento

**Testes de Validação:**
- ✅ Criar departamento duplicado (deve falhar)
- ✅ Buscar departamento inexistente (deve retornar 404)
- ✅ Atualizar departamento inexistente (deve retornar 404)
- ✅ Criar departamento com dados inválidos (deve falhar)
- ✅ Buscar departamentos de cliente inexistente (deve retornar array vazio)
- ✅ Validar parâmetros inválidos (deve retornar 400)
- ✅ Deletar departamento inexistente (deve retornar 404)
- ✅ Verificar departamento deletado (deve retornar 404)

---

## Notas Importantes

1. **Segurança:** Todas as operações verificam se o departamento pertence ao cliente especificado.

2. **Integridade:** Não é possível excluir departamentos que possuem usuários vinculados.

3. **Unicidade:** Nomes de departamentos são únicos por cliente (case-insensitive).

4. **Ordenação:** A listagem de departamentos é ordenada alfabeticamente.

5. **Performance:** Queries otimizadas com índices apropriados.

6. **Logs:** Todas as operações são logadas para auditoria.

7. **Transações:** Operações críticas usam transações de banco de dados.

---

## Próximas Implementações

- [ ] API para transferir usuários entre departamentos
- [ ] API para estatísticas de departamentos
- [ ] API para histórico de alterações
- [ ] API para importação/exportação em massa
- [ ] API para hierarquia de departamentos
- [ ] Validação de permissões por departamento

