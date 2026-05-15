import { useEffect, useRef } from 'react';
import type { PasoMedida } from '../lib/medidas/catalogo';
import IlustracionMedida from './IlustracionMedida';

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
    <div className="grid sm:grid-cols-[200px_1fr] gap-6 items-start">
      <div className="card !p-3">
        <IlustracionMedida vista={paso.vista} highlight={paso.highlight} />
      </div>
      <div className="space-y-3">
        <div>
          <h2 className="font-display text-2xl text-rosa-700">{paso.label}</h2>
          <p className="text-sm text-tinta/70 mt-1">{paso.instruccion}</p>
          {paso.tip && (
            <p className="text-xs text-rosa-600 mt-2 italic">💡 {paso.tip}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="medida">
            Valor en centímetros
          </label>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              id="medida"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              className="input max-w-[180px] text-2xl font-display"
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
            <span className="text-tinta/60">cm</span>
            {!paso.requerida && (
              <button
                type="button"
                className="ml-2 text-xs text-rosa-600 hover:underline"
                onClick={() => {
                  if (paso.defecto) onCambio(paso.defecto);
                  onSiguiente();
                }}
              >
                Usar valor por defecto ({paso.defecto} cm)
              </button>
            )}
          </div>
          <div className="text-xs mt-1">
            {error ? (
              <span className="text-rosa-700">{error}</span>
            ) : (
              <span className="text-tinta/50">
                Rango razonable: {paso.min} – {paso.max} cm
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
