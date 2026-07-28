import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RepositoryList } from './components/RepositoryList';
import { PatternReview } from './components/PatternReview';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { AuthView } from './components/AuthView';
import { LandingPage } from './components/LandingPage';
import { Repository, StoredPatterns, PRAnalysis, AnalyticsData } from './types';
import { Loader2 } from 'lucide-react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>('repos');
  const [repos, setRepos] = useState<Repository[]>([]);
  const [activeRepo, setActiveRepo] = useState<Repository | null>(null);
  
  // Scoped repo configurations
  const [patterns, setPatterns] = useState<StoredPatterns | null>(null);
  const [analyses, setAnalyses] = useState<PRAnalysis[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [githubStatus, setGithubStatus] = useState<any>(null);
  const [showLanding, setShowLanding] = useState<boolean>(true);

  // 1. Manage user authentication state
  useEffect(() => {
    // Check if demo mode was active previously
    const isDemo = localStorage.getItem("ccr_demo_mode") === "true";
    if (isDemo) {
      setToken("demo-token-12345");
      setUser({ uid: "demo-user-id", email: "demo@example.com", displayName: "Demo Developer (Bypass)" });
      setIsLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken(true);
          setToken(idToken);
          setUser(currentUser);
        } catch (err) {
          console.error("Failed to retrieve user ID token:", err);
          setUser(null);
          setToken(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setToken(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch wrapper with auth headers
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error("Missing auth session token");
    }
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    return fetch(url, { ...options, headers });
  };

  // Fetch GitHub status
  const fetchGithubStatus = async () => {
    if (!token) return;
    try {
      const res = await fetchWithAuth('/api/auth/github/status');
      if (res.ok) {
        const data = await res.json();
        setGithubStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch GitHub status:", err);
    }
  };

  // 2. Fetch repositories list when auth token is available
  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetchRepos();
      fetchGithubStatus();
    } else {
      setRepos([]);
      setActiveRepo(null);
      setGithubStatus(null);
    }
  }, [token]);

  // 3. Listen for GitHub OAuth success from the popup window
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchGithubStatus();
        fetchRepos();
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [token]);

  const handleConnectGithub = async () => {
    try {
      const res = await fetchWithAuth('/api/auth/github/url');
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate connection URL');
      }
      const { url } = await res.json();
      
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        url,
        'github_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
      );
      
      if (!popup) {
        alert("Popup was blocked by your browser. Please allow popups for this site to connect your GitHub account.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to initiate GitHub connection.");
    }
  };

  const handleDisconnectGithub = async () => {
    if (confirm("Are you sure you want to disconnect your GitHub account?")) {
      try {
        const res = await fetchWithAuth('/api/auth/github/disconnect', { method: 'POST' });
        if (res.ok) {
          fetchGithubStatus();
        }
      } catch (err) {
        console.error("Disconnect failed:", err);
      }
    }
  };

  const fetchRepos = async () => {
    try {
      const res = await fetchWithAuth('/api/repos');
      if (res.ok) {
        const data = await res.json() as Repository[];
        setRepos(data);
        if (data.length > 0 && !activeRepo) {
          // Default to the first repo
          setActiveRepo(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load repositories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Fetch scoped data for active repository whenever selected repo changes
  useEffect(() => {
    if (activeRepo && token) {
      fetchRepoDetails(activeRepo.id);
    } else {
      setPatterns(null);
      setAnalyses([]);
      setAnalytics(null);
    }
  }, [activeRepo, token]);

  const fetchRepoDetails = async (repoId: string) => {
    try {
      // Parallelize details loading with user auth context
      const [patternsRes, analysesRes, analyticsRes] = await Promise.all([
        fetchWithAuth(`/api/repos/${repoId}/patterns`),
        fetchWithAuth(`/api/repos/${repoId}/analyses`),
        fetchWithAuth(`/api/repos/${repoId}/analytics`)
      ]);

      if (patternsRes.ok) {
        const patternsData = await patternsRes.json() as StoredPatterns;
        setPatterns(patternsData);
      } else {
        setPatterns(null);
      }

      if (analysesRes.ok) {
        const analysesData = await analysesRes.json() as PRAnalysis[];
        setAnalyses(analysesData);
      } else {
        setAnalyses([]);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json() as AnalyticsData;
        setAnalytics(analyticsData);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      console.error("Failed to load repository details:", err);
    }
  };

  // Handlers for data actions

  const handleSelectRepo = (repo: Repository) => {
    setActiveRepo(repo);
    // Auto navigate to dashboard when switching project
    if (currentView === 'repos') {
      setCurrentView('pr-analysis');
    }
  };

  const handleCreateRepo = async (name: string, url: string): Promise<Repository> => {
    const res = await fetchWithAuth('/api/repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to onboard repository');
    }

    const newRepo = await res.json() as Repository;
    setRepos((prev) => [newRepo, ...prev]);
    setActiveRepo(newRepo);
    
    // Periodically poll for status check until ready
    pollRepoStatus(newRepo.id);

    return newRepo;
  };

  const pollRepoStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetchWithAuth('/api/repos');
        if (res.ok) {
          const list = await res.json() as Repository[];
          const updated = list.find(r => r.id === id);
          if (updated) {
            setRepos(list);
            if (activeRepo && activeRepo.id === id) {
              setActiveRepo(updated);
            }
            if (updated.status === 'ready' || updated.status === 'error') {
              clearInterval(interval);
              // Re-load pattern specifications
              fetchRepoDetails(id);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);
  };

  const handleUpdatePatterns = async (updated: StoredPatterns) => {
    if (!activeRepo) return;
    
    const res = await fetchWithAuth(`/api/repos/${activeRepo.id}/patterns`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });

    if (res.ok) {
      const data = await res.json() as StoredPatterns;
      setPatterns(data);
    } else {
      throw new Error('Failed to update patterns');
    }
  };

  const handleAnalyzePR = async (prUrl: string, customDiff?: string): Promise<PRAnalysis> => {
    if (!activeRepo) throw new Error('No active project selected');

    const res = await fetchWithAuth('/api/prs/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoId: activeRepo.id, prUrl, customDiff })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to submit PR for analysis');
    }

    const data = await res.json() as PRAnalysis;
    setAnalyses((prev) => [data, ...prev]);
    return data;
  };

  const handleDeleteRepo = async (id: string) => {
    if (confirm("Are you sure you want to remove this repository from CCR? This deletes all patterns, histories, and analytics.")) {
      try {
        const res = await fetchWithAuth(`/api/repos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          const updatedList = repos.filter(r => r.id !== id);
          setRepos(updatedList);
          if (activeRepo?.id === id) {
            setActiveRepo(updatedList.length > 0 ? updatedList[0] : null);
          }
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("ccr_demo_mode");
      setShowLanding(true);
      if (token === "demo-token-12345" || (user && user.uid === "demo-user-id")) {
        setToken(null);
        setUser(null);
      } else {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'repos':
        return (
          <RepositoryList
            repos={repos}
            activeRepo={activeRepo}
            onSelectRepo={handleSelectRepo}
            onCreateRepo={handleCreateRepo}
            onDeleteRepo={handleDeleteRepo}
            githubStatus={githubStatus}
            onConnectGithub={handleConnectGithub}
            onDisconnectGithub={handleDisconnectGithub}
            fetchWithAuth={fetchWithAuth}
          />
        );
      case 'patterns':
        return (
          <PatternReview
            activeRepo={activeRepo}
            patterns={patterns}
            onUpdatePatterns={handleUpdatePatterns}
          />
        );
      case 'pr-analysis':
        return (
          <AnalysisDashboard
            activeRepo={activeRepo}
            analyses={analyses}
            onAnalyzePR={handleAnalyzePR}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            activeRepo={activeRepo}
            analytics={analytics}
          />
        );
      default:
        return (
          <RepositoryList
            repos={repos}
            activeRepo={activeRepo}
            onSelectRepo={handleSelectRepo}
            onCreateRepo={handleCreateRepo}
            onDeleteRepo={handleDeleteRepo}
            githubStatus={githubStatus}
            onConnectGithub={handleConnectGithub}
            onDisconnectGithub={handleDisconnectGithub}
            fetchWithAuth={fetchWithAuth}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-brand-cream space-y-3 font-sans relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />
        <Loader2 className="h-10 w-10 animate-spin text-brand-secondary z-10" />
        <p className="text-sm font-semibold text-brand-primary animate-pulse z-10">Starting Lattice Review Engine...</p>
      </div>
    );
  }

  const handleDemoMode = () => {
    localStorage.setItem("ccr_demo_mode", "true");
    setToken("demo-token-12345");
    setUser({ uid: "demo-user-id", email: "demo@example.com", displayName: "Demo Developer (Bypass)" });
  };

  if (!user) {
    if (showLanding) {
      return (
        <LandingPage 
          onStartAuth={() => setShowLanding(false)} 
          onStartDemo={handleDemoMode} 
        />
      );
    }
    return (
      <AuthView 
        onAuthSuccess={() => {}} 
        onBackToLanding={() => setShowLanding(true)} 
      />
    );
  }

  const activeAnalysesList = analyses.filter(a => a.repoId === activeRepo?.id && a.status === 'completed');
  const latestAnalysis = activeAnalysesList[0];
  const violationCount = latestAnalysis?.violations?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col antialiased">
      <Header
        activeRepo={activeRepo}
        repos={repos}
        onSelectRepo={handleSelectRepo}
        onNavigate={setCurrentView}
        currentView={currentView}
        user={user}
        onSignOut={handleSignOut}
      />

      <div className="flex flex-1">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          activeRepo={activeRepo}
          violationCount={violationCount}
        />

        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
