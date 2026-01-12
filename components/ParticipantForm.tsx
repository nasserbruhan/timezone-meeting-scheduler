
import React, { useState } from 'react';
import { COMMON_TIMEZONES } from '../constants';
import { Participant } from '../types';

interface ParticipantFormProps {
  onAdd: (name: string, timezone: string, unavailability?: string) => void;
  currentParticipants: Participant[];
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({ onAdd, currentParticipants }) => {
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [unavailability, setUnavailability] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name, timezone, unavailability);
    setName('');
    setUnavailability('');
    setIsExpanded(false);
  };

  return (
    <div className="mb-6">
      {!isExpanded ? (
        <button 
          onClick={() => setIsExpanded(true)}
          className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-all font-medium flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          Add Team Member
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Timezone</label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                >
                  {COMMON_TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                  {!COMMON_TIMEZONES.includes(Intl.DateTimeFormat().resolvedOptions().timeZone) && (
                     <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                       {Intl.DateTimeFormat().resolvedOptions().timeZone} (Local)
                     </option>
                  )}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unavailability / Constraints</label>
              <input 
                type="text" 
                value={unavailability}
                onChange={(e) => setUnavailability(e.target.value)}
                placeholder="e.g. No Fridays, Busy after 4pm"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
              <p className="mt-1 text-[10px] text-slate-400">AI will consider these when suggesting times.</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button 
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Add Member
            </button>
            <button 
              type="button"
              onClick={() => setIsExpanded(false)}
              className="px-6 py-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ParticipantForm;
