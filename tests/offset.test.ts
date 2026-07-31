import { describe, expect, it } from 'vitest';
import { areaFirmada, offsetPolilineaCerrada } from '../src/lib/patrones/offset';
import { generarPollera } from '../src/lib/patrones/prendas/pollera';
import { generarTop } from '../src/lib/patrones/prendas/top';
import { generarBlusa } from '../src/lib/patrones/prendas/blusa';
import { generarVestido } from '../src/lib/patrones/prendas/vestido';
import { generarPantalon } from '../src/lib/patrones/prendas/pantalon';
import { medidasTalla, disenoBase } from './fixtures';

const CUADRADO_CW = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe('offsetPolilineaCerrada', () => {
  it('crece hacia afuera con un polígono horario', () => {
    const off = offsetPolilineaCerrada(CUADRADO_CW, 1);
    expect(Math.abs(areaFirmada(off))).toBeCloseTo(144, 5);
  });

  it('crece hacia afuera con un polígono antihorario', () => {
    const off = offsetPolilineaCerrada([...CUADRADO_CW].reverse(), 1);
    expect(Math.abs(areaFirmada(off))).toBeCloseTo(144, 5);
  });

  it('conserva el sentido de giro original', () => {
    expect(areaFirmada(offsetPolilineaCerrada(CUADRADO_CW, 1))).toBeLessThan(0);
    expect(areaFirmada(offsetPolilineaCerrada([...CUADRADO_CW].reverse(), 1))).toBeGreaterThan(0);
  });
});

describe('margen de costura de cada prenda', () => {
  const m = medidasTalla(10);
  const generadores = {
    pollera: () => generarPollera(m, disenoBase({ prenda: 'pollera', largo: 60 }), 'Test'),
    top: () => generarTop(m, disenoBase({ prenda: 'top', largo: 55 }), 'Test'),
    blusa: () => generarBlusa(m, disenoBase({ prenda: 'blusa', largo: 62 }), 'Test'),
    vestido: () => generarVestido(m, disenoBase({ prenda: 'vestido', largo: 100 }), 'Test'),
    pantalon: () => generarPantalon(m, disenoBase({ prenda: 'pantalon', largo: 100 }), 'Test'),
  };

  for (const [nombre, generar] of Object.entries(generadores)) {
    it(`${nombre}: la línea de corte queda por fuera de la de costura`, () => {
      for (const pieza of generar().piezas) {
        const original = Math.abs(areaFirmada(pieza.contornoPuntos));
        const conMargen = Math.abs(areaFirmada(offsetPolilineaCerrada(pieza.contornoPuntos, 1)));
        expect(conMargen, `${nombre} · ${pieza.nombre}`).toBeGreaterThan(original);
      }
    });
  }
});
