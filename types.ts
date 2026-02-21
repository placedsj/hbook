import type { ReactNode } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  imageUrl: string;
  tags: string[];
}

export enum ViewState {
  HOME = 'HOME',
  BLOG_LIST = 'BLOG_LIST',
  BLOG_POST_DETAIL = 'BLOG_POST_DETAIL',
  AI_TOOLS = 'AI_TOOLS',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  isError?: boolean;
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
}