import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Database, 
  GitPullRequest, 
  ExternalLink, 
  ArrowRight, 
  Loader2, 
  BookOpen, 
  Trash2,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Github,
  Search,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { Repository } from '../types';

export interface GitHubRepoItem {
  id: string;
  name: string;
  fullName: string;
  url: string;
  private: boolean;
  description: string;
}

interface RepositoryListProps {
  repos: Repository[];
  activeRepo: Repository | null;
  onSelectRepo: (repo: Repository) => void;
  onCreateRepo: (name: string, url: string) => Promise<Repository>;
  onDeleteRepo: (id: string) => void;
  githubStatus: { connected: boolean; username?: string; avatarUrl?: string; htmlUrl?: string; } | null;
  onConnectGithub: () => void;
  onDisconnectGithub: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

export function RepositoryList({ 
  repos, 
  activeRepo, 
  onSelectRepo, 
  onCreateRepo, 
  onDeleteRepo,
  githubStatus,
  onConnectGithub,
  onDisconnectGithub,
  fetchWithAuth
}: RepositoryListProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // GitHub integration repositories list
  const [githubRepos, setGithubRepos] = useState<GitHubRepoItem[]>([]);
  const [isLoadingGithubRepos, setIsLoadingGithubRepos] = useState(false);
  const [githubReposError, setGithubReposError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch GitHub repos list when user connects GitHub account
  const loadGithubRepos = async () => {
    setIsLoadingGithubRepos(true);
    setGithubReposError('');
    try {
      const res = await fetchWithAuth('/api/github/repos');
      if (res.ok) {
        const data = await res.json() as GitHubRepoItem[];
        setGithubRepos(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setGithubReposError(errData.error || 'Failed to retrieve GitHub repositories.');
      }
    } catch (err: any) {
      setGithubReposError(err.message || 'Failed to retrieve GitHub repositories.');
    } finally {
      setIsLoadingGithubRepos(false);
    }
  };

  useEffect(() => {
    if (githubStatus?.connected) {
      loadGithubRepos();
    } else {
      setGithubRepos([]);
    }
  }, [githubStatus?.connected]);

  // Built-in presets for easy exploration
  const PRESETS = [
    { name: "React Clean Shopping Cart", url: "https://github.com/developer-team/react-shopping-cart" },
    { name: "Express Clean REST API", url: "https://github.com/developer-team/express-clean-api" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Please provide a valid URL starting with https://');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onCreateRepo(name, url);
      setName('');
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to connect repository');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setUrl(preset.url);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Repositories Onboarding</h2>
        <p className="text-sm text-slate-500">
          Onboard your project codebase. Our AI architect (powered by Gemini) analyzes your source files to extract patterns across State Management, Error Handling, and Naming Conventions.
        </p>
      </div>

      {/* GitHub Account Connection Widget */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">GitHub Account Connection</h3>
              {githubStatus?.connected ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Connected as @{githubStatus.username}
                  </span>
                  {githubStatus.htmlUrl && (
                    <a 
                      href={githubStatus.htmlUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-brand-secondary hover:text-brand-secondary/80 font-semibold inline-flex items-center gap-0.5"
                    >
                      View profile <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="mt-0.5 text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Connect your GitHub account via OAuth to seamlessly access private or public repositories, analyze pull requests, and avoid rate limits.
                </p>
              )}
            </div>
          </div>
          
          <div className="flex shrink-0 items-center">
            {githubStatus?.connected ? (
              <button
                type="button"
                onClick={onDisconnectGithub}
                className="rounded-lg border border-red-200 bg-red-50 hover:bg-red-100/80 px-4 py-2 text-xs font-semibold text-red-600 transition-all cursor-pointer shadow-sm"
              >
                Disconnect Account
              </button>
            ) : (
              <button
                type="button"
                onClick={onConnectGithub}
                className="flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow cursor-pointer"
              >
                <Github className="h-4 w-4" />
                <span>Connect GitHub</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connected GitHub Repositories Panel */}
      {githubStatus?.connected && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Github className="h-5 w-5 text-slate-700" />
                <span>Your GitHub Repositories</span>
              </h3>
              <p className="text-xs text-slate-500">
                Select and onboard your repositories directly with 1-click.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search repos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-60 rounded-lg border border-slate-200 text-xs outline-none transition-all focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary"
                />
              </div>
              <button
                type="button"
                onClick={loadGithubRepos}
                disabled={isLoadingGithubRepos}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Refresh repositories"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingGithubRepos ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {isLoadingGithubRepos ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-brand-secondary mb-2" />
              <p className="text-xs font-medium">Fetching your repositories from GitHub...</p>
            </div>
          ) : githubReposError ? (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-4 text-xs font-medium text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold">Failed to fetch repositories</p>
                <p className="mt-0.5 text-red-600/90 font-normal">{githubReposError}</p>
                <button
                  type="button"
                  onClick={loadGithubRepos}
                  className="mt-2 text-xs font-semibold text-brand-secondary hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Retry
                </button>
              </div>
            </div>
          ) : githubRepos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
              <p className="text-xs">No repositories found in your GitHub account.</p>
            </div>
          ) : (
            (() => {
              const filtered = githubRepos.filter(r => 
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                r.fullName.toLowerCase().includes(searchQuery.toLowerCase())
              );
              
              if (filtered.length === 0) {
                return (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                    <p className="text-xs">No repositories match "{searchQuery}"</p>
                  </div>
                );
              }

              return (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-72 overflow-y-auto pr-1">
                  {filtered.map((item) => {
                    const isOnboarded = repos.some(r => r.url === item.url);
                    const isLocalSubmitting = isSubmitting && url === item.url;
                    
                    return (
                      <div 
                        key={item.id}
                        className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 hover:border-slate-200 hover:bg-slate-50 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-xs text-slate-800 truncate block max-w-[150px]" title={item.name}>
                              {item.name}
                            </span>
                            <span className="shrink-0 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-600">
                              {item.private ? (
                                <>
                                  <Lock className="h-2.5 w-2.5" /> Private
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-2.5 w-2.5" /> Public
                                </>
                              )}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-[220px]" title={item.fullName}>
                            {item.fullName}
                          </p>
                          {item.description && (
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] text-slate-400 hover:text-slate-600 font-medium inline-flex items-center gap-0.5"
                          >
                            GitHub <ExternalLink className="h-2.5 w-2.5" />
                          </a>

                          {isOnboarded ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <CheckCircle className="h-3 w-3" /> Onboarded
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={async () => {
                                setUrl(item.url);
                                setIsSubmitting(true);
                                try {
                                  await onCreateRepo(item.name, item.url);
                                  setUrl('');
                                } catch (err: any) {
                                  alert(err.message || 'Failed to onboard repository');
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold text-white bg-brand-primary rounded hover:bg-brand-primary/95 shadow-sm inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {isLocalSubmitting ? (
                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                              ) : (
                                <Plus className="h-2.5 w-2.5" />
                              )}
                              <span>Onboard</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Onboarding form */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
            <Plus className="h-5 w-5 text-brand-secondary" />
            <h3>Connect New Repository</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Project Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. My Awesome Mobile App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                GitHub Repository URL
              </label>
              <input
                type="text"
                placeholder="https://github.com/user/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-primary/95 hover:shadow disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing Codebase...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Onboard & Learn Patterns</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-slate-100"></div>
            <span className="relative bg-white px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Or Try A Sample Project
            </span>
          </div>

          <div className="space-y-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-600 transition-all hover:bg-slate-100"
              >
                <span>{preset.name}</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* List of active repositories */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Onboarded Repositories ({repos.length})
            </span>
          </div>

          {repos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">No active repositories</h3>
              <p className="mt-1 text-xs text-slate-500">
                Connect a GitHub repository above to start analyzing code architecture.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {repos.map((repo) => {
                const isActive = activeRepo?.id === repo.id;
                const isLearning = repo.status === 'pattern-learning';

                return (
                  <div
                    key={repo.id}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all bg-white shadow-sm hover:shadow-md ${
                      isActive 
                        ? 'border-brand-secondary ring-1 ring-brand-secondary' 
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          repo.status === 'ready' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : repo.status === 'error'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-brand-secondary/10 text-brand-secondary'
                        }`}>
                          {isLearning && <Loader2 className="h-3 w-3 animate-spin text-brand-secondary" />}
                          {!isLearning && repo.status === 'ready' && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                          {!isLearning && repo.status === 'error' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          <span className="capitalize">{repo.status.replace('-', ' ')}</span>
                        </span>

                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRepo(repo.id);
                            }}
                            className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-red-500"
                            title="Remove project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className="mt-3 text-sm font-bold text-slate-900 leading-snug truncate">
                        {repo.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-400 font-mono flex items-center gap-1 truncate">
                        <Database className="h-3 w-3 text-slate-400 shrink-0" />
                        {repo.url}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Added: {new Date(repo.createdAt).toLocaleDateString()}
                      </span>

                      {repo.status === 'ready' && (
                        <button
                          onClick={() => onSelectRepo(repo)}
                          className={`flex items-center gap-1 text-xs font-semibold py-1 px-2.5 rounded-md transition-all ${
                            isActive
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : 'bg-slate-100 text-slate-700 hover:bg-brand-primary hover:text-white'
                          }`}
                        >
                          <span>{isActive ? 'Active Project' : 'Select Project'}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
