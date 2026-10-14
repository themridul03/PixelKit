export type ToolCategory =
  | 'image'
  | 'pdf'
  | 'ai'
  | 'document'
  | 'file'
  | 'design';

export type ProcessingMode = 'browser' | 'browser-ai' | 'deterministic';

export type ToolStatus = 'implemented' | 'beta' | 'planned';

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  route: string;
  iconName: string;
  acceptedFormats: string[];
  maxFileSizeMB: number;
  processingMode: ProcessingMode;
  status: ToolStatus;
  isPopular?: boolean;
  tags: string[];
  features: string[];
  faqs: ToolFaq[];
  relatedToolIds?: string[];
}

export interface ProcessedResult {
  id: string;
  originalName: string;
  outputName: string;
  originalSize: number;
  outputSize: number;
  outputBlob: Blob;
  outputUrl: string;
  dimensions?: { width: number; height: number };
  originalDimensions?: { width: number; height: number };
  durationMs?: number;
  metadata?: Record<string, any>;
}
