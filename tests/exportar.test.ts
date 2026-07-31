import { describe, expect, it } from 'vitest';
import { aWinAnsi, exportarPatronPDF } from '../src/lib/pdf/exportar';
import { generarPollera } from '../src/lib/patrones/prendas/pollera';
import { generarVestido } from '../src/lib/patrones/prendas/vestido';
import { disposicionPlana, tilesConPiezas } from '../src/lib/pdf/tiler';
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

describe('exportarPatronPDF', () => {
  it('genera un PDF válido para una pollera talla 12', async () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const patron = generarPollera(m, dis, 'Nana');
    const bytes = await exportarPatronPDF(patron);

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(1000); // PDF mínimo razonable
    // Header de PDF: %PDF-1.x
    const header = new TextDecoder().decode(bytes.slice(0, 8));
    expect(header).toMatch(/^%PDF-1/);
  });

  it('soporta nombres con acentos sin reventar', async () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const patron = generarPollera(m, dis, 'María José');
    const bytes = await exportarPatronPDF(patron);
    expect(bytes.length).toBeGreaterThan(1000);
  });

  it('soporta emoji y símbolos raros en el texto libre de la usuaria', async () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const patron = generarPollera(
      m,
      {
        ...dis,
        tituloPatron: 'Pollera de verano 🌞',
        especificaciones: 'Botones ✿ nacarados — 6 unidades\nCinta al tono 中文 ok',
      },
      'Nana',
    );
    const bytes = await exportarPatronPDF(patron);
    expect(bytes.length).toBeGreaterThan(1000);
  });
});

describe('aWinAnsi', () => {
  it('translitera acentos y descarta lo que no codifica WinAnsi', () => {
    expect(aWinAnsi('María — 5 × 2 …')).toBe('Maria - 5 x 2 ...');
    expect(aWinAnsi('sol 🌞 luna')).toBe('sol  luna');
    expect(aWinAnsi('ñ ç ü °')).toBe('ñ ç u °'); // ñ, ç y ° sí son WinAnsi
  });
});

describe('hojas del PDF', () => {
  it('no genera hojas en blanco', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12], alturaCadera: 18.25 };
    const patron = generarVestido(m, { ...dis, prenda: 'vestido', largo: 100 }, 'Nana');
    const disp = disposicionPlana(patron.piezas);
    const tiles = tilesConPiezas(disp, 1);

    expect(tiles.length).toBeLessThan(disp.tiles.length);
    for (const t of tiles) {
      const tocada = disp.piezas.some(({ pieza, dx, dy }) => {
        const x0 = pieza.bbox.x + dx - 1;
        const y0 = pieza.bbox.y + dy - 1;
        const x1 = x0 + pieza.bbox.w + 2;
        const y1 = y0 + pieza.bbox.h + 2;
        return !(x1 < t.x0 || x0 > t.x1 || y1 < t.y0 || y0 > t.y1);
      });
      expect(tocada, `tile ${t.col},${t.row}`).toBe(true);
    }
  });
});
