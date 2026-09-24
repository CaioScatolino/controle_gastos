# Step 09: Envio de E-mails Reais com Resend

## 🎯 Objetivo
Substituir o sandbox simulado/Ethereal por um serviço de e-mail transacional real em produção através da API do **Resend**, garantindo entrega na caixa de entrada do usuário sem risco de bloqueio de portas SMTP em ambientes serverless ou nuvens gratuitas (ex: Render).

---

## 🛠️ Arquitetura e Decisões Técnicas

### 1. Por que Resend em vez de SMTP Tradicional?
- **HTTPS REST API:** Em vez de abrir conexões de socket de longa duração nas portas `587` ou `465` (que o plano gratuito do Render bloqueia ou limita), o Resend opera via chamadas HTTP seguras (`POST https://api.resend.com/emails`).
- **Performance:** O envio leva menos de 200ms.
- **Integração com Mensageria:** O fluxo completo opera desacoplado:
  1. Cadastro do usuário grava no banco MySQL.
  2. Transactional Outbox armazena o evento de boas-vindas.
  3. Outbox Relay despacha para a fila Redis.
  4. BullMQ Worker consome o job assincronamente.
  5. `MailService` invoca a API do Resend e despacha o e-mail real com template HTML responsivo.

---

## 💻 Implementação

### 1. Dependência Oficial
- Instalado o pacote `resend` no `@controle-gastos/api`.

### 2. Serviço Híbrido e Resiliente (`apps/api/src/services/mail.service.ts`)
- Suporte a `RESEND_API_KEY`: se a chave estiver configurada, o disparo é feito via Resend.
- Fallback automático para Nodemailer / Ethereal caso a chave não esteja presente em ambiente local de desenvolvimento.
- Template HTML em Dark Theme (Glassmorphism), compatível com clientes móveis e web (Gmail, Outlook, Apple Mail).

### 3. Variáveis de Ambiente
- `RESEND_API_KEY` adicionada em `.env` e `.env.example`.

---

## 🧪 Validação
- Realizado o cadastro de um usuário via front-end (`http://localhost:3000/register`).
- O evento foi enfileirado no Redis e processado pelo Worker.
- O e-mail de boas-vindas foi entregue com sucesso na caixa de entrada real.
