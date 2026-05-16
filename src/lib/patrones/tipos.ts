export type Medidas = {
  // largos
  largoEspalda: number;
  talleFrente: number;
  talleAtras: number;
  centroFrente: number;
  centroAtras: number;
  hombro: number;
  costado: number;
  hombroAHombro: number;
  anchoEspalda: number;
  anchoPecho: number;
  // contornos
  cuello: number;
  busto: number;
  cintura: number;
  cadera: number;
  brazo: number;
  muneca: number;
  rodilla: number;
  bota: number;
  // separaciones y alturas
  separacionBusto: number;
  alturaBusto: number;
  alturaCadera: number;
  tiro: number;
  // largos finales (por prenda)
  largoManga: number;
  largoBlusa: number;
  largoFalda: number;
  largoVestido: number;
  largoPantalon: number;
};

export type Prenda = 'top' | 'blusa' | 'pollera' | 'vestido' | 'pantalon';
export type Escote = 'redondo' | 'v' | 'cuadrado' | 'barco' | 'camisero' | 'bebe' | 'nehru';
export type Manga = 'sin' | 'corta' | 'tres_cuartos' | 'larga' | 'kimona' | 'raglan';
export type Ajuste = 'ajustado' | 'regular' | 'holgado';
export type Tela = 'plano_ligero' | 'plano_medio' | 'plano_pesado' | 'punto';
export type Cierre =
  | 'cremallera_invisible'
  | 'cremallera_visible'
  | 'botones'
  | 'elastico'
  | 'ninguno';
export type VariantePollera = 'recta' | 'a_line' | 'sirena' | 'vuelo' | 'pliegues';
export type VarianteVestido = 'simple' | 'corte_frances' | 'corte_princesa';

export type Diseno = {
  prenda: Prenda;
  escote: Escote;
  manga: Manga;
  largo: number;
  ajuste: Ajuste;
  tela: Tela;
  cierre: Cierre;
  margenCostura: number;
  variantePollera?: VariantePollera;
  varianteVestido?: VarianteVestido;
  fotoReferencia?: string;
  /** Notas libres que escribe la usuaria antes de descargar: botones,
   *  bolsillos, cintas, etc. Se muestran en la portada del PDF. */
  especificaciones?: string;
  /** Título personalizado del patrón (opcional). Si no se pone, se usa la
   *  prenda + nombre del perfil. */
  tituloPatron?: string;
};

export type Punto = { x: number; y: number };
export type Linea = { a: Punto; b: Punto };

export type Pieza = {
  nombre: string;
  cantidad: number;
  cortarSobreDoblez: boolean;
  contornoPuntos: Punto[]; // polilínea cerrada en cm (origen del molde)
  contornoPath: string; // SVG path data derivado de contornoPuntos
  piquetes: Punto[];
  hilo: Linea;
  pinzas: Linea[];
  bbox: { x: number; y: number; w: number; h: number };
};

export type Patron = {
  id: string;
  createdAt: number;
  nombrePerfil: string;
  medidas: Medidas;
  diseno: Diseno;
  piezas: Pieza[];
};

export type PerfilMedidas = {
  id: string;
  nombre: string;
  createdAt: number;
  updatedAt: number;
  medidas: Medidas;
};

export const MEDIDAS_VACIAS: Medidas = {
  largoEspalda: 0,
  talleFrente: 0,
  talleAtras: 0,
  centroFrente: 0,
  centroAtras: 0,
  hombro: 0,
  costado: 0,
  hombroAHombro: 0,
  anchoEspalda: 0,
  anchoPecho: 0,
  cuello: 0,
  busto: 0,
  cintura: 0,
  cadera: 0,
  brazo: 0,
  muneca: 0,
  rodilla: 0,
  bota: 0,
  separacionBusto: 0,
  alturaBusto: 0,
  alturaCadera: 0,
  tiro: 0,
  largoManga: 0,
  largoBlusa: 0,
  largoFalda: 0,
  largoVestido: 0,
  largoPantalon: 0,
};

// Cuadro de tallas femeninas SENA p.20 — referencia para tests y autocompletado
export const TALLAS_SENA: Record<number, Partial<Medidas>> = {
  // NOTA: rodilla y bota se almacenan como CONTORNO real medido con cinta
  // (la tabla SENA p.20 lista anchos de molde; los convertimos aquí).
  6: { busto: 84, cintura: 60, cadera: 88, anchoEspalda: 33, anchoPecho: 31, talleFrente: 43.5, talleAtras: 41.5, centroFrente: 36.5, centroAtras: 39.5, costado: 18.75, hombro: 11.5, cuello: 33, largoManga: 59, largoBlusa: 61, largoFalda: 59, alturaCadera: 17.5, separacionBusto: 17, alturaBusto: 25.5, hombroAHombro: 36, tiro: 24, rodilla: 33, bota: 22, largoPantalon: 103 },
  8: { busto: 88, cintura: 64, cadera: 92, anchoEspalda: 34, anchoPecho: 32, talleFrente: 44, talleAtras: 42, centroFrente: 36.75, centroAtras: 40, costado: 19, hombro: 11.75, cuello: 34.5, largoManga: 59.5, largoBlusa: 61.5, largoFalda: 59.5, alturaCadera: 17.75, separacionBusto: 17.5, alturaBusto: 25.75, hombroAHombro: 37, tiro: 25, rodilla: 34, bota: 23, largoPantalon: 104 },
  10: { busto: 92, cintura: 68, cadera: 96, anchoEspalda: 35, anchoPecho: 33, talleFrente: 44.5, talleAtras: 42.5, centroFrente: 37, centroAtras: 40.5, costado: 19.25, hombro: 12, cuello: 36, largoManga: 60, largoBlusa: 62, largoFalda: 60, alturaCadera: 18, separacionBusto: 18, alturaBusto: 26, hombroAHombro: 38, tiro: 26, rodilla: 35, bota: 24, largoPantalon: 105 },
  12: { busto: 96, cintura: 72, cadera: 100, anchoEspalda: 36, anchoPecho: 34, talleFrente: 45, talleAtras: 43, centroFrente: 37.25, centroAtras: 41, costado: 19.5, hombro: 12.25, cuello: 37.5, largoManga: 60.5, largoBlusa: 62.5, largoFalda: 60.5, alturaCadera: 18.25, separacionBusto: 18.5, alturaBusto: 26.25, hombroAHombro: 39, tiro: 27, rodilla: 36, bota: 24, largoPantalon: 106 },
  14: { busto: 100, cintura: 76, cadera: 104, anchoEspalda: 37, anchoPecho: 35, talleFrente: 45.5, talleAtras: 43.5, centroFrente: 37.5, centroAtras: 41.5, costado: 19.75, hombro: 12.5, cuello: 39, largoManga: 61, largoBlusa: 63, largoFalda: 61, alturaCadera: 18.5, separacionBusto: 19, alturaBusto: 26.5, hombroAHombro: 40, tiro: 28, rodilla: 37, bota: 25, largoPantalon: 107 },
  16: { busto: 106, cintura: 82, cadera: 110, anchoEspalda: 38.5, anchoPecho: 36.5, talleFrente: 46.25, talleAtras: 44.25, centroFrente: 37.875, centroAtras: 42.25, costado: 20.125, hombro: 12.875, cuello: 41.25, largoManga: 61.75, largoBlusa: 63.75, largoFalda: 61.75, alturaCadera: 18.875, separacionBusto: 19.75, alturaBusto: 26.75, hombroAHombro: 41.5, tiro: 29.5, rodilla: 38.5, bota: 26, largoPantalon: 108.5 },
  18: { busto: 112, cintura: 88, cadera: 116, anchoEspalda: 40, anchoPecho: 38, talleFrente: 47, talleAtras: 45, centroFrente: 38.25, centroAtras: 43, costado: 20.5, hombro: 13.25, cuello: 43.5, largoManga: 62.5, largoBlusa: 64.5, largoFalda: 62.5, alturaCadera: 19.25, separacionBusto: 20.5, alturaBusto: 27, hombroAHombro: 43, tiro: 31, rodilla: 40, bota: 27, largoPantalon: 110 },
};
