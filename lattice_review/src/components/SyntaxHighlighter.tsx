import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  isDiff?: boolean;
  highlightType?: 'before' | 'after' | 'normal';
}

export function SyntaxHighlighter({ code, language = 'tsx', isDiff = false, highlightType = 'normal' }: SyntaxHighlighterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  // Determine line styles
  const getLineStyle = (line: string) => {
    if (highlightType === 'before') {
      return 'bg-red-950/20 text-red-300 border-l-2 border-red-500';
    }
    if (highlightType === 'after') {
      return 'bg-emerald-950/20 text-emerald-300 border-l-2 border-emerald-500';
    }
    if (isDiff) {
      if (line.startsWith('+')) {
        return 'bg-emerald-950/30 text-emerald-300 border-l-2 border-emerald-500';
      }
      if (line.startsWith('-')) {
        return 'bg-red-950/30 text-red-300 border-l-2 border-red-500';
      }
    }
    return 'text-slate-300';
  };

  return (
    <div className="relative group rounded-xl border border-slate-800 bg-slate-950 shadow-inner overflow-hidden font-mono text-[11px] leading-relaxed">
      {/* Code header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800/60">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code output lines */}
      <div className="py-3 overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineStyle = getLineStyle(line);
              return (
                <tr key={idx} className={`${lineStyle} transition-all hover:bg-slate-900/50`}>
                  <td className="w-10 text-right select-none pr-3 font-semibold text-slate-600 border-r border-slate-800/40 text-[10px] bg-slate-950/40 py-0.5">
                    {idx + 1}
                  </td>
                  <td className="pl-4 pr-4 py-0.5 whitespace-pre">
                    {line}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
