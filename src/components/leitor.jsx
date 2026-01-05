import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  Upload,
  Play,
  Square,
  Loader2,
  FileText,
  Volume2,
  HelpCircle,
  FolderClosed,
  X,
  Keyboard,
  MousePointer2,
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function LeitorAcessivel() {
  const [texto, setTexto] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fileName, setFileName] = useState("");
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const synth = synthRef.current;
    const checkSpeaking = setInterval(() => {
      setIsSpeaking(synth.speaking);
    }, 500);

    return () => {
      clearInterval(checkSpeaking);
      synth.cancel();
    };
  }, []);

  const lerArquivo = async (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    setIsLoading(true);
    setFileName(arquivo.name);
    synthRef.current.cancel();

    try {
      let textoExtraido = "";
      if (arquivo.type === "application/pdf") {
        const arrayBuffer = await arquivo.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const pagina = await pdf.getPage(i);
          const conteudo = await pagina.getTextContent();
          const strings = conteudo.items.map((item) => item.str);
          textoExtraido += strings.join(" ") + "\n \n";
        }
      } else {
        textoExtraido = await arquivo.text();
      }

      setTexto(textoExtraido);
      prepararLeitura(textoExtraido);
    } catch (error) {
      console.error("Erro ao ler arquivo:", error);
      setTexto("Erro ao processar o arquivo. Por favor, tente outro.");
    } finally {
      setIsLoading(false);
    }
  };

  const prepararLeitura = (textoParaLer) => {
    const utterance = new SpeechSynthesisUtterance(textoParaLer);
    utterance.lang = "pt-BR";
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onstart = () => setIsSpeaking(true);
    utteranceRef.current = utterance;
    synthRef.current.speak(utteranceRef.current);
  };

  const alternarLeitura = () => {
    if (synthRef.current.speaking) {
      if (synthRef.current.paused) {
        synthRef.current.resume();
      } else {
        synthRef.current.pause();
      }
    } else if (texto) {
      synthRef.current.speak(utteranceRef.current);
    }
  };

  const pararLeitura = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center font-sans">
      {showHelp && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white z-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2
                id="modal-title"
                className="text-2xl font-bold text-slate-900 flex items-center gap-2"
              >
                <HelpCircle className="text-blue-600" /> Guia de Acessibilidade
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Fechar guia"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <div className="p-8 space-y-6 text-slate-700">
              <section>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 mb-3">
                  <Keyboard className="w-5 h-5 text-blue-500" /> Navegação por
                  Teclado
                </h3>
                <ul className="text-left list-disc ml-5 space-y-2">
                  <li>
                    Use a tecla <strong>Tab</strong> para saltar entre botões e
                    campos e <strong>Shift + Tab</strong> para retornar entre os
                    botões.
                  </li>
                  <li>
                    Pressione <strong>Enter</strong> ou <strong>Espaço</strong>{" "}
                    para ativar as opções.
                  </li>
                  <li>
                    As setas do teclado permitem ler o texto extraído após este
                    ser processado.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 mb-3">
                  <FolderClosed className="w-5 h-5 text-blue-500" /> Como
                  carregar um documento
                </h3>
                <ul className="text-left list-disc ml-5 space-y-2">
                  <li>
                    Navegue com a tecla <strong>Tab</strong> até ouvir o leitor
                    de tela dizer: "Carregar arquivo para leitura".
                  </li>
                  <li>
                    Pressione <strong>Enter</strong> ou <strong>Espaço</strong>.
                    Uma janela do seu computador se abrirá.
                  </li>
                  <li>
                    Escolha um arquivo <strong>PDF</strong> ou{" "}
                    <strong>TXT</strong> e confirme.
                  </li>
                  <li>
                    <strong>Aguarde um instante:</strong> O sistema processará o
                    arquivo automaticamente. Você ouvirá um aviso sonoro ou a
                    leitura do texto começará assim que o processamento
                    terminar.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 mb-3">
                  <Volume2 className="w-5 h-5 text-blue-500" /> Controlos de Voz
                </h3>
                <p>
                  Após carregar um arquivo (PDF ou TXT), a leitura iniciará
                  automaticamente. Pode usar os botões{" "}
                  <strong>"Pausar/Retomar"</strong> ou <strong>"Parar"</strong>{" "}
                  para controlar o áudio.
                </p>
              </section>

              <section className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-bold text-blue-900 mb-2">
                  Dica para Leitores de Ecrã:
                </h3>
                <p className="text-blue-800 text-sm italic">
                  "Este site utiliza regiões de anúncio em tempo real
                  (aria-live). Será notificado automaticamente sobre o estado do
                  processamento sem precisar de navegar pela página."
                </p>
              </section>
            </div>

            <div className="p-6 border-t border-slate-100 text-center">
              <button
                onClick={() => setShowHelp(false)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all w-full sm:w-auto"
              >
                Entendido, vamos começar
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="max-w-3xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <header className="text-center border-b border-slate-100 pb-6 relative">
          <img
            src="/brasao1_horizontal_cor_72dpi.png"
            alt="Brasão UFC"
            className=" h-12 mb-14"
          />
          <div className="flex justify-center mb-4 ">
            <div className="p-3 bg-blue-100 rounded-full">
              {/* <Volume2 className="w-8 h-8 text-blue-600" aria-hidden="true" /> */}
              <img src="/favicon.ico" alt="logo" className="w-14" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            VoxLegere
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Carregue um documento (PDF ou TXT) e nós o leremos para você.
          </p>
          <button
            onClick={() => setShowHelp(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all w-full sm:w-auto my-5 hover:cursor-pointer"
          >
            Acessar Guia de uso
          </button>
        </header>

        {/* Área de Upload */}
        <section>
          <label
            htmlFor="file-upload"
            className={`relative group flex flex-col items-center justify-center w-full h-48 border-3 border-dashed rounded-xl transition-all cursor-pointer
              ${
                isLoading
                  ? "border-blue-300 bg-blue-50 cursor-wait"
                  : "border-slate-300 hover:border-blue-500 hover:bg-blue-50 focus-within:ring-4 focus-within:ring-blue-200 focus-within:border-blue-500"
              }
            `}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                document.getElementById("file-upload").click();
              }
            }}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              {isLoading ? (
                <>
                  <Loader2
                    className="w-12 h-12 text-blue-600 animate-spin mb-4"
                    aria-hidden="true"
                  />
                  <p
                    className="text-lg text-blue-700 font-medium"
                    aria-live="polite"
                  >
                    Processando documento, aguarde...
                  </p>
                </>
              ) : (
                <>
                  <Upload
                    className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mb-4 transition-colors"
                    aria-hidden="true"
                  />
                  <p className="text-lg text-slate-700 font-medium mb-2">
                    <span className="text-blue-600 font-bold underline decoration-2 underline-offset-2">
                      Clique para carregar
                    </span>{" "}
                    ou arraste o arquivo aqui.
                  </p>
                  <p className="text-sm text-slate-500">
                    Suporta PDF ou arquivos de texto simples (.txt)
                  </p>
                  {fileName && (
                    <div className="mt-4 flex items-center text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                      <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                      Arquivo selecionado: {fileName}
                    </div>
                  )}
                </>
              )}
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.txt,text/plain,application/pdf"
              onChange={lerArquivo}
              disabled={isLoading}
              className="sr-only"
              aria-label="Carregar arquivo para leitura"
            />
          </label>
        </section>

        {/* Controles de Reprodução (só aparecem se houver texto) */}
        {texto && !isLoading && (
          <section
            className="flex flex-wrap items-center justify-center gap-4 p-6 bg-slate-100 rounded-xl border border-slate-200"
            aria-label="Controles de leitura"
          >
            <button
              onClick={alternarLeitura}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95"
            >
              {isSpeaking ? (
                <Play className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Play className="w-6 h-6" aria-hidden="true" />
              )}
              {isSpeaking ? "Pausar / Retomar" : "Ler Documento"}
            </button>

            <button
              onClick={pararLeitura}
              disabled={!isSpeaking}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="w-6 h-6" aria-hidden="true" />
              Parar
            </button>
          </section>
        )}

        {/* Área de Texto para quem tem baixa visão */}
        {texto && !isLoading && (
          <section className="mt-8" aria-labelledby="titulo-texto">
            <h2
              id="titulo-texto"
              className="text-xl font-bold text-slate-800 mb-4 flex items-center"
            >
              <FileText
                className="w-5 h-5 mr-2 text-slate-500"
                aria-hidden="true"
              />
              Conteúdo do Documento
            </h2>
            <div
              className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-h-96 overflow-y-auto text-lg leading-relaxed text-slate-700 text-left focus:outline-none focus:ring-4 focus:ring-blue-200"
              tabIndex="0"
              aria-label="Texto extraído do documento"
            >
              <p className="whitespace-pre-line">{texto}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
