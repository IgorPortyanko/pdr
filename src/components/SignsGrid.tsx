import { useState } from 'react';
import { ChevronLeft, X, Search } from 'lucide-react';
import type { Signs } from '../types';
import { CATEGORIES } from '../data/rules';
import { SIGNS } from '../data/signs';
import { useRulesStore } from '../store/rulesStore';

const pad = 14;
const gap = 14;
const fs = 14;

function getCategoryLabel(id: string) {
  for (const category of CATEGORIES) {
    if (category.id === id) return category.label;
    for (const child of category.children ?? []) {
      if (child.id === id) return child.label;
    }
  }
  return 'Дорожні знаки';
}

export function SignsGrid() {
  const { activeCategoryId, setActiveCategory } = useRulesStore();
  const [selectedSign, setSelectedSign] = useState<Signs | null>(null);
  const [query, setQuery] = useState('');

  const isParentCategory = activeCategoryId === 'signs';

  const baseSigns = SIGNS.filter((sign) => isParentCategory || sign.categoryId === activeCategoryId);

  const filtered = query.trim()
    ? baseSigns.filter((sign) => {
        const q = query.toLowerCase();
        return (
          sign.number.toLowerCase().includes(q) ||
          sign.title.toLowerCase().includes(q) ||
          sign.desc.toLowerCase().includes(q)
        );
      })
    : baseSigns;

  const showEmpty = filtered.length === 0;

  return (
    <>
      <div
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
        style={{ padding: `${pad + 4}px 24px`, gap }}
      >
        {!isParentCategory && (
          <button
            onClick={() => setActiveCategory('signs')}
            className="flex items-center gap-1 shrink-0"
            style={{ fontSize: 13, color: 'var(--c-text-2)', border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}
          >
            <ChevronLeft size={13} /> Дорожні знаки
          </button>
        )}

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <h2 style={{ fontSize: 26 }}>{getCategoryLabel(activeCategoryId)}</h2>
          <span className="font-mono" style={{ fontSize: 12, color: 'var(--c-text-5)' }}>
            {query.trim() ? `${filtered.length} з ${baseSigns.length}` : `${baseSigns.length} знаків`}
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
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
                {query.trim() ? `Нічого не знайдено за «${query}»` : 'Знаків у цій категорії не знайдено'}
              </span>
              {query.trim() && (
                <button className="wk-btn" style={{ fontSize: 12 }} onClick={() => setQuery('')}>
                  Очистити пошук
                </button>
              )}
            </div>
          )}

          {filtered.map((sign) => (
            <button
              key={`${sign.categoryId}-${sign.number}`}
              onClick={() => setSelectedSign(sign)}
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
                  src={sign.src}
                  alt={`${sign.number} ${sign.title}`}
                  style={{ maxHeight: 72, maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--c-accent)', letterSpacing: '0.04em' }}>
                {sign.number}
              </span>
              <span style={{ fontSize: fs - 1, lineHeight: 1.25, color: 'var(--c-text)' }}>
                {sign.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedSign && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: 'var(--c-overlay)', zIndex: 50 }}
          onClick={() => setSelectedSign(null)}
        >
          <div
            className="wk-box flex flex-col"
            style={{ width: 360, maxWidth: 'calc(100vw - 32px)', background: 'var(--c-bg)', borderRadius: '6px 4px 8px 4px', padding: 24, gap: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono" style={{ fontSize: 13, color: 'var(--c-accent)', letterSpacing: '0.04em', fontWeight: 700 }}>
                {selectedSign.number}
              </span>
              <button onClick={() => setSelectedSign(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2, color: 'var(--c-text-5)' }}>
                <X size={16} />
              </button>
            </div>

            <div
              className="flex items-center justify-center rounded w-full"
              style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-subtle)', padding: 20 }}
            >
              <img
                src={selectedSign.src}
                alt={`${selectedSign.number} ${selectedSign.title}`}
                style={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>

            <div className="flex flex-col" style={{ gap: 8 }}>
              <h3 style={{ fontSize: 16, lineHeight: 1.25, fontWeight: 700 }}>{selectedSign.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--c-text-2)', lineHeight: 1.55 }}>{selectedSign.desc}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
