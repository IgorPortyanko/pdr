import { useMemo } from 'react';
import { TrendingUp, CheckCircle2, XCircle, BookMarked, AlertTriangle } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/quiz';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';

const pad = 14;
const gap = 14;
const fs = 14;

type QuizTopic =
  | 'exam' | 'definitions' | 'priority' | 'signs' | 'markings'
  | 'maneuvering' | 'overtaking' | 'stopping' | 'railway'
  | 'pedestrians' | 'route-transport' | 'tram' | 'rules' | 'safe_driving';

const TOPIC_ORDER: QuizTopic[] = [
  'exam', 'definitions', 'priority', 'signs', 'markings',
  'maneuvering', 'overtaking', 'stopping', 'railway',
  'pedestrians', 'route-transport', 'tram', 'rules', 'safe_driving',
];

const TOPIC_LABELS: Record<QuizTopic, string> = {
  exam: 'Загальні',
  definitions: 'Терміни',
  priority: 'Перевага',
  markings: 'Розмітка',
  signs: 'Знаки',
  maneuvering: 'Маневрування',
  overtaking: 'Обгін',
  stopping: 'Зупинка',
  railway: 'Залізничні переїзди',
  pedestrians: 'Пішоходи',
  'route-transport': 'Маршрутні ТЗ',
  tram: 'Трамвай',
  rules: 'Обов\'язки та права',
  safe_driving: 'Безпечне водіння',
};

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function accuracyColor(acc: number) {
  if (acc >= 80) return 'var(--c-success)';
  if (acc >= 60) return 'var(--c-accent)';
  return 'var(--c-error)';
}

function accuracyBg(acc: number) {
  if (acc >= 80) return 'var(--c-success-soft)';
  if (acc >= 60) return 'var(--c-accent-soft)';
  return 'var(--c-error-soft)';
}

export function StatsScreen() {
  const { profiles, activeProfileId } = useProfileStore();
  const { getProfileData, getBookmarkIds } = useProgressStore();

  const profile = profiles.find((p) => p.id === activeProfileId);
  const profileData = activeProfileId ? getProfileData(activeProfileId) : null;
  const bookmarkCount = activeProfileId ? getBookmarkIds(activeProfileId).length : 0;

  const stats = useMemo(() => {
    if (!profileData) return null;

    const qs = profileData.questionStats;

    const totalCorrect = Object.values(qs).reduce((s, v) => s + v.correct, 0);
    const totalWrong = Object.values(qs).reduce((s, v) => s + v.wrong, 0);
    const totalAttempts = totalCorrect + totalWrong;
    const uniqueSeen = Object.keys(qs).length;

    const bestExam = profileData.examHistory.reduce<number | null>((best, r) => {
      const score = pct(r.score, r.total);
      return best === null || score > best ? score : best;
    }, null);

    const topicStats = TOPIC_ORDER.map((topic) => {
      const questions = QUIZ_QUESTIONS.filter((q) => q.topic === topic);
      let correct = 0;
      let wrong = 0;
      let seen = 0;
      for (const q of questions) {
        const s = qs[q.id];
        if (s) {
          correct += s.correct;
          wrong += s.wrong;
          seen++;
        }
      }
      const attempts = correct + wrong;
      const accuracy = attempts > 0 ? pct(correct, attempts) : null;
      return { topic, total: questions.length, seen, correct, wrong, attempts, accuracy };
    }).filter((t) => t.total > 0);

    const activeTopics = topicStats.filter((t) => t.attempts > 0);
    const weakTopics = [...activeTopics]
      .sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100))
      .slice(0, 3)
      .filter((t) => (t.accuracy ?? 100) < 80);

    return { totalCorrect, totalWrong, totalAttempts, uniqueSeen, bestExam, topicStats, weakTopics };
  }, [profileData]);

  if (!profileData || !stats) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center" style={{ color: 'var(--c-text-5)', gap: 12 }}>
        <TrendingUp size={40} style={{ opacity: 0.3 }} />
        <p style={{ fontSize: fs, margin: 0 }}>Ще немає даних. Пройди перше тренування!</p>
      </div>
    );
  }

  const overallAccuracy = stats.totalAttempts > 0 ? pct(stats.totalCorrect, stats.totalAttempts) : null;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto" style={{ padding: `${pad + 4}px 24px`, gap: gap + 4 }}>

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 style={{ fontSize: 26 }}>Статистика</h2>
        {profile && (
          <span style={{ fontSize: 15, color: 'var(--c-text-2)' }}>
            {profile.emoji} {profile.name}
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap }}>
        <div className="wk-box wk-box-rough flex flex-col" style={{ padding: pad + 4, gap: 6, background: 'var(--c-surface)' }}>
          <span style={{ fontSize: 11, color: 'var(--c-text-5)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Відповідей</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1 }}>{stats.totalAttempts.toLocaleString('uk-UA')}</span>
          <span style={{ fontSize: 12, color: 'var(--c-text-4)' }}>{stats.uniqueSeen} унікальних питань</span>
        </div>

        <div className="wk-box wk-box-rough flex flex-col" style={{ padding: pad + 4, gap: 6, background: overallAccuracy !== null ? accuracyBg(overallAccuracy) : 'var(--c-surface)' }}>
          <span style={{ fontSize: 11, color: 'var(--c-text-5)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Точність</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: overallAccuracy !== null ? accuracyColor(overallAccuracy) : 'var(--c-text-5)', lineHeight: 1 }}>
            {overallAccuracy !== null ? `${overallAccuracy}%` : '—'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--c-text-4)' }}>
            {stats.totalCorrect} правильних / {stats.totalWrong} помилок
          </span>
        </div>

        <div className="wk-box wk-box-rough flex flex-col" style={{ padding: pad + 4, gap: 6, background: 'var(--c-surface)' }}>
          <span style={{ fontSize: 11, color: 'var(--c-text-5)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Іспитів</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1 }}>{profileData.examHistory.length}</span>
          <span style={{ fontSize: 12, color: 'var(--c-text-4)' }}>
            {profileData.examHistory.length > 0
              ? `останній: ${new Date(profileData.examHistory[0].date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}`
              : 'ще не проходив'}
          </span>
        </div>

        <div className="wk-box wk-box-rough flex flex-col" style={{ padding: pad + 4, gap: 6, background: 'var(--c-surface)' }}>
          <span style={{ fontSize: 11, color: 'var(--c-text-5)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Рекорд іспиту</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: stats.bestExam !== null ? accuracyColor(stats.bestExam) : 'var(--c-text-5)', lineHeight: 1 }}>
            {stats.bestExam !== null ? `${stats.bestExam}%` : '—'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--c-text-4)' }}>{bookmarkCount} закладок</span>
        </div>
      </div>

      {/* Weak topics alert */}
      {stats.weakTopics.length > 0 && (
        <div className="wk-box wk-box-rough flex flex-col" style={{ padding: pad + 4, gap: 10, background: 'var(--c-error-soft)', border: '1.5px solid var(--c-accent-border)' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} color="var(--c-accent)" />
            <strong style={{ fontSize: fs, color: 'var(--c-accent)' }}>Слабкі теми — варто повторити</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.weakTopics.map((t) => (
              <span key={t.topic} className="wk-box" style={{ fontSize: 12, padding: '4px 10px', background: 'var(--c-surface)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {TOPIC_LABELS[t.topic]}
                <span style={{ fontWeight: 700, color: accuracyColor(t.accuracy ?? 0) }}>{t.accuracy}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Topic breakdown */}
      <div className="wk-box wk-box-rough flex flex-col" style={{ padding: pad + 4, gap: 12, background: 'var(--c-surface)' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 style={{ fontSize: fs + 4 }}>Прогрес по темах</h3>
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--c-text-5)' }}>
            {stats.uniqueSeen} з {QUIZ_QUESTIONS.length} питань охоплено
          </span>
        </div>

        <div className="flex flex-col" style={{ gap: 10 }}>
          {stats.topicStats.map((t) => {
            const seenPct = pct(t.seen, t.total);
            const acc = t.accuracy;

            return (
              <div key={t.topic} className="flex flex-col" style={{ gap: 4 }}>
                <div className="flex items-center justify-between" style={{ gap: 8 }}>
                  <span style={{ fontSize: fs - 1, color: 'var(--c-text)', fontWeight: 500, minWidth: 160 }}>
                    {TOPIC_LABELS[t.topic]}
                  </span>
                  <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                    {acc !== null ? (
                      <span style={{ fontSize: 13, fontWeight: 700, color: accuracyColor(acc), minWidth: 38, textAlign: 'right' }}>
                        {acc}%
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--c-text-6)', minWidth: 38, textAlign: 'right' }}>—</span>
                    )}
                    <span className="font-mono" style={{ fontSize: 11, color: 'var(--c-text-5)', minWidth: 70, textAlign: 'right' }}>
                      {t.seen}/{t.total} питань
                    </span>
                  </div>
                </div>

                {/* Coverage bar (how many questions seen) */}
                <div style={{ height: 6, background: 'var(--c-border-light)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', display: 'flex', borderRadius: 3 }}>
                    {acc !== null && (
                      <div style={{ width: `${seenPct * (acc / 100)}%`, background: accuracyColor(acc), borderRadius: '3px 0 0 3px', transition: 'width 0.4s ease' }} />
                    )}
                    {t.seen > 0 && acc !== null && (
                      <div style={{ width: `${seenPct * ((100 - acc) / 100)}%`, background: 'var(--c-border-accent)' }} />
                    )}
                    {t.seen === 0 && (
                      <div style={{ width: 0 }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exam history */}
      {profileData.examHistory.length > 0 && (
        <div className="wk-box wk-box-rough flex flex-col" style={{ padding: pad + 4, gap: 12, background: 'var(--c-surface)' }}>
          <h3 style={{ fontSize: fs + 4 }}>Історія іспитів</h3>

          <div className="flex flex-col" style={{ gap: 6 }}>
            {profileData.examHistory.slice(0, 15).map((result, i) => {
              const score = pct(result.score, result.total);
              const passed = score >= 75;
              return (
                <div key={result.id} className="flex items-center gap-3" style={{ padding: '8px 0', borderBottom: i < Math.min(profileData.examHistory.length, 15) - 1 ? '1px solid var(--c-border-light)' : 'none' }}>
                  <span style={{ fontSize: 12, color: 'var(--c-text-4)', minWidth: 90 }}>
                    {new Date(result.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* Score bar */}
                  <div style={{ flex: 1, height: 8, background: 'var(--c-border-light)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${score}%`, background: passed ? 'var(--c-success)' : 'var(--c-accent)', borderRadius: 4, transition: 'width 0.4s ease' }} />
                  </div>

                  <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                    {passed
                      ? <CheckCircle2 size={14} color="var(--c-success)" />
                      : <XCircle size={14} color="var(--c-accent)" />
                    }
                    <span style={{ fontSize: 13, fontWeight: 700, color: passed ? 'var(--c-success)' : 'var(--c-accent)', minWidth: 44, textAlign: 'right' }}>
                      {result.score}/{result.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {profileData.examHistory.length > 15 && (
            <span style={{ fontSize: 12, color: 'var(--c-text-5)' }}>
              Показано 15 з {profileData.examHistory.length} іспитів
            </span>
          )}
        </div>
      )}

      {/* No data yet per topic */}
      {stats.topicStats.every((t) => t.attempts === 0) && (
        <div className="flex flex-col items-center" style={{ padding: 32, gap: 12, color: 'var(--c-text-5)' }}>
          <BookMarked size={32} style={{ opacity: 0.3 }} />
          <p style={{ fontSize: fs, margin: 0 }}>Пройди кілька тренувань — тут з'явиться статистика по кожній темі.</p>
        </div>
      )}
    </div>
  );
}
