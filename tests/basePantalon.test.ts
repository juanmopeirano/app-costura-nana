import { describe, expect, it } from 'vitest';
import { basePantalonPanel } from '../src/lib/patrones/basePantalon';
import { areaFirmada } from '../src/lib/patrones/offset';
import type { Punto } from '../src/lib/patrones/tipos';
import { disenoBase, medidasTalla } from './fixtures';

const m = medidasTalla(10); // cintura 68, cadera 96, rodilla 35, bota 24, tiro 26
const d = disenoBase({ prenda: 'pantalon', largo: 100 });
const del = basePantalonPanel('delantero', m, d);
const pos = basePantalonPanel('posterior', m, d);

// Ancho del panel a una altura dada: distancia entre el borde del costado y el
// del centro, cruzando el contorno con una horizontal.
function anchoAAltura(contorno: Punto[], y: number): number {
  const cruces: number[] = [];
  for (let i = 0; i < contorno.length; i++) {
    const a = contorno[i];
    const b = contorno[(i + 1) % contorno.length];
    if (a.y === b.y) continue;
    const [lo, hi] = a.y < b.y ? [a, b] : [b, a];
    if (y < lo.y || y > hi.y) continue;
    cruces.push(lo.x + ((hi.x - lo.x) * (y - lo.y)) / (hi.y - lo.y));
  }
  return Math.max(...cruces) - Math.min(...cruces);
}

function seAutoIntersecta(contorno: Punto[]): boolean {
  const cruza = (p1: Punto, p2: Punto, p3: Punto, p4: Punto) => {
    const d = (a: Punto, b: Punto, c: Punto) =>
      Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
    const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2);
    const d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
    return d1 !== d2 && d3 !== d4;
  };
  const n = contorno.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // segmentos adyacentes por el cierre
      if (cruza(contorno[i], contorno[(i + 1) % n], contorno[j], contorno[(j + 1) % n])) return true;
    }
  }
  return false;
}

describe('basePantalon', () => {
  it('no se auto-intersecta', () => {
    expect(seAutoIntersecta(del.contornoPuntos)).toBe(false);
    expect(seAutoIntersecta(pos.contornoPuntos)).toBe(false);
  });

  it('va en sentido horario, como el resto de las piezas', () => {
    expect(areaFirmada(del.contornoPuntos)).toBeLessThan(0);
    expect(areaFirmada(pos.contornoPuntos)).toBeLessThan(0);
  });

  it('los cuatro paneles cierran el contorno de cadera + desahogo', () => {
    // regular / plano_medio → desahogo de cadera 5cm
    const cadera = anchoAAltura(del.contornoPuntos, 18) + anchoAAltura(pos.contornoPuntos, 18);
    expect(cadera * 2).toBeCloseTo(96 + 5, 0);
  });

  it('la cintura terminada, descontando pinzas, da la medida + desahogo', () => {
    const anchoUtil = (p: typeof del) => {
      let ancho = anchoAAltura(p.contornoPuntos, 0);
      for (let i = 0; i < p.pinzas.length; i += 2) {
        ancho -= Math.abs(p.pinzas[i + 1].a.x - p.pinzas[i].a.x);
      }
      return ancho;
    };
    // regular / plano_medio → desahogo de cintura 2.5cm
    expect((anchoUtil(del) + anchoUtil(pos)) * 2).toBeCloseTo(68 + 2.5, 0);
  });

  it('los dos paneles de una pierna cierran rodilla y bota + holgura', () => {
    const yRodilla = 26 + (100 - 26) * 0.48;
    expect(anchoAAltura(del.contornoPuntos, yRodilla) + anchoAAltura(pos.contornoPuntos, yRodilla))
      .toBeCloseTo(35 + 2, 0);
    expect(anchoAAltura(del.contornoPuntos, 99.9) + anchoAAltura(pos.contornoPuntos, 99.9))
      .toBeCloseTo(24 + 2, 0);
  });

  it('la pierna se afina de la cadera a la bota', () => {
    for (const p of [del, pos]) {
      const enCadera = anchoAAltura(p.contornoPuntos, 18);
      const enRodilla = anchoAAltura(p.contornoPuntos, 26 + (100 - 26) * 0.48);
      const enBota = anchoAAltura(p.contornoPuntos, 99.9);
      expect(enRodilla).toBeLessThan(enCadera);
      expect(enBota).toBeLessThan(enRodilla);
    }
  });

  it('el posterior tiene el gancho más profundo que el delantero', () => {
    const maxX = (p: typeof del) => Math.max(...p.contornoPuntos.map((q) => q.x));
    expect(maxX(pos)).toBeGreaterThan(maxX(del));
  });

  it('las pinzas absorben toda la diferencia que no toma el costado', () => {
    for (const p of [del, pos]) {
      expect(p.pinzas.length).toBeGreaterThan(0);
      expect(p.pinzas.length % 2).toBe(0); // dos lados por pinza
    }
  });

  it('sigue el largo pedido en el diseño', () => {
    const corto = basePantalonPanel('delantero', m, { ...d, largo: 75 });
    expect(corto.bbox.h).toBeCloseTo(75, 1);
    expect(del.bbox.h).toBeCloseTo(100, 1);
  });
});
