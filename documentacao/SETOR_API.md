# API de Setores

Esta documentação descreve a API relacionada ao gerenciamento de setores organizacionais.

## Base URL

```
http://localhost:3002/api/setores
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header `Authorization`.

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Buscar Setores por Cliente

Busca todos os setores de um cliente específico.

**Endpoint:** `GET /api/setores/cliente/:id_cliente`

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
  "message": "Setores buscados com sucesso",
  "data": {
    "cliente_id": 1,
    "setores": [
      {
        "id": 5,
        "nome_setor": "Tecnologia",
        "departamento": {
          "id": 3,
          "nome_departamento": "Desenvolvimento"
        },
        "created_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 6,
        "nome_setor": "Marketing",
        "departamento": null,
        "created_at": "2024-01-15T11:00:00.000Z"
      }
    ]
  }
}
```

**Resposta quando cliente não tem setores (200):**
```json
{
  "success": true,
  "message": "Nenhum setor encontrado para este cliente",
  "data": {
    "cliente_id": 1,
    "setores": []
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

### 2. Criar Setor

Cria um novo setor para um cliente específico.

**Endpoint:** `POST /api/setores/cliente/:id_cliente`

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
  "nome_setor": "Recursos Humanos",
  "departamento_id": 2
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Setor criado com sucesso",
  "data": {
    "id": 7,
    "nome_setor": "Recursos Humanos",
    "client_id": 1,
    "departamento_id": 2,
    "created_at": "2024-01-15T12:30:00.000Z"
  }
}
```

**Resposta de Erro (400) - Setor Duplicado:**
```json
{
  "success": false,
  "error": "SETOR_ALREADY_EXISTS",
  "message": "Já existe um setor com este nome para este cliente"
}
```

**Resposta de Erro (400) - Departamento Não Encontrado:**
```json
{
  "success": false,
  "error": "DEPARTAMENTO_NOT_FOUND",
  "message": "Departamento não encontrado para este cliente"
}
```

---

### 3. Buscar Setor Específico

Busca um setor específico de um cliente.

**Endpoint:** `GET /api/setores/:id_setor/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_setor` (integer): ID do setor
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Setor buscado com sucesso",
  "data": {
    "id": 5,
    "nome_setor": "Tecnologia",
    "client_id": 1,
    "departamento": {
      "id": 3,
      "nome_departamento": "Desenvolvimento"
    },
    "total_cargos": 8,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "SETOR_NOT_FOUND",
  "message": "Setor não encontrado para este cliente"
}
```

---

### 4. Atualizar Setor

Atualiza um setor específico de um cliente.

**Endpoint:** `PUT /api/setores/:id_setor/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parâmetros da URL:**
- `id_setor` (integer): ID do setor
- `id_cliente` (integer): ID do cliente

**Corpo da Requisição:**
```json
{
  "nome_setor": "Tecnologia e Inovação",
  "departamento_id": 4
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Setor atualizado com sucesso",
  "data": {
    "id": 5,
    "nome_setor": "Tecnologia e Inovação",
    "client_id": 1,
    "departamento_id": 4,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Resposta de Erro (400) - Nome Duplicado:**
```json
{
  "success": false,
  "error": "SETOR_ALREADY_EXISTS",
  "message": "Já existe outro setor com este nome para este cliente"
}
```

---

### 5. Deletar Setor

Deleta um setor específico de um cliente.

**Endpoint:** `DELETE /api/setores/:id_setor/cliente/:id_cliente`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_setor` (integer): ID do setor
- `id_cliente` (integer): ID do cliente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Setor excluído com sucesso",
  "data": {
    "id": 5,
    "nome_setor": "Tecnologia",
    "client_id": 1
  }
}
```

**Resposta de Erro (400) - Setor com Cargos:**
```json
{
  "success": false,
  "error": "SETOR_HAS_CARGOS",
  "message": "Não é possível excluir o setor pois há 8 cargo(s) vinculado(s) a ele"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "SETOR_NOT_FOUND",
  "message": "Setor não encontrado para este cliente"
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `INVALID_CLIENT_ID` | ID do cliente inválido ou não fornecido |
| `INVALID_SETOR_ID` | ID do setor inválido ou não fornecido |
| `INVALID_SETOR_NAME` | Nome do setor inválido ou não fornecido |
| `INVALID_DEPARTAMENTO_ID` | ID do departamento inválido |
| `SETOR_ALREADY_EXISTS` | Já existe um setor com o mesmo nome |
| `SETOR_NOT_FOUND` | Setor não encontrado |
| `SETOR_HAS_CARGOS` | Setor possui cargos vinculados |
| `DEPARTAMENTO_NOT_FOUND` | Departamento não encontrado para o cliente |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

## Campos de Resposta

### Buscar Setores por Cliente

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `cliente_id` | integer | ID do cliente consultado |
| `setores` | array[object] | Lista com objetos de setores completos |

### Setor Detalhado

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único do setor |
| `nome_setor` | string | Nome do setor |
| `client_id` | integer | ID do cliente proprietário |
| `departamento` | object | Dados do departamento (GET) / `departamento_id` (POST/PUT) |
| `total_cargos` | integer | Quantidade de cargos com este setor (apenas GET específico) |
| `created_at` | string | Data de criação no formato ISO 8601 |

### Departamento

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID único do departamento |
| `nome_departamento` | string | Nome do departamento |

---

## Validações

### Validações de Entrada

1. **ID do Cliente:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório

2. **ID do Setor:**
   - Deve ser um número inteiro positivo
   - Campo obrigatório (para operações específicas)

3. **Nome do Setor:**
   - Deve ser uma string não vazia
   - Espaços em branco no início e fim são removidos automaticamente
   - Não pode ser duplicado para o mesmo cliente

4. **ID do Departamento:**
   - Deve ser um número inteiro positivo (opcional)
   - Deve existir na tabela `departamento` e pertencer ao cliente

### Regras de Negócio

1. **Criação:**
   - Nome do setor deve ser único por cliente
   - Comparação é case-insensitive
   - Departamento é opcional

2. **Atualização:**
   - Nome do setor deve ser único por cliente (exceto o próprio)
   - Setor deve existir e pertencer ao cliente
   - Departamento é opcional

3. **Exclusão:**
   - Setor não pode ter cargos vinculados
   - Setor deve existir e pertencer ao cliente

---

## Estrutura do Banco de Dados

### Tabela: `setor`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT PRIMARY KEY | ID único do setor |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `nome_setor` | TEXT | Nome do setor |
| `client_id` | BIGINT | ID do cliente (FK) |
| `departamento_id` | BIGINT | ID do departamento (FK, opcional) |

**Relacionamentos:**
- `setor.client_id` → `clientes(id)` (Foreign Key)
- `setor.departamento_id` → `departamento(id)` (Foreign Key, opcional)
- Referenciado por `cargo(setor_id)` através do ID

### Tabela: `departamento`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT PRIMARY KEY | ID único do departamento |
| `created_at` | TIMESTAMPTZ | Data de criação (automático) |
| `nome_departamento` | TEXT | Nome do departamento |
| `id_cliente` | BIGINT | ID do cliente (FK) |

### Relacionamento com Cargos

A vinculação entre setor e cargos é feita através do campo `setor_id` na tabela `cargo`, que armazena o ID do setor (foreign key). Esta abordagem garante integridade referencial.

---

## Exemplos de Uso

### Exemplo 1: Buscar Setores de um Cliente

```bash
curl -X GET http://localhost:3002/api/setores/cliente/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 2: Criar Novo Setor

```bash
curl -X POST http://localhost:3002/api/setores/cliente/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_setor": "Vendas",
    "departamento_id": 3
  }'
```

### Exemplo 3: Buscar Setor Específico

```bash
curl -X GET http://localhost:3002/api/setores/5/cliente/1 \
  -H "Authorization: Bearer <token>"
```

### Exemplo 4: Atualizar Setor

```bash
curl -X PUT http://localhost:3002/api/setores/5/cliente/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_setor": "Vendas e Marketing",
    "departamento_id": 3
  }'
```

### Exemplo 5: Deletar Setor

```bash
curl -X DELETE http://localhost:3002/api/setores/5/cliente/1 \
  -H "Authorization: Bearer <token>"
```

---

## Testes

Para executar os testes da API de Setores:

```bash
# Executar todos os testes
node tests/test-setor.js

# Ou com URL específica
API_URL=http://localhost:3002/api node tests/test-setor.js
```

Os testes incluem:

**Testes CRUD:**
- ✅ Criar setor
- ✅ Buscar setores por cliente
- ✅ Buscar setor específico
- ✅ Atualizar setor
- ✅ Deletar setor

**Testes de Validação:**
- ✅ Criar setor duplicado (deve falhar)
- ✅ Buscar setor inexistente (deve retornar 404)
- ✅ Atualizar setor inexistente (deve retornar 404)
- ✅ Criar setor com dados inválidos (deve falhar)
- ✅ Buscar setores de cliente inexistente (deve retornar array vazio)
- ✅ Validar parâmetros inválidos (deve retornar 400)
- ✅ Deletar setor inexistente (deve retornar 404)
- ✅ Deletar setor com cargos vinculados (deve falhar)
- ✅ Verificar setor deletado (deve retornar 404)

---

## Notas Importantes

1. **Segurança:** Todas as operações verificam se o setor pertence ao cliente especificado.

2. **Integridade:** Não é possível excluir setores que possuem cargos vinculados.

3. **Unicidade:** Nomes de setores são únicos por cliente (case-insensitive).

4. **Departamento Opcional:** O campo departamento é opcional, permitindo flexibilidade organizacional.

5. **Ordenação:** A listagem de setores é ordenada alfabeticamente.

6. **Performance:** Queries otimizadas com índices apropriados.

7. **Logs:** Todas as operações são logadas para auditoria.

8. **Relacionamento:** A vinculação com cargos é feita através do ID do setor (foreign key).

9. **Cascata:** Ao deletar um setor, verifica-se se há cargos vinculados antes da exclusão.

---

## Diferenças em Relação aos Cargos

1. **Relacionamento com Departamentos:** 
   - Setores podem ter departamentos opcionais
   - Cargos têm setores obrigatórios

2. **Verificação de Uso:**
   - Setores: Busca por `cargo.setor_id = setor.id`
   - Cargos: Busca por `usuarios.cargo = cargo.nome_cargo`

3. **Flexibilidade:**
   - Setores permitem departamento opcional
   - Cargos têm relacionamentos obrigatórios com setor e senioridade

---

## Próximas Implementações

- [ ] API para migrar cargos entre setores
- [ ] API para estatísticas de setores
- [ ] API para histórico de alterações
- [ ] API para importação/exportação em massa
- [ ] API para hierarquia de setores
- [ ] API para busca de setores por departamento
- [ ] Sincronização automática com tabela de cargos
- [ ] Validação de permissões por setor
- [ ] API para templates de setores









