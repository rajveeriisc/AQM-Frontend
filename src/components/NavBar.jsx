import { NavLink } from 'react-router-dom';
import useStore from '../store';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/history', label: 'History' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/devices', label: 'Devices' },
  { to: '/settings', label: 'Settings' },
];

export default function NavBar() {
  const activeAlerts = useStore((s) => s.activeAlerts);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 px-4 hidden md:block sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <div className="flex items-center gap-0.5">
          {NAV_ITEMS.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `relative px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  {label === 'Alerts' && activeAlerts.length > 0 && (
                    <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-px leading-none">
                      {activeAlerts.length}
                    </span>
                  )}
                  {/* Active underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-base"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

      </div>
    </nav>
  );
}
