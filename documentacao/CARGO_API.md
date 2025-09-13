# API de Cargos

Esta documentação descreve a API relacionada ao gerenciamento de cargos organizacionais.

## Base URL

```
http://localhost:3002/api/cargos
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header `Authorization`.

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Buscar Cargos por Cliente

Busca todos os cargos de um cliente específico.

**Endpoint:** `GET /api/cargos/cliente/:id_cliente`

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
  "message": "Cargos buscados com sucesso",
  "data": {
    "cliente_id": 1,
    "cargos": [
      "Desenvolvedor Sênior",
      "Analista de Marketing",
      "Gerente de Vendas",
      "Designer UX/UI"
    ]
  }
}
```

**Resposta quando cliente não tem cargos (200):**
```json
{
  "success": true,
  "message": "Nenhum cargo encontrado para este cliente",
  "data": {
    "cliente_id": 1,
    "cargos": []
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

### 2. Criar Cargo

Cria um novo cargo para um cliente específico.

**Endpoint:** `POST /api/cargos/cliente/:id_cliente`

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
  "nome_cargo": "Desenvolvedor Full Stack"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Cargo criado com sucesso",
  "data": {
    "id": 25,
    "nome_cargo": "Desenvolvedor Full Stack",
    "id_cliente": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (400) - Cargo Duplicado:**
```json
{
  "success": false,
  "error": "CARGO_ALREADY_EXISTS",
  "message": "Já existe um cargo com este nome para este cliente"
}
```

**Resposta de Erro (400) - Dados Inválidos:**
```json
{
  "success": false,
  "error": "INVALID_CARGO_NAME",
  "message": "Nome do cargo é obrigatório"
}
```

---

### 3. Buscar Cargo Específico

Busca um cargo específico de um cliente.

**Endpoint:** `GET /api/cargos/:id_cargo/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_cargo` (integer): ID do cargo
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Cargo buscado com sucesso",
  "data": {
    "id": 25,
    "nome_cargo": "Desenvolvedor Full Stack",
    "id_cliente": 1,
    "total_usuarios": 3,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "CARGO_NOT_FOUND",
  "message": "Cargo não encontrado para este cliente"
}
```

---

### 4. Atualizar Cargo

Atualiza um cargo específico de um cliente.

**Endpoint:** `PUT /api/cargos/:id_cargo/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parâmetros da URL:**
- `id_cargo` (integer): ID do cargo
- `id_cliente` (integer): ID do cliente

**Corpo da Requisição:**
```json
{
  "nome_cargo": "Desenvolvedor Full Stack Sênior"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Cargo atualizado com sucesso",
  "data": {
    "id": 25,
    "nome_cargo": "Desenvolvedor Full Stack Sênior",
    "id_cliente": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (400) - Nome Duplicado:**
```json
{
  "success": false,
  "error": "CARGO_ALREADY_EXISTS",
  "message": "Já existe outro cargo com este nome para este cliente"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "CARGO_NOT_FOUND",
  "message": "Cargo não encontrado para este cliente"
}
```

---

### 5. Deletar Cargo

Deleta um cargo específico de um cliente.

**Endpoint:** `DELETE /api/cargos/:id_cargo/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_cargo` (integer): ID do cargo
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Cargo excluído com sucesso",
  "data": {
    "id": 25,
    "nome_cargo": "Desenvolvedor Full Stack",
    "id_cliente": 1
  }
}
```

**Resposta de Erro (400) - Cargo com Usuários:**
```json
{
  "success": false,
  "error": "CARGO_HAS_USERS",
  "message": "Não é possível excluir o cargo pois há 3 usuário(s) vinculado(s) a ele"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "CARGO_NOT_FOUND",
  "message": "Cargo não encontrado para este cliente"
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `INVALID_CLIENT_ID` | ID do cliente inválido ou não fornecido |
| `INVALID_CARGO_ID` | ID do cargo inválido ou não fornecido |
| `INVALID_CARGO_NAME` | Nome do cargo inválido ou não fornecido |
| `CARGO_ALREADY_EXISTS` | Já existe um cargo com o mesmo nome |
| `CARGO_NOT_FOUND` | Cargo não encontrado |
| `CARGO_HAS_USERS` | Cargo possui usuários vinculados |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

## Campos de Resposta

### Buscar Cargos por Cliente

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `cliente_id` | integer | ID do cliente consultado |
| `cargos` | array[string] | Lista com nomes dos cargos |

### Cargo Detalhado

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único do cargo |
| `nome_cargo` | string | Nome do cargo |
| `id_cliente` | integer | ID do cliente proprietário |
| `total_usuarios` | integer | Quantidade de usuários com este cargo (apenas GET específico) |
| `created_at` | string | Data de criação no formato ISO 8601 |

---

## Validações

### Validações de Entrada

1. **ID do Cliente:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório

2. **ID do Cargo:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório (para operações específicas)

3. **Nome do Cargo:**
   - Deve ser uma string não vazia
   - Espaços em branco no início e fim são removidos automaticamente
   - Não pode ser duplicado para o mesmo cliente

### Regras de Negócio

1. **Criação:**
   - Nome do cargo deve ser único por cliente
   - Comparação é case-insensitive

2. **Atualização:**
   - Nome do cargo deve ser único por cliente (exceto o próprio)
   - Cargo deve existir e pertencer ao cliente

3. **Exclusão:**
   - Cargo não pode ter usuários vinculados (verificação por nome do cargo na tabela usuarios)
   - Cargo deve existir e pertencer ao cliente

---

## Estrutura do Banco de Dados

### Tabela: `cargo`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do cargo |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `nome_cargo` | TEXT | Nome do cargo |
| `id_cliente` | INT8 | ID do cliente (FK) |

**Relacionamentos:**
- `id_cliente` → `clientes(id)` (Foreign Key)
- Referenciado por `usuarios(cargo)` através do nome

### Tabela: `clientes`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único do cliente |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `nome_cliente` | TEXT | Nome do cliente |

### Relacionamento com Usuários

A vinculação entre cargo e usuários é feita através do campo `cargo` na tabela `usuarios`, que armazena o nome do cargo (não o ID). Esta abordagem permite flexibilidade na gestão de cargos.

---

## Exemplos de Uso

### Exemplo 1: Buscar Cargos de um Cliente

```bash
curl -X GET http://localhost:3002/api/cargos/cliente/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 2: Criar Novo Cargo

```bash
curl -X POST http://localhost:3002/api/cargos/cliente/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_cargo": "Arquiteto de Software"
  }'
```

### Exemplo 3: Buscar Cargo Específico

```bash
curl -X GET http://localhost:3002/api/cargos/25/cliente/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 4: Atualizar Cargo

```bash
curl -X PUT http://localhost:3002/api/cargos/25/cliente/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_cargo": "Arquiteto de Software Sênior"
  }'
```

### Exemplo 5: Deletar Cargo

```bash
curl -X DELETE http://localhost:3002/api/cargos/25/cliente/1 \
  -H "Authorization: Bearer <token>"
```

---

## Testes

Para executar os testes da API de Cargos:

```bash
# Executar todos os testes
node tests/test-cargo.js

# Ou com URL específica
API_URL=http://localhost:3002/api node tests/test-cargo.js
```

Os testes incluem:

**Testes CRUD:**
- ✅ Criar cargo
- ✅ Buscar cargos por cliente
- ✅ Buscar cargo específico
- ✅ Atualizar cargo
- ✅ Deletar cargo

**Testes de Validação:**
- ✅ Criar cargo duplicado (deve falhar)
- ✅ Buscar cargo inexistente (deve retornar 404)
- ✅ Atualizar cargo inexistente (deve retornar 404)
- ✅ Criar cargo com dados inválidos (deve falhar)
- ✅ Buscar cargos de cliente inexistente (deve retornar array vazio)
- ✅ Validar parâmetros inválidos (deve retornar 400)
- ✅ Deletar cargo inexistente (deve retornar 404)
- ✅ Verificar cargo deletado (deve retornar 404)

---

## Notas Importantes

1. **Segurança:** Todas as operações verificam se o cargo pertence ao cliente especificado.

2. **Integridade:** Não é possível excluir cargos que possuem usuários vinculados.

3. **Unicidade:** Nomes de cargos são únicos por cliente (case-insensitive).

4. **Ordenação:** A listagem de cargos é ordenada alfabeticamente.

5. **Performance:** Queries otimizadas com índices apropriados.

6. **Logs:** Todas as operações são logadas para auditoria.

7. **Transações:** Operações críticas usam transações de banco de dados.

8. **Relacionamento:** A vinculação com usuários é feita através do nome do cargo, não do ID.

---

## Diferenças em Relação aos Departamentos

1. **Relacionamento com Usuários:** 
   - Departamentos: `usuarios.id_departamento` (FK para departamento.id)
   - Cargos: `usuarios.cargo` (nome do cargo como string)

2. **Verificação de Uso:**
   - Departamentos: Busca por `id_departamento = departamento.id`
   - Cargos: Busca por `cargo = cargo.nome_cargo`

3. **Flexibilidade:**
   - Cargos permitem maior flexibilidade, pois não dependem de IDs
   - Departamentos têm relacionamento mais rígido via foreign key

---

## Próximas Implementações

- [ ] API para migrar usuários entre cargos
- [ ] API para estatísticas de cargos
- [ ] API para histórico de alterações
- [ ] API para importação/exportação em massa
- [ ] API para hierarquia de cargos
- [ ] Sincronização automática com tabela de usuários
- [ ] Validação de permissões por cargo



