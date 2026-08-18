import React, { useState, useMemo } from 'react';
import { LottoDraw, NumberStat } from '../types';
import { LottoBall } from './LottoBall';
import { calculateNumberStats, getBallColorClass } from '../lib/lottoUtils';
import { ALL_HISTORICAL_DRAWS } from '../data/lottoHistory';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  Flame,
  Snowflake,
  PieChart as PieIcon,
  TrendingUp,
  AlertCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

interface StatisticsViewProps {
  onAnalyzeNumber?: (num: number) => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = () => {
  const [range, setRange] = useState<'10' | '30' | '50' | '100' | 'all'>('100');
  const [sortBy, setSortBy] = useState<'number' | 'count' | 'unappeared'>('count');
  const [activeSubTab, setActiveSubTab] = useState<'frequency' | 'oddeven' | 'sections' | 'sum'>('frequency');

  // Filter draws based on range
  const targetDraws = useMemo(() => {
    if (range === 'all') return ALL_HISTORICAL_DRAWS;
    const limit = parseInt(range, 10);
    return ALL_HISTORICAL_DRAWS.slice(0, limit);
  }, [range]);

  const stats = useMemo(() => {
    return calculateNumberStats(targetDraws);
  }, [targetDraws]);

  // Top Hot (most frequent) & Cold (longest unappeared)
  const hotNumbers = useMemo(() => {
    return [...stats].sort((a, b) => b.count - a.count).slice(0, 7);
  }, [stats]);

  const coldNumbers = useMemo(() => {
    return [...stats].sort((a, b) => b.lastDrawnAgo - a.lastDrawnAgo).slice(0, 7);
  }, [stats]);

  // Sorted list for table / chart
  const sortedStats = useMemo(() => {
    const arr = [...stats];
    if (sortBy === 'number') {
      return arr.sort((a, b) => a.number - b.number);
    }
    if (sortBy === 'count') {
      return arr.sort((a, b) => b.count - a.count);
    }
    // unappeared
    return arr.sort((a, b) => b.lastDrawnAgo - a.lastDrawnAgo);
  }, [stats, sortBy]);

  // Odd/Even aggregated data
  const oddEvenData = useMemo(() => {
    const counts: { [ratio: string]: number } = {
      '3:3': 0,
      '4:2': 0,
      '2:4': 0,
      '5:1': 0,
      '1:5': 0,
      '6:0': 0,
      '0:6': 0
    };
    targetDraws.forEach(d => {
      const odd = d.numbers.filter(n => n % 2 === 1).length;
      const key = `${odd}:${6 - odd}`;
      if (counts[key] !== undefined) counts[key]++;
      else counts[key] = 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: `홀 ${name.split(':')[0]} : 짝 ${name.split(':')[1]}`,
      value,
      rate: Number(((value / targetDraws.length) * 100).toFixed(1))
    }));
  }, [targetDraws]);

  // Section aggregated data
  const sectionData = useMemo(() => {
    const counts = { '1~10 (노랑)': 0, '11~20 (파랑)': 0, '21~30 (빨강)': 0, '31~40 (회색)': 0, '41~45 (초록)': 0 };
    targetDraws.forEach(d => {
      d.numbers.forEach(n => {
        if (n <= 10) counts['1~10 (노랑)']++;
        else if (n <= 20) counts['11~20 (파랑)']++;
        else if (n <= 30) counts['21~30 (빨강)']++;
        else if (n <= 40) counts['31~40 (회색)']++;
        else counts['41~45 (초록)']++;
      });
    });

    const totalBalls = targetDraws.length * 6;
    return Object.entries(counts).map(([section, count], idx) => ({
      section,
      count,
      percent: Number(((count / totalBalls) * 100).toFixed(1)),
      color: ['#fbc400', '#0284c7', '#e11d48', '#475569', '#10b981'][idx]
    }));
  }, [targetDraws]);

  // Sum distribution
  const sumData = useMemo(() => {
    const ranges = {
      '50~90': 0,
      '91~120': 0,
      '121~150': 0,
      '151~180': 0,
      '181~220': 0
    };
    targetDraws.forEach(d => {
      const sum = d.numbers.reduce((a, b) => a + b, 0);
      if (sum <= 90) ranges['50~90']++;
      else if (sum <= 120) ranges['91~120']++;
      else if (sum <= 150) ranges['121~150']++;
      else if (sum <= 180) ranges['151~180']++;
      else ranges['181~220']++;
    });

    return Object.entries(ranges).map(([rangeLabel, count]) => ({
      rangeLabel,
      count,
      percent: Number(((count / targetDraws.length) * 100).toFixed(1))
    }));
  }, [targetDraws]);

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 id="statistics-title" className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-500" />
            로또 6/45 통계 분석실
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            역대 당첨 데이터 ({targetDraws.length}회차 기준) 기반의 출현 빈도 및 구조 통계
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <span className="text-xs font-bold text-slate-500 px-2 hidden sm:inline">분석 범위:</span>
          {(['10', '30', '50', '100', 'all'] as const).map(r => (
            <button
              key={r}
              id={`btn-stat-range-${r}`}
              type="button"
              onClick={() => setRange(r)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {r === 'all' ? '전체 회차' : `최근 ${r}회`}
            </button>
          ))}
        </div>
      </div>

      {/* Hot & Cold Numbers Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hot Numbers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-slate-800">자주 출현한 번호 Top 7 (Hot)</h3>
            </div>
            <span className="text-[11px] text-slate-400">기준: 최근 {targetDraws.length}회</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-rose-50/40 rounded-xl border border-rose-100">
            {hotNumbers.map(item => (
              <div key={item.number} className="flex flex-col items-center gap-1">
                <LottoBall number={item.number} size="sm" />
                <span className="text-[11px] font-bold text-rose-700">{item.count}회</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Numbers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                <Snowflake className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-slate-800">장기 미출현 번호 Top 7 (Cold)</h3>
            </div>
            <span className="text-[11px] text-slate-400">연속 미등장 회차</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-sky-50/40 rounded-xl border border-sky-100">
            {coldNumbers.map(item => (
              <div key={item.number} className="flex flex-col items-center gap-1">
                <LottoBall number={item.number} size="sm" />
                <span className="text-[11px] font-bold text-sky-700">
                  {item.lastDrawnAgo}회 전
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'frequency', label: '번호별 출현 빈도 차트', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { key: 'oddeven', label: '홀짝 비율 분포', icon: <PieIcon className="w-3.5 h-3.5" /> },
          { key: 'sections', label: '구간별(10번대) 분포', icon: <Layers className="w-3.5 h-3.5" /> },
          { key: 'sum', label: '번호 합계 구간 분포', icon: <TrendingUp className="w-3.5 h-3.5" /> }
        ].map(tab => (
          <button
            key={tab.key}
            id={`subtab-${tab.key}`}
            type="button"
            onClick={() => setActiveSubTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === tab.key
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Frequency Chart & Full Table */}
      {activeSubTab === 'frequency' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-xs font-black text-slate-800">
                1~45번 전체 번호별 당첨 출현 횟수 차트
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">정렬 기준:</span>
                <select
                  id="stat-sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                >
                  <option value="count">출현 횟수 많은 순</option>
                  <option value="number">번호 순 (1~45)</option>
                  <option value="unappeared">오래 미출현한 순</option>
                </select>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedStats.slice(0, 30)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="number"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={0}
                    tickFormatter={v => `${v}번`}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as NumberStat;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl space-y-1">
                            <p className="font-bold">{data.number}번</p>
                            <p className="text-amber-300">출현 횟수: {data.count}회</p>
                            <p className="text-slate-400">보너스 번호: {data.bonusCount}회</p>
                            <p className="text-sky-300">최근 출현: {data.lastDrawnAgo}회차 전</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {sortedStats.slice(0, 30).map(entry => {
                      const colorMap = getBallColorClass(entry.number);
                      let hex = '#fbc400';
                      if (entry.number <= 10) hex = '#f59e0b';
                      else if (entry.number <= 20) hex = '#0284c7';
                      else if (entry.number <= 30) hex = '#e11d48';
                      else if (entry.number <= 40) hex = '#475569';
                      else hex = '#10b981';
                      return <Cell key={`cell-${entry.number}`} fill={hex} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid View of all 45 balls with stats */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-black text-slate-800 mb-3">1~45번 종합 출현 현황표</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-9 gap-2">
              {stats.map(item => (
                <div
                  key={item.number}
                  className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/70 flex flex-col items-center gap-1 transition-colors"
                >
                  <LottoBall number={item.number} size="sm" />
                  <div className="text-center">
                    <span className="text-[11px] font-bold text-slate-800 block">{item.count}회</span>
                    <span className="text-[9px] text-slate-400 block">{item.lastDrawnAgo}회 전</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Odd/Even Distribution */}
      {activeSubTab === 'oddeven' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-black text-slate-800 mb-3">홀수 : 짝수 비율 통계</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={oddEvenData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {oddEvenData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg text-xs">
                            <p className="font-bold">{d.name}</p>
                            <p>{d.value}회 ({d.rate}%)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-black text-slate-800 mb-3">홀짝 구성 비율 상세</h4>
              <div className="space-y-2">
                {oddEvenData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="font-bold text-slate-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{item.value}회</span>
                      <span className="font-extrabold text-slate-900 w-10 text-right">{item.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              💡 로또 6/45 역대 통계상 <b>홀수 3 : 짝수 3</b> 또는 <b>4:2 / 2:4</b> 비율이 전체의 약 80% 이상을 차지합니다.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Section Distribution */}
      {activeSubTab === 'sections' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-xs font-black text-slate-800">10번대 구간별 출현 비율</h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {sectionData.map(sec => (
              <div
                key={sec.section}
                className="p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center gap-1"
                style={{ backgroundColor: `${sec.color}10` }}
              >
                <span className="text-xs font-bold text-slate-700">{sec.section}</span>
                <span className="text-xl font-black mt-1" style={{ color: sec.color }}>
                  {sec.percent}%
                </span>
                <span className="text-[11px] text-slate-400">{sec.count}개 공 출현</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Sum Distribution */}
      {activeSubTab === 'sum' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-xs font-black text-slate-800">6개 번호 총합 구간별 분포</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sumData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="rangeLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded-lg text-xs">
                          <p className="font-bold">합계 {d.rangeLabel}</p>
                          <p>{d.count}회 ({d.percent}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Strict Disclaimer Card */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
        <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-900">통계 분석 안내 및 확률 원칙</p>
          <p>
            과거 당첨 번호의 출현 빈도나 통계 패턴은 독립 시행 난수 추첨의 결과물일 뿐이며, 다음 회차의 당첨 번호를 예측하거나 확률을 높여주지 않습니다.
            한국 로또 6/45의 모든 6개 번호 조합의 1등 당첨 확률은 <b>1 / 8,145,060 (약 0.00001228%)</b>로 완전히 동일합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
