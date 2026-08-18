import { LottoDraw, NumberStat, FilterOptions, AnalysisDetail, SimulationResult } from '../types';
import { ALL_HISTORICAL_DRAWS } from '../data/lottoHistory';

// 한국 동행복권 공식 볼 색상 계열
export function getBallColorClass(num: number): {
  bg: string;
  border: string;
  text: string;
  shadow: string;
  badge: string;
} {
  if (num >= 1 && num <= 10) {
    return {
      bg: 'bg-amber-400',
      border: 'border-amber-500',
      text: 'text-amber-950',
      shadow: 'shadow-amber-200/80',
      badge: 'bg-amber-100 text-amber-800 border-amber-300'
    };
  }
  if (num >= 11 && num <= 20) {
    return {
      bg: 'bg-sky-500',
      border: 'border-sky-600',
      text: 'text-white',
      shadow: 'shadow-sky-300/80',
      badge: 'bg-sky-100 text-sky-800 border-sky-300'
    };
  }
  if (num >= 21 && num <= 30) {
    return {
      bg: 'bg-rose-500',
      border: 'border-rose-600',
      text: 'text-white',
      shadow: 'shadow-rose-300/80',
      badge: 'bg-rose-100 text-rose-800 border-rose-300'
    };
  }
  if (num >= 31 && num <= 40) {
    return {
      bg: 'bg-slate-600',
      border: 'border-slate-700',
      text: 'text-white',
      shadow: 'shadow-slate-400/80',
      badge: 'bg-slate-100 text-slate-800 border-slate-300'
    };
  }
  // 41~45
  return {
    bg: 'bg-emerald-500',
    border: 'border-emerald-600',
    text: 'text-white',
    shadow: 'shadow-emerald-300/80',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  };
}

// KRW 통화 포맷터 (예: 24억 8,000만원, 50,000원 등)
export function formatKRW(amount: number): string {
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    if (man > 0) {
      return `${eok.toLocaleString()}억 ${man.toLocaleString()}만원`;
    }
    return `${eok.toLocaleString()}억원`;
  }
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const won = amount % 10000;
    if (won > 0) {
      return `${man.toLocaleString()}만 ${won.toLocaleString()}원`;
    }
    return `${man.toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

// 6/45 번호 유효성 검사
export function validateNumbers(numbers: number[]): { isValid: boolean; message?: string } {
  if (!Array.isArray(numbers) || numbers.length !== 6) {
    return { isValid: false, message: '정확히 6개의 번호를 선택해야 합니다.' };
  }
  const unique = new Set(numbers);
  if (unique.size !== 6) {
    return { isValid: false, message: '중복된 번호가 포함되어 있습니다.' };
  }
  for (const n of numbers) {
    if (!Number.isInteger(n) || n < 1 || n > 45) {
      return { isValid: false, message: '모든 번호는 1부터 45 사이의 정수여야 합니다.' };
    }
  }
  return { isValid: true };
}

// 번호 생성기 (랜덤 / 조건 필터)
export function generateLottoNumbers(
  options?: Partial<FilterOptions>,
  weights?: Map<number, number>
): number[] {
  const include = options?.includeNumbers || [];
  const exclude = new Set(options?.excludeNumbers || []);

  const pool = Array.from({ length: 45 }, (_, i) => i + 1).filter(
    n => !exclude.has(n) && !include.includes(n)
  );

  const maxAttempts = 1000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const current = [...include];
    const tempPool = [...pool];

    // 가중치 샘플링 (통계 모드) 또는 균등 난수
    while (current.length < 6 && tempPool.length > 0) {
      let selectedIdx = 0;
      if (weights && weights.size > 0) {
        let totalWeight = 0;
        for (const num of tempPool) {
          totalWeight += weights.get(num) || 1;
        }
        let randVal = Math.random() * totalWeight;
        for (let i = 0; i < tempPool.length; i++) {
          const w = weights.get(tempPool[i]) || 1;
          if (randVal <= w) {
            selectedIdx = i;
            break;
          }
          randVal -= w;
        }
      } else {
        selectedIdx = Math.floor(Math.random() * tempPool.length);
      }
      current.push(tempPool.splice(selectedIdx, 1)[0]);
    }

    if (current.length !== 6) continue;
    current.sort((a, b) => a - b);

    // 필터 검증
    if (options) {
      // 1. 홀짝 비율
      if (options.oddEvenRatio && options.oddEvenRatio !== 'all') {
        const oddCount = current.filter(n => n % 2 === 1).length;
        const [targetOdd] = options.oddEvenRatio.split(':').map(Number);
        if (oddCount !== targetOdd) continue;
      }

      // 2. 합계 범위
      if (options.sumRange) {
        const sum = current.reduce((a, b) => a + b, 0);
        if (sum < options.sumRange[0] || sum > options.sumRange[1]) continue;
      }

      // 3. 연속번호 제한
      if (options.maxConsecutive !== undefined) {
        let consecutive = 1;
        let maxCons = 1;
        for (let i = 1; i < current.length; i++) {
          if (current[i] === current[i - 1] + 1) {
            consecutive++;
            if (consecutive > maxCons) maxCons = consecutive;
          } else {
            consecutive = 1;
          }
        }
        if (maxCons > options.maxConsecutive) continue;
      }

      // 4. 고저 비율 (1~22 저, 23~45 고)
      if (options.highLowRatio && options.highLowRatio !== 'all') {
        const lowCount = current.filter(n => n <= 22).length;
        const [targetLow] = options.highLowRatio.split(':').map(Number);
        if (lowCount !== targetLow) continue;
      }

      // 5. 구간 분포 스팬
      if (options.sectionSpanMin) {
        const sections = new Set(current.map(n => Math.min(4, Math.floor((n - 1) / 10))));
        if (sections.size < options.sectionSpanMin) continue;
      }
    }

    return current;
  }

  // 필터가 너무 까다로워 조건에 맞는 번호를 찾지 못했을 경우 기본 안전 생성
  const fallback = [...include];
  const remaining = Array.from({ length: 45 }, (_, i) => i + 1).filter(
    n => !exclude.has(n) && !fallback.includes(n)
  );
  while (fallback.length < 6 && remaining.length > 0) {
    const idx = Math.floor(Math.random() * remaining.length);
    fallback.push(remaining.splice(idx, 1)[0]);
  }
  return fallback.sort((a, b) => a - b);
}

// 당첨 등수 판별
export function evaluateDraw(
  userNumbers: number[],
  draw: LottoDraw
): {
  rank: 1 | 2 | 3 | 4 | 5 | 0; // 0은 낙첨
  matchedNumbers: number[];
  bonusMatched: boolean;
  prizeAmount: number;
} {
  const drawSet = new Set(draw.numbers);
  const matchedNumbers = userNumbers.filter(n => drawSet.has(n));
  const bonusMatched = userNumbers.includes(draw.bonusNo);
  const matchCount = matchedNumbers.length;

  if (matchCount === 6) {
    return { rank: 1, matchedNumbers, bonusMatched: false, prizeAmount: draw.firstPrizeAmount || 2200000000 };
  }
  if (matchCount === 5 && bonusMatched) {
    return { rank: 2, matchedNumbers, bonusMatched: true, prizeAmount: 55000000 };
  }
  if (matchCount === 5) {
    return { rank: 3, matchedNumbers, bonusMatched: false, prizeAmount: 1400000 };
  }
  if (matchCount === 4) {
    return { rank: 4, matchedNumbers, bonusMatched, prizeAmount: 50000 };
  }
  if (matchCount === 3) {
    return { rank: 5, matchedNumbers, bonusMatched, prizeAmount: 5000 };
  }
  return { rank: 0, matchedNumbers, bonusMatched, prizeAmount: 0 };
}

// 번호별 출현 통계 계산
export function calculateNumberStats(draws: LottoDraw[]): NumberStat[] {
  const totalDraws = draws.length;
  const statsMap: { [num: number]: { count: number; bonusCount: number; lastDrawnAgo: number; lastDrawnDate?: string } } = {};

  for (let i = 1; i <= 45; i++) {
    statsMap[i] = { count: 0, bonusCount: 0, lastDrawnAgo: totalDraws, lastDrawnDate: undefined };
  }

  draws.forEach((draw, drawIndex) => {
    draw.numbers.forEach(num => {
      statsMap[num].count++;
      if (statsMap[num].lastDrawnAgo === totalDraws) {
        statsMap[num].lastDrawnAgo = drawIndex; // 최근 몇 회차 전인지 (0 = 바로 직전)
        statsMap[num].lastDrawnDate = draw.date;
      }
    });

    if (draw.bonusNo) {
      statsMap[draw.bonusNo].bonusCount++;
    }
  });

  return Array.from({ length: 45 }, (_, i) => {
    const num = i + 1;
    const item = statsMap[num];
    const totalCount = item.count + item.bonusCount;
    return {
      number: num,
      count: item.count,
      bonusCount: item.bonusCount,
      totalCount,
      frequencyRate: totalDraws > 0 ? Number(((item.count / (totalDraws * 6)) * 100).toFixed(2)) : 0,
      lastDrawnAgo: item.lastDrawnAgo,
      lastDrawnDate: item.lastDrawnDate
    };
  });
}

// 6개 번호 조합 심층 분석 (AC값, 합계, 홀짝, 구간, 끝수, 역대 매칭)
export function analyzeCombination(numbers: number[], draws: LottoDraw[] = ALL_HISTORICAL_DRAWS): AnalysisDetail {
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const oddCount = sorted.filter(n => n % 2 === 1).length;
  const evenCount = 6 - oddCount;
  const lowCount = sorted.filter(n => n <= 22).length;
  const highCount = 6 - lowCount;

  const sectionCounts = {
    '1-10': sorted.filter(n => n >= 1 && n <= 10).length,
    '11-20': sorted.filter(n => n >= 11 && n <= 20).length,
    '21-30': sorted.filter(n => n >= 21 && n <= 30).length,
    '31-40': sorted.filter(n => n >= 31 && n <= 40).length,
    '41-45': sorted.filter(n => n >= 41 && n <= 45).length,
  };

  // 연속번호 쌍 찾기
  const consecutivePairs: number[][] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] === sorted[i] + 1) {
      consecutivePairs.push([sorted[i], sorted[i + 1]]);
    }
  }

  // 끝수 분포 (1~9, 0)
  const endingDigits = sorted.map(n => n % 10);

  // AC (Arithmetic Complexity) 값 계산: 6개 번호 차이값의 유일 개수 - (6 - 1)
  const differences = new Set<number>();
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      differences.add(Math.abs(sorted[i] - sorted[j]));
    }
  }
  const acValue = differences.size - 5;

  // 역대 당첨 매칭 이력 조회
  const historicalMatches: AnalysisDetail['historicalMatches'] = [];
  draws.forEach(draw => {
    const res = evaluateDraw(sorted, draw);
    if (res.rank > 0) {
      const rankLabels: { [key: number]: string } = {
        1: '1등 (6개 일치)',
        2: '2등 (5개+보너스)',
        3: '3등 (5개 일치)',
        4: '4등 (4개 일치)',
        5: '5등 (3개 일치)'
      };
      historicalMatches.push({
        drawNo: draw.drawNo,
        date: draw.date,
        rank: rankLabels[res.rank],
        matchCount: res.matchedNumbers.length,
        bonusMatch: res.bonusMatched
      });
    }
  });

  return {
    sum,
    oddCount,
    evenCount,
    lowCount,
    highCount,
    sectionCounts,
    consecutivePairs,
    endingDigits,
    acValue,
    historicalMatches: historicalMatches.slice(0, 20) // 최근 순 상위 20개
  };
}

// 몬테카를로 대량 추첨 시뮬레이터 (빠른 연산 & 통계 산출)
export function runSimulation(
  userNumbers: number[],
  iterations: number
): SimulationResult {
  const startTime = performance.now();
  const ticketPrice = 1000;
  const totalCost = iterations * ticketPrice;

  const rankCounts = { rank1: 0, rank2: 0, rank3: 0, rank4: 0, rank5: 0, miss: 0 };
  const rankPrizes = {
    rank1: 2200000000,
    rank2: 55000000,
    rank3: 1400000,
    rank4: 50000,
    rank5: 5000
  };

  const sampleWins: SimulationResult['sampleWins'] = [];
  const userSet = new Set(userNumbers);

  const pool = Array.from({ length: 45 }, (_, i) => i + 1);

  for (let i = 0; i < iterations; i++) {
    // 7개 뽑기 (6개 당첨 + 1개 보너스)
    // Fisher-Yates partial shuffle of first 7 elements
    const drawArr = [...pool];
    for (let j = 0; j < 7; j++) {
      const randIdx = j + Math.floor(Math.random() * (45 - j));
      const temp = drawArr[j];
      drawArr[j] = drawArr[randIdx];
      drawArr[randIdx] = temp;
    }

    const drawn6 = drawArr.slice(0, 6);
    const bonus = drawArr[6];

    let matchCount = 0;
    const matchedArr: number[] = [];
    for (let k = 0; k < 6; k++) {
      if (userSet.has(drawn6[k])) {
        matchCount++;
        matchedArr.push(drawn6[k]);
      }
    }
    const bonusMatch = userSet.has(bonus);

    if (matchCount === 6) {
      rankCounts.rank1++;
      if (sampleWins.length < 15) {
        sampleWins.push({ rank: 1, gameIndex: i + 1, drawnNumbers: drawn6.sort((a, b) => a - b), bonusNo: bonus, matchedNumbers: matchedArr, bonusMatched: false });
      }
    } else if (matchCount === 5 && bonusMatch) {
      rankCounts.rank2++;
      if (sampleWins.length < 15) {
        sampleWins.push({ rank: 2, gameIndex: i + 1, drawnNumbers: drawn6.sort((a, b) => a - b), bonusNo: bonus, matchedNumbers: matchedArr, bonusMatched: true });
      }
    } else if (matchCount === 5) {
      rankCounts.rank3++;
      if (sampleWins.length < 15) {
        sampleWins.push({ rank: 3, gameIndex: i + 1, drawnNumbers: drawn6.sort((a, b) => a - b), bonusNo: bonus, matchedNumbers: matchedArr, bonusMatched: false });
      }
    } else if (matchCount === 4) {
      rankCounts.rank4++;
      if (sampleWins.length < 10) {
        sampleWins.push({ rank: 4, gameIndex: i + 1, drawnNumbers: drawn6.sort((a, b) => a - b), bonusNo: bonus, matchedNumbers: matchedArr, bonusMatched: bonusMatch });
      }
    } else if (matchCount === 3) {
      rankCounts.rank5++;
      if (sampleWins.length < 5) {
        sampleWins.push({ rank: 5, gameIndex: i + 1, drawnNumbers: drawn6.sort((a, b) => a - b), bonusNo: bonus, matchedNumbers: matchedArr, bonusMatched: bonusMatch });
      }
    } else {
      rankCounts.miss++;
    }
  }

  const totalWon =
    rankCounts.rank1 * rankPrizes.rank1 +
    rankCounts.rank2 * rankPrizes.rank2 +
    rankCounts.rank3 * rankPrizes.rank3 +
    rankCounts.rank4 * rankPrizes.rank4 +
    rankCounts.rank5 * rankPrizes.rank5;

  const netProfit = totalWon - totalCost;
  const roi = totalCost > 0 ? Number(((totalWon / totalCost) * 100).toFixed(2)) : 0;
  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    totalGames: iterations,
    totalCost,
    totalWon,
    netProfit,
    roi,
    rankCounts,
    rankPrizes,
    sampleWins,
    executionTimeMs
  };
}
