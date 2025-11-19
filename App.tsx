import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { User, ChatSession, Message, LoadingState } from './types';
import { MOCK_USER } from './constants';
import { sendMessageToGemini } from './services/geminiService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Chat State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Theme Management
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle Login
  const handleLogin = () => {
    setUser(MOCK_USER);
    setIsAuthenticated(true);
    // Initialize with one empty chat if none exist
    if (sessions.length === 0) {
        createNewChat();
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setSessions([]);
    setCurrentSessionId(null);
  };

  // Create New Chat
  const createNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const newSession: ChatSession = {
      id: newChatId,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newChatId);
  };

  // Handle Renaming Chat
  const handleRenameChat = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(session => 
      session.id === id ? { ...session, title: newTitle } : session
    ));
  };

  // Handle Deleting Chat
  const handleDeleteChat = (id: string) => {
    const remaining = sessions.filter(s => s.id !== id);
    
    if (remaining.length === 0) {
        // If deleting the last chat, create a fresh one immediately
        const newId = `chat_${Date.now()}`;
        const newSession: ChatSession = {
           id: newId,
           title: 'New Conversation',
           messages: [],
           createdAt: Date.now()
        };
        setSessions([newSession]);
        setCurrentSessionId(newId);
    } else {
        setSessions(remaining);
        // If we deleted the current session, switch to the first available
        if (currentSessionId === id) {
            setCurrentSessionId(remaining[0].id);
        }
    }
  };

  // Handle Sending Message
  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Update local state with user message
    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? { 
              ...session, 
              messages: [...session.messages, newMessage],
              title: session.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : session.title
            }
          : session
      )
    );

    setLoadingState(LoadingState.THINKING);

    try {
      // Get history for this session
      const currentSession = sessions.find(s => s.id === currentSessionId);
      const history = currentSession ? [...currentSession.messages, newMessage] : [newMessage];

      const responseText = await sendMessageToGemini(history, content);

      const botMessage: Message = {
        id: `msg_${Date.now()}_b`,
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, botMessage] }
            : session
        )
      );
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error(error);
      // Handle Error UI if needed, for now just stop loading
      setLoadingState(LoadingState.ERROR);
      
       const errorMessage: Message = {
        id: `msg_${Date.now()}_err`,
        role: 'model',
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
      };
      
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, errorMessage] }
            : session
        )
      );
      setLoadingState(LoadingState.IDLE);
    }
  };

  // Get current messages
  const currentMessages = sessions.find((s) => s.id === currentSessionId)?.messages || [];

  if (!isAuthenticated || !user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <ChatWindow
          user={user}
          messages={currentMessages}
          loadingState={loadingState}
          onSendMessage={handleSendMessage}
          onSidebarToggle={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
};

export default App;