import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SeletorDeHorarios } from "./SeletorDeHorarios";

const criarLink = (horario: string) => `/studio-exemplo?servico=1&data=2030-03-05&horario=${horario}`;

describe("SeletorDeHorarios", () => {
  it("separa os horários em manhã, tarde e noite", () => {
    render(<SeletorDeHorarios horarios={["09:00", "11:20", "13:00", "18:20"]} criarLink={criarLink} />);

    const manha = screen.getByRole("region", { name: "Manhã" });
    const tarde = screen.getByRole("region", { name: "Tarde" });
    const noite = screen.getByRole("region", { name: /Noite/ });

    expect(within(manha).getAllByRole("link").map((l) => l.textContent)).toEqual(["09:00", "11:20"]);
    expect(within(tarde).getAllByRole("link").map((l) => l.textContent)).toEqual(["13:00"]);
    expect(within(noite).getAllByRole("link").map((l) => l.textContent)).toEqual(["18:20"]);
  });

  it("não mostra o período que não tem horário", () => {
    render(<SeletorDeHorarios horarios={["14:00", "15:00"]} criarLink={criarLink} />);

    expect(screen.queryByRole("region", { name: "Manhã" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Tarde" })).toBeInTheDocument();
  });

  it("cada horário é um link para o próximo passo, com o horário no endereço", () => {
    render(<SeletorDeHorarios horarios={["10:20"]} criarLink={criarLink} />);

    expect(screen.getByRole("link", { name: "10:20" })).toHaveAttribute("href", criarLink("10:20"));
  });

  it("marca o horário escolhido para quem usa leitor de tela", () => {
    render(<SeletorDeHorarios horarios={["09:00", "10:00"]} criarLink={criarLink} selecionado="10:00" />);

    expect(screen.getByRole("link", { name: "10:00" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "09:00" })).not.toHaveAttribute("aria-current");
  });
});
