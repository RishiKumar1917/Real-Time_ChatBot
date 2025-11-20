import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  sessionId: string;
  sender: 'user' | 'ai' | 'rep';   // stricter typing
  text: string;
  timestamp?: string;              // optional, comes from backend
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket!: Socket;
  private _sessionId: string | null = null;

  constructor() {
    try {
      this.socket = io('http://localhost:3000', {
        transports: ['websocket'],
      });
    } catch (error) {
      console.error('Socket connection failed:', error);
    }
  }

  // ✅ Expose sessionId for components to use/debug
  get sessionId(): string | null {
    return this._sessionId;
  }

  // ✅ Generate unique sessionId automatically
public startSession(userId?: string): void {
  if (!this._sessionId) {
    this._sessionId = userId || this.generateSessionId();
  }
  if (this.socket) {
    this.socket.emit('start_session', { userId: this._sessionId });
  } else {
    console.error('Socket not initialized. Cannot start session.');
  }
}

public sendMessage(sender: 'user' | 'ai' | 'rep', text: string): void {
  if (!this._sessionId) {
    this.startSession(); // ✅ auto-start session if missing
  }
  if (this.socket) {
    this.socket.emit('send_message', { 
      sessionId: this._sessionId, 
      sender, 
      text 
    });
  } else {
    console.error('Socket not initialized. Cannot send message.');
  }
}

public onMessage(cb: (msg: ChatMessage) => void): void {
  if (this.socket) {
    this.socket.off('new_message'); // prevent duplicate listeners
    this.socket.on('new_message', cb);
  }
}

public onRepConnected(cb: (data: any) => void): void {
  if (this.socket) {
    this.socket.off('rep_connected');
    this.socket.on('rep_connected', cb);
  }
}

public onChatHistory(cb: (messages: ChatMessage[]) => void): void {
  if (this.socket) {
    this.socket.off('chat_history');
    this.socket.on('chat_history', cb);
  }
}

public requestHistory(): void {
  if (!this._sessionId) {
    console.error('Session not started. Cannot request history.');
    return;
  }
  if (this.socket) {
    this.socket.emit('get_history', { sessionId: this._sessionId });
  } else {
    console.error('Socket not initialized. Cannot request history.');
  }
}

  // ✅ Helper: generate random sessionId
  private generateSessionId(): string {
    return 'sess-' + Math.random().toString(36).substring(2, 11);
  }
}
