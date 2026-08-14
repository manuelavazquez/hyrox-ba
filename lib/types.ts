export type Division =
  | "open_hombres"
  | "open_mujeres"
  | "mixto_hombre"
  | "mixto_mujer"
  | "pro_hombres"
  | "pro_mujeres";

export type Nivel = "principiante" | "intermedio" | "avanzado" | "competitivo";

export type RitmoRunning =
  | "menos_5"
  | "5_530"
  | "530_600"
  | "600_630"
  | "mas_630"
  | "no_seguro";

export type GrupoEdad =
  | "24_29"
  | "30_34"
  | "35_39"
  | "40_44"
  | "45_49"
  | "50_54"
  | "55_59"
  | "60_64"
  | "65_plus";

export type Objetivo = "diversion" | "competitivo";

export type Disponibilidad =
  | "Mañanas entre semana"
  | "Tardes/noches entre semana"
  | "Fines de semana";

export type Contacto = "email" | "instagram" | "ambos";

export interface Atleta {
  id: string;
  nombre: string;
  email: string;
  instagram?: string;
  zona?: string;
  division: Division;
  nivel: Nivel;
  ritmoRunning?: RitmoRunning;
  grupoEdad?: GrupoEdad;
  objetivo?: Objetivo;
  disponibilidad: Disponibilidad[];
  contacto: Contacto;
  consentimiento: boolean;
  creadoEn: number;
}

export type AtletaInput = Omit<Atleta, "id" | "creadoEn">;

export interface Match {
  atleta: Omit<Atleta, "email" | "instagram"> & {
    contactoVisible: { email?: string; instagram?: string };
  };
  score: number;
  motivos: string[];
}

// Etiquetas legibles, para mostrar en pantalla lo que en los datos
// se guarda como clave interna (ej: "open_hombres" -> "Open Hombres").
export const DIVISION_LABELS: Record<Division, string> = {
  open_hombres: "Open Hombres",
  open_mujeres: "Open Mujeres",
  mixto_hombre: "Mixto (soy hombre)",
  mixto_mujer: "Mixto (soy mujer)",
  pro_hombres: "Pro Hombres",
  pro_mujeres: "Pro Mujeres",
};

export const NIVEL_LABELS: Record<Nivel, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  competitivo: "Competitivo",
};
