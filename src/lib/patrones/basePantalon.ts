import type { Diseno, Medidas, Pieza, Punto } from './tipos';
import { bbox, bezierCuadratica, pathDesdePuntos } from './geometria';
import { desahogos } from './holgura';

// Pantalón base — derivado del manual SENA p.28-29.
//
// Cada panel (delantero / posterior) se corta una vez espejado (cantidad 2,
// no sobre doblez). El sistema de coordenadas:
//   - x = 0 en la costura del costado (lateral exterior)
//   - x crece hacia la entrepiernas
//   - y = 0 en la cintura
//   - y crece hacia abajo (hacia la bota)

export type PanelPantalon = 'delantero' | 'posterior';

export function basePantalonPanel(
  panel: PanelPantalon,
  m: Medidas,
  d: Diseno,
): Pieza {
  const desah = desahogos(d.ajuste, d.tela);
  const extraEntrepiernas = m.cadera / 16; // clásico de patronaje
  const esDel = panel === 'delantero';

  // anchos a cada altura (de un cuarto del cuerpo + holgura)
  const cP = m.cintura / 4 + desah.cintura / 4;
  const cdP = m.cadera / 4 + desah.cadera / 4;
  // El delantero suele ser más angosto en cintura/cadera (la pinza/extra va al posterior)
  const factorDel = esDel ? 0.95 : 1.08;
  const cinturaPanel = cP * factorDel;
  const caderaPanel = cdP * factorDel;

  // Para el posterior la entrepierna es más profunda (genera más espacio en glúteo)
  const profEntrepiernas = caderaPanel + extraEntrepiernas * (esDel ? 0.8 : 1.4);

  // Mitades de rodilla y bota
  const halfRodilla = (m.rodilla > 0 ? m.rodilla / 2 : caderaPanel * 0.75) + 1;
  const halfBota = (m.bota > 0 ? m.bota / 2 : caderaPanel * 0.65) + 1;

  // Posiciones verticales
  const yCintura = 0;
  const yCadera = m.alturaCadera > 0 ? m.alturaCadera : 18;
  const yTiro = m.tiro > 0 ? m.tiro : 27;
  const largo = d.largo > 0 ? d.largo : m.largoPantalon > 0 ? m.largoPantalon : 100;
  const yLargo = largo;
  const yRodilla = yTiro + (yLargo - yTiro) * 0.55; // ~55% del camino tiro→bota

  // Pinzas en la cintura (las absorben la diferencia cintura↔cadera)
  const anchoPinzaTotal = Math.max(1.5, caderaPanel - cinturaPanel);
  const cinturaTotal = cinturaPanel + anchoPinzaTotal; // ancho real del molde en cintura
  const pinzaAncho = Math.min(2.5, anchoPinzaTotal);
  const pinzaCentroX = cinturaTotal / 2;
  const pinzaA: Punto = { x: pinzaCentroX + pinzaAncho / 2, y: yCintura };
  const pinzaB: Punto = { x: pinzaCentroX - pinzaAncho / 2, y: yCintura };
  const pinzaPunta: Punto = { x: pinzaCentroX, y: esDel ? 9 : 11 };

  // Puntos del contorno (CW)
  // Empezamos en la esquina superior externa (costado, cintura) y rodeamos
  const A: Punto = { x: 0, y: yCintura }; // costado-cintura
  const Acintura: Punto = { x: cinturaTotal, y: yCintura }; // entrepiernas-cintura
  const B: Punto = { x: caderaPanel, y: yCadera }; // costado-cadera (externo)
  const C: Punto = { x: profEntrepiernas, y: yTiro }; // entrepiernas-tiro (punto más interno)
  // Curva en J de la entrepierna desde Acintura → B (lado interno hacia abajo) hacia C
  // Simplificación: hacer la curva desde la cintura interna a la entrepierna
  const ctrlEntrepierna: Punto = {
    x: cinturaTotal + (esDel ? 1 : 2),
    y: yTiro * 0.55,
  };
  const N = 8;
  const curvaEntrepierna: Punto[] = [];
  for (let i = 1; i < N; i++) {
    curvaEntrepierna.push(bezierCuadratica(Acintura, ctrlEntrepierna, C, i / N));
  }

  // Costura interna: desde C bajando a la rodilla y luego a la bota.
  // El interior se angosta de profEntrepiernas hacia halfRodilla
  const rodillaInternaCorr: Punto = { x: Math.max(0, halfRodilla), y: yRodilla };
  const botaInterna: Punto = { x: Math.max(0, halfBota * 0.5 + halfRodilla * 0.5), y: yLargo };
  // Bota es horizontal entre botaInterna y botaExterna
  const botaExterna: Punto = { x: -halfBota * 0 + 0, y: yLargo }; // costado externo

  // Costura externa (lateral): desde A bajando suavemente
  const rodillaExterna: Punto = { x: 0, y: yRodilla };

  // Curva sutil del costado entre cadera y rodilla (más cerrada para sirena/ajustado)
  // Por simplicidad: línea recta-curva de A→B→rodillaExterna→botaExterna
  const contorno: Punto[] = [];
  // Cintura: A → pinzaA → punta → pinzaB → Acintura
  contorno.push(A);
  // Sube a la cintura: vamos hacia la pinza al medio
  // Cintura es horizontal
  if (esDel) {
    // Frente: la pinza está alineada con el ápice de la cadera (front)
    contorno.push(pinzaB);
    contorno.push(pinzaPunta);
    contorno.push(pinzaA);
  } else {
    // Posterior: la pinza está más alta y profunda
    contorno.push(pinzaB);
    contorno.push(pinzaPunta);
    contorno.push(pinzaA);
  }
  contorno.push(Acintura);
  // Curva de la entrepierna
  contorno.push(...curvaEntrepierna);
  contorno.push(C);
  // Bajada por la cara interna
  contorno.push(rodillaInternaCorr);
  contorno.push(botaInterna);
  // Bota (horizontal)
  contorno.push(botaExterna);
  // Subida por el costado externo
  contorno.push(rodillaExterna);
  contorno.push(B);
  // Cerramos al A (implícito)

  // Línea de hilo: vertical desde la cintura hasta la bota, ubicada en el
  // centro del panel
  const hiloX = (caderaPanel + 0) / 2;
  return {
    nombre: panel === 'delantero' ? 'Pantalón delantero' : 'Pantalón posterior',
    cantidad: 2, // se corta 2 veces espejado
    cortarSobreDoblez: false,
    contornoPuntos: contorno,
    contornoPath: pathDesdePuntos(contorno, true),
    piquetes: [B, C, { x: 0, y: yTiro }],
    hilo: { a: { x: hiloX, y: 5 }, b: { x: hiloX, y: yLargo - 3 } },
    pinzas: [
      { a: pinzaA, b: pinzaPunta },
      { a: pinzaB, b: pinzaPunta },
    ],
    bbox: bbox([A, Acintura, B, C, rodillaInternaCorr, botaInterna, botaExterna, rodillaExterna]),
  };
}
