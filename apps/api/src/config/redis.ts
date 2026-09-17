import { Redis } from "ioredis";

export const redisConnection  = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("🔴 [Redis] Conectado com sucesso na porta 6379!");
});
redisConnection.on("error", (err) => {
  console.error("❌ [Redis] Erro na conexão:", err);
});
