
import type { ReactNode } from 'react';

export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  id: string;
  text: ReactNode;
  sender: Sender;
}
