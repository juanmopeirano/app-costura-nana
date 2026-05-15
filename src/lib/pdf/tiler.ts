import type { Pieza, Punto } from '../patrones/tipos';

// A4 en cm
export const A4 = { ancho: 21, alto: 29.7 };
// margen mínimo de impresora + 1cm para marcas y solapado
export const MARGEN = 1;
// solapado entre páginas adyacentes (para pegar con cinta)
export const SOLAPADO = 1;
// área útil por hoja
export const TILE = {
  ancho: A4.ancho - 2 * MARGEN, // 19cm
  alto: A4.alto - 2 * MARGEN, // 27.7cm
};
// avance neto por hoja (área útil - solapado)
export const AVANCE = {
  ancho: TILE.ancho - SOLAPADO, // 18cm
  alto: TILE.alto - SOLAPADO, // 26.7cm
};

export type PiezaPosicionada = {
  pieza: Pieza;
  dx: number; // traslación al sistema global
  dy: number;
};

export type Tile = {
  col: number;
  row: number;
  x0: number; // inicio en coordenadas globales (cm)
  y0: number;
  x1: number; // fin (= x0 + TILE.ancho)
  y1: number;
};

export type DisposicionPlana = {
  piezas: PiezaPosicionada[];
  bbox: { x: number; y: number; w: number; h: number };
  tiles: Tile[];
  cols: number;
  rows: number;
};

// Acomoda las piezas en una fila horizontal con separación `sep` cm.
// Luego calcula la grilla de tiles A4 que cubre toda la disposición.
export function disposicionPlana(piezas: Pieza[], sep = 2): DisposicionPlana {
  let cursor = 0;
  let maxAlto = 0;
  const posicionadas: PiezaPosicionada[] = piezas.map((pieza) => {
    const dx = cursor - pieza.bbox.x;
    const dy = -pieza.bbox.y;
    cursor += pieza.bbox.w + sep;
    maxAlto = Math.max(maxAlto, pieza.bbox.h);
    return { pieza, dx, dy };
  });

  const bbox = {
    x: 0,
    y: 0,
    w: cursor - sep, // quitar el último separador
    h: maxAlto,
  };

  // Cantidad de hojas A4 necesarias para cubrir la disposición.
  const cols = Math.max(1, Math.ceil(bbox.w / AVANCE.ancho));
  const rows = Math.max(1, Math.ceil(bbox.h / AVANCE.alto));
  const tiles: Tile[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x0 = col * AVANCE.ancho;
      const y0 = row * AVANCE.alto;
      tiles.push({
        col,
        row,
        x0,
        y0,
        x1: x0 + TILE.ancho,
        y1: y0 + TILE.alto,
      });
    }
  }

  return { piezas: posicionadas, bbox, tiles, cols, rows };
}

// Traduce un punto del molde + offset de pieza al sistema global de la disposición.
export const punto2Global = (p: Punto, dx: number, dy: number): Punto => ({
  x: p.x + dx,
  y: p.y + dy,
});

// ¿Algún punto del segmento ab cae dentro del tile? Heurística simple para
// decidir si vale la pena dibujar el segmento en esta hoja.
export function segmentoTocaTile(a: Punto, b: Punto, tile: Tile): boolean {
  // si ambos extremos están totalmente fuera del mismo lado, no toca
  if (a.x < tile.x0 && b.x < tile.x0) return false;
  if (a.x > tile.x1 && b.x > tile.x1) return false;
  if (a.y < tile.y0 && b.y < tile.y0) return false;
  if (a.y > tile.y1 && b.y > tile.y1) return false;
  return true;
}
