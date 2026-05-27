import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Paperclip, Plus, ArrowUpRight } from 'lucide-react';
import { useRiskStore } from '../store/RiskStore';

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

function ActionCard({ action, risk, onUpdate }) {
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
    <div className="card mb-3">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-xs font-medium" style={{ color: '#5F5E5A' }}>{risk.id}</span>
            <span className="text-xs" style={{ color: '#D3D1C7' }}>·</span>
            <span className="text-xs truncate" style={{ color: '#5F5E5A' }}>{risk.title}</span>
          </div>
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

      {/* Save / expand toggle */}
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
            onClick={() => navigate(`/risks/${risk.id}/treat`)}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded border hover:bg-gray-50"
            style={{ borderColor: '#D3D1C7', color: '#5F5E5A' }}
          >
            View risk <ArrowUpRight size={11} />
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

      {/* Expanded: update log + add note */}
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

export default function MyActions() {
  const { state, updateAction } = useRiskStore();
  const navigate = useNavigate();

  const currentUser = state.currentUser;

  // Collect all actions assigned to current user across all risks
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
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#5F5E5A' }}>
            Open · {open.length}
          </h2>
          {open.map(({ action, risk }) => (
            <ActionCard
              key={action.id}
              action={action}
              risk={risk}
              onUpdate={patch => updateAction(risk.id, action.id, patch)}
            />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#5F5E5A' }}>
            Completed · {completed.length}
          </h2>
          {completed.map(({ action, risk }) => (
            <ActionCard
              key={action.id}
              action={action}
              risk={risk}
              onUpdate={patch => updateAction(risk.id, action.id, patch)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
