import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useRiskStore } from '../store/RiskStore';
import ScorePill from '../components/ScorePill';
import { resumeRoute } from '../utils/riskRoute';

const PAGE_SIZE = 10;

function StatusPill({ status }) {
  const styles = {
    Active:    { bg: '#EBF3FC', color: '#0D4A82' },
    Treating:  { bg: '#FAEEDA', color: '#412402' },
    Monitored: { bg: '#EAF3DE', color: '#173404' },
  };
  const s = styles[status] || styles.Active;
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

export default function Register() {
  const { state } = useRiskStore();
  const navigate = useNavigate();
  const { risks, departments, categories, owners, kpis } = state;

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = risks.filter(r => {
    const owner = owners.find(o => o.id === r.ownerId);
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      (owner?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || r.department === deptFilter;
    const matchCat  = !catFilter  || r.category  === catFilter;
    const matchLevel = !levelFilter || r.residualLevel === levelFilter;
    return matchSearch && matchDept && matchCat && matchLevel;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectClass = "text-sm rounded border px-2 py-1.5 bg-white focus:outline-none focus:ring-1";
  const selectStyle = { borderColor: '#D3D1C7', color: '#2C2C2A' };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#2C2C2A' }}>Risk register</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5F5E5A' }}>
            {kpis.totalRisks} risks · {kpis.activeRisks} active
          </p>
        </div>
        <button
          onClick={() => navigate('/risks/new/identify')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#185FA5' }}
        >
          <Plus size={14} /> New risk
        </button>
      </div>

      {/* Filter bar */}
      <div className="card mb-4 flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5F5E5A' }} />
          <input
            type="text"
            placeholder="Search risks..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded border focus:outline-none focus:ring-1"
            style={{ borderColor: '#D3D1C7' }}
          />
        </div>
        <select className={selectClass} style={selectStyle} value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
          <option value="">All departments</option>
          {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <select className={selectClass} style={selectStyle} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={selectClass} style={selectStyle} value={levelFilter} onChange={e => { setLevelFilter(e.target.value); setPage(1); }}>
          <option value="">All levels</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #D3D1C7', backgroundColor: '#F9F9F7' }}>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide" style={{ color: '#5F5E5A' }}>ID</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide" style={{ color: '#5F5E5A' }}>Risk</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide" style={{ color: '#5F5E5A' }}>Category</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide" style={{ color: '#5F5E5A' }}>Score</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide" style={{ color: '#5F5E5A' }}>Status</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide" style={{ color: '#5F5E5A' }}>Review date</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((risk, idx) => {
              const owner = owners.find(o => o.id === risk.ownerId);
              return (
                <tr
                  key={risk.id}
                  onClick={() => navigate(resumeRoute(risk))}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: idx < paginated.length - 1 ? '1px solid #F0EFE9' : 'none' }}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: '#5F5E5A' }}>{risk.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: '#2C2C2A' }}>{risk.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#5F5E5A' }}>{risk.department} · {owner?.name}</p>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#5F5E5A' }}>{risk.category}</td>
                  <td className="px-4 py-3">
                    <ScorePill score={risk.residualScore} level={risk.residualLevel} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={risk.status} />
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {risk.isOverdue ? (
                      <span className="font-medium" style={{ color: '#E24B4A' }}>Overdue</span>
                    ) : (
                      <span style={{ color: '#5F5E5A' }}>{risk.reviewDate}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: '#5F5E5A' }}>
                  No risks match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #D3D1C7', backgroundColor: '#F9F9F7' }}>
          <span className="text-xs" style={{ color: '#5F5E5A' }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {kpis.totalRisks}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs rounded border disabled:opacity-40 hover:bg-gray-100 transition-colors"
              style={{ borderColor: '#D3D1C7' }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 text-xs rounded border disabled:opacity-40 hover:bg-gray-100 transition-colors"
              style={{ borderColor: '#D3D1C7' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
