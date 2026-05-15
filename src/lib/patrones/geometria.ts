import type { Punto } from './tipos';

export const punto = (x: number, y: number): Punto => ({ x, y });
export const sumar = (a: Punto, b: Punto): Punto => ({ x: a.x + b.x, y: a.y + b.y });
export const restar = (a: Punto, b: Punto): Punto => ({ x: a.x - b.x, y: a.y - b.y });
export const escalar = (a: Punto, k: number): Punto => ({ x: a.x * k, y: a.y * k });
export const distancia = (a: Punto, b: Punto): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const desplazar = (p: Punto, dx: number, dy: number): Punto => ({
  x: p.x + dx,
  y: p.y + dy,
});

export const derecha = (p: Punto, d: number) => desplazar(p, d, 0);
export const izquierda = (p: Punto, d: number) => desplazar(p, -d, 0);
export const abajo = (p: Punto, d: number) => desplazar(p, 0, d);
export const arriba = (p: Punto, d: number) => desplazar(p, 0, -d);

export const espejarX = (p: Punto, ejeX = 0): Punto => ({ x: 2 * ejeX - p.x, y: p.y });
export const espejarY = (p: Punto, ejeY = 0): Punto => ({ x: p.x, y: 2 * ejeY - p.y });

export const rotar = (p: Punto, centro: Punto, anguloRad: number): Punto => {
  const c = Math.cos(anguloRad);
  const s = Math.sin(anguloRad);
  const dx = p.x - centro.x;
  const dy = p.y - centro.y;
  return { x: centro.x + dx * c - dy * s, y: centro.y + dx * s + dy * c };
};

export const puntoEnLinea = (a: Punto, b: Punto, t: number): Punto => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

// Curva cuadrática Bézier: usada para escote y sisa.
export const bezierCuadratica = (a: Punto, control: Punto, b: Punto, t: number): Punto => {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * control.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * control.y + t * t * b.y,
  };
};

export const bezierCubica = (a: Punto, c1: Punto, c2: Punto, b: Punto, t: number): Punto => {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
  };
};

// Genera path SVG en formato "M x y L x y ..." desde una secuencia de puntos.
export const pathDesdePuntos = (puntos: Punto[], cerrar = false): string => {
  if (puntos.length === 0) return '';
  const partes = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(3)} ${p.y.toFixed(3)}`);
  if (cerrar) partes.push('Z');
  return partes.join(' ');
};

// Bounding box de una lista de puntos (en cm).
export const bbox = (puntos: Punto[]) => {
  if (puntos.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of puntos) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
};
