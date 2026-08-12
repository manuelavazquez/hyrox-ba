import Link from "next/link";
import RosterBoard from "@/components/RosterBoard";
import { getAtletas } from "@/lib/kv";

export const dynamic = "force-dynamic";

export default async function Directorio() {
  const atletas = await getAtletas();
  const publico = atletas.map(({ email, ...resto }) => resto);

  return (
    <main className="max-w-3xl mx-auto px-5 py-16 sm:py-24">
      <Link
        href="/"
        className="text-sm font-mono text-steel hover:text-chalk underline underline-offset-4"
      >
        ← Volver
      </Link>
      <h1 className="font-display text-4xl uppercase mt-4 mb-8">
        Directorio de atletas
      </h1>
      <RosterBoard atletas={publico} />
    </main>
  );
}
