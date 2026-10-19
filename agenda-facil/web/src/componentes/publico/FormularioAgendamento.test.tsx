import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FormularioAgendamento } from "./FormularioAgendamento";

const vazio = { clienteNome: "", clienteWhatsapp: "" };

describe("FormularioAgendamento", () => {
  it("mostra o que falta quando a pessoa tenta confirmar sem preencher", async () => {
    const aoEnviar = vi.fn();
    render(<FormularioAgendamento valoresIniciais={vazio} aoEnviar={aoEnviar} />);

    await userEvent.click(screen.getByRole("button", { name: "Confirmar agendamento" }));

    expect(await screen.findByText("Informe seu nome (pelo menos 2 letras).")).toBeInTheDocument();
    expect(screen.getByText(/Informe o WhatsApp com DDD/)).toBeInTheDocument();
    expect(screen.getByLabelText("Seu nome")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Seu nome")).toHaveFocus();
    expect(aoEnviar).not.toHaveBeenCalled();
  });

  it("formata o WhatsApp enquanto digita", async () => {
    render(<FormularioAgendamento valoresIniciais={vazio} aoEnviar={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/WhatsApp/), "11987654321");

    expect(screen.getByLabelText(/WhatsApp/)).toHaveValue("(11) 98765-4321");
  });

  it("envia o nome e só os números do WhatsApp", async () => {
    const aoEnviar = vi.fn().mockResolvedValue(undefined);
    render(<FormularioAgendamento valoresIniciais={vazio} aoEnviar={aoEnviar} />);

    await userEvent.type(screen.getByLabelText("Seu nome"), "Cliente de exemplo");
    await userEvent.type(screen.getByLabelText(/WhatsApp/), "11987654321");
    await userEvent.click(screen.getByRole("button", { name: "Confirmar agendamento" }));

    await waitFor(() =>
      expect(aoEnviar).toHaveBeenCalledWith({ clienteNome: "Cliente de exemplo", clienteWhatsapp: "11987654321" }),
    );
  });

  it("mostra embaixo do campo o erro que o servidor devolveu", async () => {
    const aoEnviar = vi.fn().mockResolvedValue({ clienteWhatsapp: "Esse número não parece um WhatsApp." });
    render(<FormularioAgendamento valoresIniciais={{ clienteNome: "Cliente", clienteWhatsapp: "(11) 98765-4321" }} aoEnviar={aoEnviar} />);

    await userEvent.click(screen.getByRole("button", { name: "Confirmar agendamento" }));

    expect(await screen.findByText("Esse número não parece um WhatsApp.")).toBeInTheDocument();
  });

  it("fica desabilitado depois de um conflito, até escolher outro horário", () => {
    render(
      <FormularioAgendamento
        valoresIniciais={vazio}
        aoEnviar={vi.fn()}
        bloqueado
        avisoBloqueado="O botão volta a funcionar quando você escolher um novo horário."
      />,
    );

    expect(screen.getByRole("button", { name: "Confirmar agendamento" })).toBeDisabled();
    expect(screen.getByText("O botão volta a funcionar quando você escolher um novo horário.")).toBeInTheDocument();
  });
});
