import { basePantalonPanel } from '../basePantalon';
import type { Diseno, Medidas, Patron } from '../tipos';
import { newId } from '../../utils/id';

export function generarPantalon(m: Medidas, d: Diseno, nombrePerfil: string): Patron {
  const del = basePantalonPanel('delantero', m, d);
  const pos = basePantalonPanel('posterior', m, d);
  return {
    id: newId(),
    createdAt: Date.now(),
    nombrePerfil,
    medidas: m,
    diseno: d,
    piezas: [del, pos],
  };
}
