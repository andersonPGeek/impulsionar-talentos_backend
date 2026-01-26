#!/bin/bash

# Teste da API de Controle Emocional
# Certifique-se de que o servidor está rodando em http://localhost:3002

BASE_URL="http://localhost:3002/api/controle-emocional"
TOKEN="seu_token_jwt_aqui"  # Substitua com um token válido

echo "==================================="
echo "Testes da API de Controle Emocional"
echo "==================================="
echo ""

# Teste 1: Registrar check-in com score alto (sem motivo)
echo "1. Registrar check-in com score 5 (sem motivo)"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id_user": 12,
    "score": 5
  }' | json_pp
echo ""
echo ""

# Teste 2: Registrar check-in com score baixo (com motivo)
echo "2. Registrar check-in com score 2 (com motivo)"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id_user": 12,
    "score": 2,
    "motivo": "Bastante cansado com muitos deadlines",
    "categoria_motivo": "cansaço"
  }' | json_pp
echo ""
echo ""

# Teste 3: Tentar registrar check-in com score baixo SEM motivo (deve falhar)
echo "3. Tentar registrar score 2 SEM motivo (deve retornar erro 400)"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id_user": 12,
    "score": 2
  }' | json_pp
echo ""
echo ""

# Teste 4: Buscar check-in de hoje
echo "4. Buscar check-in de hoje"
curl -X GET "$BASE_URL/12/hoje" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""
echo ""

# Teste 5: Buscar histórico
echo "5. Buscar histórico (últimos 30 dias)"
curl -X GET "$BASE_URL/12/historico?limite=10" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""
echo ""

# Teste 6: Buscar estatísticas
echo "6. Buscar estatísticas do mês"
curl -X GET "$BASE_URL/12/estatisticas" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""

echo "==================================="
echo "Testes concluídos"
echo "==================================="
