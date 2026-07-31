import { useMemo } from 'react';
import type { Patron, Pieza } from '../lib/patrones/tipos';
import { offsetPolilineaCerrada } from '../lib/patrones/offset';
import { pathDesdePuntos } from '../lib/patrones/geometria';

type Props = {
  patron: Patron;
  mostrarMargen?: boolean;
  margen?: number;
};

export default function PatronPreview({ patron, mostrarMargen = true, margen = 1 }: Props) {
  const layout = useMemo(
    () => calcularLayout(patron.piezas, 2, mostrarMargen ? margen : 0),
    [patron.piezas, mostrarMargen, margen],
  );

  return (
    <div className="rounded-2xl border border-baya-100 bg-crema-50 shadow-paper overflow-hidden">
      <div className="bg-crema-100/60 border-b border-baya-100 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-tinta-700 flex flex-wrap gap-x-3 gap-y-1">
          <Leyenda color="#1f2937">contorno</Leyenda>
          {mostrarMargen && (
            <Leyenda color="#7a2a3e" dashed>
              margen {margen}cm
            </Leyenda>
          )}
          <Leyenda color="#b78a4a" dashed>
            hilo
          </Leyenda>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-tinta-500">
          grilla = 5 cm
        </span>
      </div>
      <div className="p-2 bg-paper-grid bg-grid-cm">
        <svg
          viewBox={`${layout.x} ${layout.y} ${layout.w} ${layout.h}`}
          className="w-full h-auto"
          style={{ maxHeight: '70vh' }}
        >
          {layout.piezas.map((p, i) => (
            <g key={i} transform={`translate(${p.tx},${p.ty})`}>
              <path
                d={p.pieza.contornoPath}
                fill="white"
                stroke="#1f2937"
                strokeWidth={0.15}
                strokeLinejoin="round"
              />
              {mostrarMargen && (
                <path
                  d={p.corte}
                  fill="none"
                  stroke="#7a2a3e"
                  strokeWidth={0.12}
                  strokeDasharray="0.5 0.4"
                />
              )}
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
              <line
                x1={p.pieza.hilo.a.x}
                y1={p.pieza.hilo.a.y}
                x2={p.pieza.hilo.b.x}
                y2={p.pieza.hilo.b.y}
                stroke="#b78a4a"
                strokeWidth={0.12}
                strokeDasharray="1 1"
              />
              {p.pieza.piquetes.map((punto, k) => (
                <circle key={k} cx={punto.x} cy={punto.y} r={0.4} fill="#a23827" />
              ))}
              <text
                x={p.pieza.bbox.x + p.pieza.bbox.w / 2}
                y={p.pieza.bbox.y + p.pieza.bbox.h / 2}
                textAnchor="middle"
                fontSize="2.4"
                fill="#2a252060"
                fontFamily="Fraunces, Georgia, serif"
                fontStyle="italic"
              >
                {p.pieza.nombre}
              </text>
              <text
                x={p.pieza.bbox.x + p.pieza.bbox.w / 2}
                y={p.pieza.bbox.y + p.pieza.bbox.h / 2 + 3}
                textAnchor="middle"
                fontSize="1.5"
                fill="#2a252050"
              >
                cortar {p.pieza.cantidad}× {p.pieza.cortarSobreDoblez ? 'sobre doblez' : ''}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function Leyenda({
  color,
  dashed,
  children,
}: {
  color: string;
  dashed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="20" height="6" className="inline-block">
        <line
          x1={0}
          y1={3}
          x2={20}
          y2={3}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={dashed ? '3 2' : undefined}
        />
      </svg>
      <span className="text-tinta-700">{children}</span>
    </span>
  );
}

function calcularLayout(piezas: Pieza[], sep: number, margen: number) {
  let cursorX = 0;
  let totalH = 0;
  const acomodadas = piezas.map((pieza) => {
    const tx = cursorX - pieza.bbox.x;
    const ty = -pieza.bbox.y;
    cursorX += pieza.bbox.w + sep + 2 * margen;
    totalH = Math.max(totalH, pieza.bbox.h);
    return {
      pieza,
      tx,
      ty,
      corte: pathDesdePuntos(offsetPolilineaCerrada(pieza.contornoPuntos, margen), true),
    };
  });
  const borde = 2 + margen;
  return {
    piezas: acomodadas,
    x: -borde,
    y: -borde,
    w: cursorX - sep + 2 * borde,
    h: totalH + 2 * borde,
  };
}
