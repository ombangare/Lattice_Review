import React from 'react';
import { 
  GitPullRequest, 
  Settings, 
  BarChart3, 
  BookOpen, 
  Layers, 
  Database,
  History,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Repository } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  activeRepo: Repository | null;
  violationCount?: number;
}

export function Sidebar({ currentView, onNavigate, activeRepo, violationCount = 0 }: SidebarProps) {
  const links = [
    { id: 'repos', label: 'Repositories', icon: Database },
    { id: 'patterns', label: 'Pattern Library', icon: BookOpen, requiresRepo: true },
    { id: 'pr-analysis', label: 'PR Reviews', icon: GitPullRequest, requiresRepo: true },
    { id: 'analytics', label: 'Architectural Analytics', icon: BarChart3, requiresRepo: true }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-50 p-6 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16">
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
          <nav className="mt-3 space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isDisabled = link.requiresRepo && !activeRepo;
              const isActive = currentView === link.id;

              return (
                <button
                  key={link.id}
                  disabled={isDisabled}
                  onClick={() => onNavigate(link.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10'
                      : isDisabled
                      ? 'cursor-not-allowed text-slate-400 opacity-50'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {activeRepo && (
          <div className="rounded-xl bg-white border border-slate-200/80 p-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Repository</span>
            <h3 className="mt-2 text-sm font-semibold text-slate-900 truncate">{activeRepo.name}</h3>
            <p className="text-[10px] text-slate-400 font-mono truncate">{activeRepo.url}</p>
            
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <p className="text-[10px] font-medium text-slate-500">Status</p>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-700 capitalize">{activeRepo.status}</span>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <p className="text-[10px] font-medium text-slate-500">Violations</p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  {violationCount > 0 ? (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-bold text-slate-700">{violationCount}</span>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600">0</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200/80 pt-4 text-center">
        <p className="text-[10px] text-slate-400 font-medium">Lattice Review v1.0.0</p>
        <p className="text-[10px] text-slate-400 font-mono">Status: Ready for Dev</p>
      </div>
    </aside>
  );
}
