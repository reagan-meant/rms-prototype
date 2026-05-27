import { NavLink } from 'react-router-dom';
import { useRiskStore } from '../store/RiskStore';
import { BarChart3 } from 'lucide-react';

export default function NavBar() {
  const { state } = useRiskStore();
  const user = state.currentUser;

  const openActionCount = state.risks
    .flatMap(r => r.actions || [])
    .filter(a => a.owner === user.name && a.status !== 'Completed')
    .length;

  const linkClass = ({ isActive }) =>
    `px-3 py-1 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-white/20 text-white'
        : 'text-white/80 hover:text-white hover:bg-white/10'
    }`;

  return (
    <nav style={{ backgroundColor: '#0F6E56' }} className="flex items-center px-6 py-3 gap-6">
      <div className="flex items-center gap-2 text-white font-semibold text-base mr-4">
        <BarChart3 size={20} />
        NPA Risk Management
      </div>
      <div className="flex items-center gap-1">
        <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/register" className={linkClass}>Risk Register</NavLink>
        <NavLink to="/my-actions" className={({ isActive }) =>
          `relative px-3 py-1 rounded text-sm font-medium transition-colors ${
            isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
          }`
        }>
          My actions
          {openActionCount > 0 && (
            <span
              className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
              style={{ backgroundColor: '#E24B4A', color: 'white', fontSize: '10px' }}
            >
              {openActionCount}
            </span>
          )}
        </NavLink>
        <NavLink to="/reports" className={linkClass}>Reports</NavLink>
        <NavLink to="/admin" className={linkClass}>Admin</NavLink>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="text-white text-sm">
          <span className="font-medium">{user.name}</span>
          <span className="text-white/60 ml-1">· {user.role}</span>
        </div>
      </div>
    </nav>
  );
}
