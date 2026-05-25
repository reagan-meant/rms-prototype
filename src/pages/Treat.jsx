import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, User, Calendar } from 'lucide-react';
import { useRiskStore } from '../store/RiskStore';
import Breadcrumb from '../components/Breadcrumb';
import StepProgress from '../components/StepProgress';
import ScorePill from '../components/ScorePill';

function StatusPill({ status }) {
  const styles = {
    Completed:   { bg: '#EAF3DE', color: '#173404' },
    'In progress': { bg: '#FAEEDA', color: '#412402' },
    'Not started': { bg: '#F0EFE9', color: '#5F5E5A' },
  };
  const s = styles[status] || styles['Not started'];
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function formatBudget(n) {
  return `UGX ${Number(n).toLocaleString()}`;
}

export default function Treat() {
  const { id } = useParams();
  const { state, updateRisk, addAction } = useRiskStore();
  const navigate = useNavigate();

  const risk = state.risks.find(r => r.id === id);

  const [strategy, setStrategy] = useState(risk?.treatmentStrategy || 'Mitigate');
  const [targetDate, setTargetDate] = useState(risk?.targetCompletion || '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAction, setNewAction] = useState({ title: '', owner: '', department: '', budget: '', dueDate: '' });

  if (!risk) {
    return (
      <div className="p-6 text-center" style={{ color: '#5F5E5A' }}>
        Risk not found. <button onClick={() => navigate('/register')} style={{ color: '#185FA5' }}>Go back</button>
      </div>
    );
  }

  const actions = risk.actions || [];
  const totalBudget = actions.reduce((sum, a) => sum + (Number(a.budget) || 0), 0);

  const handleAddAction = () => {
    if (!newAction.title) return;
    addAction(id, {
      id: `a_${Date.now()}`,
      ...newAction,
      budget: Number(newAction.budget) || 0,
      progress: 0,
      status: 'Not started',
    });
    setNewAction({ title: '', owner: '', department: '', budget: '', dueDate: '' });
    setShowAddForm(false);
  };

  const handleSave = () => {
    updateRisk(id, { treatmentStrategy: strategy, targetCompletion: targetDate });
    navigate('/register');
  };

  const inputStyle = { borderColor: '#D3D1C7', backgroundColor: 'white' };
  const inputClass = "px-3 py-1.5 text-sm rounded border focus:outline-none";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Breadcrumb items={[`${id}`, 'Step 4: Treatment plan']} />
      <StepProgress activeStep={4} />

      {/* Risk summary */}
      <div className="card mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="font-mono text-xs font-medium" style={{ color: '#5F5E5A' }}>{risk.id}</span>
            <h2 className="text-base font-semibold mt-0.5" style={{ color: '#2C2C2A' }}>{risk.title}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#5F5E5A' }}>
            <ScorePill score={risk.inherentScore} level={risk.inherentLevel} />
            <span>→</span>
            <ScorePill score={risk.residualScore} level={risk.residualLevel} />
            <span className="ml-1">target</span>
          </div>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#2C2C2A' }}>Treatment strategy</label>
            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              className={`w-full ${inputClass}`}
              style={inputStyle}
            >
              <option>Mitigate</option>
              <option>Avoid</option>
              <option>Transfer</option>
              <option>Accept</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#2C2C2A' }}>Target completion</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className={`w-full ${inputClass}`}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Mitigation actions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>Mitigation actions</h3>
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded font-medium hover:opacity-90 transition-opacity text-white"
            style={{ backgroundColor: '#185FA5' }}
          >
            <Plus size={12} /> Add action
          </button>
        </div>

        {/* Add action form */}
        {showAddForm && (
          <div className="mb-4 p-4 rounded border" style={{ borderColor: '#D3D1C7', backgroundColor: '#F9F9F7' }}>
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#2C2C2A' }}>Action title</label>
                <input
                  type="text"
                  className={`w-full ${inputClass}`}
                  style={inputStyle}
                  value={newAction.title}
                  onChange={e => setNewAction(a => ({ ...a, title: e.target.value }))}
                  placeholder="Describe the mitigation action..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2C2C2A' }}>Owner</label>
                <input type="text" className={`w-full ${inputClass}`} style={inputStyle} value={newAction.owner} onChange={e => setNewAction(a => ({ ...a, owner: e.target.value }))} placeholder="e.g. J. Okello" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2C2C2A' }}>Department</label>
                <input type="text" className={`w-full ${inputClass}`} style={inputStyle} value={newAction.department} onChange={e => setNewAction(a => ({ ...a, department: e.target.value }))} placeholder="e.g. Pharmacy" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2C2C2A' }}>Budget (UGX)</label>
                <input type="number" className={`w-full ${inputClass}`} style={inputStyle} value={newAction.budget} onChange={e => setNewAction(a => ({ ...a, budget: e.target.value }))} placeholder="e.g. 50000000" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2C2C2A' }}>Due date</label>
                <input type="date" className={`w-full ${inputClass}`} style={inputStyle} value={newAction.dueDate} onChange={e => setNewAction(a => ({ ...a, dueDate: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs rounded border hover:bg-gray-50" style={{ borderColor: '#D3D1C7', color: '#5F5E5A' }}>Cancel</button>
              <button onClick={handleAddAction} className="px-3 py-1.5 text-xs rounded text-white font-medium hover:opacity-90" style={{ backgroundColor: '#185FA5' }}>Add</button>
            </div>
          </div>
        )}

        {/* Action list */}
        <div className="flex flex-col gap-3">
          {actions.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: '#5F5E5A' }}>No actions yet. Add the first mitigation action.</p>
          )}
          {actions.map(action => (
            <div key={action.id} className="p-3 rounded border" style={{ borderColor: '#D3D1C7' }}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>{action.title}</p>
                <StatusPill status={action.status} />
              </div>
              <p className="text-xs mb-2" style={{ color: '#5F5E5A' }}>
                {action.department} · {formatBudget(action.budget)}
              </p>
              <div className="flex items-center gap-4 text-xs mb-2" style={{ color: '#5F5E5A' }}>
                <span className="flex items-center gap-1"><User size={11} /> {action.owner}</span>
                <span className="flex items-center gap-1"><Calendar size={11} /> Due: {action.dueDate}</span>
                {action.completedDate && <span style={{ color: '#173404' }}>✓ Done: {action.completedDate}</span>}
              </div>
              {action.status !== 'Not started' && (
                <div className="mt-1 rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: '#F0EFE9' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${action.progress}%`,
                      backgroundColor: action.status === 'Completed' ? '#3A8C4E' : '#D97706',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Total budget */}
        {actions.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-3 font-medium text-sm" style={{ borderTop: '1px solid #D3D1C7', color: '#2C2C2A' }}>
            <span>Total budget</span>
            <span>{formatBudget(totalBudget)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => navigate(`/risks/${id}/analyze`)}
          className="px-4 py-2 text-sm rounded border hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#D3D1C7', color: '#5F5E5A' }}
        >
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded border hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#D3D1C7', color: '#5F5E5A' }}
          >
            Save draft
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0F6E56' }}
          >
            ✓ Submit for approval
          </button>
        </div>
      </div>
    </div>
  );
}
