// apps/api/src/workers/outbox.relay.ts
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { outbox_users } from "../db/schema";
import { mailQueue } from "../queues/mail.queue";

export async function processOutboxQueue() {
  try {
    // 1. Busca até 10 eventos que ainda não foram enviados para a fila
    const pendingEvents = await db
      .select()
      .from(outbox_users)
      .where(eq(outbox_users.processed, false))
      .limit(10);

    if (pendingEvents.length === 0) {
      return;
    }

    console.log(
      `\n📦 [Outbox Relay] Encontrados ${pendingEvents.length} evento(s) pendente(s) no MySQL.`,
    );

    for (const event of pendingEvents) {
      const rawData = event.data;
      // Agora sim convertemos o objeto JSON para string
      const userData =
        typeof rawData === "string" ? JSON.parse(rawData) : rawData;

      // 2. Coloca o Job na esteira do BullMQ (Redis)
      await mailQueue.add("send-welcome-email", {
        name: userData.name,
        email: userData.email,
      });

      // 3. Marca como processado no MySQL para não enviar duplicado
      await db
        .update(outbox_users)
        .set({ processed: true })
        .where(eq(outbox_users.id, event.id));

      console.log(
        `🚀 [Outbox Relay] Evento #${event.id} despachado para o Redis com sucesso!`,
      );
    }
  } catch (error) {
    console.error("❌ [Outbox Relay] Erro ao processar outbox:", error);
  }
}

// Inicia o loop para verificar a cada 5 segundos
export function startOutboxRelay() {
  console.log(
    "⚙️  [Outbox Relay] Monitoramento da tabela outbox_users iniciado (intervalo: 5s)...",
  );
  setInterval(processOutboxQueue, 5000);
}
