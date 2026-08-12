import type { Atleta } from "@/lib/types";
import { DIVISION_LABELS, NIVEL_LABELS } from "@/lib/types";

export default function RosterBoard({
  atletas,
}: {
  atletas: Omit<Atleta, "email">[];
}) {
  if (atletas.length === 0) {
    return (
      <p className="text-steel font-mono text-sm">
        Todavía no hay nadie anotado. Sé la primera persona en la lista.
      </p>
    );
  }

  return (
    <div className="border border-steel/40 overflow-hidden">
      <div className="grid grid-cols-[3rem_1fr_5rem_6rem_8rem] bg-concrete-900 text-xs font-mono uppercase tracking-widest text-steel px-4 py-2">
        <span>#</span>
        <span>Atleta</span>
        <span>Zona</span>
        <span>Nivel</span>
        <span>División</span>
      </div>
      {atletas
        .slice()
        .sort((a, b) => b.creadoEn - a.creadoEn)
        .map((a, i) => (
          <div
            key={a.id}
            className={`grid grid-cols-[3rem_1fr_5rem_6rem_8rem] items-center px-4 py-3 text-sm ${
              i % 2 === 0 ? "bg-concrete-950" : "bg-concrete-900/40"
            }`}
          >
            <span className="bib-number text-volt">{String(i + 1).padStart(3, "0")}</span>
            <span className="font-display uppercase tracking-wide">{a.nombre}</span>
            <span className="text-steel">{a.zona || "—"}</span>
            <span className="text-steel">{NIVEL_LABELS[a.nivel]}</span>
            <span className="text-steel">{DIVISION_LABELS[a.division]}</span>
          </div>
        ))}
    </div>
  );
}
