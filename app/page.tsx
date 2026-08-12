import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-16 sm:py-24">
      <header className="mb-14">
        <p className="font-mono text-volt text-sm tracking-widest uppercase">
          Hyrox Buenos Aires · Marzo 2026
        </p>
        <h1 className="font-display text-5xl sm:text-6xl uppercase leading-[0.95] mt-3">
          You go,<br />I go.<br />
          <span className="text-volt">Pero primero</span> necesitás
          <br />un compañero.
        </h1>
        <p className="text-chalk/80 mt-6 max-w-md">
          Un lugar simple para encontrar tu dupla de Doubles para el próximo
          Hyrox de Buenos Aires. Cargá tu perfil, mirá con quién matcheás por
          nivel y disponibilidad, y arreglá directo por mail o Instagram.
        </p>
        <Link
          href="/directorio"
          className="inline-block mt-6 text-sm font-mono text-steel hover:text-chalk underline underline-offset-4"
        >
          Ver el directorio completo
        </Link>
      </header>

      <SignupForm />

      <footer className="mt-20 pt-6 border-t border-steel/30 text-xs text-steel font-mono">
        Proyecto piloto para la comunidad de Buenos Aires, sin afiliación
        oficial con Hyrox.
      </footer>
    </main>
  );
}
