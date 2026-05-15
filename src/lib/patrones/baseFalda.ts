import type { Diseno, Medidas, Pieza, Punto } from './tipos';
import { bbox, bezierCuadratica, pathDesdePuntos, punto } from './geometria';
import { desahogos } from './holgura';

// Pasos del Manual SENA p.31-32 (Base de falda una pinza). Devuelve la pieza
// "Falda delantera" (espejada en costura central) y "Falda posterior". Cada
// panel cubre el cuarto del contorno + desahogo + pinza, con curva del costado
// entre cintura y cadera.

export type PanelFalda = 'delantero' | 'posterior';

export function baseFaldaPanel(
  panel: PanelFalda,
  m: Medidas,
  d: Diseno,
): Pieza {
  const desah = desahogos(d.ajuste, d.tela);
  // ancho a la cadera (1/4 del contorno + 1/4 del desahogo)
  const aCadera = m.cadera / 4 + desah.cadera / 4;
  // ancho a la cintura (1/4 del contorno + 1/4 del desahogo)
  const aCintura = m.cintura / 4 + desah.cintura / 4;
  // diferencia entre cadera y cintura → curva + pinza
  const diferencia = Math.max(0, aCadera - aCintura);
  // pinza típica: delantero más chica que posterior (manual SENA)
  const anchoPinza = panel === 'posterior'
    ? Math.min(3.5, Math.max(2, diferencia * 0.5))
    : Math.min(2.5, Math.max(1, diferencia * 0.35));
  const largoPinza = panel === 'posterior' ? 11 : 9; // cm
  // lo que no absorbe la pinza lo absorbe la curva del costado
  const aCinturaTotal = aCintura + anchoPinza; // ancho del molde en la cintura

  const alturaCadera = m.alturaCadera;
  const largoTotal = d.largo > 0 ? d.largo : m.largoFalda;

  // Referencias de puntos (origen en esquina superior-costado del panel)
  // x crece hacia el centro del molde (lomo), y crece hacia abajo.
  const O = punto(0, 0); // costado superior (cintura, costado)
  const C = punto(0, alturaCadera); // costado a la altura de la cadera
  const B = punto(0, largoTotal); // costado en el ruedo
  const E = punto(aCadera, largoTotal); // centro/lomo en el ruedo
  const D = punto(aCadera, alturaCadera); // cadera lomo
  const A = punto(aCinturaTotal, 0); // centro/lomo en la cintura

  // Curva del costado (cintura → cadera): control point al promedio horizontal
  // para suavidad. Bezier cuadrático.
  const ctrlCostado: Punto = punto(0, alturaCadera * 0.55);
  const segmentos = 8;
  const curvaCostado: Punto[] = [];
  for (let i = 1; i < segmentos; i++) {
    const t = i / segmentos;
    curvaCostado.push(bezierCuadratica(O, ctrlCostado, C, t));
  }

  // Contorno completo (cierra desde O en sentido horario):
  // O (cintura,costado) → curva → C (cadera,costado) → B (ruedo,costado)
  //   → E (ruedo,centro) → D (cadera,centro) → A (cintura,centro) → cintura → O
  // La línea de cintura se dibuja recta desde A hacia O en x,
  // con la pinza centrada.
  const cinturaInicio = A;
  const cinturaFin = O;
  const cinturaLargo = cinturaInicio.x - cinturaFin.x;
  // pinza centrada en el panel
  const pinzaCentroX = cinturaFin.x + cinturaLargo * (panel === 'posterior' ? 0.4 : 0.55);
  const pinzaA = punto(pinzaCentroX + anchoPinza / 2, 0);
  const pinzaB = punto(pinzaCentroX - anchoPinza / 2, 0);
  const pinzaPunta = punto(pinzaCentroX, largoPinza);

  const cinturaPuntos: Punto[] = [cinturaInicio, pinzaA, pinzaPunta, pinzaB, cinturaFin];

  const contornoPuntos: Punto[] = [
    O,
    ...curvaCostado,
    C,
    B,
    E,
    D,
    A,
    ...cinturaPuntos.slice(1),
  ];

  return {
    nombre: panel === 'delantero' ? 'Falda delantera' : 'Falda posterior',
    cantidad: 1,
    cortarSobreDoblez: true,
    contornoPuntos,
    contornoPath: pathDesdePuntos(contornoPuntos, true),
    piquetes: [C, D], // marcar línea de cadera
    hilo: {
      a: punto(aCadera, 5),
      b: punto(aCadera, largoTotal - 5),
    },
    pinzas: [
      { a: pinzaA, b: pinzaPunta },
      { a: pinzaB, b: pinzaPunta },
    ],
    bbox: bbox([O, C, B, E, D, A]),
  };
}
