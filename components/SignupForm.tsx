"use client";

import { useState } from "react";
import type {
  AtletaInput,
  Contacto,
  Disponibilidad,
  Division,
  Match,
  Nivel,
} from "@/lib/types";
import { DIVISION_LABELS, NIVEL_LABELS } from "@/lib/types";

const NIVELES: Nivel[] = ["principiante", "intermedio", "avanzado", "competitivo"];
const DISPONIBILIDADES: Disponibilidad[] = [
  "Mañanas entre semana",
  "Tardes/noches entre semana",
  "Fines de semana",
];
const DIVISIONES: { valor: Division; top: string; bottom: string }[] = [
  { valor: "open_hombres", top: "Open", bottom: "Hombres" },
  { valor: "open_mujeres", top: "Open", bottom: "Mujeres" },
  { valor: "mixto_hombre", top: "Mixto", bottom: "Soy hombre" },
  { valor: "mixto_mujer", top: "Mixto", bottom: "Soy mujer" },
  { valor: "pro_hombres", top: "Pro", bottom: "Hombres" },
  { valor: "pro_mujeres", top: "Pro", bottom: "Mujeres" },
];

const initialState = {
  nombre: "",
  email: "",
  instagram: "",
  zona: "",
  division: "" as Division | "",
  nivel: "" as Nivel | "",
  disponibilidad: [] as Disponibilidad[],
  contacto: "" as Contacto | "",
};

export default function SignupForm() {
  const [form, setForm] = useState(initialState);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[] | null>(null);

  function toggleDisponibilidad(slot: Disponibilidad) {
    setForm((prev) => ({
      ...prev,
      disponibilidad: prev.disponibilidad.includes(slot)
        ? prev.disponibilidad.filter((s) => s !== slot)
        : [...prev.disponibilidad, slot],
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.division || !form.nivel || !form.contacto) {
      setError("Completá todos los campos obligatorios.");
      return;
    }
    if ((form.contacto === "instagram" || form.contacto === "ambos") && !form.instagram) {
      setError("Necesitamos tu Instagram si elegís mostrarlo como contacto.");
      return;
    }

    setEnviando(true);
    try {
      const payload: AtletaInput = {
        nombre: form.nombre,
        email: form.email,
        instagram: form.instagram || undefined,
        zona: form.zona,
        division: form.division,
        nivel: form.nivel,
        disponibilidad: form.disponibilidad,
        contacto: form.contacto,
        consentimiento: true,
      };
      const res = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Algo falló, probá de nuevo.");
        return;
      }
      setMatches(data.matches as Match[]);
    } catch {
      setError("No se pudo conectar. Probá de nuevo en un rato.");
    } finally {
      setEnviando(false);
    }
  }

  if (matches !== null) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-widest text-volt font-mono">
            Perfil cargado
          </p>
          <h2 className="font-display text-3xl uppercase mt-1">
            {matches.length > 0
              ? `Encontramos ${matches.length} posible${matches.length > 1 ? "s" : ""} dupla${matches.length > 1 ? "s" : ""}`
              : "Todavía no hay nadie que matchee"}
          </h2>
          <p className="text-steel mt-2">
            {matches.length > 0
              ? "Escribile directo, el contacto es tuyo para usar."
              : "Quedaste anotado igual. Apenas alguien compatible se sume, va a poder verte en el directorio."}
          </p>
        </div>

        <div className="space-y-3">
          {matches.map((m) => (
            <div
              key={m.atleta.id}
              className="border border-steel/40 bg-concrete-900 p-4 flex flex-col gap-2"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-xl uppercase">
                  {m.atleta.nombre}
                </span>
                <span className="bib-number text-volt text-sm">
                  {m.atleta.zona}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono text-steel">
                <span>{NIVEL_LABELS[m.atleta.nivel]}</span>
                <span>·</span>
                <span>{DIVISION_LABELS[m.atleta.division]}</span>
              </div>
              {m.motivos.length > 0 && (
                <p className="text-sm text-chalk/80">{m.motivos.join(" · ")}</p>
              )}
              <div className="flex gap-3 pt-1 text-sm">
                {m.atleta.contactoVisible.email && (
                  <a
                    href={`mailto:${m.atleta.contactoVisible.email}?subject=Dupla Hyrox Buenos Aires`}
                    className="text-volt hover:underline"
                  >
                    {m.atleta.contactoVisible.email}
                  </a>
                )}
                {m.atleta.contactoVisible.instagram && (
                  <a
                    href={`https://instagram.com/${m.atleta.contactoVisible.instagram.replace("@", "")}`}
                    target="_blank"
                    className="text-ember hover:underline"
                  >
                    @{m.atleta.contactoVisible.instagram.replace("@", "")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre">
          <input
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Instagram">
          <input
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            placeholder="@usuario"
            className="input"
          />
        </Field>
        <Field label="Zona (barrio / partido)">
          <input
            required
            value={form.zona}
            onChange={(e) => setForm({ ...form, zona: e.target.value })}
            placeholder="Ej: Palermo, Vicente López..."
            className="input"
          />
        </Field>
      </div>

      <Field label="División">
        <div className="grid grid-cols-2 gap-3">
          {DIVISIONES.map((d) => (
            <button
              key={d.valor}
              type="button"
              onClick={() => setForm({ ...form, division: d.valor })}
              className={`text-center py-4 border transition focus:outline-2 focus:outline-volt ${
                form.division === d.valor
                  ? "bg-volt text-concrete-950 border-volt"
                  : "border-steel/50 text-chalk hover:border-chalk"
              }`}
            >
              <div className="text-sm">{d.top}</div>
              <div className="font-display uppercase text-lg">{d.bottom}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-steel mt-2">
          Mixto necesita un hombre y una mujer, elegí tu propio género.
        </p>
      </Field>

      <Field label="Nivel">
        <div className="flex flex-wrap gap-3">
          {NIVELES.map((n) => (
            <Pill
              key={n}
              active={form.nivel === n}
              onClick={() => setForm({ ...form, nivel: n })}
            >
              {n}
            </Pill>
          ))}
        </div>
      </Field>

      <Field label="Disponibilidad para entrenar">
        <div className="flex flex-wrap gap-3">
          {DISPONIBILIDADES.map((d) => (
            <Pill
              key={d}
              active={form.disponibilidad.includes(d)}
              onClick={() => toggleDisponibilidad(d)}
            >
              {d}
            </Pill>
          ))}
        </div>
      </Field>

      <Field label="Cómo preferís que te contacten">
        <div className="flex flex-wrap gap-3">
          {(
            [
              { valor: "email", texto: "Solo email" },
              { valor: "instagram", texto: "Solo Instagram" },
              { valor: "ambos", texto: "Ambos" },
            ] as { valor: Contacto; texto: string }[]
          ).map((c) => (
            <Pill
              key={c.valor}
              active={form.contacto === c.valor}
              onClick={() => setForm({ ...form, contacto: c.valor })}
            >
              {c.texto}
            </Pill>
          ))}
        </div>
        <p className="text-xs text-steel mt-2">
          Solo tus matches ven este dato, nunca aparece en el directorio público.
        </p>
      </Field>

      {error && <p className="text-ember text-sm">{error}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-volt text-concrete-950 font-display text-lg uppercase tracking-wide py-3 hover:brightness-95 disabled:opacity-50 transition"
      >
        {enviando ? "Buscando dupla..." : "Buscar mi dupla"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          background: #1c1c1e;
          border: 1px solid rgba(74, 78, 84, 0.5);
          padding: 0.6rem 0.75rem;
          color: #edeae4;
        }
        .input:focus {
          outline: 2px solid #c4ff4d;
          outline-offset: 1px;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-steel font-mono mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-sm border transition focus:outline-2 focus:outline-volt ${
        active
          ? "bg-volt text-concrete-950 border-volt"
          : "border-steel/50 text-chalk hover:border-chalk"
      }`}
    >
      {children}
    </button>
  );
}
