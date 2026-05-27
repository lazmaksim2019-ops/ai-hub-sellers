export type Marketplace = 'ozon' | 'wildberries';

export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface SEOGenerationResult {
  seoTitle: string;
  seoDescription: string;
  infographicsTriggers: string[];
  marketingTips: string;
  recommendedPrice: number;
}

export interface ReviewAnalysisResult {
  sentiment: Sentiment;
  suggestedReply: string;
}

export interface TerminalLog {
  id: number;
  type: 'INFO' | 'SUCCESS' | 'PROCESS' | 'ERROR';
  message: string;
}

export interface GenerationStep {
  label: string;
  duration: number;
}
