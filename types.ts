export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface DocumentChunk {
  id: string;
  sourceFile: string;
  text: string;
  embedding: number[];
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  processed: boolean;
  chunksCount: number;
}

export enum AppState {
  CHAT = 'CHAT',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_PANEL = 'ADMIN_PANEL'
}

export interface RagConfig {
  apiKey: string;
}