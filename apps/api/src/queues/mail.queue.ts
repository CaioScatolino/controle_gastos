// apps/api/src/queues/mail.queue.ts
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

// Criamos a fila chamada 'mail-queue' conectada ao nosso Redis
export const mailQueue = new Queue("mail-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Se falhar, tenta até 3 vezes
    backoff: {
      type: "exponential",
      delay: 2000, // Espera 2s, depois 4s, depois 8s antes de cada tentativa
    },
    removeOnComplete: true, // Limpa o job do Redis após o sucesso para não encher a memória
  },
});
