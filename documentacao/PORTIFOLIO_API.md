# API de Portfólio - Impulsionar Talentos

## Visão Geral

A API de Portfólio permite que usuários salvem e consultem suas experiências profissionais, incluindo materiais, links e feedbacks. Os arquivos são armazenados no Supabase Storage.

## Endpoints

### 1. Salvar Portfólio

**POST** `/api/portifolio`

Salva um portfólio completo com experiências, materiais, links e feedbacks.

#### Parâmetros (FormData)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id_usuario` | integer | Sim | ID do usuário |
| `experiencias` | string (JSON) | Sim | Array de experiências em formato JSON |
| `materiais` | file[] | Não | Arquivos para upload (máximo 20, 10MB cada) |

#### Estrutura do JSON `experiencias`

```json
[
  {
    "titulo_experiencia": "Desenvolvimento de Sistema Web",
    "data_experiencia": "2024-01-15",
    "acao_realizada": "Desenvolvi um sistema completo de gestão",
    "resultado_entregue": "Sistema implementado com sucesso, reduzindo tempo de processamento em 50%",
    "materiais": [
      {
        "originalname": "screenshot1.png",
        "mimetype": "image/png",
        "buffer": "binary_data"
      }
    ],
    "links": [
      {
        "link_evidencia": "https://github.com/usuario/projeto"
      }
    ],
    "feedbacks": [
      {
        "feedback": "Excelente trabalho, muito profissional!",
        "autor": "João Silva"
      }
    ]
  }
]
```

#### Resposta de Sucesso (201)

```json
{
  "success": true,
  "message": "Portfólio salvo com sucesso",
  "data": {
    "id_usuario": 1,
    "experiencias_salvas": 1,
    "experiencias": [
      {
        "id_experiencia_portifolio": 123,
        "titulo_experiencia": "Desenvolvimento de Sistema Web",
        "status": "success"
      }
    ]
  },
  "timestamp": "2025-08-17T23:44:57.481Z"
}
```

#### Resposta de Erro (400)

```json
{
  "success": false,
  "message": "ID do usuário é obrigatório",
  "error": "MISSING_USER_ID"
}
```

#### Tipos de Erro

| Código | Descrição |
|--------|-----------|
| `MISSING_USER_ID` | ID do usuário não fornecido |
| `MISSING_EXPERIENCIAS` | Experiências não fornecidas |
| `INVALID_EXPERIENCIAS_FORMAT` | Formato JSON inválido |
| `EMPTY_EXPERIENCIAS` | Lista de experiências vazia |
| `INCOMPLETE_EXPERIENCIA` | Experiência com campos obrigatórios faltando |
| `FILE_TOO_LARGE` | Arquivo maior que 10MB |
| `TOO_MANY_FILES` | Mais de 20 arquivos enviados |
| `INVALID_FILE_TYPE` | Tipo de arquivo não permitido |
| `MATERIAL_UPLOAD_ERROR` | Erro no upload do arquivo |

### 2. Atualizar Experiência

**PUT** `/api/portifolio/:id_usuario/:id_experiencia_portifolio`

Atualiza uma experiência específica (deleta e recria com novos dados).

#### Parâmetros

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id_usuario` | integer | Sim | ID do usuário |
| `id_experiencia_portifolio` | integer | Sim | ID da experiência a ser atualizada |

#### Parâmetros (FormData)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `experiencias` | string (JSON) | Sim | Array com uma experiência em formato JSON |
| `materiais` | file[] | Não | Arquivos para upload (máximo 20, 10MB cada) |

#### Estrutura do JSON `experiencias`

Mesma estrutura do endpoint POST.

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Experiência atualizada com sucesso",
  "data": {
    "id_usuario": 1,
    "id_experiencia_portifolio": 123,
    "titulo_experiencia": "Experiência Atualizada",
    "status": "success"
  },
  "timestamp": "2025-08-17T23:44:57.481Z"
}
```

#### Resposta de Erro (404)

```json
{
  "success": false,
  "message": "Experiência não encontrada para este usuário",
  "error": "EXPERIENCE_NOT_FOUND"
}
```

### 3. Deletar Experiência

**DELETE** `/api/portifolio/:id_usuario/:id_experiencia_portifolio`

Deleta uma experiência específica (incluindo arquivos do S3).

#### Parâmetros

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id_usuario` | integer | Sim | ID do usuário |
| `id_experiencia_portifolio` | integer | Sim | ID da experiência a ser deletada |

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Experiência deletada com sucesso",
  "data": {
    "id_usuario": 1,
    "id_experiencia_portifolio": 123,
    "titulo_experiencia": "Experiência Deletada",
    "arquivos_deletados": 2
  },
  "timestamp": "2025-08-17T23:44:57.481Z"
}
```

#### Resposta de Erro (404)

```json
{
  "success": false,
  "message": "Experiência não encontrada para este usuário",
  "error": "EXPERIENCE_NOT_FOUND"
}
```

### 4. Buscar Portfólio

**GET** `/api/portifolio/:id_usuario`

Busca o portfólio completo de um usuário.

#### Parâmetros

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id_usuario` | integer | Sim | ID do usuário |

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Portfólio encontrado com sucesso",
  "data": {
    "id_usuario": 1,
    "experiencias": [
      {
        "id": 123,
        "titulo_experiencia": "Desenvolvimento de Sistema Web",
        "data_experiencia": "2024-01-15",
        "acao_realizada": "Desenvolvi um sistema completo de gestão",
        "resultado_entregue": "Sistema implementado com sucesso, reduzindo tempo de processamento em 50%",
        "created_at": "2025-08-17T23:44:57.481Z",
        "materiais": [
          {
            "id": 456,
            "material": "https://fdopxrrcvbzhwszsluwm.supabase.co/storage/v1/object/public/portifolio/usuario_1/experiencia_123/1734567890123_screenshot1.png",
            "created_at": "2025-08-17T23:44:58.123Z"
          }
        ],
        "links": [
          {
            "id": 789,
            "link_evidencia": "https://github.com/usuario/projeto",
            "created_at": "2025-08-17T23:44:59.456Z"
          }
        ],
        "feedbacks": [
          {
            "id": 101,
            "feedback": "Excelente trabalho, muito profissional!",
            "autor": "João Silva",
            "created_at": "2025-08-17T23:45:00.789Z"
          }
        ]
      }
    ],
    "total_experiencias": 1
  },
  "timestamp": "2025-08-17T23:44:57.481Z"
}
```

#### Resposta de Erro (400)

```json
{
  "success": false,
  "message": "ID do usuário é obrigatório",
  "error": "MISSING_USER_ID"
}
```

## Estrutura das Tabelas

### experiencia_portifolio
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | bigint (PK) | ID único da experiência |
| `created_at` | timestamptz | Data de criação |
| `titulo_experiencia` | text | Título da experiência |
| `data_experiencia` | date | Data da experiência |
| `acao_realizada` | text | Descrição da ação realizada |
| `resultado_entregue` | text | Resultado entregue |
| `id_usuario` | bigint (FK) | ID do usuário |

### materiais_portifolio
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | bigint (PK) | ID único do material |
| `created_at` | timestamptz | Data de criação |
| `id_experiencia_portifolio` | bigint (FK) | ID da experiência |
| `material` | text | Metadados do arquivo (JSON) ou URL do arquivo no Supabase Storage |

### links_portifolio
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | bigint (PK) | ID único do link |
| `created_at` | timestamptz | Data de criação |
| `link_evidencia` | text | URL do link externo |
| `id_experiencia_portifolio` | bigint (FK) | ID da experiência |

### feedbacks_portifolio
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | bigint (PK) | ID único do feedback |
| `created_at` | timestamptz | Data de criação |
| `feedback` | text | Texto do feedback |
| `autor` | text | Nome do autor do feedback |
| `id_experiencia_portifolio` | bigint (FK) | ID da experiência |

## Tipos de Arquivo Permitidos

- **Imagens**: JPEG, PNG, GIF
- **Documentos**: PDF, DOC, DOCX, PPT, PPTX
- **Texto**: TXT

## Limites

- **Tamanho máximo por arquivo**: 10MB
- **Máximo de arquivos por requisição**: 20
- **Estrutura de pastas no Storage**: `usuario_{id_usuario}/experiencia_{id_experiencia}/`

## Nota sobre Armazenamento de Arquivos

**Status Atual**: Os arquivos estão sendo armazenados no Supabase Storage (S3-compatible) com URLs públicas. A coluna `material` na tabela `materiais_portifolio` contém a URL completa do arquivo:

```
https://fdopxrrcvbzhwszsluwm.storage.supabase.co/storage/v1/object/public/portifolio/usuario_1/experiencia_123/1734567890123_arquivo.pdf
```

**Funcionalidades implementadas**:
- Upload de arquivos para o bucket `portifolio` do Supabase Storage
- Criação automática de pastas por usuário e experiência
- Sanitização de nomes de arquivos para compatibilidade com S3
- Deleção de arquivos do S3 quando o portfólio é deletado
- Verificação de pastas existentes para evitar duplicação

## Exemplos de Uso

### cURL - Salvar Portfólio

```bash
curl -X POST http://localhost:3002/api/portifolio \
  -F "id_usuario=1" \
  -F 'experiencias=[{"titulo_experiencia":"Projeto Web","data_experiencia":"2024-01-15","acao_realizada":"Desenvolvi um sistema","resultado_entregue":"Sistema funcionando"}]' \
  -F "materiais=@screenshot.png"
```

### cURL - Atualizar Experiência

```bash
curl -X PUT http://localhost:3002/api/portifolio/1/123 \
  -F 'experiencias=[{"titulo_experiencia":"Projeto Atualizado","data_experiencia":"2024-02-15","acao_realizada":"Ação atualizada","resultado_entregue":"Resultado atualizado"}]' \
  -F "materiais=@novo_arquivo.png"
```

### cURL - Deletar Experiência

```bash
curl -X DELETE http://localhost:3002/api/portifolio/1/123
```

### cURL - Buscar Portfólio

```bash
curl -X GET http://localhost:3002/api/portifolio/1
```

### JavaScript - Salvar Portfólio

```javascript
const formData = new FormData();
formData.append('id_usuario', '1');
formData.append('experiencias', JSON.stringify([
  {
    titulo_experiencia: "Projeto Web",
    data_experiencia: "2024-01-15",
    acao_realizada: "Desenvolvi um sistema",
    resultado_entregue: "Sistema funcionando",
    links: [
      { link_evidencia: "https://github.com/usuario/projeto" }
    ],
    feedbacks: [
      { feedback: "Excelente trabalho!", autor: "João Silva" }
    ]
  }
]));

// Adicionar arquivos se houver
const fileInput = document.getElementById('fileInput');
if (fileInput.files.length > 0) {
  for (let file of fileInput.files) {
    formData.append('materiais', file);
  }
}

fetch('http://localhost:3002/api/portifolio', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso - Portfólio encontrado, experiência atualizada ou deletada |
| 201 | Criado - Portfólio salvo com sucesso |
| 400 | Erro de validação ou parâmetros inválidos |
| 404 | Experiência não encontrada para o usuário |
| 500 | Erro interno do servidor |

## Logs

A API gera logs detalhados para:
- Início e fim de operações
- Upload de arquivos
- Deleção de arquivos do S3
- Erros de validação
- Erros de banco de dados
- Erros de upload para Supabase Storage
- Operações de atualização e deleção de experiências específicas
- Verificação de propriedade de experiências por usuário
