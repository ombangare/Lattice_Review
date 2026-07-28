import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ShieldCheck, 
  Activity, 
  HelpCircle,
  Database,
  ArrowDown
} from 'lucide-react';
import { AnalyticsData, Repository } from '../types';

interface AnalyticsViewProps {
  activeRepo: Repository | null;
  analytics: AnalyticsData | null;
}

export function AnalyticsView({ activeRepo, analytics }: AnalyticsViewProps) {
  if (!activeRepo) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
        <BarChart3 className="h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-sm font-semibold text-slate-900">No project selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select an active project repository in the header or Repositories list first.</p>
      </div>
    );
  }

  // Set default values if no analytics recorded yet
  const stats = analytics || {
    repoId: activeRepo.id,
    totalAnalyses: 0,
    violationFrequency: {
      "state-management": 0,
      "error-handling": 0,
      "component-structure": 0,
      "naming": 0,
      "file-structure": 0,
      "import-order": 0
    },
    severityDistribution: {
      "high": 0,
      "medium": 0,
      "low": 0
    },
    updatedAt: new Date().toISOString()
  };

  const totalViolations = Object.values(stats.severityDistribution).reduce((sum, val) => sum + val, 0);

  // Frequency array for categories list
  const categoriesList = [
    { label: 'Error Handling', key: 'error-handling', color: 'bg-red-500 text-red-500' },
    { label: 'State Management', key: 'state-management', color: 'bg-indigo-500 text-indigo-500' },
    { label: 'Component Structure', key: 'component-structure', color: 'bg-violet-500 text-violet-500' },
    { label: 'Naming Conventions', key: 'naming', color: 'bg-amber-500 text-amber-500' },
    { label: 'File Structure', key: 'file-structure', color: 'bg-sky-500 text-sky-500' },
    { label: 'Import Ordering', key: 'import-order', color: 'bg-emerald-500 text-emerald-500' }
  ];

  const sortedCategories = categoriesList
    .map(c => ({
      ...c,
      count: stats.violationFrequency[c.key] || 0
    }))
    .sort((a, b) => b.count - a.count);

  const maxCategoryCount = Math.max(...sortedCategories.map(c => c.count), 1);

  // Severity coordinates for SVG Pie
  const highSev = stats.severityDistribution['high'] || 0;
  const medSev = stats.severityDistribution['medium'] || 0;
  const lowSev = stats.severityDistribution['low'] || 0;
  const totalSev = Math.max(highSev + medSev + lowSev, 1);

  const highPct = (highSev / totalSev) * 100;
  const medPct = (medSev / totalSev) * 100;
  const lowPct = (lowSev / totalSev) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Architectural Analytics</h2>
        <p className="text-sm text-slate-500">
          Visual metrics tracking consistency trend indicators, common violation frequencies, and severity thresholds.
        </p>
      </div>

      {/* Grid of basic stat widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PRs Analyzed</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalAnalyses}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Drifts Found</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalViolations}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adherence Score</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {stats.totalAnalyses === 0 ? "100%" : `${Math.max(100 - (totalViolations * 8), 65)}%`}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Bottleneck</span>
            <p className="text-sm font-bold text-slate-900 truncate mt-1">
              {sortedCategories[0]?.count > 0 ? sortedCategories[0].label : "No bottlenecks"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar chart of categories */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Drift Distribution by Category</h3>
            <p className="text-xs text-slate-400">Shows which architectural standards are violated most often.</p>
          </div>

          <div className="space-y-4">
            {sortedCategories.map((c, index) => {
              const widthPct = (c.count / maxCategoryCount) * 100;
              const barColor = c.key === 'error-handling' 
                ? 'bg-red-500' 
                : c.key === 'state-management'
                ? 'bg-indigo-500'
                : c.key === 'component-structure'
                ? 'bg-violet-500'
                : c.key === 'naming'
                ? 'bg-amber-500'
                : c.key === 'file-structure'
                ? 'bg-sky-500'
                : 'bg-emerald-500';

              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{c.label}</span>
                    <span className="font-bold text-slate-900">{c.count}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${stats.totalAnalyses === 0 ? 0 : widthPct}%` }}
                      className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity distribution card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Anomalies Severity Breakdown</h3>
            <p className="text-xs text-slate-400">Prioritization weight based on drift impact on code health.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 py-4 justify-center">
            {/* Custom SVG Pie chart */}
            <div className="relative h-32 w-32 shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full transform -rotate-90">
                {/* Background base circle */}
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                
                {/* Low severity segment */}
                {lowPct > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#6366f1"
                    strokeWidth="4"
                    strokeDasharray={`${lowPct} ${100 - lowPct}`}
                    strokeDashoffset="0"
                  />
                )}

                {/* Medium severity segment */}
                {medPct > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeDasharray={`${medPct} ${100 - medPct}`}
                    strokeDashoffset={`-${lowPct}`}
                  />
                )}

                {/* High severity segment */}
                {highPct > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="4"
                    strokeDasharray={`${highPct} ${100 - highPct}`}
                    strokeDashoffset={`-${lowPct + medPct}`}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Total</span>
                <span className="text-lg font-bold text-slate-900 leading-tight">{totalViolations}</span>
              </div>
            </div>

            {/* Severity legends */}
            <div className="space-y-2.5 w-full">
              <div className="flex items-center justify-between text-xs font-semibold rounded-lg bg-slate-50 border border-slate-100 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                  <span className="text-slate-600">High Severity</span>
                </div>
                <span className="font-bold text-red-600">{highSev} ({highPct.toFixed(0)}%)</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold rounded-lg bg-slate-50 border border-slate-100 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-600">Medium Severity</span>
                </div>
                <span className="font-bold text-amber-600">{medSev} ({medPct.toFixed(0)}%)</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold rounded-lg bg-slate-50 border border-slate-100 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                  <span className="text-slate-600">Low Severity</span>
                </div>
                <span className="font-bold text-indigo-600">{lowSev} ({lowPct.toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-medium text-center pt-2 border-t border-slate-100 leading-normal">
            Last Updated: {new Date(stats.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
