import { describe, expect, it } from 'vitest';
import { baseFaldaPanel } from '../src/lib/patrones/baseFalda';
import { MEDIDAS_VACIAS, TALLAS_SENA } from '../src/lib/patrones/tipos';
import type { Diseno } from '../src/lib/patrones/tipos';

const disenoBase: Diseno = {
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

describe('baseFalda', () => {
  it('genera panel delantero coherente para talla 12 SENA', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const pieza = baseFaldaPanel('delantero', m, disenoBase);
    expect(pieza.nombre).toBe('Falda delantera');
    expect(pieza.cantidad).toBe(1);
    // El ancho del panel a la cadera debería ser cadera/4 + holgura/4
    // Talla 12: cadera 100, holgura cadera regular plano_medio = 5cm → 100/4 + 5/4 = 26.25
    expect(pieza.bbox.w).toBeCloseTo(26.25, 1);
    expect(pieza.bbox.h).toBeCloseTo(60, 1);
    expect(pieza.pinzas.length).toBe(2); // dos lados de la pinza
  });

  it('genera panel posterior con pinza más profunda', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const del = baseFaldaPanel('delantero', m, disenoBase);
    const pos = baseFaldaPanel('posterior', m, disenoBase);
    // longitud de pinza posterior > delantero
    const largoDel = Math.abs(del.pinzas[0].b.y - del.pinzas[0].a.y);
    const largoPos = Math.abs(pos.pinzas[0].b.y - pos.pinzas[0].a.y);
    expect(largoPos).toBeGreaterThan(largoDel);
  });

  it('cambia el largo cuando varía diseno.largo', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const corta = baseFaldaPanel('delantero', m, { ...disenoBase, largo: 40 });
    const larga = baseFaldaPanel('delantero', m, { ...disenoBase, largo: 90 });
    expect(corta.bbox.h).toBeCloseTo(40, 1);
    expect(larga.bbox.h).toBeCloseTo(90, 1);
  });

  it('respeta el ajuste (más holgado → más ancho)', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const ajustada = baseFaldaPanel('delantero', m, { ...disenoBase, ajuste: 'ajustado' });
    const holgada = baseFaldaPanel('delantero', m, { ...disenoBase, ajuste: 'holgado' });
    expect(holgada.bbox.w).toBeGreaterThan(ajustada.bbox.w);
  });
});
