import React, { useState } from 'react';
import { SimulationResult } from '../types';
import { LottoBall } from './LottoBall';
import { runSimulation, formatKRW, generateLottoNumbers } from '../lib/lottoUtils';
import confetti from 'canvas-confetti';
import {
  Rocket,
  Dices,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Award,
  AlertTriangle,
  Play,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const SimulationView: React.FC = () => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([3, 11, 19, 27, 34, 42]);
  const [simCount, setSimCount] = useState<number>(10000);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleToggleBall = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      if (selectedNumbers.length >= 6) return;
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleRandomize = () => {
    const nums = generateLottoNumbers();
    setSelectedNumbers(nums);
  };

  const handleRunSimulation = () => {
    if (selectedNumbers.length !== 6) return;
    setIsRunning(true);

    // Let the UI breathe and show animated loader
    setTimeout(() => {
      const res = runSimulation(selectedNumbers, simCount);
      setResult(res);
      setIsRunning(false);

      if (res.rankCounts.rank1 > 0 || res.rankCounts.rank2 > 0) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Configuration Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 id="simulation-heading" className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-amber-500" />
              대량 추첨 시뮬레이터 (Monte Carlo)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              지정한 6개 번호로 수만 번의 실제 로또 추첨을 가상 실행하여 당첨 확률과 누적 손익을 체감합니다.
            </p>
          </div>

          <button
            id="btn-sim-randomize"
            type="button"
            onClick={handleRandomize}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>랜덤 6개 선택</span>
          </button>
        </div>

        {/* Selected Number Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">시뮬레이션 대상 번호 ({selectedNumbers.length}/6)</span>
            <span className="text-slate-400">아래 번호판을 클릭하여 변경할 수 있습니다.</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-wrap items-center justify-center gap-2 min-h-16">
            {selectedNumbers.length > 0 ? (
              selectedNumbers.map(num => (
                <LottoBall
                  key={num}
                  number={num}
                  size="md"
                  interactive
                  onClick={() => handleToggleBall(num)}
                />
              ))
            ) : (
              <span className="text-xs text-slate-400">6개 번호를 선택해주세요</span>
            )}
          </div>
        </div>

        {/* Number Selector Grid (Compact) */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-9 sm:grid-cols-15 gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200">
            {Array.from({ length: 45 }, (_, i) => i + 1).map(num => {
              const isSelected = selectedNumbers.includes(num);
              return (
                <button
                  key={num}
                  id={`sim-num-ball-${num}`}
                  type="button"
                  onClick={() => handleToggleBall(num)}
                  className={`
                    h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all
                    ${isSelected ? 'bg-slate-900 text-white font-black scale-105 shadow-xs' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'}
                  `}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Iteration Count & Run Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 mr-1">시뮬레이션 횟수:</span>
            {[100, 1000, 10000, 50000, 100000].map(cnt => (
              <button
                key={cnt}
                id={`btn-sim-count-${cnt}`}
                type="button"
                onClick={() => setSimCount(cnt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  simCount === cnt
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cnt >= 10000 ? `${cnt / 10000}만회` : `${cnt.toLocaleString()}회`}
              </button>
            ))}
          </div>

          <button
            id="btn-run-simulation"
            type="button"
            disabled={selectedNumbers.length !== 6 || isRunning}
            onClick={handleRunSimulation}
            className={`
              px-6 py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all
              ${selectedNumbers.length === 6 && !isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 active:scale-98 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>시뮬레이션 연산 중...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>시뮬레이션 시작 ({simCount.toLocaleString()}회)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulation Results Section */}
      {result && (
        <div id="simulation-results-section" className="space-y-4 animate-in fade-in-50 duration-300">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">총 구매 금액</span>
              <p className="text-lg sm:text-xl font-black text-slate-800 mt-1">
                {formatKRW(result.totalCost)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{result.totalGames.toLocaleString()}게임 (1장 1,000원)</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">총 당첨금</span>
              <p className="text-lg sm:text-xl font-black text-emerald-600 mt-1">
                {formatKRW(result.totalWon)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                당첨 횟수: {(result.totalGames - result.rankCounts.miss).toLocaleString()}회
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">순손익</span>
              <p
                className={`text-lg sm:text-xl font-black mt-1 ${
                  result.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {result.netProfit >= 0 ? '+' : ''}
                {formatKRW(result.netProfit)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {result.netProfit >= 0 ? '수익 실현' : '원금 손실'}
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">수익률 (ROI)</span>
              <div className="flex items-center gap-1 mt-1">
                {result.roi >= 100 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                )}
                <p
                  className={`text-lg sm:text-xl font-black ${
                    result.roi >= 100 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {result.roi}%
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">이론상 기댓값: 약 50%</p>
            </div>
          </div>

          {/* Detailed Rank Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-black text-slate-800 mb-3">등수별 상세 당첨 결과표</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold">등수</th>
                    <th className="p-3 font-bold">조건</th>
                    <th className="p-3 font-bold text-right">이론상 확률</th>
                    <th className="p-3 font-bold text-right">당첨 횟수</th>
                    <th className="p-3 font-bold text-right">실제 출현율</th>
                    <th className="p-3 font-bold text-right">상금 합계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className={result.rankCounts.rank1 > 0 ? 'bg-amber-50/70 font-bold' : ''}>
                    <td className="p-3 font-bold text-amber-600">1등</td>
                    <td className="p-3">6개 일치</td>
                    <td className="p-3 text-right text-slate-400">1 / 8,145,060</td>
                    <td className="p-3 text-right font-bold">{result.rankCounts.rank1}회</td>
                    <td className="p-3 text-right">
                      {((result.rankCounts.rank1 / result.totalGames) * 100).toFixed(5)}%
                    </td>
                    <td className="p-3 text-right font-bold">
                      {formatKRW(result.rankCounts.rank1 * result.rankPrizes.rank1)}
                    </td>
                  </tr>

                  <tr className={result.rankCounts.rank2 > 0 ? 'bg-sky-50/70 font-bold' : ''}>
                    <td className="p-3 font-bold text-sky-600">2등</td>
                    <td className="p-3">5개 일치 + 보너스</td>
                    <td className="p-3 text-right text-slate-400">1 / 1,357,510</td>
                    <td className="p-3 text-right font-bold">{result.rankCounts.rank2}회</td>
                    <td className="p-3 text-right">
                      {((result.rankCounts.rank2 / result.totalGames) * 100).toFixed(5)}%
                    </td>
                    <td className="p-3 text-right font-bold">
                      {formatKRW(result.rankCounts.rank2 * result.rankPrizes.rank2)}
                    </td>
                  </tr>

                  <tr className={result.rankCounts.rank3 > 0 ? 'bg-emerald-50/70 font-bold' : ''}>
                    <td className="p-3 font-bold text-emerald-600">3등</td>
                    <td className="p-3">5개 일치</td>
                    <td className="p-3 text-right text-slate-400">1 / 35,724</td>
                    <td className="p-3 text-right font-bold">{result.rankCounts.rank3}회</td>
                    <td className="p-3 text-right">
                      {((result.rankCounts.rank3 / result.totalGames) * 100).toFixed(4)}%
                    </td>
                    <td className="p-3 text-right font-bold">
                      {formatKRW(result.rankCounts.rank3 * result.rankPrizes.rank3)}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-800">4등</td>
                    <td className="p-3">4개 일치 (5만원)</td>
                    <td className="p-3 text-right text-slate-400">1 / 733</td>
                    <td className="p-3 text-right font-bold">{result.rankCounts.rank4}회</td>
                    <td className="p-3 text-right">
                      {((result.rankCounts.rank4 / result.totalGames) * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right font-bold">
                      {formatKRW(result.rankCounts.rank4 * result.rankPrizes.rank4)}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-slate-800">5등</td>
                    <td className="p-3">3개 일치 (5천원)</td>
                    <td className="p-3 text-right text-slate-400">1 / 45</td>
                    <td className="p-3 text-right font-bold">{result.rankCounts.rank5}회</td>
                    <td className="p-3 text-right">
                      {((result.rankCounts.rank5 / result.totalGames) * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right font-bold">
                      {formatKRW(result.rankCounts.rank5 * result.rankPrizes.rank5)}
                    </td>
                  </tr>

                  <tr className="bg-slate-50/50 text-slate-500">
                    <td className="p-3 font-bold text-slate-500">낙첨 (꽝)</td>
                    <td className="p-3">2개 이하 일치</td>
                    <td className="p-3 text-right">약 97.6%</td>
                    <td className="p-3 text-right font-bold">{result.rankCounts.miss.toLocaleString()}회</td>
                    <td className="p-3 text-right">
                      {((result.rankCounts.miss / result.totalGames) * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right">0원</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Educational Insight Callout */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
            <div className="p-2 bg-sky-100 text-sky-800 rounded-xl shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">대수의 법칙과 로또의 수학적 기대값</p>
              <p>
                시뮬레이션 횟수가 수만 회 이상으로 커질수록 총 당첨금은 복권 판매 대금 중 상금 배분율인 <b>약 50% 수준의 환급률</b>로 수렴하게 됩니다.
                즉, 장기적으로 복권 구매는 수학적으로 구매액의 약 절반이 손실되는 구조임을 시뮬레이션을 통해 직접 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
