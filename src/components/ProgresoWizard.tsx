type Props = { paso: number; total: number };

export default function ProgresoWizard({ paso, total }: Props) {
  const pct = Math.round((paso / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-tinta/70">
        <span>
          Paso {paso} de {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-rosa-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-rosa-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
