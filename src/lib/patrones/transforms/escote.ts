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

// Profundidad del escote base, derivada de las medidas del cuerpo tal como lo
// hace el manual SENA (pp.21-25):
//
//   profundidad cuello espalda   = talle atrás  - centro atrás
//   profundidad cuello delantero = talle frente - centro frente
//
// Ambas medidas arrancan en la misma línea superior del trazado: el talle llega
// hasta el hombro y el centro hasta la base del cuello, así que la diferencia
// es exactamente cuánto baja el escote. Para la talla 8 SENA da 42-40=2cm atrás
// y 44-36.75=7.25cm adelante.
function profundidadBase(m: Medidas, lado: LadoCorpino): number {
  if (lado === 'espalda') {
    const medido = m.talleAtras - m.centroAtras;
    return medido > 0.5 && medido < 8 ? medido : 2;
  }
  const medido = m.talleFrente - m.centroFrente;
  return medido > 2 && medido < 20 ? medido : m.cuello / 5 + 1.5;
}

function profundidadEscote(m: Medidas, lado: LadoCorpino, escote: Escote): number {
  const base = profundidadBase(m, lado);
  if (lado === 'espalda') {
    // La espalda arranca del escote base y sólo se profundiza en los diseños
    // que lo piden explícitamente.
    switch (escote) {
      case 'v':
        return base + 3.5;
      case 'cuadrado':
        return base + 1.5;
      default:
        return base;
    }
  }
  // Delantero. El redondo es el escote del patrón base: no lleva agregado.
  switch (escote) {
    case 'v':
      return Math.min(22, base + 9);
    case 'cuadrado':
      return base + 5;
    case 'barco':
      return Math.max(base - 3, 2);
    case 'bebe':
      return base + 1;
    case 'camisero':
      return base + 3;
    case 'nehru':
      return base + 0.5;
    case 'redondo':
    default:
      return base;
  }
}
