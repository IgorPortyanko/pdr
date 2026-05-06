import { ChevronRight } from 'lucide-react';
import { CHAPTERS } from '../data/rules';
import { useRulesStore } from '../store/rulesStore';

const pad = 14;
const gap = 10;
const fs = 14;

export function ChapterList() {
  const { setActiveCategory } = useRulesStore();

  return (
    <div
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      style={{ padding: `${pad + 4}px 24px`, gap: gap + 4 }}
    >
      <div className="flex items-center gap-3 shrink-0">
        <h2 style={{ fontSize: 26 }}>Всі правила</h2>
      </div>

      <span style={{ fontSize: 13, color: 'var(--c-accent-2)', fontWeight: 600 }}>
        Оберіть розділ для перегляду правил
      </span>

      <div
        className="chapter-grid overflow-y-auto flex-1"
        style={{ gap, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', alignContent: 'start' }}
      >
        {CHAPTERS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveCategory(ch.id)}
            className="wk-box text-left flex items-start gap-3 transition-colors group"
            style={{
              padding: `${pad}px ${pad + 2}px`,
              borderRadius: '4px 3px 5px 3px',
              cursor: 'pointer',
              background: 'var(--c-bg)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--c-surface-2)';
              e.currentTarget.style.borderColor = 'var(--c-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--c-bg)';
              e.currentTarget.style.borderColor = 'var(--c-border)';
            }}
          >
            <div
              className="shrink-0 flex items-center justify-center rounded font-mono font-bold"
              style={{
                width: 32,
                height: 32,
                background: 'var(--c-accent-soft)',
                border: '1.5px solid var(--c-accent)',
                color: 'var(--c-accent)',
                fontSize: 13,
                borderRadius: 3,
              }}
            >
              {ch.number}
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: fs + 1,
                  color: 'var(--c-text)',
                  lineHeight: 1.2,
                }}
              >
                {ch.title}
              </span>
            </div>

            <ChevronRight size={14} color="var(--c-text-5)" className="shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </div>
  );
}
