import React from 'react';
import { Sparkles, TrendingUp, Award, Star, Zap } from 'lucide-react';

const MatchScoreBadge = ({ 
  score, 
  showIcon = true, 
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  // If score is null or undefined, don't render
  if (score === null || score === undefined) return null;

  // Soft pastel background tints paired with higher contrast dark text
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-[#047857]/10 text-[#047857] border-[#047857]/20 shadow-sm';
    if (score >= 60) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return Award;
    if (score >= 60) return Star;
    if (score >= 40) return TrendingUp;
    return Zap;
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs tracking-wide',
    md: 'px-3.5 py-1.5 text-sm tracking-wide',
    lg: 'px-4 py-2 text-base tracking-wide',
    xl: 'px-5 py-2.5 text-lg tracking-wide'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  const Icon = getScoreIcon(score);

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Strong Match';
    if (score >= 40) return 'Good Match';
    return 'Potential Match';
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 rounded-full font-bold border transition-all duration-200 ease-out cursor-default hover:scale-[1.02] ${getScoreColor(score)} ${sizes[size] || sizes.md} ${className}`}
    >
      {showIcon ? (
        <Icon className={`${iconSizes[size] || iconSizes.md} shrink-0`} />
      ) : (
        <span className="flex items-center text-xs opacity-80 shrink-0">
          {score >= 80 ? '✦' : score >= 60 ? '★' : score >= 40 ? '▲' : '●'}
        </span>
      )}
      <span>{showLabel ? `${score}% Match` : `${score}%`}</span>
      {showLabel && score >= 80 && (
        <span className="hidden sm:inline text-xs font-medium opacity-70 border-l border-[#047857]/30 pl-2 ml-0.5">
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
};

// Match Details List Component - Updated to hide if all values are 0
export const MatchDetails = ({ details, size = 'sm' }) => {
  if (!details) return null;

  const detailItems = [
    { key: 'skillMatch', label: 'Skills', color: 'emerald' },
    { key: 'experienceMatch', label: 'Experience', color: 'sky' },
    { key: 'locationMatch', label: 'Location', color: 'slate' },
    { key: 'salaryMatch', label: 'Salary', color: 'amber' },
    { key: 'categoryMatch', label: 'Category', color: 'slate' },
    { key: 'jobTypeMatch', label: 'Job Type', color: 'emerald' },
  ];

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 rounded-lg',
    md: 'text-sm px-3 py-1.5 rounded-xl',
    lg: 'text-base px-3.5 py-2 rounded-xl'
  };

  const colorMap = {
    emerald: 'bg-[#047857]/5 text-[#047857] border-[#047857]/15 hover:bg-[#047857]/10',
    sky: 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100/70',
    amber: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/70',
    slate: 'bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0] hover:bg-[#E2E8F0]/60'
  };

  // Filter out items that are undefined, null, or 0
  const validItems = detailItems.filter((item) => {
    const value = details[item.key];
    return value !== undefined && value !== null && value > 0;
  });

  // If no valid items (all 0 or undefined), return null to hide the section
  if (validItems.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2.5">
      {validItems.map((item) => {
        const value = details[item.key];
        return (
          <span 
            key={item.key}
            className={`font-medium border shadow-sm transition-colors duration-200 ${colorMap[item.color] || colorMap.slate} ${sizeClasses[size] || sizeClasses.sm} flex items-center gap-1.5`}
          >
            <span className="text-[10px] font-bold text-[#475569] tracking-wider uppercase opacity-80">{item.label}</span>
            <span className="font-extrabold">{value}%</span>
          </span>
        );
      })}
    </div>
  );
};

export default MatchScoreBadge;