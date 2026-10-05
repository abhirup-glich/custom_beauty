// Photo when salon.json provides one, otherwise the person's initials.
export default function Avatar({ src, name, className = '', loading = 'lazy' }) {
  if (src) return <img src={src} alt={name} className={className} loading={loading} />;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  return (
    <div className={`initials-avatar ${className}`} role="img" aria-label={name}>
      {initials}
    </div>
  );
}
