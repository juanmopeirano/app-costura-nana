import { useEffect, useRef, useState } from 'react';
import { IconClose, IconDownload } from './Icon';
import type { Cierre } from '../lib/patrones/tipos';

// El padre monta este componente sólo mientras el diálogo está abierto, así que
// el estado del formulario arranca de cero en cada apertura.
type Props = {
  titulo: string;
  cierre: Cierre;
  especificaciones: string;
  onCerrar: () => void;
  onConfirmar: (opts: { titulo: string; cierre: Cierre; especificaciones: string }) => void;
  generando: boolean;
};

const CIERRES: { id: Cierre; label: string }[] = [
  { id: 'ninguno', label: 'Sin cierre' },
  { id: 'cremallera_invisible', label: 'Cremallera invisible' },
  { id: 'cremallera_visible', label: 'Cremallera visible' },
  { id: 'botones', label: 'Botones' },
  { id: 'elastico', label: 'Elástico' },
];

const SUGERENCIAS = [
  'Bolsillos laterales',
  'Cinta o lazo en la cintura',
  'Forro interior',
  'Vivos o ribetes en escote',
  'Ojales y botones decorativos',
];

export default function DialogoExportar({
  titulo,
  cierre,
  especificaciones,
  onCerrar,
  onConfirmar,
  generando,
}: Props) {
  const [tit, setTit] = useState(titulo);
  const [ci, setCi] = useState<Cierre>(cierre);
  const [specs, setSpecs] = useState(especificaciones);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cerrar con ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !generando) onCerrar();
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [generando, onCerrar]);

  return (
    <div
      className="fixed inset-0 z-40 bg-tinta-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fade-up"
      onClick={(e) => {
        if (e.target === e.currentTarget && !generando) onCerrar();
      }}
    >
      <div className="bg-crema-50 rounded-3xl shadow-paper-lg w-full sm:max-w-lg max-h-[92vh] overflow-y-auto border border-baya-100">
        <header className="sticky top-0 bg-crema-50/95 backdrop-blur border-b border-baya-100 px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="eyebrow text-baya-700">Último paso</p>
            <h2 className="font-display text-2xl text-tinta-900">
              Ajustes finales del patrón
            </h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={generando}
            className="text-tinta-500 hover:text-baya-700 p-1"
            aria-label="Cerrar"
          >
            <IconClose size={18} />
          </button>
        </header>

        <div className="px-5 py-4 space-y-5">
          <div>
            <label className="label">Título del patrón</label>
            <input
              ref={inputRef}
              className="input"
              value={tit}
              onChange={(e) => setTit(e.target.value)}
              placeholder="Ej.: Blusa de Nana para verano"
              maxLength={60}
            />
            <p className="text-[10px] text-tinta-500 mt-1">
              Va a aparecer en la portada del PDF.
            </p>
          </div>

          <div>
            <label className="label">¿Lleva cierre?</label>
            <div className="flex flex-wrap gap-1.5">
              {CIERRES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={ci === id ? 'pill pill-on' : 'pill pill-off'}
                  onClick={() => setCi(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">
              Especificaciones / instrucciones adicionales
            </label>
            <textarea
              className="input min-h-[110px] resize-y"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder={
                'Ej.: 4 botones forrados en el delantero, dos bolsillos laterales con vivo, cinta en la cintura de 2cm de ancho…'
              }
              maxLength={1200}
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSpecs((cur) => (cur ? `${cur}\n• ${s}` : `• ${s}`));
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-salvia-200 text-salvia-700 hover:bg-salvia-50"
                >
                  + {s}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-tinta-500 mt-1.5">
              Estas notas van a aparecer en la portada del PDF para que recuerdes
              cómo querés rematarlo.
            </p>
          </div>
        </div>

        <footer className="sticky bottom-0 bg-crema-50/95 backdrop-blur border-t border-baya-100 px-5 py-3.5 flex gap-2">
          <button
            type="button"
            className="btn-outline flex-1"
            onClick={onCerrar}
            disabled={generando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary flex-[2]"
            disabled={generando}
            onClick={() =>
              onConfirmar({
                titulo: tit.trim() || titulo,
                cierre: ci,
                especificaciones: specs.trim(),
              })
            }
          >
            {generando ? (
              'Generando PDF…'
            ) : (
              <>
                <IconDownload size={16} /> Generar PDF
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
