import { useRef, useState } from 'react';
import { IconCamera, IconClose } from './Icon';

const MAX_DIM = 1024;
const CALIDAD = 0.8;
const ACEPTADOS = 'image/jpeg,image/png,image/webp';

type Props = {
  foto: string | undefined;
  onCambio: (dataUrl: string | undefined) => void;
};

export default function FotoUpload({ foto, onCambio }: Props) {
  // Input "galería": sin atributo `capture`. iOS/Android ofrecen el picker que
  // permite elegir de la galería (y también ofrecen cámara como opción).
  const inputGaleria = useRef<HTMLInputElement>(null);
  // Input "cámara": con `capture="environment"` para tomar foto directo.
  const inputCamara = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarArchivo(file: File) {
    setError(null);
    setProcesando(true);
    try {
      const dataUrl = await comprimir(file);
      onCambio(dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar la imagen.');
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="space-y-2">
      {foto ? (
        <div className="relative rounded-xl overflow-hidden border border-baya-100 shadow-paper">
          <img
            src={foto}
            alt="Foto de referencia"
            className="w-full max-h-60 object-contain bg-crema-100"
          />
          <button
            type="button"
            onClick={() => onCambio(undefined)}
            className="absolute top-2 right-2 bg-crema-50/95 text-baya-700 p-1.5 rounded-full hover:bg-crema-50 shadow-paper"
            aria-label="Quitar"
          >
            <IconClose size={14} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => inputGaleria.current?.click()}
            className="p-3 border-2 border-dashed border-baya-200 rounded-xl text-tinta-600 text-xs hover:bg-baya-50 hover:border-baya-400 transition flex flex-col items-center gap-1.5"
            disabled={procesando}
          >
            <span className="text-baya-500 text-lg">🖼️</span>
            <span>Desde galería</span>
          </button>
          <button
            type="button"
            onClick={() => inputCamara.current?.click()}
            className="p-3 border-2 border-dashed border-baya-200 rounded-xl text-tinta-600 text-xs hover:bg-baya-50 hover:border-baya-400 transition flex flex-col items-center gap-1.5"
            disabled={procesando}
          >
            <IconCamera size={20} className="text-baya-500" />
            <span>Sacar foto</span>
          </button>
        </div>
      )}
      {procesando && (
        <p className="text-xs text-tinta-500">Procesando imagen…</p>
      )}
      {/* Input galería: sin capture para que ofrezca la galería */}
      <input
        ref={inputGaleria}
        type="file"
        accept={ACEPTADOS}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void manejarArchivo(f);
          e.target.value = '';
        }}
      />
      {/* Input cámara: con capture para tomar foto */}
      <input
        ref={inputCamara}
        type="file"
        accept={ACEPTADOS}
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void manejarArchivo(f);
          e.target.value = '';
        }}
      />
      {error && <p className="text-xs text-baya-700">{error}</p>}
      <p className="text-[10px] text-tinta-500 leading-relaxed">
        Sirve como referencia visual y se incluye en la portada del PDF. Queda
        en este dispositivo (no se sube a internet).
      </p>
    </div>
  );
}

async function comprimir(file: File): Promise<string> {
  const dataUrlOriginal = await leerComoDataUrl(file);
  const img = await cargarImagen(dataUrlOriginal);
  const ratio = Math.min(MAX_DIM / img.width, MAX_DIM / img.height, 1);
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo crear el contexto canvas');
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', CALIDAD);
}

function leerComoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('No se pudo leer el archivo'));
    r.readAsDataURL(file);
  });
}

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('La imagen está dañada o no es válida'));
    img.src = src;
  });
}
