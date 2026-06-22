import { useNavigate } from 'react-router-dom';
import { GAS_META, getStatus } from '../utils/thresholds';
import { fmt } from '../utils/formatters';
import SparkLine from './SparkLine';

export default function GasGauge({ gasKey, value, history = [] }) {
  const navigate = useNavigate();
  const meta = GAS_META[gasKey];
  if (!meta) return null;

  const status = getStatus(gasKey, value);
  const pct = value != null ? Math.min((value / meta.max) * 100, 100) : 0;
  const sparkData = history.map((r) => r[gasKey]).filter((v) => v != null).slice(-60);

  const R = 37, cx = 50, cy = 50;
  const startAngle = -180, endAngle = 0;
  const arcAngle = startAngle + (pct / 100) * 180;
  const largeArc = pct > 50 ? 1 : 0;

  function polar(deg) {
    const rad = (deg * Math.PI) / 180;
    return [cx + R * Math.cos(rad), cy + R * Math.sin(rad)];
  }

  const [sx, sy] = polar(startAngle);
  const [ex, ey] = polar(arcAngle);
  const [bx, by] = polar(endAngle);

  const bgPath = `M ${sx} ${sy} A ${R} ${R} 0 1 1 ${bx} ${by}`;
  const arcPath = pct > 0 ? `M ${sx} ${sy} A ${R} ${R} 0 ${largeArc} 1 ${ex} ${ey}` : null;

  const decimals = gasKey === 'o3' || gasKey === 'no2' ? 3
    : gasKey === 'voc' || gasKey === 'co2' ? 0 : 1;

  return (
    <div
      onClick={() => navigate(`/gas/${gasKey}`)}
      className="relative flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl px-3.5 pt-3 pb-3 cursor-pointer group hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 overflow-hidden min-h-[168px]"
    >
      {/* Top accent glow */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent 10%, ${status.color}99 50%, transparent 90%)` }}
      />

      {/* Label + badge */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400 select-none">
          {meta.label}
        </span>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full select-none"
          style={{
            color: status.color,
            background: status.color + '18',
            border: `1px solid ${status.color}38`,
          }}
        >
          {status.badge}
        </span>
      </div>

      {/* Half-arc gauge */}
      <div className="flex justify-center flex-1">
        <svg viewBox="0 0 100 60" className="w-full max-w-[108px]">
          {/* Background track */}
          <path d={bgPath} fill="none" strokeWidth="6" strokeLinecap="round"
            className="stroke-gray-100 dark:stroke-gray-800" />
          {/* Value arc */}
          {arcPath && (
            <path d={arcPath} fill="none" stroke={status.color} strokeWidth="6"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 5px ${status.color}80)` }} />
          )}
          {/* Value */}
          <text x={cx} y={46} textAnchor="middle"
            style={{
              fontSize: '16px', fontWeight: 800,
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              fill: value != null ? status.color : '#9CA3AF',
            }}>
            {fmt(value, decimals)}
          </text>
          {/* Unit */}
          <text x={cx} y={56} textAnchor="middle"
            style={{ fontSize: '6.5px', fill: '#6B7280', letterSpacing: '0.07em' }}>
            {meta.unit}
          </text>
        </svg>
      </div>

      {/* Sparkline */}
      <div className="mt-1">
        <SparkLine data={sparkData} color={status.color} height={18} />
      </div>
    </div>
  );
}
