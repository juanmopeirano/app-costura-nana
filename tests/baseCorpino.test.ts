import { describe, expect, it } from 'vitest';
import { corpinoDelantero, corpinoEspalda } from '../src/lib/patrones/baseCorpino';
import { generarTop } from '../src/lib/patrones/prendas/top';
import { MEDIDAS_VACIAS, TALLAS_SENA } from '../src/lib/patrones/tipos';
import type { Diseno } from '../src/lib/patrones/tipos';

const dis: Diseno = {
  prenda: 'top',
  escote: 'redondo',
  manga: 'sin',
  largo: 55,
  ajuste: 'regular',
  tela: 'plano_medio',
  cierre: 'cremallera_invisible',
  margenCostura: 1,
};

describe('baseCorpino', () => {
  it('genera espalda talla 12 con largo coherente al top', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const pieza = corpinoEspalda(m, dis, { largo: 'top', largoPrenda: 55 });
    expect(pieza.nombre).toBe('Espalda');
    expect(pieza.cortarSobreDoblez).toBe(true);
    expect(pieza.bbox.h).toBeGreaterThanOrEqual(50);
  });

  it('escote V es más profundo que redondo en delantero', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const redondo = corpinoDelantero(m, dis, { largo: 'top', largoPrenda: 55 });
    const v = corpinoDelantero(
      m,
      { ...dis, escote: 'v' },
      { largo: 'top', largoPrenda: 55 },
    );
    // El primer punto del contorno es escote profundo (centro arriba).
    expect(v.contornoPuntos[0].y).toBeGreaterThan(redondo.contornoPuntos[0].y);
  });

  it('top combina delantero + espalda con anchos comparables', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const patron = generarTop(m, dis, 'test');
    expect(patron.piezas).toHaveLength(2);
    const [del, esp] = patron.piezas;
    expect(Math.abs(del.bbox.w - esp.bbox.w)).toBeLessThan(2);
  });

  it('respeta ajuste — holgado es más ancho que ajustado', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const ajustado = corpinoEspalda(m, { ...dis, ajuste: 'ajustado' }, { largo: 'top' });
    const holgado = corpinoEspalda(m, { ...dis, ajuste: 'holgado' }, { largo: 'top' });
    expect(holgado.bbox.w).toBeGreaterThan(ajustado.bbox.w);
  });
});
