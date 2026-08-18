/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LottoGame } from './types';
import { Header } from './components/Header';
import { GenerateView } from './components/GenerateView';
import { StatisticsView } from './components/StatisticsView';
import { SimulationView } from './components/SimulationView';
import { HistoryView } from './components/HistoryView';
import { SavedLockerView } from './components/SavedLockerView';
import { AnalysisModal } from './components/AnalysisModal';
import { LATEST_DRAW } from './data/lottoHistory';
import { Github, ShieldCheck, Heart, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'lotto_simulator_saved_games_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'statistics' | 'simulation' | 'history' | 'saved'>('generate');
  const [savedGames, setSavedGames] = useState<LottoGame[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    // Default initial saved game
    return [
      {
        id: 'initial-sample-1',
        numbers: [3, 11, 19, 27, 34, 42],
        createdAt: '2025-02-15',
        mode: 'statistic',
        notes: '통계 기반 추천 조합',
        isSaved: true
      },
      {
        id: 'initial-sample-2',
        numbers: [7, 14, 21, 28, 35, 42],
        createdAt: '2025-02-15',
        mode: 'custom',
        notes: '7의 배수 패턴',
        isSaved: true
      }
    ];
  });

  const [analyzingNumbers, setAnalyzingNumbers] = useState<number[] | null>(null);

  // Sync saved games to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGames));
    } catch {
      // ignore
    }
  }, [savedGames]);

  const handleSaveOneGame = (game: LottoGame) => {
    if (savedGames.some(g => g.id === game.id)) return;
    setSavedGames(prev => [{ ...game, isSaved: true }, ...prev]);
  };

  const handleSaveMultipleGames = (games: LottoGame[]) => {
    const existingIds = new Set(savedGames.map(g => g.id));
    const newGames = games.filter(g => !existingIds.has(g.id)).map(g => ({ ...g, isSaved: true }));
    setSavedGames(prev => [...newGames, ...prev]);
  };

  const handleDeleteGame = (id: string) => {
    setSavedGames(prev => prev.filter(g => g.id !== id));
  };

  const handleClearAll = () => {
    setSavedGames([]);
  };

  const handleAddGame = (game: LottoGame) => {
    setSavedGames(prev => [game, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        latestDraw={LATEST_DRAW}
        savedCount={savedGames.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'generate' && (
          <GenerateView
            onSaveGame={handleSaveOneGame}
            onSaveMultipleGames={handleSaveMultipleGames}
            onAnalyzeCombination={nums => setAnalyzingNumbers(nums)}
          />
        )}

        {activeTab === 'statistics' && <StatisticsView />}

        {activeTab === 'simulation' && <SimulationView />}

        {activeTab === 'history' && (
          <HistoryView onAnalyzeCombination={nums => setAnalyzingNumbers(nums)} />
        )}

        {activeTab === 'saved' && (
          <SavedLockerView
            savedGames={savedGames}
            onDeleteGame={handleDeleteGame}
            onClearAll={handleClearAll}
            onAddGame={handleAddGame}
            onAnalyzeCombination={nums => setAnalyzingNumbers(nums)}
          />
        )}
      </main>

      {/* Combination Analysis Modal */}
      {analyzingNumbers && (
        <AnalysisModal
          numbers={analyzingNumbers}
          onClose={() => setAnalyzingNumbers(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>로또 6/45 시뮬레이터 & 통계 분석기</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              본 서비스는 수학적 시뮬레이션 및 데이터 통계 분석용이며, 실제 복권 당첨을 예측하거나 보장하지 않습니다.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              id="footer-github-link"
              href="https://github.com/whitekjm/lotto"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub 저장소 (whitekjm/lotto)</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
