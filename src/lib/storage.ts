import type { PMOData } from '@/types/pmo';

const STORAGE_KEY = 'pmo-data-v2';

export const storageGet = async (): Promise<PMOData | null> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const storageSet = async (val: PMOData): Promise<void> => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error:', e);
  }
};
