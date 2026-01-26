#!/bin/bash

# Script de teste para API de Ações e Profissionais de Saúde Mental
# Base URL
BASE_URL="http://localhost:3002/api/controle-emocional"
TOKEN="seu_token_jwt_aqui"

echo "============================================"
echo "TESTES: Profissionais de Saúde Mental"
echo "============================================"

echo -e "\n--- TESTE 1: Criar Profissional Psicólogo ---"
curl -X POST "$BASE_URL/profissionais" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Dr. João Silva",
    "tipo_profissional": "psicologo",
    "crp_ou_registro": "CRP/SP 01234/2020",
    "especialidades": "Ansiedade, Depressão, Burnout",
    "telefone": "(11) 98765-4321",
    "email": "joao@example.com",
    "atende_online": true,
    "atende_presencial": false,
    "cidade": "São Paulo",
    "estado": "SP",
    "valor_sessao": 150.00
  }' | jq .

echo -e "\n--- TESTE 2: Criar Profissional Psiquiatra ---"
curl -X POST "$BASE_URL/profissionais" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Dra. Maria Santos",
    "tipo_profissional": "psiquiatra",
    "crp_ou_registro": "CRM/SP 123456",
    "especialidades": "Depressão, Ansiedade, TDAH",
    "telefone": "(11) 99999-8888",
    "email": "maria@example.com",
    "atende_online": true,
    "atende_presencial": true,
    "cidade": "São Paulo",
    "estado": "SP",
    "valor_sessao": 300.00
  }' | jq .

echo -e "\n--- TESTE 3: Listar Profissionais ---"
curl -X GET "$BASE_URL/profissionais?tipo_profissional=psicologo&ativo=true&limite=10&offset=0" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n--- TESTE 4: Listar Profissionais que Atendem Online ---"
curl -X GET "$BASE_URL/profissionais?atende_online=true&limite=10" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n--- TESTE 5: Buscar Profissional por ID ---"
curl -X GET "$BASE_URL/profissionais/1" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n--- TESTE 6: Atualizar Profissional ---"
curl -X PUT "$BASE_URL/profissionais/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "especialidades": "Ansiedade, Depressão, Burnout, Estresse",
    "valor_sessao": 180.00
  }' | jq .

echo -e "\n--- TESTE 7: Desativar Profissional ---"
curl -X PUT "$BASE_URL/profissionais/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ativo": false
  }' | jq .

echo -e "\n============================================"
echo "TESTES: Check-in com Criação Automática de Ações"
echo "============================================"

echo -e "\n--- TESTE 8: Check-in com Score Alto (sem ação) ---"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id_user": 12,
    "score": 5
  }' | jq .

echo -e "\n--- TESTE 9: Check-in com Score Baixo (cria ação urgente) ---"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id_user": 12,
    "score": 2,
    "motivo": "Cansaço extremo",
    "categoria_motivo": "cansaço"
  }' | jq .

echo -e "\n--- TESTE 10: Check-in com Score Moderado (cria ação normal) ---"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id_user": 12,
    "score": 3,
    "motivo": "Dia desafiador",
    "categoria_motivo": "outro"
  }' | jq .

echo -e "\n--- TESTE 11: Buscar Check-in de Hoje (com ação) ---"
curl -X GET "$BASE_URL/12/hoje" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n--- TESTE 12: Buscar Histórico com Filtros ---"
curl -X GET "$BASE_URL/12/historico?limite=5&offset=0" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n============================================"
echo "TESTES: Erros e Validações"
echo "============================================"

echo -e "\n--- TESTE 13: Erro - CRP/Registro Duplicado ---"
curl -X POST "$BASE_URL/profissionais" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Outro Profissional",
    "tipo_profissional": "psicologo",
    "crp_ou_registro": "CRP/SP 01234/2020",
    "email": "outro@example.com"
  }' | jq .

echo -e "\n--- TESTE 14: Erro - Tipo Profissional Inválido ---"
curl -X POST "$BASE_URL/profissionais" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Profissional",
    "tipo_profissional": "invalido",
    "crp_ou_registro": "REG123"
  }' | jq .

echo -e "\n--- TESTE 15: Erro - Score Baixo sem Motivo ---"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id_user": 12,
    "score": 2
  }' | jq .

echo -e "\n--- TESTE 16: Deletar Profissional ---"
curl -X DELETE "$BASE_URL/profissionais/2" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n============================================"
echo "Testes concluídos!"
echo "============================================"
