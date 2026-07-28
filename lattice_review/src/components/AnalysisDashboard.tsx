import React, { useState, useEffect } from 'react';
import { 
  GitPullRequest, 
  GitCommit, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  FileCode, 
  Loader2, 
  Layers, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { PRAnalysis, Repository, Violation, CompliantFeature } from '../types';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface AnalysisDashboardProps {
  activeRepo: Repository | null;
  analyses: PRAnalysis[];
  onAnalyzePR: (prUrl: string, customDiff?: string) => Promise<PRAnalysis>;
}

export function AnalysisDashboard({ activeRepo, analyses, onAnalyzePR }: AnalysisDashboardProps) {
  const [prUrl, setPrUrl] = useState('');
  const [customDiff, setCustomDiff] = useState('');
  const [showCustomDiff, setShowCustomDiff] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState('');

  // active selected analysis report
  const [selectedAnalysis, setSelectedAnalysis] = useState<PRAnalysis | null>(null);

  // Filters state
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchFile, setSearchFile] = useState<string>('');

  // Expand states for violation cards
  const [expandedViolations, setExpandedViolations] = useState<Record<string, boolean>>({});

  // Sample preset options
  const PRESET_PRS = [
    {
      label: "Sample PR #12: Bypasses try-catch & mixes class component",
      url: "https://github.com/developer-team/react-shopping-cart/pull/12",
      diff: `diff --git a/src/components/CheckoutScreen.tsx b/src/components/CheckoutScreen.tsx
index 8e48cb3..f1d43a1 100644
--- a/src/components/CheckoutScreen.tsx
+++ b/src/components/CheckoutScreen.tsx
@@ -1,13 +1,28 @@
+import { checkoutApi } from '@/utils/api';
+import React from 'react';
+import { useStore } from 'zustand';
 
-export function CheckoutScreen() {
-  return <div>Checkout Content</div>;
-}
+export class CheckoutScreen extends React.Component<Props> {
+  state = {
+    loading: false
+  };
+
+  async handlePayment() {
+    this.setState({ loading: true });
+    try {
+      await checkoutApi.process(this.props.cart);
+    } catch (e) {
+      // TODO: handle payment error
+    } finally {
+      this.setState({ loading: false });
+    }
+  }
+
+  render() {
+    return (
+      <div className="p-6">
+        <h2>Review Cart</h2>
+        <button onClick={() => this.handlePayment()}>Pay Now</button>
+      </div>
+    );
+  }
+}`
    },
    {
      label: "Sample PR #14: Compliant modern billing history hook",
      url: "https://github.com/developer-team/react-shopping-cart/pull/14",
      diff: `diff --git b/src/hooks/useBillingHistory.ts b/src/hooks/useBillingHistory.ts
new file mode 100644
index 0000000..f9823ab
--- /dev/null
+++ b/src/hooks/useBillingHistory.ts
@@ -0,0 +1,24 @@
+import React, { useState, useEffect } from 'react';
+import { api } from '../utils/api';
+
+export function useBillingHistory() {
+  const [history, setHistory] = useState([]);
+  const [isLoading, setIsLoading] = useState(true);
+  const [error, setError] = useState<string | null>(null);
+
+  useEffect(() => {
+    const loadData = async () => {
+      setIsLoading(true);
+      try {
+        const res = await api.getBillingHistory();
+        setHistory(res);
+      } catch (err: any) {
+        setError(err.message || 'Billing error');
+      } finally {
+        setIsLoading(false);
+      }
+    };
+    loadData();
+  }, []);
+
+  return { history, isLoading, error };
+}`
    }
  ];

  // Set default active analysis
  useEffect(() => {
    const repoAnalyses = analyses.filter(a => a.repoId === activeRepo?.id);
    if (repoAnalyses.length > 0 && !selectedAnalysis) {
      // Find completed one first
      const completed = repoAnalyses.find(a => a.status === 'completed');
      setSelectedAnalysis(completed || repoAnalyses[0]);
    }
  }, [analyses, activeRepo, selectedAnalysis]);

  // Handle Analysis Loading Steps
  useEffect(() => {
    let interval: any = null;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setAnalysisStep(prev => {
          if (prev < 2) return prev + 1;
          return prev;
        });
      }, 3500);
    } else {
      setAnalysisStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!activeRepo) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
        <GitPullRequest className="h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-sm font-semibold text-slate-900">No project selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select an active project repository in the header or Repositories list first.</p>
      </div>
    );
  }

  const handleStartReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prUrl.trim() && !customDiff.trim()) return;

    setIsAnalyzing(true);
    setAnalysisStep(0);
    setError('');

    try {
      const response = await onAnalyzePR(prUrl, showCustomDiff ? customDiff : undefined);
      // Poll database to check when status turns completed
      pollAnalysisStatus(response.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit PR for review');
      setIsAnalyzing(false);
    }
  };

  const pollAnalysisStatus = async (id: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/analyses/${id}`);
        if (res.ok) {
          const report = await res.json() as PRAnalysis;
          if (report.status === 'completed') {
            setSelectedAnalysis(report);
            setIsAnalyzing(false);
            clearInterval(interval);
          } else if (report.status === 'error') {
            setError(report.errorMessage || 'AI analysis failed');
            setIsAnalyzing(false);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }

      if (attempts > 30) {
        setError('Analysis timed out. Please try again.');
        setIsAnalyzing(false);
        clearInterval(interval);
      }
    }, 1500);
  };

  const handleApplyPreset = (preset: typeof PRESET_PRS[0]) => {
    setPrUrl(preset.url);
    setCustomDiff(preset.diff);
    setShowCustomDiff(true);
  };

  const toggleExpandViolation = (id: string) => {
    setExpandedViolations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Get filtered violations
  const getFilteredData = () => {
    if (!selectedAnalysis) return { violations: [], compliant: [] };

    let filteredViolations = [...(selectedAnalysis.violations || [])];

    if (severityFilter !== 'all') {
      filteredViolations = filteredViolations.filter(v => v.severity === severityFilter);
    }
    if (categoryFilter !== 'all') {
      filteredViolations = filteredViolations.filter(v => v.category === categoryFilter);
    }
    if (searchFile.trim()) {
      filteredViolations = filteredViolations.filter(v => 
        v.file.toLowerCase().includes(searchFile.toLowerCase())
      );
    }

    return {
      violations: filteredViolations,
      compliant: selectedAnalysis.compliant || []
    };
  };

  const repoAnalyses = analyses.filter(a => a.repoId === activeRepo.id);
  const { violations: displayViolations, compliant: displayCompliant } = getFilteredData();

  // Loading Steps texts
  const STEPS = [
    { label: "Fetching pull request diff...", desc: "Downloading files changed and additions/deletions stats from GitHub" },
    { label: "Scoping against learned guidelines...", desc: "Loading state management, naming rules, and error architectures" },
    { label: "Identifying drift anomalies...", desc: "Gemini is performing multi-stage checks and drafting refactoring before/after modules" }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">PR Consistency Reviewer</h2>
          <p className="text-sm text-slate-500">
            Submit a pull request URL to review file modifications against active architectural guidelines.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Review input card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <GitPullRequest className="h-5 w-5 text-indigo-600" />
              <h3>Analyze Pull Request</h3>
            </div>

            <form onSubmit={handleStartReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  GitHub PR URL
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/user/repo/pull/12"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Expandable manual code diff */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setShowCustomDiff(!showCustomDiff)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 outline-none"
                >
                  <span>{showCustomDiff ? "Hide" : "Or Paste"} Custom Code / Git Diff</span>
                  <ChevronDown className={`h-3 w-3 transform transition-transform ${showCustomDiff ? 'rotate-180' : ''}`} />
                </button>

                {showCustomDiff && (
                  <textarea
                    rows={6}
                    placeholder="Paste git diff output or raw code content here..."
                    value={customDiff}
                    onChange={(e) => setCustomDiff(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono bg-slate-50 outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 font-medium">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Pull Request...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Review Consistency</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-slate-100"></div>
              <span className="relative bg-white px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Preset Test Scenarios
              </span>
            </div>

            <div className="space-y-1.5">
              {PRESET_PRS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/80 p-2.5 text-left text-[11px] font-medium text-slate-600 leading-snug transition-all flex items-start gap-1.5"
                >
                  <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              PR Review Logs ({repoAnalyses.length})
            </span>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
              {repoAnalyses.map((a) => {
                const isSelected = selectedAnalysis?.id === a.id;
                const hasViolations = a.violations && a.violations.length > 0;

                return (
                  <button
                    key={a.id}
                    onClick={() => {
                      if (!isAnalyzing) setSelectedAnalysis(a);
                    }}
                    disabled={isAnalyzing}
                    className={`flex items-center justify-between w-full p-2.5 rounded-lg text-left text-xs font-medium transition-all ${
                      isSelected 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>PR #{a.prNumber}</span>
                        <span className={`h-2 w-2 rounded-full ${
                          a.status === 'completed' ? (hasViolations ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-red-500'
                        }`}></span>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        {a.summary}
                      </p>
                    </div>
                    <span className="text-[10px] shrink-0 font-bold whitespace-nowrap opacity-60">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading Stepper or Report results */}
        <div className="lg:col-span-2">
          {isAnalyzing ? (
            // Stepper view
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center space-y-8 min-h-[450px]">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shadow-inner">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Reviewing Pull Request...</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Analyzing modified files for architectural drift using Gemini models.
                </p>
              </div>

              {/* Progress Stepper */}
              <div className="w-full max-w-md space-y-4">
                {STEPS.map((step, idx) => {
                  const isCurrent = analysisStep === idx;
                  const isDone = analysisStep > idx;

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-4 p-3 rounded-xl border transition-all ${
                        isCurrent 
                          ? 'border-indigo-100 bg-indigo-50/30' 
                          : isDone 
                          ? 'border-emerald-100 bg-emerald-50/10'
                          : 'border-slate-100 opacity-55'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 animate-spin text-indigo-600 shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-slate-200 text-[10px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold leading-none ${isCurrent ? 'text-indigo-900' : isDone ? 'text-emerald-900' : 'text-slate-400'}`}>
                          {step.label}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : selectedAnalysis ? (
            // Full report view
            <div className="space-y-5">
              {/* Overview panel */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
                      #{selectedAnalysis.prNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Pull Request Review Report</h3>
                      <p className="text-[11px] text-slate-500 leading-tight flex items-center gap-1 mt-0.5 truncate max-w-sm">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        Created: {new Date(selectedAnalysis.createdAt).toLocaleString()} · Scanned in {(selectedAnalysis.analysisTimeMs / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-semibold">
                    <span className="rounded bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5">
                      +{selectedAnalysis.additions} lines
                    </span>
                    <span className="rounded bg-red-50 border border-red-100 text-red-700 px-2 py-0.5">
                      -{selectedAnalysis.deletions} lines
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-700">
                  <strong className="font-semibold text-slate-900">PR Summary:</strong> {selectedAnalysis.summary}
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Violations</span>
                    <div className="mt-1 text-base font-bold text-slate-900">
                      {selectedAnalysis.violations.length}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">High Severity</span>
                    <div className="mt-1 text-base font-bold text-red-600">
                      {selectedAnalysis.violations.filter(v => v.severity === 'high').length}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Medium Sev</span>
                    <div className="mt-1 text-base font-bold text-amber-600">
                      {selectedAnalysis.violations.filter(v => v.severity === 'medium').length}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Compliant Actions</span>
                    <div className="mt-1 text-base font-bold text-emerald-600">
                      {selectedAnalysis.compliant.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters & Results List */}
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Flagged Anomalies ({displayViolations.length})
                  </span>

                  {/* Filter tools */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 outline-none"
                    >
                      <option value="all">Severity: All</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 outline-none"
                    >
                      <option value="all">Category: All</option>
                      <option value="state-management">State Management</option>
                      <option value="error-handling">Error Handling</option>
                      <option value="component-structure">Component Structure</option>
                      <option value="naming">Naming conventions</option>
                      <option value="import-order">Import Order</option>
                      <option value="file-structure">File Structure</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {displayViolations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                    <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
                    <h3 className="mt-4 text-sm font-semibold text-slate-900">Architecturally compliant!</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      No violations detected for your selected filter levels. This pull request follows all team patterns!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayViolations.map((v) => {
                      const isExpanded = !!expandedViolations[v.id];

                      return (
                        <div
                          key={v.id}
                          className={`rounded-2xl border bg-white shadow-sm transition-all overflow-hidden ${
                            v.severity === 'high' 
                              ? 'border-red-200' 
                              : v.severity === 'medium'
                              ? 'border-amber-200'
                              : 'border-slate-200'
                          }`}
                        >
                          {/* Violation header card */}
                          <div
                            onClick={() => toggleExpandViolation(v.id)}
                            className="p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50/60 select-none justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                v.severity === 'high'
                                  ? 'bg-red-50 text-red-600'
                                  : v.severity === 'medium'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-indigo-50 text-indigo-600'
                              }`}>
                                <AlertTriangle className="h-3.5 w-3.5" />
                              </span>

                              <div>
                                <div className="flex flex-wrap items-center gap-1.5 leading-none">
                                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                                    v.severity === 'high'
                                      ? 'bg-red-100 text-red-800'
                                      : v.severity === 'medium'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}>
                                    {v.severity} Severity
                                  </span>
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase text-slate-600 tracking-wider">
                                    {v.category.replace('-', ' ')}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-500 font-mono truncate max-w-[200px] sm:max-w-xs">
                                    {v.file}:L{v.line}
                                  </span>
                                </div>
                                <h4 className="mt-2 text-xs font-bold text-slate-900 leading-tight">
                                  {v.violation}
                                </h4>
                              </div>
                            </div>

                            <button className="text-slate-400 p-0.5 rounded hover:bg-slate-100 shrink-0">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>

                          {/* Expanded detail comparison panels */}
                          {isExpanded && (
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-5 animate-slide-down">
                              {/* Side-by-Side: Learned Pattern Guide vs Violation */}
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                    Learned Guideline Specification
                                  </span>
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {v.pattern}
                                  </p>
                                  {v.codebaseExample && (
                                    <div className="pt-2">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                        Correct Example:
                                      </span>
                                      <pre className="rounded bg-slate-50 p-2 text-[10px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap border border-slate-100">
                                        {v.codebaseExample}
                                      </pre>
                                    </div>
                                  )}
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                    Anomaly Flagged inside PR
                                  </span>
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {v.violation}
                                  </p>
                                  <div className="pt-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                      Violating Segment:
                                    </span>
                                    <pre className="rounded bg-slate-50 p-2 text-[10px] font-mono text-slate-600 overflow-x-auto whitespace-pre border border-slate-100">
                                      {v.code}
                                    </pre>
                                  </div>
                                </div>
                              </div>

                              {/* Actionable Suggestions & Code Changes */}
                              {v.codeChange && (
                                <div className="space-y-3">
                                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Recommended Refactoring Changes
                                  </span>

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 block mb-1.5">
                                        Before (PR Anomalous Code)
                                      </span>
                                      <SyntaxHighlighter code={v.codeChange.before} highlightType="before" />
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 block mb-1.5">
                                        After (Compliant Alignment)
                                      </span>
                                      <SyntaxHighlighter code={v.codeChange.after} highlightType="after" />
                                    </div>
                                  </div>

                                  {v.codeChange.rationale && (
                                    <div className="rounded-xl bg-indigo-50/55 border border-indigo-100/50 p-3.5 text-[11px] text-slate-700 leading-relaxed">
                                      <strong className="font-bold text-indigo-950">Architectural Rationale:</strong> {v.codeChange.rationale}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Compliant patterns panel */}
              {displayCompliant.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Compliant Alignments ({displayCompliant.length})
                  </span>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {displayCompliant.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/20 p-3.5"
                      >
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 leading-none">
                            {c.category}
                          </h5>
                          <p className="text-xs text-slate-700 mt-1 leading-snug">
                            {c.observation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // No history default
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <GitPullRequest className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">No pull request reviewed yet</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Select a preset scenario on the left or enter a public GitHub pull request URL to execute the AI consistency checks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
