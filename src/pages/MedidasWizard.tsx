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
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconRuler,
} from '../components/Icon';

export default function MedidasWizard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const {
    perfilId,
    nombre,
    medidas,
    paso,
    setNombre,
    setPaso,
    setMedida,
    cargarPerfil,
    reiniciar,
  } = useWizard();
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

  const totalPasos = TOTAL_MEDIDAS + 2;
  const pasoActual = paso;
  const pasoMedida =
    pasoActual >= 1 && pasoActual <= TOTAL_MEDIDAS
      ? CATALOGO_MEDIDAS[pasoActual - 1]
      : null;
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
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1 flex items-center gap-1.5">
            <IconRuler size={12} /> Toma de medidas
          </p>
          <h1 className="font-display text-3xl text-tinta-900">
            {id ? (
              <>
                Editar — <span className="italic text-baya-700">{nombre || '…'}</span>
              </>
            ) : (
              'Nuevo perfil'
            )}
          </h1>
        </div>
        <Link to="/medidas" className="text-sm text-tinta-500 hover:text-baya-700 hover:underline">
          Cancelar
        </Link>
      </header>

      <ProgresoWizard paso={pasoActual + 1} total={totalPasos} />

      <div className="min-h-[380px]">
        {pasoActual === 0 && (
          <div className="card animate-fade-up space-y-3">
            <h2 className="font-display text-3xl text-tinta-900">
              ¿De quién son las medidas?
            </h2>
            <p className="text-tinta-700">
              Poné un nombre para identificarlas (tu nombre, "Nana", "vestido
              invierno"…).
            </p>
            <input
              autoFocus
              className="input !text-xl !py-3"
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
      </div>

      <div className="flex justify-between gap-2 pt-2 border-t border-baya-100">
        <button
          type="button"
          className="btn-outline"
          onClick={irAtras}
          disabled={pasoActual === 0}
        >
          <IconArrowLeft size={16} /> Atrás
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
            Siguiente <IconArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? (
              'Guardando…'
            ) : (
              <>
                <IconCheck size={16} /> Guardar perfil
              </>
            )}
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
    <div className="space-y-4 animate-fade-up">
      <h2 className="font-display text-3xl text-tinta-900">Revisá tus medidas</h2>
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="eyebrow">Perfil</p>
            <p className="font-display text-2xl text-baya-700">{nombre || 'sin nombre'}</p>
          </div>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
          {CATALOGO_MEDIDAS.map((p) => {
            const v = medidas[p.id];
            return (
              <li
                key={p.id}
                className="flex justify-between border-b border-dashed border-baya-100 py-1.5"
              >
                <span className="text-tinta-700">{p.label}</span>
                <span
                  className={`font-medium ${
                    !v && p.requerida ? 'text-baya-700' : 'text-tinta-900'
                  }`}
                >
                  {v ? (
                    <>
                      {v} <span className="text-tinta-500">cm</span>
                    </>
                  ) : (
                    '—'
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      {errores.length > 0 && (
        <div className="card border-baya-300 bg-baya-50">
          <div className="font-medium text-baya-700 mb-1">
            Hay {errores.length} cosa{errores.length === 1 ? '' : 's'} para revisar:
          </div>
          <ul className="text-sm text-baya-700 list-disc pl-5">
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
