import { describe, expect, it } from 'vitest';
import { exportarPatronPDF } from '../src/lib/pdf/exportar';
import { generarPollera } from '../src/lib/patrones/prendas/pollera';
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
});
