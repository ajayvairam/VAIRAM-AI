import React, { useState, useRef, useEffect } from 'react';
import { Message, User, LoadingState } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Send, Menu, Sparkles } from 'lucide-react';
import { APP_NAME } from '../constants';

interface ChatWindowProps {
  user: User;
  messages: Message[];
  loadingState: LoadingState;
  onSendMessage: (content: string) => void;
  onSidebarToggle: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  user,
  messages,
  loadingState,
  onSendMessage,
  onSidebarToggle,
}) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingState]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus(); // Keep focus
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sampleQuestions = [
    "Plan a 3-day itinerary for Paris",
    "Explain the theory of relativity like I'm 5",
    "Write a React component for a Todo List",
    "Draft a professional email to a recruiter"
  ];

  return (
    <main className="flex-1 flex flex-col h-full relative bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Top Bar */}
      <header className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onSidebarToggle}
            className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg md:hidden transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center justify-center w-full md:justify-start md:w-auto gap-2 text-emerald-600 dark:text-emerald-500">
             <Sparkles size={18} />
             <span className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">{APP_NAME}</span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-2 min-h-[calc(100vh-180px)]">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full mt-20 text-center opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-6 rotate-3 hover:rotate-6 transition-transform duration-500">
                        <Sparkles className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to {APP_NAME}</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        I'm your intelligent assistant powered by Google Gemini. Ask me anything, generate code, or draft creative content.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-xl">
                        {sampleQuestions.map((hint, i) => (
                            <button 
                                key={i}
                                onClick={() => {
                                    setInput(hint);
                                    if(textareaRef.current) textareaRef.current.focus();
                                }}
                                className="p-3 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-white transition-all text-left"
                            >
                                "{hint}"
                            </button>
                        ))}
                    </div>
                </div>
            )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} userAvatar={user.avatarUrl} />
          ))}

          {loadingState === LoadingState.THINKING && (
            <div className="flex w-full justify-start mb-6 animate-in fade-in duration-300">
                <div className="max-w-[85%] md:max-w-[75%] flex gap-3">
                     <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-sm">
                        <Sparkles size={18} className="text-white animate-pulse" />
                     </div>
                     <TypingIndicator />
                </div>
            </div>
          )}
           <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-transparent transition-colors duration-300">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-end gap-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-sm dark:shadow-lg focus-within:ring-1 focus-within:ring-emerald-500/50 focus-within:border-emerald-500/50 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message VAIRAM AI..."
              className="w-full max-h-[150px] bg-transparent border-none text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-0 resize-none py-3 px-2 min-h-[48px] scrollbar-hide leading-relaxed"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loadingState !== LoadingState.IDLE}
              className={`mb-1 p-2.5 rounded-xl flex-shrink-0 transition-all duration-200 ${
                input.trim() && loadingState === LoadingState.IDLE
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              VAIRAM AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChatWindow;