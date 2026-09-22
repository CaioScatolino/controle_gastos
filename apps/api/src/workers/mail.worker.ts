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
    concurrency: 1,
    // Otimizações vitais para Upstash / Serverless Redis:
    drainDelay: 30000,       // Se a fila estiver vazia, espera 30 segundos antes de checar de novo
    stalledInterval: 300000, // Só checa jobs travados a cada 5 minutos (300s)
    maxStalledCount: 1,
  }

);

mailWorker.on("completed", (job) => {
  console.log(`🎉 [Worker] Job #${job.id} finalizado!`);
});

mailWorker.on("failed", (job, err) => {
  console.error(`💥 [Worker] Job #${job?.id} falhou:`, err.message);
});
