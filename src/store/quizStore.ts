import { create } from 'zustand';
import type { QuizMode, QuizTopic } from '../types';
import { QUIZ_QUESTIONS } from '../data/quiz';

export type TrainingTopic = QuizTopic | 'all' | 'errors' | 'bookmarks';

interface QuizStoreState {
  mode: QuizMode | null;
  trainingTopic: TrainingTopic;
  currentIndex: number;
  answers: Record<string, string>;
  isFinished: boolean;
  sessionQuestionIds: string[];

  startSession: (mode: QuizMode, topic?: TrainingTopic, errorQuestionIds?: string[]) => void;
  submitAnswer: (questionId: string, optionId: string) => void;
  nextQuestion: () => void;
  finishSession: () => void;
  resetSession: () => void;
}

const EXAM_QUESTION_COUNT = 20;

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export const useQuizStore = create<QuizStoreState>((set) => ({
  mode: null,
  trainingTopic: 'all',
  currentIndex: 0,
  answers: {},
  isFinished: false,
  sessionQuestionIds: [],

  startSession: (mode, topic = 'all', errorQuestionIds) =>
    set(() => {
      let pool = QUIZ_QUESTIONS;

      if ((topic === 'errors' || topic === 'bookmarks') && errorQuestionIds) {
        pool = QUIZ_QUESTIONS.filter((q) => errorQuestionIds.includes(q.id));
      } else if (topic !== 'all') {
        pool = QUIZ_QUESTIONS.filter((q) => q.topic === topic);
      }

      const sessionQuestionIds =
        mode === 'exam'
          ? shuffle(pool.map((q) => q.id)).slice(0, Math.min(EXAM_QUESTION_COUNT, pool.length))
          : shuffle(pool.map((q) => q.id));

      return {
        mode,
        trainingTopic: mode === 'training' ? topic : 'all',
        currentIndex: 0,
        answers: {},
        isFinished: false,
        sessionQuestionIds,
      };
    }),

  submitAnswer: (questionId, optionId) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: optionId,
      },
    })),

  nextQuestion: () =>
    set((state) => {
      const nextIndex = state.currentIndex + 1;
      const sessionLength = state.sessionQuestionIds.length;

      if (nextIndex >= sessionLength) {
        return {
          currentIndex: state.currentIndex,
          isFinished: true,
        };
      }

      return {
        currentIndex: nextIndex,
      };
    }),

  finishSession: () => set({ isFinished: true }),

  resetSession: () =>
    set({
      mode: null,
      trainingTopic: 'all',
      currentIndex: 0,
      answers: {},
      isFinished: false,
      sessionQuestionIds: [],
    }),
}));
