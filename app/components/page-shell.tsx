import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
};

export function PageShell({
  children,
  description,
  eyebrow = "Agent cost tracker",
  title,
}: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
      </header>
      {children}
    </main>
  );
}
