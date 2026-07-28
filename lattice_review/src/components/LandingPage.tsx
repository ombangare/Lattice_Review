import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GitPullRequest, 
  BarChart3, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Code2, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Terminal,
  Layers,
  Heart
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onStartAuth: () => void;
  onStartDemo: () => void;
}

export function LandingPage({ onStartAuth, onStartDemo }: LandingPageProps) {
  const [activePlaygroundTab, setActivePlaygroundTab] = useState<'errors' | 'imports' | 'naming'>('errors');
  const [isFixed, setIsFixed] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const playgroundScenarios = {
    errors: {
      title: "Robust Error Handling",
      desc: "Ensure all async handlers are safely guarded with try-catch blocks and centralized express-error handlers.",
      before: `// ❌ Express Async Handler without Safety Catch
app.get('/api/users/:id', async (req, res) => {
  const user = await db.getUser(req.params.id);
  res.json(user);
});`,
      after: `// ✅ Standardized Robust Error Guardian
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await db.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err); // Centralized Error Handler Catch-all
  }
});`,
      violation: "Critical Pattern Violation: Missing catch block in asynchronous route handler. Unhandled promise rejections can crash the Node runtime."
    },
    imports: {
      title: "Clean Modular Imports",
      desc: "Enforce alphabetical, structured import grouping to prevent module-loading circular dependencies.",
      before: `// ❌ Chaotic unstructured import groupings
import { useState } from 'react';
import { Button } from './Button';
import React from 'react';
import { fetchUser } from '../../api/users';
import { Header } from '../Header';`,
      after: `// ✅ Ordered and Grouped Import Standard
import React, { useState } from 'react';

// Third-party core packages
import { Button } from './Button';
import { Header } from '../Header';

// Internal modules & helpers
import { fetchUser } from '../../api/users';`,
      violation: "Warning Pattern Deviation: Unordered imports degrade readability and raise risks of circular state lookup during tree-shaking."
    },
    naming: {
      title: "Unified React Components",
      desc: "Enforce consistent naming conventions (PascalCase for UI files, camelCase for helper methods).",
      before: `// ❌ Inconsistent naming and naming standard
export function user_profile_card(props) {
  const fetch_data = () => {};
  return <div className="card">User Profile</div>;
}`,
      after: `// ✅ standard clean functional component naming
export function UserProfileCard(props) {
  const fetchData = () => {};
  return <div className="card">UserProfileCard</div>;
}`,
      violation: "Style Deviation: Functional React components must adhere to PascalCase with strict camelCase internal methods."
    }
  };

  const currentScenario = playgroundScenarios[activePlaygroundTab];

  const triggerAutoFix = () => {
    if (isFixed || isFixing) return;
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      setIsFixed(true);
    }, 1200);
  };

  const handleTabChange = (tab: 'errors' | 'imports' | 'naming') => {
    setActivePlaygroundTab(tab);
    setIsFixed(false);
    setIsFixing(false);
  };

  return (
    <div className="min-h-screen bg-brand-cream text-slate-800 font-sans flex flex-col antialiased selection:bg-brand-secondary/10 selection:text-brand-secondary">
      {/* Top Banner Grid background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none h-2/3" />

      {/* Header */}
      <header className="relative w-full border-b border-slate-200/60 bg-white/75 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/10">
            <ShieldCheck className="h-5 w-5 text-brand-secondary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Lattice Review</h1>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest font-mono">Architectural Consistency</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onStartDemo}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 transition-all cursor-pointer"
          >
            Demo Sandbox
          </button>
          <button 
            onClick={onStartAuth}
            className="rounded-lg bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2 text-xs font-semibold transition-all hover:shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Sign In / Sign Up</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 z-10 flex flex-col items-center px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mt-12 md:mt-18 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-secondary/10 px-3.5 py-1 text-xs font-semibold text-brand-secondary mb-6 border border-brand-secondary/20 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Driven Repository Standards Guard</span>
          </div>
          <h2 className="text-4xl md:text-5.5xl font-extrabold tracking-tight text-brand-primary font-display leading-[1.1] mb-6">
            Keep your team's codebase standards in <span className="text-brand-secondary relative">perfect harmony</span>
          </h2>
          <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto mb-8">
            The ultimate dual-engine reviewer. Lattice Review catches general runtime bugs, syntax errors, and security holes, while simultaneously auditing pull requests against your custom architectural guidelines and team standards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStartAuth}
              className="w-full sm:w-auto px-7 py-3.5 bg-brand-primary hover:bg-brand-primary/95 active:bg-brand-primary text-white font-semibold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-primary/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4.5 w-4.5 text-brand-secondary" />
            </button>
            <button 
              onClick={onStartDemo}
              className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-200 hover:border-slate-350 active:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Terminal className="h-4 w-4 text-brand-secondary animate-pulse" />
              <span>Explore Demo Workspace</span>
            </button>
          </div>
        </div>

        {/* Dynamic & Interactive Simulator */}
        <div className="w-full mt-16 md:mt-20 rounded-2xl border border-slate-200 bg-white p-5 md:p-8 shadow-xl relative overflow-hidden mb-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/5 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/5 rounded-full filter blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Interactive controls and descriptions */}
            <div className="lg:w-1/3 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-primary flex items-center gap-2 mb-2">
                  <Layers className="h-5 w-5 text-brand-secondary" />
                  <span>Interactive Playground</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Select a common codebase standard below to see how our architectural consistency engine evaluates deviations and applies compliant transformations.
                </p>

                <div className="space-y-2">
                  {(Object.keys(playgroundScenarios) as Array<'errors' | 'imports' | 'naming'>).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col ${
                        activePlaygroundTab === tab
                          ? 'border-brand-primary bg-brand-primary/[0.02] shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-xs font-bold ${activePlaygroundTab === tab ? 'text-brand-primary' : 'text-slate-700'}`}>
                        {playgroundScenarios[tab].title}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-snug">
                        {playgroundScenarios[tab].desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="rounded-xl bg-amber-50/70 border border-amber-100/80 p-4">
                  <div className="flex items-start gap-2 text-[11px] leading-relaxed text-amber-800 font-medium">
                    <AlertTriangle className="h-4.5 w-4.5 text-brand-secondary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-slate-800 mb-0.5">Automated Review Warnings</span>
                      {currentScenario.violation}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code panels */}
            <div className="lg:w-2/3 flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner min-h-[360px]">
              {/* Simulator window header */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-slate-500 ml-2">code_consistency_agent.tsx</span>
                </div>
                
                <button
                  onClick={triggerAutoFix}
                  disabled={isFixed || isFixing}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    isFixed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isFixing
                      ? 'bg-brand-secondary/40 text-white border border-brand-secondary/50'
                      : 'bg-brand-secondary text-white hover:bg-brand-secondary/90 shadow-md shadow-brand-secondary/10'
                  }`}
                >
                  {isFixing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Applying Standards...</span>
                    </>
                  ) : isFixed ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Compliant!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Fix Violation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code blocks area */}
              <div className="flex-1 p-5 font-mono text-[12px] overflow-x-auto relative">
                {isFixing && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="h-7 w-7 text-brand-secondary animate-spin" />
                      <p className="text-xs text-slate-300 font-semibold tracking-wide animate-pulse">Running architectural analysis...</p>
                    </div>
                  </div>
                )}
                
                {!isFixed ? (
                  <pre className="text-red-300 whitespace-pre">
                    <code>{currentScenario.before}</code>
                  </pre>
                ) : (
                  <pre className="text-emerald-300 whitespace-pre">
                    <code>{currentScenario.after}</code>
                  </pre>
                )}
              </div>

              {/* Console logs */}
              <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-brand-secondary">●</span>
                  <span>Reviewer Status: {!isFixed ? "1 violation detected" : "standards passed"}</span>
                </div>
                <span>Lattice Review Console v1.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual-Engine Differentiator Section */}
        <div className="w-full mb-16 border border-slate-200/80 rounded-2xl bg-white p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-secondary/5 rounded-full filter blur-2xl pointer-events-none" />
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-brand-primary font-display tracking-tight mb-2">
              Why Lattice Review is Different
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Standard review engines only look at surface-level syntax rules. Lattice Review matches modern security, correctness, and bug checks with custom-defined design guidelines and code standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Traditional Left Side */}
            <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Standard Code Reviewers
                </h4>
                <ul className="space-y-3.5">
                  <li className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                    <span className="text-red-500 font-bold leading-none select-none">✕</span>
                    <span><strong>Strict Static Rules Only</strong> — Enforces generic styling rules (e.g., semicolons, max-line lengths) without deeper structural or flow understanding.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                    <span className="text-red-500 font-bold leading-none select-none">✕</span>
                    <span><strong>Architecturally Blind</strong> — Bypasses structural anti-patterns like legacy Class components, improper state structures, or chaotic imports.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                    <span className="text-red-500 font-bold leading-none select-none">✕</span>
                    <span><strong>No Rationale or Autopatching</strong> — Warns you about standard style errors but fails to explain deep architectural reasons or generate precise code changes.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/40 text-[10px] text-slate-400 font-mono">
                Static Linters & Abstract Syntax Trees
              </div>
            </div>

            {/* Lattice Right Side */}
            <div className="rounded-xl bg-brand-primary/[0.02] border border-brand-primary/10 p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-secondary/15 text-brand-secondary text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-bl-lg font-mono">
                Shield Activated
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Lattice Review Dual-Engine</span>
                </h4>
                <ul className="space-y-3.5">
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <span className="text-emerald-500 font-bold leading-none select-none">✓</span>
                    <span><strong>Exhaustive General Audits</strong> — Discovers runtime bugs, uncaught promise rejections, memory leaks, performance issues, and security vulnerabilities.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <span className="text-emerald-500 font-bold leading-none select-none">✓</span>
                    <span><strong>Dynamic Custom Guidelines</strong> — Aligns contributors instantly with your specific team standards, state handlers, files organization, and naming rulebooks.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <span className="text-emerald-500 font-bold leading-none select-none">✓</span>
                    <span><strong>Smart Patches & Explanations</strong> — Generates clear architectural reasoning, best practice guidelines, and precise drop-in code recommendations.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-primary/10 text-[10px] text-brand-primary/60 font-mono">
                AI Semantic Analyzer + Custom Rulebooks
              </div>
            </div>
          </div>
        </div>

        {/* Pillars / Value Blocks */}
        <div className="grid md:grid-cols-3 gap-6 w-full mb-16">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow transition-all group">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/5 text-brand-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-all">
              <BookOpen className="h-5 w-5 text-brand-secondary" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Architectural Patterns</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Define reusable rulebooks detailing error handling, layout files, components structures, and style guidelines across multiple code bases.
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow transition-all group">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/5 text-brand-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-all">
              <GitPullRequest className="h-5 w-5 text-brand-secondary" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Pull Request Reviews</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automatically process pull requests or diff payloads. Get micro-analysis of deviation frequencies with smart AI suggestions for immediate patches.
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow transition-all group">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/5 text-brand-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-all">
              <BarChart3 className="h-5 w-5 text-brand-secondary" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Trend Analytics</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analyze historical reviews. View high-fidelity charts detailing violation severities, frequency spikes, and code hygiene improvements over time.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Lattice Review</span>
            <span>&copy; {new Date().getFullYear()} by TriNode.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
