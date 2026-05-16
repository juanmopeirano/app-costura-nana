import { Link } from 'react-router-dom';
import { IconArrowRight, IconCamera, IconDownload, IconRuler } from '../components/Icon';
import { CarreteOrn, PuntadasDivider } from '../components/Ornamento';

export default function Inicio() {
  return (
    <div className="space-y-14">
      <Hero />
      <PuntadasDivider label="cómo funciona" />
      <ComoFunciona />
      <PuntadasDivider label="prendas disponibles" />
      <PrendasDisponibles />
    </div>
  );
}

function Hero() {
  return (
    <section className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 text-baya-700">
          <CarreteOrn className="text-baya-600" />
          <span className="eyebrow">Patrones a medida · gratis</span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl text-tinta-900 leading-[1.05] text-balance">
          Costura que te queda{' '}
          <span className="italic text-baya-700">como un guante</span>.
        </h1>
        <p className="text-tinta-700 text-lg max-w-lg text-balance">
          Tomá tus medidas con guía paso a paso, elegí qué querés coser y
          descargá tu patrón listo para imprimir en hojas A4. Todo desde el
          celular, sin cuenta ni servidores.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/medidas/nueva" className="btn-primary">
            Empezar con mis medidas
            <IconArrowRight size={16} />
          </Link>
          <Link to="/nuevo" className="btn-outline">
            Ver el editor
          </Link>
        </div>
      </div>
      <HeroIlustracion />
    </section>
  );
}

function HeroIlustracion() {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 -z-10 rounded-3xl bg-paper-grid bg-grid-cm opacity-50"
        aria-hidden
      />
      <svg
        viewBox="0 0 360 360"
        className="w-full max-w-lg mx-auto"
        aria-hidden
      >
        {/* Fondo papel + grid sutil */}
        <defs>
          <pattern id="puntos" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx={1} cy={1} r={0.6} fill="#7a2a3e" opacity={0.12} />
          </pattern>
        </defs>
        <rect width={360} height={360} fill="url(#puntos)" rx={20} />

        {/* Pieza patron: corpiño delantero */}
        <g
          transform="translate(60 30)"
          fill="#fefcf7"
          stroke="#2a2520"
          strokeWidth={1.3}
          strokeLinejoin="round"
        >
          <path
            d="M 0 18
               Q 6 6 18 4
               L 30 0
               L 70 0
               L 82 4
               Q 94 6 100 18
               L 110 60
               Q 115 90 110 130
               L 116 170
               L 116 240
               L 12 240
               L -8 240
               L -8 170
               L 0 130
               Q -5 90 0 60 Z"
          />
          {/* Línea de hilo */}
          <line
            x1={50}
            y1={20}
            x2={50}
            y2={230}
            stroke="#b78a4a"
            strokeDasharray="4 3"
            strokeWidth={0.9}
          />
          {/* Pinzas */}
          <line x1={32} y1={150} x2={38} y2={90} strokeWidth={0.9} />
          <line x1={44} y1={150} x2={38} y2={90} strokeWidth={0.9} />
          <line x1={68} y1={150} x2={62} y2={90} strokeWidth={0.9} />
          <line x1={56} y1={150} x2={62} y2={90} strokeWidth={0.9} />
          {/* Sisa marca */}
          <circle cx={108} cy={70} r={2} fill="#7a2a3e" stroke="none" />
          <circle cx={-8} cy={70} r={2} fill="#7a2a3e" stroke="none" />
          {/* Costura del contorno (margen) */}
          <path
            d="M -4 18
               Q 2 2 16 0
               L 28 -4
               L 72 -4
               L 84 0
               Q 98 2 104 18
               L 114 60
               Q 119 90 114 130
               L 120 170
               L 120 244
               L -12 244
               L -12 170
               L -4 130
               Q -9 90 -4 60 Z"
            fill="none"
            stroke="#7a2a3e"
            strokeWidth={0.6}
            strokeDasharray="2 2"
          />
        </g>

        {/* Cinta métrica decorativa */}
        <g transform="translate(8 280)">
          <path
            d="M 0 12 Q 60 -8 140 12 T 320 16"
            fill="none"
            stroke="#b78a4a"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <path
            d="M 0 12 Q 60 -8 140 12 T 320 16"
            fill="none"
            stroke="#fefcf7"
            strokeWidth={4}
            strokeDasharray="0.5 8"
            strokeLinecap="round"
          />
        </g>

        {/* Tijera pequeña */}
        <g transform="translate(280 70) rotate(20)" stroke="#7a2a3e" strokeWidth={1.6} fill="none" strokeLinecap="round">
          <circle cx={6} cy={36} r={6} />
          <circle cx={18} cy={36} r={6} />
          <path d="M 9 32 L 30 6" />
          <path d="M 16 32 L 30 6" strokeOpacity={0.7} />
        </g>
      </svg>
    </div>
  );
}

function ComoFunciona() {
  const pasos = [
    {
      icon: <IconRuler size={22} />,
      n: '01',
      titulo: 'Medite con calma',
      texto:
        'Te llevamos por 23 medidas corporales con ilustración y descripción para cada una. Las guardamos en este dispositivo así no las repetís.',
    },
    {
      icon: <IconCamera size={22} />,
      n: '02',
      titulo: 'Elegí tu prenda',
      texto:
        'Top, blusa, pollera o vestido. Subí una foto de referencia y elegí escote, manga, largo, ajuste, tela y cierre.',
    },
    {
      icon: <IconDownload size={22} />,
      n: '03',
      titulo: 'Imprimí y cosé',
      texto:
        'PDF A4 a escala 1:1, con cuadro de calibración, margen de costura, piquetes, dirección de hilo y nombre de piezas.',
    },
  ];
  return (
    <section className="grid md:grid-cols-3 gap-4">
      {pasos.map((p) => (
        <article key={p.n} className="card-stitched group hover:shadow-paper-lg transition">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-3xl text-baya-200 group-hover:text-baya-300 transition">
              {p.n}
            </span>
            <span className="text-baya-700 bg-baya-50 rounded-full p-2">{p.icon}</span>
          </div>
          <h3 className="font-display text-2xl text-tinta-900 mb-1.5">{p.titulo}</h3>
          <p className="text-sm text-tinta-700 leading-relaxed">{p.texto}</p>
        </article>
      ))}
    </section>
  );
}

function PrendasDisponibles() {
  const prendas = [
    { e: '👚', n: 'Top', d: 'Cropped con escote y manga a elección' },
    { e: '👕', n: 'Blusa', d: 'Manga corta, 3/4 o larga' },
    { e: '🩱', n: 'Pollera', d: 'Recta, A-line, sirena o con vuelo' },
    { e: '👗', n: 'Vestido', d: 'Corpiño + falda en cuatro piezas' },
    { e: '👖', n: 'Pantalón', d: 'Clásico con tiro, rodilla y bota' },
  ];
  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {prendas.map((p) => (
          <div
            key={p.n}
            className="rounded-2xl bg-crema-50 border border-baya-100 p-4 text-center shadow-paper hover:-translate-y-0.5 hover:shadow-paper-lg transition"
          >
            <div className="text-4xl mb-2">{p.e}</div>
            <div className="font-display text-lg text-tinta-900">{p.n}</div>
            <div className="text-xs text-tinta-600 mt-1">{p.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
