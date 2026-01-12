
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <i className="fa-solid fa-clock-rotate-left text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">SyncZone</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">Remote Team Scheduler</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600">History</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Templates</a>
          <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
            Help
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
