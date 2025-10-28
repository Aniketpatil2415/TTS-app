import React, { useState, useEffect, useRef } from 'react';
import { generateChatResponse, startChat } from '../services/geminiService';
import type { ChatMessage } from '../types';
import Loader from './common/Loader';
import Button from './common/Button';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startChat();
    setMessages([{
        role: 'model',
        parts: [{ text: "Hello! I'm your AI assistant. How can I help you today?" }]
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(input);
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response }] };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: "I'm sorry, I'm having trouble connecting. Please try again later." }]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl flex flex-col h-[calc(100vh-12rem)] max-h-[700px]">
        <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">AI Chat Assistant</h2>
        </div>
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white flex-shrink-0">
                AI
              </div>
            )}
            <div className={`max-w-lg px-5 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
            </div>
             {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                You
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white flex-shrink-0">AI</div>
            <div className="bg-gray-700 rounded-2xl rounded-bl-none p-3">
                 <Loader message="Assistant is typing..."/>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-4 bg-gray-700 rounded-lg p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message here..."
            className="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none px-2"
            disabled={isLoading}
          />
          <Button onClick={handleSend} isLoading={isLoading} disabled={!input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
