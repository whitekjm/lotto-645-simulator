import React from 'react';
import { LottoBall } from './LottoBall';
import { analyzeCombination, formatKRW } from '../lib/lottoUtils';
import { X, Sparkles, AlertCircle, History, CheckCircle2, BarChart2 } from 'lucide-react';

interface AnalysisModalProps {
  numbers: number[];
  onClose: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ numbers, onClose }) => {
  const analysis = analyzeCombination(numbers);

  return (
    <div
      id="analysis-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="analysis-modal-content"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="analysis-modal-title" className="text-lg font-bold text-slate-800">
                번호 조합 정밀 분석
              </h3>
              <p className="text-xs text-slate-500">6개 번호의 수학적 구조 및 역대 당첨 이력</p>
            </div>
          </div>
          <button
            id="btn-close-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Balls Display */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">분석 대상 번호</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {numbers.map(num => (
              <LottoBall key={num} number={num} size="md" />
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">총합 (Sum)</p>
            <p className="text-xl font-black text-slate-800 mt-1">{analysis.sum}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">권장: 100 ~ 175</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">홀수 : 짝수</p>
            <p className="text-xl font-black text-slate-800 mt-1">
              {analysis.oddCount} : {analysis.evenCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">황금비율 3:3 / 4:2</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">저번호 : 고번호</p>
            <p className="text-xl font-black text-slate-800 mt-1">
              {analysis.lowCount} : {analysis.highCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">1~22(저) / 23~45(고)</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">산술적 복잡도 (AC)</p>
            <p className="text-xl font-black text-slate-800 mt-1">{analysis.acValue}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">7 이상 권장 (복잡도)</p>
          </div>
        </div>

        {/* Section & Consecutive Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">10번대 구간별 분포</h4>
            <div className="space-y-1.5">
              {Object.entries(analysis.sectionCounts).map(([section, count]) => (
                <div key={section} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{section} 구간</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-sky-500 h-2 rounded-full"
                        style={{ width: `${(count / 6) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-700 w-4 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">연속번호 및 끝수 분석</h4>
              <div className="text-xs space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">연속번호 쌍:</span>
                  <span className="font-semibold text-slate-800">
                    {analysis.consecutivePairs.length > 0
                      ? analysis.consecutivePairs.map(p => `[${p[0]}, ${p[1]}]`).join(', ')
                      : '없음 (0쌍)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">끝수 (Ending Digits):</span>
                  <span className="font-semibold text-slate-800">
                    {analysis.endingDigits.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">끝수 유일 개수:</span>
                  <span className="font-semibold text-slate-800">
                    {new Set(analysis.endingDigits).size}가지 (분산도 양호)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 bg-amber-50 border border-amber-200/60 rounded-lg text-[11px] text-amber-800 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                모든 6개 번호 조합의 실제 1등 당첨 확률은 1/8,145,060로 정확히 같습니다. 통계 지표는 참고용입니다.
              </span>
            </div>
          </div>
        </div>

        {/* Historical Matching Section */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              역대 실제 로또 추첨 일치 이력 (최근 순)
            </h4>
            <span className="text-xs text-slate-400">
              총 {analysis.historicalMatches.length}회 당첨 기록 (3등 이상)
            </span>
          </div>

          {analysis.historicalMatches.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {analysis.historicalMatches.map((match, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">제 {match.drawNo}회</span>
                    <span className="text-slate-400 text-[11px]">({match.date})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">일치 {match.matchCount}개{match.bonusMatch ? ' + 보너스' : ''}</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {match.rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-dashed border-slate-200">
              <p>역대 추첨 중 3등(5개 일치) 이상 일치한 이력이 아직 없는 신선한 조합입니다.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            id="btn-modal-confirm"
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            확인 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
