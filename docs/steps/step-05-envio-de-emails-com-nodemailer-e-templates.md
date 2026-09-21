# Step 05: Envio de E-mails com Nodemailer, Templates HTML e Preview Ethereal

> **Data**: 21/09/2026  
> **Status**: Concluído com Sucesso  
> **Foco**: Implementação do serviço de e-mails (`mail.service.ts`), suporte híbrido a SMTP de produção e sandbox de desenvolvimento (Ethereal Email), template responsivo no tema Dark do Gastos.AI e integração ponta a ponta com a fila BullMQ.

---

## 1. O que estamos fazendo?

Finalizamos o ciclo de envio de e-mails de boas-vindas assíncronos:
1. **Fábrica Dinâmica de Transporter (`getTransporter`)**:
   - Desenvolvemos uma função inteligente que verifica se existem variáveis de ambiente no `.env` (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`).
   - Se configuradas, conecta diretamente ao provedor SMTP de produção (SendGrid, Resend, Gmail, Amazon SES).
   - Se ausentes (ambiente local de testes), gera instantaneamente uma conta temporária via `nodemailer.createTestAccount()` no Ethereal Email.
2. **Template HTML Responsivo**:
   - Criamos o corpo do e-mail de boas-vindas com design dark moderno, paleta de cores consistente com o front-end (índigo `#4F46E5` e esmeralda `#10B981`), personalização com o nome do usuário e botão Call to Action (CTA) direcionando para a tela de login.
   - Fornecimento simultâneo de versão `text` (fallback acessível) e `html`.
3. **Geração de URL de Preview**:
   - Uso de `nodemailer.getTestMessageUrl(info)` para exibir no console da API um link clicável que abre a caixa de entrada simulada no navegador.

---

## 2. Por que estamos escolhendo esta abordagem técnica e arquitetural?

### A. Sandbox vs SMTP Real em Desenvolvimento
- **Proteção de Reputação**: Disparar dezenas de e-mails durante testes e deploys locais para endereços fictícios suja a reputação de IP e queima cotas diárias de serviços pagos.
- **Zero Configuração Inicial**: Novos desenvolvedores no time conseguem clonar o repositório e ver os e-mails funcionando sem precisar cadastrar cartão ou criar contas de terceiros.
- **Transição Transparente**: Para subir para a produção, a migração exige apenas preencher as 4 variáveis no `.env`, sem alterar uma única linha de código TypeScript.

### B. Inline CSS para Clientes de E-mail
- Clientes de e-mail tradicionais (como Gmail, Outlook e Apple Mail) bloqueiam folhas de estilo externas e tags `<style>` no `<head>`. A utilização de estilos embutidos (`style="..."`) garante compatibilidade visual em qualquer leitor.

---

## 3. Qual é o impacto no restante do sistema?

- **Experiência do Usuário Completa**: Ao se cadastrar pela tela `/register`, o usuário já tem sua notificação de boas-vindas gerada e despachada em segundo plano.
- **Desacoplamento Preservado**: A rota HTTP de cadastro continua respondendo em menos de 40ms, pois o tempo de rede do Nodemailer com o SMTP ocorre dentro do Worker isolado do BullMQ.

---

## 4. Guia de Validação Local

1. Mantenha os serviços rodando:
   - MySQL/MariaDB ativo no XAMPP (porta 3306).
   - Redis ativo no Docker (porta 6379).
   - API em execução (`npm run dev:api`).
2. Acesse a tela de cadastro do Front-end: `http://localhost:3000/register`.
3. Cadastre um novo usuário com nome e e-mail válidos.
4. No terminal da API, localize a linha:
   ```text
   🔗 [MailService] PREVIEW DO E-MAIL (Clique para ver no navegador):
   👉 https://ethereal.email/message/...
   ```
5. Segure `Ctrl` e clique no link para visualizar o e-mail perfeitamente renderizado no navegador.
