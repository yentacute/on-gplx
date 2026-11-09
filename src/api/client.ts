import { SIGNS, questionsForClass } from '@/data';
import type { ExamVersion, LicenseClassId } from '@/types';

// Data is bundled with the app, so these resolve immediately. They stay async so a
// real API can replace them later without UI changes.
export const fetchQuestions = async (licenseClass: LicenseClassId, _version: ExamVersion) =>
  questionsForClass(licenseClass);

export const fetchSigns = async () => SIGNS;
