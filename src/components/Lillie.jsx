export default function Lillie({ size = 40, shield = false, opacity = 1, style = {} }) {
  const img = (
    <img
      src="/lillie.png"
      alt="Lillie"
      style={{ width: size, height: 'auto', display: 'block', opacity }}
    />
  );

  if (shield) {
    // Cream circle — keeps edges invisible against any dark background
    return (
      <div style={{
        background: '#FAF7F0',
        borderRadius: '50%',
        width: size + 8,
        height: size + 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}>
        {img}
      </div>
    );
  }

  return (
    <span style={{ display: 'inline-block', lineHeight: 0, flexShrink: 0, ...style }}>
      {img}
    </span>
  );
}
