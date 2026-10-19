"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Aviso } from "@/componentes/Aviso";
import { Botao, LinkBotao } from "@/componentes/Botao";
import { Campo, Entrada } from "@/componentes/Campo";
import { useToast } from "@/componentes/Toast";
import { apiPainel, ErroDaApi } from "@/lib/api";
import { esquemaNegocio, type DadosDoNegocio } from "@/lib/esquemas";
import { linkWhatsapp, mascararWhatsapp, soDigitos } from "@/lib/formatos";
import { linkPublico, linkPublicoSemProtocolo } from "@/lib/site";

import { BotaoCopiarLink } from "../BotaoCopiarLink";
import { CabecalhoDaTela } from "../CabecalhoDaTela";
import { useSessao } from "../Sessao";

/** O link público para compartilhar e os dados do negócio. */
export function TelaMeuLink() {
  const { sessao, recarregarSessao } = useSessao();
  const { negocio } = sessao;
  const mostrarToast = useToast();
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DadosDoNegocio>({
    resolver: zodResolver(esquemaNegocio),
    defaultValues: {
      nome: negocio.nome,
      slug: negocio.slug,
      whatsapp: mascararWhatsapp(negocio.whatsapp),
      endereco: negocio.endereco ?? "",
    },
  });
  const slugNovo = useWatch({ control, name: "slug" });

  const salvar = handleSubmit(async (dados) => {
    setErro(null);
    try {
      await apiPainel.salvarNegocio({ ...dados, whatsapp: soDigitos(dados.whatsapp), endereco: dados.endereco || undefined });
      reset(dados);
      mostrarToast("Dados do negócio salvos");
      recarregarSessao();
    } catch (e) {
      if (e instanceof ErroDaApi && (e.status === 409 || e.status === 422) && e.message.includes("endereço")) {
        setError("slug", { message: e.message }, { shouldFocus: true });
        return;
      }
      setErro(e instanceof ErroDaApi ? e.message : "Algo deu errado. Tente de novo.");
    }
  });

  const convite = `Agora você pode marcar seu horário em ${negocio.nome} pelo link: ${linkPublico(negocio.slug)}`;
  // registrar na ordem da tela: no erro, o foco vai para o primeiro campo de cima
  const campoNome = register("nome");
  const campoSlug = register("slug");
  const campoWhatsapp = register("whatsapp");
  const campoEndereco = register("endereco");

  return (
    <main id="conteudo" className="grid max-w-3xl gap-8 p-4 lg:p-8">
      <CabecalhoDaTela titulo="Meu link" descricao="Mande este link para os clientes, coloque na bio do Instagram ou no status do WhatsApp." />

      <section aria-labelledby="titulo-link" className="grid gap-4 rounded-g bg-superficie p-6 shadow-2">
        <h2 id="titulo-link" className="font-texto text-pequeno font-bold uppercase tracking-[0.08em] text-tinta-suave">
          Seu link de agendamento
        </h2>
        <p className="break-all font-hora text-h2 font-semibold">
          <span className="bg-marca-texto px-1">{linkPublicoSemProtocolo(negocio.slug)}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <BotaoCopiarLink slug={negocio.slug} />
          <LinkBotao href={linkPublico(negocio.slug)} variante="secundario" icone="abrir-externo" externo>
            Abrir minha página
          </LinkBotao>
          <LinkBotao href={`https://wa.me/?text=${encodeURIComponent(convite)}`} variante="secundario" icone="mensagem" externo>
            Enviar no WhatsApp
          </LinkBotao>
        </div>
      </section>

      <section aria-labelledby="titulo-dados" className="grid gap-4">
        <h2 id="titulo-dados">Dados do negócio</h2>
        <form onSubmit={salvar} noValidate className="grid gap-5 rounded-g border-[1.5px] border-linha bg-superficie p-4 shadow-1 md:p-6">
          {erro && (
            <Aviso tipo="erro" titulo="Não foi possível salvar" papel="alert">
              <p>{erro}</p>
            </Aviso>
          )}
          <Campo rotulo="Nome do negócio" erro={errors.nome?.message}>
            {(ids) => <Entrada {...ids} {...campoNome} autoComplete="organization" />}
          </Campo>
          <Campo
            rotulo="Endereço do link"
            dica={slugNovo !== negocio.slug ? "Atenção: ao salvar, o link antigo para de funcionar." : `Fica assim: ${linkPublicoSemProtocolo(slugNovo || negocio.slug)}`}
            erro={errors.slug?.message}
          >
            {(ids) => <Entrada {...ids} {...campoSlug} autoCapitalize="none" autoCorrect="off" spellCheck={false} className="font-hora" />}
          </Campo>
          <Campo rotulo="WhatsApp do negócio" erro={errors.whatsapp?.message}>
            {(ids) => (
              <Entrada
                {...ids}
                {...campoWhatsapp}
                onChange={(evento) => setValue("whatsapp", mascararWhatsapp(evento.target.value), { shouldDirty: true, shouldValidate: Boolean(errors.whatsapp) })}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                className="font-hora"
              />
            )}
          </Campo>
          <Campo rotulo="Endereço" opcional erro={errors.endereco?.message}>
            {(ids) => <Entrada {...ids} {...campoEndereco} autoComplete="street-address" />}
          </Campo>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <a href={linkWhatsapp(negocio.whatsapp, "Teste do link do Agenda Fácil")} target="_blank" rel="noopener noreferrer" className="text-pequeno">
              Testar o WhatsApp
            </a>
            <Botao type="submit" carregando={isSubmitting} textoCarregando="Salvando…" disabled={!isDirty}>
              Salvar dados
            </Botao>
          </div>
        </form>
      </section>
    </main>
  );
}
