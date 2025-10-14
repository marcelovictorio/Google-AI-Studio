
export interface UserMessage {
  id: string;
  sender: 'user';
  text: string;
  image?: {
    name: string;
    url: string; // Blob URL for preview
  };
}

export interface AiMessage {
  id: string;
  sender: 'ai';
  imageUrl?: string; // base64 data URL
  isLoading: boolean;
  error?: string;
}

export type ChatMessage = UserMessage | AiMessage;
