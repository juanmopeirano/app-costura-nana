import type { Diseno, Manga, Medidas, Pieza, Punto } from './tipos';
import { bbox, bezierCuadratica, pathDesdePuntos } from './geometria';
import { desahogos } from './holgura';

// Manga base "set-in" (sastre clásica). Sigue el patrón SENA p.26-27.
//
// Sistema de coordenadas (manga abierta, vista frontal):
//   - x = 0 en la línea de hilo / cumbre de la cabeza de manga
//   - x crece hacia el frente (lado delantero)
//   - y = 0 en la cumbre, y crece hacia abajo (hacia el puño)
//
// La manga es simétrica respecto a x = 0. Se corta 2 veces (espejada).

const ALTURA_CABEZA = 15; // cm — estándar SENA

export function baseManga(m: Medidas, d: Diseno, largoFinal?: number): Pieza {
  const desah = desahogos(d.ajuste, d.tela);
  const anchoBrazo = m.brazo + desah.brazo;
  const anchoPuno = m.muneca + 4; // 4cm de holgura para entrada de mano
  const largo = largoFinal ?? m.largoManga;

  // Mitad del ancho a la altura de la cabeza
  const halfTop = anchoBrazo / 2;
  // Mitad del ancho al puño
  const halfBot = anchoPuno / 2;

  const cumbre: Punto = { x: 0, y: 0 };
  // Sisa delantero / posterior
  const sisaDel: Punto = { x: halfTop, y: ALTURA_CABEZA };
  const sisaAtr: Punto = { x: -halfTop, y: ALTURA_CABEZA };
  // Puño
  const punoDel: Punto = { x: halfBot, y: largo };
  const punoAtr: Punto = { x: -halfBot, y: largo };

  // Curva de la cabeza de manga (en S):
  //   - Lado delantero: ligeramente cóncavo (control a la mitad, x ligeramente menor)
  //   - Lado atrás: ligeramente convexo (control a la mitad, x ligeramente mayor)
  const ctrlDel: Punto = { x: halfTop * 0.65, y: ALTURA_CABEZA * 0.3 };
  const ctrlAtr: Punto = { x: -halfTop * 0.65, y: ALTURA_CABEZA * 0.3 };

  const N = 10;
  const cabezaDel: Punto[] = [];
  for (let i = 1; i < N; i++) {
    cabezaDel.push(bezierCuadratica(cumbre, ctrlDel, sisaDel, i / N));
  }
  const cabezaAtr: Punto[] = [];
  for (let i = 1; i < N; i++) {
    cabezaAtr.push(bezierCuadratica(cumbre, ctrlAtr, sisaAtr, i / N));
  }

  // Contorno CW desde cumbre:
  // cumbre -> cabezaDel -> sisaDel -> punoDel -> punoAtr -> sisaAtr -> cabezaAtr (reverse) -> cumbre
  const contorno: Punto[] = [];
  contorno.push(cumbre);
  contorno.push(...cabezaDel);
  contorno.push(sisaDel);
  contorno.push(punoDel);
  contorno.push(punoAtr);
  contorno.push(sisaAtr);
  contorno.push(...[...cabezaAtr].reverse());

  return {
    nombre: 'Manga',
    cantidad: 2,
    cortarSobreDoblez: false,
    contornoPuntos: contorno,
    contornoPath: pathDesdePuntos(contorno, true),
    piquetes: [
      // marcas en la sisa: a 1/3 del largo de la cabeza
      cabezaDel[Math.floor(cabezaDel.length / 2)],
      cabezaAtr[Math.floor(cabezaAtr.length / 2)],
    ],
    hilo: { a: { x: 0, y: 3 }, b: { x: 0, y: largo - 3 } },
    pinzas: [],
    bbox: bbox([cumbre, sisaDel, sisaAtr, punoDel, punoAtr]),
  };
}

export function largoPorTipoManga(m: Medidas, tipo: Manga): number {
  switch (tipo) {
    case 'corta':
      return 18;
    case 'tres_cuartos':
      return Math.min(40, m.largoManga);
    case 'larga':
      return m.largoManga;
    case 'kimona':
    case 'raglan':
      // En V1 estos no usan baseManga (se manejan por separado)
      return m.largoManga;
    case 'sin':
    default:
      return 0;
  }
}

export function necesitaManga(tipo: Manga): boolean {
  return tipo === 'corta' || tipo === 'tres_cuartos' || tipo === 'larga';
}
