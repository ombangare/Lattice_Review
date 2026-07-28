import React from 'react';
import { ShieldCheck, Clock, Github, LogOut } from 'lucide-react';
import { Repository } from '../types';

interface HeaderProps {
  activeRepo: Repository | null;
  repos: Repository[];
  onSelectRepo: (repo: Repository) => void;
  onNavigate: (view: string) => void;
  currentView: string;
  user: any;
  onSignOut: () => void;
}

export function Header({ activeRepo, repos, onSelectRepo, onNavigate, currentView, user, onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('repos')}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-primary/10">
          <ShieldCheck className="h-5 w-5 text-brand-secondary" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900">Lattice Review</h1>
          <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest font-mono">Architectural Consistency</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {repos.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project:</span>
            <select
              value={activeRepo?.id || ''}
              onChange={(e) => {
                const selected = repos.find((r) => r.id === e.target.value);
                if (selected) onSelectRepo(selected);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition-all hover:bg-slate-100 focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary"
            >
              {repos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="hidden h-6 w-px bg-slate-200 md:block"></div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-800">
                {user.displayName || 'Developer User'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {user.email}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-100/60 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
