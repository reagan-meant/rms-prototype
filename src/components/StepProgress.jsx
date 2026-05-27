import { useNavigate } from 'react-router-dom';

const STEPS = ['Identify', 'Analyze', 'Evaluate', 'Treat'];
const ROUTES = ['identify', 'analyze', 'evaluate', 'treat'];

function stepHasData(step, risk) {
  if (!risk) return false;
  switch (step) {
    case 1: return true; // risk exists means identify was done
    case 2: return !!risk.controlEffectiveness;
    case 3: return !!risk.controlEffectiveness; // analyze done → evaluate is reachable
    case 4: return !!risk.evaluationDecision || (risk.actions && risk.actions.length > 0) || !!risk.treatmentSubmitted;
    default: return false;
  }
}

export default function StepProgress({ activeStep, riskId, risk }) {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 mb-6">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < activeStep;
        const active = step === activeStep;
        const clickable = riskId && (done || active || stepHasData(step, risk));

        return (
          <div
            key={step}
            className="flex-1"
            onClick={() => clickable && !active && navigate(`/risks/${riskId}/${ROUTES[i]}`)}
            style={{ cursor: clickable && !active ? 'pointer' : 'default' }}
          >
            <div
              className="h-1.5 rounded-full mb-1.5 transition-opacity"
              style={{
                backgroundColor: !clickable && !done && !active ? '#D3D1C7' : '#185FA5',
                opacity: done ? 0.45 : 1,
              }}
            />
            <span
              className="text-xs font-medium"
              style={{
                color: active ? '#185FA5' : done ? '#5F5E5A' : clickable ? '#5F5E5A' : '#9C9B98',
                textDecoration: clickable && !active ? 'underline' : 'none',
                textDecorationColor: '#C5C3BB',
              }}
            >
              {done ? `✓ ${step}. ${label}` : `${step}. ${label}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
