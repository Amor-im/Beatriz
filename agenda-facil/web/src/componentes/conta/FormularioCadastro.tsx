"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { Campo, Entrada } from "@/componentes/Campo";
import { apiPainel, ErroDaApi } from "@/lib/api";
import { esquemaCadastro, type DadosDeCadastro } from "@/lib/esquemas";
import { mascararWhatsapp, soDigitos, sugerirSlug } from "@/lib/formatos";
import { linkPublicoSemProtocolo } from "@/lib/site";

import { CampoSenha } from "./CampoSenha";

type CampoDoCadastro = "nome" | "email" | "senha" | "negocio.nome" | "negocio.slug" | "negocio.whatsapp" | "negocio.endereco";

export function FormularioCadastro() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  // enquanto a pessoa não mexe no endereço do link, ele acompanha o nome do negócio
  const slugEditado = useRef(false);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DadosDeCadastro>({
    resolver: zodResolver(esquemaCadastro),
    mode: "onBlur",
    defaultValues: { nome: "", email: "", senha: "", negocio: { nome: "", slug: "", whatsapp: "", endereco: "" } },
  });
  const slug = useWatch({ control, name: "negocio.slug" });

  const cadastrar = handleSubmit(async (dados) => {
    setErro(null);
    try {
      await apiPainel.cadastrar({
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        negocio: {
          nome: dados.negocio.nome,
          slug: dados.negocio.slug,
          whatsapp: soDigitos(dados.negocio.whatsapp),
          endereco: dados.negocio.endereco || undefined,
        },
      });
      router.push("/painel?bemvindo=1");
    } catch (e) {
      if (!(e instanceof ErroDaApi)) {
        setErro("Algo deu errado. Tente de novo.");
        return;
      }
      // erros que pertencem a um campo aparecem embaixo dele
      const porCampo = Object.entries(e.erros) as [CampoDoCadastro, string][];
      if (porCampo.length > 0) {
        porCampo.forEach(([campo, mensagem], i) => setError(campo, { message: mensagem }, { shouldFocus: i === 0 }));
      } else if (e.status === 409 && e.message.includes("e-mail")) {
        setError("email", { message: e.message }, { shouldFocus: true });
      } else if ((e.status === 409 || e.status === 422) && e.message.includes("endereço")) {
        setError("negocio.slug", { message: e.message }, { shouldFocus: true });
      } else {
        setErro(e.message);
      }
    }
  });

  // registrar na ordem da tela: no erro, o foco vai para o primeiro campo de cima
  const campoNome = register("nome");
  const campoEmail = register("email");
  const campoSenha = register("senha");
  const campoNomeDoNegocio = register("negocio.nome");
  const campoSlug = register("negocio.slug");
  const campoWhatsapp = register("negocio.whatsapp");
  const campoEndereco = register("negocio.endereco");

  return (
    <form onSubmit={cadastrar} noValidate className="grid gap-8">
      {erro && (
        <Aviso tipo="erro" titulo="Não foi possível criar a conta" papel="alert">
          <p>{erro}</p>
        </Aviso>
      )}

      <fieldset className="grid gap-6">
        <legend className="mb-4 font-titulo text-h2 font-bold">Sobre você</legend>
        <Campo rotulo="Seu nome" erro={errors.nome?.message}>
          {(ids) => <Entrada {...ids} {...campoNome} autoComplete="name" />}
        </Campo>
        <Campo rotulo="E-mail" dica="É com ele que você entra no painel." erro={errors.email?.message}>
          {(ids) => <Entrada {...ids} {...campoEmail} type="email" inputMode="email" autoComplete="email" />}
        </Campo>
        <Campo rotulo="Senha" dica="Pelo menos 12 caracteres. Uma frase curta fica fácil de lembrar." erro={errors.senha?.message}>
          {(ids) => <CampoSenha {...ids} {...campoSenha} autoComplete="new-password" />}
        </Campo>
      </fieldset>

      <fieldset className="grid gap-6">
        <legend className="mb-4 font-titulo text-h2 font-bold">Seu negócio</legend>
        <Campo rotulo="Nome do negócio" erro={errors.negocio?.nome?.message}>
          {(ids) => (
            <Entrada
              {...ids}
              {...campoNomeDoNegocio}
              onChange={(evento) => {
                campoNomeDoNegocio.onChange(evento);
                if (!slugEditado.current) setValue("negocio.slug", sugerirSlug(evento.target.value));
              }}
              autoComplete="organization"
            />
          )}
        </Campo>
        <Campo
          rotulo="Endereço do seu link"
          dica={
            <>
              Seus clientes vão abrir: <strong className="break-all font-hora text-tinta">{linkPublicoSemProtocolo(slug || "seu-negocio")}</strong>
            </>
          }
          erro={errors.negocio?.slug?.message}
        >
          {(ids) => (
            <Entrada
              {...ids}
              {...campoSlug}
              onChange={(evento) => {
                slugEditado.current = true;
                campoSlug.onChange(evento);
              }}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="font-hora"
            />
          )}
        </Campo>
        <Campo rotulo="WhatsApp do negócio" dica="Aparece para o cliente tirar dúvidas e avisar que marcou." erro={errors.negocio?.whatsapp?.message}>
          {(ids) => (
            <Entrada
              {...ids}
              {...campoWhatsapp}
              onChange={(evento) => setValue("negocio.whatsapp", mascararWhatsapp(evento.target.value), { shouldValidate: Boolean(errors.negocio?.whatsapp) })}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(00) 00000-0000"
              className="font-hora"
            />
          )}
        </Campo>
        <Campo rotulo="Endereço do negócio" opcional dica="Aparece na confirmação, com o link “Como chegar”." erro={errors.negocio?.endereco?.message}>
          {(ids) => <Entrada {...ids} {...campoEndereco} autoComplete="street-address" />}
        </Campo>
      </fieldset>

      <Botao type="submit" largo carregando={isSubmitting} textoCarregando="Criando sua agenda…">
        Criar minha agenda
      </Botao>
      <p className="text-center text-tinta-suave">
        Já tem conta? <Link href="/entrar">Entrar</Link>
      </p>
    </form>
  );
}
