import React, { useState, useEffect, useRef } from 'react';
import { Message, DocumentChunk } from '../types';
import { generateRAGResponse } from '../services/geminiService';
import { BRAND_COLORS } from '../constants';

interface ChatInterfaceProps {
  knowledgeBase: DocumentChunk[];
  apiKey: string;
  logoUrl: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ knowledgeBase, apiKey, logoUrl }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hai! I am Oriana bot. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (!apiKey) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'System Error: Admin has not configured the API Key yet.',
        timestamp: new Date()
      }]);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await generateRAGResponse(userMsg.text, knowledgeBase);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Chat Error", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error connecting to my brain. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[550px] md:h-[650px] w-full max-w-lg mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/40">
      
      {/* Header */}
      <div className={`bg-gradient-to-r ${BRAND_COLORS.gradient} p-4 flex flex-col items-center justify-center text-white relative shadow-md`}>
        <div className="flex items-center space-x-2">
            <span className="text-yellow-300 text-lg"><i className="fas fa-star"></i></span>
            <h1 className="text-xl font-bold tracking-wide">Oriana Assistant</h1>
        </div>
        <p className="text-xs opacity-90 mt-1">GRT Jewels - Multilingual Voice Support</p>
      </div>

      {/* Connection Status Indicator */}
      <div className="bg-white border-b border-gray-100 py-1 px-4 text-center">
         <p className="text-xs text-gray-400 uppercase tracking-widest">
           {knowledgeBase.length > 0 ? (
             <span className="text-emerald-500"><i className="fas fa-link mr-1"></i>Connected to Knowledge Base</span>
           ) : (
             <span className="text-orange-400"><i className="fas fa-exclamation-triangle mr-1"></i>No Knowledge Base</span>
           )}
         </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2 shadow-sm overflow-hidden flex-shrink-0">
                      <img src={logoUrl} alt="Bot" className="w-full h-full object-cover" />
                  </div>
              )}
              
              <div 
                className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}
              >
                {/* Simple Markdown Rendering for Bullets */}
                <div className="prose prose-sm max-w-none text-inherit">
                    {msg.text.split('\n').map((line, i) => (
                        <p key={i} className={`min-h-[1rem] ${line.trim().startsWith('-') || line.trim().startsWith('*') ? 'ml-2' : ''}`}>
                            {line}
                        </p>
                    ))}
                </div>
                
                {msg.role === 'model' && (
                   <div className="mt-1 text-right">
                       <button className="text-blue-500 hover:text-blue-700 text-xs">
                           <i className="fas fa-volume-up"></i>
                       </button>
                   </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2">
                  <img src={logoUrl} alt="Bot" className="w-full h-full object-cover" />
               </div>
               <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-full px-2 py-1 shadow-inner focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
          <button className="p-3 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
            <i className="fas fa-microphone"></i>
          </button>
          
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400 px-2"
            placeholder="Type or speak your question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-full transition-all ${
                inputText.trim() 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md transform hover:scale-105' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

    </div>
  );
};

export default ChatInterface;