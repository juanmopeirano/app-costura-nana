import type { Escote, Medidas, Punto } from '../tipos';
import { bezierCuadratica } from '../geometria';

export type FormaEscote = {
  /** Punto en el hombro donde empieza el escote */
  externo: Punto;
  /** Punto más profundo del escote en el centro */
  profundo: Punto;
  /** Puntos intermedios entre externo y profundo (suficientes para una curva fluida) */
  puntosIntermedios: Punto[];
};

export type LadoCorpino = 'delantero' | 'espalda';

const N_CURVA = 8;

export function formaEscote(
  m: Medidas,
  lado: LadoCorpino,
  escote: Escote,
): FormaEscote {
  const ancho = anchoEscote(m, lado, escote);
  const prof = profundidadEscote(m, lado, escote);
  const externo: Punto = { x: ancho, y: 0 };
  const profundo: Punto = { x: 0, y: prof };

  switch (escote) {
    case 'cuadrado': {
      // Línea recta horizontal en el fondo, esquinas vivas
      const esquina: Punto = { x: ancho, y: prof };
      return {
        externo,
        profundo,
        puntosIntermedios: [esquina],
      };
    }
    case 'v': {
      // Línea recta del externo al profundo
      return { externo, profundo, puntosIntermedios: [] };
    }
    case 'barco': {
      // Curva suave amplia con poca profundidad
      const ctrl: Punto = { x: ancho * 0.7, y: prof * 0.3 };
      return {
        externo,
        profundo,
        puntosIntermedios: muestrearBezier(externo, ctrl, profundo),
      };
    }
    case 'bebe': {
      // Redondo más pronunciado (curva más cerrada)
      const ctrl: Punto = { x: ancho * 0.5, y: prof * 0.85 };
      return {
        externo,
        profundo,
        puntosIntermedios: muestrearBezier(externo, ctrl, profundo),
      };
    }
    case 'camisero':
    case 'nehru':
    case 'redondo':
    default: {
      // Curva clásica suave
      const ctrl: Punto = { x: ancho, y: prof * 0.85 };
      return {
        externo,
        profundo,
        puntosIntermedios: muestrearBezier(externo, ctrl, profundo),
      };
    }
  }
}

function muestrearBezier(a: Punto, ctrl: Punto, b: Punto): Punto[] {
  const out: Punto[] = [];
  for (let i = 1; i < N_CURVA; i++) {
    out.push(bezierCuadratica(a, ctrl, b, i / N_CURVA));
  }
  return out;
}

function anchoEscote(m: Medidas, lado: LadoCorpino, escote: Escote): number {
  const base = lado === 'espalda' ? m.cuello / 5 + 0.3 : Math.max(1, m.cuello / 5 - 0.5);
  switch (escote) {
    case 'barco':
      // Mucho más ancho hacia el hombro
      return Math.min(base + 6, (lado === 'espalda' ? m.anchoEspalda : m.anchoPecho) / 2 - 3);
    case 'cuadrado':
      return base + 2;
    case 'bebe':
      return base + 0.5;
    case 'v':
    case 'camisero':
    case 'nehru':
    case 'redondo':
    default:
      return base;
  }
}

function profundidadEscote(m: Medidas, lado: LadoCorpino, escote: Escote): number {
  if (lado === 'espalda') {
    // Espalda casi siempre 2-3cm (excepto V o cuadrado pueden ser más)
    switch (escote) {
      case 'v':
        return 6;
      case 'cuadrado':
        return 4;
      default:
        return 2.5;
    }
  }
  // Delantero
  const base = m.cuello / 5 + 1.5;
  switch (escote) {
    case 'v':
      return Math.min(20, base + 8);
    case 'cuadrado':
      return base + 5;
    case 'barco':
      return Math.max(base - 1, 2);
    case 'bebe':
      return base + 1;
    case 'camisero':
      return base + 3;
    case 'nehru':
      return base + 0.5;
    case 'redondo':
    default:
      return base + 1.5;
  }
}
