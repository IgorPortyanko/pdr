import { create } from 'zustand';
import type { Rule } from '../types';
import { RULES } from '../data/rules';

interface RulesState {
  rules: Rule[];
  activeCategoryId: string;

  setActiveCategory: (id: string) => void;
}

export const useRulesStore = create<RulesState>((set) => ({
  rules: RULES,
  activeCategoryId: 'all',

  setActiveCategory: (id) => set({ activeCategoryId: id }),
}));
