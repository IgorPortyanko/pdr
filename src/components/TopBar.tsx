import { SignpostBig, Users, Sun, Moon } from 'lucide-react';
import { useProfileStore } from '../store/profileStore';
import { useThemeStore } from '../store/themeStore';

export function TopBar() {
  const { profiles, activeProfileId, clearActiveProfile } = useProfileStore();
  const { isDark, toggle } = useThemeStore();
  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null;

  return (
    <div
      className="flex items-center flex-wrap gap-2 shrink-0 bg-paper"
      style={{ padding: '11px 16px', borderBottom: `1.5px solid var(--c-border)`, minHeight: 0 }}
    >
      <SignpostBig size={18} color="var(--c-accent)" />
      <span className="shrink-0" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20 }}>
        Правила дорожнього руху
      </span>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={toggle}
          title={isDark ? 'Світла тема' : 'Темна тема'}
          className="wk-btn"
          style={{ padding: '4px 8px', fontSize: 12 }}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {activeProfile && (
          <>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{activeProfile.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{activeProfile.name}</span>
            <button
              onClick={clearActiveProfile}
              className="wk-btn"
              style={{ fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
              title="Змінити профіль"
            >
              <Users size={13} />
              Змінити
            </button>
          </>
        )}
      </div>
    </div>
  );
}
