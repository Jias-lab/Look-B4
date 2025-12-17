export interface Theme {
  id: string;
  label: string;
}

export interface PresetMap {
  [key: string]: string[];
}

export type GridData = string[];

export interface GeminiResponse {
  enhancedPrompt: string;
}