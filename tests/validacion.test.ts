import { describe, expect, it } from 'vitest';
import { validarMedida, validarMedidas } from '../src/lib/medidas/validacion';
import { MEDIDAS_VACIAS, TALLAS_SENA } from '../src/lib/patrones/tipos';

describe('validacion', () => {
  it('detecta valor faltante en medida requerida', () => {
    expect(validarMedida('busto', 0)).toMatch(/falta/i);
  });

  it('detecta valor fuera de rango razonable', () => {
    expect(validarMedida('busto', 20)).toMatch(/mínimo/i);
    expect(validarMedida('busto', 500)).toMatch(/máximo/i);
  });

  it('acepta talla 12 SENA en las medidas que cubre', () => {
    const t12 = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12] };
    const idsCubiertos = Object.keys(TALLAS_SENA[12]!);
    const erroresEnCubiertos = validarMedidas(t12).filter((e) =>
      idsCubiertos.includes(e.id),
    );
    expect(erroresEnCubiertos).toHaveLength(0);
  });

  it('detecta cintura mayor que busto', () => {
    const m = { ...MEDIDAS_VACIAS, ...TALLAS_SENA[12]!, busto: 70, cintura: 90 };
    const errores = validarMedidas(m);
    expect(errores.some((e) => e.id === 'busto')).toBe(true);
  });
});
