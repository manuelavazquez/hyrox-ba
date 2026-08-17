import { NextRequest, NextResponse } from "next/server";
import { getAtletas } from "@/lib/kv";
import { calcularMatches } from "@/lib/matching";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// GET /api/athletes/check?email=alguien@mail.com
// Vuelve a calcular matches para un perfil que ya está guardado,
// contra el estado actual de la base (por si se sumó gente nueva).
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "Falta el email" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const pool = await getAtletas();
  const atleta = pool.find((a) => a.email.trim().toLowerCase() === email);

  if (!atleta) {
    return NextResponse.json(
      { error: "No encontramos ningún perfil con ese email" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const matches = calcularMatches(atleta, pool);

  return NextResponse.json({ matches }, { headers: CORS_HEADERS });
}
