export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-4">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span style={{ color: '#D3D1C7' }}>›</span>}
            <span style={{ color: isLast ? '#2C2C2A' : '#5F5E5A' }} className={isLast ? 'font-medium' : ''}>
              {item}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
