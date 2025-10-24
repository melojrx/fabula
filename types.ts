
export interface StoryFormData {
  age: string;
  name: string;
  characteristics: string;
  theme: string;
}

export type OutputFormat = 'text' | 'audio';

export interface StoryResult {
  text: string;
  audioBuffer?: AudioBuffer;
}
