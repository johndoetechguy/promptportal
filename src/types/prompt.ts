// Prompt Types and Data Model
// This file contains all types and mock data that can be easily migrated to a database later

export type PromptType = 'Image' | 'Text' | 'Video' | 'Code';

export type PromptTool = 'ChatGPT' | 'Midjourney' | 'DALL·E' | 'Stable Diffusion';

export type PromptCategory = 
  | 'Products'
  | 'Ads'
  | 'Fantasy'
  | 'Architecture'
  | 'UI'
  | 'Cyberpunk'
  | 'Nature'
  | 'Portrait'
  | 'Abstract';

export interface Prompt {
  id: string;
  title: string;
  description: string;
  promptText: string;
  promptType: PromptType;
  category: PromptCategory;
  tool: PromptTool;
  tags: string[];
  previewImage: string;
  isPublished: boolean;
  createdAt: Date;
}

// Helper function to generate unique IDs (for mock data)
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
