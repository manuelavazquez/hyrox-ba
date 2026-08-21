import type { Atleta, Match } from "./types";
import {
  DIVISION_LABELS,
  NIVEL_LABELS,
  RITMO_LABELS,
  GRUPO_EDAD_LABELS,
  OBJETIVO_LABELS,
} from "./types";
import { contactoVisible } from "./matching";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
// Remitente real ahora que el dominio está verificado en Resend.
// Antes de verificar el dominio, esto tenía que ser "onboarding@resend.dev".
const REMITENTE = "Hyrox BA <avisos@hyroxba.com>";
// NUEVO: URL pública del backend, para armar los links de "editar perfil"
// y "ya encontré pareja" dentro de los mails.
const APP_BASE_URL = process.env.APP_BASE_URL || "https://hyrox-ba-production.up.railway.app";

function linksAtleta(atletaId: string) {
  return {
    editar: `${APP_BASE_URL}/api/athletes/edit?id=${atletaId}`,
    baja: `${APP_BASE_URL}/api/athletes/unsubscribe?id=${atletaId}`,
  };
}

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

// NUEVO: mail de confirmación que recibe cada persona apenas se anota.
// Es el único mail garantizado que le llega a todo el mundo (haya match
// o no), así que es donde va el link para editar el perfil o darse de baja.
export async function avisarInscripcion(atleta: Atleta): Promise<void> {
  if (!RESEND_API_KEY) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);
    const { editar, baja } = linksAtleta(atleta.id);

    await resend.emails.send({
      from: REMITENTE,
      to: atleta.email,
      subject: `Ya estás anotado en Hyrox BA`,
      text: [
        `Hola ${atleta.nombre},`,
        ``,
        `Quedaste anotado en Hyrox BA para buscar compañero de Doubles.`,
        `Apenas se sume alguien compatible con tu perfil, te vamos a avisar por acá.`,
        ``,
        `¿Te equivocaste en algo o cambiaste de idea? Editá tu perfil:`,
        editar,
        ``,
        `¿Ya encontraste compañero? Avisanos y te sacamos de la lista:`,
        baja,
      ].join("\n"),
    });
  } catch (error) {
    console.error("No se pudo enviar el mail de inscripción:", error);
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
    const { editar, baja } = linksAtleta(atletaExistente.id);

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
        `División: ${DIVISION_LABELS[atletaNuevo.division]}`,
        `Nivel: ${NIVEL_LABELS[atletaNuevo.nivel]}`,
        atletaNuevo.ritmoRunning
          ? `Ritmo de running: ${RITMO_LABELS[atletaNuevo.ritmoRunning]}`
          : null,
        atletaNuevo.grupoEdad
          ? `Grupo de edad: ${GRUPO_EDAD_LABELS[atletaNuevo.grupoEdad]}`
          : null,
        atletaNuevo.objetivo
          ? `Objetivo: ${OBJETIVO_LABELS[atletaNuevo.objetivo]}`
          : null,
        atletaNuevo.disponibilidad.length > 0
          ? `Disponibilidad: ${atletaNuevo.disponibilidad.join(", ")}`
          : null,
        atletaNuevo.zona ? `Zona: ${atletaNuevo.zona}` : null,
        motivos.length > 0 ? `Por qué matchea: ${motivos.join(", ")}` : null,
        ``,
        `Contacto:`,
        ...lineasContacto,
        ``,
        `Escribile directo cuando quieras.`,
        ``,
        `---`,
        `¿Ya encontraste compañero? Avisanos y te sacamos de la lista: ${baja}`,
        `¿Querés actualizar tu perfil? ${editar}`,
      ]
        .filter((linea): linea is string => linea !== null)
        .join("\n"),
    });
  } catch (error) {
    console.error("No se pudo enviar el mail de nuevo match:", error);
  }
}
