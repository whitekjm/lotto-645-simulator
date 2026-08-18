import React from 'react';
import { getBallColorClass } from '../lib/lottoUtils';

interface LottoBallProps {
  number: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isBonus?: boolean;
  isMatched?: boolean;
  isDimmed?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export const LottoBall: React.FC<LottoBallProps> = ({
  number,
  size = 'md',
  isBonus = false,
  isMatched,
  isDimmed = false,
  interactive = false,
  onClick,
  className = '',
  id
}) => {
  const color = getBallColorClass(number);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs font-bold',
    sm: 'w-8 h-8 text-sm font-bold',
    md: 'w-10 h-10 text-base font-extrabold',
    lg: 'w-12 h-12 text-lg font-black',
    xl: 'w-14 h-14 text-xl font-black'
  };

  const ballElementId = id || `lotto-ball-${number}`;

  return (
    <button
      id={ballElementId}
      type="button"
      disabled={!interactive}
      onClick={interactive ? onClick : undefined}
      className={`
        relative inline-flex items-center justify-center rounded-full select-none
        transition-all duration-200
        ${sizeClasses[size]}
        ${color.bg} ${color.text}
        shadow-md ${color.shadow}
        ${interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
        ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}
        ${isMatched === true ? 'ring-3 ring-amber-300 ring-offset-2 scale-105 animate-pulse' : ''}
        ${isMatched === false ? 'opacity-40' : ''}
        ${className}
      `}
      style={{
        // 3D 구체 광택 효과 (하이라이트 및 그림자)
        backgroundImage: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.25) 100%)',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
      }}
    >
      <span>{number < 10 ? `0${number}` : number}</span>
      {isBonus && (
        <span
          id={`bonus-tag-${number}`}
          className="absolute -top-1.5 -right-1.5 text-[9px] font-black bg-rose-600 text-white px-1 py-0.2 rounded-full border border-white shadow-xs"
        >
          +B
        </span>
      )}
    </button>
  );
};
