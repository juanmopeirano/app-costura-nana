import type { Punto } from './tipos';

// Desplaza paralelamente una polilínea cerrada por `distancia` cm hacia "afuera".
// Asume orientación horaria (CW) en sistema de coordenadas donde y crece
// hacia abajo (formato SVG/pantalla). El offset usa bisector en cada vértice.
//
// Para curvas muy cerradas o ángulos casi 180°, el bisector se clampa para
// evitar picos. Suficientemente robusto para los patrones simples del manual SENA.
export function offsetPolilineaCerrada(puntos: Punto[], distancia: number): Punto[] {
  if (puntos.length < 3 || distancia === 0) return [...puntos];
  const n = puntos.length;
  const resultado: Punto[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const prev = puntos[(i - 1 + n) % n];
    const cur = puntos[i];
    const next = puntos[(i + 1) % n];
    // dirección entrada y salida
    const ex = cur.x - prev.x;
    const ey = cur.y - prev.y;
    const sx = next.x - cur.x;
    const sy = next.y - cur.y;
    // normales hacia afuera (rotación -90° en SVG = (y, -x) para CW)
    const lenE = Math.hypot(ex, ey) || 1;
    const lenS = Math.hypot(sx, sy) || 1;
    const nx1 = ey / lenE;
    const ny1 = -ex / lenE;
    const nx2 = sy / lenS;
    const ny2 = -sx / lenS;
    // promedio + escalado para mantener la distancia perpendicular en el bisector
    let bx = nx1 + nx2;
    let by = ny1 + ny2;
    const lenB = Math.hypot(bx, by);
    if (lenB < 1e-6) {
      // ángulo de 180° (vértices casi colineales): usar normal de entrada
      bx = nx1;
      by = ny1;
    } else {
      // escala = 1 / cos(ángulo/2) — derivado del producto interno bisector·normal
      const cosHalf = (bx * nx1 + by * ny1) / lenB;
      const escala = Math.min(3, 1 / Math.max(0.3, Math.abs(cosHalf)));
      bx = (bx / lenB) * escala;
      by = (by / lenB) * escala;
    }
    resultado[i] = { x: cur.x + bx * distancia, y: cur.y + by * distancia };
  }
  return resultado;
}
