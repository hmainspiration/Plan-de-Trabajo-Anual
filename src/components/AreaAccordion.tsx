import React, { useState } from 'react';
import { AreaState, ActivityState } from '../data';
import ActivityCard from './ActivityCard';
import { ChevronDown, ChevronRight, Target } from 'lucide-react';

interface AreaAccordionProps {
  area: AreaState;
  isDarkMode: boolean;
  isLocked?: boolean;
  onChange: (updatedArea: AreaState) => void;
}

const AreaAccordion: React.FC<AreaAccordionProps> = ({ area, isDarkMode, isLocked, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  const handleActivityChange = (index: number, updatedActivity: ActivityState) => {
    if (isLocked) return;
    const newActivities = [...(area.activities || [])];
    newActivities[index] = updatedActivity;
    onChange({ ...area, activities: newActivities });
  };


  return (
    <div className={`mb-4 rounded-2xl border overflow-hidden transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
      <button 
        className={`w-full px-6 py-5 flex items-center justify-between text-left transition-colors ${isDarkMode ? 'bg-transparent hover:bg-white/5' : 'bg-transparent hover:bg-slate-50'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 pr-4">
          <h2 className={`text-lg leading-tight mb-1.5 ${isDarkMode ? 'font-light text-white' : 'font-semibold text-slate-800'}`}>{area.name}</h2>
          <div className={`flex items-start text-sm ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
            <Target size={16} className={`mr-2 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <p className="leading-snug">{area.objective}</p>
          </div>
        </div>
        <div className={`flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-full border transition-colors ${isDarkMode ? 'bg-white/10 border-white/10 text-indigo-300' : 'bg-white border-slate-200 text-indigo-600 shadow-sm'}`}>
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>

      {expanded && (
        <div className={`p-4 sm:p-5 border-t transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
          {(area.activities || []).map((act, idx) => (
            <ActivityCard
              key={idx}
              activity={act}
              isDarkMode={isDarkMode}
              isLocked={isLocked}
              onChange={(updatedAct) => handleActivityChange(idx, updatedAct)}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default AreaAccordion;
