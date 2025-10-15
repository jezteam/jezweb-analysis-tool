export interface AnalysisResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';
