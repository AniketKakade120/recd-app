// Taste Score calculation — Rec'd
// Formula: average recommendation result mapped to percentage
// Nailed it = 5, Pretty close = 3.5, Not for me = 1.5

import { RecAccuracy, getTasteLabel } from '@/lib/types';

const ACCURACY_MAP: Record<RecAccuracy, number> = {
  'Nailed it': 5,
  'Pretty close': 3.5,
  'Not for me': 1.5,
};

export function calculateTasteScore(results: RecAccuracy[]): number {
  if (results.length === 0) return 0;
  const avg = results.reduce((sum, r) => sum + ACCURACY_MAP[r], 0) / results.length;
  return Math.round((avg / 5) * 100);
}

export function getTasteScoreInfo(score: number) {
  return {
    score,
    label: getTasteLabel(score),
    percentile: score >= 90 ? 'Top 5%' : score >= 80 ? 'Top 10%' : score >= 65 ? 'Top 25%' : 'Building reputation',
  };
}

// TODO: Connect to Supabase — replace with real aggregation query
// TODO: Add trend calculation based on last N ratings
