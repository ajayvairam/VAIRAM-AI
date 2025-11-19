import React from 'react';
import { Message } from '../types';
import { Bot, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  userAvatar?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, userAvatar }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`group w-full flex ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center overflow-hidden shadow-sm ${isUser ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
          {isUser ? (
             userAvatar ? (
                <img src={userAvatar} alt="User" className="w-full h-full object-cover" /> 
             ) : (
                <div className="bg-indigo-600 w-full h-full flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                </div>
             )
          ) : (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 w-full h-full flex items-center justify-center">
               <Bot size={24} className="text-white" />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div
          className={`relative px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700'
          }`}
        >
            {/* Simple formatting for line breaks */}
            <div className="whitespace-pre-wrap break-words font-light tracking-wide">
                {message.content}
            </div>
            
            <div className={`text-[10px] mt-2 opacity-60 ${isUser ? 'text-indigo-200 text-right' : 'text-gray-500 dark:text-gray-400 text-left'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;