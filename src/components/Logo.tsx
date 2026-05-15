type Props = { size?: number; className?: string };

// Marca: tijera + hilo enhebrado. Combina dos líneas suaves que evocan costura.
export default function Logo({ size = 32, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* Aro grande de la tijera */}
      <circle cx={14} cy={34} r={6} />
      <circle cx={26} cy={34} r={6} />
      {/* Hojas de la tijera */}
      <path d="M16.5 29 L40 8" />
      <path d="M23.5 29 L40 8" strokeOpacity={0.75} />
      {/* Hilo enhebrado con curva */}
      <path
        d="M6 6 Q 14 4 18 10 T 30 14 T 44 18"
        strokeDasharray="2 3"
        strokeOpacity={0.85}
      />
    </svg>
  );
}
