import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { useRiskStore } from '../store/RiskStore';
import Breadcrumb from '../components/Breadcrumb';
import StepProgress from '../components/StepProgress';

const inputClass = "w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-1 focus:ring-blue-500";
const inputStyle = { borderColor: '#D3D1C7', backgroundColor: 'white' };
const labelClass = "block text-xs font-medium mb-1";
const labelStyle = { color: '#2C2C2A' };

export default function Identify() {
  const { id } = useParams();
  const { state, addRisk, updateRisk } = useRiskStore();
  const navigate = useNavigate();
  const { departments, categories, owners, strategicObjectives } = state;

  const existing = id ? state.risks.find(r => r.id === id) : null;

  const [form, setForm] = useState({
    title: existing?.title || '',
    description: existing?.description || '',
    category: existing?.category || '',
    department: existing?.department || '',
    ownerId: existing?.ownerId || '',
    strategicObjective: existing?.strategicObjective || '',
    rootCauses: existing?.rootCauses || '',
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!form.title || !form.description || !form.category || !form.department || !form.ownerId) return;

    if (existing) {
      updateRisk(existing.id, form);
      navigate(`/risks/${existing.id}/analyze`);
    } else {
      const newId = `NPA-${Date.now().toString().slice(-4)}`;
      addRisk({
        id: newId,
        ...form,
        likelihood: 3,
        impactScores: { financial: 3, service: 3, reputational: 3, compliance: 3, development: 3 },
        overallImpact: 3,
        inherentScore: 9,
        inherentLevel: 'Medium',
        existingControls: '',
        controlEffectiveness: 'Moderate',
        residualScore: 5,
        residualLevel: 'Medium',
        treatmentStrategy: 'Mitigate',
        targetCompletion: '',
        status: 'Active',
        reviewDate: '',
        isOverdue: false,
        actions: [],
      });
      navigate(`/risks/${newId}/analyze`);
    }
  };

  const riskId = existing?.id || null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Breadcrumb items={existing ? [existing.id, 'Step 1: Identify'] : ['Risk register', 'New risk', 'Step 1: Identify']} />
      <StepProgress activeStep={1} riskId={riskId} risk={existing} />

      <div className="card">
        <h2 className="text-base font-semibold mb-5" style={{ color: '#2C2C2A' }}>Identify risk</h2>

        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="col-span-2">
            <label className={labelClass} style={labelStyle}>Risk title <span style={{ color: '#E24B4A' }}>*</span></label>
            <input type="text" className={inputClass} style={inputStyle} value={form.title} onChange={set('title')} placeholder="e.g. Stockout of essential medicines" />
          </div>

          <div className="col-span-2">
            <label className={labelClass} style={labelStyle}>Description <span style={{ color: '#E24B4A' }}>*</span></label>
            <textarea rows={3} className={inputClass} style={inputStyle} value={form.description} onChange={set('description')} placeholder="Describe the risk in detail..." />
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Category <span style={{ color: '#E24B4A' }}>*</span></label>
            <select className={inputClass} style={inputStyle} value={form.category} onChange={set('category')}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Department <span style={{ color: '#E24B4A' }}>*</span></label>
            <select className={inputClass} style={inputStyle} value={form.department} onChange={set('department')}>
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Risk owner <span style={{ color: '#E24B4A' }}>*</span></label>
            <select className={inputClass} style={inputStyle} value={form.ownerId} onChange={set('ownerId')}>
              <option value="">Select owner</option>
              {owners.map(o => <option key={o.id} value={o.id}>{o.name} · {o.title}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Linked strategic objective</label>
            <select className={inputClass} style={inputStyle} value={form.strategicObjective} onChange={set('strategicObjective')}>
              <option value="">Select objective</option>
              {strategicObjectives.map(obj => <option key={obj} value={obj}>{obj}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className={labelClass} style={labelStyle}>Root causes</label>
            <textarea rows={2} className={inputClass} style={inputStyle} value={form.rootCauses} onChange={set('rootCauses')} placeholder="Describe the underlying causes..." />
          </div>

          <div className="col-span-2">
            <label className={labelClass} style={labelStyle}>Supporting documents</label>
            <div
              className="rounded border-2 border-dashed p-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#D3D1C7' }}
            >
              <Upload size={20} style={{ color: '#5F5E5A' }} />
              <p className="text-sm" style={{ color: '#5F5E5A' }}>Drop files here or click to upload</p>
              <p className="text-xs" style={{ color: '#9C9B98' }}>PDF, DOCX, XLSX up to 10MB</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid #D3D1C7' }}>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 text-sm rounded border hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#D3D1C7', color: '#5F5E5A' }}
          >
            ← Back to register
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title || !form.description || !form.category || !form.department || !form.ownerId}
            className="px-4 py-2 text-sm rounded text-white font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: '#185FA5' }}
          >
            Continue to analyze →
          </button>
        </div>
      </div>
    </div>
  );
}
