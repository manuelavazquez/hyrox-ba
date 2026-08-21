import { NextRequest, NextResponse } from "next/server";
import { removeAtleta } from "@/lib/kv";

function paginaHtml(titulo: string, mensaje: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${titulo} · Hyrox BA</title>
<style>
  body { background:#0A0A0A; color:#EDEAE4; font-family: Arial, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; padding:24px; box-sizing:border-box; }
  .card { background:#FFFFFF; color:#0A0A0A; border-radius:18px; padding:32px 28px; max-width:420px; text-align:center; }
  h1 { font-size:22px; margin:0 0 12px; }
  p { font-size:15px; color:#4A4E54; line-height:1.5em; margin:0; }
</style>
</head>
<body>
  <div class="card">
    <h1>${titulo}</h1>
    <p>${mensaje}</p>
  </div>
</body>
</html>`;
}

// GET /api/athletes/unsubscribe?id=...
// Se accede desde el link del mail, por eso responde HTML y no JSON.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return new NextResponse(
      paginaHtml("Link inválido", "Falta el identificador en el link."),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const existia = await removeAtleta(id);

  const html = existia
    ? paginaHtml(
        "¡Listo, gracias por avisar!",
        "Te sacamos de la lista de Hyrox BA. Que tengas una gran carrera."
      )
    : paginaHtml(
        "Ya no estabas en la lista",
        "Este perfil ya había sido eliminado antes, no hace falta que hagas nada más."
      );

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
