import { NextRequest, NextResponse } from "next/server";
import { getAtletaById, updateAtleta } from "@/lib/kv";
import type {
  Contacto,
  Disponibilidad,
  Division,
  GrupoEdad,
  Nivel,
  Objetivo,
  RitmoRunning,
} from "@/lib/types";
import {
  DIVISION_LABELS,
  NIVEL_LABELS,
  RITMO_LABELS,
  GRUPO_EDAD_LABELS,
  OBJETIVO_LABELS,
} from "@/lib/types";

const DISPONIBILIDADES: Disponibilidad[] = [
  "Mañanas entre semana",
  "Tardes/noches entre semana",
  "Fines de semana",
];

function escapar(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function opciones<T extends string>(
  labels: Record<T, string>,
  actual: T | undefined
): string {
  return (Object.keys(labels) as T[])
    .map(
      (valor) =>
        `<option value="${valor}" ${valor === actual ? "selected" : ""}>${labels[valor]}</option>`
    )
    .join("");
}

function paginaFormulario(id: string, atleta: any, mensaje?: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Editar mi perfil · Hyrox BA</title>
<style>
  body { background:#0A0A0A; color:#EDEAE4; font-family: Arial, sans-serif; margin:0; padding:24px; box-sizing:border-box; }
  .card { background:#FFFFFF; color:#0A0A0A; border-radius:18px; padding:28px; max-width:480px; margin:0 auto; box-sizing:border-box; }
  h1 { font-size:22px; margin:0 0 4px; }
  p.sub { color:#4A4E54; font-size:14px; margin:0 0 20px; }
  label { display:block; font-size:13px; font-weight:bold; margin:14px 0 6px; }
  input[type=text], select { width:100%; padding:10px 12px; border:1px solid #DADAD6; border-radius:8px; font-size:14px; box-sizing:border-box; }
  .checks label { display:flex; align-items:center; gap:8px; font-weight:normal; margin:6px 0; }
  .checks input { width:auto; }
  button { width:100%; margin-top:22px; background:#0A0A0A; color:#C4FF4D; border:none; border-radius:10px; padding:13px; font-size:15px; font-weight:bold; cursor:pointer; }
  .mensaje { background:#F6FAD9; border:1px solid #C4FF4D; border-radius:10px; padding:10px 14px; font-size:13px; margin-bottom:16px; }
</style>
</head>
<body>
  <div class="card">
    <h1>Editar mi perfil</h1>
    <p class="sub">${escapar(atleta.nombre)} · ${escapar(atleta.email)}</p>
    ${mensaje ? `<div class="mensaje">${mensaje}</div>` : ""}
    <form method="POST">
      <input type="hidden" name="id" value="${id}" />

      <label>Nombre</label>
      <input type="text" name="nombre" value="${escapar(atleta.nombre)}" required />

      <label>Zona</label>
      <input type="text" name="zona" value="${escapar(atleta.zona || "")}" />

      <label>Instagram</label>
      <input type="text" name="instagram" value="${escapar(atleta.instagram || "")}" placeholder="@usuario" />

      <label>División</label>
      <select name="division">${opciones(DIVISION_LABELS, atleta.division)}</select>

      <label>Nivel</label>
      <select name="nivel">${opciones(NIVEL_LABELS, atleta.nivel)}</select>

      <label>Ritmo de running</label>
      <select name="ritmoRunning">
        <option value="">Sin especificar</option>
        ${opciones(RITMO_LABELS, atleta.ritmoRunning)}
      </select>

      <label>Grupo de edad</label>
      <select name="grupoEdad">
        <option value="">Sin especificar</option>
        ${opciones(GRUPO_EDAD_LABELS, atleta.grupoEdad)}
      </select>

      <label>Objetivo</label>
      <select name="objetivo">
        <option value="">Sin especificar</option>
        ${opciones(OBJETIVO_LABELS, atleta.objetivo)}
      </select>

      <label>Disponibilidad</label>
      <div class="checks">
        ${DISPONIBILIDADES.map(
          (d) =>
            `<label><input type="checkbox" name="disponibilidad" value="${d}" ${atleta.disponibilidad?.includes(d) ? "checked" : ""} /> ${d}</label>`
        ).join("")}
      </div>

      <label>Cómo preferís que te contacten</label>
      <select name="contacto">
        <option value="email" ${atleta.contacto === "email" ? "selected" : ""}>Solo email</option>
        <option value="instagram" ${atleta.contacto === "instagram" ? "selected" : ""}>Solo Instagram</option>
        <option value="ambos" ${atleta.contacto === "ambos" ? "selected" : ""}>Ambos</option>
      </select>

      <button type="submit">Guardar cambios</button>
    </form>
  </div>
</body>
</html>`;
}

function paginaError(mensaje: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8" /></head><body style="background:#0A0A0A;color:#EDEAE4;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;"><p>${mensaje}</p></body></html>`,
    { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return paginaError("Falta el identificador en el link.");

  const atleta = await getAtletaById(id);
  if (!atleta) return paginaError("No encontramos ese perfil, puede que ya se haya dado de baja.");

  return new NextResponse(paginaFormulario(id, atleta), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const id = String(form.get("id") || "");
  if (!id) return paginaError("Falta el identificador en el link.");

  const atletaActual = await getAtletaById(id);
  if (!atletaActual) return paginaError("No encontramos ese perfil, puede que ya se haya dado de baja.");

  const disponibilidad = form.getAll("disponibilidad").map(String) as Disponibilidad[];

  const cambios = {
    nombre: String(form.get("nombre") || atletaActual.nombre).trim(),
    zona: String(form.get("zona") || "").trim() || undefined,
    instagram: String(form.get("instagram") || "").trim() || undefined,
    division: String(form.get("division") || atletaActual.division) as Division,
    nivel: String(form.get("nivel") || atletaActual.nivel) as Nivel,
    ritmoRunning: (String(form.get("ritmoRunning") || "") || undefined) as
      | RitmoRunning
      | undefined,
    grupoEdad: (String(form.get("grupoEdad") || "") || undefined) as GrupoEdad | undefined,
    objetivo: (String(form.get("objetivo") || "") || undefined) as Objetivo | undefined,
    disponibilidad,
    contacto: String(form.get("contacto") || atletaActual.contacto) as Contacto,
  };

  const actualizado = await updateAtleta(id, cambios);
  if (!actualizado) return paginaError("No pudimos guardar los cambios, probá de nuevo.");

  return new NextResponse(
    paginaFormulario(id, actualizado, "Guardado. Ya podés cerrar esta página."),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
