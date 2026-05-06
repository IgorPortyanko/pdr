import { BookOpen, ClipboardCheck, TriangleAlert, Minus, Car, Gauge, BarChart2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CATEGORIES } from '../data/rules';
import { useRulesStore } from '../store/rulesStore';

const iconMap: Record<string, LucideIcon> = {
  BookOpen, ClipboardCheck, TriangleAlert, Minus, Car, Gauge,
};

const pad = 14;
const fs = 14;
const gap = 6;

export function Sidebar() {
  const { activeCategoryId, setActiveCategory } = useRulesStore();

  return (
    <div
      className="desktop-sidebar flex flex-col overflow-hidden bg-paper"
      style={{
        width: 250,
        minWidth: 200,
        borderRight: '1.5px solid var(--c-border)',
        padding: pad,
        gap,
      }}
    >
      <div className="flex flex-col overflow-y-auto flex-1" style={{ gap }}>
        {/* Stats link at top */}
        {(() => {
          const isActive = activeCategoryId === 'stats';
          return (
            <button
              onClick={() => setActiveCategory('stats')}
              className={`w-full flex items-center gap-2 rounded text-left transition-colors${isActive ? ' bg-[var(--c-accent-soft)]' : ' hover:bg-[var(--c-hover)]'}`}
              style={{ padding: `${Math.max(4, pad - 7)}px 8px`, borderRadius: 6, fontSize: fs, fontWeight: 700, color: isActive ? 'var(--c-accent)' : 'var(--c-text)', border: 'none', cursor: 'pointer', letterSpacing: '-0.015em', lineHeight: 1.25, boxShadow: isActive ? 'inset 3px 0 0 var(--c-accent)' : 'none' }}
            >
              <BarChart2 size={13} color={isActive ? 'var(--c-accent)' : 'var(--c-text-2)'} />
              <span className="flex-1">Статистика</span>
            </button>
          );
        })()}

        <div style={{ height: 1, background: 'var(--c-border-light)', margin: '2px 0' }} />

        {CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.icon] ?? BookOpen;
          const isGroup = Boolean(cat.children?.length);
          const isActive = !isGroup && activeCategoryId === cat.id;

          return (
            <div key={cat.id}>
              <button
                onClick={() => {
                  if (!isGroup) {
                    setActiveCategory(cat.id);
                  }
                }}
                className={`w-full flex items-center gap-2 rounded text-left transition-colors${
                  isActive ? ' bg-[var(--c-accent-soft)]' : ''
                }${!isGroup ? ' hover:bg-[var(--c-hover)]' : ''}`}
                style={{
                  padding: `${Math.max(4, pad - 7)}px 8px`,
                  borderRadius: 6,
                  fontSize: fs,
                  fontWeight: 700,
                  color: isActive ? 'var(--c-accent)' : 'var(--c-text)',
                  border: 'none',
                  cursor: isGroup ? 'default' : 'pointer',
                  letterSpacing: isGroup ? '-0.01em' : '-0.015em',
                  lineHeight: 1.25,
                  boxShadow: isActive ? 'inset 3px 0 0 var(--c-accent)' : 'none',
                }}
              >
                <Icon size={13} color={isActive ? 'var(--c-accent)' : 'var(--c-text-2)'} />
                <span className="flex-1">{cat.label}</span>
                <span className="font-mono" style={{ fontSize: fs - 3, color: 'var(--c-text-5)' }}>
                  {cat.count}
                </span>
              </button>

              {cat.children?.map((child) => {
                const isChildActive = activeCategoryId === child.id;

                return (
                  <button
                    key={child.id}
                    onClick={() => setActiveCategory(child.id)}
                    className={`w-full flex items-center gap-2 text-left transition-colors${
                      isChildActive ? ' bg-[var(--c-accent-soft)]' : ''
                    } hover:bg-[var(--c-hover)]`}
                    style={{
                      padding: `${Math.max(4, pad - 8)}px 8px ${Math.max(2, pad - 10)}px 24px`,
                      fontSize: fs - 1,
                      borderRadius: 6,
                      fontWeight: isChildActive ? 700 : 500,
                      color: isChildActive ? 'var(--c-accent)' : 'var(--c-text-2)',
                      border: 'none',
                      lineHeight: 1.3,
                      boxShadow: isChildActive ? 'inset 3px 0 0 var(--c-accent)' : 'none',
                    }}
                  >
                    <span className="flex-1">{child.label}</span>
                    <span className="font-mono" style={{ fontSize: fs - 4, color: 'var(--c-text-5)' }}>
                      {child.count}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
