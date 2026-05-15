import { baseFaldaPanel } from '../baseFalda';
import type { Diseno, Medidas, Patron } from '../tipos';
import { newId } from '../../utils/id';

export function generarPollera(m: Medidas, d: Diseno, nombrePerfil: string): Patron {
  const delantero = baseFaldaPanel('delantero', m, d);
  const posterior = baseFaldaPanel('posterior', m, d);

  return {
    id: newId(),
    createdAt: Date.now(),
    nombrePerfil,
    medidas: m,
    diseno: d,
    piezas: [delantero, posterior],
  };
}
