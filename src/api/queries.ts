import { useQuery } from '@tanstack/react-query';
import { fetchQuestions, fetchSigns } from '@/api/client';
import { SIGNS, questionsForClass } from '@/data';
import { useSettings } from '@/store/settings';
import type { ExamVersion, LicenseClassId } from '@/types';

export const queryKeys = {
  questions: (licenseClass: LicenseClassId, version: ExamVersion) => ['questions', licenseClass, version] as const,
  signs: ['signs'] as const,
};

export const useQuestions = () => {
  const { licenseClass, version } = useSettings();
  return useQuery({
    queryKey: queryKeys.questions(licenseClass, version),
    queryFn: () => fetchQuestions(licenseClass, version),
    // Bundled data: render it on the first pass so static web pages ship real content.
    initialData: () => questionsForClass(licenseClass),
    staleTime: 60 * 60 * 1000,
  });
};

export const useSigns = () => useQuery({ queryKey: queryKeys.signs, queryFn: fetchSigns, initialData: SIGNS, staleTime: Infinity });
