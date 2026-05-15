import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PatronPreview from '../components/PatronPreview';
import { listarPerfiles } from '../lib/storage/perfiles';
import { guardarPatron } from '../lib/storage/patrones';
import { generarPollera } from '../lib/patrones/prendas/pollera';
import { disposicionPlana } from '../lib/pdf/tiler';
import type { Ajuste, Cierre, Diseno, Escote, Manga, PerfilMedidas, Prenda, Tela } from '../lib/patrones/tipos';

const PRENDAS_V1: { id: Prenda; label: string; emoji: string; disponible: boolean }[] = [
  { id: 'pollera', label: 'Pollera', emoji: '🩱', disponible: true },
  { id: 'top', label: 'Top', emoji: '👚', disponible: false },
  { id: 'blusa', label: 'Blusa', emoji: '👕', disponible: false },
  { id: 'vestido', label: 'Vestido', emoji: '👗', disponible: false },
];

export default function NuevoProyecto() {
  const navigate = useNavigate();
  const [perfiles, setPerfiles] = useState<PerfilMedidas[] | null>(null);
  const [perfilId, setPerfilId] = useState<string>('');
  const [prenda, setPrenda] = useState<Prenda>('pollera');
  const [ajuste, setAjuste] = useState<Ajuste>('regular');
  const [tela, setTela] = useState<Tela>('plano_medio');
  const [cierre, setCierre] = useState<Cierre>('cremallera_invisible');
  const [largo, setLargo] = useState<number>(60);
  const [margen, setMargen] = useState<number>(1);
  const [mostrarMargen, setMostrarMargen] = useState(true);

  useEffect(() => {
    void listarPerfiles().then((p) => {
      setPerfiles(p);
      if (p.length > 0 && !perfilId) setPerfilId(p[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const perfil = useMemo(
    () => perfiles?.find((p) => p.id === perfilId) ?? null,
    [perfiles, perfilId],
  );

  // Default largo del perfil
  useEffect(() => {
    if (perfil && perfil.medidas.largoFalda > 0 && largo === 60) {
      setLargo(perfil.medidas.largoFalda);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil]);

  const patron = useMemo(() => {
    if (!perfil) return null;
    const diseno: Diseno = {
      prenda,
      escote: 'redondo' as Escote,
      manga: 'sin' as Manga,
      largo,
      ajuste,
      tela,
      cierre,
      margenCostura: margen,
      variantePollera: 'recta',
    };
    return generarPollera(perfil.medidas, diseno, perfil.nombre);
  }, [perfil, prenda, ajuste, tela, cierre, largo, margen]);

  const [exportando, setExportando] = useState(false);

  const disposicion = useMemo(
    () => (patron ? disposicionPlana(patron.piezas) : null),
    [patron],
  );

  async function guardar() {
    if (!patron) return;
    await guardarPatron(patron);
    navigate('/patrones');
  }

  async function exportarPdf() {
    if (!patron) return;
    setExportando(true);
    try {
      const { exportarPatronPDF, descargarPDF } = await import('../lib/pdf/exportar');
      const bytes = await exportarPatronPDF(patron);
      const fecha = new Date().toISOString().slice(0, 10);
      const nombre = `patron-${patron.diseno.prenda}-${patron.nombrePerfil}-${fecha}.pdf`
        .replace(/\s+/g, '_')
        .toLowerCase();
      descargarPDF(bytes, nombre);
      await guardarPatron(patron);
    } catch (e) {
      console.error(e);
      alert('No se pudo generar el PDF. Mirá la consola para más detalle.');
    } finally {
      setExportando(false);
    }
  }

  if (perfiles === null) {
    return <div className="card text-tinta/60 text-sm">Cargando…</div>;
  }

  if (perfiles.length === 0) {
    return (
      <div className="card space-y-3">
        <h1 className="font-display text-2xl text-rosa-700">Nuevo proyecto</h1>
        <p className="text-sm text-tinta/70">
          Para crear un patrón primero necesitás un perfil con tus medidas.
        </p>
        <Link to="/medidas/nueva" className="btn-primary inline-flex w-fit">
          Tomar mis medidas
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      <aside className="space-y-4">
        <h1 className="font-display text-3xl text-rosa-700">Nuevo proyecto</h1>

        <Bloque titulo="¿De quién es el patrón?">
          <select
            className="input"
            value={perfilId}
            onChange={(e) => setPerfilId(e.target.value)}
          >
            {perfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} (busto {p.medidas.busto} · cintura {p.medidas.cintura})
              </option>
            ))}
          </select>
        </Bloque>

        <Bloque titulo="¿Qué prenda?">
          <div className="grid grid-cols-2 gap-2">
            {PRENDAS_V1.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={!p.disponible}
                onClick={() => p.disponible && setPrenda(p.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  prenda === p.id
                    ? 'bg-rosa-500 text-white border-rosa-500'
                    : p.disponible
                    ? 'bg-white border-rosa-100 hover:bg-rosa-50'
                    : 'bg-marfil border-rosa-50 text-tinta/30 cursor-not-allowed'
                }`}
              >
                <div className="text-xl">{p.emoji}</div>
                <div className="text-sm font-medium">{p.label}</div>
                {!p.disponible && <div className="text-[10px]">próximamente</div>}
              </button>
            ))}
          </div>
        </Bloque>

        <Bloque titulo="Ajuste">
          <Radios
            value={ajuste}
            onChange={setAjuste}
            options={[
              ['ajustado', 'Ajustado'],
              ['regular', 'Regular'],
              ['holgado', 'Holgado'],
            ]}
          />
        </Bloque>

        <Bloque titulo="Tela">
          <select className="input" value={tela} onChange={(e) => setTela(e.target.value as Tela)}>
            <option value="plano_ligero">Plana ligera (algodón fino, popelina)</option>
            <option value="plano_medio">Plana media (algodón normal, lino)</option>
            <option value="plano_pesado">Plana pesada (gabardina, denim)</option>
            <option value="punto">Punto / jersey (con elasticidad)</option>
          </select>
        </Bloque>

        <Bloque titulo="Cierre">
          <select className="input" value={cierre} onChange={(e) => setCierre(e.target.value as Cierre)}>
            <option value="cremallera_invisible">Cremallera invisible</option>
            <option value="cremallera_visible">Cremallera visible</option>
            <option value="botones">Botones</option>
            <option value="elastico">Elástico</option>
            <option value="ninguno">Sin cierre</option>
          </select>
        </Bloque>

        <Bloque titulo="Largo">
          <input
            type="range"
            min={30}
            max={110}
            step={1}
            value={largo}
            onChange={(e) => setLargo(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-tinta/60">{largo} cm</div>
        </Bloque>

        <Bloque titulo="Margen de costura">
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.5}
            value={margen}
            onChange={(e) => setMargen(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-tinta/60 flex items-center justify-between">
            <span>{margen} cm</span>
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                checked={mostrarMargen}
                onChange={(e) => setMostrarMargen(e.target.checked)}
              />
              mostrar en preview
            </label>
          </div>
        </Bloque>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            className="btn-primary"
            onClick={exportarPdf}
            disabled={!patron || exportando}
          >
            {exportando ? 'Generando…' : '⬇️ Descargar PDF A4'}
          </button>
          <button type="button" className="btn-outline" onClick={guardar} disabled={!patron}>
            Guardar sin exportar
          </button>
        </div>
        {disposicion && (
          <p className="text-xs text-tinta/60">
            PDF: {disposicion.tiles.length} hoja{disposicion.tiles.length === 1 ? '' : 's'} A4 (
            {disposicion.cols} × {disposicion.rows})
            <br />
            Patrón total: {disposicion.bbox.w.toFixed(1)} × {disposicion.bbox.h.toFixed(1)} cm
          </p>
        )}
      </aside>

      <section className="space-y-2">
        <h2 className="font-display text-2xl text-rosa-700">Previsualización</h2>
        {patron ? (
          <PatronPreview patron={patron} mostrarMargen={mostrarMargen} margen={margen} />
        ) : (
          <div className="card text-tinta/60 text-sm">Elegí un perfil para generar el patrón.</div>
        )}
        {patron && (
          <div className="card text-xs text-tinta/70 space-y-1">
            <div>
              <span className="font-semibold text-tinta">Piezas:</span> {patron.piezas.length}
            </div>
            {patron.piezas.map((p, i) => (
              <div key={i} className="flex justify-between">
                <span>{p.nombre}</span>
                <span>
                  {p.bbox.w.toFixed(1)} × {p.bbox.h.toFixed(1)} cm · cortar {p.cantidad}×
                  {p.cortarSobreDoblez && ' sobre doblez'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="card !p-3 space-y-2">
      <div className="text-sm font-semibold text-tinta">{titulo}</div>
      {children}
    </div>
  );
}

function Radios<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`py-2 text-sm rounded-lg border transition ${
            value === v
              ? 'bg-rosa-500 text-white border-rosa-500'
              : 'bg-white border-rosa-100 hover:bg-rosa-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
