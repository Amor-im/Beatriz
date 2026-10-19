/** "Passo 2 de 3 · Dia e horário" + barra. O passo atual tem texto, não só cor. */
export function Passos({ atual, total, nome }: { atual: number; total: number; nome: string }) {
  return (
    <div className="grid gap-2">
      <p className="text-pequeno text-tinta-suave">
        Passo{" "}
        <strong className="text-tinta">
          {atual} de {total}
        </strong>{" "}
        · {nome}
      </p>
      <ol className="grid auto-cols-fr grid-flow-col gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <li
            key={i}
            className={`h-1.5 rounded-full ${
              i + 1 < atual
                ? "bg-caneta"
                : i + 1 === atual
                  ? "bg-caneta shadow-[0_0_0_2px_var(--color-papel),0_0_0_3.5px_var(--color-caneta)]"
                  : "bg-linha"
            }`}
          />
        ))}
      </ol>
    </div>
  );
}
