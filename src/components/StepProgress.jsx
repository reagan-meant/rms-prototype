const STEPS = ['Identify', 'Analyze', 'Evaluate', 'Treat'];

export default function StepProgress({ activeStep }) {
  return (
    <div className="flex gap-2 mb-6">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < activeStep;
        const active = step === activeStep;
        return (
          <div key={step} className="flex-1">
            <div
              className="h-1.5 rounded-full mb-1.5"
              style={{
                backgroundColor: done || active ? '#185FA5' : '#D3D1C7',
              }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: active ? '#185FA5' : done ? '#185FA5' : '#5F5E5A' }}
            >
              {done ? `✓ ${step}. ${label}` : `${step}. ${label}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
