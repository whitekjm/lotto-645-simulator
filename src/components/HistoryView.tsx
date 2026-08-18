import React, { useState, useMemo } from 'react';
import { LottoDraw } from '../types';
import { LottoBall } from './LottoBall';
import { ALL_HISTORICAL_DRAWS, LATEST_DRAW } from '../data/lottoHistory';
import { evaluateDraw, formatKRW, generateLottoNumbers } from '../lib/lottoUtils';
import {
  Search,
  History,
  CheckCircle2,
  Calendar,
  Award,
  Filter,
  Sparkles,
  ChevronRight,
  Dices
} from 'lucide-react';

interface HistoryViewProps {
  onAnalyzeCombination?: (numbers: number[]) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onAnalyzeCombination }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDraw, setSelectedDraw] = useState<LottoDraw>(LATEST_DRAW);

  // "내 번호 역대 대조기" state
  const [myNumbers, setMyNumbers] = useState<number[]>([3, 11, 19, 27, 34, 42]);

  const handleToggleMyNumber = (num: number) => {
    if (myNumbers.includes(num)) {
      setMyNumbers(myNumbers.filter(n => n !== num));
    } else {
      if (myNumbers.length >= 6) return;
      setMyNumbers([...myNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleRandomMyNumbers = () => {
    setMyNumbers(generateLottoNumbers());
  };

  // Filtered draws for search
  const filteredDraws = useMemo(() => {
    if (!searchTerm.trim()) return ALL_HISTORICAL_DRAWS.slice(0, 30);
    const term = searchTerm.trim();
    return ALL_HISTORICAL_DRAWS.filter(
      d => d.drawNo.toString().includes(term) || d.date.includes(term)
    ).slice(0, 30);
  }, [searchTerm]);

  // Evaluate myNumbers across ALL historical draws
  const historicalMatchResults = useMemo(() => {
    if (myNumbers.length !== 6) return null;
    const rankCounts = { rank1: 0, rank2: 0, rank3: 0, rank4: 0, rank5: 0 };
    const matches: Array<{
      drawNo: number;
      date: string;
      rank: 1 | 2 | 3 | 4 | 5;
      matchedNumbers: number[];
      bonusMatched: boolean;
      prizeAmount: number;
    }> = [];

    let totalPrize = 0;

    ALL_HISTORICAL_DRAWS.forEach(draw => {
      const res = evaluateDraw(myNumbers, draw);
      if (res.rank > 0) {
        if (res.rank === 1) rankCounts.rank1++;
        else if (res.rank === 2) rankCounts.rank2++;
        else if (res.rank === 3) rankCounts.rank3++;
        else if (res.rank === 4) rankCounts.rank4++;
        else if (res.rank === 5) rankCounts.rank5++;

        totalPrize += res.prizeAmount;

        matches.push({
          drawNo: draw.drawNo,
          date: draw.date,
          rank: res.rank as 1 | 2 | 3 | 4 | 5,
          matchedNumbers: res.matchedNumbers,
          bonusMatched: res.bonusMatched,
          prizeAmount: res.prizeAmount
        });
      }
    });

    return {
      totalEvaluated: ALL_HISTORICAL_DRAWS.length,
      rankCounts,
      totalPrize,
      matches: matches.sort((a, b) => a.rank - b.rank || b.drawNo - a.drawNo)
    };
  }, [myNumbers]);

  return (
    <div className="space-y-6">
      {/* 1. 내 번호 역대 전체 당첨 대조기 (Top Interactive Feature) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 id="match-heading" className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              내 번호 역대 전체 회차 당첨 대조기
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              내 번호 6개가 역대 1회부터 {ALL_HISTORICAL_DRAWS.length}회까지 매주 구매되었다면 몇 번 당첨되었을지 즉시 검증합니다.
            </p>
          </div>

          <button
            id="btn-match-random"
            type="button"
            onClick={handleRandomMyNumbers}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>랜덤 추출</span>
          </button>
        </div>

        {/* Selected Balls */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/70 min-h-16">
          {myNumbers.map(num => (
            <LottoBall
              key={num}
              number={num}
              size="md"
              interactive
              onClick={() => handleToggleMyNumber(num)}
            />
          ))}
        </div>

        {/* Number Selector Grid */}
        <div className="grid grid-cols-9 sm:grid-cols-15 gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200">
          {Array.from({ length: 45 }, (_, i) => i + 1).map(num => {
            const isSelected = myNumbers.includes(num);
            return (
              <button
                key={num}
                id={`match-grid-ball-${num}`}
                type="button"
                onClick={() => handleToggleMyNumber(num)}
                className={`
                  h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all
                  ${isSelected ? 'bg-emerald-600 text-white font-black scale-105 shadow-xs' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'}
                `}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Match Stats Summary */}
        {historicalMatchResults && (
          <div className="pt-2 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 font-semibold">1등 (6개 일치)</span>
                <p className="text-lg font-black text-amber-600 mt-0.5">
                  {historicalMatchResults.rankCounts.rank1}회
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 font-semibold">2등 (5개+보너스)</span>
                <p className="text-lg font-black text-sky-600 mt-0.5">
                  {historicalMatchResults.rankCounts.rank2}회
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 font-semibold">3등 (5개 일치)</span>
                <p className="text-lg font-black text-emerald-600 mt-0.5">
                  {historicalMatchResults.rankCounts.rank3}회
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 font-semibold">4등 (4개 일치)</span>
                <p className="text-lg font-black text-slate-800 mt-0.5">
                  {historicalMatchResults.rankCounts.rank4}회
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 font-semibold">5등 (3개 일치)</span>
                <p className="text-lg font-black text-slate-800 mt-0.5">
                  {historicalMatchResults.rankCounts.rank5}회
                </p>
              </div>
              <div className="p-3 bg-slate-900 text-white rounded-xl text-center">
                <span className="text-[11px] text-slate-400 font-semibold">역대 획득 상금 합계</span>
                <p className="text-xs sm:text-sm font-black text-amber-300 mt-1">
                  {formatKRW(historicalMatchResults.totalPrize)}
                </p>
              </div>
            </div>

            {/* Match List */}
            {historicalMatchResults.matches.length > 0 && (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {historicalMatchResults.matches.slice(0, 15).map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">제 {m.drawNo}회</span>
                      <span className="text-slate-400 text-[11px]">({m.date})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-600">일치: {m.matchedNumbers.join(', ')}</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        m.rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        m.rank === 2 ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                        m.rank === 3 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {m.rank}등 당첨 ({formatKRW(m.prizeAmount)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. 회차별 상세 당첨번호 검색 및 조회 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Search & Draw List */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              회차별 당첨번호 목록
            </h3>
            <span className="text-[11px] text-slate-400">총 {ALL_HISTORICAL_DRAWS.length}회차</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="draw-search-input"
              type="text"
              placeholder="회차 번호 검색 (예: 1160, 1150)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {filteredDraws.map(draw => {
              const isSelected = selectedDraw.drawNo === draw.drawNo;
              return (
                <button
                  key={draw.drawNo}
                  id={`draw-item-${draw.drawNo}`}
                  type="button"
                  onClick={() => setSelectedDraw(draw)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">제 {draw.drawNo}회</span>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        {draw.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      {draw.numbers.map(num => (
                        <LottoBall key={num} number={num} size="xs" />
                      ))}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Draw Detail Showcase Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                추첨 결과 상세
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                제 {selectedDraw.drawNo}회 당첨 결과
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">추첨일: {selectedDraw.date}</p>
            </div>

            {onAnalyzeCombination && (
              <button
                id="btn-analyze-selected-draw"
                type="button"
                onClick={() => onAnalyzeCombination(selectedDraw.numbers)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>이 회차 조합 분석</span>
              </button>
            )}
          </div>

          {/* Large Draw Balls Showcase */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col items-center justify-center gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">당첨 번호 6개 + 보너스 1개</span>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {selectedDraw.numbers.map(num => (
                <LottoBall key={num} number={num} size="lg" />
              ))}
              <span className="text-lg font-black text-slate-400 px-1">+</span>
              <LottoBall number={selectedDraw.bonusNo} size="lg" isBonus />
            </div>
          </div>

          {/* Prize and Winners Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">1등 총 당첨금</span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {formatKRW(selectedDraw.firstPrizeAmount * selectedDraw.firstWinnerCount)}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">1등 당첨 게임 수</span>
              <p className="text-lg font-black text-amber-600 mt-1">
                {selectedDraw.firstWinnerCount} 게임
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">1인당 당첨 수령액</span>
              <p className="text-lg font-black text-emerald-600 mt-1">
                {formatKRW(selectedDraw.firstPrizeAmount)}
              </p>
            </div>
          </div>

          {/* Draw Quick Structure Notes */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">번호 총합:</span>
              <span className="font-bold text-slate-800">
                {selectedDraw.numbers.reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">홀짝 구성:</span>
              <span className="font-bold text-slate-800">
                홀수 {selectedDraw.numbers.filter(n => n % 2 === 1).length}개 : 짝수 {selectedDraw.numbers.filter(n => n % 2 === 0).length}개
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">고저 구성 (1~22 / 23~45):</span>
              <span className="font-bold text-slate-800">
                저번호 {selectedDraw.numbers.filter(n => n <= 22).length}개 : 고번호 {selectedDraw.numbers.filter(n => n > 22).length}개
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
