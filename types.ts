
export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
}

export enum View {
  HOME = 'home',
  CONVERSE = 'converse',
  JOURNAL = 'journal',
  RESOURCES = 'resources',
}
