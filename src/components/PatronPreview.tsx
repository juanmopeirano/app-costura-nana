import { useMemo } from 'react';
import type { Patron, Pieza } from '../lib/patrones/tipos';

type Props = {
  patron: Patron;
  mostrarMargen?: boolean;
  margen?: number; // cm
};

export default function PatronPreview({ patron, mostrarMargen = true, margen = 1 }: Props) {
  const layout = useMemo(() => calcularLayout(patron.piezas, 2), [patron.piezas]);

  return (
    <div className="card !p-2">
      <svg
        viewBox={`${layout.minX - 2} ${layout.minY - 2} ${layout.w + 4} ${layout.h + 4}`}
        className="w-full h-auto bg-marfil rounded"
        style={{ maxHeight: '70vh' }}
      >
        {/* Grilla de referencia cada 5cm */}
        <Grilla minX={layout.minX} minY={layout.minY} w={layout.w} h={layout.h} />

        {layout.piezas.map((p, i) => (
          <g key={i} transform={`translate(${p.tx},${p.ty})`}>
            {/* contorno principal */}
            <path
              d={p.pieza.contornoPath}
              fill="white"
              stroke="#1f2937"
              strokeWidth={0.15}
              strokeLinejoin="round"
            />
            {/* margen de costura (offset visual) */}
            {mostrarMargen && (
              <path
                d={p.pieza.contornoPath}
                fill="none"
                stroke="#bd3a5e"
                strokeWidth={0.08}
                strokeDasharray="0.4 0.4"
                transform={`translate(0,0)`}
                style={{ filter: `drop-shadow(0 0 ${margen}px #bd3a5e44)` }}
              />
            )}
            {/* pinzas */}
            {p.pieza.pinzas.map((linea, j) => (
              <line
                key={j}
                x1={linea.a.x}
                y1={linea.a.y}
                x2={linea.b.x}
                y2={linea.b.y}
                stroke="#1f2937"
                strokeWidth={0.12}
              />
            ))}
            {/* dirección de hilo */}
            <line
              x1={p.pieza.hilo.a.x}
              y1={p.pieza.hilo.a.y}
              x2={p.pieza.hilo.b.x}
              y2={p.pieza.hilo.b.y}
              stroke="#9c2a4a"
              strokeWidth={0.12}
              strokeDasharray="1 1"
            />
            {/* piquetes */}
            {p.pieza.piquetes.map((punto, k) => (
              <circle key={k} cx={punto.x} cy={punto.y} r={0.4} fill="#9c2a4a" />
            ))}
            {/* nombre y cantidad */}
            <text
              x={p.pieza.bbox.x + p.pieza.bbox.w / 2}
              y={p.pieza.bbox.y + p.pieza.bbox.h / 2}
              textAnchor="middle"
              fontSize="2.4"
              fill="#1f293760"
              fontFamily="Inter, sans-serif"
            >
              {p.pieza.nombre}
            </text>
            <text
              x={p.pieza.bbox.x + p.pieza.bbox.w / 2}
              y={p.pieza.bbox.y + p.pieza.bbox.h / 2 + 3}
              textAnchor="middle"
              fontSize="1.6"
              fill="#1f293760"
            >
              cortar {p.pieza.cantidad}× {p.pieza.cortarSobreDoblez ? 'sobre doblez' : ''}
            </text>
          </g>
        ))}
      </svg>
      <div className="text-xs text-tinta/50 mt-1 flex flex-wrap gap-3 px-1">
        <Leyenda color="#1f2937">contorno</Leyenda>
        {mostrarMargen && <Leyenda color="#bd3a5e" dashed>margen de costura</Leyenda>}
        <Leyenda color="#9c2a4a" dashed>línea de hilo</Leyenda>
        <Leyenda color="#1f2937" thick>pinza</Leyenda>
        <span className="ml-auto">grilla = 5 cm</span>
      </div>
    </div>
  );
}

function Grilla({ minX, minY, w, h }: { minX: number; minY: number; w: number; h: number }) {
  const lineas: React.ReactNode[] = [];
  const xStart = Math.floor(minX / 5) * 5;
  const yStart = Math.floor(minY / 5) * 5;
  for (let x = xStart; x <= minX + w; x += 5) {
    lineas.push(
      <line key={`v${x}`} x1={x} y1={minY - 2} x2={x} y2={minY + h + 2} stroke="#f5f0e6" strokeWidth={0.1} />,
    );
  }
  for (let y = yStart; y <= minY + h; y += 5) {
    lineas.push(
      <line key={`h${y}`} x1={minX - 2} y1={y} x2={minX + w + 2} y2={y} stroke="#f5f0e6" strokeWidth={0.1} />,
    );
  }
  return <g>{lineas}</g>;
}

function Leyenda({ color, dashed, thick, children }: { color: string; dashed?: boolean; thick?: boolean; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <svg width="20" height="6" className="inline-block">
        <line
          x1={0}
          y1={3}
          x2={20}
          y2={3}
          stroke={color}
          strokeWidth={thick ? 2 : 1}
          strokeDasharray={dashed ? '3 2' : undefined}
        />
      </svg>
      {children}
    </span>
  );
}

// Acomoda las piezas en una grilla horizontal con `sep` cm de separación.
function calcularLayout(piezas: Pieza[], sep: number) {
  let cursorX = 0;
  let totalH = 0;
  const acomodadas = piezas.map((pieza) => {
    const tx = cursorX - pieza.bbox.x;
    const ty = -pieza.bbox.y;
    cursorX += pieza.bbox.w + sep;
    totalH = Math.max(totalH, pieza.bbox.h);
    return { pieza, tx, ty };
  });
  return {
    piezas: acomodadas,
    minX: -2,
    minY: -2,
    w: cursorX,
    h: totalH,
  };
}
