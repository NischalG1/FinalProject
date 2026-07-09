// frontend/src/components/ui/MatchScoreBadge.jsx
import React from 'react';
import { Sparkles, TrendingUp, Award } from 'lucide-react';

const MatchScoreBadge = ({ 
  score, 
  showIcon = true, 
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (score >= 40) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // Get emoji or icon based on score
  const getScoreEmoji = (score) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    if (score >= 40) return '📈';
    return '💡';
  };

  // Size classes
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
    xl: 'px-5 py-2 text-lg'
  };

  // Icon sizes
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${getScoreColor(score)} ${sizes[size] || sizes.md} ${className}`}
    >
      {showIcon ? (
        <Sparkles className={`${iconSizes[size] || iconSizes.md}`} />
      ) : (
        <span className="text-sm">{getScoreEmoji(score)}</span>
      )}
      {showLabel ? `${score}% Match` : `${score}%`}
    </div>
  );
};

// Sub-component for detailed match breakdown
export const MatchDetails = ({ details, size = 'sm' }) => {
  if (!details) return null;

  const detailItems = [
    { key: 'skillMatch', label: 'Skills', color: 'blue' },
    { key: 'experienceMatch', label: 'Experience', color: 'purple' },
    { key: 'locationMatch', label: 'Location', color: 'green' },
    { key: 'salaryMatch', label: 'Salary', color: 'orange' },
    { key: 'categoryMatch', label: 'Category', color: 'pink' },
    { key: 'jobTypeMatch', label: 'Job Type', color: 'indigo' },
  ];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {detailItems.map((item) => {
        const value = details[item.key];
        if (value === undefined || value === null) return null;
        
        const colorMap = {
          blue: 'bg-blue-50 text-blue-600',
          purple: 'bg-purple-50 text-purple-600',
          green: 'bg-green-50 text-green-600',
          orange: 'bg-orange-50 text-orange-600',
          pink: 'bg-pink-50 text-pink-600',
          indigo: 'bg-indigo-50 text-indigo-600'
        };

        return (
          <span 
            key={item.key}
            className={`rounded-full font-medium ${colorMap[item.color] || 'bg-gray-50 text-gray-600'} ${sizeClasses[size] || sizeClasses.sm}`}
          >
            {item.label}: {value}%
          </span>
        );
      })}
    </div>
  );
};

export default MatchScoreBadge;