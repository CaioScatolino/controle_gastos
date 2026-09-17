// apps/api/src/workers/mail.worker.ts
import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";

import { mailService } from "../services/mail.service";

interface SendMailJobData {
  name: string;
  email: string;
}

export const mailWorker = new Worker(
  "mail-queue", // O mesmo nome da fila que criamos antes!
  async (job: Job<SendMailJobData>) => {
    console.log(`\n⚙️  [Worker] Iniciando processamento do Job #${job.id} para ${job.data.email}...`);

    // TODO (Próxima Sessão): O mailService fará o disparo SMTP real/Ethereal
    await mailService.sendWelcomeEmail({
      name: job.data.name,
      email: job.data.email,
    });
  },
  {
    connection: redisConnection,
    concurrency: 5, // Capacidade de processar até 5 e-mails simultâneos em paralelo!
  }
);

mailWorker.on("completed", (job) => {
  console.log(`🎉 [Worker] Job #${job.id} finalizado!`);
});

mailWorker.on("failed", (job, err) => {
  console.error(`💥 [Worker] Job #${job?.id} falhou:`, err.message);
});
