import React from 'react';
import { LottoDraw } from '../types';
import { LottoBall } from './LottoBall';
import { Sparkles, Dices, BarChart3, Rocket, Search, Bookmark, Github, Award } from 'lucide-react';

interface HeaderProps {
  activeTab: 'generate' | 'statistics' | 'simulation' | 'history' | 'saved';
  onTabChange: (tab: 'generate' | 'statistics' | 'simulation' | 'history' | 'saved') => void;
  latestDraw: LottoDraw;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  latestDraw,
  savedCount
}) => {
  const navItems: Array<{
    key: 'generate' | 'statistics' | 'simulation' | 'history' | 'saved';
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    { key: 'generate', label: '번호 생성', icon: <Dices className="w-4 h-4" /> },
    { key: 'statistics', label: '통계 분석', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'simulation', label: '대량 시뮬레이션', icon: <Rocket className="w-4 h-4" /> },
    { key: 'history', label: '당첨조회 & 대조', icon: <Search className="w-4 h-4" /> },
    { key: 'saved', label: '번호 보관함', icon: <Bookmark className="w-4 h-4" />, badge: savedCount }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with title and latest draw summary */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 id="app-main-title" className="text-lg font-black text-slate-900 tracking-tight">
                    로또 6/45 시뮬레이터 & 통계 분석기
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    v2.5
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  과거 당첨 데이터 기반 다각도 통계 분석 및 대량 추첨 시뮬레이션
                </p>
              </div>
            </div>

            {/* GitHub repository quick button */}
            <a
              id="github-repo-link"
              href="https://github.com/whitekjm/lotto"
              target="_blank"
              rel="noopener noreferrer"
              className="flex md:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Latest draw quick capsule */}
          <div className="flex items-center justify-between md:justify-end gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                제 {latestDraw.drawNo}회
              </span>
              <span className="text-[11px] text-slate-400">({latestDraw.date})</span>
            </div>

            <div className="flex items-center gap-1">
              {latestDraw.numbers.map(num => (
                <LottoBall key={num} number={num} size="xs" />
              ))}
              <span className="text-xs text-slate-400 font-bold px-0.5">+</span>
              <LottoBall number={latestDraw.bonusNo} size="xs" isBonus />
            </div>

            <a
              id="github-repo-link-desktop"
              href="https://github.com/whitekjm/lotto"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 ml-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav id="main-navigation" className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none border-t border-slate-100">
          {navItems.map(item => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                id={`nav-tab-${item.key}`}
                type="button"
                onClick={() => onTabChange(item.key)}
                className={`
                  flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all
                  ${isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    id={`nav-badge-${item.key}`}
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
