"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { Campo, Entrada } from "@/componentes/Campo";
import { apiPainel, ErroDaApi } from "@/lib/api";
import { esquemaEntrar, type DadosDeEntrar } from "@/lib/esquemas";
import { destinoSeguro } from "@/lib/site";

import { CampoSenha } from "./CampoSenha";

export function FormularioEntrar() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosDeEntrar>({ resolver: zodResolver(esquemaEntrar), mode: "onBlur" });

  const entrar = handleSubmit(async (dados) => {
    setErro(null);
    try {
      await apiPainel.entrar(dados);
      router.push(destinoSeguro(parametros.get("voltar")));
    } catch (e) {
      setErro(e instanceof ErroDaApi ? e.message : "Algo deu errado. Tente de novo.");
    }
  });

  return (
    <form onSubmit={entrar} noValidate className="grid gap-6">
      {erro && (
        <Aviso tipo="erro" titulo="Não foi possível entrar" papel="alert">
          <p>{erro}</p>
        </Aviso>
      )}
      <Campo rotulo="E-mail" erro={errors.email?.message}>
        {(ids) => <Entrada {...ids} {...register("email")} type="email" autoComplete="email" inputMode="email" enterKeyHint="next" />}
      </Campo>
      <Campo rotulo="Senha" erro={errors.senha?.message}>
        {(ids) => <CampoSenha {...ids} {...register("senha")} autoComplete="current-password" enterKeyHint="go" />}
      </Campo>
      <Botao type="submit" largo carregando={isSubmitting} textoCarregando="Entrando…">
        Entrar
      </Botao>
      <p className="text-center text-tinta-suave">
        Ainda não tem conta? <Link href="/cadastro">Criar minha agenda</Link>
      </p>
    </form>
  );
}
