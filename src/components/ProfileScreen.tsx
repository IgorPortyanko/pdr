import { useState } from 'react';
import { SignpostBig, Plus, Trash2, X } from 'lucide-react';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';

const EMOJI_OPTIONS = [
  '🧑', '👩', '👦', '👧', '🧔', '👨', '🧑‍💻', '👩‍💻',
  '🚗', '🏎️', '🚕', '🛻', '🚙', '🏍️', '🚐', '🚌',
  '⭐', '🔥', '💪', '🎯', '🏆', '📚', '🎓', '✅',
];

const pad = 14;
const fs = 14;

export function ProfileScreen() {
  const { profiles, setActiveProfile, addProfile, deleteProfile } = useProfileStore();
  const { clearProfileData } = useProgressStore();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = addProfile(trimmed, emoji);
    setActiveProfile(id);
    setShowForm(false);
    setName('');
    setEmoji(EMOJI_OPTIONS[0]);
  }

  function handleDelete(id: string) {
    clearProfileData(id);
    deleteProfile(id);
    setDeleteConfirmId(null);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--c-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <SignpostBig size={22} color="var(--c-accent)" />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22 }}>
          Правила дорожнього руху
        </span>
      </div>

      <h2 style={{ fontSize: 20, marginBottom: 32, color: 'var(--c-text-2)', fontWeight: 400 }}>
        Хто навчається сьогодні?
      </h2>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'center',
          maxWidth: 640,
          marginBottom: 24,
        }}
      >
        {profiles.map((profile) => (
          <div key={profile.id} style={{ position: 'relative' }}>
            {deleteConfirmId === profile.id ? (
              <div
                className="wk-box wk-box-rough flex flex-col items-center"
                style={{
                  width: 140,
                  padding: pad,
                  gap: 10,
                  background: 'var(--c-error-soft)',
                  border: '1.5px solid var(--c-accent)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--c-text)', lineHeight: 1.4 }}>
                  Видалити «{profile.name}» та весь прогрес?
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="wk-btn"
                    style={{ fontSize: 12, padding: '4px 10px', background: 'var(--c-accent)', color: '#fff', border: '1px solid var(--c-accent)' }}
                    onClick={() => handleDelete(profile.id)}
                  >
                    Так
                  </button>
                  <button
                    className="wk-btn"
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() => setDeleteConfirmId(null)}
                  >
                    Ні
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="wk-box wk-box-rough flex flex-col items-center"
                style={{
                  width: 140,
                  padding: pad + 4,
                  gap: 10,
                  background: 'var(--c-surface)',
                  border: '1.5px solid var(--c-border)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() => setActiveProfile(profile.id)}
              >
                <span style={{ fontSize: 44, lineHeight: 1 }}>{profile.emoji}</span>
                <span style={{ fontSize: fs + 1, fontWeight: 600, color: 'var(--c-text)' }}>{profile.name}</span>
              </button>
            )}

            {deleteConfirmId !== profile.id && (
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(profile.id); }}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  background: 'var(--c-error-soft)',
                  border: '1px solid var(--c-accent-border)',
                  borderRadius: 4,
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--c-accent)',
                }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}

        {!showForm && (
          <button
            className="wk-box wk-box-rough flex flex-col items-center"
            style={{
              width: 140,
              padding: pad + 4,
              gap: 10,
              background: 'var(--c-accent-soft)',
              border: '1.5px dashed var(--c-accent)',
              cursor: 'pointer',
              color: 'var(--c-accent)',
            }}
            onClick={() => setShowForm(true)}
          >
            <Plus size={36} />
            <span style={{ fontSize: fs, fontWeight: 600 }}>Новий профіль</span>
          </button>
        )}
      </div>

      {showForm && (
        <div
          className="wk-box wk-box-rough flex flex-col"
          style={{ width: '100%', maxWidth: 380, padding: pad + 8, gap: 16, background: 'var(--c-surface)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: fs + 2 }}>Новий профіль</strong>
            <button
              onClick={() => { setShowForm(false); setName(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-5)' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: 'var(--c-text-2)', fontWeight: 600 }}>Ім'я</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Введіть ім'я..."
              style={{
                padding: '8px 12px',
                fontSize: fs,
                border: '1.5px solid var(--c-border)',
                borderRadius: 6,
                background: 'var(--c-bg)',
                outline: 'none',
                color: 'var(--c-text)',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--c-text-2)', fontWeight: 600 }}>Аватар</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    width: 38,
                    height: 38,
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${emoji === e ? 'var(--c-accent)' : 'transparent'}`,
                    borderRadius: 8,
                    background: emoji === e ? 'var(--c-accent-soft)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <button
            className="wk-btn wk-btn-accent"
            disabled={!name.trim()}
            onClick={handleAdd}
            style={{ alignSelf: 'flex-start' }}
          >
            Створити
          </button>
        </div>
      )}
    </div>
  );
}
