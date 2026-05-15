import { describe, expect, it } from 'vitest';
import {
  abajo,
  bbox,
  derecha,
  distancia,
  espejarX,
  pathDesdePuntos,
  punto,
  rotar,
} from '../src/lib/patrones/geometria';

describe('geometria', () => {
  it('mueve un punto a la derecha y abajo', () => {
    const p = punto(0, 0);
    expect(derecha(p, 5)).toEqual({ x: 5, y: 0 });
    expect(abajo(p, 3)).toEqual({ x: 0, y: 3 });
  });

  it('mide distancia euclidiana', () => {
    expect(distancia(punto(0, 0), punto(3, 4))).toBe(5);
  });

  it('espeja por eje vertical', () => {
    expect(espejarX(punto(2, 5), 0)).toEqual({ x: -2, y: 5 });
    expect(espejarX(punto(2, 5), 10)).toEqual({ x: 18, y: 5 });
  });

  it('rota 90 grados alrededor del origen', () => {
    const r = rotar(punto(1, 0), punto(0, 0), Math.PI / 2);
    expect(r.x).toBeCloseTo(0);
    expect(r.y).toBeCloseTo(1);
  });

  it('genera path SVG', () => {
    expect(pathDesdePuntos([punto(0, 0), punto(5, 0), punto(5, 10)])).toBe(
      'M 0.000 0.000 L 5.000 0.000 L 5.000 10.000',
    );
  });

  it('calcula bbox', () => {
    expect(bbox([punto(0, 0), punto(5, 3), punto(-2, 8)])).toEqual({ x: -2, y: 0, w: 7, h: 8 });
  });
});
