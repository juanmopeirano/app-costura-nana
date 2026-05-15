import { corpinoDelantero, corpinoEspalda } from '../baseCorpino';
import { baseManga, largoPorTipoManga, necesitaManga } from '../baseManga';
import type { Diseno, Medidas, Patron, Pieza } from '../tipos';
import { newId } from '../../utils/id';

export function generarBlusa(m: Medidas, d: Diseno, nombrePerfil: string): Patron {
  const delantero = corpinoDelantero(m, d, { largo: 'blusa', largoPrenda: d.largo });
  const espalda = corpinoEspalda(m, d, { largo: 'blusa', largoPrenda: d.largo });
  const piezas: Pieza[] = [delantero, espalda];

  if (necesitaManga(d.manga)) {
    const largoManga = largoPorTipoManga(m, d.manga);
    piezas.push(baseManga(m, d, largoManga));
  }
  // Si manga = kimona o raglán: V1 muestra la misma manga base con etiqueta
  // explicativa. La implementación real (corpiño modificado) viene después.
  if (d.manga === 'kimona' || d.manga === 'raglan') {
    const manga = baseManga(m, d, m.largoManga);
    manga.nombre = d.manga === 'kimona' ? 'Manga (kimona, ver indicaciones)' : 'Manga (raglán, ver indicaciones)';
    piezas.push(manga);
  }

  return {
    id: newId(),
    createdAt: Date.now(),
    nombrePerfil,
    medidas: m,
    diseno: d,
    piezas,
  };
}
