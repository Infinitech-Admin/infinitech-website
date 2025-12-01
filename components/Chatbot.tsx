// components/Chatbot.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  type: 'bot' | 'user';
  text: string;
  time: string;
}

const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      text: "Hi there! 👋 I'm your Infinitech assistant. We deliver high-quality, innovative solutions that enhance your brand. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    'Our Services',
    'About Us',
    'Contact Info',
    'Web Development',
    'Digital Marketing',
    'Get a Quote'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleQuickReply = (reply: string) => {
    setMessages([...messages, { type: 'user', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    
    setIsTyping(true);
    
    setTimeout(() => {
      let response = '';
      
      switch(reply) {
        case 'Our Services':
          response = "We offer Web Development, System Solutions, Digital Marketing, and Brand Enhancement services. All designed to help your business stand out!";
          break;
        case 'About Us':
          response = "Infinitech Advertising Corporation delivers innovative solutions that enhance your brand. With 2+ years of experience and 20+ completed projects, we help businesses grow effectively!";
          break;
        case 'Contact Info':
          response = "📍 Campos Rueda Building, 311 Urban Ave, Makati, 1206 Metro Manila\n📧 infinitechcorp.ph@gmail.com";
          break;
        case 'Web Development':
          response = "We create high-quality, responsive websites tailored to your business needs. From design to deployment, we've got you covered!";
          break;
        case 'Digital Marketing':
          response = "Our digital marketing strategies drive growth and enhance your online presence using the latest technology and creative ideas.";
          break;
        case 'Get a Quote':
          response = "I'd be happy to help you with a quote! Please email us at infinitechcorp.ph@gmail.com with your project details, and our team will get back to you shortly.";
          break;
        default:
          response = `Thank you for asking about "${reply}". Our team will provide you with more information shortly.`;
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: response, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { type: 'user', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setMessage('');
      
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: "Thank you for your message! Our team will respond shortly. For immediate assistance, please email us at infinitechcorp.ph@gmail.com", 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 flex items-center justify-center shadow-xl transition-all hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Chatbot Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <span className="text-blue-900 text-lg font-bold">I</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Infinitech Assistant</h3>
                <p className="text-blue-100 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.type === 'user' ? 'bg-blue-900 text-white' : 'bg-white border border-gray-200'} rounded-lg p-3 shadow-sm`}>
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Replies - Show after bot messages */}
            {!isTyping && messages[messages.length - 1]?.type === 'bot' && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 text-center mb-3">Quick replies:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-2 text-sm border-2 border-blue-900 text-blue-900 rounded-full hover:bg-blue-900 hover:text-white transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border-2 border-blue-800 rounded-full focus:outline-none focus:border-blue-900"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 rounded-full bg-blue-900 hover:bg-blue-800 flex items-center justify-center transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Powered by Infinitech AI Assistant</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;