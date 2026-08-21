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

// NUEVO: elimina un atleta por id (usado por el link de "ya encontré pareja").
export async function removeAtleta(id: string): Promise<boolean> {
  if (hasKv) {
    const redis = await getRedis();
    const current = (await redis.get<Atleta[]>(LIST_KEY)) ?? [];
    const siguiente = current.filter((a) => a.id !== id);
    const existia = siguiente.length !== current.length;
    if (existia) await redis.set(LIST_KEY, siguiente);
    return existia;
  }
  const antes = memoryStore.atletas.length;
  memoryStore.atletas = memoryStore.atletas.filter((a) => a.id !== id);
  return memoryStore.atletas.length !== antes;
}

// NUEVO: actualiza los campos editables de un atleta por id (usado por la
// página de "editar mi perfil"). Mantiene id, email y creadoEn intactos.
export async function updateAtleta(
  id: string,
  cambios: Partial<Omit<Atleta, "id" | "email" | "creadoEn">>
): Promise<Atleta | null> {
  if (hasKv) {
    const redis = await getRedis();
    const current = (await redis.get<Atleta[]>(LIST_KEY)) ?? [];
    const idx = current.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    current[idx] = { ...current[idx], ...cambios };
    await redis.set(LIST_KEY, current);
    return current[idx];
  }
  const idx = memoryStore.atletas.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  memoryStore.atletas[idx] = { ...memoryStore.atletas[idx], ...cambios };
  return memoryStore.atletas[idx];
}

export async function getAtletaById(id: string): Promise<Atleta | null> {
  const atletas = await getAtletas();
  return atletas.find((a) => a.id === id) ?? null;
}

export function isUsingFallbackStore(): boolean {
  return !hasKv;
}
