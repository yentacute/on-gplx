import { QUESTIONS, SIGNS } from '@/data';
import type { ExamVersion, LicenseClassId } from '@/types';

// Data is bundled with the app for now; the delay keeps the loading states honest
// so swapping in a real API later needs no UI changes.
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchQuestions = async (_licenseClass: LicenseClassId, _version: ExamVersion) => {
  await delay();
  return QUESTIONS;
};

export const fetchSigns = async () => {
  await delay();
  return SIGNS;
};
