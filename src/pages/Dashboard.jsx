import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store';
import { useSocket } from '../hooks/useSocket';
import { useDevice } from '../hooks/useDevice';
import { useAlerts } from '../hooks/useAlerts';
import GasGauge from '../components/GasGauge';
import AQIRing from '../components/AQIRing';
import TrendChart from '../components/TrendChart';
import AlertBanner from '../components/AlertBanner';
import DeviceStatus from '../components/DeviceStatus';
import { GAS_KEYS, GAS_META } from '../utils/thresholds';
import { fmt, fmtTime } from '../utils/formatters';
import client from '../api/client';

const TIME_RANGES = ['1H', '6H', '24H'];
const RANGE_HOURS = { '1H': 1, '6H': 6, '24H': 24 };

export default function Dashboard() {
  const storedLiveReading = useStore((s) => s.liveReading);
  const readingHistory = useStore((s) => s.readingHistory);
  const devices = useStore((s) => s.devices);
  const isDevicesLoading = useStore((s) => s.isDevicesLoading);
  const selectedDeviceId = useStore((s) => s.selectedDeviceId);
  const selectDevice = useStore((s) => s.selectDevice);
  const tempUnit = useStore((s) => s.tempUnit);

  const { fetchHistory } = useDevice();
  useSocket();
  useAlerts();

  const [timeRange, setTimeRange] = useState('1H');
  const [now, setNow] = useState(new Date());
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;
    fetchHistory(selectedDeviceId, RANGE_HOURS[timeRange]);
    const from = new Date(Date.now() - RANGE_HOURS[timeRange] * 3600000).toISOString();
    client.get('/readings/stats', { params: { deviceId: selectedDeviceId, from } })
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, [timeRange, selectedDeviceId]);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
  const liveReading = storedLiveReading ?? selectedDevice?.latestReading ?? null;

  const temp = liveReading?.temp;
  const displayTemp = temp != null
    ? tempUnit === 'F'
      ? `${((temp * 9) / 5 + 32).toFixed(1)}°F`
      : `${temp.toFixed(1)}°C`
    : '—';

  if (isDevicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-gray-200 dark:border-gray-800 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs font-medium text-gray-400 tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="text-6xl">📡</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No devices linked</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
          Go to <strong>Devices</strong> and add your monitor using the 6-digit pairing code.
        </p>
        <Link to="/devices"
          className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
          Add Device
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">AQM Systems</span>
          <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>

        <select
          value={selectedDeviceId || ''}
          onChange={(e) => selectDevice(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}{d.status === 'offline' ? ' (offline)' : ''}
            </option>
          ))}
        </select>

        <span className="font-mono text-sm font-medium text-gray-400 dark:text-gray-500 tabular-nums">
          {now.toLocaleTimeString()}
        </span>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">

        {/* Alert banner */}
        <AlertBanner />

        {/* Hero row */}
        <div className="flex flex-wrap gap-5 items-start">
          <AQIRing aqi={liveReading?.aqi} size={168} />

          <div className="flex flex-col gap-3 flex-1 min-w-[220px]">
            {/* Device status */}
            <div className="flex items-center gap-2">
              {selectedDevice && (
                <DeviceStatus status={selectedDevice.status} lastSeen={selectedDevice.lastSeen} />
              )}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Temperature" value={displayTemp} color="#3B82F6" />
              <StatCard label="Humidity" value={liveReading?.rh != null ? `${fmt(liveReading.rh, 1)}%` : '—'} color="#06B6D4" />
              <StatCard
                label="Primary Pollutant"
                value={liveReading?.primaryPollutant && GAS_META[liveReading.primaryPollutant]
                  ? GAS_META[liveReading.primaryPollutant].label : '—'}
                color="#8B5CF6"
              />
              <StatCard label="Readings Today" value={stats?.count ?? '—'} color="#10B981" />
              <StatCard label={`${timeRange} Avg AQI`} value={stats?.aqi?.avg != null ? Math.round(stats.aqi.avg) : '—'} color="#F59E0B" />
              <StatCard label="Last Update" value={liveReading?.ts ? fmtTime(liveReading.ts) : '—'} color="#6366F1" />
            </div>
          </div>
        </div>

        {/* Gas gauges */}
        <section>
          <SectionHeader>Real-Time Gas Monitor</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
            {GAS_KEYS.map((key) => (
              <GasGauge key={key} gasKey={key} value={liveReading?.[key]} history={readingHistory} />
            ))}
          </div>
        </section>

        {/* Trend chart */}
        <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader inline>Trend — All Gases Normalised</SectionHeader>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {TIME_RANGES.map((r) => (
                <button key={r} onClick={() => setTimeRange(r)}
                  className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
                    timeRange === r
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <TrendChart history={readingHistory} timeRange={timeRange} />
        </section>

      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 overflow-hidden">
      {/* Left accent */}
      <div className="absolute left-0 inset-y-3 w-0.5 rounded-r-full" style={{ background: color }} />
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1.5 pl-1">
        {label}
      </p>
      <p className="text-[22px] font-mono font-bold text-gray-900 dark:text-white leading-none pl-1">
        {value}
      </p>
    </div>
  );
}

function SectionHeader({ children, inline = false }) {
  if (inline) {
    return (
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
        {children}
      </h2>
    );
  }
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
        {children}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-800 to-transparent" />
    </div>
  );
}
