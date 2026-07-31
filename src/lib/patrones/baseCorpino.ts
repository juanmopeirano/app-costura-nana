import type { Diseno, Medidas, Pieza, Punto } from './tipos';
import { bbox, bezierCuadratica, bezierCubica, distancia, pathDesdePuntos } from './geometria';
import { desahogos } from './holgura';
import { formaEscote } from './transforms/escote';

// Trazado del corpiño femenino siguiendo el PATRÓN BASE del manual SENA
// "Patronaje Básico e Interpretación de Diseños" (2011), pasos 1 a 5, pp.21-25.
//
// Sistema de coordenadas (un cuarto de cuerpo; el panel se corta sobre doblez):
//   - x = 0 en el centro (centro atrás o centro frente), x crece hacia el costado
//   - y = 0 en la línea superior del trazado (altura de la base del cuello)
//   - y crece hacia abajo
//
// Todos los puntos salen de medidas reales, como en el manual:
//
//   ancho de cuello espalda    = cuello/5 + 0.3          (p.21)
//   ancho de cuello delantero  = cuello/5 - 0.5          (p.23)
//   caída de hombro            = 4 cm                    (pp.21 y 23)
//   largo de costura de hombro = medida de hombro        (pp.21 y 23)
//   profundidad de sisa        = talle atrás - costado
//   ancho del molde al busto   = busto/4 + desahogo/4    (pp.21 y 23)
//   la sisa pasa por           = ancho espalda/2 atrás, ancho pecho/2 adelante (p.22 y p.24)
//   ápice del busto            = (separación busto/2, prof. sisa + 5cm)        (p.24)
//   costado                    = Δ + 1cm con 2cm de salida al ruedo            (pp.22 y 24)
//
// La sisa NO es una curva inventada: pasa obligatoriamente por el punto de
// ancho de espalda / ancho de pecho y termina en la axila. De ahí sale su largo
// real, que es lo que después dimensiona la cabeza de manga (ver baseManga.ts).

export type LargoCorpino = 'top' | 'blusa' | 'vestido_cintura';

export type OpcionesCorpino = {
  largo: LargoCorpino;
  largoPrenda?: number;
};

export type LadoCorpino = 'delantero' | 'espalda';

const CAIDA_HOMBRO = 4;

/** Salida del costado en el ruedo respecto de la cintura (pp.22 y 24). */
const SALIDA_RUEDO = 2;

/** Muestras por tramo de curva. Suficientes para medir largos con precisión. */
const N = 14;

// --- medidas derivadas -----------------------------------------------------

/**
 * Profundidad de sisa: distancia de la línea superior a la línea de axila.
 * El manual la marca como "línea de profundidad de sisa" (p.25) y la deja
 * definida por el costado: el costado es lo que va de la axila a la cintura,
 * así que lo que queda arriba es talle - costado. Talla 8: 42 - 19 = 23cm.
 */
export function profundidadSisa(m: Medidas, d: Diseno): number {
  const desah = desahogos(d.ajuste, d.tela);
  const medido = m.talleAtras - m.costado;
  const base = medido > 10 && medido < 35 ? medido : m.talleAtras / 2 + 1;
  return base + desah.busto / 8;
}

/**
 * Largo de la costura de hombro. El manual usa la medida de hombro directa
 * ("Medida de Hombro" en pp.21 y 23). Si no está cargada, se reconstruye desde
 * hombro-a-hombro y, en último caso, desde el ancho de espalda.
 */
function largoHombro(m: Medidas): number {
  if (m.hombro > 5 && m.hombro < 25) return m.hombro;
  if (m.hombroAHombro > 20) return (m.hombroAHombro - m.cuello / 2.5) / 2;
  return Math.max(8, m.anchoEspalda / 2 - m.cuello / 5 + 2);
}

// --- construcción de la sisa ----------------------------------------------

export type Sisa = {
  /** Punta del hombro, donde arranca la sisa. */
  hombro: Punto;
  /** Punto de ancho de espalda / ancho de pecho por donde pasa la sisa. */
  referencia: Punto;
  /** Punto de axila, donde la sisa se encuentra con el costado. */
  axila: Punto;
  /** Curva completa del hombro a la axila (incluye ambos extremos). */
  curva: Punto[];
  /** Largo total de la curva, en cm. */
  largo: number;
  /** Largo desde el hombro hasta el punto de referencia, en cm. */
  largoHastaReferencia: number;
};

/**
 * Altura de la línea de ancho de espalda / ancho de pecho, como fracción del
 * tramo que va de la punta del hombro a la axila. Medido sobre los trazados
 * del manual: 0.44 en la espalda (p.22) y 0.57 en el delantero (p.24). La
 * espalda la lleva más alta porque su sisa es más recta.
 */
const FRACCION_LINEA_ANCHO: Record<LadoCorpino, number> = {
  espalda: 0.44,
  delantero: 0.57,
};

export function construirSisa(m: Medidas, d: Diseno, lado: LadoCorpino): Sisa {
  const desah = desahogos(d.ajuste, d.tela);
  const bP = m.busto / 4 + desah.busto / 4;
  const profSisa = profundidadSisa(m, d);

  const esc = formaEscote(m, lado, d.escote);
  const dxHombro = Math.sqrt(Math.max(1, largoHombro(m) ** 2 - CAIDA_HOMBRO ** 2));
  const hombro: Punto = { x: esc.externo.x + dxHombro, y: CAIDA_HOMBRO };

  const anchoCuerpo = lado === 'espalda' ? m.anchoEspalda : m.anchoPecho;
  // La sisa tiene que quedar por dentro de la axila, si no la curva se degenera.
  const anchoRef = Math.min(anchoCuerpo / 2 + desah.busto / 8, bP - 1.5);
  const yRef = CAIDA_HOMBRO + (profSisa - CAIDA_HOMBRO) * FRACCION_LINEA_ANCHO[lado];
  const referencia: Punto = { x: anchoRef, y: yRef };
  const axila: Punto = { x: bP, y: profSisa };

  // Tramo 1 (hombro -> ancho de espalda/pecho): casi recto, con una leve
  // entrada hacia el centro.
  const ctrl1: Punto = {
    x: (hombro.x + referencia.x) / 2 - 0.3,
    y: (hombro.y + referencia.y) / 2,
  };
  const tramo1: Punto[] = [];
  for (let i = 0; i <= N; i++) {
    tramo1.push(bezierCuadratica(hombro, ctrl1, referencia, i / N));
  }

  // Tramo 2 (ancho -> axila): el valle cóncavo de la sisa.
  const dx = axila.x - referencia.x;
  const dy = axila.y - referencia.y;
  const c1: Punto = { x: referencia.x + dx * 0.08, y: referencia.y + dy * 0.45 };
  const c2: Punto = { x: referencia.x + dx * 0.45, y: axila.y };
  const tramo2: Punto[] = [];
  for (let i = 1; i <= N; i++) {
    tramo2.push(bezierCubica(referencia, c1, c2, axila, i / N));
  }

  const curva = [...tramo1, ...tramo2];
  return {
    hombro,
    referencia,
    axila,
    curva,
    largo: largoPolilinea(curva),
    largoHastaReferencia: largoPolilinea(tramo1),
  };
}

function largoPolilinea(p: Punto[]): number {
  let s = 0;
  for (let i = 1; i < p.length; i++) s += distancia(p[i - 1], p[i]);
  return s;
}

/** Largos de sisa delantera y trasera: lo que dimensiona la cabeza de manga. */
export function largosSisa(m: Medidas, d: Diseno) {
  return {
    frente: construirSisa(m, d, 'delantero'),
    espalda: construirSisa(m, d, 'espalda'),
  };
}

// --- panel del corpiño -----------------------------------------------------

function anchoPinzaCintura(m: Medidas, holguraCintura: number, espalda: boolean): number {
  const bP = m.busto / 4;
  const cP = m.cintura / 4 + holguraCintura / 4;
  const diff = Math.max(0, bP - cP);
  return espalda
    ? Math.max(0.5, Math.min(3.5, diff))
    : Math.max(0.5, Math.min(2.5, diff * 0.8));
}

function bordeInferiorX(
  cinturaX: number,
  cuartoCadera: number,
  alturaCadera: number,
  largoBajoCintura: number,
): number {
  if (largoBajoCintura <= 0) return cinturaX;
  const t = Math.min(1, largoBajoCintura / Math.max(1, alturaCadera));
  return cinturaX + (cuartoCadera - cinturaX) * t;
}

function largoTotal(m: Medidas, opts: OpcionesCorpino, espalda: boolean): number {
  const talle = espalda ? m.talleAtras : m.talleFrente;
  switch (opts.largo) {
    case 'vestido_cintura':
      return talle;
    case 'top':
      return Math.min(opts.largoPrenda ?? talle + 10, talle + 30);
    case 'blusa':
      return opts.largoPrenda ?? m.largoBlusa;
  }
}

export function corpinoEspalda(m: Medidas, d: Diseno, opts: OpcionesCorpino): Pieza {
  const desah = desahogos(d.ajuste, d.tela);
  const cP = m.cintura / 4 + desah.cintura / 4;
  const cdP = m.cadera / 4 + desah.cadera / 4;
  const largoPanel = largoTotal(m, opts, true);
  const talleAtras = m.talleAtras;

  const esc = formaEscote(m, 'espalda', d.escote);
  const sisa = construirSisa(m, d, 'espalda');

  const anchoPinza = anchoPinzaCintura(m, desah.cintura, true);
  const costadoCinturaX = cP + anchoPinza;
  const costadoCintura: Punto = { x: costadoCinturaX, y: talleAtras };

  const largoBajoCintura = largoPanel - talleAtras;
  const costadoFinalX =
    largoBajoCintura > 0.01
      ? bordeInferiorX(costadoCinturaX, cdP, m.alturaCadera, largoBajoCintura)
      : costadoCinturaX + SALIDA_RUEDO;
  const costadoFinal: Punto = { x: costadoFinalX, y: largoPanel };
  const centroFinal: Punto = { x: 0, y: largoPanel };
  const centroCintura: Punto = { x: 0, y: talleAtras };

  // Pinza de cintura de la espalda, centrada entre el centro y el costado (p.25).
  const cinturaCentroX = costadoCinturaX / 2;
  const pinzaA: Punto = { x: cinturaCentroX + anchoPinza / 2, y: talleAtras };
  const pinzaB: Punto = { x: cinturaCentroX - anchoPinza / 2, y: talleAtras };
  const pinzaPunta: Punto = { x: cinturaCentroX, y: talleAtras - 13 };

  const contorno: Punto[] = [];
  contorno.push(esc.profundo);
  contorno.push(...[...esc.puntosIntermedios].reverse());
  contorno.push(esc.externo);
  contorno.push(...sisa.curva);
  if (largoBajoCintura > 0.01) {
    contorno.push(costadoFinal);
    contorno.push(centroFinal);
  } else {
    contorno.push(costadoCintura);
    contorno.push(pinzaA);
    contorno.push(pinzaPunta);
    contorno.push(pinzaB);
    contorno.push(centroCintura);
  }

  return {
    nombre: 'Espalda',
    cantidad: 1,
    cortarSobreDoblez: true,
    contornoPuntos: contorno,
    contornoPath: pathDesdePuntos(contorno, true),
    // El piquete de la sisa va en el punto de ancho de espalda: es el que casa
    // con el piquete de la cabeza de manga.
    piquetes: [sisa.referencia, { x: 0, y: talleAtras }],
    hilo: { a: { x: 1.5, y: 5 }, b: { x: 1.5, y: largoPanel - 3 } },
    pinzas:
      largoBajoCintura <= 0.01
        ? [
            { a: pinzaA, b: pinzaPunta },
            { a: pinzaB, b: pinzaPunta },
          ]
        : [],
    bbox: bbox([
      esc.profundo,
      esc.externo,
      sisa.hombro,
      sisa.referencia,
      sisa.axila,
      costadoCintura,
      costadoFinal,
      centroFinal,
    ]),
  };
}

export function corpinoDelantero(m: Medidas, d: Diseno, opts: OpcionesCorpino): Pieza {
  const desah = desahogos(d.ajuste, d.tela);
  const bP = m.busto / 4 + desah.busto / 4;
  const cP = m.cintura / 4 + desah.cintura / 4;
  const cdP = m.cadera / 4 + desah.cadera / 4;
  const profSisa = profundidadSisa(m, d);
  const largoPanel = largoTotal(m, opts, false);
  const talleFrente = m.talleFrente;

  const esc = formaEscote(m, 'delantero', d.escote);
  const sisa = construirSisa(m, d, 'delantero');

  const anchoPinza = anchoPinzaCintura(m, desah.cintura, false);
  const costadoCinturaX = cP + anchoPinza;
  const costadoCintura: Punto = { x: costadoCinturaX, y: talleFrente };

  const largoBajoCintura = largoPanel - talleFrente;
  const costadoFinalX =
    largoBajoCintura > 0.01
      ? bordeInferiorX(costadoCinturaX, cdP, m.alturaCadera, largoBajoCintura)
      : costadoCinturaX + SALIDA_RUEDO;
  const costadoFinal: Punto = { x: costadoFinalX, y: largoPanel };
  const centroFinal: Punto = { x: 0, y: largoPanel };
  const centroCintura: Punto = { x: 0, y: talleFrente };

  // Ápice del busto: media separación de busto de ancho (p.24). En altura, el
  // manual lo pone 5cm bajo la línea de sisa, pero si tenemos la altura de busto
  // medida usamos esa, que es la misma referencia (baja desde la línea superior)
  // y es propia del cuerpo en vez de un valor de tabla.
  const apiceY =
    m.alturaBusto > profSisa && m.alturaBusto < profSisa + 15
      ? m.alturaBusto
      : profSisa + 5;
  const apice: Punto = { x: m.separacionBusto / 2, y: apiceY };

  // Pinza de busto en el costado. Su valor es exactamente la diferencia entre
  // el talle frente y el talle atrás: es el largo de más que tiene el delantero
  // por el relieve del busto, y es lo que hace que los dos costados terminen
  // midiendo igual.
  const pinzaBustoAncho = Math.max(1, Math.min(5, m.talleFrente - m.talleAtras));
  const pinzaBA: Punto = { x: bP, y: apice.y - pinzaBustoAncho / 2 };
  const pinzaBB: Punto = { x: bP, y: apice.y + pinzaBustoAncho / 2 };
  // La pinza apunta al ápice desde el costado (horizontal) y se corta 2cm antes,
  // que es lo que se hace para que no quede un pico marcado sobre el busto.
  const pinzaBPunta: Punto = { x: Math.min(apice.x + 2, bP - 1), y: apice.y };

  // Pinza de cintura del delantero, alineada con el ápice del busto (p.25).
  const cinturaCentroX = Math.min(apice.x, costadoCinturaX - 2);
  const pinzaA: Punto = { x: cinturaCentroX + anchoPinza / 2, y: talleFrente };
  const pinzaB: Punto = { x: cinturaCentroX - anchoPinza / 2, y: talleFrente };
  const pinzaPunta: Punto = { x: cinturaCentroX, y: apice.y + 2 };

  const contorno: Punto[] = [];
  contorno.push(esc.profundo);
  contorno.push(...[...esc.puntosIntermedios].reverse());
  contorno.push(esc.externo);
  contorno.push(...sisa.curva);
  if (largoBajoCintura > 0.01) {
    contorno.push(costadoFinal);
    contorno.push(centroFinal);
  } else {
    contorno.push(costadoCintura);
    contorno.push(pinzaA);
    contorno.push(pinzaPunta);
    contorno.push(pinzaB);
    contorno.push(centroCintura);
  }

  return {
    nombre: 'Delantero',
    cantidad: 1,
    cortarSobreDoblez: true,
    contornoPuntos: contorno,
    contornoPath: pathDesdePuntos(contorno, true),
    piquetes: [sisa.referencia, { x: 0, y: talleFrente }],
    hilo: { a: { x: 1.5, y: 5 }, b: { x: 1.5, y: largoPanel - 3 } },
    pinzas: [
      { a: pinzaBA, b: pinzaBPunta },
      { a: pinzaBB, b: pinzaBPunta },
      ...(largoBajoCintura <= 0.01
        ? [
            { a: pinzaA, b: pinzaPunta },
            { a: pinzaB, b: pinzaPunta },
          ]
        : []),
    ],
    bbox: bbox([
      esc.profundo,
      esc.externo,
      sisa.hombro,
      sisa.referencia,
      sisa.axila,
      costadoCintura,
      costadoFinal,
      centroFinal,
    ]),
  };
}
