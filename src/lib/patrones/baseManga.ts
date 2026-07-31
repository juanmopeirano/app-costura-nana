import type { Diseno, Manga, Medidas, Pieza, Punto } from './tipos';
import { bbox, distancia, pathDesdePuntos } from './geometria';
import { desahogos } from './holgura';
import { construirSisa, profundidadSisa } from './baseCorpino';

// BASE DE MANGA siguiendo el manual SENA p.26.
//
// El método del manual es el que garantiza que la manga entre en la sisa: la
// cabeza de manga no se dibuja "a ojo", se levanta sobre las dos sisas del
// corpiño. Concretamente:
//
//   1. Se marca la altura de cabeza de manga sobre una vertical (el manual usa
//      15cm como medida estándar).
//   2. Desde la cumbre se tira una cuerda del largo de la SISA DELANTERA hasta
//      la línea de ancho de manga: ahí cae el punto de ancho delantero.
//   3. Lo mismo con la SISA POSTERIOR del otro lado.
//   4. La curva de la copa se traza sobre esas dos cuerdas con los desvíos que
//      da el manual: sale 1.8cm por encima en la parte alta, y entra 1cm
//      adelante / 0.5cm atrás en la parte baja.
//
// De ahí salen tres cosas que el trazado anterior no tenía:
//   - el ancho de la manga queda DERIVADO de la sisa, no inventado;
//   - la manga es asimétrica (la sisa delantera y la trasera no miden igual),
//     así que tiene derecho y revés y no se tuerce en el brazo;
//   - el embebido sale solo, porque la curva siempre es más larga que su cuerda.

/** Desvíos de la copa respecto de la cuerda, en cm (p.26). */
const DESVIO_ALTO = 1.8;
const DESVIO_BAJO_FRENTE = 1.0;
const DESVIO_BAJO_ESPALDA = 0.5;

/** Posición de esos desvíos sobre la cuerda, de la cumbre al ancho de manga. */
const T_ALTO = 0.35;
const T_BAJO = 0.78;

const N = 16;

/**
 * Altura de cabeza de manga. El manual da 15cm como estándar; acá se toma como
 * proporción de la profundidad de sisa para que acompañe al talle (0.65 da
 * justo 15cm en la talla 8 de la tabla SENA). Si la manga resultante quedara
 * más angosta que el brazo, se baja la copa: es la misma transformación que
 * muestra el manual en p.52, donde agrandar la sisa achata la cabeza.
 */
function alturaCabeza(m: Medidas, d: Diseno, sisaFrente: number, sisaEspalda: number): number {
  const desah = desahogos(d.ajuste, d.tela);
  const anchoMinimo = Math.max(20, m.brazo + desah.brazo);
  const techo = Math.min(sisaFrente, sisaEspalda) - 1;
  let h = Math.min(profundidadSisa(m, d) * 0.65, techo);
  for (let i = 0; i < 40 && h > 6; i++) {
    if (anchoManga(sisaFrente, sisaEspalda, h) >= anchoMinimo) break;
    h -= 0.25;
  }
  return Math.max(6, h);
}

function semiAncho(sisa: number, h: number): number {
  return Math.sqrt(Math.max(1, sisa * sisa - h * h));
}

function anchoManga(sisaFrente: number, sisaEspalda: number, h: number): number {
  return semiAncho(sisaFrente, h) + semiAncho(sisaEspalda, h);
}

/** Spline Catmull-Rom que pasa por todos los puntos dados. */
function spline(pts: Punto[], pasos: number): Punto[] {
  const out: Punto[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 1; k <= pasos; k++) {
      const t = k / pasos;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  return out;
}

/**
 * Media copa: de la cumbre al punto de ancho de manga, curvada sobre la cuerda
 * con los desvíos del manual. Devuelve los puntos sin incluir la cumbre.
 */
function mediaCopa(cumbre: Punto, anchoPt: Punto, desvioBajo: number, k: number): Punto[] {
  const dx = anchoPt.x - cumbre.x;
  const dy = anchoPt.y - cumbre.y;
  const L = Math.hypot(dx, dy);
  // De las dos normales a la cuerda tomamos la que apunta hacia afuera de la
  // manga, es decir hacia arriba: (dy,-dx) del lado posterior, (-dy,dx) del
  // delantero. Con ella el desvío positivo levanta la copa y el negativo la
  // hunde, igual que en el trazado del manual.
  const perp: Punto =
    dx > 0 ? { x: dy / L, y: -dx / L } : { x: -dy / L, y: dx / L };

  const sobreCuerda = (t: number, off: number): Punto => ({
    x: cumbre.x + dx * t + perp.x * off,
    y: cumbre.y + dy * t + perp.y * off,
  });

  // Sólo se escala el desvío de arriba. La parte baja de la copa conserva el
  // valor del manual: es el tramo que va cosido sin embeber contra la axila, y
  // si se exagera aparece una ese que no cierra contra la sisa.
  const guia = [
    cumbre,
    sobreCuerda(T_ALTO, DESVIO_ALTO * k),
    sobreCuerda(T_BAJO, -desvioBajo),
    anchoPt,
  ];
  return spline(guia, Math.max(4, Math.round(N / 2))).slice(1);
}

function largoPolilinea(p: Punto[]): number {
  let s = 0;
  for (let i = 1; i < p.length; i++) s += distancia(p[i - 1], p[i]);
  return s;
}

/** Punto sobre la polilínea a una distancia dada, medida desde el final. */
function puntoDesdeElFinal(curva: Punto[], dist: number): Punto {
  let acum = 0;
  for (let i = curva.length - 1; i > 0; i--) {
    const seg = distancia(curva[i], curva[i - 1]);
    if (acum + seg >= dist) {
      const t = (dist - acum) / seg;
      return {
        x: curva[i].x + (curva[i - 1].x - curva[i].x) * t,
        y: curva[i].y + (curva[i - 1].y - curva[i].y) * t,
      };
    }
    acum += seg;
  }
  return curva[0];
}

export type ManganInfo = {
  pieza: Pieza;
  /** Largo de la curva de copa (los dos lados). */
  largoCopa: number;
  /** Largo de sisa del corpiño (los dos lados). */
  largoSisa: number;
  /** Embebido: cuánto sobra la copa sobre la sisa. */
  embebido: number;
  anchoManga: number;
  alturaCabeza: number;
};

export function baseMangaInfo(m: Medidas, d: Diseno, largoFinal?: number): ManganInfo {
  const sisaF = construirSisa(m, d, 'delantero');
  const sisaE = construirSisa(m, d, 'espalda');
  const largo = largoFinal ?? m.largoManga;

  const h = alturaCabeza(m, d, sisaF.largo, sisaE.largo);
  const semiF = semiAncho(sisaF.largo, h);
  const semiE = semiAncho(sisaE.largo, h);

  // x < 0 es el lado delantero, x > 0 el posterior.
  const cumbre: Punto = { x: 0, y: 0 };
  const anchoFrente: Punto = { x: -semiF, y: h };
  const anchoEspalda: Punto = { x: semiE, y: h };

  // Los desvíos del manual están dados para una talla de referencia, así que en
  // valor absoluto no acompañan al talle: en una sisa grande la copa queda casi
  // pegada a la cuerda y no sobra tela para montarla. Escalamos los desvíos
  // hasta que el embebido dé el valor de taller, manteniendo la proporción
  // 1.8 / 1.0 / 0.5 entre ellos.
  const embebidoObjetivo = d.tela === 'punto' ? 1.6 : 3.0;
  const copaCon = (k: number) => ({
    frente: mediaCopa(cumbre, anchoFrente, DESVIO_BAJO_FRENTE, k),
    espalda: mediaCopa(cumbre, anchoEspalda, DESVIO_BAJO_ESPALDA, k),
  });
  const embebidoCon = (k: number) => {
    const c = copaCon(k);
    return (
      largoPolilinea([cumbre, ...c.frente]) +
      largoPolilinea([cumbre, ...c.espalda]) -
      (sisaF.largo + sisaE.largo)
    );
  };
  let kBajo = 0.2;
  let kAlto = 8;
  for (let i = 0; i < 30; i++) {
    const kMedio = (kBajo + kAlto) / 2;
    if (embebidoCon(kMedio) < embebidoObjetivo) kBajo = kMedio;
    else kAlto = kMedio;
  }
  const { frente: copaFrente, espalda: copaEspalda } = copaCon((kBajo + kAlto) / 2);

  // Puño. En la manga larga se abre lo justo para que pase la mano; en las
  // cortas se interpola entre el ancho de manga y ese puño.
  const punoLargo = Math.max(m.muneca + 5, 18);
  const largoCompleto = Math.max(1, m.largoManga);
  const t = Math.min(1, Math.max(0, (largo - h) / Math.max(1, largoCompleto - h)));
  const anchoBicep = semiF + semiE;
  const anchoPuno = anchoBicep + (punoLargo - anchoBicep) * t;
  const semiPunoF = (anchoPuno * semiF) / anchoBicep;
  const semiPunoE = (anchoPuno * semiE) / anchoBicep;

  const punoFrente: Punto = { x: -semiPunoF, y: largo };
  const punoEspalda: Punto = { x: semiPunoE, y: largo };

  // Los piquetes se miden desde el ancho de manga hacia arriba, la misma
  // distancia que hay en el corpiño de la axila al punto de ancho de espalda /
  // ancho de pecho. Así el tramo bajo casa exacto y todo el embebido queda
  // arriba, que es donde se puede planchar sin que frunza.
  const bajoF = sisaF.largo - sisaF.largoHastaReferencia;
  const bajoE = sisaE.largo - sisaE.largoHastaReferencia;
  const piqueteFrente = puntoDesdeElFinal([cumbre, ...copaFrente], bajoF);
  const piqueteEspalda = puntoDesdeElFinal([cumbre, ...copaEspalda], bajoE);

  const contorno: Punto[] = [
    cumbre,
    ...copaEspalda,
    punoEspalda,
    punoFrente,
    ...[...copaFrente].reverse(),
  ];

  const largoCopa =
    largoPolilinea([cumbre, ...copaFrente]) + largoPolilinea([cumbre, ...copaEspalda]);
  const largoSisa = sisaF.largo + sisaE.largo;

  const pieza: Pieza = {
    nombre: 'Manga',
    cantidad: 2,
    cortarSobreDoblez: false,
    contornoPuntos: contorno,
    contornoPath: pathDesdePuntos(contorno, true),
    piquetes: [piqueteFrente, piqueteEspalda],
    hilo: { a: { x: 0, y: 2 }, b: { x: 0, y: largo - 2 } },
    pinzas: [],
    bbox: bbox([cumbre, anchoFrente, anchoEspalda, punoFrente, punoEspalda]),
  };

  return {
    pieza,
    largoCopa,
    largoSisa,
    embebido: largoCopa - largoSisa,
    anchoManga: semiF + semiE,
    alturaCabeza: h,
  };
}

export function baseManga(m: Medidas, d: Diseno, largoFinal?: number): Pieza {
  return baseMangaInfo(m, d, largoFinal).pieza;
}

export function largoPorTipoManga(m: Medidas, tipo: Manga): number {
  switch (tipo) {
    case 'corta':
      return 18;
    case 'tres_cuartos':
      return Math.min(40, m.largoManga);
    case 'larga':
      return m.largoManga;
    case 'kimona':
    case 'raglan':
      // En V1 estos no usan baseManga (se manejan por separado)
      return m.largoManga;
    case 'sin':
    default:
      return 0;
  }
}

export function necesitaManga(tipo: Manga): boolean {
  return tipo === 'corta' || tipo === 'tres_cuartos' || tipo === 'larga';
}
