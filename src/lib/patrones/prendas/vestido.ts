import { corpinoDelantero, corpinoEspalda } from '../baseCorpino';
import { baseFaldaPanel } from '../baseFalda';
import { baseManga, largoPorTipoManga, necesitaManga } from '../baseManga';
import type { Diseno, Medidas, Patron, Pieza } from '../tipos';
import { newId } from '../../utils/id';

// Vestido simple = corpino hasta cintura + falda con largo = largoVestido - talleAtras.
//
// Para V1 generamos 4 piezas separadas (corpino delantero + espalda, falda
// delantera + posterior). El usuario las cose:
//   1) Los hombros (corpino delantero + espalda)
//   2) La costura central de la falda (delantera con posterior)
//   3) Une cintura del corpino con cintura de la falda
//   4) Los costados completos.

export function generarVestido(m: Medidas, d: Diseno, nombrePerfil: string): Patron {
  const corpDel = corpinoDelantero(m, d, { largo: 'vestido_cintura' });
  const corpEsp = corpinoEspalda(m, d, { largo: 'vestido_cintura' });

  // Falda: el largo es largoVestido - talleAtras (desde cintura)
  const largoFalda = Math.max(20, d.largo - m.talleAtras);
  const disenoFalda: Diseno = {
    ...d,
    largo: largoFalda,
    variantePollera: d.varianteVestido === 'corte_princesa' || d.varianteVestido === 'corte_frances'
      ? 'recta'
      : (d.variantePollera ?? 'recta'),
  };
  const faldaDel = baseFaldaPanel('delantero', m, disenoFalda);
  faldaDel.nombre = 'Falda delantera (vestido)';
  const faldaPos = baseFaldaPanel('posterior', m, disenoFalda);
  faldaPos.nombre = 'Falda posterior (vestido)';

  const piezas: Pieza[] = [corpDel, corpEsp, faldaDel, faldaPos];

  if (necesitaManga(d.manga)) {
    piezas.push(baseManga(m, d, largoPorTipoManga(m, d.manga)));
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
