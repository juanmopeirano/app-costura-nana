import { NavLink, Route, Routes } from 'react-router-dom';
import Inicio from './pages/Inicio';
import MedidasWizard from './pages/MedidasWizard';
import MisMedidas from './pages/MisMedidas';
import NuevoProyecto from './pages/NuevoProyecto';
import MisPatrones from './pages/MisPatrones';
import Logo from './components/Logo';
import { IconArchive, IconHome, IconRuler, IconScissors } from './components/Icon';

type NavItem = { to: string; label: string; icon: React.ReactNode };

const linksPrincipales: NavItem[] = [
  { to: '/nuevo', label: 'Nuevo patrón', icon: <IconScissors size={16} /> },
  { to: '/medidas', label: 'Mis medidas', icon: <IconRuler size={16} /> },
  { to: '/patrones', label: 'Mis patrones', icon: <IconArchive size={16} /> },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition ${
    isActive
      ? 'bg-baya-700 text-crema-50 shadow-paper'
      : 'text-tinta-700 hover:bg-baya-50 hover:text-baya-700'
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
    isActive ? 'text-baya-700' : 'text-tinta-500'
  }`;

const mobileLinks: NavItem[] = [
  { to: '/', label: 'Inicio', icon: <IconHome size={20} /> },
  { to: '/nuevo', label: 'Patrón', icon: <IconScissors size={20} /> },
  { to: '/medidas', label: 'Medidas', icon: <IconRuler size={20} /> },
  { to: '/patrones', label: 'Archivo', icon: <IconArchive size={20} /> },
];

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-20 bg-crema-100/85 backdrop-blur-md border-b border-baya-100">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <span className="text-baya-700 transition-transform group-hover:rotate-[-6deg]">
              <Logo size={32} />
            </span>
            <div className="leading-tight">
              <div className="font-display text-xl text-baya-800 tracking-tight">
                Costura Nana
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-tinta-500 -mt-0.5">
                Atelier digital
              </div>
            </div>
          </NavLink>
          <nav className="hidden sm:flex items-center gap-1">
            {linksPrincipales.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.icon}
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:pb-10 animate-fade-up">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/medidas" element={<MisMedidas />} />
            <Route path="/medidas/nueva" element={<MedidasWizard />} />
            <Route path="/medidas/:id" element={<MedidasWizard />} />
            <Route path="/nuevo" element={<NuevoProyecto />} />
            <Route path="/patrones" element={<MisPatrones />} />
          </Routes>
        </div>
      </main>
      <footer className="border-t border-baya-100 py-5 bg-crema-50/60">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-tinta-500">
          <div className="flex items-center gap-2">
            <span className="font-display italic text-tinta-600">
              Hecho con paciencia y cinta métrica.
            </span>
          </div>
          <div className="opacity-70">
            Basado en el manual SENA de Patronaje Básico · CC BY-NC-SA 4.0
          </div>
        </div>
      </footer>
      {/* Bottom nav mobile */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-crema-50/95 backdrop-blur border-t border-baya-100 px-2 py-1.5 flex justify-around shadow-paper-lg">
        {mobileLinks.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className={mobileLinkClass}>
            {l.icon}
            <span className="text-[10px]">{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
