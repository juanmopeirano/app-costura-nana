import type { VistaIlustracion } from '../lib/medidas/catalogo';

type Props = { vista: VistaIlustracion; highlight: string };

const TRAZO = '#7d6f60';
const TRAZO_SUTIL = '#c6bcae';
const HL = '#7a2a3e';
const PT = '#a23827';

export default function IlustracionMedida({ vista, highlight }: Props) {
  return (
    <svg
      viewBox="0 0 200 420"
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

/**
 * Croquis femenino frontal — estilo dibujo de patronaje.
 * Construido como contorno simétrico abierto (medio cuerpo derecho + espejo).
 */
function SilFrontal({ hl }: { hl: string }) {
  // Puntos clave (mitad derecha, x crece desde el centro 100)
  // y crece hacia abajo
  return (
    <g fill="none" stroke={TRAZO} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round">
      {/* Cabeza */}
      <ellipse cx={100} cy={28} rx={12} ry={15} />
      {/* Cuello */}
      <path d="M 93 41 L 92 56 M 107 41 L 108 56" />
      {/* Línea de hombros */}
      <path d="M 92 56 Q 100 54 108 56" />
      {/* Contorno del cuerpo (lado derecho) — usa Bezier para curvas femeninas suaves */}
      <path
        d="
          M 108 56
          Q 122 58 130 70
          Q 134 84 132 100
          Q 128 116 124 130
          Q 121 142 119 156
          Q 121 175 128 190
          Q 134 210 132 230
          Q 128 250 122 268
          L 117 300
          L 113 340
          L 108 405
          L 100 405
        "
      />
      {/* Espejo izquierdo */}
      <path
        d="
          M 92 56
          Q 78 58 70 70
          Q 66 84 68 100
          Q 72 116 76 130
          Q 79 142 81 156
          Q 79 175 72 190
          Q 66 210 68 230
          Q 72 250 78 268
          L 83 300
          L 87 340
          L 92 405
          L 100 405
        "
      />
      {/* Brazos colgando — lado derecho */}
      <path
        d="
          M 130 70
          Q 148 95 152 130
          Q 153 165 148 195
          L 142 195
          Q 147 165 146 130
          Q 143 95 124 75
        "
      />
      {/* Brazo izquierdo */}
      <path
        d="
          M 70 70
          Q 52 95 48 130
          Q 47 165 52 195
          L 58 195
          Q 53 165 54 130
          Q 57 95 76 75
        "
      />
      {/* Detalles internos: cuello escote, busto sugerido, cintura, cadera */}
      <path d="M 92 56 Q 100 64 108 56" stroke={TRAZO_SUTIL} />
      <path d="M 88 100 Q 100 108 112 100" stroke={TRAZO_SUTIL} strokeWidth={0.8} />
      <path d="M 81 156 Q 100 159 119 156" stroke={TRAZO_SUTIL} strokeWidth={0.7} />
      <path d="M 78 200 Q 100 203 122 200" stroke={TRAZO_SUTIL} strokeWidth={0.7} />
      {/* Pies sugeridos */}
      <ellipse cx={92} cy={408} rx={8} ry={3} stroke={TRAZO_SUTIL} />
      <ellipse cx={108} cy={408} rx={8} ry={3} stroke={TRAZO_SUTIL} />

      {/* === Highlights por id de medida === */}
      {hl === 'busto' && <Hor y={102} x1={67} x2={133} />}
      {hl === 'cintura' && <Hor y={158} x1={78} x2={122} />}
      {hl === 'cadera' && <Hor y={202} x1={68} x2={132} />}
      {hl === 'cuello' && <Hor y={48} x1={93} x2={107} />}
      {hl === 'hombro_a_hombro' && (
        <>
          <Dot x={92} y={56} />
          <Dot x={108} y={56} />
          <Hor y={56} x1={92} x2={108} flechas />
        </>
      )}
      {/* Ancho de pecho: abajo de la axila, antes del busto */}
      {hl === 'ancho_pecho' && <Hor y={85} x1={76} x2={124} flechas />}
      {hl === 'separacion_busto' && (
        <>
          <Dot x={89} y={98} />
          <Dot x={111} y={98} />
          <Hor y={98} x1={89} x2={111} flechas />
        </>
      )}
      {hl === 'talle_frente' && <Ver x={100} y1={56} y2={158} flechas />}
      {hl === 'centro_frente' && <Ver x={100} y1={56} y2={158} flechas />}
      {hl === 'hombro' && (
        <>
          <Dot x={100} y={52} />
          <Dot x={92} y={56} />
          <line x1={100} y1={52} x2={92} y2={56} stroke={HL} strokeWidth={3} />
        </>
      )}
      {hl === 'altura_busto' && <Ver x={92} y1={54} y2={98} flechas />}
      {hl === 'largo_blusa' && <Ver x={100} y1={56} y2={230} flechas />}
    </g>
  );
}

/** Vista posterior — igual contorno, sin marca de busto */
function SilPosterior({ hl }: { hl: string }) {
  return (
    <g fill="none" stroke={TRAZO} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round">
      {/* Cabeza con sugerencia de pelo */}
      <ellipse cx={100} cy={28} rx={12} ry={15} />
      <path d="M 88 28 Q 90 38 96 41" stroke={TRAZO_SUTIL} />
      <path d="M 112 28 Q 110 38 104 41" stroke={TRAZO_SUTIL} />
      <path d="M 93 41 L 92 56 M 107 41 L 108 56" />
      <path d="M 92 56 Q 100 58 108 56" />
      {/* Contorno (mismo que frontal) */}
      <path d="M 108 56 Q 122 58 130 70 Q 134 84 132 100 Q 128 116 124 130 Q 121 142 119 156 Q 121 175 128 190 Q 134 210 132 230 Q 128 250 122 268 L 117 300 L 113 340 L 108 405 L 100 405" />
      <path d="M 92 56 Q 78 58 70 70 Q 66 84 68 100 Q 72 116 76 130 Q 79 142 81 156 Q 79 175 72 190 Q 66 210 68 230 Q 72 250 78 268 L 83 300 L 87 340 L 92 405 L 100 405" />
      <path d="M 130 70 Q 148 95 152 130 Q 153 165 148 195 L 142 195 Q 147 165 146 130 Q 143 95 124 75" />
      <path d="M 70 70 Q 52 95 48 130 Q 47 165 52 195 L 58 195 Q 53 165 54 130 Q 57 95 76 75" />
      {/* Línea media de la espalda */}
      <line x1={100} y1={60} x2={100} y2={200} stroke={TRAZO_SUTIL} strokeWidth={0.7} strokeDasharray="2 2" />
      {/* Marca séptima cervical */}
      <circle cx={100} cy={58} r={1.8} fill={TRAZO} stroke="none" />
      <path d="M 81 156 Q 100 159 119 156" stroke={TRAZO_SUTIL} strokeWidth={0.7} />
      <ellipse cx={92} cy={408} rx={8} ry={3} stroke={TRAZO_SUTIL} />
      <ellipse cx={108} cy={408} rx={8} ry={3} stroke={TRAZO_SUTIL} />

      {/* Ancho de espalda: abajo de la axila, no en mitad de la espalda */}
      {hl === 'ancho_espalda' && <Hor y={85} x1={76} x2={124} flechas />}
      {hl === 'talle_atras' && <Ver x={100} y1={56} y2={158} flechas />}
      {hl === 'largo_espalda' && <Ver x={100} y1={58} y2={158} flechas />}
      {hl === 'centro_atras' && <Ver x={100} y1={58} y2={158} flechas />}
      {hl === 'largo_vestido' && <Ver x={100} y1={58} y2={400} flechas />}
    </g>
  );
}

/** Vista lateral — perfil con busto adelante, glúteo atrás */
function SilLateral({ hl }: { hl: string }) {
  return (
    <g fill="none" stroke={TRAZO} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx={92} cy={28} rx={11} ry={14} />
      <path d="M 90 42 Q 89 50 90 56 L 102 56 Q 104 50 102 42" />
      {/* Frente */}
      <path
        d="
          M 90 56
          Q 102 64 108 78
          Q 116 94 116 110
          Q 112 130 106 145
          Q 100 165 100 180
          Q 102 200 110 215
          Q 110 245 105 280
          Q 102 320 102 405
        "
      />
      {/* Atrás */}
      <path
        d="
          M 102 56
          Q 86 62 82 80
          Q 78 105 78 130
          Q 80 155 84 175
          Q 86 195 88 210
          Q 90 240 84 280
          Q 82 320 82 405
        "
      />
      {/* Pierna inferior */}
      <line x1={82} y1={405} x2={102} y2={405} />
      {/* Brazo */}
      <path
        d="
          M 95 60
          Q 92 90 92 130
          Q 94 165 96 190
          L 102 190
          Q 100 165 100 130
          Q 100 90 102 60
        "
      />
      <ellipse cx={92} cy={408} rx={11} ry={3} stroke={TRAZO_SUTIL} />

      {hl === 'costado' && <Ver x={76} y1={84} y2={158} flechas />}
      {hl === 'altura_cadera' && <Ver x={120} y1={160} y2={215} flechas />}
      {hl === 'largo_falda' && <Ver x={120} y1={160} y2={400} flechas />}
      {hl === 'tiro' && <Ver x={108} y1={158} y2={215} flechas />}
      {hl === 'rodilla' && <Hor y={310} x1={84} x2={106} flechas />}
      {hl === 'bota' && <Hor y={400} x1={86} x2={104} flechas />}
      {hl === 'largo_pantalon' && <Ver x={120} y1={158} y2={400} flechas />}
    </g>
  );
}

/** Vista del brazo / manga */
function SilBrazo({ hl }: { hl: string }) {
  return (
    <g fill="none" stroke={TRAZO} strokeWidth={1.3} strokeLinejoin="round" strokeLinecap="round">
      {/* Hombro */}
      <ellipse cx={75} cy={50} rx={16} ry={11} />
      {/* Brazo */}
      <path
        d="
          M 60 56
          Q 54 95 56 135
          Q 58 175 62 210
          Q 66 235 70 255
          L 88 255
          Q 92 235 96 210
          Q 100 175 102 135
          Q 104 95 92 56
        "
      />
      {/* Codo sugerido */}
      <path d="M 60 140 Q 79 145 100 140" stroke={TRAZO_SUTIL} strokeWidth={0.8} />
      {/* Muñeca */}
      <ellipse cx={79} cy={257} rx={11} ry={4} stroke={TRAZO_SUTIL} />
      {/* Mano */}
      <path d="M 70 260 Q 75 290 88 290 Q 92 280 94 260" stroke={TRAZO_SUTIL} />

      {hl === 'biceps' && <Hor y={100} x1={52} x2={104} flechas />}
      {hl === 'muneca' && <Hor y={257} x1={66} x2={94} flechas />}
      {hl === 'largo_manga' && <Ver x={79} y1={50} y2={257} flechas />}
    </g>
  );
}

function Hor({ y, x1, x2, flechas }: { y: number; x1: number; x2: number; flechas?: boolean }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={HL} strokeWidth={2.5} strokeLinecap="round" />
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
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={HL} strokeWidth={2.5} strokeLinecap="round" />
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
  return <circle cx={x} cy={y} r={2.5} fill={PT} stroke="none" />;
}
