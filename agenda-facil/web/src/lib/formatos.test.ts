import { describe, expect, it } from "vitest";

import { formatarDuracao, formatarPreco, inicioDaSemana, mascararWhatsapp, sugerirSlug } from "./formatos";

describe("formatos", () => {
  it("formata preço em reais, sem centavos quando é inteiro", () => {
    expect(formatarPreco(4500)).toBe("R$ 45");
    expect(formatarPreco(4550)).toBe("R$ 45,50");
    expect(formatarPreco(null)).toBeNull();
  });

  it("formata duração em horas e minutos", () => {
    expect(formatarDuracao(40)).toBe("40 min");
    expect(formatarDuracao(60)).toBe("1 h");
    expect(formatarDuracao(70)).toBe("1 h 10 min");
  });

  it("aplica a máscara de telefone fixo e de celular", () => {
    expect(mascararWhatsapp("1132654321")).toBe("(11) 3265-4321");
    expect(mascararWhatsapp("11987654321")).toBe("(11) 98765-4321");
    expect(mascararWhatsapp("(11) 98765-43210000")).toBe("(11) 98765-4321");
  });

  it("sugere o endereço do link a partir do nome do negócio", () => {
    expect(sugerirSlug("Studio da Ana & Cia")).toBe("studio-da-ana-cia");
    expect(sugerirSlug("Barbearia São João")).toBe("barbearia-sao-joao");
  });

  it("acha a segunda-feira da semana", () => {
    expect(inicioDaSemana("2030-03-07")).toBe("2030-03-04"); // quinta → segunda
    expect(inicioDaSemana("2030-03-10")).toBe("2030-03-04"); // domingo → segunda anterior
  });
});
