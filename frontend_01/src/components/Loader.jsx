export default function Loader({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`${sizes[size]} border-2 rounded-full animate-spin`}
        style={{
          borderColor: 'rgb(var(--surface-border))',
          borderTopColor: 'rgb(var(--brand-500))',
        }}
      />
      {text && <p className="text-secondary text-sm">{text}</p>}
    </div>
  );
}
