import { NextRequest, NextResponse } from "next/server";
import { addAtleta, getAtletas } from "@/lib/kv";
import { calcularMatches } from "@/lib/matching";
import type { Atleta, AtletaInput } from "@/lib/types";

// El formulario vive en Framer, en otro dominio, así que la API necesita
// habilitar CORS para que el navegador deje hacer el fetch.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function validar(input: Partial<AtletaInput>): string | null {
  if (!input.nombre?.trim()) return "Falta el nombre";
  if (!input.email?.trim() || !input.email.includes("@")) return "Email inválido";
  if (!input.division) return "Falta la división";
  if (!input.nivel) return "Falta el nivel";
  if (!input.contacto) return "Elegí cómo querés que te contacten";
  if (
    (input.contacto === "instagram" || input.contacto === "ambos") &&
    !input.instagram?.trim()
  )
    return "Falta tu usuario de Instagram";
  return null;
}

export async function GET() {
  const atletas = await getAtletas();
  // No exponemos contacto en el listado público, solo en los matches directos.
  const publico = atletas.map(({ email, instagram, contacto, ...resto }) => resto);
  return NextResponse.json({ atletas: publico }, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<AtletaInput>;
  const error = validar(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400, headers: CORS_HEADERS });
  }

  const nuevo: Atleta = {
    id: crypto.randomUUID(),
    nombre: body.nombre!.trim(),
    email: body.email!.trim(),
    instagram: body.instagram?.trim() || undefined,
    zona: body.zona?.trim() || undefined,
    division: body.division!,
    nivel: body.nivel!,
    ritmoRunning: body.ritmoRunning,
    grupoEdad: body.grupoEdad,
    objetivo: body.objetivo,
    disponibilidad: body.disponibilidad ?? [],
    contacto: body.contacto!,
    creadoEn: Date.now(),
  };

  const pool = await getAtletas();
  const matches = calcularMatches(nuevo, pool);
  await addAtleta(nuevo);

  return NextResponse.json({ atleta: nuevo, matches }, { headers: CORS_HEADERS });
}
