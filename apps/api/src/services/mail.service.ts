import nodemailer from "nodemailer";
import { Resend } from "resend";

export interface WelcomeMailDTO {
  name: string;
  email: string;
}

/**
 * Transporter do Nodemailer mantido como fallback (para desenvolvimento local sem chave de API).
 */
async function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    return null;
  }
}

export const mailService = {
  async sendWelcomeEmail({ name, email }: WelcomeMailDTO): Promise<void> {
    const htmlContent = `
      <div style="background-color: #0B0E14; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #E2E8F0;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #121721; border-radius: 20px; border: 1px solid #252F42; overflow: hidden; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: linear-gradient(135deg, #4F46E5, #818CF8); color: white; font-size: 24px; font-weight: bold;">
              💰
            </div>
            <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin-top: 12px; margin-bottom: 4px; letter-spacing: -0.5px;">
              Gastos.AI
            </h1>
            <p style="color: #64748B; font-size: 12px; margin: 0;">Controle Financeiro Inteligente</p>
          </div>

          <h2 style="color: #FFFFFF; font-size: 18px; font-weight: 700; margin-bottom: 12px;">
            Olá, ${name}! 👋
          </h2>
          
          <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Seja muito bem-vindo ao <strong>Gastos.AI</strong>. Sua conta foi criada com sucesso e você já pode começar a registrar suas receitas, despesas e acompanhar o seu saldo em tempo real!
          </p>

          <div style="background-color: #1A2130; border-radius: 12px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #10B981;">
            <p style="color: #E2E8F0; font-size: 13px; margin: 0; font-weight: 500;">
              ✨ <strong>Dica de início:</strong> Experimente registrar sua primeira receita ou despesa direto pela Dashboard Mobile-First.
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 28px;">
            <a href="https://controle-gastos-web-wheat.vercel.app/login" style="display: inline-block; background: #4F46E5; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
              Acessar Minha Conta →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #252F42; margin-bottom: 16px;" />
          <p style="color: #64748B; font-size: 11px; text-align: center; margin: 0;">
            Este e-mail foi enviado automaticamente pelo ecossistema modular do Controle de Gastos.
          </p>
        </div>
      </div>
    `;

    // 1. Se RESEND_API_KEY estiver configurada, dispara o envio real via Resend API (HTTPS)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        console.log(
          `☁️  [MailService] Enviando e-mail real via Resend API para ${email}...`,
        );

        const { data, error } = await resend.emails.send({
          from: "Gastos.AI <onboarding@resend.dev>",
          to: [email],
          subject: `🎉 Bem-vindo ao Gastos.AI, ${name}!`,
          html: htmlContent,
        });

        if (error) {
          console.warn(`⚠️ [MailService - Resend Warning]:`, error.message);
          // Dica importante da conta gratuita sem domínio personalizado:
          if (
            error.message?.includes("testing emails to your own email address")
          ) {
            console.log(
              `💡 [Dica Resend]: Em contas gratuitas de teste (usando onboarding@resend.dev), o Resend só entrega para o e-mail da sua própria conta do Resend para evitar spam.`,
            );
          }
        } else {
          console.log(
            `🚀 [MailService - Resend] E-mail real entregue com sucesso! ID: ${data?.id}`,
          );
          return;
        }
      } catch (err: any) {
        console.error(
          `💥 [MailService - Resend] Falha ao enviar via Resend:`,
          err.message,
        );
      }
    }

    // 2. Fallback: Transporter Nodemailer (Ethereal em dev ou simulação em prod)
    const transporter = await getTransporter();

    if (!transporter) {
      console.log(
        `\n📬 [MailService - Sandbox Nuvem] E-mail de boas-vindas simulado com sucesso!`,
      );
      console.log(`👤 Destinatário: "${name}" <${email}>`);
      console.log(`🎉 Assunto: Bem-vindo ao Gastos.AI, ${name}!\n`);
      return;
    }

    const info = await transporter.sendMail({
      from: '"Controle de Gastos" <nao-responda@gastos.ai>',
      to: `"${name}" <${email}>`,
      subject: `🎉 Bem-vindo ao Gastos.AI, ${name}!`,
      text: `Olá, ${name}! Bem-vindo ao Gastos.AI. Sua conta foi criada com sucesso! Acesse em: https://controle-gastos-web-wheat.vercel.app/login`,
      html: htmlContent,
    });

    console.log(
      `\n📬 [MailService] E-mail despachado via SMTP! Message ID: ${info.messageId}`,
    );

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [MailService] PREVIEW DO E-MAIL: 👉 ${previewUrl}\n`);
    }
  },
};
