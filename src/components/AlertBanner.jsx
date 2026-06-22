import useStore from '../store';

export default function AlertBanner() {
  const activeAlerts = useStore((s) => s.activeAlerts);

  if (!activeAlerts.length) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-500/8 border border-emerald-500/15 dark:bg-emerald-500/5 dark:border-emerald-500/12 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors duration-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 flex-shrink-0" />
        <span className="font-semibold">All safe</span>
        <span className="text-emerald-600/70 dark:text-emerald-500/70">— no active alerts</span>
      </div>
    );
  }

  const worst = activeAlerts.reduce((a, b) => a.level === 'CRITICAL' ? a : b.level === 'CRITICAL' ? b : a);
  const isCrit = worst.level === 'CRITICAL';

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-sm transition-colors duration-300 ${
      isCrit
        ? 'bg-red-500/8 border-red-500/20 dark:bg-red-500/5 dark:border-red-500/15 text-red-700 dark:text-red-400'
        : 'bg-orange-500/8 border-orange-500/20 dark:bg-orange-500/5 dark:border-orange-500/15 text-orange-700 dark:text-orange-400'
    }`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${isCrit ? 'bg-red-500' : 'bg-orange-500'}`} />
      <span className="font-bold tracking-wide">{worst.level}</span>
      <span className="opacity-80">
        {worst.pollutant?.toUpperCase()} = {worst.value?.toFixed(2)} (threshold: {worst.threshold?.toFixed(2)})
      </span>
      {activeAlerts.length > 1 && (
        <span className="ml-auto text-xs font-semibold opacity-60">+{activeAlerts.length - 1} more</span>
      )}
    </div>
  );
}
