import type { Medidas } from '../patrones/tipos';

export type CategoriaMedida = 'contorno' | 'ancho' | 'largo' | 'altura' | 'largo_prenda';
export type VistaIlustracion = 'frontal' | 'posterior' | 'lateral' | 'brazo';

export type PasoMedida = {
  id: keyof Medidas;
  label: string;
  instruccion: string;
  categoria: CategoriaMedida;
  vista: VistaIlustracion;
  highlight: string; // id del trazo de la ilustración (ver IlustracionMedida)
  min: number;
  max: number;
  defecto?: number;
  requerida: boolean;
  tip?: string;
};

// 23 medidas en orden didáctico — agrupadas para que la usuaria no tenga que
// cambiar de cinta/posición demasiado entre pasos. Instrucciones tomadas del
// Manual SENA de Patronaje Básico (2011), pp. 13-17.
export const CATALOGO_MEDIDAS: PasoMedida[] = [
  // Contornos del torso (la usuaria se queda de pie con la cinta horizontal)
  {
    id: 'busto',
    label: 'Contorno de busto',
    instruccion:
      'Pasá la cinta alrededor del torso, por la parte más sobresaliente del busto, horizontal y sin apretar.',
    categoria: 'contorno',
    vista: 'frontal',
    highlight: 'busto',
    min: 60,
    max: 150,
    defecto: 92,
    requerida: true,
    tip: 'La cinta debe pasar exactamente por las puntas de los pezones.',
  },
  {
    id: 'cintura',
    label: 'Contorno de cintura',
    instruccion:
      'Pasá la cinta alrededor de la parte más angosta del torso, sobre el ombligo, ligeramente tensionada.',
    categoria: 'contorno',
    vista: 'frontal',
    highlight: 'cintura',
    min: 50,
    max: 140,
    defecto: 68,
    requerida: true,
  },
  {
    id: 'cadera',
    label: 'Contorno de cadera',
    instruccion:
      'Pasá la cinta alrededor de la cadera, por la parte más sobresaliente de los glúteos, horizontal.',
    categoria: 'contorno',
    vista: 'frontal',
    highlight: 'cadera',
    min: 70,
    max: 160,
    defecto: 96,
    requerida: true,
  },
  {
    id: 'cuello',
    label: 'Contorno de cuello',
    instruccion:
      'Pasá la cinta alrededor del cuello, partiendo de la séptima cervical, pasando por las fosas supraclaviculares, dejándola caer ligeramente tensionada.',
    categoria: 'contorno',
    vista: 'frontal',
    highlight: 'cuello',
    min: 28,
    max: 50,
    defecto: 36,
    requerida: true,
  },
  {
    id: 'brazo',
    label: 'Contorno de brazo',
    instruccion: 'Pasá la cinta horizontal alrededor de la parte más sobresaliente del bíceps.',
    categoria: 'contorno',
    vista: 'brazo',
    highlight: 'biceps',
    min: 20,
    max: 55,
    defecto: 28,
    requerida: true,
  },
  {
    id: 'muneca',
    label: 'Contorno de muñeca',
    instruccion: 'Pasá la cinta alrededor de la muñeca, tocando los huesos del radio y cúbito.',
    categoria: 'contorno',
    vista: 'brazo',
    highlight: 'muneca',
    min: 12,
    max: 25,
    defecto: 16,
    requerida: true,
  },

  // Anchos (frontal y posterior)
  {
    id: 'hombroAHombro',
    label: 'Hombro a hombro',
    instruccion:
      'Pasá la cinta horizontalmente de un punto acromio al otro (puntas óseas del hombro).',
    categoria: 'ancho',
    vista: 'frontal',
    highlight: 'hombro_a_hombro',
    min: 30,
    max: 50,
    defecto: 38,
    requerida: true,
  },
  {
    id: 'anchoEspalda',
    label: 'Ancho de espalda',
    instruccion:
      'Pasá la cinta por la espalda, desde el pliegue posterior post-axilar de un lado al otro, pasando por los omóplatos.',
    categoria: 'ancho',
    vista: 'posterior',
    highlight: 'ancho_espalda',
    min: 28,
    max: 48,
    defecto: 35,
    requerida: true,
  },
  {
    id: 'anchoPecho',
    label: 'Ancho de pecho',
    instruccion:
      'Pasá la cinta por la parte plana del tórax (arriba del busto), del pliegue anterior post-axilar de un lado al otro.',
    categoria: 'ancho',
    vista: 'frontal',
    highlight: 'ancho_pecho',
    min: 26,
    max: 46,
    defecto: 33,
    requerida: true,
  },
  {
    id: 'separacionBusto',
    label: 'Separación de busto',
    instruccion: 'Mediná horizontalmente de pezón a pezón.',
    categoria: 'ancho',
    vista: 'frontal',
    highlight: 'separacion_busto',
    min: 14,
    max: 28,
    defecto: 18,
    requerida: true,
  },

  // Largos del torso
  {
    id: 'talleFrente',
    label: 'Talle delantero',
    instruccion:
      'Cinta vertical desde la fosa supraclavicular (ángulo cuello-hombro) bajando hasta la cintura, pasando por la punta del busto.',
    categoria: 'largo',
    vista: 'frontal',
    highlight: 'talle_frente',
    min: 38,
    max: 55,
    defecto: 45,
    requerida: true,
  },
  {
    id: 'talleAtras',
    label: 'Talle de espalda',
    instruccion:
      'Cinta desde la fosa supraclavicular siguiendo la línea media vertebral hasta la cintura.',
    categoria: 'largo',
    vista: 'posterior',
    highlight: 'talle_atras',
    min: 36,
    max: 52,
    defecto: 43,
    requerida: true,
  },
  {
    id: 'largoEspalda',
    label: 'Largo de espalda',
    instruccion:
      'Cinta desde la séptima vértebra cervical (huesito que sobresale al inclinar la cabeza) hasta el promontorio lumbar (cintura por la espalda).',
    categoria: 'largo',
    vista: 'posterior',
    highlight: 'largo_espalda',
    min: 32,
    max: 48,
    defecto: 40,
    requerida: true,
  },
  {
    id: 'centroFrente',
    label: 'Centro frente',
    instruccion:
      'Cinta desde la base del cuello (centro del puño, hueso al frente) hasta la cintura por el centro del torso.',
    categoria: 'largo',
    vista: 'frontal',
    highlight: 'centro_frente',
    min: 30,
    max: 45,
    defecto: 37,
    requerida: true,
  },
  {
    id: 'centroAtras',
    label: 'Centro atrás',
    instruccion: 'Cinta desde la séptima cervical hasta la cintura, por la línea media vertebral.',
    categoria: 'largo',
    vista: 'posterior',
    highlight: 'centro_atras',
    min: 34,
    max: 50,
    defecto: 41,
    requerida: true,
  },
  {
    id: 'hombro',
    label: 'Largo de hombro',
    instruccion:
      'Cinta sobre el hombro desde la fosa supraclavicular hasta el punto acromio (huesito de la punta del hombro).',
    categoria: 'largo',
    vista: 'frontal',
    highlight: 'hombro',
    min: 9,
    max: 16,
    defecto: 12,
    requerida: true,
  },
  {
    id: 'costado',
    label: 'Costado',
    instruccion:
      'Cinta vertical desde el punto medio de la axila hasta donde termina la parrilla costal (donde empieza la cintura).',
    categoria: 'largo',
    vista: 'lateral',
    highlight: 'costado',
    min: 14,
    max: 25,
    defecto: 19.5,
    requerida: true,
  },

  // Alturas (referencias verticales)
  {
    id: 'alturaBusto',
    label: 'Altura de busto',
    instruccion: 'Cinta vertical desde la fosa supraclavicular hasta el pezón.',
    categoria: 'altura',
    vista: 'frontal',
    highlight: 'altura_busto',
    min: 20,
    max: 35,
    defecto: 26,
    requerida: true,
  },
  {
    id: 'alturaCadera',
    label: 'Altura de cadera',
    instruccion: 'Cinta vertical desde la cintura hasta la parte más sobresaliente de la cadera.',
    categoria: 'altura',
    vista: 'lateral',
    highlight: 'altura_cadera',
    min: 14,
    max: 24,
    defecto: 18,
    requerida: true,
  },

  // Largos finales (deseados, varían por prenda y gusto)
  {
    id: 'largoManga',
    label: 'Largo de manga',
    instruccion:
      'Con el brazo doblado y la mano en la cadera, mediná desde el punto acromio pasando por el codo hasta el huesito de la muñeca.',
    categoria: 'largo_prenda',
    vista: 'brazo',
    highlight: 'largo_manga',
    min: 45,
    max: 75,
    defecto: 60,
    requerida: true,
  },
  {
    id: 'largoBlusa',
    label: 'Largo de blusa',
    instruccion:
      'Desde la séptima cervical hasta donde querés que termine la blusa. Por defecto unos centímetros debajo de la cadera.',
    categoria: 'largo_prenda',
    vista: 'frontal',
    highlight: 'largo_blusa',
    min: 50,
    max: 90,
    defecto: 62,
    requerida: false,
    tip: 'Si dudás, dejá el valor por defecto: lo vas a poder ajustar después al crear cada patrón.',
  },
  {
    id: 'largoFalda',
    label: 'Largo de falda',
    instruccion: 'Desde la cintura por el costado hasta el largo deseado.',
    categoria: 'largo_prenda',
    vista: 'lateral',
    highlight: 'largo_falda',
    min: 30,
    max: 110,
    defecto: 60,
    requerida: false,
    tip: 'Ej.: ~45cm rodilla, ~60cm media pierna, ~90cm largo midi.',
  },
  {
    id: 'largoVestido',
    label: 'Largo de vestido',
    instruccion:
      'Desde la séptima cervical hasta el largo total deseado del vestido. Pasá la cinta por la espalda.',
    categoria: 'largo_prenda',
    vista: 'posterior',
    highlight: 'largo_vestido',
    min: 70,
    max: 160,
    defecto: 100,
    requerida: false,
  },
];

export const TOTAL_MEDIDAS = CATALOGO_MEDIDAS.length;

export const NOMBRE_CATEGORIA: Record<CategoriaMedida, string> = {
  contorno: 'Contornos',
  ancho: 'Anchos',
  largo: 'Largos del torso',
  altura: 'Alturas',
  largo_prenda: 'Largos finales',
};

export const buscarPaso = (id: keyof Medidas) =>
  CATALOGO_MEDIDAS.find((p) => p.id === id);
