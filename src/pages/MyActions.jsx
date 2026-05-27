import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Paperclip, Plus, X, User, Calendar } from 'lucide-react';
import { useRiskStore } from '../store/RiskStore';
import ScorePill from '../components/ScorePill';

function formatBudget(n) {
  return `UGX ${Number(n).toLocaleString()}`;
}

function StatusSelect({ value, onChange }) {
  const options = ['Not started', 'In progress', 'Completed'];
  const styles = {
    Completed:    { bg: '#EAF3DE', color: '#173404' },
    'In progress':{ bg: '#FAEEDA', color: '#412402' },
    'Not started':{ bg: '#F0EFE9', color: '#5F5E5A' },
  };
  const s = styles[value] || styles['Not started'];
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs font-medium rounded-full px-2 py-0.5 border-0 focus:outline-none cursor-pointer"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function ProgressBar({ progress, status }) {
  if (status === 'Not started') return null;
  const color = status === 'Completed' ? '#3A8C4E' : '#D97706';
  return (
    <div className="rounded-full h-1.5 overflow-hidden mt-2" style={{ backgroundColor: '#F0EFE9' }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    Completed:    { bg: '#EAF3DE', color: '#173404' },
    'In progress':{ bg: '#FAEEDA', color: '#412402' },
    'Not started':{ bg: '#F0EFE9', color: '#5F5E5A' },
  };
  const s = styles[status] || styles['Not started'];
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

// ── Read-only risk detail panel ──────────────────────────────────────────────

const IMPACT_LABELS = {
  financial: 'Financial',
  service: 'Service delivery',
  reputational: 'Reputational',
  compliance: 'Compliance',
  development: 'Development',
};

function ImpactBar({ value }) {
  const colors = ['', '#C0DD97', '#EAF3DE', '#FAEEDA', '#F09595', '#E24B4A'];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(n => (
          <div
            key={n}
            className="rounded-sm"
            style={{ width: 16, height: 10, backgroundColor: n <= value ? colors[value] : '#F0EFE9' }}
          />
        ))}
      </div>
      <span className="text-xs tabular-nums" style={{ color: '#5F5E5A' }}>{value}</span>
    </div>
  );
}

function RiskDetailPanel({ risk, onClose }) {
  if (!risk) return null;

  const actions = risk.actions || [];
  const totalBudget = actions.reduce((sum, a) => sum + (Number(a.budget) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div
        className="h-full overflow-y-auto flex flex-col"
        style={{ width: 480, backgroundColor: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Panel header */}
        <div className="flex items-start justify-between px-6 py-4 sticky top-0 bg-white z-10" style={{ borderBottom: '1px solid #F0EFE9' }}>
          <div>
            <span className="font-mono text-xs font-medium" style={{ color: '#5F5E5A' }}>{risk.id}</span>
            <h2 className="text-base font-semibold mt-0.5" style={{ color: '#2C2C2A' }}>{risk.title}</h2>
          </div>
          <button onClick={onClose} className="ml-4 mt-0.5 hover:opacity-60 transition-opacity" style={{ color: '#5F5E5A' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Scores */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: '#9C9B98' }}>Inherent</p>
              <ScorePill score={risk.inherentScore} level={risk.inherentLevel} />
            </div>
            <span style={{ color: '#D3D1C7' }}>→</span>
            <div>
              <p className="text-xs mb-1" style={{ color: '#9C9B98' }}>Residual</p>
              <ScorePill score={risk.residualScore} level={risk.residualLevel} />
            </div>
            {risk.treatmentStrategy && (
              <div className="ml-auto">
                <p className="text-xs mb-1" style={{ color: '#9C9B98' }}>Strategy</p>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F0EFE9', color: '#2C2C2A' }}>
                  {risk.treatmentStrategy}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#9C9B98' }}>Description</p>
            <p className="text-sm" style={{ color: '#2C2C2A' }}>{risk.description}</p>
          </div>

          {/* Root causes */}
          {risk.rootCauses && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#9C9B98' }}>Root causes</p>
              <p className="text-sm" style={{ color: '#2C2C2A' }}>{risk.rootCauses}</p>
            </div>
          )}

          {/* Impact scores */}
          {risk.impactScores && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#9C9B98' }}>Impact breakdown</p>
              <div className="flex flex-col gap-2">
                {Object.entries(risk.impactScores).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#5F5E5A' }}>{IMPACT_LABELS[key] || key}</span>
                    <ImpactBar value={val} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          {risk.existingControls && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#9C9B98' }}>Existing controls</p>
              <p className="text-sm" style={{ color: '#2C2C2A' }}>{risk.existingControls}</p>
              {risk.controlEffectiveness && (
                <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F0EFE9', color: '#5F5E5A' }}>
                  Effectiveness: {risk.controlEffectiveness}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#9C9B98' }}>Treatment actions</p>
              <div className="flex flex-col gap-2">
                {actions.map(a => (
                  <div key={a.id} className="p-3 rounded" style={{ backgroundColor: '#F9F9F7', border: '1px solid #F0EFE9' }}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-medium" style={{ color: '#2C2C2A' }}>{a.title}</p>
                      <StatusPill status={a.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: '#9C9B98' }}>
                      <span className="flex items-center gap-1"><User size={10} /> {a.owner}</span>
                      <span className="flex items-center gap-1"><Calendar size={10} /> {a.dueDate}</span>
                    </div>
                    {a.status !== 'Not started' && (
                      <div className="mt-2 rounded-full h-1 overflow-hidden" style={{ backgroundColor: '#E8E7E1' }}>
                        <div className="h-full rounded-full" style={{ width: `${a.progress}%`, backgroundColor: a.status === 'Completed' ? '#3A8C4E' : '#D97706' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {totalBudget > 0 && (
                <div className="flex justify-between mt-2 pt-2 text-xs font-medium" style={{ borderTop: '1px solid #F0EFE9', color: '#2C2C2A' }}>
                  <span>Total budget</span>
                  <span>{formatBudget(totalBudget)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Action card ──────────────────────────────────────────────────────────────

function ActionCard({ action, risk, onUpdate, onViewRisk }) {
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(action.progress ?? 0);
  const [status, setStatus] = useState(action.status);
  const [newNote, setNewNote] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);

  const isDirty = progress !== action.progress || status !== action.status;

  const handleSave = () => {
    const patch = { progress, status };
    if (status === 'Completed' && !action.completedDate) {
      patch.completedDate = new Date().toISOString().slice(0, 10);
      patch.progress = 100;
      setProgress(100);
    }
    onUpdate(patch);
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    if (val === 'Completed') setProgress(100);
    if (val === 'Not started') setProgress(0);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const update = {
      id: `u_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      note: newNote.trim(),
      evidence: null,
    };
    onUpdate({ updates: [...(action.updates || []), update] });
    setNewNote('');
    setShowNoteForm(false);
  };

  const updates = action.updates || [];

  return (
    <div className="card">
      {/* Risk context */}
      <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid #F0EFE9' }}>
        <span className="font-mono text-xs font-semibold" style={{ color: '#185FA5' }}>{risk.id}</span>
        <span style={{ color: '#D3D1C7' }}>·</span>
        <span className="text-xs truncate" style={{ color: '#5F5E5A' }}>{risk.title}</span>
      </div>

      {/* Action header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>{action.title}</p>
          <p className="text-xs mt-0.5" style={{ color: '#5F5E5A' }}>
            {action.department} · {formatBudget(action.budget)} · Due: {action.dueDate}
          </p>
        </div>
        <StatusSelect value={status} onChange={handleStatusChange} />
      </div>

      {/* Progress slider */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs w-8 text-right tabular-nums" style={{ color: '#5F5E5A' }}>{progress}%</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          onChange={e => setProgress(Number(e.target.value))}
          disabled={status === 'Completed' || status === 'Not started'}
          className="flex-1 accent-blue-600"
        />
      </div>
      <ProgressBar progress={progress} status={status} />

      {/* Footer row */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2">
          {isDirty && (
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs rounded text-white font-medium hover:opacity-90"
              style={{ backgroundColor: '#185FA5' }}
            >
              Save changes
            </button>
          )}
          <button
            onClick={onViewRisk}
            className="px-3 py-1 text-xs rounded border hover:bg-gray-50"
            style={{ borderColor: '#D3D1C7', color: '#5F5E5A' }}
          >
            View risk
          </button>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-xs hover:opacity-70"
          style={{ color: '#5F5E5A' }}
        >
          {updates.length > 0 && <span>{updates.length} update{updates.length !== 1 ? 's' : ''}</span>}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded update log */}
      {expanded && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #F0EFE9' }}>
          {updates.length === 0 && !showNoteForm && (
            <p className="text-xs text-center pb-2" style={{ color: '#9C9B98' }}>No updates logged yet.</p>
          )}
          <div className="flex flex-col gap-2 mb-3">
            {updates.map(u => (
              <div key={u.id} className="flex gap-3">
                <div className="text-xs shrink-0 mt-0.5 tabular-nums" style={{ color: '#9C9B98' }}>{u.date}</div>
                <div className="flex-1">
                  <p className="text-xs" style={{ color: '#2C2C2A' }}>{u.note}</p>
                  {u.evidence && (
                    <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: '#185FA5' }}>
                      <Paperclip size={11} /> {u.evidence}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showNoteForm ? (
            <div className="flex flex-col gap-2">
              <textarea
                rows={2}
                className="w-full px-3 py-2 text-xs rounded border focus:outline-none"
                style={{ borderColor: '#D3D1C7' }}
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Describe progress, blockers, or next steps..."
                autoFocus
              />
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: '#D3D1C7', color: '#5F5E5A', borderStyle: 'dashed' }}
                >
                  <Paperclip size={11} /> Attach evidence (visual only)
                </div>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => setShowNoteForm(false)} className="px-3 py-1 text-xs rounded border hover:bg-gray-50" style={{ borderColor: '#D3D1C7', color: '#5F5E5A' }}>Cancel</button>
                  <button onClick={handleAddNote} className="px-3 py-1 text-xs rounded text-white hover:opacity-90" style={{ backgroundColor: '#185FA5' }}>Add update</button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNoteForm(true)}
              className="flex items-center gap-1.5 text-xs hover:opacity-70"
              style={{ color: '#185FA5' }}
            >
              <Plus size={12} /> Log an update
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MyActions() {
  const { state, updateAction } = useRiskStore();
  const navigate = useNavigate();
  const [previewRisk, setPreviewRisk] = useState(null);

  const currentUser = state.currentUser;

  const myActions = [];
  for (const risk of state.risks) {
    for (const action of risk.actions || []) {
      if (action.owner === currentUser.name) {
        myActions.push({ action, risk });
      }
    }
  }

  const open = myActions.filter(({ action }) => action.status !== 'Completed');
  const completed = myActions.filter(({ action }) => action.status === 'Completed');

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#2C2C2A' }}>My actions</h1>
          <p className="text-sm mt-0.5" style={{ color: '#5F5E5A' }}>
            {currentUser.name} · {currentUser.role} · {myActions.length} assigned
          </p>
        </div>
      </div>

      {myActions.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-sm" style={{ color: '#5F5E5A' }}>No actions are currently assigned to you.</p>
        </div>
      )}

      {open.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#5F5E5A' }}>
            Open · {open.length}
          </h2>
          <div className="flex flex-col gap-3">
            {open.map(({ action, risk }) => (
              <ActionCard
                key={action.id}
                action={action}
                risk={risk}
                onUpdate={patch => updateAction(risk.id, action.id, patch)}
                onViewRisk={() => setPreviewRisk(risk)}
              />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#5F5E5A' }}>
            Completed · {completed.length}
          </h2>
          <div className="flex flex-col gap-3">
            {completed.map(({ action, risk }) => (
              <ActionCard
                key={action.id}
                action={action}
                risk={risk}
                onUpdate={patch => updateAction(risk.id, action.id, patch)}
                onViewRisk={() => setPreviewRisk(risk)}
              />
            ))}
          </div>
        </div>
      )}

      <RiskDetailPanel risk={previewRisk} onClose={() => setPreviewRisk(null)} />
    </div>
  );
}
