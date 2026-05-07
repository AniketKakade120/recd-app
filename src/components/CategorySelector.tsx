'use client';

interface CategorySelectorProps {
  title: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export default function CategorySelector({ title, options, selected, onChange, className = '' }: CategorySelectorProps) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-bone">{title}</h3>
        {selected.length > 0 && (
          <button onClick={() => onChange([])} className="text-xs text-cinema-red hover:text-cinema-red/80 transition-colors">
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all btn-press ${
              selected.includes(opt)
                ? 'bg-cinema-red border-cinema-red text-bone'
                : 'bg-surface border-border text-muted hover:border-bone/20 hover:text-bone'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted mt-2">{selected.length} selected</p>
      )}
    </div>
  );
}
