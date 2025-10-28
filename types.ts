export type ActiveTool = 'chat' | 'tts' | 'image' | 'script';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
