export interface LottoDraw {
  drawNo: number;
  date: string;
  numbers: [number, number, number, number, number, number];
  bonusNo: number;
  firstPrizeAmount: number;
  firstWinnerCount: number;
  totalSales?: number;
}

export type GenerationMode = 'random' | 'statistic' | 'custom';

export interface LottoGame {
  id: string;
  numbers: number[];
  createdAt: string;
  mode: GenerationMode;
  notes?: string;
  isSaved?: boolean;
}

export interface FilterOptions {
  includeNumbers: number[];
  excludeNumbers: number[];
  oddEvenRatio: 'all' | '3:3' | '4:2' | '2:4' | '5:1' | '1:5';
  sumRange: [number, number];
  maxConsecutive: number;
  highLowRatio: 'all' | '3:3' | '4:2' | '2:4';
  sectionSpanMin: number;
}

export interface SimulationResult {
  totalGames: number;
  totalCost: number;
  totalWon: number;
  netProfit: number;
  roi: number;
  rankCounts: {
    rank1: number;
    rank2: number;
    rank3: number;
    rank4: number;
    rank5: number;
    miss: number;
  };
  rankPrizes: {
    rank1: number;
    rank2: number;
    rank3: number;
    rank4: number;
    rank5: number;
  };
  sampleWins: Array<{
    rank: 1 | 2 | 3 | 4 | 5;
    gameIndex: number;
    drawnNumbers: number[];
    bonusNo: number;
    matchedNumbers: number[];
    bonusMatched: boolean;
  }>;
  executionTimeMs: number;
}

export interface AnalysisDetail {
  sum: number;
  oddCount: number;
  evenCount: number;
  lowCount: number;
  highCount: number;
  sectionCounts: {
    '1-10': number;
    '11-20': number;
    '21-30': number;
    '31-40': number;
    '41-45': number;
  };
  consecutivePairs: number[][];
  endingDigits: number[];
  acValue: number;
  historicalMatches: Array<{
    drawNo: number;
    date: string;
    rank: string;
    matchCount: number;
    bonusMatch: boolean;
  }>;
}

export interface NumberStat {
  number: number;
  count: number;
  bonusCount: number;
  totalCount: number;
  frequencyRate: number;
  lastDrawnAgo: number;
  lastDrawnDate?: string;
}
