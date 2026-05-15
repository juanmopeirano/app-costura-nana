import { useRef, useState } from 'react';

const MAX_DIM = 1024;
const CALIDAD = 0.8;
const ACEPTADOS = 'image/jpeg,image/png,image/webp';

type Props = {
  foto: string | undefined;
  onCambio: (dataUrl: string | undefined) => void;
};

export default function FotoUpload({ foto, onCambio }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
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
        <div className="relative">
          <img
            src={foto}
            alt="Foto de referencia"
            className="w-full max-h-64 object-contain rounded-lg border border-rosa-100 bg-marfil"
          />
          <button
            type="button"
            onClick={() => onCambio(undefined)}
            className="absolute top-2 right-2 bg-white/90 text-rosa-700 px-2 py-1 rounded text-xs hover:bg-rosa-50"
          >
            Quitar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full p-6 border-2 border-dashed border-rosa-200 rounded-lg text-tinta/60 text-sm hover:bg-rosa-50 hover:border-rosa-300 transition"
          disabled={procesando}
        >
          {procesando ? 'Procesando…' : '📷 Subir foto del diseño'}
        </button>
      )}
      <input
        ref={inputRef}
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
      {error && <p className="text-xs text-rosa-700">{error}</p>}
      <p className="text-[10px] text-tinta/40">
        Sirve sólo como referencia visual. La foto queda en este dispositivo (no se sube a internet).
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
