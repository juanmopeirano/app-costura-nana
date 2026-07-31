import { describe, expect, it } from 'vitest';
import { construirSisa, profundidadSisa } from '../src/lib/patrones/baseCorpino';
import { baseMangaInfo } from '../src/lib/patrones/baseManga';
import { medidasTalla } from './fixtures';
import type { Ajuste, Diseno, Tela } from '../src/lib/patrones/tipos';

// El cuadro de tallas SENA (p.20) no trae contorno de brazo ni de muñeca, así
// que las completamos con valores realistas para poder trazar la manga.
const BRAZO: Record<number, number> = { 6: 25, 8: 26, 10: 27.5, 12: 29, 14: 31, 16: 33, 18: 35 };
const MUNECA: Record<number, number> = {
  6: 14.5, 8: 15, 10: 15.5, 12: 16, 14: 16.75, 16: 17.5, 18: 18,
};

const TALLAS = [6, 8, 10, 12, 14, 16, 18] as const;

function medidas(talla: number) {
  return { ...medidasTalla(talla), brazo: BRAZO[talla], muneca: MUNECA[talla] };
}

function diseno(over: Partial<Diseno> = {}): Diseno {
  return {
    prenda: 'blusa',
    escote: 'redondo',
    manga: 'larga',
    largo: 62,
    ajuste: 'regular',
    tela: 'plano_medio',
    cierre: 'botones',
    margenCostura: 1,
    ...over,
  };
}

describe('la manga entra en la sisa', () => {
  it.each(TALLAS)('talla %i: el embebido cae en el rango cosible', (talla) => {
    const m = medidas(talla);
    const info = baseMangaInfo(m, diseno());
    // Una cabeza de manga tiene que ser algo más larga que la sisa para poder
    // montarla con forma, pero si sobra demasiado frunce. El rango de taller es
    // 2 a 5cm repartidos entre las dos mitades.
    expect(info.embebido).toBeGreaterThan(1.5);
    expect(info.embebido).toBeLessThan(5.5);
  });

  it.each(TALLAS)('talla %i: la cuerda de la copa mide igual que la sisa', (talla) => {
    const m = medidas(talla);
    const d = diseno();
    const sisaF = construirSisa(m, d, 'delantero');
    const sisaE = construirSisa(m, d, 'espalda');
    const info = baseMangaInfo(m, d);
    const h = info.alturaCabeza;
    const pts = info.pieza.contornoPuntos;
    const cumbre = pts[0];
    const anchoFrente = pts.reduce((a, p) => (p.x < a.x ? p : a), pts[0]);
    const anchoEspalda = pts.reduce((a, p) => (p.x > a.x ? p : a), pts[0]);

    // Esta es la construcción del manual (p.26): la cuerda que va de la cumbre
    // al punto de ancho de manga mide exactamente el largo de la sisa.
    expect(Math.hypot(anchoFrente.x - cumbre.x, anchoFrente.y - cumbre.y)).toBeCloseTo(
      sisaF.largo,
      1,
    );
    expect(Math.hypot(anchoEspalda.x - cumbre.x, anchoEspalda.y - cumbre.y)).toBeCloseTo(
      sisaE.largo,
      1,
    );
    expect(anchoFrente.y).toBeCloseTo(h, 1);
    expect(anchoEspalda.y).toBeCloseTo(h, 1);
  });

  it.each(TALLAS)('talla %i: la manga no queda más angosta que el brazo', (talla) => {
    const m = medidas(talla);
    const info = baseMangaInfo(m, diseno());
    expect(info.anchoManga).toBeGreaterThanOrEqual(m.brazo + 3.5);
  });

  it.each(TALLAS)('talla %i: la copa no se dobla sobre sí misma', (talla) => {
    const m = medidas(talla);
    const info = baseMangaInfo(m, diseno());
    const pts = info.pieza.contornoPuntos;
    const iIzq = pts.reduce((b, p, i) => (p.x < pts[b].x ? i : b), 0);
    const iDer = pts.reduce((b, p, i) => (p.x > pts[b].x ? i : b), 0);
    const mitades = [pts.slice(0, iDer + 1), [...pts.slice(iIzq), pts[0]].reverse()];
    // De la cumbre al ancho de manga la copa se aleja del eje y baja siempre.
    // Si vuelve para atrás es que la curva hace un rulo y no cierra contra la
    // sisa al coserla.
    for (const curva of mitades) {
      for (let i = 1; i < curva.length; i++) {
        expect(Math.abs(curva[i].x)).toBeGreaterThanOrEqual(Math.abs(curva[i - 1].x) - 1e-9);
        expect(curva[i].y).toBeGreaterThanOrEqual(curva[i - 1].y - 1e-9);
      }
    }
  });

  it('las dos sisas miden distinto, así que la manga tiene derecho y revés', () => {
    const m = medidas(12);
    const d = diseno();
    const espalda = construirSisa(m, d, 'espalda').largo;
    const delantero = construirSisa(m, d, 'delantero').largo;
    // En este trazado la delantera sale más larga: el ancho de pecho es menor
    // que el ancho de espalda y su línea de referencia va más baja (p.24 vs
    // p.22), así que la curva tiene que abrirse más para llegar a la axila.
    expect(delantero).toBeGreaterThan(espalda);
    expect(delantero - espalda).toBeGreaterThan(0.5);
    expect(delantero - espalda).toBeLessThan(3);
  });

  const combos: Array<[Ajuste, Tela]> = [
    ['ajustado', 'plano_ligero'],
    ['regular', 'plano_medio'],
    ['holgado', 'plano_pesado'],
    ['regular', 'punto'],
  ];
  it.each(combos)('ajuste %s en tela %s mantiene el embebido en rango', (ajuste, tela) => {
    const m = medidas(12);
    const info = baseMangaInfo(m, diseno({ ajuste, tela }));
    expect(info.embebido).toBeGreaterThan(1.5);
    expect(info.embebido).toBeLessThan(5.5);
    expect(info.anchoManga).toBeGreaterThanOrEqual(m.brazo + 3.5);
  });
});

describe('la sisa sale de las medidas, no de una curva inventada', () => {
  it('la profundidad de sisa sale del costado', () => {
    const m = medidas(8);
    // Talla 8: talle atrás 42 - costado 19 = 23cm, más el desahogo repartido.
    expect(profundidadSisa(m, diseno())).toBeCloseTo(23 + 5 / 8, 2);
  });

  it('la sisa pasa por el punto de ancho de espalda / ancho de pecho', () => {
    const m = medidas(12);
    const d = diseno();
    const esp = construirSisa(m, d, 'espalda');
    const del = construirSisa(m, d, 'delantero');
    // El punto de referencia es el que manda el manual (pp.22 y 24) y es además
    // donde va el piquete que casa con la manga.
    expect(esp.referencia.x).toBeCloseTo(m.anchoEspalda / 2 + 5 / 8, 2);
    expect(del.referencia.x).toBeCloseTo(m.anchoPecho / 2 + 5 / 8, 2);
    // Y la curva efectivamente lo toca.
    for (const s of [esp, del]) {
      const cerca = s.curva.some(
        (p) => Math.hypot(p.x - s.referencia.x, p.y - s.referencia.y) < 0.01,
      );
      expect(cerca).toBe(true);
    }
  });

  it('la costura de hombro mide la medida de hombro y es igual en los dos paneles', () => {
    for (const talla of TALLAS) {
      const m = medidas(talla);
      const d = diseno();
      const esp = construirSisa(m, d, 'espalda');
      const del = construirSisa(m, d, 'delantero');
      // El hombro arranca en el escote y termina en la punta, con 4cm de caída.
      const largoEsp = Math.hypot(esp.hombro.x - (m.cuello / 5 + 0.3), esp.hombro.y);
      const largoDel = Math.hypot(del.hombro.x - (m.cuello / 5 - 0.5), del.hombro.y);
      expect(largoEsp).toBeCloseTo(m.hombro, 1);
      expect(largoDel).toBeCloseTo(m.hombro, 1);
      expect(esp.hombro.y).toBeCloseTo(4, 5);
      expect(del.hombro.y).toBeCloseTo(4, 5);
    }
  });
});
