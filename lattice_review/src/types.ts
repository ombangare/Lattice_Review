export interface PatternDetail {
  type: string;
  description: string;
  examples: string[];
  keyCharacteristics: string[];
}

export interface NamingConventions {
  functions: string;
  variables: string;
  constants: string;
  components: string;
  hooks: string;
  examples: string[];
}

export interface FileStructure {
  directories: string;
  organization: string;
  description: string;
  examples: string[];
}

export interface ImportOrder {
  order: string[];
  examples: string[];
}

export interface AdditionalPatterns {
  patterns_observed: string[];
  descriptions: string[];
}

export interface StoredPatterns {
  stateManagement?: PatternDetail;
  errorHandling?: PatternDetail;
  asyncPatterns?: PatternDetail;
  componentStructure?: PatternDetail;
  namingConventions?: NamingConventions;
  fileStructure?: FileStructure;
  importOrder?: ImportOrder;
  additionalPatterns?: AdditionalPatterns;
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  ownerId: string;
  createdAt: string;
  status: 'pattern-learning' | 'ready' | 'error';
  errorMessage?: string;
}

export interface Violation {
  id: string;
  severity: 'high' | 'medium' | 'low';
  category: 'state-management' | 'error-handling' | 'async-patterns' | 'component-structure' | 'naming' | 'import-order' | 'file-structure' | 'other';
  file: string;
  line: number;
  code: string;
  violation: string;
  pattern: string;
  codebaseExample: string;
  suggestion: string;
  codeChange?: {
    before: string;
    after: string;
    rationale?: string;
  };
}

export interface CompliantFeature {
  category: string;
  observation: string;
}

export interface PRAnalysis {
  id: string;
  repoId: string;
  prUrl: string;
  prNumber: number;
  status: 'pending' | 'completed' | 'error';
  summary: string;
  filesChanged: string[];
  additions: number;
  deletions: number;
  violations: Violation[];
  compliant: CompliantFeature[];
  createdAt: string;
  analysisTimeMs: number;
  errorMessage?: string;
}

export interface AnalyticsData {
  repoId: string;
  totalAnalyses: number;
  violationFrequency: Record<string, number>;
  severityDistribution: Record<string, number>;
  updatedAt: string;
}
