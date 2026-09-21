import { ToolRoot } from "@/components/ToolRoot";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Character Profile &amp; Story Bible Starter
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          Build a consistent cast and a shared world in one sitting — then hand the whole
          context to a co-writer, editor or beta reader without handing over your manuscript.
        </p>
        <p className="mt-3 text-xs text-muted">
          Free · No account needed · Everything stays in this browser until you export it
        </p>
      </header>

      <ToolRoot />
    </main>
  );
}
