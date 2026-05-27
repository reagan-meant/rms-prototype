import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRiskStore } from '../store/RiskStore';
import Breadcrumb from '../components/Breadcrumb';
import StepProgress from '../components/StepProgress';
import ScorePill from '../components/ScorePill';

export default function Evaluate() {
  const { id } = useParams();
  const { state, updateRisk } = useRiskStore();
  const navigate = useNavigate();

  const risk = state.risks.find(r => r.id === id);

  const [decision, setDecision] = useState(risk?.evaluationDecision || 'Treat');
  const [rationale, setRationale] = useState(risk?.evaluationRationale || '');

  if (!risk) {
    return (
      <div className="p-6 text-center" style={{ color: '#5F5E5A' }}>
        Risk not found. <button onClick={() => navigate('/register')} style={{ color: '#185FA5' }}>Go back</button>
      </div>
    );
  }

  const handleContinue = () => {
    updateRisk(id, { evaluationDecision: decision, evaluationRationale: rationale });
    navigate(`/risks/${id}/treat`);
  };

  const inputStyle = { borderColor: '#D3D1C7', backgroundColor: 'white' };

  const options = [
    { value: 'Treat',    label: 'Treat',    desc: 'Risk level is unacceptable. Proceed with mitigation actions.' },
    { value: 'Accept',   label: 'Accept',   desc: 'Risk is within tolerance. No further action required at this time.' },
    { value: 'Transfer', label: 'Transfer', desc: 'Risk to be transferred to another party (e.g. insurance, contract).' },
    { value: 'Avoid',    label: 'Avoid',    desc: 'Activity giving rise to the risk will be discontinued.' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Breadcrumb items={[`${id}`, 'Step 3: Evaluate']} />
      <StepProgress activeStep={3} riskId={id} risk={risk} />

      <div className="card">
        <h2 className="text-base font-semibold mb-1" style={{ color: '#2C2C2A' }}>Evaluate risk</h2>
        <p className="text-sm mb-5" style={{ color: '#5F5E5A' }}>
          Review the scored risk and decide how to respond.
        </p>

        {/* Risk summary */}
        <div className="flex items-center gap-4 p-3 rounded mb-6" style={{ backgroundColor: '#F5F5F0', border: '1px solid #D3D1C7' }}>
          <div className="flex-1">
            <p className="font-mono text-xs mb-0.5" style={{ color: '#5F5E5A' }}>{risk.id}</p>
            <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>{risk.title}</p>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: '#5F5E5A' }}>
            <div className="text-center">
              <p className="mb-1">Inherent</p>
              <ScorePill score={risk.inherentScore} level={risk.inherentLevel} />
            </div>
            <span>→</span>
            <div className="text-center">
              <p className="mb-1">Residual</p>
              <ScorePill score={risk.residualScore} level={risk.residualLevel} />
            </div>
          </div>
        </div>

        {/* Decision */}
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#2C2C2A' }}>Decision</h3>
        <div className="flex flex-col gap-2 mb-5">
          {options.map(opt => {
            const active = decision === opt.value;
            return (
              <label
                key={opt.value}
                className="flex items-start gap-3 p-3 rounded border-2 cursor-pointer transition-all"
                style={{
                  borderColor: active ? '#185FA5' : '#D3D1C7',
                  backgroundColor: active ? '#EBF3FC' : 'white',
                }}
              >
                <input
                  type="radio"
                  name="decision"
                  value={opt.value}
                  checked={active}
                  onChange={() => setDecision(opt.value)}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: active ? '#185FA5' : '#2C2C2A' }}>{opt.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5F5E5A' }}>{opt.desc}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Rationale */}
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1" style={{ color: '#2C2C2A' }}>Rationale</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 text-sm rounded border focus:outline-none"
            style={inputStyle}
            value={rationale}
            onChange={e => setRationale(e.target.value)}
            placeholder="Briefly explain the basis for this decision..."
          />
        </div>

        <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid #D3D1C7' }}>
          <button
            onClick={() => navigate(`/risks/${id}/analyze`)}
            className="px-4 py-2 text-sm rounded border hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#D3D1C7', color: '#5F5E5A' }}
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            className="px-4 py-2 text-sm rounded text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#185FA5' }}
          >
            Continue to treat →
          </button>
        </div>
      </div>
    </div>
  );
}
