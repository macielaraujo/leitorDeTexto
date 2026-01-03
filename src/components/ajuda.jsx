export default function Ajuda() {
  return (
    <section className="mt-8" aria-labelledby="titulo-texto">
      <h2
        id="titulo-texto"
        className="text-xl font-bold text-slate-800 mb-4 flex items-center"
      >
        <FileText className="w-5 h-5 mr-2 text-slate-500" aria-hidden="true" />
        Informações de uso
      </h2>
      <div
        className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-h-96 overflow-y-auto text-lg leading-relaxed text-slate-700 text-left focus:outline-none focus:ring-4 focus:ring-blue-200"
        tabIndex="0"
        aria-label="Texto extraído do documento"
      >
        <p className="whitespace-pre-line">texto</p>
      </div>
    </section>
  );
}
