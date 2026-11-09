import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { classHasQuestions } from '@/data';
import type { ExamDraft, ExamReveal, ExamScore, ExamVersion, LicenseClassId } from '@/types';

type SettingsData = {
  licenseClass: LicenseClassId;
  version: ExamVersion;
  wrongIds: number[];
  examReveal: ExamReveal;
  /** Best score per fixed exam id. */
  examScores: Record<number, ExamScore>;
  /** Unfinished exams the user saved to continue later. */
  examDrafts: Record<number, ExamDraft>;
};

type SettingsActions = {
  setLicenseClass: (licenseClass: LicenseClassId) => void;
  setVersion: (version: ExamVersion) => void;
  setExamReveal: (reveal: ExamReveal) => void;
  saveExamScore: (examId: number, score: ExamScore) => void;
  saveExamDraft: (examId: number, draft: ExamDraft) => void;
  clearExamDraft: (examId: number) => void;
  addWrong: (ids: number[]) => void;
  removeWrong: (ids: number[]) => void;
  reset: () => void;
};

const DEFAULTS: SettingsData = {
  licenseClass: 'B',
  version: 'new',
  wrongIds: [],
  examReveal: 'end',
  examScores: {},
  examDrafts: {},
};

/** Keeps a new score only if it is better than the saved one (passing beats failing, then more correct). */
const isBetterScore = (next: ExamScore, previous?: ExamScore) =>
  !previous ||
  (next.passed && !previous.passed) ||
  (next.passed === previous.passed && next.correct > previous.correct);

export const useSettings = create<SettingsData & SettingsActions>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setLicenseClass: (licenseClass) => set({ licenseClass }),
      setVersion: (version) => set({ version }),
      setExamReveal: (examReveal) => set({ examReveal }),
      saveExamScore: (examId, score) =>
        set((state) =>
          isBetterScore(score, state.examScores[examId])
            ? { examScores: { ...state.examScores, [examId]: score } }
            : {},
        ),
      saveExamDraft: (examId, draft) => set((state) => ({ examDrafts: { ...state.examDrafts, [examId]: draft } })),
      clearExamDraft: (examId) =>
        set((state) => {
          const { [examId]: _removed, ...rest } = state.examDrafts;
          return { examDrafts: rest };
        }),
      addWrong: (ids) => set((state) => ({ wrongIds: Array.from(new Set([...state.wrongIds, ...ids])) })),
      removeWrong: (ids) => set((state) => ({ wrongIds: state.wrongIds.filter((id) => !ids.includes(id)) })),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'gplx-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // A saved class with no bundled questions yet (motorbike classes) falls back to B.
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<SettingsData>) };
        return classHasQuestions(merged.licenseClass) ? merged : { ...merged, licenseClass: DEFAULTS.licenseClass };
      },
    },
  ),
);

/** True once the persisted settings have been loaded from storage. */
export const useSettingsHydrated = () =>
  useSyncExternalStore(useSettings.persist.onFinishHydration, useSettings.persist.hasHydrated);
