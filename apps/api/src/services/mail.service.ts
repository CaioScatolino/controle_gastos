import nodemailer from "nodemailer";

export interface WelcomeMailDTO {
  name: string;
  email: string;
}

/**
 * Serviço responsável pelo envio de e-mails da aplicação.
 * Utiliza o Nodemailer para integração com servidores SMTP.
 */
export const mailService = {
  /**
   * Envia o e-mail de boas-vindas para o usuário recém-cadastrado.
   */
  async sendWelcomeEmail({ name, email }: WelcomeMailDTO): Promise<void> {
    // =========================================================================
    // TODO (Próxima Sessão de Estudos):
    // 1. Configurar o transporter do Nodemailer usando Ethereal (para dev)
    //    ou variáveis de ambiente SMTP (ex: Resend, SendGrid, Gmail, Mailtrap).
    // 2. Criar um template HTML elegante e responsivo com as cores do Gastos.AI.
    // 3. Capturar e logar a URL de preview do Ethereal (nodemailer.getTestMessageUrl).
    // =========================================================================

    console.log(`\n📧 [MailService] Preparando envio de boas-vindas para: ${name} <${email}>`);

    // Mock temporário simulando a chamada SMTP
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log(`📨 [MailService] E-mail enviado com sucesso (Mock ativo)!`);
  },
};
