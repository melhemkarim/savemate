export function Progress({ pct }: { pct: number }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative h-2.5 overflow-hidden rounded-full bg-mint2" role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gradient-to-r from-brand-mid to-brand transition-[width] duration-500" style={{ width: `${p}%` }} />
      {[25, 50, 75].map((t) => <span key={t} className="absolute inset-y-0 w-0.5 bg-white/90" style={{ left: `${t}%` }} />)}
    </div>
  );
}
