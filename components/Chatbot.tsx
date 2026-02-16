// components/Chatbot.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  type: 'bot' | 'user';
  text: string;
  time: string;
}

type ConversationStage = 
  | 'greeting' 
  | 'service-selection' 
  | 'collect-info' 
  | 'budget' 
  | 'contact-email'
  | 'contact-phone'
  | 'value-delivery'
  | 'browsing';

interface UserData {
  selectedService?: string;
  businessName?: string;
  industry?: string;
  challenge?: string;
  budget?: string;
  email?: string;
  phone?: string;
}

const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStage, setConversationStage] = useState<ConversationStage>('greeting');
  const [userData, setUserData] = useState<UserData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize greeting when chat opens
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([
        {
          type: 'bot',
          text: "Hi! 👋 Looking to upgrade your business digitally? I can help!\n\nWhat brings you here today?",
          time
        }
      ]);
    }
  }, [isChatOpen]);

  const addBotMessage = (text: string, delay: number = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { type: 'bot', text, time }]);
      setIsTyping(false);
    }, delay);
  };

  const handleServiceSelection = (service: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { type: 'user', text: service, time }]);
    setUserData(prev => ({ ...prev, selectedService: service }));

    if (service === 'Just Browsing') {
      addBotMessage(
        "No problem! Let me tell you about Infinitech Advertising Corporation! 🚀\n\n" +
        "📍 **Who We Are:**\n" +
        "We deliver high-quality, innovative solutions that enhance your brand. With 2+ years of experience and 20+ completed projects, we help businesses grow effectively!\n\n" +
        "💼 **Our Services:**\n" +
        "• Website & Mobile App Development\n" +
        "• SEO - Boost your online visibility\n" +
        "• Graphic Design - Stunning brand visuals\n" +
        "• Social Media Marketing\n" +
        "• Photography & Videography\n" +
        "• JuanTap Digital Cards\n\n" +
        "📧 **Contact Us:**\n" +
        "Email: infinitechcorp.ph@gmail.com\n" +
        "Location: Campos Rueda Building, 311 Urban Ave, Makati, Metro Manila\n\n" +
        "Want to explore a specific service?",
        1500
      );
      setConversationStage('browsing');
    } else {
      addBotMessage(
        `Great choice! ${service} can really transform your business.\n\nLet's get started. What's your business name?`
      );
      setConversationStage('collect-info');
    }
  };

  const handleBrowsingOptions = (option: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { type: 'user', text: option, time }]);

    const browsingResponses: Record<string, string> = {
      'Website & Mobile App': 
        "🌐 **Website & Mobile App Development:**\n\n" +
        "Crafting custom websites and mobile apps tailored to your needs!\n\n" +
        "📦 **Standard Package - ₱5,999/month:**\n" +
        "• Up to 5 pages\n" +
        "• Social Media Links\n" +
        "• Contact Form + Email Alerts\n" +
        "• 1-Year Domain & Hosting\n\n" +
        "⭐ **Premium Package - ₱9,999/month (MOST POPULAR):**\n" +
        "• Up to 10 pages\n" +
        "• Dashboard Login\n" +
        "• Traffic Insights & Analytics\n" +
        "• Smart Chat System\n" +
        "• Design Upgrade\n\n" +
        "💼 **Business Package - ₱14,999/month:**\n" +
        "• SEO Pro Setup\n" +
        "• eCommerce Ready\n" +
        "• Admin & Client Management\n" +
        "• Lead Form Dashboard\n" +
        "• Video Testimonials\n\n" +
        "Ready to start your project?",
      
      'SEO Services':
        "🔍 **Search Engine Optimization:**\n\n" +
        "Boost your online visibility! Our SEO strategies improve your website's search rankings.\n\n" +
        "**What We Offer:**\n" +
        "✅ On-Page SEO - Content & meta tags optimization\n" +
        "✅ Off-Page SEO - Building backlinks\n" +
        "✅ Local SEO - Local search visibility\n\n" +
        "💰 SEO packages start at ₱12,000/month\n" +
        "💰 SEO Pro Setup included in Business Website Package (₱14,999/month)\n\n" +
        "Let's optimize your site!",
      
      'Graphic Design':
        "🎨 **Graphic Design Services:**\n\n" +
        "Bringing your brand to life with stunning designs!\n\n" +
        "**Our Design Services:**\n" +
        "✅ Logo Design - Unique brand logos\n" +
        "✅ Marketing Collateral - Brochures, flyers\n" +
        "✅ Digital Assets - Social media graphics, banners\n\n" +
        "💰 Logo design starts at ₱3,000\n" +
        "💰 Full branding packages from ₱15,000\n\n" +
        "Ready to elevate your brand?",
      
      'Social Media Marketing':
        "📱 **Social Media Marketing Packages:**\n\n" +
        "📦 **Standard - ₱11,993/month:**\n" +
        "• Account Setup (FB+IG+TikTok)\n" +
        "• Profile & Cover Branding\n" +
        "• 8 Posts/Month + 2 Reels\n" +
        "• Monthly Insights Report\n\n" +
        "⭐ **Growth - ₱18,973/month (MOST POPULAR):**\n" +
        "• Everything in Standard\n" +
        "• 12-15 Posts/Month + 4 Reels\n" +
        "• Content Calendar\n" +
        "• Monthly Insights\n\n" +
        "💼 **Premium - ₱32,947/month:**\n" +
        "• 20-25 Posts/Month + 2 Reels\n" +
        "• Captions & Hashtags\n" +
        "• Monthly Insights\n\n" +
        "🏢 **Corporate - ₱47,973/month:**\n" +
        "• 30+ Posts/Month\n" +
        "• Full management\n" +
        "• Advanced strategies\n\n" +
        "Let's grow your social presence!",
      
      'Photography & Videography':
        "📸 **Photography & Videography Packages:**\n\n" +
        "📦 **Standard - ₱4,950:**\n" +
        "• Product/Corporate Shoot (10 items/5 pax)\n" +
        "• 1 Short Promo Video (30-60s)\n" +
        "• 20 Edited Photos\n" +
        "• Basic Editing + Music\n\n" +
        "⭐ **Business Growth - ₱14,750 (MOST POPULAR):**\n" +
        "• Product+Lifestyle+Corporate (30 items/8 pax)\n" +
        "• 1 Full Video (1-3 mins) + 3 Shorts\n" +
        "• Event Coverage (4 hrs)\n" +
        "• Scriptwriting & Concept\n" +
        "• 50 Edited Photos\n" +
        "• Optimized for all platforms\n\n" +
        "💼 **Business Package:**\n" +
        "• Unlimited coverage\n" +
        "• Event Coverage (8 hrs)\n" +
        "• On-site Interviews\n" +
        "• 1 Main Video + 5 Shorts\n" +
        "• Full Color Grading\n\n" +
        "Ready to capture your story?",
      
      'JuanTap Cards':
        "💳 **JuanTap Digital Business Card:**\n\n" +
        "Modern networking made simple!\n\n" +
        "📦 **Standard - ₱588:**\n" +
        "BEST FOR: Freelancers, individuals\n" +
        "• Editable design\n" +
        "• QR Code for non-NFC phones\n" +
        "• Simple card design\n" +
        "• Click-to-call, click-to-email\n" +
        "• Lifetime reusable\n\n" +
        "⭐ **Premium - ₱888 (MOST POPULAR):**\n" +
        "BEST FOR: Small business owners\n" +
        "• Full-Color Premium Design\n" +
        "• Choose style (Silver/Laser/Leather)\n" +
        "• Business location Maps\n" +
        "• Social media & website links\n" +
        "• Online dashboard (edit anytime)\n" +
        "• File upload (PDF/Portfolio)\n" +
        "• Lifetime reusable\n\n" +
        "💎 **Elite - ₱1,288:**\n" +
        "BEST FOR: VIP clients, executives\n" +
        "• Premium metal finish\n" +
        "• Laser printed logo & name\n" +
        "• Analytics (taps/views)\n" +
        "• Multiple profile support\n" +
        "• Full-color creative design\n" +
        "• Everything from Premium\n\n" +
        "Ready to go digital?",
      
      'Contact Info':
        "📞 **Get In Touch:**\n\n" +
        "📧 Email: infinitechcorp.ph@gmail.com\n" +
        "📍 Location: Campos Rueda Building, 311 Urban Ave, Makati, 1206 Metro Manila\n\n" +
        "🕐 Business Hours: Mon-Fri, 9AM-6PM\n\n" +
        "💼 2+ years experience | 20+ completed projects\n\n" +
        "Want to schedule a consultation?",
      
      'Get a Quote':
        "💰 **Ready for a Quote?**\n\n" +
        "I'd love to help! Let me gather some quick info:\n\n" +
        "What's your business name?"
    };

    if (option === 'Get a Quote') {
      addBotMessage(browsingResponses[option]);
      setConversationStage('collect-info');
    } else if (browsingResponses[option]) {
      addBotMessage(browsingResponses[option], 1200);
      setConversationStage('browsing');
    } else {
      setConversationStage('greeting');
      addBotMessage("What else can I help you with today?");
    }
  };

  const handleInfoCollection = async (userInput: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { type: 'user', text: userInput, time }]);

    if (!userData.businessName) {
      setUserData(prev => ({ ...prev, businessName: userInput }));
      addBotMessage(`Nice to meet you, ${userInput}! 🎉\n\nWhat industry are you in?`);
    } else if (!userData.industry) {
      setUserData(prev => ({ ...prev, industry: userInput }));
      addBotMessage(
        `${userInput} - exciting! 💼\n\nWhat's your current biggest challenge when it comes to digital presence?`
      );
    } else if (!userData.challenge) {
      setUserData(prev => ({ ...prev, challenge: userInput }));
      addBotMessage(
        `I understand. That's a common challenge we help solve.\n\nWhat's your budget range for this project?`
      );
      setConversationStage('budget');
    }
  };

  const handleBudgetSelection = (budget: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { type: 'user', text: budget, time }]);
    setUserData(prev => ({ ...prev, budget }));
    
    addBotMessage(
      `Perfect! Based on your ${budget} budget, we have great options for you.\n\nWhat's the best email to send you some free resources?`
    );
    setConversationStage('contact-email');
  };

  const handleEmailInput = (email: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { type: 'user', text: email, time }]);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addBotMessage("Please provide a valid email address so I can send you the resources.");
      return;
    }

    setUserData(prev => ({ ...prev, email }));
    
    addBotMessage(
      `Great! 📧 And what's your phone number? (We'll only use it for important updates)`
    );
    setConversationStage('contact-phone');
  };

  const handlePhoneInput = async (phone: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { type: 'user', text: phone, time }]);
    
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
      addBotMessage("Please provide a valid phone number (at least 10 digits).");
      return;
    }

    const updatedUserData = { ...userData, phone };
    setUserData(updatedUserData);
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: updatedUserData.businessName,
          industry: updatedUserData.industry,
          challenge: updatedUserData.challenge,
          budget: updatedUserData.budget,
          selected_service: updatedUserData.selectedService,
          email: updatedUserData.email,
          phone: phone,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error('Failed to save lead:', await response.text());
      }
    } catch (error) {
      console.error('Failed to save lead:', error);
    }

    deliverValue(updatedUserData);
  };

  const deliverValue = (finalUserData: UserData) => {
    const service = finalUserData.selectedService;
    const budget = finalUserData.budget;
    
    let resources = '';
    let pricing = '';
    
    switch(service) {
      case 'New Website':
        resources = '📧 Sending you:\n• Website Planning Checklist\n• Modern Design Trends Guide 2024\n• SEO Basics for Beginners\n\n';
        pricing = getWebsitePricing(budget);
        break;
      case 'Social Media Help':
        resources = '📧 Sending you:\n• Social Media Content Calendar Template\n• Engagement Boosting Strategies\n• Platform-Specific Best Practices\n\n';
        pricing = getSocialMediaPricing(budget);
        break;
      case 'Juantap Cards':
        resources = '📧 Sending you:\n• Digital Business Card Benefits Guide\n• NFC Technology Overview\n• Networking Tips for Professionals\n\n';
        pricing = getJuantapPricing(budget);
        break;
      default:
        resources = '📧 Sending you our Digital Transformation Starter Kit!\n\n';
        pricing = 'Custom pricing based on your needs.';
    }

    addBotMessage(
      `Awesome! ✨\n\n${resources}Check your email (${finalUserData.email}) - resources are on their way!\n\n💰 ${pricing}\n\n🗓️ Want to discuss this further? Contact us: infinitechcorp.ph@gmail.com\n\nAnything else I can help you with today?`,
      1500
    );
    
    setConversationStage('greeting');
  };

  const getWebsitePricing = (budget?: string) => {
    switch(budget) {
      case 'Under ₱20,000':
        return 'Recommended: Standard Package - ₱5,999/month\n• Up to 5 pages\n• Contact Form\n• Social Media Links\n• 1-Year Hosting';
      case '₱20,000 - ₱50,000':
        return 'Recommended: Premium Package - ₱9,999/month\n• Up to 10 pages\n• Dashboard Login\n• Analytics\n• Smart Chat System';
      case '₱50,000 - ₱100,000':
        return 'Recommended: Business Package - ₱14,999/month\n• SEO Pro Setup\n• eCommerce Ready\n• Admin Management\n• Lead Dashboard';
      case 'Over ₱100,000':
        return 'Recommended: Commerce Package\n• Full eCommerce System\n• Booking Calendar\n• Real-Time Notifications\n• VIP Priority Support';
      default:
        return 'Custom pricing available - let\'s discuss your needs!';
    }
  };

  const getSocialMediaPricing = (budget?: string) => {
    switch(budget) {
      case 'Under ₱20,000':
        return 'Recommended: Standard - ₱11,993/month\n• 8 Posts + 2 Reels\n• Account Setup (FB+IG+TikTok)\n• Monthly Insights';
      case '₱20,000 - ₱50,000':
        return 'Recommended: Growth - ₱18,973/month\n• 12-15 Posts + 4 Reels\n• Content Calendar\n• Full platform management';
      case '₱50,000 - ₱100,000':
        return 'Recommended: Premium - ₱32,947/month\n• 20-25 Posts + 2 Reels\n• Advanced strategies\n• Captions & Hashtags';
      default:
        return 'Recommended: Corporate - ₱47,973/month\n• 30+ Posts/Month\n• Full campaign management';
    }
  };

  const getJuantapPricing = (budget?: string) => {
    return 'JuanTap Pricing:\n• Standard: ₱588 (Freelancers)\n• Premium: ₱888 (Small Business - POPULAR)\n• Elite: ₱1,288 (VIP Clients)\n\nAll include lifetime reusability!';
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");

    switch(conversationStage) {
      case 'collect-info':
        handleInfoCollection(userMessage);
        break;
      case 'contact-email':
        handleEmailInput(userMessage);
        break;
      case 'contact-phone':
        handlePhoneInput(userMessage);
        break;
      case 'browsing':
      default:
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { type: 'user', text: userMessage, time }]);
        
        setIsTyping(true);
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
          });

          const data = await res.json();
          const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setMessages(prev => [...prev, { type: "bot", text: data.reply, time: botTime }]);
        } catch (error) {
          const errorTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setMessages(prev => [
            ...prev,
            { type: "bot", text: "⚠️ Something went wrong. Please try again.", time: errorTime }
          ]);
        } finally {
          setIsTyping(false);
        }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderQuickOptions = () => {
    if (isTyping) return null;

    if (conversationStage === 'greeting' || conversationStage === 'service-selection') {
      const serviceOptions = [
        'New Website',
        'Social Media Help',
        'Juantap Cards',
        'Just Browsing'
      ];

      return (
        <div className="pt-2">
          <p className="text-xs text-gray-500 text-center mb-3">Choose an option:</p>
          <div className="grid grid-cols-2 gap-2">
            {serviceOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleServiceSelection(option)}
                className="px-3 py-2 text-sm border-2 border-blue-900 text-blue-900 rounded-lg hover:bg-blue-900 hover:text-white transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (conversationStage === 'browsing') {
      const browsingOptions = [
        'Website & Mobile App',
        'SEO Services',
        'Graphic Design',
        'Social Media Marketing',
        'Photography & Videography',
        'JuanTap Cards',
        'Contact Info',
        'Get a Quote'
      ];

      return (
        <div className="pt-2">
          <p className="text-xs text-gray-500 text-center mb-3">Explore our services:</p>
          <div className="grid grid-cols-2 gap-2">
            {browsingOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleBrowsingOptions(option)}
                className="px-3 py-2 text-sm border-2 border-blue-900 text-blue-900 rounded-lg hover:bg-blue-900 hover:text-white transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (conversationStage === 'budget') {
      const budgetOptions = [
        'Under ₱20,000',
        '₱20,000 - ₱50,000',
        '₱50,000 - ₱100,000',
        'Over ₱100,000'
      ];

      return (
        <div className="pt-2">
          <p className="text-xs text-gray-500 text-center mb-3">Select your budget range:</p>
          <div className="grid grid-cols-2 gap-2">
            {budgetOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleBudgetSelection(option)}
                className="px-3 py-2 text-sm border-2 border-blue-900 text-blue-900 rounded-lg hover:bg-blue-900 hover:text-white transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 flex items-center justify-center shadow-xl transition-all hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Chatbot Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-10/12 md:w-96 h-[550px] md:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
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

            {/* Quick Options */}
            {renderQuickOptions()}
            
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
                placeholder={
                  conversationStage === 'contact-email' 
                    ? "Enter your email..." 
                    : conversationStage === 'contact-phone'
                    ? "Enter your phone number..."
                    : "Type your message..."
                }
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
