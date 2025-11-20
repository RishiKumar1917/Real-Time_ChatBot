import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ChatService } from '../../services/chat.service';


interface UiMessage {
  sender: 'ai' | 'user' | 'rep';
  name: string;
  avatar: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: UiMessage[] = [];
  currentInput = '';
  connectedToRep = false;

  constructor(private chatService: ChatService) {}

ngOnInit() {
  // ✅ Start session first (this generates a sessionId inside ChatService)
  this.chatService.startSession();

  // ✅ Ask for history only after session is guaranteed
  this.chatService.requestHistory();

  // Load chat history
  this.chatService.onChatHistory((history: ChatMessage[]) => {
    this.messages = history.map((msg: ChatMessage) => this.mapToUiMessage(msg));

    if (this.messages.length === 0) {
      this.messages.push({
        sender: 'ai',
        name: 'AI Assistant',
        avatar: 'assets/ai-avatar.jpg',
        text: 'Hi there! How can I help you today?',
        time: this.getCurrentTime()
      });
    }
  });

  // Listen for new messages
  this.chatService.onMessage((msg: ChatMessage) => {
    this.messages.push(this.mapToUiMessage(msg));
  });

  // When rep connects
  this.chatService.onRepConnected((data: any) => {
    this.connectedToRep = true;
    this.messages.push({
      sender: 'rep',
      name: data.name || 'Representative',
      avatar: 'assets/rep-avatar.jpg',
      text: 'Hello, I’m here to help you.',
      time: this.getCurrentTime()
    });
  });
}


  sendMessage() {
    if (!this.currentInput.trim()) return;

    // Push user message immediately into UI
    this.messages.push({
      sender: 'user',
      name: 'You',
      avatar: 'assets/user-avatar.jpg',
      text: this.currentInput,
      time: this.getCurrentTime()
    });

    // ✅ Send to backend via socket
    this.chatService.sendMessage('user', this.currentInput);

    this.currentInput = '';
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private mapToUiMessage(msg: ChatMessage): UiMessage {
    return {
      sender: msg.sender,
      name: msg.sender === 'user'
        ? 'You'
        : msg.sender === 'ai'
        ? 'AI Assistant'
        : 'Representative',
      avatar:
        msg.sender === 'user'
          ? 'assets/user-avatar.jpg'
          : msg.sender === 'ai'
          ? 'assets/ai-avatar.jpg'
          : 'assets/rep-avatar.jpg',
      text: msg.text,
      time: this.getCurrentTime()
    };
  }
}
