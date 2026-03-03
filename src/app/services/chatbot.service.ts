import { Injectable } from '@angular/core';

declare global {
  interface Window {
    eptAIConfig: {
      accessToken: string;
      botName: string;
      defaultQuestions: string[];
      headerIcon: string;
      headerChatName: string;
      enableFileUpload: boolean;
      initiallyHidden: boolean;
      showMaximizeButton: boolean;
      disclaimerText: string;
      advancedWelcomeText: {
        icon: string;
        title: string;
        description: string;
      };
      show: () => void;
      hide: () => void;
      setDarkMode: (enabled: boolean) => void;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private isInitialized = false;

  constructor() {}

  /**
   * Initialize the Ept AI chatbot with configuration
   * @param accessToken - Your Ept AI access token
   */
  initializeChatbot(accessToken: string): void {
    if (this.isInitialized) {
      console.warn('Chatbot already initialized');
      return;
    }

    // Configure the chatbot
    window.eptAIConfig = {
      accessToken: accessToken,
      botName: 'AI Assistant',
      defaultQuestions: [
        'What can you help me with?',
        'Tell me about your features',
        'How do I get started?'
      ],
      headerIcon: '🤖',
      headerChatName: 'AI Support',
      enableFileUpload: true,
      initiallyHidden: false,
      showMaximizeButton: true,
      disclaimerText: 'This chat is powered by AI.',
      advancedWelcomeText: {
        icon: '👋',
        title: 'Welcome to AI Chat',
        description: 'How can I assist you today?'
      },
      show: () => {},
      hide: () => {},
      setDarkMode: () => {}
    };

    this.isInitialized = true;
    console.log('Ept AI Chatbot initialized successfully');
  }

  /**
   * Show the chatbot widget
   */
  showChatbot(): void {
    if (window.eptAIConfig && window.eptAIConfig.show) {
      window.eptAIConfig.show();
    }
  }

  /**
   * Hide the chatbot widget
   */
  hideChatbot(): void {
    if (window.eptAIConfig && window.eptAIConfig.hide) {
      window.eptAIConfig.hide();
    }
  }

  /**
   * Toggle dark mode for the chatbot
   * @param enabled - Whether to enable dark mode
   */
  setDarkMode(enabled: boolean): void {
    if (window.eptAIConfig && window.eptAIConfig.setDarkMode) {
      window.eptAIConfig.setDarkMode(enabled);
    }
  }

  /**
   * Update the access token (tokens expire after 24 hours)
   * @param newToken - New access token
   */
  updateAccessToken(newToken: string): void {
    if (window.eptAIConfig) {
      window.eptAIConfig.accessToken = newToken;
      console.log('Access token updated');
    }
  }

  /**
   * Check if chatbot is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}
