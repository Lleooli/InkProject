// Declarações de tipos customizadas para o WhatsApp Bot

declare module 'whatsapp-web.js' {
  export interface Client {
    on(event: 'qr', listener: (qr: string) => void): this;
    on(event: 'ready', listener: () => void): this;
    on(event: 'message', listener: (message: Message) => void): this;
    on(event: 'disconnected', listener: (reason: string) => void): this;
    initialize(): Promise<void>;
    destroy(): Promise<void>;
  }

  export interface Message {
    body: string;
    from: string;
    fromMe: boolean;
    reply(message: string): Promise<Message>;
    getContact(): Promise<Contact>;
  }

  export interface Contact {
    id: { user: string };
    name?: string;
    pushname?: string;
    sendMessage(message: string): Promise<Message>;
  }

  export class LocalAuth {
    constructor(options?: { clientId?: string });
  }
}

declare module 'ollama' {
  export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface ChatOptions {
    temperature?: number;
    top_p?: number;
  }

  export interface ChatResponse {
    message: {
      content: string;
    };
  }

  export class Ollama {
    constructor(options?: { host?: string });
    chat(options: {
      model: string;
      messages: ChatMessage[];
      options?: ChatOptions;
    }): Promise<ChatResponse>;
  }
}
