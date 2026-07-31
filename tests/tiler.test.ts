import { describe, expect, it } from 'vitest';
import { disposicionPlana, AVANCE } from '../src/lib/pdf/tiler';
import { baseFaldaPanel } from '../src/lib/patrones/baseFalda';
import { MEDIDAS_VACIAS, TALLAS_SENA } from '../src/lib/patrones/tipos';
import type { Diseno } from '../src/lib/patrones/tipos';

const dis: Diseno = {
  prenda: 'pollera',
  escote: 'redondo',
  manga: 'sin',
  largo: 60,
  ajuste: 'regular',
  tela: 'plano_medio',
  cierre: 'cremallera_invisible',
  margenCostura: 1,
  variantePollera: 'recta',
};

describe('tiler', () => {
  it('coloca dos piezas en una grilla A4 cubriendo todo el bbox', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const del = baseFaldaPanel('delantero', m, dis);
    const pos = baseFaldaPanel('posterior', m, dis);
    const r = disposicionPlana([del, pos], 2);

    expect(r.piezas).toHaveLength(2);
    // dos paneles de ~26cm + 2cm sep = ~54cm de ancho
    expect(r.bbox.w).toBeGreaterThan(50);
    expect(r.bbox.w).toBeLessThan(58);
    expect(r.bbox.h).toBeCloseTo(60, 0);

    // Las hojas deben cubrir todo el bbox con el solapado considerado
    const colsEsperadas = Math.ceil(r.bbox.w / AVANCE.ancho);
    const rowsEsperadas = Math.ceil(r.bbox.h / AVANCE.alto);
    expect(r.cols).toBe(colsEsperadas);
    expect(r.rows).toBe(rowsEsperadas);
    expect(r.tiles).toHaveLength(colsEsperadas * rowsEsperadas);

    // El último tile debe cubrir hasta o pasar el final del bbox
    const ultimo = r.tiles[r.tiles.length - 1];
    expect(ultimo.x1).toBeGreaterThanOrEqual(r.bbox.w);
    expect(ultimo.y1).toBeGreaterThanOrEqual(r.bbox.h);
  });

  it('un patrón chico cabe en una sola hoja', () => {
    const piezaChica = {
      nombre: 'test',
      cantidad: 1,
      cortarSobreDoblez: false,
      contornoPuntos: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
      contornoPath: '',
      piquetes: [],
      hilo: { a: { x: 5, y: 0 }, b: { x: 5, y: 10 } },
      pinzas: [],
      bbox: { x: 0, y: 0, w: 10, h: 10 },
    };
    const r = disposicionPlana([piezaChica], 2);
    expect(r.tiles).toHaveLength(1);
    expect(r.cols).toBe(1);
    expect(r.rows).toBe(1);
  });
});
