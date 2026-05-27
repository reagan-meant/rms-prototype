import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Download } from 'lucide-react';
import { useRiskStore } from '../store/RiskStore';
import ScorePill from '../components/ScorePill';
import { resumeRoute, isSubmitted } from '../utils/riskRoute';

const LIKELIHOOD_LABELS = ['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Certain'];

function hmColor(l, i) {
  const score = l * i;
  if (score <= 4)  return '#C0DD97';
  if (score <= 6)  return '#EAF3DE';
  if (score <= 9)  return '#FAEEDA';
  if (score <= 12) return '#FCEBEB';
  if (score <= 16) return '#F09595';
  if (score <= 20) return '#E24B4A';
  return '#A32D2D';
}

function hmTextColor(l, i) {
  const score = l * i;
  return score >= 16 ? '#ffffff' : '#2C2C2A';
}

function KpiCard({ label, value, sublabel, bgColor, textColor }) {
  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-1"
      style={{ backgroundColor: bgColor || 'white', border: '1px solid #D3D1C7' }}
    >
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: textColor || '#5F5E5A' }}>
        {label}
      </span>
      <span className="text-3xl font-bold" style={{ color: textColor || '#2C2C2A' }}>
        {value}
      </span>
      {sublabel && (
        <span className="text-xs" style={{ color: textColor ? `${textColor}99` : '#5F5E5A' }}>
          {sublabel}
        </span>
      )}
    </div>
  );
}

function HeatMap({ heatMap }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col justify-between pr-2 text-xs" style={{ color: '#5F5E5A' }}>
        {[5, 4, 3, 2, 1].map(l => (
          <span key={l} className="text-right leading-none" style={{ lineHeight: '36px' }}>
            {LIKELIHOOD_LABELS[l]}
          </span>
        ))}
      </div>
      <div className="flex-1">
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[5, 4, 3, 2, 1].map(l =>
            [1, 2, 3, 4, 5].map(i => {
              const row = heatMap[5 - l];
              const cell = row ? row.find(c => c.impact === i) : null;
              const count = cell ? cell.count : 0;
              const bg = hmColor(l, i);
              const color = hmTextColor(l, i);
              return (
                <div
                  key={`${l}-${i}`}
                  className="rounded flex items-center justify-center text-sm font-semibold"
                  style={{ backgroundColor: bg, color, height: '44px' }}
                >
                  {count}
                </div>
              );
            })
          )}
        </div>
        <div className="grid mt-1 text-xs text-center" style={{ gridTemplateColumns: 'repeat(5, 1fr)', color: '#5F5E5A' }}>
          {[1, 2, 3, 4, 5].map(i => <span key={i}>{i}</span>)}
        </div>
        <p className="text-xs text-center mt-1" style={{ color: '#5F5E5A' }}>Impact →</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state } = useRiskStore();
  const navigate = useNavigate();
  const { kpis, heatMap, risks, ministry } = state;

  const submitted = risks.filter(isSubmitted);
  const topRisks = (submitted.length > 0 ? submitted : risks)
    .sort((a, b) => b.residualScore - a.residualScore)
    .slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#2C2C2A' }}>Risk dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5F5E5A' }}>
            {ministry.name} · {ministry.currentPeriod}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border hover:bg-gray-50 transition-colors" style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }}>
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border hover:bg-gray-50 transition-colors" style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }}>
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => navigate('/risks/new/identify')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#185FA5' }}
          >
            <Plus size={14} /> New risk
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total risks"
          value={kpis.totalRisks}
          sublabel={`${kpis.newThisMonth} new this month`}
        />
        <KpiCard
          label="High risks"
          value={kpis.highRisks}
          sublabel="Requires immediate action"
          bgColor="#FCEBEB"
          textColor="#501313"
        />
        <KpiCard
          label="Medium risks"
          value={kpis.mediumRisks}
          sublabel="Under monitoring"
          bgColor="#FAEEDA"
          textColor="#412402"
        />
        <KpiCard
          label="Low risks"
          value={kpis.lowRisks}
          sublabel="Acceptable level"
          bgColor="#EAF3DE"
          textColor="#173404"
        />
      </div>

      {/* Heat Map + Top Risks */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>
              Risk heat map · likelihood vs impact
            </h2>
            <div className="flex items-center gap-1 text-xs" style={{ color: '#5F5E5A' }}>
              Likelihood ↑
            </div>
          </div>
          <HeatMap heatMap={heatMap} />
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#2C2C2A' }}>
            Top high-priority risks
          </h2>
          <div className="flex flex-col gap-2">
            {topRisks.map(risk => {
              const owner = state.owners.find(o => o.id === risk.ownerId);
              return (
                <div
                  key={risk.id}
                  onClick={() => navigate(resumeRoute(risk))}
                  className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-mono font-medium shrink-0" style={{ color: '#5F5E5A', minWidth: '70px' }}>
                    {risk.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#2C2C2A' }}>{risk.title}</p>
                    <p className="text-xs truncate" style={{ color: '#5F5E5A' }}>{owner?.name}</p>
                  </div>
                  <ScorePill score={risk.residualScore} level={risk.residualLevel} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
