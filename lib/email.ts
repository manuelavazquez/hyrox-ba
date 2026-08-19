import type { Atleta } from "./types";
import { DIVISION_LABELS, NIVEL_LABELS } from "./types";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Si no están configuradas las variables de entorno, no hace nada y no
// rompe el registro del atleta, el mail es un extra, no un requisito.
export async function avisarNuevoAtleta(atleta: Atleta): Promise<void> {
  if (!RESEND_API_KEY || !ADMIN_EMAIL) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);

    await resend.emails.send({
      from: "Hyrox BA <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `Nuevo anotado: ${atleta.nombre}`,
      text: [
        `Se anotó alguien nuevo en Hyrox BA.`,
        ``,
        `Nombre: ${atleta.nombre}`,
        `Email: ${atleta.email}`,
        `Zona: ${atleta.zona || "no especificó"}`,
        `División: ${DIVISION_LABELS[atleta.division]}`,
        `Nivel: ${NIVEL_LABELS[atleta.nivel]}`,
        `Disponibilidad: ${atleta.disponibilidad.join(", ") || "no especificó"}`,
      ].join("\n"),
    });
  } catch (error) {
    // Si falla el envío del mail, no queremos que se caiga el registro del
    // atleta por eso, solo lo dejamos anotado en los logs de Railway.
    console.error("No se pudo enviar el mail de aviso:", error);
  }
}
