# API de Perfil do Colaborador

Esta documentação descreve a API relacionada ao gerenciamento do perfil completo do colaborador, incluindo identidade profissional, habilidades técnicas e comportamentais, interesses, objetivos de carreira, disponibilidade e histórico inicial.

## Base URL

```
http://localhost:3002/api/perfil-colaborador
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header `Authorization`.

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Buscar Perfil Completo do Colaborador

Busca todas as informações do perfil de um colaborador específico.

**Endpoint:** `GET /api/perfil-colaborador/:id_user`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_user` (integer): ID do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Perfil do colaborador buscado com sucesso",
  "data": {
    "id_user": 123,
    "identidade_profissional": {
      "area_time": "Tecnologia / Plataforma",
      "tempo_empresa_meses": 18,
      "tempo_experiencia_total_anos": 7,
      "formacao_nivel": "Superior Completo",
      "formacao_area": "Sistemas de Informação",
      "certificacoes": "AWS Cloud Practitioner; Scrum Master; ITIL Foundation"
    },
    "habilidades_tecnicas": [
      {
        "nome_habilidade": "Node.js",
        "nivel_autoavaliado": 4,
        "nivel_exigido_cargo": 4,
        "experiencia_pratica": "3 anos em APIs REST, autenticação, integrações e mensageria",
        "evidencias": "Projeto X (2024), API Y (2025), PRs #120-#180"
      },
      {
        "nome_habilidade": "PostgreSQL",
        "nivel_autoavaliado": 3,
        "nivel_exigido_cargo": 3,
        "experiencia_pratica": "2 anos modelando tabelas, índices, queries e performance",
        "evidencias": "Modelagem do módulo PDI; otimização de query no relatório executivo"
      }
    ],
    "habilidades_comportamentais": {
      "comunicacao": 4,
      "trabalho_equipe": 5,
      "organizacao": 4,
      "autonomia": 4,
      "lideranca": 3,
      "resiliencia": 4,
      "aprendizado_continuo": 5
    },
    "interesses_motivadores": {
      "gosta_trabalho": "Resolver problemas complexos, criar soluções escaláveis e ajudar o time a evoluir.",
      "nao_gosta_trabalho": "Burocracia excessiva sem clareza de valor e retrabalho por falta de alinhamento.",
      "preferencia_desafio": "tecnico",
      "preferencia_crescimento": "crescimento",
      "fator_retencao": "Trabalhar com autonomia, ter clareza de trilha de carreira, desafios relevantes e reconhecimento justo."
    },
    "proposito_valores": {
      "orgulho_trabalho": "Quando entrego algo que gera impacto real e simplifica a vida de pessoas e times.",
      "impacto_desejado": "Criar soluções que aumentem produtividade e desenvolvam pessoas.",
      "nao_aceita_ambiente": "Falta de ética, desrespeito, política interna tóxica e ausência de transparência.",
      "definicao_sucesso": "Crescer mantendo equilíbrio, gerar impacto, ser reconhecido pela qualidade e ajudar outros a evoluírem."
    },
    "objetivos_carreira": {
      "objetivo_1_ano": "Consolidar como referência técnica do time e liderar entregas de médio porte.",
      "objetivo_3_anos": "Atuar como Tech Lead/Staff, com influência em arquitetura e mentoria do time.",
      "objetivo_5_anos": "Assumir liderança estratégica (Staff/Principal ou Head técnico) com foco em produto e pessoas.",
      "trilha_carreira": "hibrido"
    },
    "disponibilidade": {
      "horas_semanais_desenvolvimento": 6,
      "preferencia_aprendizado": "pratica",
      "aberto_mudanca": true,
      "aceita_desafios": true
    },
    "historico_inicial": {
      "cursos_realizados": "Curso de Arquitetura de Software (2025); Clean Code (2024); Kubernetes básico (2024).",
      "eventos_palestras": "TDC (2024); Webinar IA aplicada (2025); Meetup Node BH (2025).",
      "projetos_relevantes": "Backend de PDI; Módulo de relatórios executivos; Integração com serviços externos.",
      "feedbacks_recebidos": "Pontos fortes: entrega consistente e colaboração. Melhorar: delegar mais e aumentar influência transversal."
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Resposta quando não há perfil (404):**
```json
{
  "success": false,
  "message": {
    "error": "PROFILE_NOT_FOUND",
    "message": "Perfil do colaborador não encontrado"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": {
    "error": "INVALID_USER_ID",
    "message": "ID do usuário é obrigatório e deve ser um número válido"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Criar Perfil Completo do Colaborador

Cria um novo perfil completo para um colaborador.

**Endpoint:** `POST /api/perfil-colaborador`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_user": 123,
  "identidade_profissional": {
    "area_time": "Tecnologia / Plataforma",
    "tempo_empresa_meses": 18,
    "tempo_experiencia_total_anos": 7,
    "formacao_nivel": "Superior Completo",
    "formacao_area": "Sistemas de Informação",
    "certificacoes": "AWS Cloud Practitioner; Scrum Master; ITIL Foundation"
  },
  "habilidades_tecnicas": [
    {
      "nome_habilidade": "Node.js",
      "nivel_autoavaliado": 4,
      "nivel_exigido_cargo": 4,
      "experiencia_pratica": "3 anos em APIs REST, autenticação, integrações e mensageria",
      "evidencias": "Projeto X (2024), API Y (2025), PRs #120-#180"
    },
    {
      "nome_habilidade": "PostgreSQL",
      "nivel_autoavaliado": 3,
      "nivel_exigido_cargo": 3,
      "experiencia_pratica": "2 anos modelando tabelas, índices, queries e performance",
      "evidencias": "Modelagem do módulo PDI; otimização de query no relatório executivo"
    }
  ],
  "habilidades_comportamentais": {
    "comunicacao": 4,
    "trabalho_equipe": 5,
    "organizacao": 4,
    "autonomia": 4,
    "lideranca": 3,
    "resiliencia": 4,
    "aprendizado_continuo": 5
  },
  "interesses_motivadores": {
    "gosta_trabalho": "Resolver problemas complexos, criar soluções escaláveis e ajudar o time a evoluir.",
    "nao_gosta_trabalho": "Burocracia excessiva sem clareza de valor e retrabalho por falta de alinhamento.",
    "preferencia_desafio": "tecnico",
    "preferencia_crescimento": "crescimento",
    "fator_retencao": "Trabalhar com autonomia, ter clareza de trilha de carreira, desafios relevantes e reconhecimento justo."
  },
  "proposito_valores": {
    "orgulho_trabalho": "Quando entrego algo que gera impacto real e simplifica a vida de pessoas e times.",
    "impacto_desejado": "Criar soluções que aumentem produtividade e desenvolvam pessoas.",
    "nao_aceita_ambiente": "Falta de ética, desrespeito, política interna tóxica e ausência de transparência.",
    "definicao_sucesso": "Crescer mantendo equilíbrio, gerar impacto, ser reconhecido pela qualidade e ajudar outros a evoluírem."
  },
  "objetivos_carreira": {
    "objetivo_1_ano": "Consolidar como referência técnica do time e liderar entregas de médio porte.",
    "objetivo_3_anos": "Atuar como Tech Lead/Staff, com influência em arquitetura e mentoria do time.",
    "objetivo_5_anos": "Assumir liderança estratégica (Staff/Principal ou Head técnico) com foco em produto e pessoas.",
    "trilha_carreira": "hibrido"
  },
  "disponibilidade": {
    "horas_semanais_desenvolvimento": 6,
    "preferencia_aprendizado": "pratica",
    "aberto_mudanca": true,
    "aceita_desafios": true
  },
  "historico_inicial": {
    "cursos_realizados": "Curso de Arquitetura de Software (2025); Clean Code (2024); Kubernetes básico (2024).",
    "eventos_palestras": "TDC (2024); Webinar IA aplicada (2025); Meetup Node BH (2025).",
    "projetos_relevantes": "Backend de PDI; Módulo de relatórios executivos; Integração com serviços externos.",
    "feedbacks_recebidos": "Pontos fortes: entrega consistente e colaboração. Melhorar: delegar mais e aumentar influência transversal."
  }
}
```

**Resposta de Sucesso (200):**
Retorna o perfil completo criado (mesmo formato do GET).

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": {
    "error": "INVALID_USER_ID",
    "message": "Usuário não encontrado"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 3. Atualizar Perfil Completo do Colaborador

Atualiza o perfil completo de um colaborador. Usa a mesma estrutura do POST. Se um registro já existe, é atualizado; caso contrário, é criado.

**Endpoint:** `PUT /api/perfil-colaborador`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:** (mesmo formato do POST)

**Resposta de Sucesso (200):**
Retorna o perfil completo atualizado (mesmo formato do GET).

**Nota:** A atualização segue a mesma lógica da criação. Campos que já existem são atualizados; novos campos são inseridos. Para habilidades técnicas, todas as anteriores são removidas e as novas são inseridas.

---

### 4. Deletar Perfil Completo do Colaborador

Remove todas as informações do perfil de um colaborador.

**Endpoint:** `DELETE /api/perfil-colaborador/:id_user`

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros da URL:**
- `id_user` (integer): ID do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Perfil do colaborador deletado com sucesso",
  "data": {
    "id_user": 123,
    "message": "Perfil deletado com sucesso"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": {
    "error": "INVALID_USER_ID",
    "message": "ID do usuário é obrigatório e deve ser um número válido"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Estrutura dos Dados

### Identidade Profissional

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `area_time` | string (max 100) | ❌ | Área/time de atuação |
| `tempo_empresa_meses` | integer | ❌ | Tempo na empresa em meses |
| `tempo_experiencia_total_anos` | integer | ❌ | Tempo total de experiência em anos |
| `formacao_nivel` | string (max 50) | ❌ | Nível de formação |
| `formacao_area` | string (max 100) | ❌ | Área de formação |
| `certificacoes` | text | ❌ | Certificações obtidas |

### Habilidades Técnicas

Array de objetos com:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nome_habilidade` | string (max 100) | ✅ | Nome da habilidade técnica |
| `nivel_autoavaliado` | integer (1-5) | ❌ | Nível autoavaliado (1-5) |
| `nivel_exigido_cargo` | integer (1-5) | ❌ | Nível exigido pelo cargo (1-5) |
| `experiencia_pratica` | text | ❌ | Descrição da experiência prática |
| `evidencias` | text | ❌ | Evidências da habilidade |

### Habilidades Comportamentais

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `comunicacao` | integer (1-5) | ❌ | Nível de comunicação |
| `trabalho_equipe` | integer (1-5) | ❌ | Nível de trabalho em equipe |
| `organizacao` | integer (1-5) | ❌ | Nível de organização |
| `autonomia` | integer (1-5) | ❌ | Nível de autonomia |
| `lideranca` | integer (1-5) | ❌ | Nível de liderança |
| `resiliencia` | integer (1-5) | ❌ | Nível de resiliência |
| `aprendizado_continuo` | integer (1-5) | ❌ | Nível de aprendizado contínuo |

### Interesses e Motivadores

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `gosta_trabalho` | text | ❌ | O que gosta no trabalho |
| `nao_gosta_trabalho` | text | ❌ | O que não gosta no trabalho |
| `preferencia_desafio` | string | ❌ | Valores: `tecnico`, `pessoas`, `estrategia` |
| `preferencia_crescimento` | string | ❌ | Valores: `estabilidade`, `crescimento` |
| `fator_retencao` | text | ❌ | Fatores de retenção |

### Propósito e Valores

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `orgulho_trabalho` | text | ❌ | Situação que gera orgulho no trabalho |
| `impacto_desejado` | text | ❌ | Impacto desejado no trabalho |
| `nao_aceita_ambiente` | text | ❌ | O que não aceita no ambiente |
| `definicao_sucesso` | text | ❌ | Definição pessoal de sucesso |

### Objetivos de Carreira

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `objetivo_1_ano` | text | ❌ | Objetivo para 1 ano |
| `objetivo_3_anos` | text | ❌ | Objetivo para 3 anos |
| `objetivo_5_anos` | text | ❌ | Objetivo para 5 anos |
| `trilha_carreira` | string | ❌ | Valores: `lideranca`, `especialista`, `hibrido` |

### Disponibilidade

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `horas_semanais_desenvolvimento` | integer | ❌ | Horas semanais para desenvolvimento |
| `preferencia_aprendizado` | string | ❌ | Valores: `cursos`, `pratica`, `mentoria` |
| `aberto_mudanca` | boolean | ❌ | Se está aberto a mudanças |
| `aceita_desafios` | boolean | ❌ | Se aceita desafios |

### Histórico Inicial

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `cursos_realizados` | text | ❌ | Cursos realizados |
| `eventos_palestras` | text | ❌ | Eventos e palestras participados |
| `projetos_relevantes` | text | ❌ | Projetos relevantes |
| `feedbacks_recebidos` | text | ❌ | Feedbacks recebidos |

---

## Validações

### Validações Gerais

1. **ID do Usuário:**
   - Deve ser um número inteiro positivo
   - Deve existir na tabela `usuarios`
   - Campo obrigatório

2. **Níveis de Habilidade:**
   - Valores entre 1 e 5
   - Aplica-se a habilidades técnicas e comportamentais

3. **Valores Enum:**
   - `preferencia_desafio`: `tecnico`, `pessoas`, `estrategia`
   - `preferencia_crescimento`: `estabilidade`, `crescimento`
   - `trilha_carreira`: `lideranca`, `especialista`, `hibrido`
   - `preferencia_aprendizado`: `cursos`, `pratica`, `mentoria`

### Regras de Negócio

1. **Criação/Atualização:**
   - Todos os campos são opcionais, exceto `id_user`
   - Se um registro já existe, é atualizado; caso contrário, é criado
   - Para habilidades técnicas: sempre remove todas as anteriores e insere as novas

2. **Transações:**
   - Todas as operações são realizadas em transações
   - Em caso de erro, todas as alterações são revertidas

3. **Integridade:**
   - O `id_user` deve existir na tabela `usuarios`
   - Foreign keys são validadas automaticamente

---

## Estrutura do Banco de Dados

### Tabela: `identidade_profissional`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único |
| `id_user` | INT NOT NULL | ID do usuário (FK) |
| `area_time` | VARCHAR(100) | Área/time |
| `tempo_empresa_meses` | INT | Tempo na empresa em meses |
| `tempo_experiencia_total_anos` | INT | Tempo de experiência em anos |
| `formacao_nivel` | VARCHAR(50) | Nível de formação |
| `formacao_area` | VARCHAR(100) | Área de formação |
| `certificacoes` | TEXT | Certificações |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

### Tabela: `habilidades_tecnicas`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único |
| `id_user` | INT NOT NULL | ID do usuário (FK) |
| `nome_habilidade` | VARCHAR(100) NOT NULL | Nome da habilidade |
| `nivel_autoavaliado` | INT (1-5) | Nível autoavaliado |
| `nivel_exigido_cargo` | INT (1-5) | Nível exigido |
| `experiencia_pratica` | TEXT | Experiência prática |
| `evidencias` | TEXT | Evidências |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

### Tabela: `habilidades_comportamentais`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único |
| `id_user` | INT NOT NULL | ID do usuário (FK) |
| `comunicacao` | INT (1-5) | Nível de comunicação |
| `trabalho_equipe` | INT (1-5) | Trabalho em equipe |
| `organizacao` | INT (1-5) | Organização |
| `autonomia` | INT (1-5) | Autonomia |
| `lideranca` | INT (1-5) | Liderança |
| `resiliencia` | INT (1-5) | Resiliência |
| `aprendizado_continuo` | INT (1-5) | Aprendizado contínuo |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

### Tabela: `interesses_motivadores`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único |
| `id_user` | INT NOT NULL | ID do usuário (FK) |
| `gosta_trabalho` | TEXT | O que gosta |
| `nao_gosta_trabalho` | TEXT | O que não gosta |
| `preferencia_desafio` | VARCHAR(30) | Preferência de desafio |
| `preferencia_crescimento` | VARCHAR(30) | Preferência de crescimento |
| `fator_retencao` | TEXT | Fator de retenção |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

### Tabela: `proposito_valores`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único |
| `id_user` | INT NOT NULL | ID do usuário (FK) |
| `orgulho_trabalho` | TEXT | Orgulho no trabalho |
| `impacto_desejado` | TEXT | Impacto desejado |
| `nao_aceita_ambiente` | TEXT | Não aceita no ambiente |
| `definicao_sucesso` | TEXT | Definição de sucesso |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

### Tabela: `objetivos_carreira`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único |
| `id_user` | INT NOT NULL | ID do usuário (FK) |
| `objetivo_1_ano` | TEXT | Objetivo 1 ano |
| `objetivo_3_anos` | TEXT | Objetivo 3 anos |
| `objetivo_5_anos` | TEXT | Objetivo 5 anos |
| `trilha_carreira` | VARCHAR(30) | Trilha de carreira |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

### Tabela: `disponibilidade`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único |
| `id_user` | INT NOT NULL | ID do usuário (FK) |
| `horas_semanais_desenvolvimento` | INT | Horas semanais |
| `preferencia_aprendizado` | VARCHAR(30) | Preferência de aprendizado |
| `aberto_mudanca` | BOOLEAN | Aberto a mudanças |
| `aceita_desafios` | BOOLEAN | Aceita desafios |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

### Tabela: `historico_inicial`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID único |
| `id_user` | INT NOT NULL | ID do usuário (FK) |
| `cursos_realizados` | TEXT | Cursos realizados |
| `eventos_palestras` | TEXT | Eventos e palestras |
| `projetos_relevantes` | TEXT | Projetos relevantes |
| `feedbacks_recebidos` | TEXT | Feedbacks recebidos |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

---

## Exemplos de Uso

### Exemplo 1: Buscar Perfil

```bash
curl -X GET "http://localhost:3002/api/perfil-colaborador/123" \
  -H "Authorization: Bearer <token>"
```

### Exemplo 2: Criar Perfil

```bash
curl -X POST "http://localhost:3002/api/perfil-colaborador" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_user": 123,
    "identidade_profissional": {
      "area_time": "Tecnologia / Plataforma",
      "tempo_empresa_meses": 18,
      "formacao_nivel": "Superior Completo"
    },
    "habilidades_tecnicas": [
      {
        "nome_habilidade": "Node.js",
        "nivel_autoavaliado": 4,
        "nivel_exigido_cargo": 4
      }
    ]
  }'
```

### Exemplo 3: Atualizar Perfil

```bash
curl -X PUT "http://localhost:3002/api/perfil-colaborador" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_user": 123,
    "habilidades_tecnicas": [
      {
        "nome_habilidade": "Node.js",
        "nivel_autoavaliado": 5,
        "nivel_exigido_cargo": 4
      },
      {
        "nome_habilidade": "PostgreSQL",
        "nivel_autoavaliado": 3
      }
    ]
  }'
```

### Exemplo 4: Deletar Perfil

```bash
curl -X DELETE "http://localhost:3002/api/perfil-colaborador/123" \
  -H "Authorization: Bearer <token>"
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `INVALID_USER_ID` | ID do usuário inválido ou não fornecido |
| `PROFILE_NOT_FOUND` | Perfil não encontrado |
| `INTERNAL_ERROR` | Erro interno do servidor |

---

## Notas Importantes

1. **Transações:** Todas as operações de criação e atualização são realizadas em transações para garantir consistência.

2. **Atualização de Habilidades Técnicas:** Ao atualizar, todas as habilidades técnicas anteriores são removidas e as novas são inseridas.

3. **Campos Opcionais:** Todos os campos são opcionais, exceto `id_user`. Você pode enviar apenas os campos que deseja criar/atualizar.

4. **Upsert:** A API realiza "upsert" (insert ou update) automaticamente. Se um registro existe, é atualizado; caso contrário, é criado.

5. **Deleção:** A deleção remove todos os registros relacionados ao usuário em todas as 8 tabelas.

6. **Validação de Foreign Key:** O sistema valida automaticamente se o `id_user` existe na tabela `usuarios`.

---

## Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso (GET, PUT, DELETE) |
| 201 | Criado com sucesso (POST) |
| 400 | Erro de validação ou dados inválidos |
| 404 | Perfil não encontrado |
| 500 | Erro interno do servidor |
