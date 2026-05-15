import type { Diseno, Medidas, Pieza, Punto } from './tipos';
import { bbox, bezierCuadratica, pathDesdePuntos } from './geometria';
import { desahogos } from './holgura';
import { formaEscote } from './transforms/escote';

// Construye los cuartos del corpiño femenino siguiendo el método del
// Manual SENA (pp.21-25). Sistema de coordenadas:
//   - x = 0 en el lomo (centro espalda / delantero)
//   - x crece hacia el costado
//   - y = 0 en la línea horizontal del hombro
//   - y crece hacia abajo
// Cada función devuelve un panel para cortarse sobre doblez.

export type LargoCorpino = 'top' | 'blusa' | 'vestido_cintura';

export type OpcionesCorpino = {
  largo: LargoCorpino;
  /** Largo total deseado (cm) desde 7a cervical. Para top y blusa. */
  largoPrenda?: number;
};

function profundidadSisa(m: Medidas): number {
  return m.busto / 10 + 11;
}

function curvaSisa(superior: Punto, costado: Punto, atras: boolean): Punto[] {
  const ctrl: Punto = atras
    ? { x: costado.x - 1.5, y: superior.y + (costado.y - superior.y) * 0.55 }
    : { x: costado.x - 2.5, y: superior.y + (costado.y - superior.y) * 0.6 };
  const out: Punto[] = [];
  const N = 10;
  for (let i = 1; i < N; i++) {
    out.push(bezierCuadratica(superior, ctrl, costado, i / N));
  }
  return out;
}

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
  const bP = m.busto / 4 + desah.busto / 4;
  const cP = m.cintura / 4 + desah.cintura / 4;
  const cdP = m.cadera / 4 + desah.cadera / 4;
  const profSisa = profundidadSisa(m);
  const largoPanel = largoTotal(m, opts, true);
  const talleAtras = m.talleAtras;

  // Escote (forma según selección)
  const esc = formaEscote(m, 'espalda', d.escote);

  // Hombro: del externo del escote a (anchoEspalda/2, caida).
  // Si el escote barco lleva el ancho más allá de anchoEspalda/2, lo recortamos.
  const hombroX = Math.max(esc.externo.x + 2, m.anchoEspalda / 2);
  const hombroExt: Punto = { x: hombroX, y: 2 };

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

  // Pinza de cintura centrada en el cuarto
  const cinturaCentroX = costadoCinturaX / 2;
  const pinzaA: Punto = { x: cinturaCentroX + anchoPinza / 2, y: talleAtras };
  const pinzaB: Punto = { x: cinturaCentroX - anchoPinza / 2, y: talleAtras };
  const pinzaPunta: Punto = { x: cinturaCentroX, y: talleAtras - 13 };

  // Construir contorno CW desde el centro arriba (escote profundo)
  const contorno: Punto[] = [];
  contorno.push(esc.profundo); // centro arriba
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

  const hombroX = Math.max(esc.externo.x + 2, m.anchoPecho / 2);
  const hombroExt: Punto = { x: hombroX, y: 2.5 };

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

  // Pinza de cintura alineada con punta de busto
  const cinturaCentroX = Math.min(m.separacionBusto / 2, costadoCinturaX - 2);
  const pinzaA: Punto = { x: cinturaCentroX + anchoPinza / 2, y: talleFrente };
  const pinzaB: Punto = { x: cinturaCentroX - anchoPinza / 2, y: talleFrente };
  const pinzaPunta: Punto = { x: cinturaCentroX, y: m.alturaBusto + 2 };

  // Pinza de busto desde el costado
  const pinzaBustoArribaY = profSisa + 1;
  const pinzaBustoBaseY = profSisa + Math.max(3, Math.min(5, m.busto / 25));
  const pinzaBA: Punto = { x: bP, y: pinzaBustoBaseY };
  const pinzaBB: Punto = { x: bP, y: pinzaBustoArribaY };
  const pinzaBPunta: Punto = { x: Math.max(0, m.separacionBusto / 2 + 1), y: m.alturaBusto };

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
