import Link from "next/link";

/** "Agenda Fácil" com o "Fácil" grifado de marca-texto, como no design system. */
export function Logo({ href = "/", tamanho = "text-[1.375rem]" }: { href?: string; tamanho?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-[0.18em] font-titulo font-extrabold tracking-[-0.02em] text-tinta no-underline hover:text-tinta ${tamanho}`}
    >
      Agenda
      <span className="rounded-[3px] bg-[linear-gradient(transparent_22%,var(--color-marca-texto)_22%,var(--color-marca-texto)_88%,transparent_88%)] px-[0.18em]">
        Fácil
      </span>
    </Link>
  );
}
