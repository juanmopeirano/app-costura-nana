import { describe, expect, it } from 'vitest';
import { generarVestido } from '../src/lib/patrones/prendas/vestido';
import { baseFaldaPanel } from '../src/lib/patrones/baseFalda';
import { MEDIDAS_VACIAS, TALLAS_SENA } from '../src/lib/patrones/tipos';
import type { Diseno } from '../src/lib/patrones/tipos';

const dis: Diseno = {
  prenda: 'vestido',
  escote: 'redondo',
  manga: 'sin',
  largo: 100,
  ajuste: 'regular',
  tela: 'plano_medio',
  cierre: 'cremallera_invisible',
  margenCostura: 1,
  variantePollera: 'recta',
  varianteVestido: 'simple',
};

describe('vestido', () => {
  it('vestido simple genera 4 piezas (corpino x2 + falda x2)', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const patron = generarVestido(m, dis, 'test');
    expect(patron.piezas).toHaveLength(4);
    expect(patron.piezas.map((p) => p.nombre)).toEqual([
      'Delantero',
      'Espalda',
      'Falda delantera (vestido)',
      'Falda posterior (vestido)',
    ]);
  });

  it('vestido con manga larga incluye 5 piezas', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25, brazo: 28, muneca: 16, largoManga: 60 };
    const patron = generarVestido(m, { ...dis, manga: 'larga' }, 'test');
    expect(patron.piezas).toHaveLength(5);
  });
});

describe('variantes pollera', () => {
  const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25, largoFalda: 70 };
  const baseDis: Diseno = { ...dis, prenda: 'pollera', largo: 70 };

  it('A-line ensancha el ruedo respecto a recta', () => {
    const recta = baseFaldaPanel('delantero', m, { ...baseDis, variantePollera: 'recta' });
    const aline = baseFaldaPanel('delantero', m, { ...baseDis, variantePollera: 'a_line' });
    expect(aline.bbox.w).toBeGreaterThan(recta.bbox.w);
  });

  it('vuelo ensancha aún más que A-line', () => {
    const aline = baseFaldaPanel('delantero', m, { ...baseDis, variantePollera: 'a_line' });
    const vuelo = baseFaldaPanel('delantero', m, { ...baseDis, variantePollera: 'vuelo' });
    expect(vuelo.bbox.w).toBeGreaterThan(aline.bbox.w);
  });
});
