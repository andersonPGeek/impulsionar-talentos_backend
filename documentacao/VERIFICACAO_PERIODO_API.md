# APIs de Verificação de Período de Atualização

Este documento descreve as 2 novas APIs criadas para verificar se um usuário pode atualizar a Árvore da Vida ou Análise SWOT baseado no período configurado para cada cliente.

## Base URLs
```
/api/arvore-da-vida/verificar-periodo/:id_usuario
/api/analise-swot/verificar-periodo/:id_usuario
```

## Autenticação
Todas as rotas requerem autenticação via JWT token no header:
```
Authorization: Bearer <seu-token-jwt>
```

## Parâmetros
- `id_usuario` (path parameter): ID do usuário para verificar o período de atualização

---

## 📊 APIs Implementadas

### 1. Verificação de Período - Árvore da Vida
**GET** `/api/arvore-da-vida/verificar-periodo/:id_usuario`

Verifica se o usuário pode atualizar a árvore da vida baseado no período configurado no `controle_atualizacao_arvore`.

**Lógica:**
1. Busca o período configurado para o cliente do usuário na tabela `controle_atualizacao_arvore`
2. Busca a última atualização do usuário na tabela `arvore_da_vida`
3. Calcula se já passou o tempo necessário (período em meses) desde a última atualização
4. Retorna se pode atualizar e quantos meses restam

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "id_usuario": 123,
    "pode_atualizar": false,
    "periodo_configurado_meses": 6,
    "data_ultima_atualizacao": "2024-01-15T10:30:00.000Z",
    "proxima_atualizacao_permitida": "2024-07-15T10:30:00.000Z",
    "meses_restantes": 3,
    "mensagem": "Usuário deve aguardar 3 mês(es) para nova atualização"
  },
  "message": "Verificação de período realizada com sucesso"
}
```

**Resposta quando pode atualizar:**
```json
{
  "success": true,
  "data": {
    "id_usuario": 123,
    "pode_atualizar": true,
    "periodo_configurado_meses": 6,
    "data_ultima_atualizacao": "2024-01-15T10:30:00.000Z",
    "proxima_atualizacao_permitida": "2024-07-15T10:30:00.000Z",
    "meses_restantes": 0,
    "mensagem": "Usuário pode atualizar a árvore da vida"
  },
  "message": "Verificação de período realizada com sucesso"
}
```

**Resposta para usuário sem árvore da vida:**
```json
{
  "success": true,
  "data": {
    "id_usuario": 123,
    "pode_atualizar": true,
    "periodo_configurado_meses": 6,
    "data_ultima_atualizacao": null,
    "proxima_atualizacao_permitida": null,
    "meses_restantes": 0,
    "mensagem": "Usuário pode atualizar a árvore da vida"
  },
  "message": "Verificação de período realizada com sucesso"
}
```

### 2. Verificação de Período - Análise SWOT
**GET** `/api/analise-swot/verificar-periodo/:id_usuario`

Verifica se o usuário pode atualizar a análise SWOT baseado no período configurado no `controle_atualizacao_swot`.

**Lógica:**
1. Busca o período configurado para o cliente do usuário na tabela `controle_atualizacao_swot`
2. Busca a última atualização do usuário na tabela `analise_swot`
3. Calcula se já passou o tempo necessário (período em meses) desde a última atualização
4. Retorna se pode atualizar e quantos meses restam

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "id_usuario": 123,
    "pode_atualizar": false,
    "periodo_configurado_meses": 3,
    "data_ultima_atualizacao": "2024-02-10T14:20:00.000Z",
    "proxima_atualizacao_permitida": "2024-05-10T14:20:00.000Z",
    "meses_restantes": 2,
    "mensagem": "Usuário deve aguardar 2 mês(es) para nova atualização"
  },
  "message": "Verificação de período realizada com sucesso"
}
```

**Resposta quando pode atualizar:**
```json
{
  "success": true,
  "data": {
    "id_usuario": 123,
    "pode_atualizar": true,
    "periodo_configurado_meses": 3,
    "data_ultima_atualizacao": "2024-02-10T14:20:00.000Z",
    "proxima_atualizacao_permitida": "2024-05-10T14:20:00.000Z",
    "meses_restantes": 0,
    "mensagem": "Usuário pode atualizar a análise SWOT"
  },
  "message": "Verificação de período realizada com sucesso"
}
```

**Resposta para usuário sem análise SWOT:**
```json
{
  "success": true,
  "data": {
    "id_usuario": 123,
    "pode_atualizar": true,
    "periodo_configurado_meses": 3,
    "data_ultima_atualizacao": null,
    "proxima_atualizacao_permitida": null,
    "meses_restantes": 0,
    "mensagem": "Usuário pode atualizar a análise SWOT"
  },
  "message": "Verificação de período realizada com sucesso"
}
```

---

## 🚨 Códigos de Erro

### 400 - Bad Request
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "ID do usuário é obrigatório"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Período de controle não configurado para este cliente"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Erro ao verificar período de atualização"
}
```

---

## 📝 Detalhes Técnicos

### Cálculo do Período
- O cálculo é feito em meses usando a fórmula: `30.44 dias por mês`
- A comparação é feita entre a data atual e a data da última atualização + período configurado
- Se a diferença for positiva, significa que ainda não pode atualizar

### Tabelas Envolvidas

#### Para Árvore da Vida:
- `arvore_da_vida`: Tabela principal com as pontuações
- `controle_atualizacao_arvore`: Configuração do período por cliente
- `usuarios`: Para relacionar usuário com cliente

#### Para Análise SWOT:
- `analise_swot`: Tabela principal com os textos
- `controle_atualizacao_swot`: Configuração do período por cliente
- `usuarios`: Para relacionar usuário com cliente

### Validações
- `id_usuario` deve ser um número inteiro positivo
- Período deve estar configurado para o cliente
- Datas são tratadas como UTC

---

## 🔧 Exemplos de Uso

### cURL
```bash
# Verificar período para árvore da vida
curl -X GET \
  http://localhost:3000/api/arvore-da-vida/verificar-periodo/123 \
  -H "Authorization: Bearer SEU_TOKEN_JWT"

# Verificar período para análise SWOT
curl -X GET \
  http://localhost:3000/api/analise-swot/verificar-periodo/123 \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### JavaScript (Fetch)
```javascript
// Verificar período árvore da vida
const responseArvore = await fetch('/api/arvore-da-vida/verificar-periodo/123', {
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_JWT'
  }
});

const dataArvore = await responseArvore.json();
console.log('Pode atualizar árvore da vida:', dataArvore.data.pode_atualizar);

// Verificar período análise SWOT
const responseSwot = await fetch('/api/analise-swot/verificar-periodo/123', {
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_JWT'
  }
});

const dataSwot = await responseSwot.json();
console.log('Pode atualizar análise SWOT:', dataSwot.data.pode_atualizar);
```

### React/React Native
```javascript
const verificarPeriodoArvore = async (idUsuario) => {
  try {
    const response = await fetch(`/api/arvore-da-vida/verificar-periodo/${idUsuario}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.data.pode_atualizar) {
        // Permitir atualização
        console.log('Usuário pode atualizar');
      } else {
        // Mostrar mensagem de período
        alert(data.data.mensagem);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar período:', error);
  }
};
```

---

## 📋 Casos de Uso

1. **Verificação antes de permitir edição**: Chamar a API antes de habilitar o botão de "Atualizar"
2. **Mostrar status na interface**: Exibir quantos meses restam para próxima atualização
3. **Validação no backend**: Usar essas informações para validar se deve permitir a atualização
4. **Relatórios**: Mostrar estatísticas de quando usuários podem atualizar novamente

---

## ⚠️ Notas Importantes

1. **Configuração Necessária**: O período deve estar configurado na tabela de controle para cada cliente
2. **Primeira Vez**: Usuários que nunca fizeram a avaliação podem sempre criar pela primeira vez
3. **Precisão**: O cálculo considera meses completos (30.44 dias)
4. **Timezone**: Todas as datas são tratadas em UTC
5. **Performance**: As consultas são otimizadas para buscar apenas os dados necessários




