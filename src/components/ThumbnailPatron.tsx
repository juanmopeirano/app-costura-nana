import type { Patron, Pieza } from '../lib/patrones/tipos';

type Props = { patron: Patron };

export default function ThumbnailPatron({ patron }: Props) {
  const layout = calcular(patron.piezas);

  return (
    <svg
      viewBox={`${layout.minX - 2} ${layout.minY - 2} ${layout.w + 4} ${layout.h + 4}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {layout.piezas.map((p, i) => (
        <g key={i} transform={`translate(${p.tx},${p.ty})`}>
          <path
            d={p.pieza.contornoPath}
            fill="white"
            stroke="#1f2937"
            strokeWidth={0.3}
            strokeLinejoin="round"
          />
          {p.pieza.pinzas.map((linea, j) => (
            <line
              key={j}
              x1={linea.a.x}
              y1={linea.a.y}
              x2={linea.b.x}
              y2={linea.b.y}
              stroke="#1f2937"
              strokeWidth={0.2}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

function calcular(piezas: Pieza[]) {
  let cursor = 0;
  let maxH = 0;
  const sep = 2;
  const acomodadas = piezas.map((pieza) => {
    const tx = cursor - pieza.bbox.x;
    const ty = -pieza.bbox.y;
    cursor += pieza.bbox.w + sep;
    maxH = Math.max(maxH, pieza.bbox.h);
    return { pieza, tx, ty };
  });
  return { piezas: acomodadas, minX: 0, minY: 0, w: cursor - sep, h: maxH };
}
