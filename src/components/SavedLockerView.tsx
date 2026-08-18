import React, { useState } from 'react';
import { LottoGame } from '../types';
import { LottoBall } from './LottoBall';
import { evaluateDraw, generateLottoNumbers, formatKRW } from '../lib/lottoUtils';
import { LATEST_DRAW } from '../data/lottoHistory';
import {
  Bookmark,
  Trash2,
  Copy,
  Check,
  Download,
  Plus,
  BarChart2,
  CheckCircle2,
  Sparkles,
  Calendar,
  Share2
} from 'lucide-react';

interface SavedLockerViewProps {
  savedGames: LottoGame[];
  onDeleteGame: (id: string) => void;
  onClearAll: () => void;
  onAddGame: (game: LottoGame) => void;
  onAnalyzeCombination: (numbers: number[]) => void;
}

export const SavedLockerView: React.FC<SavedLockerViewProps> = ({
  savedGames,
  onDeleteGame,
  onClearAll,
  onAddGame,
  onAnalyzeCombination
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [manualNumbers, setManualNumbers] = useState<number[]>([]);
  const [customNote, setCustomNote] = useState<string>('');

  const handleToggleManualBall = (num: number) => {
    if (manualNumbers.includes(num)) {
      setManualNumbers(manualNumbers.filter(n => n !== num));
    } else {
      if (manualNumbers.length >= 6) return;
      setManualNumbers([...manualNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleSaveManualGame = () => {
    if (manualNumbers.length !== 6) return;
    onAddGame({
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      numbers: manualNumbers,
      createdAt: new Date().toLocaleDateString('ko-KR'),
      mode: 'custom',
      notes: customNote.trim() || undefined,
      isSaved: true
    });
    setManualNumbers([]);
    setCustomNote('');
    setShowAddForm(false);
  };

  const handleCopyOne = (game: LottoGame) => {
    const text = game.numbers.map(n => (n < 10 ? `0${n}` : `${n}`)).join(' ');
    navigator.clipboard.writeText(text);
    setCopiedId(game.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    if (savedGames.length === 0) return;
    const text = savedGames
      .map((g, idx) => `[${idx + 1}] ${g.numbers.map(n => (n < 10 ? `0${n}` : `${n}`)).join(' ')}${g.notes ? ` (${g.notes})` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (savedGames.length === 0) return;
    const text = [
      '=== 로또 6/45 보관함 저장 번호 목록 ===',
      `생성 일시: ${new Date().toLocaleString('ko-KR')}`,
      `총 ${savedGames.length}게임`,
      '',
      ...savedGames.map(
        (g, idx) =>
          `[게임 ${idx + 1}] ${g.numbers.map(n => (n < 10 ? `0${n}` : `${n}`)).join(' ')} ${
            g.notes ? `| 메모: ${g.notes}` : ''
          }`
      ),
      '',
      '* 본 번호는 시뮬레이션 및 통계 참고용입니다.'
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lotto-saved-numbers-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="saved-locker-heading" className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            나만의 번호 보관함
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            생성했거나 직접 보관한 로또 조합을 관리하고 최근 회차와 대조합니다. (총 {savedGames.length}개)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-open-manual-add"
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? '입력 닫기' : '직접 번호 등록'}</span>
          </button>

          {savedGames.length > 0 && (
            <>
              <button
                id="btn-copy-all-saved"
                type="button"
                onClick={handleCopyAll}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? '복사됨!' : '전체 복사'}</span>
              </button>

              <button
                id="btn-download-txt"
                type="button"
                onClick={handleDownloadTxt}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="텍스트 파일로 다운로드"
              >
                <Download className="w-3.5 h-3.5" />
                <span>내보내기</span>
              </button>

              <button
                id="btn-clear-all-saved"
                type="button"
                onClick={() => {
                  if (window.confirm('보관함의 모든 번호를 삭제하시겠습니까?')) {
                    onClearAll();
                  }
                }}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors"
                title="전체 비우기"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Manual Add Form Drawer */}
      {showAddForm && (
        <div id="manual-add-form" className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">직접 6개 번호 선택하여 보관함에 추가</h3>
            <span className="text-xs text-slate-400">선택됨: {manualNumbers.length}/6</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-center gap-2 min-h-14">
            {manualNumbers.length > 0 ? (
              manualNumbers.map(n => (
                <LottoBall key={n} number={n} size="md" interactive onClick={() => handleToggleManualBall(n)} />
              ))
            ) : (
              <span className="text-xs text-slate-400">아래 1~45 번호판에서 6개를 선택하세요</span>
            )}
          </div>

          <div className="grid grid-cols-9 sm:grid-cols-15 gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200">
            {Array.from({ length: 45 }, (_, i) => i + 1).map(num => {
              const isSelected = manualNumbers.includes(num);
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleToggleManualBall(num)}
                  className={`
                    h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all
                    ${isSelected ? 'bg-amber-500 text-white font-black scale-105 shadow-xs' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'}
                  `}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <input
              id="manual-note-input"
              type="text"
              placeholder="메모를 입력하세요 (예: 기념일 번호, 꿈에서 본 번호)"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              className="w-full sm:flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
            <button
              id="btn-confirm-manual-save"
              type="button"
              disabled={manualNumbers.length !== 6}
              onClick={handleSaveManualGame}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                manualNumbers.length === 6
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              보관함 저장
            </button>
          </div>
        </div>
      )}

      {/* Saved Games List */}
      {savedGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {savedGames.map((game, idx) => {
            const matchWithLatest = evaluateDraw(game.numbers, LATEST_DRAW);

            return (
              <div
                key={game.id}
                id={`saved-card-${game.id}`}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 text-xs font-black flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    {game.notes ? (
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
                        {game.notes}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">{game.createdAt}</span>
                    )}
                  </div>

                  {matchWithLatest.rank > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      최근 {LATEST_DRAW.drawNo}회: {matchWithLatest.rank}등 당첨!
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      최근 {LATEST_DRAW.drawNo}회 대조: 낙첨
                    </span>
                  )}
                </div>

                {/* 6 Balls */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1">
                  {game.numbers.map(num => (
                    <LottoBall key={num} number={num} size="md" />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    id={`btn-saved-analyze-${game.id}`}
                    type="button"
                    onClick={() => onAnalyzeCombination(game.numbers)}
                    className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 transition-colors"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-sky-500" />
                    <span>조합 분석</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      id={`btn-saved-copy-${game.id}`}
                      type="button"
                      onClick={() => handleCopyOne(game)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      title="복사"
                    >
                      {copiedId === game.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      id={`btn-saved-delete-${game.id}`}
                      type="button"
                      onClick={() => onDeleteGame(game.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">보관된 로또 번호가 없습니다</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              [번호 생성] 탭에서 마음에 드는 조합을 저장하거나, 상단의 <b>[직접 번호 등록]</b> 버튼으로 번호를 등록해보세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
