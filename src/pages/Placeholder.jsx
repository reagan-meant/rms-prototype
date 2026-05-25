import { useRiskStore } from '../store/RiskStore';

export default function Placeholder({ title }) {
  const { resetDemo } = useRiskStore();
  const isAdmin = title === 'Admin';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">🚧</p>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#2C2C2A' }}>{title}</h1>
        <p className="text-sm" style={{ color: '#5F5E5A' }}>This module is coming soon.</p>
        {isAdmin && (
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid #D3D1C7' }}>
            <p className="text-xs mb-3" style={{ color: '#5F5E5A' }}>Demo controls</p>
            <button
              onClick={resetDemo}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#D3D1C7', color: '#2C2C2A' }}
            >
              Reset demo data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
