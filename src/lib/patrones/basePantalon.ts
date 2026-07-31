import type { Diseno, Medidas, Pieza, Punto } from './tipos';
import { bbox, bezierCuadratica, pathDesdePuntos, punto } from './geometria';
import { desahogos } from './holgura';

// Pantalón base — derivado del manual SENA p.28-29.
//
// Cada panel (delantero / posterior) se corta dos veces espejado. Sistema de
// coordenadas, en sentido horario para que el margen de costura salga hacia
// afuera:
//   - x = 0 en el costado a la altura de la cadera (el punto más externo)
//   - x crece hacia la entrepierna (centro delantero / centro posterior)
//   - y = 0 en la cintura, y crece hacia la bota
//
// De la cintura a la cadera el costado se entalla y el resto de la diferencia
// lo absorben las pinzas. De la cadera para abajo la pierna se afina hacia
// rodilla y bota, centrada sobre la línea de hilo.

export type PanelPantalon = 'delantero' | 'posterior';

// El delantero es más angosto que el posterior; los factores suman 2 para que
// los cuatro paneles cierren exactamente el contorno del cuerpo + desahogo.
const FACTOR_DELANTERO = 0.96;
const FACTOR_POSTERIOR = 1.04;

// Cuánto sobresale el gancho más allá de la línea de cadera, como fracción del
// contorno de cadera. El posterior necesita el doble para alojar el glúteo.
const GANCHO_DELANTERO = 1 / 20;
const GANCHO_POSTERIOR = 1 / 10;

const ANCHO_PINZA_MAX = 3.5;

export function basePantalonPanel(
  panel: PanelPantalon,
  m: Medidas,
  d: Diseno,
): Pieza {
  const desah = desahogos(d.ajuste, d.tela);
  const esDel = panel === 'delantero';
  const factor = esDel ? FACTOR_DELANTERO : FACTOR_POSTERIOR;

  const cadera = m.cadera > 0 ? m.cadera : 96;
  const cintura = m.cintura > 0 ? m.cintura : 68;

  // Anchos del panel. En cintura y cadera cada panel cubre un cuarto del cuerpo
  // (los cuatro paneles rodean el torso); en rodilla y bota cubre la mitad
  // (sólo dos paneles rodean cada pierna).
  const anchoCadera = (cadera / 4 + desah.cadera / 4) * factor;
  const anchoCintura = (cintura / 4 + desah.cintura / 4) * factor;
  const holguraPierna = Math.max(2, desah.cadera * 0.4);
  const anchoRodilla = ((m.rodilla > 0 ? m.rodilla : 36) + holguraPierna) / 2 * factor;
  const anchoBota = ((m.bota > 0 ? m.bota : 24) + holguraPierna) / 2 * factor;

  // Alturas
  const yCadera = m.alturaCadera > 0 ? m.alturaCadera : 18;
  const yTiro = Math.max(yCadera + 4, m.tiro > 0 ? m.tiro : 27);
  const yLargo = d.largo > 0 ? d.largo : m.largoPantalon > 0 ? m.largoPantalon : 100;
  const yRodilla = yTiro + (yLargo - yTiro) * 0.48;

  // Entalle del costado: parte de la diferencia cintura↔cadera se saca en la
  // costura lateral, el resto va a las pinzas.
  const diferencia = Math.max(0, anchoCadera - anchoCintura);
  const entalleCostado = Math.min(2, diferencia * 0.35);
  const xCinturaCostado = entalleCostado;
  const xCinturaCentro = anchoCadera;

  // Gancho (entrepierna)
  const gancho = cadera * (esDel ? GANCHO_DELANTERO : GANCHO_POSTERIOR);
  const xGancho = anchoCadera + gancho;

  // La pierna se centra sobre la línea de hilo, entre el costado y el gancho.
  const xHilo = xGancho / 2;

  const A: Punto = punto(xCinturaCostado, 0); // cintura, costado
  const B: Punto = punto(xCinturaCentro, 0); // cintura, centro
  const caderaCentro: Punto = punto(anchoCadera, yCadera);
  const C: Punto = punto(xGancho, yTiro); // punta del gancho
  const rodillaInterna: Punto = punto(xHilo + anchoRodilla / 2, yRodilla);
  const botaInterna: Punto = punto(xHilo + anchoBota / 2, yLargo);
  const botaExterna: Punto = punto(xHilo - anchoBota / 2, yLargo);
  const rodillaExterna: Punto = punto(xHilo - anchoRodilla / 2, yRodilla);
  const caderaCostado: Punto = punto(0, yCadera);

  // Pinzas en la cintura: absorben toda la diferencia que no tomó el costado.
  const anchoCinturaMolde = xCinturaCentro - xCinturaCostado;
  const pinzasTotal = Math.max(0, anchoCinturaMolde - anchoCintura);
  const largoPinza = esDel ? 9 : 12;
  const cantidadPinzas = pinzasTotal > ANCHO_PINZA_MAX ? 2 : pinzasTotal > 0 ? 1 : 0;
  const anchoPinza = cantidadPinzas > 0 ? pinzasTotal / cantidadPinzas : 0;
  const centrosPinza =
    cantidadPinzas === 2
      ? [xCinturaCostado + anchoCinturaMolde / 3, xCinturaCostado + (anchoCinturaMolde * 2) / 3]
      : cantidadPinzas === 1
      ? [xCinturaCostado + anchoCinturaMolde / 2]
      : [];

  const pinzas = centrosPinza.map((cx) => ({
    a: punto(cx - anchoPinza / 2, 0),
    punta: punto(cx, largoPinza),
    b: punto(cx + anchoPinza / 2, 0),
  }));

  // Curva del gancho: baja casi recta desde la cadera y recién ahí engancha
  // hacia afuera, formando la J característica.
  const ctrlGancho = punto(anchoCadera + gancho * 0.15, yTiro);
  const curvaGancho = muestrear(8, (t) => bezierCuadratica(caderaCentro, ctrlGancho, C, t));

  // Entrepierna: del gancho a la rodilla, levemente cóncava hacia la pierna.
  const ctrlEntrepierna = punto(
    rodillaInterna.x + (C.x - rodillaInterna.x) * 0.25,
    yTiro + (yRodilla - yTiro) * 0.5,
  );
  const curvaEntrepierna = muestrear(6, (t) => bezierCuadratica(C, ctrlEntrepierna, rodillaInterna, t));

  // Costado: de la cintura a la cadera, curva suave.
  const ctrlCostado = punto(0, yCadera * 0.55);
  const curvaCostado = muestrear(6, (t) => bezierCuadratica(caderaCostado, ctrlCostado, A, t));

  const contornoPuntos: Punto[] = [
    A,
    ...pinzas.flatMap((p) => [p.a, p.punta, p.b]),
    B,
    caderaCentro,
    ...curvaGancho,
    C,
    ...curvaEntrepierna,
    rodillaInterna,
    botaInterna,
    botaExterna,
    rodillaExterna,
    caderaCostado,
    ...curvaCostado,
  ];

  return {
    nombre: esDel ? 'Pantalón delantero' : 'Pantalón posterior',
    cantidad: 2,
    cortarSobreDoblez: false,
    contornoPuntos,
    contornoPath: pathDesdePuntos(contornoPuntos, true),
    piquetes: [caderaCostado, caderaCentro, C, rodillaExterna, rodillaInterna],
    hilo: { a: punto(xHilo, yCadera), b: punto(xHilo, yLargo - 3) },
    pinzas: pinzas.flatMap((p) => [
      { a: p.a, b: p.punta },
      { a: p.b, b: p.punta },
    ]),
    bbox: bbox(contornoPuntos),
  };
}

// Puntos intermedios de una curva, sin repetir los extremos.
function muestrear(n: number, f: (t: number) => Punto): Punto[] {
  const puntos: Punto[] = [];
  for (let i = 1; i < n; i++) puntos.push(f(i / n));
  return puntos;
}
