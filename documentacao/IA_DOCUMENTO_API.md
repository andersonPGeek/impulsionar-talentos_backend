# API IA Documento – Gerador de Documento Visual (HTML+CSS)

API que recebe um **arquivo HTML** (template) e um **arquivo PDF** (documento jurídico), extrai o texto do PDF, usa a IA para gerar um documento visual em HTML+CSS seguindo o template, e retorna metadados, análise e o HTML formatado.

## Base URL

```
http://localhost:3002/api/ia/documento
```

## Autenticação

**Não requer autenticação.** O endpoint é público; não é necessário enviar token JWT nem header `Authorization`.

---

## Endpoint

### POST `/api/ia/documento/gerar`

Gera o documento visual a partir do template HTML e do PDF.

**Content-Type:** `multipart/form-data`

**Campos (form-data):**

| Campo            | Tipo   | Obrigatório | Descrição                                                                 |
|------------------|--------|-------------|---------------------------------------------------------------------------|
| `template_html`  | arquivo| Sim         | Arquivo HTML de **exemplo de estilo** (apenas inspiração de cores, tipografia). O HTML gerado NÃO conterá texto do template. |
| `documento_pdf`  | arquivo| Sim         | Arquivo PDF do documento jurídico (texto extraído e usado pela IA).      |
| `modelo_visual`  | string | Não         | Nome do tema/template (ex.: "padrao", "corporativo"). Default: `"padrao"`.|
| `metadados`      | string | Não         | JSON string com `area_juridica`, `tipo_documento`, `preferencia_componentes`, `densidade_visual`. |

**Exemplo de requisição (cURL):**

```bash
curl -X POST "http://localhost:3002/api/ia/documento/gerar" \
  -F "template_html=@/caminho/para/template.html" \
  -F "documento_pdf=@/caminho/para/documento.pdf" \
  -F "modelo_visual=padrao" \
  -F 'metadados={"area_juridica":"Cível","tipo_documento":"petição"}'
```

**Exemplo com JavaScript (fetch + FormData):**

```javascript
const form = new FormData();
form.append('template_html', htmlFile);   // File do <input type="file">
form.append('documento_pdf', pdfFile);
form.append('modelo_visual', 'padrao');
form.append('metadados', JSON.stringify({ area_juridica: 'Cível', tipo_documento: 'petição' }));

const res = await fetch('http://localhost:3002/api/ia/documento/gerar', {
  method: 'POST',
  body: form
});
const data = await res.json();
```

---

## Resposta de sucesso (200)

```json
{
  "success": true,
  "message": "Documento visual gerado com sucesso",
  "data": {
    "titulo_documento": "string – gerado pela IA",
    "conteudo_texto": "string – HTML do texto original extraído do PDF",
    "descricao_documento": "string – gerada pela IA",
    "sugestoes_analise": {
      "analise_semantica": "Argumentos centrais e pedidos identificados",
      "correcao_ortografica_gramatical": "Ortografia, pontuação, acentuação e digitação"
    },
    "entidade_juridica": {
      "partes": ["autor", "réu", "contratante", "contratada", ...],
      "datas_relevantes": ["..."],
      "valores_monetarios": ["..."]
    },
    "citacoes_de_lei": ["Artigos, leis, códigos (CPC, CC, CLT), normas citadas"],
    "html_formatado": "<!DOCTYPE html><html>...</html> – HTML completo e autocontido (inclui CSS no <style>, conteúdo e componentes visuais)",
    "resumo_documento": "Resumo executivo em até 3 frases",
    "ementa": "Ementa estruturada da peça",
    "resumo_alteracoes": [
      "Substituída a divisão de despesas extraordinárias por tabela visual",
      "Inserido gráfico de pizza para proporção pensão vs renda",
      "Criado card com QR code para Chave PIX",
      "..."
    ],
    "analysis": {
      "modelo_visual": "string",
      "tipos_identificados": ["timeline", "tabela", ...],
      "justificativas": { "componente": "trecho e motivo" },
      "warnings": ["dados faltantes, etc."]
    }
  },
  "timestamp": "2025-01-26T..."
}
```

---

## Erros comuns

| Status | Situação |
|--------|----------|
| 400 | Faltam `template_html` ou `documento_pdf` |
| 400 | PDF inválido ou sem texto extraível |
| 400 | Erro de upload (multer) |
| 429 | Limite OpenAI (quota ou rate limit) |
| 502 | Resposta da IA não é JSON válido |
| 500 | Erro interno (ex.: falha na OpenAI) |

---

## Variáveis de ambiente

- `OPENAI_API_KEY`: obrigatória (mesmas credenciais de IA do projeto).

## Dependência

- `pdf-parse`: usada para extrair texto do PDF. Instale com `npm install` (já incluída em `package.json`).

---

## Padrão de utilização

1. Obter um template HTML de exemplo de estilo (layout, cores, tipografia). O template serve apenas como inspiração; o HTML gerado não conterá texto do template.
2. Ter o PDF do documento jurídico (com texto, não só imagem).
3. Enviar `POST /api/ia/documento/gerar` com `multipart/form-data`:
   - `template_html`: arquivo HTML
   - `documento_pdf`: arquivo PDF
   - Opcional: `modelo_visual`, `metadados`.
4. Tratar a resposta JSON:
   - `data.html_formatado` para exibir/exportar o documento visual (HTML autocontido com CSS embutido).
   - `data.conteudo_texto` para o HTML do texto original do PDF.
   - `data.titulo_documento`, `data.resumo_documento`, `data.ementa`, `data.resumo_alteracoes`, `data.sugestoes_analise`, `data.entidade_juridica`, `data.citacoes_de_lei` para metadados e análises.
