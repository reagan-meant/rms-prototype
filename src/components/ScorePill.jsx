export default function ScorePill({ score, level }) {
  const styles = {
    High:   { bg: '#FCEBEB', text: '#501313' },
    Medium: { bg: '#FAEEDA', text: '#412402' },
    Low:    { bg: '#EAF3DE', text: '#173404' },
  };
  const s = styles[level] || styles.Low;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {level}{score !== undefined ? ` · ${score}` : ''}
    </span>
  );
}
