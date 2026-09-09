import React, { useState } from 'react';
import { AreaState, ActivityState, MONTHS } from '../data';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

interface ActivityCardProps {
  activity: ActivityState;
  isDarkMode: boolean;
  isLocked?: boolean;
  onChange: (updatedActivity: ActivityState) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isDarkMode, isLocked, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  const handleMonthChange = (month: string, value: string) => {
    if (isLocked) return;
    const numValue = parseInt(value, 10);
    const newMonths = { ...(activity.months || {}), [month]: isNaN(numValue) ? 0 : numValue };
    onChange({ ...activity, months: newMonths });
  };

  const handleObsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isLocked) return;
    onChange({ ...activity, observaciones: e.target.value });
  };

  const totalAnual = MONTHS.reduce((sum, m) => sum + ((activity.months && activity.months[m]) || 0), 0);


  return (
    <div className={`rounded-xl border overflow-hidden mb-4 transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
      <button 
        className={`w-full px-4 py-3 flex justify-between items-center text-left transition-colors ${isDarkMode ? 'bg-transparent hover:bg-white/5' : 'bg-transparent hover:bg-slate-50'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`text-sm ${isDarkMode ? 'font-medium text-white/90' : 'font-medium text-slate-800'}`}>{activity.name}</span>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
            Total: {totalAnual}
          </span>
          {expanded ? <ChevronUp size={18} className={isDarkMode ? 'text-indigo-400' : 'text-slate-400'} /> : <ChevronDown size={18} className={isDarkMode ? 'text-indigo-400' : 'text-slate-400'} />}
        </div>
      </button>

      {expanded && (
        <div className={`p-4 border-t transition-colors ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
            {MONTHS.map(month => (
              <div key={month} className="flex flex-col">
                <label className={`text-[10px] font-semibold uppercase mb-1 ${isDarkMode ? 'text-indigo-300/70' : 'text-slate-500'}`}>{month}</label>
                <input
                  type="number"
                  min="0"
                  disabled={isLocked}
                  readOnly={isLocked}
                  value={(activity.months && activity.months[month] === 0) ? '' : (activity.months?.[month] ?? '')}
                  onChange={(e) => handleMonthChange(month, e.target.value)}
                  className={`w-full rounded-lg p-1.5 text-sm focus:outline-none transition-all ${isLocked ? (isDarkMode ? 'bg-white/5 border border-white/5 text-white/50 cursor-not-allowed' : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed') : (isDarkMode ? 'bg-white/5 border border-white/10 text-white focus:border-indigo-400 placeholder:text-white/20' : 'bg-white border border-slate-200 text-slate-800 focus:border-indigo-500 placeholder:text-slate-300 shadow-sm')}`}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className={`flex items-center text-xs font-semibold mb-2 ${isDarkMode ? 'text-indigo-300' : 'text-slate-600'}`}>
              <MessageSquare size={14} className="mr-1" /> Observaciones y Comentarios
            </label>
            <textarea
              value={activity.observaciones || ''}

              disabled={isLocked}
              readOnly={isLocked}
              onChange={handleObsChange}
              className={`w-full rounded-xl p-3 text-sm focus:outline-none transition-all min-h-[60px] resize-y ${isLocked ? (isDarkMode ? 'bg-white/5 border border-white/5 text-white/50 cursor-not-allowed' : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed') : (isDarkMode ? 'bg-white/5 border border-white/10 text-white focus:border-indigo-400 placeholder:text-white/20' : 'bg-white border border-slate-200 text-slate-800 focus:border-indigo-500 placeholder:text-slate-300 shadow-sm')}`}
              placeholder={isLocked ? "Sin observaciones" : "Escribe alguna observación..."}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
