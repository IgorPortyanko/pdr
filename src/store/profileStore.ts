import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types';

interface ProfileStoreState {
  profiles: Profile[];
  activeProfileId: string | null;
  setActiveProfile: (id: string) => void;
  clearActiveProfile: () => void;
  addProfile: (name: string, emoji: string) => string;
  deleteProfile: (id: string) => void;
}

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      profiles: [],
      activeProfileId: null,

      setActiveProfile: (id) => set({ activeProfileId: id }),

      clearActiveProfile: () => set({ activeProfileId: null }),

      addProfile: (name, emoji) => {
        const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const profile: Profile = { id, name, emoji, createdAt: new Date().toISOString() };
        set((state) => ({ profiles: [...state.profiles, profile] }));
        return id;
      },

      deleteProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
        })),
    }),
    { name: 'pdr-profiles' },
  ),
);
