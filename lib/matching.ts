import type { Atleta, Division, GrupoEdad, Match, Nivel, RitmoRunning } from "./types";

const ORDEN_NIVEL: Nivel[] = ["principiante", "intermedio", "avanzado", "competitivo"];
const ORDEN_RITMO: RitmoRunning[] = [
  "menos_5",
  "5_530",
  "530_600",
  "600_630",
  "mas_630",
];
const ORDEN_EDAD: GrupoEdad[] = [
  "24_29",
  "30_34",
  "35_39",
  "40_44",
  "45_49",
  "50_54",
  "55_59",
  "60_64",
  "65_plus",
];

// Qué división busca pareja con cuál. Mixto Hombre <-> Mixto Mujer,
// el resto matchea con su propia división.
const DIVISION_ELEGIBLE: Record<Division, Division> = {
  open_hombres: "open_hombres",
  open_mujeres: "open_mujeres",
  pro_hombres: "pro_hombres",
  pro_mujeres: "pro_mujeres",
  mixto_hombre: "mixto_mujer",
  mixto_mujer: "mixto_hombre",
};

function esElegible(a: Atleta, b: Atleta): boolean {
  if (a.id === b.id) return false;
  return DIVISION_ELEGIBLE[a.division] === b.division;
}

function distanciaOrdinal<T>(orden: T[], a?: T, b?: T): number | null {
  if (!a || !b) return null;
  const ia = orden.indexOf(a);
  const ib = orden.indexOf(b);
  if (ia === -1 || ib === -1) return null;
  return Math.abs(ia - ib);
}

function puntajeNivel(a: Nivel, b: Nivel): { puntos: number; motivo: string | null } {
  const distancia = distanciaOrdinal(ORDEN_NIVEL, a, b) ?? 99;
  if (distancia === 0) return { puntos: 8, motivo: "Mismo nivel" };
  if (distancia === 1) return { puntos: 4, motivo: "Nivel cercano" };
  return { puntos: 0, motivo: null };
}

function puntajeRitmo(
  a?: RitmoRunning,
  b?: RitmoRunning
): { puntos: number; motivo: string | null } {
  if (!a || !b || a === "no_seguro" || b === "no_seguro") return { puntos: 0, motivo: null };
  const distancia = distanciaOrdinal(ORDEN_RITMO, a, b);
  if (distancia === null) return { puntos: 0, motivo: null };
  if (distancia === 0) return { puntos: 4, motivo: "Mismo ritmo de running" };
  if (distancia === 1) return { puntos: 2, motivo: "Ritmo de running parecido" };
  return { puntos: 0, motivo: null };
}

function puntajeEdad(a?: GrupoEdad, b?: GrupoEdad): { puntos: number; motivo: string | null } {
  const distancia = distanciaOrdinal(ORDEN_EDAD, a, b);
  if (distancia === null) return { puntos: 0, motivo: null };
  if (distancia === 0) return { puntos: 1, motivo: "Misma franja de edad" };
  return { puntos: 0, motivo: null };
}

function puntajeObjetivo(
  a?: Atleta["objetivo"],
  b?: Atleta["objetivo"]
): { puntos: number; motivo: string | null } {
  if (!a || !b) return { puntos: 0, motivo: null };
  if (a === b) return { puntos: 20, motivo: a === "competitivo" ? "Los dos van competitivos" : "Los dos van a divertirse" };
  return { puntos: 0, motivo: null };
}

function puntajeDisponibilidad(
  a: Atleta["disponibilidad"],
  b: Atleta["disponibilidad"]
): { puntos: number; motivo: string | null } {
  const comunes = a.filter((slot) => b.includes(slot));
  if (comunes.length === 0) return { puntos: 0, motivo: null };
  return {
    // Peso bajo a propósito: es el criterio de menor prioridad.
    puntos: comunes.length * 0.5,
    motivo: `Coinciden en: ${comunes.join(", ").toLowerCase()}`,
  };
}

export function contactoVisible(atleta: Atleta): { email?: string; instagram?: string } {
  const visible: { email?: string; instagram?: string } = {};
  if (atleta.contacto === "email" || atleta.contacto === "ambos") {
    visible.email = atleta.email;
  }
  if (
    (atleta.contacto === "instagram" || atleta.contacto === "ambos") &&
    atleta.instagram
  ) {
    visible.instagram = atleta.instagram;
  }
  return visible;
}

export function calcularMatches(atleta: Atleta, pool: Atleta[]): Match[] {
  const resultados: Match[] = [];

  for (const candidato of pool) {
    if (!esElegible(atleta, candidato)) continue;

    const nivel = puntajeNivel(atleta.nivel, candidato.nivel);
    const ritmo = puntajeRitmo(atleta.ritmoRunning, candidato.ritmoRunning);
    const edad = puntajeEdad(atleta.grupoEdad, candidato.grupoEdad);
    const objetivo = puntajeObjetivo(atleta.objetivo, candidato.objetivo);
    const disponibilidad = puntajeDisponibilidad(
      atleta.disponibilidad,
      candidato.disponibilidad
    );

    const motivos = [objetivo.motivo, nivel.motivo, ritmo.motivo, edad.motivo, disponibilidad.motivo].filter(
      (m): m is string => Boolean(m)
    );

    const { email, instagram, ...resto } = candidato;

    resultados.push({
      atleta: { ...resto, contactoVisible: contactoVisible(candidato) },
      score: nivel.puntos + ritmo.puntos + edad.puntos + objetivo.puntos + disponibilidad.puntos,
      motivos,
    });
  }

  return resultados.sort((x, y) => y.score - x.score).slice(0, 5);
}
