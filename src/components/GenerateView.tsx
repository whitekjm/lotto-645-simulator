import React, { useState } from 'react';
import { LottoGame, FilterOptions, LottoDraw, GenerationMode } from '../types';
import { LottoBall } from './LottoBall';
import { generateLottoNumbers, formatKRW, evaluateDraw, calculateNumberStats } from '../lib/lottoUtils';
import { ALL_HISTORICAL_DRAWS, LATEST_DRAW } from '../data/lottoHistory';
import {
  Dices,
  Copy,
  Check,
  Bookmark,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  BarChart2,
  Trash2,
  Share2,
  HelpCircle,
  Flame,
  Shuffle
} from 'lucide-react';

interface GenerateViewProps {
  onSaveGame: (game: LottoGame) => void;
  onSaveMultipleGames: (games: LottoGame[]) => void;
  onAnalyzeCombination: (numbers: number[]) => void;
}

export const GenerateView: React.FC<GenerateViewProps> = ({
  onSaveGame,
  onSaveMultipleGames,
  onAnalyzeCombination
}) => {
  const [mode, setMode] = useState<GenerationMode>('random');
  const [gameCount, setGameCount] = useState<number>(5);
  const [games, setGames] = useState<LottoGame[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filter conditions
  const [includeNumbers, setIncludeNumbers] = useState<number[]>([]);
  const [excludeNumbers, setExcludeNumbers] = useState<number[]>([]);
  const [oddEvenRatio, setOddEvenRatio] = useState<FilterOptions['oddEvenRatio']>('all');
  const [sumRangeMin, setSumRangeMin] = useState<number>(100);
  const [sumRangeMax, setSumRangeMax] = useState<number>(175);
  const [maxConsecutive, setMaxConsecutive] = useState<number>(2);
  const [highLowRatio, setHighLowRatio] = useState<FilterOptions['highLowRatio']>('all');

  // Precomputed weights for statistics mode
  const stats = calculateNumberStats(ALL_HISTORICAL_DRAWS);
  const weightsMap = new Map<number, number>();
  stats.forEach(s => {
    weightsMap.set(s.number, s.count);
  });

  const handleGenerate = () => {
    const newGames: LottoGame[] = [];
    const filterOpts: Partial<FilterOptions> = {
      includeNumbers,
      excludeNumbers,
      oddEvenRatio,
      sumRange: [sumRangeMin, sumRangeMax],
      maxConsecutive,
      highLowRatio,
      sectionSpanMin: 3
    };

    for (let i = 0; i < gameCount; i++) {
      const nums = generateLottoNumbers(
        mode === 'custom' ? filterOpts : undefined,
        mode === 'statistic' ? weightsMap : undefined
      );
      newGames.push({
        id: `game-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        numbers: nums,
        createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        mode
      });
    }
    setGames(newGames);
  };

  const handleToggleNumberSelection = (num: number, target: 'include' | 'exclude') => {
    if (target === 'include') {
      if (includeNumbers.includes(num)) {
        setIncludeNumbers(includeNumbers.filter(n => n !== num));
      } else {
        if (includeNumbers.length >= 5) return;
        setIncludeNumbers([...includeNumbers, num]);
        setExcludeNumbers(excludeNumbers.filter(n => n !== num));
      }
    } else {
      if (excludeNumbers.includes(num)) {
        setExcludeNumbers(excludeNumbers.filter(n => n !== num));
      } else {
        if (excludeNumbers.length >= 35) return;
        setExcludeNumbers([...excludeNumbers, num]);
        setIncludeNumbers(includeNumbers.filter(n => n !== num));
      }
    }
  };

  const handleCopyOne = (game: LottoGame) => {
    const text = game.numbers.map(n => (n < 10 ? `0${n}` : `${n}`)).join(' ');
    navigator.clipboard.writeText(text);
    setCopiedId(game.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    if (games.length === 0) return;
    const text = games
      .map((g, idx) => `[게임 ${String.fromCharCode(65 + idx)}] ${g.numbers.map(n => (n < 10 ? `0${n}` : `${n}`)).join(' ')}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSaveAll = () => {
    if (games.length === 0) return;
    onSaveMultipleGames(games);
    setGames(games.map(g => ({ ...g, isSaved: true })));
  };

  return (
    <div className="space-y-6">
      {/* Mode & Config Card */}
      <div id="generate-control-card" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        {/* Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 id="generator-heading" className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Dices className="w-5 h-5 text-amber-500" />
              로또 6/45 번호 생성기
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              원하는 생성 모드와 게임 수를 선택하여 번호 조합을 추출합니다.
            </p>
          </div>

          {/* Mode Pill Buttons */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              id="mode-random-btn"
              type="button"
              onClick={() => setMode('random')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'random' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              완전 랜덤
            </button>
            <button
              id="mode-statistic-btn"
              type="button"
              onClick={() => setMode('statistic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'statistic' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              과거 통계 반영
            </button>
            <button
              id="mode-custom-btn"
              type="button"
              onClick={() => {
                setMode('custom');
                setShowFilters(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'custom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-500" />
              조건 필터
            </button>
          </div>
        </div>

        {/* Game Count Selector & Main CTA */}
        <div className="pt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 mr-1">게임 수:</span>
            {[1, 5, 10, 20, 50].map(cnt => (
              <button
                key={cnt}
                id={`game-count-btn-${cnt}`}
                type="button"
                onClick={() => setGameCount(cnt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gameCount === cnt
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cnt}게임
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {mode === 'custom' && (
              <button
                id="toggle-filter-panel-btn"
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                {showFilters ? '조건 닫기' : '조건 설정'}
              </button>
            )}

            <button
              id="btn-generate-numbers"
              type="button"
              onClick={handleGenerate}
              className="flex-1 md:flex-initial px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>번호 생성하기</span>
            </button>
          </div>
        </div>

        {/* Custom Filter Drawer Panel */}
        {mode === 'custom' && showFilters && (
          <div id="filter-conditions-panel" className="mt-5 pt-5 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Include & Exclude Numbers Selector */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-bold text-slate-800">
                  고정 포함 번호 (최대 5개) / 제외 번호 설정
                </span>
                <span className="text-slate-400">
                  초록색: 포함({includeNumbers.length}) · 빨간색: 제외({excludeNumbers.length})
                </span>
              </div>

              {/* 1~45 Number Selector Grid */}
              <div className="grid grid-cols-9 sm:grid-cols-15 gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {Array.from({ length: 45 }, (_, i) => i + 1).map(num => {
                  const isInc = includeNumbers.includes(num);
                  const isExc = excludeNumbers.includes(num);
                  return (
                    <button
                      key={num}
                      id={`num-selector-${num}`}
                      type="button"
                      onClick={e => {
                        if (e.shiftKey) {
                          handleToggleNumberSelection(num, 'exclude');
                        } else {
                          if (isInc) {
                            handleToggleNumberSelection(num, 'include');
                          } else if (isExc) {
                            handleToggleNumberSelection(num, 'exclude');
                          } else {
                            handleToggleNumberSelection(num, 'include');
                          }
                        }
                      }}
                      onContextMenu={e => {
                        e.preventDefault();
                        handleToggleNumberSelection(num, 'exclude');
                      }}
                      className={`
                        h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all
                        ${isInc ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 font-extrabold' : ''}
                        ${isExc ? 'bg-rose-500 text-white line-through opacity-70' : ''}
                        ${!isInc && !isExc ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80' : ''}
                      `}
                      title="클릭: 포함 선택/해제 | 우클릭/Shift+클릭: 제외"
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                💡 팁: 번호를 일반 클릭하면 <b>포함(초록)</b>, 우클릭 또는 Shift+클릭하면 <b>제외(빨강)</b>됩니다.
              </p>
            </div>

            {/* Sub Filters: Odd/Even, Sum, Consecutive */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">홀짝 비율</label>
                <select
                  id="filter-odd-even-select"
                  value={oddEvenRatio}
                  onChange={e => setOddEvenRatio(e.target.value as FilterOptions['oddEvenRatio'])}
                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="all">전체 (제한 없음)</option>
                  <option value="3:3">홀수 3 : 짝수 3 (가장 빈번)</option>
                  <option value="4:2">홀수 4 : 짝수 2</option>
                  <option value="2:4">홀수 2 : 짝수 4</option>
                  <option value="5:1">홀수 5 : 짝수 1</option>
                  <option value="1:5">홀수 1 : 짝수 5</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  합계 구간: {sumRangeMin} ~ {sumRangeMax}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="filter-sum-min-range"
                    type="range"
                    min="50"
                    max="150"
                    step="5"
                    value={sumRangeMin}
                    onChange={e => setSumRangeMin(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    id="filter-sum-max-range"
                    type="range"
                    min="150"
                    max="220"
                    step="5"
                    value={sumRangeMax}
                    onChange={e => setSumRangeMax(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">연속번호 최대 허용</label>
                <select
                  id="filter-consecutive-select"
                  value={maxConsecutive}
                  onChange={e => setMaxConsecutive(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value={1}>연속번호 없음 (단독 번호만)</option>
                  <option value={2}>최대 2연속까지 허용 (예: 11, 12)</option>
                  <option value={3}>최대 3연속까지 허용 (예: 11, 12, 13)</option>
                  <option value={6}>제한 없음</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Games Results List */}
      {games.length > 0 ? (
        <div id="generated-games-section" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">생성 결과 ({games.length}게임)</span>
              <span className="text-[11px] text-slate-400">
                구매 예상 금액: {formatKRW(games.length * 1000)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-all-games"
                type="button"
                onClick={handleCopyAll}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? '복사 완료!' : '전체 복사'}</span>
              </button>

              <button
                id="btn-save-all-games"
                type="button"
                onClick={handleSaveAll}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>보관함에 전체 저장</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {games.map((game, index) => {
              const letter = String.fromCharCode(65 + (index % 26));
              const matchWithLatest = evaluateDraw(game.numbers, LATEST_DRAW);

              return (
                <div
                  key={game.id}
                  id={`game-card-${game.id}`}
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-800 text-xs font-black flex items-center justify-center">
                        {letter}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {game.mode === 'random' ? '랜덤' : game.mode === 'statistic' ? '통계' : '조건필터'}
                      </span>
                    </div>

                    {matchWithLatest.rank > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        최근 {LATEST_DRAW.drawNo}회 대조: {matchWithLatest.rank}등 당첨!
                      </span>
                    )}
                  </div>

                  {/* 6 Lotto Balls */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1">
                    {game.numbers.map(num => (
                      <LottoBall key={num} number={num} size="md" />
                    ))}
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      id={`btn-analyze-${game.id}`}
                      type="button"
                      onClick={() => onAnalyzeCombination(game.numbers)}
                      className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 transition-colors"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-sky-500" />
                      <span>조합 정밀 분석</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-copy-${game.id}`}
                        type="button"
                        onClick={() => handleCopyOne(game)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        title="번호 복사"
                      >
                        {copiedId === game.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        id={`btn-save-${game.id}`}
                        type="button"
                        onClick={() => {
                          onSaveGame(game);
                          setGames(games.map(g => (g.id === game.id ? { ...g, isSaved: true } : g)));
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          game.isSaved
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                        title="보관함 저장"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-10 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Dices className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">아직 생성된 번호가 없습니다</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              상단의 <b>[번호 생성하기]</b> 버튼을 누르면 설정된 규칙에 맞춰 즉시 6/45 로또 번호가 추출됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
