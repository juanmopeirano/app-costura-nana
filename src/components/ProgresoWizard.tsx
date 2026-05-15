type Props = { paso: number; total: number };

export default function ProgresoWizard({ paso, total }: Props) {
  const pct = Math.round((paso / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] uppercase tracking-[0.18em] text-tinta-500">
        <span>
          Paso {paso} de {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-baya-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-baya-500 to-baya-700 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
