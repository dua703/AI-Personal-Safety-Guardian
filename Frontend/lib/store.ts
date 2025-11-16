import { create } from 'zustand';
import { ThreatAnalysisResponse } from './api';

interface ResultStore {
  result: ThreatAnalysisResponse | null;
  setResult: (result: ThreatAnalysisResponse) => void;
  clearResult: () => void;
}

export const useResultStore = create<ResultStore>((set) => ({
  result: null,
  setResult: (result) => set({ result }),
  clearResult: () => set({ result: null }),
}));

