import { MEDIDAS_VACIAS, TALLAS_SENA } from '../src/lib/patrones/tipos';
import type { Diseno, Medidas } from '../src/lib/patrones/tipos';

export function medidasTalla(talla: keyof typeof TALLAS_SENA): Medidas {
  return { ...MEDIDAS_VACIAS, ...TALLAS_SENA[talla] };
}

export function disenoBase(over: Partial<Diseno> = {}): Diseno {
  return {
    prenda: 'pollera',
    escote: 'redondo',
    manga: 'sin',
    largo: 60,
    ajuste: 'regular',
    tela: 'plano_medio',
    cierre: 'cremallera_invisible',
    margenCostura: 1,
    variantePollera: 'recta',
    varianteVestido: 'simple',
    ...over,
  };
}
