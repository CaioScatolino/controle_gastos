import { Redis } from "ioredis";

// Se tiver REDIS_URL (nuvem/Upstash), usa a URL completa; senão usa host/porta local
export const redisConnection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null,
    });

redisConnection.on("connect", () => {
  console.log("🔴 [Redis] Conectado com sucesso!");
});
redisConnection.on("error", (err) => {
  console.error("❌ [Redis] Erro na conexão:", err);
});
