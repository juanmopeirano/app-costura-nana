import { useEffect, useRef } from 'react';
import type { PasoMedida } from '../lib/medidas/catalogo';
import IlustracionMedida from './IlustracionMedida';
import { IconInfo } from './Icon';

type Props = {
  paso: PasoMedida;
  valor: number | undefined;
  error: string | null;
  onCambio: (v: number) => void;
  onSiguiente: () => void;
};

export default function MedidaInput({ paso, valor, error, onCambio, onSiguiente }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [paso.id]);

  return (
    <div className="grid sm:grid-cols-[220px_1fr] gap-6 items-start animate-fade-up">
      <div className="card !p-4 bg-paper-grid bg-grid-cm relative overflow-hidden">
        <span className="absolute top-2 left-3 eyebrow text-baya-700 text-[10px]">
          {paso.categoria.replace('_', ' ')}
        </span>
        <IlustracionMedida vista={paso.vista} highlight={paso.highlight} />
      </div>
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-3xl text-tinta-900 leading-tight">
            {paso.label}
          </h2>
          <p className="text-tinta-700 mt-2 leading-relaxed">{paso.instruccion}</p>
          {paso.tip && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-salvia-50 border border-salvia-200 text-salvia-800 text-sm">
              <span className="mt-0.5 text-salvia-600">
                <IconInfo size={16} />
              </span>
              <span>{paso.tip}</span>
            </div>
          )}
        </div>
        <div>
          <label className="label" htmlFor="medida">
            Valor en centímetros
          </label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                ref={inputRef}
                id="medida"
                type="number"
                inputMode="decimal"
                step="0.1"
                min={0}
                className="input !text-3xl !font-display !py-3 !pl-4 !pr-12 max-w-[180px] !text-tinta-900"
                value={valor === undefined || Number.isNaN(valor) ? '' : valor}
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  onCambio(Number.isFinite(n) ? n : NaN);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !error) onSiguiente();
                }}
                placeholder={paso.defecto?.toString() ?? '0'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tinta-500 text-sm">
                cm
              </span>
            </div>
            {!paso.requerida && paso.defecto && (
              <button
                type="button"
                className="text-xs text-baya-700 hover:underline whitespace-nowrap"
                onClick={() => {
                  onCambio(paso.defecto!);
                  onSiguiente();
                }}
              >
                Usar {paso.defecto} cm
              </button>
            )}
          </div>
          <div className="text-xs mt-2">
            {error ? (
              <span className="text-baya-700 font-medium">{error}</span>
            ) : (
              <span className="text-tinta-500">
                Rango razonable: {paso.min} – {paso.max} cm
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
