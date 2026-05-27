import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRiskStore } from '../store/RiskStore';
import Breadcrumb from '../components/Breadcrumb';
import StepProgress from '../components/StepProgress';
import ScorePill from '../components/ScorePill';

const LIKELIHOOD_OPTIONS = [
  { value: 1, label: 'Rare',     desc: 'May occur only in exceptional circumstances' },
  { value: 2, label: 'Unlikely', desc: 'Could occur at some time but not expected' },
  { value: 3, label: 'Possible', desc: 'Might occur at some time in the future' },
  { value: 4, label: 'Likely',   desc: 'Has happened in past 12 months' },
  { value: 5, label: 'Certain',  desc: 'Is expected to occur in most circumstances' },
];

const IMPACT_ROWS = [
  { key: 'financial',   label: 'Financial impact' },
  { key: 'service',     label: 'Service delivery' },
  { key: 'reputational',label: 'Reputational' },
  { key: 'compliance',  label: 'Compliance' },
  { key: 'development', label: 'Development impact' },
];

const EFFECTIVENESS_OPTIONS = ['Weak', 'Moderate', 'Strong'];
const EFFECTIVENESS_MULTIPLIER = { Weak: 1.0, Moderate: 0.6, Strong: 0.3 };

function riskLevel(score) {
  if (score >= 15) return 'High';
  if (score >= 8)  return 'Medium';
  return 'Low';
}

function hmCellColor(l, i) {
  const score = l * i;
  if (score <= 4)  return '#C0DD97';
  if (score <= 6)  return '#EAF3DE';
  if (score <= 9)  return '#FAEEDA';
  if (score <= 12) return '#FCEBEB';
  if (score <= 16) return '#F09595';
  if (score <= 20) return '#E24B4A';
  return '#A32D2D';
}

function MiniHeatMap({ likelihood, impact }) {
  return (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
      {[5, 4, 3, 2, 1].map(l =>
        [1, 2, 3, 4, 5].map(i => {
          const isActive = l === likelihood && i === impact;
          return (
            <div
              key={`${l}-${i}`}
              className="rounded-sm"
              style={{
                backgroundColor: hmCellColor(l, i),
                height: '20px',
                outline: isActive ? '2px solid #2C2C2A' : 'none',
                outlineOffset: '-1px',
              }}
            />
          );
        })
      )}
    </div>
  );
}

export default function Analyze() {
  const { id } = useParams();
  const { state, updateRisk } = useRiskStore();
  const navigate = useNavigate();

  const risk = state.risks.find(r => r.id === id);

  const [likelihood, setLikelihood] = useState(risk?.likelihood || 3);
  const [impacts, setImpacts] = useState(risk?.impactScores || { financial: 3, service: 3, reputational: 3, compliance: 3, development: 3 });
  const [controls, setControls] = useState(risk?.existingControls || '');
  const [effectiveness, setEffectiveness] = useState(risk?.controlEffectiveness || 'Moderate');

  const overallImpact = Math.max(...Object.values(impacts));
  const inherentScore = likelihood * overallImpact;
  const inherentLevel = riskLevel(inherentScore);
  const residualScore = Math.round(inherentScore * EFFECTIVENESS_MULTIPLIER[effectiveness]);
  const residualLevel = riskLevel(residualScore);

  if (!risk) {
    return (
      <div className="p-6 text-center" style={{ color: '#5F5E5A' }}>
        Risk not found. <button onClick={() => navigate('/register')} style={{ color: '#185FA5' }}>Go back</button>
      </div>
    );
  }

  const selectedLikelihoodOption = LIKELIHOOD_OPTIONS.find(o => o.value === likelihood);

  const handleContinue = () => {
    updateRisk(id, {
      likelihood,
      impactScores: impacts,
      overallImpact,
      inherentScore,
      inherentLevel,
      existingControls: controls,
      controlEffectiveness: effectiveness,
      residualScore,
      residualLevel,
    });
    navigate(`/risks/${id}/evaluate`);
  };

  const inputStyle = { borderColor: '#D3D1C7', backgroundColor: 'white' };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumb items={[`${id}`, 'Step 2: Analyze']} />
      <StepProgress activeStep={2} riskId={id} risk={risk} />

      <div className="flex gap-5">
        {/* Main */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Likelihood */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#2C2C2A' }}>Likelihood</h3>
            <div className="flex gap-2">
              {LIKELIHOOD_OPTIONS.map(opt => {
                const active = likelihood === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setLikelihood(opt.value)}
                    className="flex-1 py-2 text-center rounded text-xs font-medium transition-all border-2"
                    style={{
                      borderColor: active ? '#185FA5' : '#D3D1C7',
                      backgroundColor: active ? '#EBF3FC' : 'white',
                      color: active ? '#185FA5' : '#2C2C2A',
                    }}
                  >
                    <div className="font-bold text-sm">{opt.value}</div>
                    <div>{opt.label}</div>
                  </button>
                );
              })}
            </div>
            {selectedLikelihoodOption && (
              <p className="mt-2 text-xs" style={{ color: '#5F5E5A' }}>
                Selected: <strong>{selectedLikelihoodOption.label} ({selectedLikelihoodOption.value})</strong> — {selectedLikelihoodOption.desc}
              </p>
            )}
          </div>

          {/* Impact assessment */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#2C2C2A' }}>Impact assessment</h3>
            <div className="flex flex-col gap-3">
              {IMPACT_ROWS.map(row => (
                <div key={row.key} className="flex items-center justify-between">
                  <label className="text-sm" style={{ color: '#2C2C2A' }}>{row.label}</label>
                  <select
                    value={impacts[row.key]}
                    onChange={e => setImpacts(imp => ({ ...imp, [row.key]: Number(e.target.value) }))}
                    className="text-sm rounded border px-2 py-1 focus:outline-none"
                    style={inputStyle}
                  >
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded text-sm font-medium" style={{ backgroundColor: '#F5F5F0', color: '#2C2C2A' }}>
              Overall impact (highest): <strong>{overallImpact}</strong>
            </div>
          </div>

          {/* Controls */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#2C2C2A' }}>Existing controls</h3>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-sm rounded border focus:outline-none"
              style={inputStyle}
              value={controls}
              onChange={e => setControls(e.target.value)}
              placeholder="Describe controls currently in place..."
            />
            <h3 className="text-sm font-semibold mt-4 mb-2" style={{ color: '#2C2C2A' }}>Control effectiveness</h3>
            <div className="flex gap-2">
              {EFFECTIVENESS_OPTIONS.map(opt => {
                const active = effectiveness === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setEffectiveness(opt)}
                    className="px-4 py-2 rounded text-sm font-medium transition-all border-2"
                    style={{
                      borderColor: active ? '#185FA5' : '#D3D1C7',
                      backgroundColor: active ? '#EBF3FC' : 'white',
                      color: active ? '#185FA5' : '#2C2C2A',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4" style={{ width: '260px' }}>
          <div className="card">
            <p className="text-xs font-medium mb-1" style={{ color: '#5F5E5A' }}>Inherent risk score</p>
            <p className="text-3xl font-bold mb-1" style={{ color: '#2C2C2A' }}>{inherentScore}</p>
            <p className="text-xs mb-2" style={{ color: '#5F5E5A' }}>Likelihood {likelihood} × Impact {overallImpact}</p>
            <ScorePill level={inherentLevel} />
          </div>

          <div className="card">
            <p className="text-xs font-medium mb-1" style={{ color: '#5F5E5A' }}>Residual risk score</p>
            <p className="text-3xl font-bold mb-1" style={{ color: '#2C2C2A' }}>{residualScore}</p>
            <p className="text-xs mb-2" style={{ color: '#5F5E5A' }}>After {effectiveness.toLowerCase()} controls</p>
            <ScorePill level={residualLevel} />
          </div>

          <div className="card">
            <p className="text-xs font-medium mb-2" style={{ color: '#5F5E5A' }}>Position on heat map</p>
            <MiniHeatMap likelihood={likelihood} impact={overallImpact} />
            <p className="text-xs mt-2 text-center" style={{ color: '#5F5E5A' }}>
              Likelihood {likelihood} × Impact {overallImpact}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => navigate(`/risks/${id}/identify`)}
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
          Continue to evaluate →
        </button>
      </div>
    </div>
  );
}
