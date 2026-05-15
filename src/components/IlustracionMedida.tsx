import type { VistaIlustracion } from '../lib/medidas/catalogo';

type Props = { vista: VistaIlustracion; highlight: string };

// Paleta coherente con la app
const TRAZO = '#d8d0c4';
const RELLENO = '#fdf8ed';
const HL = '#7a2a3e';
const PT = '#a23827';

export default function IlustracionMedida({ vista, highlight }: Props) {
  return (
    <svg
      viewBox="0 0 200 360"
      className="w-full max-w-[220px] mx-auto"
      aria-hidden
      role="presentation"
    >
      {vista === 'frontal' && <SilFrontal hl={highlight} />}
      {vista === 'posterior' && <SilPosterior hl={highlight} />}
      {vista === 'lateral' && <SilLateral hl={highlight} />}
      {vista === 'brazo' && <SilBrazo hl={highlight} />}
    </svg>
  );
}

function SilFrontal({ hl }: { hl: string }) {
  return (
    <g fill={RELLENO} stroke={TRAZO} strokeWidth={1.2} strokeLinejoin="round">
      <circle cx={100} cy={35} r={18} />
      <path d="M 88 50 L 88 64 L 112 64 L 112 50 Z" />
      <path d="M 60 70 Q 100 60 140 70 L 145 110 Q 150 130 145 150 L 130 170 Q 125 200 130 230 L 145 260 L 55 260 L 70 230 Q 75 200 70 170 L 55 150 Q 50 130 55 110 Z" />
      <path d="M 60 70 L 35 110 L 30 180 L 38 180 L 50 110 Z" />
      <path d="M 140 70 L 165 110 L 170 180 L 162 180 L 150 110 Z" />
      <path d="M 70 260 L 65 350 L 90 350 L 95 260 Z" />
      <path d="M 130 260 L 135 350 L 110 350 L 105 260 Z" />

      {hl === 'busto' && <Hor y={130} x1={55} x2={145} />}
      {hl === 'cintura' && <Hor y={172} x1={70} x2={130} />}
      {hl === 'cadera' && <Hor y={228} x1={70} x2={130} />}
      {hl === 'cuello' && <Hor y={57} x1={88} x2={112} />}
      {hl === 'hombro_a_hombro' && <Hor y={70} x1={60} x2={140} flechas />}
      {hl === 'ancho_pecho' && <Hor y={100} x1={75} x2={125} flechas />}
      {hl === 'separacion_busto' && (
        <>
          <Dot x={86} y={125} />
          <Dot x={114} y={125} />
          <Hor y={125} x1={86} x2={114} flechas />
        </>
      )}
      {hl === 'talle_frente' && <Ver x={100} y1={64} y2={170} flechas />}
      {hl === 'centro_frente' && <Ver x={100} y1={66} y2={170} flechas />}
      {hl === 'hombro' && (
        <>
          <Dot x={88} y={64} />
          <Dot x={60} y={70} />
          <line x1={88} y1={64} x2={60} y2={70} stroke={HL} strokeWidth={3} strokeLinecap="round" />
        </>
      )}
      {hl === 'altura_busto' && <Ver x={94} y1={64} y2={125} flechas />}
      {hl === 'largo_blusa' && <Ver x={100} y1={64} y2={245} flechas />}
    </g>
  );
}

function SilPosterior({ hl }: { hl: string }) {
  return (
    <g fill={RELLENO} stroke={TRAZO} strokeWidth={1.2} strokeLinejoin="round">
      <circle cx={100} cy={35} r={18} />
      <path d="M 88 50 L 88 64 L 112 64 L 112 50 Z" />
      <path d="M 60 70 Q 100 60 140 70 L 145 110 Q 150 130 145 150 L 130 170 Q 125 200 130 230 L 145 260 L 55 260 L 70 230 Q 75 200 70 170 L 55 150 Q 50 130 55 110 Z" />
      <path d="M 60 70 L 35 110 L 30 180 L 38 180 L 50 110 Z" />
      <path d="M 140 70 L 165 110 L 170 180 L 162 180 L 150 110 Z" />
      <path d="M 70 260 L 65 350 L 90 350 L 95 260 Z" />
      <path d="M 130 260 L 135 350 L 110 350 L 105 260 Z" />
      <circle cx={100} cy={66} r={2.5} fill={TRAZO} stroke="none" />

      {hl === 'ancho_espalda' && <Hor y={105} x1={70} x2={130} flechas />}
      {hl === 'talle_atras' && <Ver x={100} y1={64} y2={170} flechas />}
      {hl === 'largo_espalda' && <Ver x={100} y1={66} y2={170} flechas />}
      {hl === 'centro_atras' && <Ver x={100} y1={66} y2={170} flechas />}
      {hl === 'largo_vestido' && <Ver x={100} y1={66} y2={345} flechas />}
    </g>
  );
}

function SilLateral({ hl }: { hl: string }) {
  return (
    <g fill={RELLENO} stroke={TRAZO} strokeWidth={1.2} strokeLinejoin="round">
      <circle cx={100} cy={35} r={18} />
      <path d="M 92 50 L 88 64 L 108 64 L 108 50 Z" />
      <path d="M 88 70 Q 130 90 130 130 Q 130 150 110 170 Q 100 195 110 215 Q 130 230 130 260 L 88 260 L 80 230 Q 82 200 80 170 Q 76 150 75 130 Q 78 90 88 70 Z" />
      <path d="M 100 75 L 95 180 L 105 180 L 110 75 Z" />
      <path d="M 95 260 L 90 350 L 115 350 L 120 260 Z" />

      {hl === 'costado' && <Ver x={80} y1={90} y2={170} flechas />}
      {hl === 'altura_cadera' && <Ver x={130} y1={170} y2={215} flechas />}
      {hl === 'largo_falda' && <Ver x={130} y1={170} y2={345} flechas />}
    </g>
  );
}

function SilBrazo({ hl }: { hl: string }) {
  return (
    <g fill={RELLENO} stroke={TRAZO} strokeWidth={1.2} strokeLinejoin="round">
      <circle cx={50} cy={50} r={14} />
      <path d="M 38 60 Q 30 95 35 130 L 55 130 Q 60 95 62 60 Z" />
      <path d="M 35 130 L 40 200 L 60 200 L 55 130 Z" />
      <ellipse cx={50} cy={210} rx={10} ry={5} />
      <path d="M 42 215 Q 45 245 55 250 Q 58 240 58 215 Z" />

      {hl === 'biceps' && <Hor y={90} x1={32} x2={62} flechas />}
      {hl === 'muneca' && <Hor y={210} x1={40} x2={60} flechas />}
      {hl === 'largo_manga' && <Ver x={50} y1={50} y2={210} flechas />}
    </g>
  );
}

function Hor({ y, x1, x2, flechas }: { y: number; x1: number; x2: number; flechas?: boolean }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={HL} strokeWidth={3} strokeLinecap="round" />
      {flechas && (
        <>
          <polygon points={`${x1},${y} ${x1 + 6},${y - 4} ${x1 + 6},${y + 4}`} fill={HL} stroke="none" />
          <polygon points={`${x2},${y} ${x2 - 6},${y - 4} ${x2 - 6},${y + 4}`} fill={HL} stroke="none" />
        </>
      )}
    </g>
  );
}

function Ver({ x, y1, y2, flechas }: { x: number; y1: number; y2: number; flechas?: boolean }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={HL} strokeWidth={3} strokeLinecap="round" />
      {flechas && (
        <>
          <polygon points={`${x},${y1} ${x - 4},${y1 + 6} ${x + 4},${y1 + 6}`} fill={HL} stroke="none" />
          <polygon points={`${x},${y2} ${x - 4},${y2 - 6} ${x + 4},${y2 - 6}`} fill={HL} stroke="none" />
        </>
      )}
    </g>
  );
}

function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3.5} fill={PT} stroke="none" />;
}
