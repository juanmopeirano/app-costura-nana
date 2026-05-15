// Divisores y ornamentos decorativos inspirados en hilos y puntadas.

export function PuntadasDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-4 select-none">
      <span className="flex-1 stitch-divider-dashed" />
      {label && (
        <span className="eyebrow text-tinta-500 text-[10px]">{label}</span>
      )}
      <span className="flex-1 stitch-divider-dashed" />
    </div>
  );
}

export function CarreteOrn({ className }: { className?: string }) {
  // Pequeño ornamento: carrete con hilo enhebrado
  return (
    <svg
      width={42}
      height={28}
      viewBox="0 0 42 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <rect x={11} y={6} width={20} height={16} rx={2} />
      <line x1={8} y1={4} x2={34} y2={4} />
      <line x1={8} y1={24} x2={34} y2={24} />
      <path d="M14 10 L28 18 M14 14 L28 14 M14 18 L28 10" strokeOpacity={0.6} />
    </svg>
  );
}

export function AlfilerOrn({ className }: { className?: string }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx={6} cy={6} r={3} />
      <line x1={8} y1={8} x2={21} y2={21} />
    </svg>
  );
}
