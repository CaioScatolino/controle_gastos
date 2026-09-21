# Step 06: IA Multimodal com Google Gemini, OCR de Comprovantes e Extração Estruturada

> **Data**: 21/09/2026  
> **Status**: Concluído com Sucesso  
> **Foco**: Integração do SDK `@google/genai`, extração multimodal de despesas a partir de fotos/comprovantes e texto livre com `gemini-3.5-flash-lite`, validação estrita com Zod, prevenção de alucinações temporais com injeção de data brasileira (`DD/MM/YYYY`) e interface mobile com padrão *Human-in-the-Loop*.

---

## 1. O que foi feito?

1. **Instalação e Configuração do SDK Oficial do Gemini**:
   - Adicionada a biblioteca oficial `@google/genai` no workspace `apps/api`.
   - Configurada a variável de ambiente `GEMINI_API_KEY` no `.env`.
   - Selecionado o modelo otimizado e ativo **`gemini-3.5-flash-lite`** (oferece baixíssima latência e suporte multimodal robusto).

2. **Definição de Schema e Validação com Zod (`ai.validator.ts`)**:
   - Criação do schema `extractedExpenseSchema` que exige tipos estritos:
     - `description`: string sucinta.
     - `value`: number positivo em reais.
     - `type`: enum `"Receita"` ou `"Despesa"`.
     - `category`: enum padronizado (`"Alimentação"`, `"Moradia"`, `"Transporte"`, `"Lazer"`, `"Saúde"`, `"Educação"`, `"Salário"`, `"Investimentos"`, `"Outros"`).
     - `expense_date`: string no formato brasileiro `DD/MM/YYYY`.
     - `confidence`: number entre 0 e 1 (nível de certeza do modelo).

3. **Serviço de IA Resiliente (`ai.service.ts`)**:
   - **Upload em Memória**: Uso do buffer em Base64 via `inlineData`, sem gravar imagens temporárias no disco do servidor.
   - **Injeção Temporal Anti-Alucinação**: Como LLMs não possuem relógio interno e costumam inventar datas antigas (como 2023), injetamos a data atual do servidor (`todayBR`) nas `systemInstruction` para resolver expressões relativas ("ontem", "almoço de hoje").
   - **Unwrapping Defensivo**: Tratamento de respostas onde o modelo encapsula o JSON em arrays (`[ {...} ]`) ou objetos aninhados (`{ "expense": {...} }`).

4. **API e Upload Multipart (`ai.controller.ts`, `ai.routes.ts`)**:
   - Configuração do `multer` com `memoryStorage` limitando arquivos a 5MB (suporte a JPEG, PNG, WEBP).
   - Rota autenticada `POST /ai/extract` recebendo imagem opcional (`file`) e prompt textual (`prompt`).

5. **Ajuste de Rede no Front-End (`apps/web/src/lib/api.ts`)**:
   - Ajustado o interceptador do `fetchApi` para não forçar `Content-Type: application/json` quando o corpo for uma instância de `FormData`, permitindo que o navegador configure o boundary multipart nativo.

6. **Interface Mobile com Human-in-the-Loop (`apps/web/src/app/ai-chat/page.tsx`)**:
   - Tela com seleção de fotos / câmera nativa do celular.
   - Campo de texto para comandos naturais ("gastei 45 no uber ontem").
   - **Card de Revisão**: A IA nunca persiste dados silenciosamente no banco. Ela apresenta os dados extraídos, o usuário confere o valor, categoria e data e clica em **"Confirmar e Salvar"**, que envia para a rota `/expenses/create`.
   - Conversor de data brasileiro (`DD/MM/YYYY` -> `YYYY-MM-DD`) para compatibilidade com o banco de dados.

---

## 2. Por que escolhemos esta abordagem técnica e arquitetural?

### A. Multimodalidade Nativa vs OCR Tradicional (Tesseract/Regex)
- **Compreensão Semântica**: OCRs tradicionais apenas transcrevem caracteres soltos e quebram diante de cupons amassados, rasgados ou com iluminação ruim. Um modelo de visão multimodal compreende a hierarquia visual do recibo: sabe diferenciar a razão social do nome do produto, e o valor total de taxas ou troco.

### B. Multer em Memória (`memoryStorage`)
- **Segurança e Privacidade (LGPD)**: Comprovantes bancários e cupons fiscais contêm dados sensíveis. Ao processar a imagem puramente na memória RAM e enviá-la em stream/Base64 para a API da Google, evitamos persistir arquivos sensíveis no disco local do servidor.

### C. Human-in-the-Loop (Supervisão Humana)
- Modelos generativos são probabilísticos e estão sujeitos a imprecisões ou imagens ilegíveis. Apresentar os dados extraídos para o usuário validar antes de gravar no banco elimina o risco de poluir o histórico financeiro com lançamentos errados.

---

## 3. Qual é o impacto no restante do sistema?

- **Zero atrito no cadastro de despesas**: O usuário pode fotografar uma nota de supermercado ou mandar uma mensagem de texto rápida e ter a despesa categorizada e salva em segundos.
- **Reaproveitamento Total da Arquitetura**: A rota de criação de despesas utilizada pela IA é a mesma utilizada pelo dashboard manual (`POST /expenses/create`), mantendo integridade de validação, autenticação JWT e regras de negócio.

---

## 4. Guia de Validação Local

1. Mantenha os serviços rodando:
   - Backend: `npm run dev:api` (porta 3301).
   - Frontend: `npm run dev:web` (porta 3000).
2. Acesse `http://localhost:3000/ai-chat` logado na sua conta.
3. **Teste por Texto**:
   - Digite: *"Paguei 35 reais no almoço de hoje"* e envie.
   - Veja o card de revisão preencher:
     - Tipo: Despesa
     - Categoria: Alimentação
     - Valor: R$ 35,00
     - Data: Data atual no formato DD/MM/YYYY
4. **Teste por Foto**:
   - Selecione ou tire foto de qualquer recibo ou cupom fiscal.
   - Clique em **Extrair com IA**.
   - Verifique a extração dos itens no card e clique em **Confirmar e Salvar**.
5. Acesse o Dashboard (`/dashboard`) e veja a nova despesa já contabilizada no saldo e listada no extrato!
 
---

## 5. Próximos Passos (TODO)

- [ ] **Campos Editáveis no Card de Revisão (Human-in-the-Loop 2.0)**:
  - Converter os valores estáticos do card em `apps/web/src/app/ai-chat/page.tsx` para inputs/selects editáveis.
  - Permitir que o usuário altere o valor, descrição, categoria (`<select>`) ou data caso o modelo cometa algum pequeno equívoco na leitura do cupom fiscal antes de clicar em *"Confirmar e Salvar"*.


