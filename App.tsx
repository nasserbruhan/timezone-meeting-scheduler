
import React, { useState, useEffect, useCallback } from 'react';
import { Participant, AISuggestion, DateRange } from './types';
import Header from './components/Header';
import ParticipantForm from './components/ParticipantForm';
import TimeGrid from './components/TimeGrid';
import AISuggestionCard from './components/AISuggestionCard';
import { getSmartSuggestions } from './services/geminiService';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'You', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, isMe: true, unavailability: '' }
  ]);
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getUTCHours());
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showCopyBanner, setShowCopyBanner] = useState(false);
  
  // Default range: Today to 7 days from now
  const [dateRange] = useState<DateRange>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const addParticipant = (name: string, timezone: string, unavailability?: string) => {
    const newParticipant: Participant = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      timezone,
      isMe: false,
      unavailability
    };
    setParticipants([...participants, newParticipant]);
  };

  const removeParticipant = (id: string) => {
    if (participants.find(p => p.id === id)?.isMe) return;
    setParticipants(participants.filter(p => p.id !== id));
  };

  const fetchSuggestions = useCallback(async () => {
    if (participants.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      const results = await getSmartSuggestions(participants, dateRange);
      setSuggestions(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [participants, dateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 1000);
    return () => clearTimeout(timer);
  }, [fetchSuggestions]);

  const getMeetingDate = () => {
    const now = new Date();
    const date = new Date();
    date.setUTCHours(selectedHour, 0, 0, 0);
    if (date <= now) {
      date.setUTCDate(date.getUTCDate() + 1);
    }
    return date;
  };

  const copyToClipboard = () => {
    const meetingDate = getMeetingDate();
    let text = `📅 SyncZone Meeting Invitation\n----------------------------\nTime: ${selectedHour}:00 UTC\n\nLocal Times:\n`;
    participants.forEach(p => {
      const localStr = meetingDate.toLocaleString('en-US', { timeZone: p.timezone, hour: 'numeric', minute: '2-digit', hour12: true });
      text += `- ${p.name}: ${localStr} (${p.timezone})\n`;
    });
    navigator.clipboard.writeText(text);
    setShowCopyBanner(true);
    setTimeout(() => setShowCopyBanner(false), 3000);
  };

  const getCalendarLinks = () => {
    const start = getMeetingDate();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const formatISO = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
    const startStr = formatISO(start);
    const endStr = formatISO(end);
    const title = encodeURIComponent("Team Sync (via SyncZone)");
    const details = encodeURIComponent(`SyncZone Meeting Details:\nTime: ${selectedHour}:00 UTC\n\nInvitees:\n` + participants.map(p => `- ${p.name} (${p.timezone})`).join('\n'));
    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&startdt=${startStr}&enddt=${endStr}&body=${details}`
    };
  };

  const calendarLinks = getCalendarLinks();

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar: Participants */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-users text-indigo-500"></i>
                Team Members
              </h2>
              <ParticipantForm onAdd={addParticipant} currentParticipants={participants} />
              
              <div className="space-y-2 mt-4">
                {participants.map(p => (
                  <div key={p.id} className="group bg-white p-3 rounded-lg border border-slate-200 flex flex-col hover:border-indigo-200 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="truncate pr-2">
                        <div className="font-medium text-slate-800 truncate">{p.name} {p.isMe && '(You)'}</div>
                        <div className="text-[10px] text-slate-500 truncate uppercase tracking-wider">{p.timezone}</div>
                      </div>
                      {!p.isMe && (
                        <button 
                          onClick={() => removeParticipant(p.id)}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>
                    {p.unavailability && (
                      <div className="mt-2 text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded italic truncate">
                        "{p.unavailability}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main: Visual & Suggestions */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* AI Recommendations */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i>
                    AI Smart Suggestions
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Checking range: {dateRange.startDate} to {dateRange.endDate}</p>
                </div>
                {isLoadingSuggestions && (
                  <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Finding optimal slots...
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {suggestions.length > 0 ? (
                  suggestions.map((s, idx) => (
                    <AISuggestionCard 
                      key={idx} 
                      suggestion={s} 
                      onApply={(h) => setSelectedHour(h)} 
                    />
                  ))
                ) : participants.length < 2 ? (
                  <div className="bg-slate-100 border border-slate-200 border-dashed rounded-xl p-8 text-center text-slate-500">
                    <p>Add at least one more team member to get AI suggestions.</p>
                  </div>
                ) : !isLoadingSuggestions && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm italic">
                    Could not find highly optimal slots within the current constraints.
                  </div>
                )}
              </div>
            </section>

            {/* Overlap Visualizer */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-calendar-day text-indigo-500"></i>
                Overlap Heatmap
              </h2>
              <TimeGrid 
                participants={participants} 
                selectedHour={selectedHour} 
                onSelectHour={setSelectedHour} 
              />
            </section>

            {/* Selected Time Summary */}
            <section className="bg-white rounded-xl shadow-lg border border-indigo-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex flex-col items-center justify-center shadow-indigo-200 shadow-xl">
                  <span className="text-xs font-bold uppercase opacity-80">UTC</span>
                  <span className="text-2xl font-bold">{selectedHour}:00</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Meeting Confirmation</h3>
                  <p className="text-slate-500">Calculated for {participants.length} participants</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-black transition-all shadow-md active:scale-95 text-sm"
                >
                  <i className="fa-solid fa-copy"></i>
                  Copy Invite
                </button>
                
                <div className="flex gap-2">
                  <a 
                    href={calendarLinks.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-indigo-600 border border-indigo-100 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-sm text-sm"
                  >
                    <i className="fa-brands fa-google"></i>
                    Google
                  </a>
                  <a 
                    href={calendarLinks.outlook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-indigo-600 border border-indigo-100 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-sm text-sm"
                  >
                    <i className="fa-brands fa-windows"></i>
                    Outlook
                  </a>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Floating Feedback */}
      {showCopyBanner && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          <i className="fa-solid fa-check-circle text-emerald-400"></i>
          <span>Meeting details copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};

export default App;
