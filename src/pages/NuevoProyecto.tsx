import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PatronPreview from '../components/PatronPreview';
import FotoUpload from '../components/FotoUpload';
import { listarPerfiles } from '../lib/storage/perfiles';
import { guardarPatron, obtenerPatron } from '../lib/storage/patrones';
import { generarPollera } from '../lib/patrones/prendas/pollera';
import { generarTop } from '../lib/patrones/prendas/top';
import { generarBlusa } from '../lib/patrones/prendas/blusa';
import { generarVestido } from '../lib/patrones/prendas/vestido';
import { disposicionPlana } from '../lib/pdf/tiler';
import type {
  Ajuste,
  Cierre,
  Diseno,
  Escote,
  Manga,
  PerfilMedidas,
  Prenda,
  Tela,
  VariantePollera,
  VarianteVestido,
} from '../lib/patrones/tipos';
import {
  IconCheck,
  IconClose,
  IconDownload,
  IconDress,
  IconRuler,
  IconScissors,
  IconShirt,
  IconSkirt,
} from '../components/Icon';

type PrendaCfg = {
  id: Prenda;
  label: string;
  icon: React.ReactNode;
  disponible: boolean;
};

const PRENDAS_V1: PrendaCfg[] = [
  { id: 'pollera', label: 'Pollera', icon: <IconSkirt size={22} />, disponible: true },
  { id: 'top', label: 'Top', icon: <IconShirt size={22} />, disponible: true },
  { id: 'blusa', label: 'Blusa', icon: <IconShirt size={22} />, disponible: true },
  { id: 'vestido', label: 'Vestido', icon: <IconDress size={22} />, disponible: true },
];

const ESCOTES: { id: Escote; label: string }[] = [
  { id: 'redondo', label: 'Redondo' },
  { id: 'v', label: 'V' },
  { id: 'cuadrado', label: 'Cuadrado' },
  { id: 'barco', label: 'Barco' },
  { id: 'bebe', label: 'Bebé' },
  { id: 'camisero', label: 'Camisero' },
  { id: 'nehru', label: 'Nehru' },
];

const MANGAS: { id: Manga; label: string }[] = [
  { id: 'sin', label: 'Sin manga' },
  { id: 'corta', label: 'Corta' },
  { id: 'tres_cuartos', label: '3/4' },
  { id: 'larga', label: 'Larga' },
  { id: 'kimona', label: 'Kimona' },
  { id: 'raglan', label: 'Raglán' },
];

const VARIANTES_POLLERA: { id: VariantePollera; label: string; disponible: boolean }[] = [
  { id: 'recta', label: 'Recta', disponible: true },
  { id: 'a_line', label: 'A-line', disponible: true },
  { id: 'sirena', label: 'Sirena', disponible: true },
  { id: 'vuelo', label: 'Con vuelo', disponible: true },
  { id: 'pliegues', label: 'Pliegues', disponible: false },
];

const VARIANTES_VESTIDO: { id: VarianteVestido; label: string; disponible: boolean }[] = [
  { id: 'simple', label: 'Simple', disponible: true },
  { id: 'corte_frances', label: 'Corte francés', disponible: false },
  { id: 'corte_princesa', label: 'Corte princesa', disponible: false },
];

const RANGO_LARGO: Record<Prenda, { min: number; max: number; defecto: number }> = {
  pollera: { min: 30, max: 110, defecto: 60 },
  top: { min: 35, max: 80, defecto: 55 },
  blusa: { min: 50, max: 90, defecto: 62 },
  vestido: { min: 70, max: 160, defecto: 100 },
};

export default function NuevoProyecto() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patronIdParam = searchParams.get('id');
  const [perfiles, setPerfiles] = useState<PerfilMedidas[] | null>(null);
  const [perfilId, setPerfilId] = useState<string>('');
  const [prenda, setPrenda] = useState<Prenda>('pollera');
  const [escote, setEscote] = useState<Escote>('redondo');
  const [manga, setManga] = useState<Manga>('sin');
  const [variantePollera, setVariantePollera] = useState<VariantePollera>('recta');
  const [varianteVestido, setVarianteVestido] = useState<VarianteVestido>('simple');
  const [ajuste, setAjuste] = useState<Ajuste>('regular');
  const [tela, setTela] = useState<Tela>('plano_medio');
  const [cierre, setCierre] = useState<Cierre>('cremallera_invisible');
  const [largo, setLargo] = useState<number>(60);
  const [margen, setMargen] = useState<number>(1);
  const [mostrarMargen, setMostrarMargen] = useState(true);
  const [largoEditado, setLargoEditado] = useState(false);
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [exportando, setExportando] = useState(false);
  const [errorExport, setErrorExport] = useState<string | null>(null);

  useEffect(() => {
    void listarPerfiles().then((p) => {
      setPerfiles(p);
      if (p.length > 0 && !perfilId) setPerfilId(p[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!patronIdParam) return;
    let cancelado = false;
    void obtenerPatron(patronIdParam).then((p) => {
      if (cancelado || !p) return;
      setPrenda(p.diseno.prenda);
      setEscote(p.diseno.escote);
      setManga(p.diseno.manga);
      setAjuste(p.diseno.ajuste);
      setTela(p.diseno.tela);
      setCierre(p.diseno.cierre);
      setLargo(p.diseno.largo);
      setMargen(p.diseno.margenCostura);
      setVariantePollera(p.diseno.variantePollera ?? 'recta');
      setVarianteVestido(p.diseno.varianteVestido ?? 'simple');
      setFoto(p.diseno.fotoReferencia);
      setLargoEditado(true);
      void listarPerfiles().then((perfs) => {
        const enc = perfs.find((x) => x.nombre === p.nombrePerfil);
        if (enc) setPerfilId(enc.id);
      });
    });
    return () => {
      cancelado = true;
    };
  }, [patronIdParam]);

  const perfil = useMemo(
    () => perfiles?.find((p) => p.id === perfilId) ?? null,
    [perfiles, perfilId],
  );

  useEffect(() => {
    if (largoEditado || !perfil) return;
    const r = RANGO_LARGO[prenda];
    const m = perfil.medidas;
    let predeterminado: number;
    if (prenda === 'pollera') predeterminado = m.largoFalda || r.defecto;
    else if (prenda === 'top') predeterminado = m.talleAtras + 10;
    else if (prenda === 'blusa') predeterminado = m.largoBlusa || r.defecto;
    else predeterminado = m.largoVestido || r.defecto;
    setLargo(Math.max(r.min, Math.min(r.max, predeterminado)));
  }, [perfil, prenda, largoEditado]);

  const patron = useMemo(() => {
    if (!perfil) return null;
    const diseno: Diseno = {
      prenda,
      escote,
      manga,
      largo,
      ajuste,
      tela,
      cierre,
      margenCostura: margen,
      variantePollera: prenda === 'pollera' || prenda === 'vestido' ? variantePollera : undefined,
      varianteVestido: prenda === 'vestido' ? varianteVestido : undefined,
      fotoReferencia: foto,
    };
    if (prenda === 'top') return generarTop(perfil.medidas, diseno, perfil.nombre);
    if (prenda === 'blusa') return generarBlusa(perfil.medidas, diseno, perfil.nombre);
    if (prenda === 'vestido') return generarVestido(perfil.medidas, diseno, perfil.nombre);
    return generarPollera(perfil.medidas, diseno, perfil.nombre);
  }, [
    perfil, prenda, escote, manga, ajuste, tela, cierre, largo, margen,
    variantePollera, varianteVestido, foto,
  ]);

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
    setErrorExport(null);
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
      console.error('PDF export error:', e);
      const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      setErrorExport(msg);
    } finally {
      setExportando(false);
    }
  }

  if (perfiles === null) {
    return <div className="card text-tinta-600 text-sm">Cargando…</div>;
  }

  if (perfiles.length === 0) {
    return (
      <div className="max-w-2xl mx-auto card-stitched space-y-4 text-center py-12">
        <div className="text-baya-300 mx-auto w-fit">
          <IconRuler size={48} />
        </div>
        <h1 className="font-display text-3xl text-tinta-900">
          Primero necesitamos tus medidas
        </h1>
        <p className="text-tinta-600 max-w-md mx-auto">
          Para generar un patrón a medida hay que tomar las medidas corporales.
          Es la única parte que no podemos hacer automáticamente.
        </p>
        <Link to="/medidas/nueva" className="btn-primary inline-flex">
          <IconRuler size={16} /> Tomar mis medidas
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      <aside className="space-y-3">
        <header>
          <p className="eyebrow mb-1 flex items-center gap-1.5">
            <IconScissors size={12} /> Editor
          </p>
          <h1 className="font-display text-3xl text-tinta-900">
            {patronIdParam ? 'Editar patrón' : 'Nuevo patrón'}
          </h1>
        </header>

        <Seccion titulo="¿De quién?">
          <select
            className="input"
            value={perfilId}
            onChange={(e) => setPerfilId(e.target.value)}
          >
            {perfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} (B {p.medidas.busto} · C {p.medidas.cintura} · Ca {p.medidas.cadera})
              </option>
            ))}
          </select>
        </Seccion>

        <Seccion titulo="¿Qué prenda?">
          <div className="grid grid-cols-4 gap-1.5">
            {PRENDAS_V1.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={!p.disponible}
                onClick={() => p.disponible && setPrenda(p.id)}
                className={`relative p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  prenda === p.id
                    ? 'bg-baya-700 text-crema-50 border-baya-700 shadow-paper'
                    : 'bg-crema-50 border-baya-200 text-tinta-800 hover:border-baya-400 hover:bg-baya-50'
                }`}
              >
                {p.icon}
                <span className="text-xs font-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </Seccion>

        <Seccion titulo="Foto de referencia (opcional)">
          <FotoUpload foto={foto} onCambio={setFoto} />
        </Seccion>

        {(prenda === 'pollera' || prenda === 'vestido') && (
          <Seccion titulo="Variante de pollera">
            <Pills
              value={variantePollera}
              onChange={setVariantePollera}
              options={VARIANTES_POLLERA}
            />
          </Seccion>
        )}

        {prenda === 'vestido' && (
          <Seccion titulo="Corte del vestido">
            <Pills value={varianteVestido} onChange={setVarianteVestido} options={VARIANTES_VESTIDO} />
          </Seccion>
        )}

        {prenda !== 'pollera' && (
          <Seccion titulo="Escote">
            <Pills value={escote} onChange={setEscote} options={ESCOTES.map((e) => ({ ...e, disponible: true }))} />
          </Seccion>
        )}

        {prenda !== 'pollera' && (
          <Seccion titulo="Manga">
            <Pills value={manga} onChange={setManga} options={MANGAS.map((m) => ({ ...m, disponible: true }))} />
            {(manga === 'kimona' || manga === 'raglan') && (
              <p className="text-[11px] text-tinta-500 mt-1.5 italic">
                Vista previa simplificada. La modificación del corpiño se incluye en próxima versión.
              </p>
            )}
          </Seccion>
        )}

        <Seccion titulo="Ajuste y tela">
          <div className="space-y-2">
            <Pills
              value={ajuste}
              onChange={setAjuste}
              options={[
                { id: 'ajustado', label: 'Ajustado', disponible: true },
                { id: 'regular', label: 'Regular', disponible: true },
                { id: 'holgado', label: 'Holgado', disponible: true },
              ]}
            />
            <select
              className="input !py-2 text-sm"
              value={tela}
              onChange={(e) => setTela(e.target.value as Tela)}
            >
              <option value="plano_ligero">Plana ligera (algodón fino, popelina)</option>
              <option value="plano_medio">Plana media (algodón, lino)</option>
              <option value="plano_pesado">Plana pesada (gabardina, denim)</option>
              <option value="punto">Punto / jersey</option>
            </select>
          </div>
        </Seccion>

        <Seccion titulo="Cierre">
          <select
            className="input !py-2 text-sm"
            value={cierre}
            onChange={(e) => setCierre(e.target.value as Cierre)}
          >
            <option value="cremallera_invisible">Cremallera invisible</option>
            <option value="cremallera_visible">Cremallera visible</option>
            <option value="botones">Botones</option>
            <option value="elastico">Elástico</option>
            <option value="ninguno">Sin cierre</option>
          </select>
        </Seccion>

        <Seccion titulo={`Largo · ${largo} cm`}>
          <Slider
            min={RANGO_LARGO[prenda].min}
            max={RANGO_LARGO[prenda].max}
            step={1}
            value={largo}
            onChange={(v) => {
              setLargo(v);
              setLargoEditado(true);
            }}
          />
        </Seccion>

        <Seccion titulo={`Margen de costura · ${margen} cm`}>
          <Slider min={0.5} max={2.5} step={0.5} value={margen} onChange={setMargen} />
          <label className="inline-flex items-center gap-1.5 text-xs text-tinta-600 mt-1">
            <input
              type="checkbox"
              checked={mostrarMargen}
              onChange={(e) => setMostrarMargen(e.target.checked)}
              className="accent-baya-700"
            />
            Mostrar margen en la vista previa
          </label>
        </Seccion>

        <div className="flex flex-col gap-2 pt-3 sticky bottom-20 sm:bottom-2 z-10">
          <button
            type="button"
            className="btn-primary"
            onClick={exportarPdf}
            disabled={!patron || exportando}
          >
            {exportando ? (
              'Generando…'
            ) : (
              <>
                <IconDownload size={16} /> Descargar PDF A4
              </>
            )}
          </button>
          <button type="button" className="btn-outline" onClick={guardar} disabled={!patron}>
            <IconCheck size={14} /> Guardar sin exportar
          </button>
        </div>

        {disposicion && (
          <p className="text-xs text-tinta-500 leading-relaxed">
            <span className="font-semibold text-tinta-700">{disposicion.tiles.length} hoja{disposicion.tiles.length === 1 ? '' : 's'} A4</span>{' '}
            ({disposicion.cols} × {disposicion.rows}) ·{' '}
            patrón {disposicion.bbox.w.toFixed(1)} × {disposicion.bbox.h.toFixed(1)} cm
          </p>
        )}

        {errorExport && (
          <div className="card border-baya-300 bg-baya-50 text-xs space-y-1.5">
            <div className="font-medium text-baya-700 flex items-center justify-between">
              <span>Error generando PDF</span>
              <button onClick={() => setErrorExport(null)} aria-label="Cerrar">
                <IconClose size={14} />
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-baya-700 text-[10px] overflow-auto max-h-32 font-mono">
              {errorExport}
            </pre>
          </div>
        )}
      </aside>

      <section className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-tinta-900">Previsualización</h2>
          {patron && (
            <span className="text-xs text-tinta-500">
              {patron.piezas.length} piezas · {patron.diseno.prenda}
            </span>
          )}
        </div>
        {patron ? (
          <PatronPreview patron={patron} mostrarMargen={mostrarMargen} margen={margen} />
        ) : (
          <div className="card text-tinta-600 text-sm">
            Elegí un perfil para generar el patrón.
          </div>
        )}
        {patron && (
          <div className="card !p-3 text-xs text-tinta-700">
            <p className="eyebrow mb-2">Detalle de piezas</p>
            <ul className="space-y-1">
              {patron.piezas.map((p, i) => (
                <li key={i} className="flex justify-between border-b border-dashed border-baya-100 last:border-0 py-1">
                  <span>{p.nombre}</span>
                  <span className="text-tinta-500">
                    {p.bbox.w.toFixed(1)} × {p.bbox.h.toFixed(1)} cm · cortar {p.cantidad}×
                    {p.cortarSobreDoblez && ' / doblez'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="card !p-3.5 space-y-2">
      <h3 className="eyebrow">{titulo}</h3>
      {children}
    </div>
  );
}

function Pills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; disponible?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(({ id, label, disponible = true }) => {
        const seleccionada = value === id;
        const klass = !disponible
          ? 'pill pill-disabled'
          : seleccionada
          ? 'pill pill-on'
          : 'pill pill-off';
        return (
          <button
            key={id}
            type="button"
            className={klass}
            disabled={!disponible}
            onClick={() => disponible && onChange(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Slider({
  min,
  max,
  step,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-baya-700"
    />
  );
}
