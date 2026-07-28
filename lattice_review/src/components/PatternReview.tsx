import React, { useState } from 'react';
import { 
  BookOpen, 
  Edit3, 
  Save, 
  X, 
  CheckCircle, 
  Layers, 
  AlertCircle,
  FileCode,
  Check,
  ChevronDown,
  Info
} from 'lucide-react';
import { StoredPatterns, Repository, PatternDetail } from '../types';

interface PatternReviewProps {
  activeRepo: Repository | null;
  patterns: StoredPatterns | null;
  onUpdatePatterns: (updated: StoredPatterns) => Promise<void>;
}

type TabType = 'stateManagement' | 'errorHandling' | 'asyncPatterns' | 'componentStructure' | 'namingConventions' | 'fileStructure' | 'importOrder' | 'additionalPatterns';

export function PatternReview({ activeRepo, patterns, onUpdatePatterns }: PatternReviewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('stateManagement');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states for edits
  const [editedType, setEditedType] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [editedExample, setEditedExample] = useState('');
  const [editedCharacteristics, setEditedCharacteristics] = useState<string[]>([]);
  const [newChar, setNewChar] = useState('');

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'stateManagement', label: 'State Management', icon: Layers },
    { id: 'errorHandling', label: 'Error Handling', icon: AlertCircle },
    { id: 'asyncPatterns', label: 'Async Operations', icon: FileCode },
    { id: 'componentStructure', label: 'Component Structure', icon: BookOpen },
    { id: 'namingConventions', label: 'Naming Rules', icon: Info },
    { id: 'fileStructure', label: 'File Structure', icon: BookOpen },
    { id: 'importOrder', label: 'Import Ordering', icon: BookOpen },
    { id: 'additionalPatterns', label: 'Additional Guidelines', icon: BookOpen },
  ];

  if (!activeRepo) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
        <BookOpen className="h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-sm font-semibold text-slate-900">No project selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select an active project repository in the header or Repositories list first.</p>
      </div>
    );
  }

  if (!patterns) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
        <LoaderComponent />
      </div>
    );
  }

  const handleStartEdit = () => {
    const p = patterns[activeTab];
    if (activeTab === 'namingConventions') {
      const naming = patterns.namingConventions;
      setEditedType(naming?.functions || '');
      setEditedDesc(naming?.variables || '');
      setEditedExample(naming?.examples?.[0] || '');
      setEditedCharacteristics([
        `Constants: ${naming?.constants || ''}`,
        `Components: ${naming?.components || ''}`,
        `Hooks: ${naming?.hooks || ''}`
      ]);
    } else if (activeTab === 'fileStructure') {
      const fs = patterns.fileStructure;
      setEditedType(fs?.directories || '');
      setEditedDesc(fs?.description || '');
      setEditedExample(fs?.examples?.[0] || '');
      setEditedCharacteristics([fs?.organization || '']);
    } else if (activeTab === 'importOrder') {
      const imp = patterns.importOrder;
      setEditedType(imp?.order?.join(', ') || '');
      setEditedDesc('Import Ordering Rules');
      setEditedExample(imp?.examples?.[0] || '');
      setEditedCharacteristics(imp?.order || []);
    } else if (activeTab === 'additionalPatterns') {
      const add = patterns.additionalPatterns;
      setEditedType(add?.patterns_observed?.[0] || 'Additional Style');
      setEditedDesc(add?.descriptions?.[0] || '');
      setEditedExample('');
      setEditedCharacteristics(add?.patterns_observed || []);
    } else {
      const detail = p as PatternDetail;
      setEditedType(detail?.type || '');
      setEditedDesc(detail?.description || '');
      setEditedExample(detail?.examples?.[0] || '');
      setEditedCharacteristics(detail?.keyCharacteristics || []);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    const updatedPatterns = { ...patterns };

    if (activeTab === 'namingConventions') {
      updatedPatterns.namingConventions = {
        functions: editedType,
        variables: editedDesc,
        constants: editedCharacteristics[0]?.replace('Constants: ', '') || '',
        components: editedCharacteristics[1]?.replace('Components: ', '') || '',
        hooks: editedCharacteristics[2]?.replace('Hooks: ', '') || '',
        examples: [editedExample]
      };
    } else if (activeTab === 'fileStructure') {
      updatedPatterns.fileStructure = {
        directories: editedType,
        organization: editedCharacteristics[0] || '',
        description: editedDesc,
        examples: [editedExample]
      };
    } else if (activeTab === 'importOrder') {
      updatedPatterns.importOrder = {
        order: editedCharacteristics,
        examples: [editedExample]
      };
    } else if (activeTab === 'additionalPatterns') {
      updatedPatterns.additionalPatterns = {
        patterns_observed: editedCharacteristics,
        descriptions: [editedDesc]
      };
    } else {
      updatedPatterns[activeTab] = {
        type: editedType,
        description: editedDesc,
        examples: [editedExample],
        keyCharacteristics: editedCharacteristics
      };
    }

    try {
      await onUpdatePatterns(updatedPatterns);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCharacteristic = () => {
    if (!newChar.trim()) return;
    setEditedCharacteristics([...editedCharacteristics, newChar.trim()]);
    setNewChar('');
  };

  const handleRemoveCharacteristic = (index: number) => {
    setEditedCharacteristics(editedCharacteristics.filter((_, idx) => idx !== index));
  };

  // Extract current pattern display details
  const getDisplayDetails = () => {
    const current = patterns[activeTab];
    if (!current) {
      return {
        title: "No guideline pattern detected yet",
        description: "Click 'Edit Pattern' to write standard guidelines manually.",
        characteristics: [],
        exampleCode: ""
      };
    }

    if (activeTab === 'namingConventions') {
      const naming = patterns.namingConventions!;
      return {
        title: "Identifier Naming Conventions",
        description: `Standard conventions established in files for variable and utility names:`,
        characteristics: [
          `Functions: ${naming.functions}`,
          `Variables: ${naming.variables}`,
          `Constants: ${naming.constants}`,
          `Components: ${naming.components}`,
          `Hooks: ${naming.hooks}`,
        ],
        exampleCode: naming.examples?.[0] || ""
      };
    }

    if (activeTab === 'fileStructure') {
      const fs = patterns.fileStructure!;
      return {
        title: `Directories: ${fs.directories}`,
        description: fs.description,
        characteristics: [
          `Organization Style: ${fs.organization}`
        ],
        exampleCode: fs.examples?.[0] || ""
      };
    }

    if (activeTab === 'importOrder') {
      const imp = patterns.importOrder!;
      return {
        title: "Head File Import Ordering",
        description: "The team follows a specific header import alignment structure:",
        characteristics: imp.order.map((o, idx) => `Level ${idx + 1}: ${o}`),
        exampleCode: imp.examples?.[0] || ""
      };
    }

    if (activeTab === 'additionalPatterns') {
      const add = patterns.additionalPatterns!;
      return {
        title: "Other Observed Code Styles",
        description: add.descriptions?.[0] || "Miscellaneous standards observed.",
        characteristics: add.patterns_observed || [],
        exampleCode: ""
      };
    }

    const d = current as PatternDetail;
    return {
      title: d.type,
      description: d.description,
      characteristics: d.keyCharacteristics || [],
      exampleCode: d.examples?.[0] || ""
    };
  };

  const details = getDisplayDetails();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Architectural Guidelines</h2>
          <p className="text-sm text-slate-500">
            These patterns define your project's codebase consistency profile. All scanned PRs are matched against these guidelines.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-brand-secondary focus:border-brand-secondary"
          >
            <Edit3 className="h-4 w-4" />
            <span>Customize Guidelines</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 border border-emerald-100">
          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Patterns successfully saved and updated. Upcoming analyses will reflect these specifications.</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        {/* Tab side buttons */}
        <div className="md:col-span-1 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
            Convention Areas
          </span>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isEditing) {
                    if (confirm("You have unsaved guidelines edits. Are you sure you want to discard them?")) {
                      setIsEditing(false);
                      setActiveTab(tab.id);
                    }
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase transition-all ${
                  isTabActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">
              {tabs.find((t) => t.id === activeTab)?.label} Specification
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
              Rule Source: {activeRepo.status === 'ready' ? 'Extracted by Gemma' : 'User Configured'}
            </span>
          </div>

          <div className="p-6 flex-1 space-y-6">
            {isEditing ? (
              // Editing state form
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Pattern Class / Type
                  </label>
                  <input
                    type="text"
                    value={editedType}
                    onChange={(e) => setEditedType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Pattern Goal & Explanation
                  </label>
                  <textarea
                    rows={3}
                    value={editedDesc}
                    onChange={(e) => setEditedDesc(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-normal text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Key Identifying Characteristics
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add checklist characteristic..."
                        value={newChar}
                        onChange={(e) => setNewChar(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none transition-all focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCharacteristic}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {editedCharacteristics.map((char, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                        >
                          <span>{char}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCharacteristic(index)}
                            className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {activeTab !== 'additionalPatterns' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Compliant Codebase Example (Standard / Best-Practice)
                    </label>
                    <textarea
                      rows={5}
                      value={editedExample}
                      onChange={(e) => setEditedExample(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary/95 shadow cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Specifications</span>
                  </button>
                </div>
              </div>
            ) : (
              // Display state
              <div className="space-y-6">
                <div>
                  <h4 className="inline-flex items-center gap-1.5 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20 px-3 py-1.5 text-sm font-bold text-brand-secondary leading-snug">
                    <CheckCircle className="h-4 w-4 text-brand-secondary shrink-0" />
                    {details.title}
                  </h4>
                  <p className="mt-3 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {details.description}
                  </p>
                </div>

                {details.characteristics.length > 0 && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Standard Guidelines Rules Checklist
                    </span>
                    <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      {details.characteristics.map((c, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                        >
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-xs font-medium text-slate-700">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {details.exampleCode && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Compliant Code Reference Snippet
                      </span>
                    </div>
                    <pre className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                      {details.exampleCode}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoaderComponent() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <Edit3 className="h-8 w-8 animate-pulse text-indigo-500 mb-2" />
      <span className="text-xs font-medium">Loading patterns specifications...</span>
    </div>
  );
}
