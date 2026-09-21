import nodemailer from "nodemailer";

export interface WelcomeMailDTO {
  name: string;
  email: string;
}

/**
 * Cria ou recupera o Transporter do Nodemailer.
 * Suporta SMTP real via .env ou cria credenciais temporárias no Ethereal para dev.
 */
async function getTransporter() {
  // 1. Verifica se foram definidas variáveis para SMTP real no .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true para porta 465, false para outras como 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // 2. Se não houver .env de e-mail, gera uma conta de teste gratuita no Ethereal Email
  console.log("☁️  [MailService] Gerando conta de teste no Ethereal Email...");
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user, // Usuário gerado na hora
      pass: testAccount.pass, // Senha gerada na hora
    },
  });
}

export const mailService = {
  async sendWelcomeEmail({ name, email }: WelcomeMailDTO): Promise<void> {
    // 1. Obtém o transporter (Real ou Ethereal)
    const transporter = await getTransporter();

    // 2. Monta o template HTML com o estilo Dark Mode moderno do Gastos.AI
    const htmlContent = `
      <div style="background-color: #0B0E14; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #E2E8F0;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #121721; border-radius: 20px; border: 1px solid #252F42; overflow: hidden; padding: 32px;">
          
          <!-- Logo / Ícone -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: linear-gradient(135deg, #4F46E5, #818CF8); color: white; font-size: 24px; font-weight: bold;">
              💰
            </div>
            <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin-top: 12px; margin-bottom: 4px; letter-spacing: -0.5px;">
              Gastos.AI
            </h1>
            <p style="color: #64748B; font-size: 12px; margin: 0;">Controle Financeiro Inteligente</p>
          </div>

          <!-- Saudação -->
          <h2 style="color: #FFFFFF; font-size: 18px; font-weight: 700; margin-bottom: 12px;">
            Olá, ${name}! 👋
          </h2>
          
          <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Seja muito bem-vindo ao <strong>Gastos.AI</strong>. Sua conta foi criada com sucesso e você já pode começar a registrar suas receitas, despesas e acompanhar o seu saldo em tempo real!
          </p>

          <!-- Card de Destaque -->
          <div style="background-color: #1A2130; border-radius: 12px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #10B981;">
            <p style="color: #E2E8F0; font-size: 13px; margin: 0; font-weight: 500;">
              ✨ <strong>Dica de início:</strong> Experimente registrar sua primeira receita ou despesa direto pela Dashboard Mobile-First.
            </p>
          </div>

          <!-- Botão de Ação (CTA) -->
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="http://localhost:3000/login" style="display: inline-block; background: #4F46E5; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
              Acessar Minha Conta →
            </a>
          </div>

          <!-- Rodapé -->
          <hr style="border: none; border-top: 1px solid #252F42; margin-bottom: 16px;" />
          <p style="color: #64748B; font-size: 11px; text-align: center; margin: 0;">
            Este e-mail foi enviado automaticamente pelo ecossistema modular do Controle de Gastos.
          </p>
        </div>
      </div>
    `;

    // 3. Dispara o e-mail
    const info = await transporter.sendMail({
      from: '"Controle de Gastos" <nao-responda@gastos.ai>',
      to: `"${name}" <${email}>`,
      subject: `🎉 Bem-vindo ao Gastos.AI, ${name}!`,
      text: `Olá, ${name}! Bem-vindo ao Gastos.AI. Sua conta foi criada com sucesso! Acesse em: http://localhost:3000/login`,
      html: htmlContent,
    });

    console.log(
      `\n📬 [MailService] E-mail despachado! Message ID: ${info.messageId}`,
    );

    // 4. Se for Ethereal, gera o link clicável da caixa de entrada
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(
        `\n🔗 [MailService] PREVIEW DO E-MAIL (Clique para ver no navegador):`,
      );
      console.log(`👉 ${previewUrl}\n`);
    }
  },
};
