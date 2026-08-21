import type { Atleta, Match } from "./types";
import { DIVISION_LABELS, NIVEL_LABELS } from "./types";
import { contactoVisible } from "./matching";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
// Remitente real ahora que el dominio está verificado en Resend.
// Antes de verificar el dominio, esto tenía que ser "onboarding@resend.dev".
const REMITENTE = "Hyrox BA <avisos@hyroxba.com>";

// Si no están configuradas las variables de entorno, no hace nada y no
// rompe el registro del atleta, el mail es un extra, no un requisito.
export async function avisarNuevoAtleta(atleta: Atleta): Promise<void> {
  if (!RESEND_API_KEY || !ADMIN_EMAIL) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);

    await resend.emails.send({
      from: REMITENTE,
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

// NUEVO: le avisa a un atleta YA anotado que apareció alguien nuevo
// compatible con su perfil. Se llama una vez por cada match encontrado
// cuando se registra un atleta nuevo.
export async function avisarNuevoMatch(
  atletaExistente: Atleta,
  atletaNuevo: Atleta,
  motivos: string[]
): Promise<void> {
  if (!RESEND_API_KEY) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);

    const contacto = contactoVisible(atletaNuevo);
    const lineasContacto: string[] = [];
    if (contacto.email) lineasContacto.push(`Email: ${contacto.email}`);
    if (contacto.instagram) lineasContacto.push(`Instagram: @${contacto.instagram}`);

    await resend.emails.send({
      from: REMITENTE,
      to: atletaExistente.email,
      subject: `¡Encontramos un posible match para vos!`,
      text: [
        `Hola ${atletaExistente.nombre},`,
        ``,
        `Se anotó ${atletaNuevo.nombre} en Hyrox BA y matchea con tu perfil.`,
        ``,
        `Nivel: ${NIVEL_LABELS[atletaNuevo.nivel]}`,
        `División: ${DIVISION_LABELS[atletaNuevo.division]}`,
        atletaNuevo.zona ? `Zona: ${atletaNuevo.zona}` : null,
        motivos.length > 0 ? `Por qué matchea: ${motivos.join(", ")}` : null,
        ``,
        `Contacto:`,
        ...lineasContacto,
        ``,
        `Escribile directo cuando quieras.`,
      ]
        .filter((linea): linea is string => linea !== null)
        .join("\n"),
    });
  } catch (error) {
    console.error("No se pudo enviar el mail de nuevo match:", error);
  }
}
