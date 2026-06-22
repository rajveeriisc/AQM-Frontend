import { aqiColor, aqiLabel } from '../utils/thresholds';

export default function AQIRing({ aqi, size = 168 }) {
  const color = aqiColor(aqi);
  const label = aqiLabel(aqi);
  const pct = aqi != null ? Math.min(aqi / 500, 1) : 0;

  const R = 52, cx = 72, cy = 72;
  const circumference = 2 * Math.PI * R;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1.5 select-none" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 144 144" width={size} height={size}>
          {/* Outer decorative ring */}
          <circle cx={cx} cy={cy} r={64}
            fill="none"
            strokeDasharray="2 5"
            strokeLinecap="round"
            className="stroke-gray-200 dark:stroke-gray-800"
            strokeWidth="1" />

          {/* Background track */}
          <circle cx={cx} cy={cy} r={R}
            fill="none"
            className="stroke-gray-100 dark:stroke-gray-800"
            strokeWidth="11" />

          {/* Glow halo (blurred duplicate behind) */}
          {aqi != null && (
            <circle cx={cx} cy={cy} r={R}
              fill="none"
              stroke={color}
              strokeWidth="16"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ opacity: 0.12, filter: 'blur(5px)', transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
            />
          )}

          {/* Value arc */}
          <circle cx={cx} cy={cy} r={R}
            fill="none"
            stroke={aqi != null ? color : '#374151'}
            strokeWidth="11"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{
              transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
              filter: aqi != null ? `drop-shadow(0 0 7px ${color}70)` : 'none',
            }}
          />

          {/* AQI number */}
          <text x={cx} y={cy - 4} textAnchor="middle"
            style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
            className="fill-gray-900 dark:fill-white">
            {aqi ?? '—'}
          </text>
          <text x={cx} y={cy + 15} textAnchor="middle"
            style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em' }}
            className="fill-gray-400 dark:fill-gray-500">
            AQI
          </text>
        </svg>
      </div>
      <span className="text-sm font-bold tracking-wide" style={{ color }}>{label}</span>
    </div>
  );
}
