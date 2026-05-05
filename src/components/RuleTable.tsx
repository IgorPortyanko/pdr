import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { CATEGORIES, CHAPTERS } from '../data/rules';
import { useRulesStore } from '../store/rulesStore';

const pad = 14;
const gap = 14;
const fs = 14;

function getCategoryLabel(id: string) {
  if (id.startsWith('ch-')) {
    return CHAPTERS.find((c) => c.id === id)?.title ?? 'Розділ';
  }

  for (const cat of CATEGORIES) {
    if (cat.id === id) return cat.label;

    for (const child of cat.children ?? []) {
      if (child.id === id) return child.label;
    }
  }

  return 'Всі правила';
}

function getChapterNumberFromId(id: string) {
  if (!id.startsWith('ch-')) {
    return null;
  }

  const chapterNumber = Number(id.replace('ch-', ''));
  return Number.isNaN(chapterNumber) ? null : chapterNumber;
}

function splitGlossaryEntries(text: string) {
  return text
    .split(/;\s+(?=[^;:.]+?\s-\s)/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function renderDefinitionContent(content: string, fs: number) {
  const bulletParts = content
    .split('•')
    .map((part) => part.trim())
    .filter(Boolean);

  if (bulletParts.length === 1) {
    return <>{content}</>;
  }

  const [lead, ...bullets] = bulletParts;

  return (
    <>
      {lead && <span>{lead}</span>}
      <ul
        style={{
          margin: '10px 0 0',
          paddingLeft: 18,
          display: 'grid',
          gap: 6,
          fontSize: fs,
          lineHeight: 1.6,
        }}
      >
        {bullets.map((bullet, index) => (
          <li key={index}>{bullet.replace(/;$/, '')}</li>
        ))}
      </ul>
    </>
  );
}

function renderRuleDescription(description: string, fs: number) {
  const normalized = description.trim();
  const glossaryPrefix = 'Терміни, що наведені у цих Правилах, мають таке значення:';
  const isGlossary =
    normalized.startsWith(glossaryPrefix) || splitGlossaryEntries(normalized).length > 4;

  if (!isGlossary) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: fs,
          lineHeight: 1.6,
          color: 'var(--c-text-3)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {normalized}
      </p>
    );
  }

  const content = normalized.startsWith(glossaryPrefix)
    ? normalized.slice(glossaryPrefix.length).trim()
    : normalized;

  const entries = splitGlossaryEntries(content);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {normalized.startsWith(glossaryPrefix) && (
        <p
          style={{
            margin: 0,
            fontSize: fs,
            lineHeight: 1.65,
            color: 'var(--c-text-3)',
          }}
        >
          {glossaryPrefix}
        </p>
      )}

      {entries.map((entry, index) => {
        const match = entry.match(/^(.+?)\s-\s([\s\S]+)$/);

        if (!match) {
          return (
            <p
              key={index}
              style={{
                margin: 0,
                fontSize: fs,
                lineHeight: 1.65,
                color: 'var(--c-text-3)',
              }}
            >
              {entry}
            </p>
          );
        }

        const [, term, definition] = match;

        return (
          <p
            key={index}
            style={{
              margin: 0,
              fontSize: fs,
              lineHeight: 1.65,
              color: 'var(--c-text-3)',
            }}
          >
            <strong>{term}</strong>
            {' - '}
            {renderDefinitionContent(definition.trim(), fs) as ReactNode}
          </p>
        );
      })}
    </div>
  );
}

export function RuleTable() {
  const { rules: allRules, activeCategoryId, setActiveCategory } = useRulesStore();

  const rules = allRules.filter((rule) => {
    const isChapter = activeCategoryId.startsWith('ch-');
    const activeChapterNumber = getChapterNumberFromId(activeCategoryId);
    const ruleChapterNumber = Number(rule.code.split('.')[0]);
    const matchesCategory =
      (isChapter && activeChapterNumber === ruleChapterNumber) ||
      rule.catId === activeCategoryId ||
      CATEGORIES.find((c) => c.id === activeCategoryId)?.children?.some((child) => child.id === rule.catId);

    return matchesCategory;
  });

  const title = getCategoryLabel(activeCategoryId);

  return (
    <div
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      style={{ padding: `${pad + 4}px 24px`, gap }}
    >
      {activeCategoryId.startsWith('ch-') && (
        <button
          onClick={() => setActiveCategory('all')}
          className="flex items-center gap-1 shrink-0"
          style={{
            fontSize: 13,
            color: 'var(--c-text-2)',
            border: 'none',
            background: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <ChevronLeft size={13} /> Всі правила
        </button>
      )}

      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <h2 style={{ fontSize: 26 }}>{title}</h2>
        <span className="font-mono" style={{ fontSize: 12, color: 'var(--c-text-5)' }}>
          {rules.length} пунктів
        </span>
      </div>

      <span style={{ fontSize: 13, color: 'var(--c-accent-2)', fontWeight: 600 }}>
        Перегляньте положення правил у вибраному розділі
      </span>

      <div className="overflow-y-auto flex-1 flex flex-col" style={{ gap }}>
        {rules.length === 0 && (
          <div
            className="wk-box flex items-center justify-center"
            style={{ minHeight: 120, color: 'var(--c-text-5)', fontSize: fs }}
          >
            Правила за пошуком не знайдено
          </div>
        )}

        {rules.map((rule) => (
          <article
            key={rule.id}
            className="wk-box wk-box-rough"
            style={{
              padding: `${pad}px ${pad + 2}px`,
              background: 'var(--c-bg)',
            }}
          >
            <div className="flex items-start gap-3" style={{ marginBottom: 10 }}>
              <div
                className="font-mono shrink-0"
                style={{
                  minWidth: 56,
                  padding: '4px 8px',
                  borderRadius: 999,
                  background: 'var(--c-accent-soft)',
                  color: 'var(--c-accent)',
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                {rule.code}
              </div>

              <div className="min-w-0">
                <h3 style={{ fontSize: fs + 3, lineHeight: 1.25, marginBottom: 6 }}>
                  {rule.title}
                </h3>
                {rule.description && renderRuleDescription(rule.description, fs)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
