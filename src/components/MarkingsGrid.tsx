import { useState } from 'react';
import { X, Search } from 'lucide-react';
import type { Marking } from '../types';
import { MARKINGS } from '../data/markings';
import { CATEGORIES } from '../data/rules';
import { useRulesStore } from '../store/rulesStore';

const pad = 14;
const gap = 14;
const fs = 14;

function getCategoryLabel(id: string) {
  return CATEGORIES.find((category) => category.id === id)?.label ?? 'Дорожня розмітка';
}

function getKindLabel(kind: Marking['kind']) {
  return kind === 'horizontal' ? 'Горизонтальна' : 'Вертикальна';
}

export function MarkingsGrid() {
  const { activeCategoryId } = useRulesStore();
  const [selectedMarking, setSelectedMarking] = useState<Marking | null>(null);
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? MARKINGS.filter((marking) => {
        const q = query.toLowerCase();
        return (
          marking.number.toLowerCase().includes(q) ||
          marking.title.toLowerCase().includes(q) ||
          marking.desc.toLowerCase().includes(q)
        );
      })
    : MARKINGS;

  const showEmpty = filtered.length === 0;

  return (
    <>
      <div
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
        style={{ padding: `${pad + 4}px 24px`, gap }}
      >
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <h2 style={{ fontSize: 26 }}>{getCategoryLabel(activeCategoryId)}</h2>
          <span className="font-mono" style={{ fontSize: 12, color: 'var(--c-text-5)' }}>
            {query.trim() ? `${filtered.length} з ${MARKINGS.length}` : `${MARKINGS.length} елементів`}
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-2" style={{ position: 'relative', maxWidth: 340 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, color: 'var(--c-text-5)', pointerEvents: 'none' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук за номером або назвою..."
            style={{
              width: '100%',
              padding: '7px 32px 7px 32px',
              fontSize: fs - 1,
              border: '1.5px solid var(--c-border)',
              borderRadius: 6,
              background: 'var(--c-surface)',
              outline: 'none',
              color: 'var(--c-text)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--c-border)'; }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-5)', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div
          className="overflow-y-auto flex-1"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap,
            alignContent: 'start',
            paddingRight: 4,
          }}
        >
          {showEmpty && (
            <div
              className="wk-box flex flex-col items-center justify-center"
              style={{ minHeight: 180, gridColumn: '1 / -1', color: 'var(--c-text-5)', gap: 10 }}
            >
              <Search size={28} style={{ opacity: 0.4 }} />
              <span style={{ fontSize: fs }}>
                {query.trim() ? `Нічого не знайдено за «${query}»` : 'Розмітку не знайдено'}
              </span>
              {query.trim() && (
                <button className="wk-btn" style={{ fontSize: 12 }} onClick={() => setQuery('')}>
                  Очистити пошук
                </button>
              )}
            </div>
          )}

          {filtered.map((marking) => (
            <button
              key={marking.number}
              onClick={() => setSelectedMarking(marking)}
              className="wk-box flex flex-col items-center text-center"
              style={{
                padding: pad,
                gap: 8,
                background: 'var(--c-bg)',
                borderRadius: '5px 4px 6px 4px',
                cursor: 'pointer',
                border: '1.5px solid var(--c-border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--c-surface-2)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--c-bg)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)';
              }}
            >
              <div
                className="flex items-center justify-center rounded w-full"
                style={{ height: 90, background: 'var(--c-surface-2)', border: '1px solid var(--c-subtle)' }}
              >
                <img
                  src={marking.src}
                  alt={`${marking.number} ${marking.title}`}
                  style={{ maxHeight: 72, maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--c-accent)', letterSpacing: '0.04em' }}>
                {marking.number}
              </span>
              <span style={{ fontSize: 10, color: 'var(--c-text-4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                {getKindLabel(marking.kind)}
              </span>
              <span style={{ fontSize: fs - 1, lineHeight: 1.25, color: 'var(--c-text)' }}>
                {marking.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedMarking && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: 'var(--c-overlay)', zIndex: 50 }}
          onClick={() => setSelectedMarking(null)}
        >
          <div
            className="wk-box flex flex-col"
            style={{ width: 380, maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 32px)', background: 'var(--c-bg)', borderRadius: '6px 4px 8px 4px', padding: 24, gap: 16, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col" style={{ gap: 6 }}>
                <span className="font-mono" style={{ fontSize: 13, color: 'var(--c-accent)', letterSpacing: '0.04em', fontWeight: 700 }}>
                  {selectedMarking.number}
                </span>
                <span style={{ fontSize: 11, color: 'var(--c-text-4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                  {getKindLabel(selectedMarking.kind)}
                </span>
              </div>
              <button onClick={() => setSelectedMarking(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, color: 'var(--c-text-5)' }}>
                <X size={16} />
              </button>
            </div>

            <div
              className="flex items-center justify-center rounded w-full"
              style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-subtle)', padding: 20 }}
            >
              <img
                src={selectedMarking.src}
                alt={`${selectedMarking.number} ${selectedMarking.title}`}
                style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>

            <div className="flex flex-col overflow-y-auto" style={{ gap: 8, minHeight: 0, paddingRight: 4 }}>
              <h3 style={{ fontSize: 16, lineHeight: 1.25, fontWeight: 700 }}>{selectedMarking.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--c-text-2)', lineHeight: 1.55, whiteSpace: 'pre-wrap', margin: 0 }}>
                {selectedMarking.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
