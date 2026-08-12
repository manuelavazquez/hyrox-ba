import type { Atleta } from "./types";

const LIST_KEY = "hyrox-ba:atletas";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasKv = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

// In-memory fallback so `npm run dev` works with zero setup.
// NOTE: esto NO persiste en producción, cada visita puede arrancar de cero
// si no conectaste Upstash Redis. Ver README para el paso de conexión.
const memoryStore: { atletas: Atleta[] } = (globalThis as any).__hyroxBaMemory || {
  atletas: [],
};
(globalThis as any).__hyroxBaMemory = memoryStore;

async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
}

export async function getAtletas(): Promise<Atleta[]> {
  if (hasKv) {
    const redis = await getRedis();
    const data = await redis.get<Atleta[]>(LIST_KEY);
    return data ?? [];
  }
  return memoryStore.atletas;
}

export async function addAtleta(atleta: Atleta): Promise<void> {
  if (hasKv) {
    const redis = await getRedis();
    const current = (await redis.get<Atleta[]>(LIST_KEY)) ?? [];
    current.push(atleta);
    await redis.set(LIST_KEY, current);
    return;
  }
  memoryStore.atletas.push(atleta);
}

export function isUsingFallbackStore(): boolean {
  return !hasKv;
}
