# API de Inteligência Artificial

Esta documentação descreve as APIs relacionadas à inteligência artificial do sistema Impulsionar Talentos, incluindo assistentes de chat e geração de conteúdo usando OpenAI e Eleven Labs.

## Base URL

```
http://localhost:3002/api/ia
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header `Authorization`.

```
Authorization: Bearer <token>
```

---

## Endpoints

### IA Documento (gerador de documento visual)

Geração de documento visual em HTML+CSS a partir de um template HTML e de um PDF jurídico (extração de texto + IA). Ver **[IA_DOCUMENTO_API.md](IA_DOCUMENTO_API.md)** para rota, uso e payload.

- **POST** `/api/ia/documento/gerar` — multipart: `template_html`, `documento_pdf`; opcional: `modelo_visual`, `metadados`.

---

### 1. Obter Informações da API de IA

Retorna informações sobre as funcionalidades disponíveis.

**Endpoint:** `GET /api/ia/info`

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Informações da API de IA",
  "data": {
    "modelo": "OpenAI GPT-4o-mini",
    "funcionalidades": [
      "Geração de habilidades para cargos",
      "Assistente de perfil do colaborador",
      "Geração de PDI/Metas",
      "Assistente para gestores",
      "Assistente para colaboradores",
      "Conversação por voz (Eleven Labs)"
    ],
    "versao": "2.0.0"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Chat IA para Preencher Perfil do Colaborador

Assistente conversacional que conduz o colaborador através de perguntas para preencher seu perfil profissional completo.

**Endpoint:** `POST /api/ia/chat/perfil`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_user": 123,
  "mensagem": "Olá, quero preencher meu perfil",
  "historico": [
    {
      "role": "user",
      "content": "Mensagem anterior"
    },
    {
      "role": "assistant",
      "content": "Resposta anterior"
    }
  ]
}
```

**Parâmetros:**
- `id_user` (integer, obrigatório): ID do usuário
- `mensagem` (string, obrigatório): Mensagem do usuário
- `historico` (array, opcional): Histórico de mensagens anteriores

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Resposta gerada com sucesso",
  "data": {
    "resposta": "Olá! Vou te ajudar a preencher seu perfil profissional. Vamos começar? Em que área/time você atua atualmente?",
    "id_user": 123
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Campos que o assistente coleta:**
- Identidade profissional (área, tempo na empresa, formação, certificações)
- Habilidades técnicas (array com nome, níveis, experiência, evidências)
- Habilidades comportamentais (escala 1-5 para cada competência)
- Interesses e motivadores
- Propósito e valores
- Objetivos de carreira
- Disponibilidade
- Histórico inicial

---

### 3. Gerar PDI/Metas com IA (Inteligente e Contextual)

Gera um Plano de Desenvolvimento Individual completo e estratégico baseado em análise profunda do colaborador, incluindo propósito/valores, experiência profissional, cargos disponíveis e metas já cadastradas para evitar duplicação.

**Endpoint:** `POST /api/ia/gerar-pdi`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_user": 123
}
```

**Parâmetros:**
- `id_user` (integer, obrigatório): ID do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "PDI gerado com sucesso",
  "data": {
    "id_user": 123,
    "pdi": [
      {
        "titulo": "Desenvolver competências em Arquitetura de Software",
        "atividades": [
          "Completar curso de Arquitetura de Software Avançada",
          "Implementar padrão arquitetural em projeto real",
          "Apresentar solução arquitetural para o time"
        ],
        "prazo": "2025-12-31",
        "status": "Em Progresso",
        "resultado_3_meses": "Ter completado 50% do curso e iniciado implementação prática em projeto real",
        "resultado_6_meses": "Ter aplicado conhecimento em projeto real, compartilhado com o time e estar qualificado para cargo Senior",
        "feedback_gestor": "Para o curso de Arquitetura, recomendo: 1) Plataforma Udemy - 'Arquitetura de Software Avançada' (40h, $49); 2) Livro 'Building Microservices' de Sam Newman; 3) Procure mentor técnico [Nome] do time de Arquitetura para sessões semanais. Implemente primeiro em um projeto piloto não crítico.",
        "id_usuario": 123,
        "id_usuarios": [123]
      },
      {
        "titulo": "Aprofundar liderança técnica alinhado com propósito de mentoria",
        "atividades": [
          "Mentorizar 2 desenvolvedores juniores",
          "Participar do programa de liderança da empresa",
          "Documentar melhores práticas técnicas do time"
        ],
        "prazo": "2025-12-31",
        "status": "Em Progresso",
        "resultado_3_meses": "2 juniores em processo de mentoria, 1º módulo de liderança concluído",
        "resultado_6_meses": "Juniores autonomizados, programa de liderança finalizado, guia de boas práticas publicado",
        "feedback_gestor": "Para mentoria: Convide os juniores para reuniões semanais de 1h (sexta-feira às 14h?). Use o método 'Coaching' com perguntas que os façam pensar. Para o programa de liderança, inscreva-se em: programa interno (fale com [Pessoa RH]) ou 'Coursera - Leadership' online (10 semanas). Documente em repositório compartilhado do time.",
        "id_usuario": 123,
        "id_usuarios": [123]
      }
    ],
    "total_metas": 2,
    "gerado_por": "OpenAI GPT-4o-mini",
    "contexto_analise": {
      "proposito_valores": "Desenvolver pessoas, inovar em tecnologia, criar impacto",
      "metas_ja_cadastradas": 3,
      "experiencias_analisadas": 5,
      "cargos_disponiveis": 12
    },
    "instrucoes": "As metas foram geradas e automaticamente salvas no banco de dados. Cada meta está vinculada a suas atividades e pessoas envolvidas. Os dados estão disponíveis nas tabelas metas_pdi, atividades_pdi e pessoas_envolvidas_pdi."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Análise Realizada:**
- ✅ **Propósito e Valores:** Alinha metas com o propósito do colaborador
- ✅ **Perfil Profissional:** Considera identidade, habilidades técnicas e comportamentais, objetivos de carreira
- ✅ **Árvore da Vida:** Avalia bem-estar em 12 dimensões
- ✅ **Análise SWOT:** Forças, fraquezas, oportunidades e ameaças
- ✅ **Experiência Profissional:** Considera as realizações e projetos já executados
- ✅ **Metas Existentes:** Evita duplicação, cria novas metas complementares
- ✅ **Cargos Disponíveis:** Alinha desenvolvimento com progressão de carreira na empresa
- ✅ **Disponibilidade e Preferências:** Respeita o tempo disponível do colaborador, preferência de aprendizado, abertura a mudanças e aceitação de desafios
- ✅ **Feedback Prático:** Campo `feedback_gestor` contém instruções específicas e acionáveis
- ✅ **Salvamento Automático:** As metas geradas são automaticamente salvas nas tabelas `metas_pdi`, `atividades_pdi` e `pessoas_envolvidas_pdi`

**Fluxo de Salvamento Automático:**
1. IA gera PDI com 3-5 metas estratégicas
2. Cada meta é validada (título, atividades, datas)
3. Meta é inserida na tabela `metas_pdi`
4. Cada atividade é inserida na tabela `atividades_pdi` (status: "backlog")
5. Pessoas envolvidas são registradas em `pessoas_envolvidas_pdi`
6. Transação é finalizada (COMMIT)
7. Resposta retorna as metas com IDs gerados

**Status das Atividades Criadas:**
- Todas as atividades são criadas com status `"backlog"` por padrão
- Podem ser atualizadas para: "em_andamento", "revisão", "concluída"

**Dados de Disponibilidade Considerados:**
- Horas semanais disponíveis para desenvolvimento
- Preferência de aprendizado (prático, teórico, mentoria, grupo, etc.)
- Abertura a mudanças e desafios
- Nível de intensidade recomendado

**Campos da Resposta:**
- `titulo` (string): Título claro e objetivo da meta
- `atividades` (array): 3-5 atividades concretas e mensuráveis
- `prazo` (YYYY-MM-DD): Data de conclusão esperada (mínimo 90 dias)
- `status` (string): Sempre "Em Progresso" para metas novas
- `resultado_3_meses` (string): O que se espera em 3 meses
- `resultado_6_meses` (string): O que se espera em 6 meses
- `feedback_gestor` (string): **IMPORTANTE** - Dicas PRÁTICAS e ESPECÍFICAS de COMO executar:
  - Nomes de cursos, plataformas (Udemy, Coursera)
  - Livros específicos recomendados
  - Nomes de possíveis mentores ou contatos
  - Frequência de reuniões ou check-ins
  - Primeira ação concreta a tomar
- `id_usuario` (integer): ID do proprietário da meta
- `id_usuarios` (array): Array com IDs dos envolvidos na meta

---

### 4. Chat IA para Auxiliar Gestor

Assistente que fornece insights sobre o progresso dos colaboradores e ajuda o gestor a tomar decisões.

**Endpoint:** `POST /api/ia/chat/gestor`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_gestor": 5,
  "mensagem": "Quais colaboradores precisam de mais atenção?",
  "historico": []
}
```

**Parâmetros:**
- `id_gestor` (integer, obrigatório): ID do gestor
- `mensagem` (string, obrigatório): Mensagem/pergunta do gestor
- `historico` (array, opcional): Histórico de mensagens

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Resposta gerada com sucesso",
  "data": {
    "resposta": "Baseado nos dados analisados, identifiquei 2 colaboradores que precisam de atenção:\n\n1. João Silva: Tem 2 metas atrasadas e apenas 30% de atividades concluídas. Recomendo uma conversa individual para entender os bloqueios.\n\n2. Maria Santos: Tem boa performance, mas nenhuma meta cadastrada. Sugiro iniciar um PDI.",
    "id_gestor": 5,
    "contexto_disponivel": {
      "total_colaboradores": 8,
      "total_metas": 15
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Informações analisadas:**
- Progresso de metas por colaborador
- Atividades concluídas vs total
- Metas atrasadas
- Métricas de equipe

---

### 5. Chat IA para Auxiliar Colaborador

Assistente de carreira que orienta o colaborador sobre desenvolvimento profissional e cargos disponíveis.

**Endpoint:** `POST /api/ia/chat/colaborador`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_user": 123,
  "mensagem": "Quais habilidades preciso para me tornar Tech Lead?",
  "historico": []
}
```

**Parâmetros:**
- `id_user` (integer, obrigatório): ID do usuário
- `mensagem` (string, obrigatório): Mensagem do colaborador
- `historico` (array, opcional): Histórico de mensagens

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Resposta gerada com sucesso",
  "data": {
    "resposta": "Para se tornar Tech Lead, baseado nos cargos disponíveis na empresa, você precisa desenvolver:\n\n1. **Liderança técnica**: Capacidade de orientar e mentorear desenvolvedores\n2. **Arquitetura de sistemas**: Entender design patterns e tomar decisões técnicas\n3. **Comunicação**: Traduzir necessidades de negócio em soluções técnicas\n\nVejo que você já tem experiência com Node.js. Recomendo focar em cursos de arquitetura e práticas de mentoria.",
    "id_user": 123
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Informações utilizadas:**
- Cargo atual do colaborador
- Habilidades necessárias do cargo atual
- Cargos disponíveis na empresa
- Habilidades requeridas por cada cargo

---

### 6. Gerar Habilidades para Cargo

Gera habilidades técnicas e comportamentais para um cargo específico.

**Endpoint:** `POST /api/ia/gerar-habilidades`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "titulo_cargo": "Desenvolvedor Full Stack",
  "descricao_cargo": "Responsável por desenvolvimento de aplicações web completas",
  "senioridade": "Pleno",
  "setor": "Tecnologia",
  "departamento": "Desenvolvimento"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Habilidades geradas com sucesso",
  "data": {
    "cargo_info": {
      "titulo": "Desenvolvedor Full Stack",
      "setor": "Tecnologia",
      "departamento": "Desenvolvimento",
      "senioridade": "Pleno"
    },
    "habilidades": [
      {
        "titulo": "JavaScript/TypeScript",
        "descricao": "Linguagem essencial para desenvolvimento frontend e backend"
      },
      {
        "titulo": "Node.js",
        "descricao": "Runtime para desenvolvimento de aplicações server-side"
      }
    ],
    "total_habilidades": 10,
    "gerado_por": "OpenAI GPT-3.5-turbo"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 7. Voz IA - Perfil do Colaborador

Versão em voz do assistente de perfil. Retorna resposta em áudio via Eleven Labs.

**Endpoint:** `POST /api/ia/voz/perfil`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:** (mesmo formato do chat/perfil)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Resposta em voz gerada com sucesso",
  "data": {
    "audio_url": "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTG...",
    "texto": "Olá! Vou te ajudar a preencher seu perfil profissional...",
    "id_user": 123
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 8. Voz IA - Gestor

Versão em voz do assistente para gestores.

**Endpoint:** `POST /api/ia/voz/gestor`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:** (mesmo formato do chat/gestor)

**Resposta:** (mesmo formato do voz/perfil)

---

### 9. Voz IA - Colaborador

Versão em voz do assistente para colaboradores.

**Endpoint:** `POST /api/ia/voz/colaborador`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:** (mesmo formato do chat/colaborador)

**Resposta:** (mesmo formato do voz/perfil)

---

## Estrutura de Histórico de Chat

O histórico é opcional e permite manter contexto na conversa:

```json
[
  {
    "role": "user",
    "content": "Olá, preciso de ajuda"
  },
  {
    "role": "assistant",
    "content": "Claro! Como posso ajudar?"
  },
  {
    "role": "user",
    "content": "Quero preencher meu perfil"
  }
]
```

**Roles válidos:**
- `user`: Mensagem do usuário
- `assistant`: Resposta da IA

---

## Modelos de IA Utilizados

| Funcionalidade | Modelo |
|----------------|--------|
| Chat de Perfil | GPT-4o-mini |
| Geração de PDI | GPT-4o-mini |
| Chat Gestor | GPT-4o-mini |
| Chat Colaborador | GPT-4o-mini |
| Geração de Habilidades | GPT-3.5-turbo |
| Voz | Eleven Labs (agent_7801kdv0nw39fqgr2p69qx2m28bj) |

---

## Configuração de Variáveis de Ambiente

```env
OPENAI_API_KEY=sk-proj-...
ELEVEN_LABS_API_KEY=... (opcional, para funcionalidades de voz)
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `INVALID_USER_ID` | ID do usuário inválido ou não fornecido |
| `USER_NOT_FOUND` | Usuário não encontrado no banco de dados |
| `INVALID_GESTOR_ID` | ID do gestor inválido ou não fornecido |
| `INVALID_MESSAGE` | Mensagem não fornecida ou vazia |
| `IA_CHAT_ERROR` | Erro ao processar chat |
| `IA_PDI_GENERATION_ERROR` | Erro ao gerar PDI (verificar logs para detalhes específicos) |
| `IA_VOICE_ERROR` | Erro ao processar voz |
| `OPENAI_QUOTA_EXCEEDED` | Limite de uso da OpenAI excedido |
| `OPENAI_RATE_LIMIT` | Limite de requisições excedido |

## Troubleshooting

### Erro ao gerar PDI (500 - IA_PDI_GENERATION_ERROR)

**Verificar:**
1. **Usuário não tem dados cadastrados**: Se o usuário nunca preencheu perfil, árvore da vida ou SWOT, o PDI pode gerar metas genéricas. Recomendado preencher perfil primeiro.
2. **Limite de requisições OpenAI**: Se estiver usando muitas requisições em pouco tempo, pode atingir rate limit. Aguarde alguns minutos.
3. **Disponibilidade não cadastrada**: Se não tiver dados de `disponibilidade`, o PDI usará valores padrão (3 atividades, tom moderado).
4. **Dados de `id_cliente` inválido**: Se o usuário não tiver `id_cliente` associado, alguns dados de contexto serão vazios.

**Solução:**
- Verifique os logs do servidor para mensagem de erro específica
- Tente novamente após alguns minutos (se for rate limit)
- Preencha os dados de perfil/árvore da vida/SWOT antes de gerar PDI

---

## Exemplos de Uso

### Exemplo 1: Chat de Perfil

```bash
curl -X POST "http://localhost:3002/api/ia/chat/perfil" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_user": 123,
    "mensagem": "Olá, preciso preencher meu perfil"
  }'
```

### Exemplo 2: Gerar PDI

```bash
curl -X POST "http://localhost:3002/api/ia/gerar-pdi" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_user": 123
  }'
```

### Exemplo 3: Chat com Gestor

```bash
curl -X POST "http://localhost:3002/api/ia/chat/gestor" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_gestor": 5,
    "mensagem": "Quais colaboradores estão com metas atrasadas?"
  }'
```

### Exemplo 4: Voz IA

```bash
curl -X POST "http://localhost:3002/api/ia/voz/colaborador" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "id_user": 123,
    "mensagem": "Quais habilidades preciso desenvolver?"
  }'
```

---

## Notas Importantes

1. **Limites de Tokens:**
   - Chat de Perfil: 1000 tokens
   - Chat Gestor/Colaborador: 1500 tokens
   - Geração de PDI: resposta em JSON estruturado

2. **Histórico:**
   - Mantém apenas as últimas 10 mensagens para contexto
   - Recomendado enviar histórico para conversas longas

3. **Voz (Eleven Labs):**
   - Requer configuração de `ELEVEN_LABS_API_KEY`
   - Retorna áudio em formato base64
   - Usa agente pré-configurado: `agent_7801kdv0nw39fqgr2p69qx2m28bj`
   - Se a API key não estiver configurada, retorna apenas texto

4. **Geração de PDI:**
   - Analisa perfil completo, árvore da vida e SWOT
   - Gera 3 a 5 metas realistas e alinhadas
   - Formato de resposta em JSON estruturado

5. **Performance:**
   - Chat: ~2-5 segundos
   - Geração de PDI: ~5-10 segundos
   - Voz: +2-3 segundos adicionais

---

## Próximas Implementações

- [ ] Suporte a streaming de respostas
- [ ] Histórico persistente de conversas
- [ ] Integração com outras APIs de voz
- [ ] Análise de sentimento nas respostas
- [ ] Sugestões automáticas de melhorias


















