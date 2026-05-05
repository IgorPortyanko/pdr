import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionStat, ExamResult } from '../types';

interface ProgressData {
  questionStats: Record<string, QuestionStat>;
  examHistory: ExamResult[];
  bookmarks: string[];
}

interface ProgressStoreState {
  data: Record<string, ProgressData>;
  recordAnswer: (profileId: string, questionId: string, isCorrect: boolean) => void;
  recordExam: (profileId: string, result: ExamResult) => void;
  toggleBookmark: (profileId: string, questionId: string) => void;
  getProfileData: (profileId: string) => ProgressData;
  getWrongQuestionIds: (profileId: string) => string[];
  getBookmarkIds: (profileId: string) => string[];
  clearProfileData: (profileId: string) => void;
}

const emptyData = (): ProgressData => ({ questionStats: {}, examHistory: [], bookmarks: [] });

export const useProgressStore = create<ProgressStoreState>()(
  persist(
    (set, get) => ({
      data: {},

      recordAnswer: (profileId, questionId, isCorrect) =>
        set((state) => {
          const profile = state.data[profileId] ?? emptyData();
          const stat = profile.questionStats[questionId] ?? { correct: 0, wrong: 0, lastSeen: '' };
          return {
            data: {
              ...state.data,
              [profileId]: {
                ...profile,
                questionStats: {
                  ...profile.questionStats,
                  [questionId]: {
                    correct: stat.correct + (isCorrect ? 1 : 0),
                    wrong: isCorrect ? 0 : stat.wrong + 1,
                    lastSeen: new Date().toISOString(),
                  },
                },
              },
            },
          };
        }),

      recordExam: (profileId, result) =>
        set((state) => {
          const profile = state.data[profileId] ?? emptyData();
          return {
            data: {
              ...state.data,
              [profileId]: {
                ...profile,
                examHistory: [result, ...profile.examHistory].slice(0, 100),
              },
            },
          };
        }),

      toggleBookmark: (profileId, questionId) =>
        set((state) => {
          const profile = state.data[profileId] ?? emptyData();
          const bookmarks = profile.bookmarks ?? [];
          const next = bookmarks.includes(questionId)
            ? bookmarks.filter((id) => id !== questionId)
            : [...bookmarks, questionId];
          return {
            data: {
              ...state.data,
              [profileId]: { ...profile, bookmarks: next },
            },
          };
        }),

      getProfileData: (profileId) => get().data[profileId] ?? emptyData(),

      getWrongQuestionIds: (profileId) =>
        Object.entries((get().data[profileId] ?? emptyData()).questionStats)
          .filter(([, stat]) => stat.wrong > 0)
          .map(([id]) => id),

      getBookmarkIds: (profileId) => (get().data[profileId] ?? emptyData()).bookmarks ?? [],

      clearProfileData: (profileId) =>
        set((state) => {
          const next = { ...state.data };
          delete next[profileId];
          return { data: next };
        }),
    }),
    { name: 'pdr-progress' },
  ),
);
