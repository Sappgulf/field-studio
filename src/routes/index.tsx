import { createFileRoute } from "@tanstack/react-router";
import { ErrorCatch } from "@/components/ErrorCatch";
import { SynthApp } from "@/components/synth/SynthApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <ErrorCatch>
      <main className="min-h-dvh bg-bg text-fg">
        <SynthApp />
      </main>
    </ErrorCatch>
  );
}
