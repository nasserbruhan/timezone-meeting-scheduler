
import React from 'react';
import { AISuggestion } from '../types';

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onApply: (utcHour: number) => void;
}

const AISuggestionCard: React.FC<AISuggestionCardProps> = ({ suggestion, onApply }) => {
  // Extract hour from suggestion.startTime (expects something like "14:00 UTC")
  const hour = parseInt(suggestion.startTime, 10) || 0;

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center hover:shadow-md transition-shadow">
      <div className="bg-indigo-600 text-white p-3 rounded-lg flex flex-col items-center justify-center min-w-[70px] shadow-sm">
        <span className="text-sm font-bold uppercase">UTC</span>
        <span className="text-xl font-bold leading-tight">{suggestion.startTime.split(' ')[0]}</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-800 mb-1">{suggestion.reason}</p>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <i className="fa-solid fa-circle-info text-indigo-400"></i>
          {suggestion.impact}
        </p>
      </div>
      <button 
        onClick={() => onApply(hour)}
        className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
      >
        Select This Time
      </button>
    </div>
  );
};

export default AISuggestionCard;
