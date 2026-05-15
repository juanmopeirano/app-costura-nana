import { Link } from 'react-router-dom';

export default function Inicio() {
  return (
    <div className="space-y-8">
      <section className="text-center pt-8 pb-4">
        <h1 className="font-display text-4xl sm:text-5xl text-rosa-700 mb-3">
          Patrones de costura a tu medida
        </h1>
        <p className="text-tinta/70 max-w-xl mx-auto">
          Tomá tus medidas con guía paso a paso, elegí la prenda que querés y descargá
          tu patrón listo para imprimir en A4.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link to="/medidas/nueva" className="btn-primary">Empezar con mis medidas</Link>
          <Link to="/nuevo" className="btn-outline">Crear un patrón</Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        <Card emoji="📏" title="1. Tus medidas">
          Guía visual con 20 medidas corporales explicadas paso a paso. Las guardamos
          en este dispositivo para que no las tengas que escribir de nuevo.
        </Card>
        <Card emoji="✂️" title="2. Tu diseño">
          Elegí top, blusa, pollera o vestido. Subí una foto de referencia y respondé
          unas preguntas sobre escote, manga, largo, tela y ajuste.
        </Card>
        <Card emoji="🖨️" title="3. Tu patrón">
          PDF A4 imprimible con escala 1:1, márgenes de costura, piquetes,
          dirección de hilo y cuadro de calibración.
        </Card>
      </section>

      <section className="card">
        <h2 className="font-display text-2xl text-rosa-700 mb-2">Prendas disponibles</h2>
        <p className="text-tinta/70 text-sm mb-4">
          Primera versión enfocada en prendas simples de costura femenina.
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { e: '👚', n: 'Top' },
            { e: '👕', n: 'Blusa' },
            { e: '👗', n: 'Vestido' },
            { e: '🩱', n: 'Pollera' },
          ].map((p) => (
            <li key={p.n} className="rounded-xl border border-rosa-100 bg-rosa-50/50 p-3 text-center">
              <div className="text-3xl mb-1">{p.e}</div>
              <div className="font-medium">{p.n}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Card({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="text-3xl mb-2">{emoji}</div>
      <h3 className="font-semibold text-tinta mb-1">{title}</h3>
      <p className="text-sm text-tinta/70">{children}</p>
    </div>
  );
}
