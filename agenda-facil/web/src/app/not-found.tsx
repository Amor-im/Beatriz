import { LinkBotao } from "@/componentes/Botao";
import { EstadoVazio } from "@/componentes/Estados";

export default function NaoEncontrado() {
  return (
    <main id="conteudo" className="mx-auto grid max-w-cliente gap-6 px-4 py-16">
      <EstadoVazio titulo="Página não encontrada" icone="link" acao={<LinkBotao href="/" variante="secundario">Ir para o início</LinkBotao>}>
        <p>Confira se o link foi digitado certo. Se recebeu de um negócio, peça o link de novo pelo WhatsApp.</p>
      </EstadoVazio>
    </main>
  );
}
