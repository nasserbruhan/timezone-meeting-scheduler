
import React, { useMemo } from 'react';
import { Participant, HourType } from '../types';
import { HOUR_COLORS, WORKING_START, WORKING_END, WAKING_START, WAKING_END } from '../constants';

interface TimeGridProps {
  participants: Participant[];
  selectedHour: number;
  onSelectHour: (hour: number) => void;
}

const TimeGrid: React.FC<TimeGridProps> = ({ participants, selectedHour, onSelectHour }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getLocalHourInfo = (utcHour: number, timezone: string) => {
    // Basic calculation for the 24-hour visual. Using Intl to get offset
    const date = new Date();
    date.setUTCHours(utcHour, 0, 0, 0);
    
    const localStr = date.toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false });
    const localHour = parseInt(localStr, 10) % 24;

    let type = HourType.SLEEPING;
    if (localHour >= WORKING_START && localHour < WORKING_END) {
      type = HourType.WORKING;
    } else if (localHour >= WAKING_START && localHour < WAKING_END) {
      type = HourType.WAKING;
    }

    return { localHour, type };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto hide-scrollbar">
        <div className="min-w-[800px]">
          {/* Header with UTC hours */}
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <div className="w-48 p-4 font-semibold text-slate-500 text-sm border-r border-slate-100 flex-shrink-0">
              Participant
            </div>
            {hours.map(h => (
              <div 
                key={h} 
                className={`flex-1 text-center py-2 text-[10px] font-bold border-r border-slate-100 last:border-r-0 ${selectedHour === h ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'}`}
              >
                {h}:00<br/>UTC
              </div>
            ))}
          </div>

          {/* Participant Rows */}
          {participants.map(p => (
            <div key={p.id} className="flex border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
              <div className="w-48 p-4 border-r border-slate-100 flex-shrink-0 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 truncate max-w-[120px]">{p.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.timezone.split('/').pop()?.replace('_', ' ')}</div>
                </div>
                {p.isMe && <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-bold">ME</span>}
              </div>
              {hours.map(h => {
                const info = getLocalHourInfo(h, p.timezone);
                return (
                  <div 
                    key={h}
                    onClick={() => onSelectHour(h)}
                    className={`flex-1 group relative cursor-pointer border-r border-slate-100 last:border-r-0 min-h-[60px] p-1 ${selectedHour === h ? 'ring-2 ring-inset ring-indigo-500 z-10' : ''}`}
                  >
                    <div className={`w-full h-full rounded-sm opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center ${HOUR_COLORS[info.type]}`}>
                      <span className="text-[10px] font-medium text-white/80 group-hover:text-white">{info.localHour}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="p-4 bg-slate-50 flex flex-wrap gap-6 text-xs text-slate-600 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${HOUR_COLORS.working}`}></div>
          <span>Working (9am - 6pm)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${HOUR_COLORS.waking}`}></div>
          <span>Available (7am - 10pm)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${HOUR_COLORS.sleeping}`}></div>
          <span>Sleeping (10pm - 7am)</span>
        </div>
      </div>
    </div>
  );
};

export default TimeGrid;
