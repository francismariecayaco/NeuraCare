
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { sendChatMessage } from '../services/geminiService';
import Icon from './Icon';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { author: MessageAuthor.BOT, text: "Hello! I'm Neura, your friendly assistant. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { author: MessageAuthor.USER, text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    const botResponse = await sendChatMessage(userInput);
    
    setMessages([...newMessages, { author: MessageAuthor.BOT, text: botResponse }]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
      >
        <Icon name="microphone" className="w-8 h-8" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center rounded-t-2xl">
        <h3 className="font-bold text-lg">Chat with Neura</h3>
        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
          <Icon name="close" className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex mb-4 ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl p-3 max-w-xs ${msg.author === MessageAuthor.USER ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start mb-4">
              <div className="bg-gray-200 text-gray-800 rounded-2xl p-3 max-w-xs flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex items-center">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button type="submit" className="ml-3 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-blue-300 transition" disabled={isLoading}>
            <Icon name="send" className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
