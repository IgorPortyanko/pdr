import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, CircleHelp, RotateCcw, XCircle, AlertCircle, Timer, Bookmark } from 'lucide-react';
import type { QuizMode, QuizQuestion, QuizTopic } from '../types';
import { QUIZ_QUESTIONS } from '../data/quiz';
import { MARKINGS } from '../data/markings';
import { SIGNS } from '../data/signs';
import { useQuizStore, type TrainingTopic } from '../store/quizStore';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';

const pad = 14;
const gap = 14;
const fs = 14;

const EXAM_SECONDS = 20 * 60;
const KEY_TO_OPTION: Record<string, string> = { '1': 'a', '2': 'b', '3': 'c', '4': 'd' };

function getCorrectOption(question: QuizQuestion) {
  return question.options.find((o) => o.isCorrect) ?? null;
}

function getModeLabel(mode: QuizMode) {
  return mode === 'training' ? 'Тренування' : 'Іспит';
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const TRAINING_TOPIC_ORDER: QuizTopic[] = [
  'exam', 'definitions', 'priority', 'signs', 'markings',
  'maneuvering', 'overtaking', 'stopping', 'railway',
  'pedestrians', 'route-transport', 'tram', 'rules', 'safe_driving',
];

const QUIZ_TOPIC_LABELS: Record<TrainingTopic, string> = {
  all: 'Усі питання',
  errors: 'Мої помилки',
  bookmarks: 'Закладки',
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

export function QuizScreen() {
  const {
    mode, trainingTopic, currentIndex, answers, isFinished,
    sessionQuestionIds, startSession, submitAnswer, nextQuestion,
    finishSession, resetSession,
  } = useQuizStore();

  const { activeProfileId } = useProfileStore();
  const { recordAnswer, recordExam, toggleBookmark, getProfileData, getWrongQuestionIds, getBookmarkIds } = useProgressStore();

  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const examStartRef = useRef<number | null>(null);
  const elapsedRef = useRef<number | null>(null);
  const examRecorded = useRef(false);

  const sessionKey = sessionQuestionIds.join(',');

  // Timer: start/reset when new exam session begins
  useEffect(() => {
    if (mode !== 'exam') return;

    setTimeLeft(EXAM_SECONDS);
    examStartRef.current = Date.now();
    elapsedRef.current = null;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          finishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey]);

  // Stop timer and capture elapsed when exam finishes
  useEffect(() => {
    if (!isFinished || mode !== 'exam') return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (examStartRef.current) {
      elapsedRef.current = Math.floor((Date.now() - examStartRef.current) / 1000);
    }
  }, [isFinished, mode]);

  const profileData = activeProfileId ? getProfileData(activeProfileId) : null;
  const wrongQuestionIds = activeProfileId ? getWrongQuestionIds(activeProfileId) : [];
  const bookmarkIds = activeProfileId ? getBookmarkIds(activeProfileId) : [];

  const topicCounts = QUIZ_QUESTIONS.reduce<Partial<Record<QuizTopic, number>>>((acc, q) => {
    if (q.topic) acc[q.topic] = (acc[q.topic] ?? 0) + 1;
    return acc;
  }, {});
  const availableTrainingTopics = TRAINING_TOPIC_ORDER.filter((t) => (topicCounts[t] ?? 0) > 0);

  const sessionQuestions = sessionQuestionIds
    .map((id) => QUIZ_QUESTIONS.find((q) => q.id === id))
    .filter((q): q is QuizQuestion => Boolean(q));

  const currentQuestion = sessionQuestions[currentIndex] ?? null;
  const globalQuestionNumber = currentQuestion
    ? QUIZ_QUESTIONS.findIndex((q) => q.id === currentQuestion.id) + 1
    : null;
  const isCurrentBookmarked = currentQuestion ? bookmarkIds.includes(currentQuestion.id) : false;
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;
  const correctOption = currentQuestion ? getCorrectOption(currentQuestion) : null;
  const isAnswered = Boolean(currentQuestion && selectedOptionId);
  const isCorrectAnswer = Boolean(selectedOptionId && correctOption && selectedOptionId === correctOption.id);
  const canGoNext = mode === 'training' ? isAnswered : Boolean(selectedOptionId);

  const relatedSigns = currentQuestion
    ? (currentQuestion.relatedSignNumbers ?? [])
        .map((n) => SIGNS.find((s) => s.number === n))
        .filter((s): s is (typeof SIGNS)[number] => Boolean(s))
    : [];
  const relatedMarkings = currentQuestion
    ? (currentQuestion.relatedMarkingNumbers ?? [])
        .map((n) => MARKINGS.find((m) => m.number === n))
        .filter((m): m is (typeof MARKINGS)[number] => Boolean(m))
    : [];

  const correctCount = sessionQuestions.reduce((total, q) => {
    const sel = answers[q.id];
    const cor = getCorrectOption(q);
    return total + (sel && cor && sel === cor.id ? 1 : 0);
  }, 0);

  function handleSubmitAnswer(questionId: string, optionId: string) {
    if (mode === 'training' && answers[questionId]) return;
    submitAnswer(questionId, optionId);
    if (mode === 'training' && activeProfileId) {
      const q = QUIZ_QUESTIONS.find((q) => q.id === questionId);
      if (q) recordAnswer(activeProfileId, questionId, getCorrectOption(q)?.id === optionId);
    }
  }

  // Record exam results when finished
  useEffect(() => {
    if (!isFinished || mode !== 'exam' || !activeProfileId || examRecorded.current) return;
    examRecorded.current = true;
    sessionQuestions.forEach((q) => {
      const sel = answers[q.id];
      recordAnswer(activeProfileId, q.id, getCorrectOption(q)?.id === sel);
    });
    recordExam(activeProfileId, {
      id: Date.now().toString(36),
      date: new Date().toISOString(),
      score: correctCount,
      total: sessionQuestions.length,
      mode: 'exam',
      topic: trainingTopic,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  useEffect(() => { examRecorded.current = false; }, [sessionKey]);

  // Keyboard navigation
  useEffect(() => {
    if (!currentQuestion || isFinished || !mode) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const optionId = KEY_TO_OPTION[e.key];
      if (optionId) {
        handleSubmitAnswer(currentQuestion!.id, optionId);
        return;
      }
      if ((e.key === 'Enter' || e.key === 'ArrowRight') && canGoNext) {
        e.preventDefault();
        nextQuestion();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, isFinished, mode, answers, canGoNext]);

  function handleStartErrors() {
    if (!activeProfileId) return;
    startSession('training', 'errors', getWrongQuestionIds(activeProfileId));
  }

  function handleStartBookmarks() {
    if (!activeProfileId) return;
    startSession('training', 'bookmarks', getBookmarkIds(activeProfileId));
  }

  function handleToggleBookmark(questionId: string) {
    if (!activeProfileId) return;
    toggleBookmark(activeProfileId, questionId);
  }

  // Timer color
  const timerColor = timeLeft < 60 ? 'var(--c-error)' : timeLeft < 300 ? 'var(--c-accent)' : 'var(--c-text-2)';
  const timerUrgent = timeLeft < 60;

  // ── Mode selection screen ─────────────────────────────────────────────────
  if (!mode) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto" style={{ padding: `${pad + 4}px 24px`, gap }}>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 style={{ fontSize: 26 }}>Екзаменаційні задачі</h2>
          <span className="font-mono" style={{ fontSize: 12, color: 'var(--c-text-5)' }}>{QUIZ_QUESTIONS.length} питань</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap }}>
          <button
            onClick={() => startSession('training')}
            className="wk-box wk-box-rough flex flex-col text-left"
            style={{ padding: pad + 8, gap: 10, background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 12, color: 'var(--c-accent)', fontWeight: 700, letterSpacing: '0.05em' }}>РЕЖИМ</span>
            <h3 style={{ fontSize: fs + 4 }}>Тренування</h3>
            <p style={{ margin: 0, color: 'var(--c-text-2)', lineHeight: 1.55, fontSize: fs }}>
              Показує правильність відповіді одразу після вибору та пояснює, чому саме цей варіант правильний.
            </p>
          </button>

          <button
            onClick={() => startSession('exam')}
            className="wk-box wk-box-rough flex flex-col text-left"
            style={{ padding: pad + 8, gap: 10, background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 12, color: 'var(--c-accent)', fontWeight: 700, letterSpacing: '0.05em' }}>РЕЖИМ</span>
            <h3 style={{ fontSize: fs + 4 }}>Іспит</h3>
            <p style={{ margin: 0, color: 'var(--c-text-2)', lineHeight: 1.55, fontSize: fs }}>
              20 випадкових питань за 20 хвилин. Результат і розбір — наприкінці.
            </p>
          </button>

          {wrongQuestionIds.length > 0 && (
            <button
              onClick={handleStartErrors}
              className="wk-box wk-box-rough flex flex-col text-left"
              style={{ padding: pad + 8, gap: 10, background: 'var(--c-error-soft)', border: '1.5px solid var(--c-accent)', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 12, color: 'var(--c-accent)', fontWeight: 700, letterSpacing: '0.05em' }}>РЕЖИМ</span>
              <h3 style={{ fontSize: fs + 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                Повторити помилки
                <span style={{ fontSize: 12, background: 'var(--c-accent)', color: '#fff', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                  {wrongQuestionIds.length}
                </span>
              </h3>
              <p style={{ margin: 0, color: 'var(--c-text-2)', lineHeight: 1.55, fontSize: fs }}>
                Тренування лише по питаннях, де раніше була допущена помилка.
              </p>
            </button>
          )}

          {bookmarkIds.length > 0 && (
            <button
              onClick={handleStartBookmarks}
              className="wk-box wk-box-rough flex flex-col text-left"
              style={{ padding: pad + 8, gap: 10, background: 'var(--c-surface-2)', border: '1.5px solid var(--c-text-4)', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 12, color: 'var(--c-text-4)', fontWeight: 700, letterSpacing: '0.05em' }}>РЕЖИМ</span>
              <h3 style={{ fontSize: fs + 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                Мої закладки
                <span style={{ fontSize: 12, background: 'var(--c-text-4)', color: '#fff', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                  {bookmarkIds.length}
                </span>
              </h3>
              <p style={{ margin: 0, color: 'var(--c-text-2)', lineHeight: 1.55, fontSize: fs }}>
                Тренування по питаннях, які ти позначив закладкою.
              </p>
            </button>
          )}
        </div>

        <div className="wk-box wk-box-rough flex flex-col" style={{ padding: pad + 8, gap: 12, background: 'var(--c-bg)' }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 style={{ fontSize: fs + 4 }}>Категорії тренування</h3>
            <span className="font-mono" style={{ fontSize: 12, color: 'var(--c-text-5)' }}>випадковий порядок</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="wk-btn wk-btn-accent" onClick={() => startSession('training', 'all')}>
              {QUIZ_TOPIC_LABELS.all} ({QUIZ_QUESTIONS.length})
            </button>
            {availableTrainingTopics.map((topic) => {
              const wrongInTopic = profileData
                ? Object.entries(profileData.questionStats).filter(([id, stat]) => {
                    const q = QUIZ_QUESTIONS.find((q) => q.id === id);
                    return q?.topic === topic && stat.wrong > 0;
                  }).length
                : 0;
              return (
                <button key={topic} className="wk-btn" onClick={() => startSession('training', topic)}>
                  {QUIZ_TOPIC_LABELS[topic]} ({topicCounts[topic] ?? 0})
                  {wrongInTopic > 0 && (
                    <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--c-accent)', color: '#fff', padding: '1px 5px', borderRadius: 999, fontWeight: 700, verticalAlign: 'middle' }}>
                      {wrongInTopic}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {profileData && profileData.examHistory.length > 0 && (
          <div className="wk-box wk-box-rough flex flex-col" style={{ padding: pad + 8, gap: 12, background: 'var(--c-bg)' }}>
            <h3 style={{ fontSize: fs + 4 }}>Останні іспити</h3>
            <div className="flex flex-col" style={{ gap: 6 }}>
              {profileData.examHistory.slice(0, 5).map((result) => {
                const passed = result.score >= Math.ceil(result.total * 0.75);
                return (
                  <div key={result.id} className="flex items-center justify-between"
                    style={{ padding: '8px 12px', background: passed ? 'var(--c-success-soft)' : 'var(--c-error-soft)', borderRadius: 6, border: `1px solid ${passed ? 'var(--c-success-border)' : 'var(--c-accent-border)'}` }}
                  >
                    <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>
                      {new Date(result.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: passed ? 'var(--c-success)' : 'var(--c-accent)' }}>
                      {result.score} / {result.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (isFinished) {
    const elapsed = elapsedRef.current;
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto" style={{ padding: `${pad + 4}px 24px`, gap }}>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 style={{ fontSize: 26 }}>Результат</h2>
          <span className="font-mono" style={{ fontSize: 12, color: 'var(--c-text-5)' }}>{getModeLabel(mode)}</span>
          {mode === 'training' && (
            <span className="font-mono" style={{ fontSize: 12, color: 'var(--c-text-5)' }}>{QUIZ_TOPIC_LABELS[trainingTopic]}</span>
          )}
        </div>

        <div className="wk-box wk-box-rough flex flex-col" style={{ padding: pad + 10, gap: 12, background: 'var(--c-bg)' }}>
          <div className="flex items-center gap-2" style={{ color: correctCount === sessionQuestions.length ? 'var(--c-success)' : 'var(--c-accent)' }}>
            {correctCount === sessionQuestions.length ? <CheckCircle2 size={20} /> : <CircleHelp size={20} />}
            <strong style={{ fontSize: fs + 4 }}>{correctCount} з {sessionQuestions.length} правильних відповідей</strong>
          </div>

          {mode === 'exam' && elapsed !== null && (
            <div className="flex items-center gap-2" style={{ color: 'var(--c-text-2)', fontSize: 13 }}>
              <Timer size={14} />
              <span>Час: <strong>{formatTime(elapsed)}</strong> з {formatTime(EXAM_SECONDS)}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button className="wk-btn wk-btn-accent" onClick={() => startSession(mode, mode === 'training' ? trainingTopic : undefined)}>
              Пройти ще раз
            </button>
            {wrongQuestionIds.length > 0 && (
              <button className="wk-btn" style={{ borderColor: 'var(--c-accent)', color: 'var(--c-accent)' }} onClick={handleStartErrors}>
                <AlertCircle size={14} /> Повторити помилки ({wrongQuestionIds.length})
              </button>
            )}
            <button className="wk-btn" onClick={resetSession}>Повернутися до режимів</button>
          </div>
        </div>

        <div className="flex flex-col" style={{ gap: 12 }}>
          {sessionQuestions.map((question, index) => {
            const selected = answers[question.id];
            const correct = getCorrectOption(question);
            const isCorrect = Boolean(selected && correct && selected === correct.id);
            const selectedOption = question.options.find((o) => o.id === selected) ?? null;
            const globalNum = QUIZ_QUESTIONS.findIndex((q) => q.id === question.id) + 1;
            return (
              <div key={question.id} className="wk-box wk-box-rough"
                style={{ padding: pad, background: isCorrect ? 'var(--c-success-soft)' : 'var(--c-error-soft)', border: `1px solid ${isCorrect ? 'var(--c-success-border)' : 'var(--c-accent-border)'}` }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap" style={{ marginBottom: 8 }}>
                  <strong style={{ fontSize: fs + 1, lineHeight: 1.45, flex: 1 }}>
                    {index + 1}.{' '}
                    <span className="font-mono" style={{ fontSize: 11, color: 'var(--c-text-5)', fontWeight: 400 }}>#{globalNum}</span>
                    {' '}{question.prompt}
                  </strong>
                  <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                    <span className="font-mono" style={{ fontSize: 11, color: isCorrect ? 'var(--c-success)' : 'var(--c-accent)', background: 'var(--c-surface)', padding: '4px 8px', borderRadius: 999 }}>
                      {isCorrect ? 'Правильно' : 'Неправильно'}
                    </span>
                    {activeProfileId && (
                      <button
                        onClick={() => handleToggleBookmark(question.id)}
                        title={bookmarkIds.includes(question.id) ? 'Видалити закладку' : 'Додати закладку'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: bookmarkIds.includes(question.id) ? 'var(--c-accent)' : 'var(--c-text-6)' }}
                      >
                        <Bookmark size={15} fill={bookmarkIds.includes(question.id) ? 'var(--c-accent)' : 'none'} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col" style={{ gap: 6, color: 'var(--c-text-3)', fontSize: fs }}>
                  <p style={{ margin: 0 }}><strong>Твоя відповідь:</strong> {selectedOption ? selectedOption.text : 'Відповідь не вибрано'}</p>
                  <p style={{ margin: 0 }}><strong>Правильна відповідь:</strong> {correct?.text ?? 'немає'}</p>
                  {question.explanation && <p style={{ margin: 0, lineHeight: 1.6 }}>{question.explanation}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  // ── Active question screen ────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto" style={{ padding: `${pad + 4}px 24px`, gap }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 style={{ fontSize: 26 }}>{getModeLabel(mode)}</h2>
          <span className="font-mono" style={{ fontSize: 12, color: 'var(--c-text-5)' }}>
            Питання {currentIndex + 1} з {sessionQuestions.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'exam' && (
            <div
              className="flex items-center gap-2 font-mono"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: timerColor,
                padding: '4px 10px',
                background: timerUrgent ? 'var(--c-error-soft)' : 'var(--c-accent-soft)',
                border: `1.5px solid ${timerUrgent ? 'var(--c-error)' : 'var(--c-border-accent)'}`,
                borderRadius: 6,
                animation: timerUrgent ? 'pulse 1s ease-in-out infinite' : undefined,
              }}
            >
              <Timer size={14} />
              {formatTime(timeLeft)}
            </div>
          )}
          <button className="wk-btn" onClick={resetSession}>
            <RotateCcw size={14} /> Назад
          </button>
        </div>
      </div>

      <div style={{ height: 4, background: 'var(--c-border-light)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${((currentIndex + 1) / sessionQuestions.length) * 100}%`,
          background: 'var(--c-accent)',
          borderRadius: 2,
          transition: 'width 0.3s ease',
        }} />
      </div>

      <div className="wk-box wk-box-rough flex flex-col" style={{ padding: pad + 10, gap: 16, background: 'var(--c-bg)', position: 'relative' }}>
        {globalQuestionNumber !== null && (
          <span className="font-mono" style={{ position: 'absolute', top: 10, right: 12, fontSize: 11, color: 'var(--c-text-5)', letterSpacing: '0.03em' }}>
            #{globalQuestionNumber}
          </span>
        )}
        <div className="flex items-start justify-between gap-3">
          <p style={{ margin: 0, fontSize: fs + 3, lineHeight: 1.45, color: 'var(--c-text)', fontWeight: 700, flex: 1 }}>
            {currentQuestion.prompt}
          </p>
          {activeProfileId && (
            <button
              onClick={() => handleToggleBookmark(currentQuestion.id)}
              title={isCurrentBookmarked ? 'Видалити закладку' : 'Додати закладку'}
              style={{
                flexShrink: 0,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: isCurrentBookmarked ? 'var(--c-accent)' : 'var(--c-text-6)',
                transition: 'color 0.15s',
              }}
            >
              <Bookmark size={20} fill={isCurrentBookmarked ? 'var(--c-accent)' : 'none'} />
            </button>
          )}
        </div>

        {(relatedSigns.length > 0 || relatedMarkings.length > 0) && (
          <div className="flex flex-wrap" style={{ gap: 10 }}>
            {relatedSigns.map((sign) => (
              <div key={sign.number} className="wk-box flex items-center gap-2"
                style={{ padding: '8px 10px', background: 'var(--c-surface)', border: '1px solid var(--c-subtle-2)' }}
              >
                <img src={sign.src} alt={`${sign.number} ${sign.title}`} style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }} />
                <div className="flex flex-col" style={{ minWidth: 0 }}>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--c-accent)' }}>{sign.number}</span>
                  <span style={{ fontSize: 12, lineHeight: 1.2, color: 'var(--c-text-3)', maxWidth: 180 }}>{sign.title}</span>
                </div>
              </div>
            ))}
            {relatedMarkings.map((marking) => (
              <div key={marking.number} className="wk-box flex items-center gap-2"
                style={{ padding: '8px 10px', background: 'var(--c-surface)', border: '1px solid var(--c-subtle-2)' }}
              >
                <img src={marking.src} alt={`${marking.number} ${marking.title}`} style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }} />
                <div className="flex flex-col" style={{ minWidth: 0 }}>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--c-accent)' }}>{marking.number}</span>
                  <span style={{ fontSize: 12, lineHeight: 1.2, color: 'var(--c-text-3)', maxWidth: 180 }}>{marking.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {currentQuestion.image && (
            <div className="wk-box" style={{ flexShrink: 0, width: '45%', padding: 8, background: 'var(--c-surface)', border: '1px solid var(--c-subtle-2)' }}>
              <img src={currentQuestion.image} alt={currentQuestion.prompt}
                style={{ width: '100%', objectFit: 'contain', borderRadius: 12, display: 'block', background: 'var(--c-surface-3)' }}
              />
            </div>
          )}

          <div className="flex flex-col" style={{ flex: 1, minWidth: 0, gap: 10 }}>
            <div className="flex flex-col" style={{ gap: 10 }}>
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOptionId === option.id;
                const shouldReveal = isAnswered && mode === 'training';
                const isCorrect = shouldReveal && option.isCorrect;
                const isWrongSelected = shouldReveal && isSelected && !option.isCorrect;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSubmitAnswer(currentQuestion.id, option.id)}
                    className="wk-box flex items-center gap-3 text-left"
                    style={{
                      padding: `${pad - 2}px ${pad}px`,
                      background: isCorrect ? 'var(--c-success-soft)' : isWrongSelected ? 'var(--c-error-soft)' : isSelected ? 'var(--c-accent-soft)' : 'var(--c-surface)',
                      border: `1.5px solid ${isCorrect ? 'var(--c-success)' : isWrongSelected ? 'var(--c-accent)' : 'var(--c-border)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <span className="font-mono" style={{ fontSize: 12, color: 'var(--c-text-4)', minWidth: 18 }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: fs, lineHeight: 1.45, color: 'var(--c-text)' }}>{option.text}</span>
                  </button>
                );
              })}
            </div>

            {isAnswered && mode === 'training' && (
              <div className="wk-box" style={{ padding: pad, background: isCorrectAnswer ? 'var(--c-success-soft)' : 'var(--c-error-soft)', border: `1px solid ${isCorrectAnswer ? 'var(--c-success-border)' : 'var(--c-accent-border)'}` }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 8, color: isCorrectAnswer ? 'var(--c-success)' : 'var(--c-accent)' }}>
                  {isCorrectAnswer ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  <strong>{isCorrectAnswer ? 'Правильна відповідь' : 'Неправильна відповідь'}</strong>
                </div>
                {currentQuestion.explanation && (
                  <p style={{ margin: 0, color: 'var(--c-text-3)', lineHeight: 1.6, fontSize: fs }}>{currentQuestion.explanation}</p>
                )}
                <div className="flex flex-wrap gap-2" style={{ marginTop: 10 }}>
                  {currentQuestion.relatedRuleCodes?.map((code) => (
                    <span key={code} className="font-mono" style={{ fontSize: 11, color: 'var(--c-accent-2)', background: 'var(--c-accent-soft)', padding: '4px 8px', borderRadius: 999 }}>Правило {code}</span>
                  ))}
                  {currentQuestion.relatedSignNumbers?.map((n) => (
                    <span key={n} className="font-mono" style={{ fontSize: 11, color: 'var(--c-accent-2)', background: 'var(--c-accent-soft)', padding: '4px 8px', borderRadius: 999 }}>Знак {n}</span>
                  ))}
                  {currentQuestion.relatedMarkingNumbers?.map((n) => (
                    <span key={n} className="font-mono" style={{ fontSize: 11, color: 'var(--c-accent-2)', background: 'var(--c-accent-soft)', padding: '4px 8px', borderRadius: 999 }}>Розмітка {n}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button className="wk-btn wk-btn-accent" disabled={!canGoNext} onClick={nextQuestion}>
                {currentIndex === sessionQuestions.length - 1 ? 'Завершити' : 'Наступне питання'}
              </button>
              <button className="wk-btn" onClick={resetSession}>Повернутися до режимів</button>
            </div>

            <span style={{ fontSize: 11, color: 'var(--c-text-6)' }}>
              Клавіші: <strong>1–4</strong> вибір варіанту &nbsp;·&nbsp; <strong>Enter</strong> або <strong>→</strong> далі
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
