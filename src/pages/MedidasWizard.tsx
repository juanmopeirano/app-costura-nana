import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MedidaInput from '../components/MedidaInput';
import ProgresoWizard from '../components/ProgresoWizard';
import { CATALOGO_MEDIDAS, TOTAL_MEDIDAS } from '../lib/medidas/catalogo';
import { validarMedida, validarMedidas } from '../lib/medidas/validacion';
import { guardarPerfil, obtenerPerfil } from '../lib/storage/perfiles';
import type { PerfilMedidas } from '../lib/patrones/tipos';
import { newId } from '../lib/utils/id';
import { useWizard } from '../store/wizardStore';

export default function MedidasWizard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { perfilId, nombre, medidas, paso, setNombre, setPaso, setMedida, cargarPerfil, reiniciar } =
    useWizard();
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    if (id) {
      void obtenerPerfil(id).then((p) => {
        if (cancelado || !p) return;
        cargarPerfil(p.id, p.nombre, p.medidas);
      });
    } else {
      reiniciar();
    }
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // paso 0 = nombre del perfil; pasos 1..TOTAL = medidas; paso TOTAL+1 = revisión
  const totalPasos = TOTAL_MEDIDAS + 2;
  const pasoActual = paso;

  const pasoMedida = pasoActual >= 1 && pasoActual <= TOTAL_MEDIDAS ? CATALOGO_MEDIDAS[pasoActual - 1] : null;
  const errorActual = useMemo(() => {
    if (!pasoMedida) return null;
    const v = medidas[pasoMedida.id];
    return validarMedida(pasoMedida.id, v);
  }, [pasoMedida, medidas]);

  const irAtras = () => setPaso(Math.max(0, pasoActual - 1));
  const irAdelante = () => {
    if (pasoActual === 0 && !nombre.trim()) return;
    if (pasoMedida && errorActual && pasoMedida.requerida) return;
    if (pasoMedida && !medidas[pasoMedida.id] && pasoMedida.requerida) return;
    setPaso(Math.min(totalPasos - 1, pasoActual + 1));
  };

  async function guardar() {
    setGuardando(true);
    const perfil: PerfilMedidas = {
      id: perfilId ?? newId(),
      nombre: nombre.trim() || 'Sin nombre',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      medidas,
    };
    await guardarPerfil(perfil);
    setGuardando(false);
    navigate('/medidas');
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-rosa-700">
          {id ? `Editar — ${nombre || '...'}` : 'Nuevas medidas'}
        </h1>
        <Link to="/medidas" className="text-sm text-tinta/60 hover:underline">
          Cancelar
        </Link>
      </div>

      <ProgresoWizard paso={pasoActual + 1} total={totalPasos} />

      {pasoActual === 0 && (
        <div className="card space-y-3">
          <h2 className="font-display text-2xl text-rosa-700">¿De quién son las medidas?</h2>
          <p className="text-sm text-tinta/70">
            Poné un nombre para identificarlas (ej. tu nombre, "Nana", "vestido invierno"...).
          </p>
          <input
            autoFocus
            className="input"
            placeholder="Nombre del perfil"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nombre.trim()) irAdelante();
            }}
          />
        </div>
      )}

      {pasoMedida && (
        <MedidaInput
          paso={pasoMedida}
          valor={medidas[pasoMedida.id]}
          error={errorActual}
          onCambio={(v) => setMedida(pasoMedida.id, v)}
          onSiguiente={irAdelante}
        />
      )}

      {pasoActual === totalPasos - 1 && <Revision />}

      <div className="flex justify-between gap-2 pt-2">
        <button
          type="button"
          className="btn-outline"
          onClick={irAtras}
          disabled={pasoActual === 0}
        >
          ← Atrás
        </button>
        {pasoActual < totalPasos - 1 ? (
          <button
            type="button"
            className="btn-primary"
            onClick={irAdelante}
            disabled={
              (pasoActual === 0 && !nombre.trim()) ||
              (pasoMedida?.requerida && (!!errorActual || !medidas[pasoMedida.id]))
            }
          >
            Siguiente →
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar perfil 💾'}
          </button>
        )}
      </div>
    </div>
  );
}

function Revision() {
  const { nombre, medidas } = useWizard();
  const errores = validarMedidas(medidas);
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl text-rosa-700">Revisá tus medidas</h2>
      <div className="card">
        <div className="font-medium text-tinta mb-2">Perfil: {nombre || 'sin nombre'}</div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {CATALOGO_MEDIDAS.map((p) => {
            const v = medidas[p.id];
            return (
              <li key={p.id} className="flex justify-between border-b border-rosa-50 py-1">
                <span className="text-tinta/70">{p.label}</span>
                <span className={`font-medium ${!v && p.requerida ? 'text-rosa-700' : 'text-tinta'}`}>
                  {v ? `${v} cm` : '—'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      {errores.length > 0 && (
        <div className="card border-rosa-300 bg-rosa-50">
          <div className="font-medium text-rosa-700 mb-1">Hay {errores.length} cosa(s) para revisar:</div>
          <ul className="text-sm text-rosa-700 list-disc pl-5">
            {errores.map((e, i) => (
              <li key={i}>
                {CATALOGO_MEDIDAS.find((p) => p.id === e.id)?.label}: {e.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
