"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Botao } from "@/componentes/Botao";
import { Campo, Entrada } from "@/componentes/Campo";
import { esquemaDadosDoCliente, type DadosDoCliente } from "@/lib/esquemas";
import { mascararWhatsapp, soDigitos } from "@/lib/formatos";

type ErrosDoServidor = Partial<Record<keyof DadosDoCliente, string>>;

/**
 * Nome e WhatsApp do cliente. Valida ao sair do campo e no envio (React Hook Form + Zod).
 * Os dados ficam guardados no componente pai: se o horário for trocado, nada se perde.
 */
export function FormularioAgendamento({
  valoresIniciais,
  aoMudar,
  aoEnviar,
  bloqueado = false,
  avisoBloqueado,
}: {
  valoresIniciais: DadosDoCliente;
  aoMudar?: (valores: DadosDoCliente) => void;
  /** Envia para a API. Se o servidor recusar algum campo, devolve a mensagem de cada um. */
  aoEnviar: (dados: DadosDoCliente) => Promise<ErrosDoServidor | void>;
  /** Sem horário válido escolhido (por exemplo, depois de um conflito). */
  bloqueado?: boolean;
  avisoBloqueado?: string;
}) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    subscribe,
    formState: { errors, isSubmitting },
  } = useForm<DadosDoCliente>({
    resolver: zodResolver(esquemaDadosDoCliente),
    defaultValues: valoresIniciais,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!aoMudar) return;
    // avisa o pai a cada mudança: assim nome e WhatsApp sobrevivem à troca de horário
    return subscribe({
      formState: { values: true },
      callback: ({ values }) => aoMudar({ clienteNome: values.clienteNome ?? "", clienteWhatsapp: values.clienteWhatsapp ?? "" }),
    });
  }, [subscribe, aoMudar]);

  const enviar = handleSubmit(async (dados) => {
    const erros = await aoEnviar({ clienteNome: dados.clienteNome, clienteWhatsapp: soDigitos(dados.clienteWhatsapp) });
    if (erros) {
      for (const [campo, mensagem] of Object.entries(erros)) {
        setError(campo as keyof DadosDoCliente, { message: mensagem }, { shouldFocus: true });
      }
    }
  });

  // registrar na ordem da tela: no erro, o foco vai para o primeiro campo de cima
  const campoNome = register("clienteNome");
  const campoWhatsapp = register("clienteWhatsapp");

  return (
    <form onSubmit={enviar} noValidate className="grid gap-6">
      <h2 className="text-h2">Seus dados</h2>
      <Campo rotulo="Seu nome" erro={errors.clienteNome?.message}>
        {(ids) => <Entrada {...ids} {...campoNome} autoComplete="name" enterKeyHint="next" />}
      </Campo>
      <Campo
        rotulo="WhatsApp"
        dica="Só para falar sobre este horário. Sem senha e sem criar conta."
        erro={errors.clienteWhatsapp?.message}
      >
        {(ids) => (
          <Entrada
            {...ids}
            {...campoWhatsapp}
            onChange={(evento) => {
              setValue("clienteWhatsapp", mascararWhatsapp(evento.target.value), { shouldValidate: Boolean(errors.clienteWhatsapp) });
            }}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            enterKeyHint="send"
            className="font-hora"
          />
        )}
      </Campo>
      <div className="grid gap-2">
        <Botao type="submit" largo carregando={isSubmitting} textoCarregando="Confirmando…" disabled={bloqueado}>
          Confirmar agendamento
        </Botao>
        {bloqueado && avisoBloqueado && <p className="text-pequeno text-tinta-suave">{avisoBloqueado}</p>}
      </div>
    </form>
  );
}
