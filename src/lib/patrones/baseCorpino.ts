import type { Diseno, Medidas, Pieza, Punto } from './tipos';
import { bbox, bezierCuadratica, pathDesdePuntos } from './geometria';
import { desahogos } from './holgura';
import { formaEscote } from './transforms/escote';

// Cuartos del corpiño femenino siguiendo el método SENA (pp.21-25) con
// correcciones para asegurar una sisa cómoda y curvas femeninas correctas.
//
// Sistema de coordenadas:
//   - x = 0 en el lomo (centro espalda / delantero)
//   - x crece hacia el costado
//   - y = 0 en la séptima cervical / base del cuello frontal
//   - y crece hacia abajo

export type LargoCorpino = 'top' | 'blusa' | 'vestido_cintura';

export type OpcionesCorpino = {
  largo: LargoCorpino;
  largoPrenda?: number;
};

// Profundidad de sisa (vertical desde el hombro hasta el punto medio del costado
// a la altura del busto). Combinamos las dos fórmulas clásicas y tomamos la
// más generosa para asegurar espacio para el brazo.
function profundidadSisa(m: Medidas): number {
  const f1 = m.talleAtras / 2 + 1; // método sastre
  const f2 = m.busto / 10 + 11; // método continental
  return Math.max(f1, f2);
}

// Caída del hombro: cuánto baja el hombro respecto a la línea horizontal de
// la séptima cervical. Espalda algo menos que el delantero.
const CAIDA_HOMBRO_ESPALDA = 4;
const CAIDA_HOMBRO_DELANTERO = 4.5;

// Curva de sisa con dos controles (Bezier cúbico aproximado con dos
// cuadráticos): más profunda (más cóncava hacia adentro) para que haya espacio
// real para el brazo.
function curvaSisa(superior: Punto, costado: Punto, atras: boolean): Punto[] {
  const dx = costado.x - superior.x;
  const dy = costado.y - superior.y;
  // Control 1: cerca del hombro, baja un poco y se mueve hacia el costado
  const c1: Punto = atras
    ? { x: superior.x + dx * 0.55, y: superior.y + dy * 0.15 }
    : { x: superior.x + dx * 0.6, y: superior.y + dy * 0.18 };
  // Punto medio de la curva: el "valle" de la sisa (cóncavo)
  const medio: Punto = atras
    ? { x: superior.x + dx * 0.78, y: superior.y + dy * 0.55 }
    : { x: superior.x + dx * 0.7, y: superior.y + dy * 0.55 };
  // Control 2: justo encima del costado, baja casi recto
  const c2: Punto = { x: costado.x - 0.5, y: superior.y + dy * 0.85 };

  const N = 8;
  const tramo1: Punto[] = [];
  for (let i = 1; i < N; i++) {
    tramo1.push(bezierCuadratica(superior, c1, medio, i / N));
  }
  const tramo2: Punto[] = [];
  for (let i = 1; i < N; i++) {
    tramo2.push(bezierCuadratica(medio, c2, costado, i / N));
  }
  return [...tramo1, medio, ...tramo2];
}

function anchoPinzaCintura(
  m: Medidas,
  holguraCintura: number,
  espalda: boolean,
): number {
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
  const bP = m.busto / 4 + desah.busto / 4;
  const cP = m.cintura / 4 + desah.cintura / 4;
  const cdP = m.cadera / 4 + desah.cadera / 4;
  const profSisa = profundidadSisa(m);
  const largoPanel = largoTotal(m, opts, true);
  const talleAtras = m.talleAtras;

  const esc = formaEscote(m, 'espalda', d.escote);

  // Hombro: usa ancho_espalda como guía (mitad). Para escote barco, podemos
  // ir más allá pero acotado al máximo razonable.
  const hombroX = Math.max(esc.externo.x + 2, m.anchoEspalda / 2);
  const hombroExt: Punto = { x: hombroX, y: CAIDA_HOMBRO_ESPALDA };

  // El punto de sisa en el costado está a la altura de la profundidad de sisa.
  const costadoSisa: Punto = { x: bP, y: profSisa };

  const anchoPinza = anchoPinzaCintura(m, desah.cintura, true);
  const costadoCinturaX = cP + anchoPinza;
  const costadoCintura: Punto = { x: costadoCinturaX, y: talleAtras };

  const largoBajoCintura = largoPanel - talleAtras;
  const costadoFinalX = bordeInferiorX(
    costadoCinturaX,
    cdP,
    m.alturaCadera,
    largoBajoCintura,
  );
  const costadoFinal: Punto = { x: costadoFinalX, y: largoPanel };
  const centroFinal: Punto = { x: 0, y: largoPanel };
  const centroCintura: Punto = { x: 0, y: talleAtras };

  const curvaArm = curvaSisa(hombroExt, costadoSisa, true);

  // Pinza de cintura espalda: centrada entre el centro y el costado
  const cinturaCentroX = costadoCinturaX / 2;
  const pinzaA: Punto = { x: cinturaCentroX + anchoPinza / 2, y: talleAtras };
  const pinzaB: Punto = { x: cinturaCentroX - anchoPinza / 2, y: talleAtras };
  const pinzaPunta: Punto = { x: cinturaCentroX, y: talleAtras - 13 };

  const contorno: Punto[] = [];
  contorno.push(esc.profundo);
  contorno.push(...[...esc.puntosIntermedios].reverse());
  contorno.push(esc.externo);
  contorno.push(hombroExt);
  contorno.push(...curvaArm);
  contorno.push(costadoSisa);
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
    piquetes: [costadoSisa, { x: 0, y: talleAtras }],
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
      hombroExt,
      costadoSisa,
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
  const profSisa = profundidadSisa(m);
  const largoPanel = largoTotal(m, opts, false);
  const talleFrente = m.talleFrente;

  const esc = formaEscote(m, 'delantero', d.escote);

  // En el delantero usamos ancho_pecho como guía
  const hombroX = Math.max(esc.externo.x + 2, m.anchoPecho / 2);
  const hombroExt: Punto = { x: hombroX, y: CAIDA_HOMBRO_DELANTERO };

  const costadoSisa: Punto = { x: bP, y: profSisa };
  const anchoPinza = anchoPinzaCintura(m, desah.cintura, false);
  const costadoCinturaX = cP + anchoPinza;
  const costadoCintura: Punto = { x: costadoCinturaX, y: talleFrente };

  const largoBajoCintura = largoPanel - talleFrente;
  const costadoFinalX = bordeInferiorX(costadoCinturaX, cdP, m.alturaCadera, largoBajoCintura);
  const costadoFinal: Punto = { x: costadoFinalX, y: largoPanel };
  const centroFinal: Punto = { x: 0, y: largoPanel };
  const centroCintura: Punto = { x: 0, y: talleFrente };

  const curvaArm = curvaSisa(hombroExt, costadoSisa, false);

  // Pinza de cintura delantero alineada con el ápice del busto
  const cinturaCentroX = Math.min(m.separacionBusto / 2, costadoCinturaX - 2);
  const pinzaA: Punto = { x: cinturaCentroX + anchoPinza / 2, y: talleFrente };
  const pinzaB: Punto = { x: cinturaCentroX - anchoPinza / 2, y: talleFrente };
  const pinzaPunta: Punto = { x: cinturaCentroX, y: m.alturaBusto + 2 };

  // Pinza de busto: desde el costado apuntando al ápice del busto.
  // Posicionada a 2-3cm bajo la sisa para no interferir con la curva.
  const pinzaBustoCentroY = profSisa + 4;
  const pinzaBustoAncho = Math.max(2, Math.min(4, (m.busto - m.cintura) / 12));
  const pinzaBA: Punto = { x: bP, y: pinzaBustoCentroY - pinzaBustoAncho / 2 };
  const pinzaBB: Punto = { x: bP, y: pinzaBustoCentroY + pinzaBustoAncho / 2 };
  // La punta apunta hacia el ápice del busto pero se detiene a 2cm antes
  const apiceX = m.separacionBusto / 2;
  const apiceY = m.alturaBusto;
  const dx = bP - apiceX;
  const dy = pinzaBustoCentroY - apiceY;
  const len = Math.hypot(dx, dy);
  const recorte = 2;
  const pinzaBPunta: Punto = {
    x: apiceX + (dx / len) * recorte,
    y: apiceY + (dy / len) * recorte,
  };

  const contorno: Punto[] = [];
  contorno.push(esc.profundo);
  contorno.push(...[...esc.puntosIntermedios].reverse());
  contorno.push(esc.externo);
  contorno.push(hombroExt);
  contorno.push(...curvaArm);
  contorno.push(costadoSisa);
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
    piquetes: [costadoSisa, { x: 0, y: talleFrente }],
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
      hombroExt,
      costadoSisa,
      costadoCintura,
      costadoFinal,
      centroFinal,
    ]),
  };
}
