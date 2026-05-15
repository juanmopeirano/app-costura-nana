import { corpinoDelantero, corpinoEspalda } from '../baseCorpino';
import type { Diseno, Medidas, Patron } from '../tipos';
import { newId } from '../../utils/id';

export function generarTop(m: Medidas, d: Diseno, nombrePerfil: string): Patron {
  const delantero = corpinoDelantero(m, d, { largo: 'top', largoPrenda: d.largo });
  const espalda = corpinoEspalda(m, d, { largo: 'top', largoPrenda: d.largo });
  return {
    id: newId(),
    createdAt: Date.now(),
    nombrePerfil,
    medidas: m,
    diseno: d,
    piezas: [delantero, espalda],
  };
}
