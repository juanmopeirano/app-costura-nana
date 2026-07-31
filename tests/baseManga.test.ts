import { describe, expect, it } from 'vitest';
import { baseManga, largoPorTipoManga } from '../src/lib/patrones/baseManga';
import { generarBlusa } from '../src/lib/patrones/prendas/blusa';
import { MEDIDAS_VACIAS, TALLAS_SENA } from '../src/lib/patrones/tipos';
import type { Diseno } from '../src/lib/patrones/tipos';

const dis: Diseno = {
  prenda: 'blusa',
  escote: 'redondo',
  manga: 'larga',
  largo: 62,
  ajuste: 'regular',
  tela: 'plano_medio',
  cierre: 'botones',
  margenCostura: 1,
};

describe('baseManga', () => {
  it('genera una manga con largo dado, asimétrica entre frente y espalda', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], brazo: 28, muneca: 16, largoManga: 60 };
    const pieza = baseManga(m, dis, 50);
    expect(pieza.nombre).toBe('Manga');
    expect(pieza.cantidad).toBe(2);
    expect(pieza.cortarSobreDoblez).toBe(false);
    expect(pieza.bbox.h).toBeCloseTo(50, 0);
    // La manga cruza el eje: el delantero cae en x<0 y el posterior en x>0.
    expect(pieza.bbox.x).toBeLessThan(0);
    expect(pieza.bbox.x + pieza.bbox.w).toBeGreaterThan(0);
    // Y NO es simétrica: cada mitad de la copa se levanta sobre su propia sisa,
    // que no miden lo mismo. Una manga simétrica no tiene derecho ni revés y se
    // tuerce en el brazo.
    const semiFrente = Math.abs(pieza.bbox.x);
    const semiEspalda = pieza.bbox.x + pieza.bbox.w;
    expect(semiFrente).toBeGreaterThan(semiEspalda + 0.5);
  });

  it('manga 3/4 tiene un largo intermedio entre corta y larga', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], brazo: 28, muneca: 16, largoManga: 60 };
    expect(largoPorTipoManga(m, 'corta')).toBeLessThan(largoPorTipoManga(m, 'tres_cuartos'));
    expect(largoPorTipoManga(m, 'tres_cuartos')).toBeLessThan(largoPorTipoManga(m, 'larga'));
  });

  it('blusa con manga larga incluye 3 piezas (delantero, espalda, manga)', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25, brazo: 28, muneca: 16, largoManga: 60, largoBlusa: 62 };
    const patron = generarBlusa(m, dis, 'test');
    expect(patron.piezas).toHaveLength(3);
    expect(patron.piezas.map((p) => p.nombre)).toEqual(['Delantero', 'Espalda', 'Manga']);
  });

  it('blusa sin manga sólo tiene corpiño', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const patron = generarBlusa(m, { ...dis, manga: 'sin' }, 'test');
    expect(patron.piezas).toHaveLength(2);
  });
});
