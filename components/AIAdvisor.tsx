import React, { useState, useRef, useEffect } from 'react';
import { getAgriculturalAdvice, identifyPestOrDisease } from '../services/geminiService';
import { ChatMessage, CropType } from '../types';
import { CROPS } from '../constants';

interface AIAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdvisorMode = 'general' | 'pest' | 'crop';

const AIAdvisor: React.FC<AIAdvisorProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AdvisorMode>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Mhoro! I am your Urban Farming Assistant. Ask me anything about growing crops in Zimbabwe, dealing with pests, or saving water.'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const processMessage = async (text: string, displayOverride?: string) => {
    if (loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: displayOverride || text
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    let responseText = '';
    try {
        if (mode === 'pest') {
            responseText = await identifyPestOrDisease(text);
        } else {
            // Both general and crop modes use the main advice function
            responseText = await getAgriculturalAdvice(text);
        }
    } catch (e) {
        responseText = "Sorry, I encountered an error getting that information.";
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText
    };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const handleSendClick = () => {
      if (!input.trim()) return;
      processMessage(input);
  };

  const handleCropSelect = (cropType: CropType) => {
      const crop = CROPS[cropType];
      const query = `Provide a detailed guide for growing ${crop.name} in Zimbabwe urban settings. Include: 
      1. Best planting season 
      2. Watering requirements 
      3. Common Zimbabwean pests affecting it 
      4. Harvest signs.`;
      
      processMessage(query, `Tell me about growing ${crop.name}`);
  };

  const suggestions = [
    "How do I grow tomatoes in a bucket?",
    "Natural remedies for aphids?",
    "Best crops for winter in Harare?",
    "How often should I water rape?"
  ];

  const pestSuggestions = [
    "White spots on my spinach leaves",
    "Tomato leaves turning yellow and curling",
    "Tiny black bugs on my beans",
    "Holes in cabbage leaves"
  ];

  const getThemeColor = () => {
      switch(mode) {
          case 'pest': return 'amber';
          case 'crop': return 'blue';
          default: return 'emerald';
      }
  };

  const theme = getThemeColor();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={onClose} />
      
      <div className="relative w-full sm:w-[500px] h-[80vh] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto animate-slide-up sm:animate-pop-in">
        {/* Header */}
        <div className={`p-4 text-white flex justify-between items-center shadow-md transition-colors duration-300 bg-${theme}-600`}>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
               <i className={`fas ${mode === 'pest' ? 'fa-bug' : mode === 'crop' ? 'fa-seedling' : 'fa-robot'} text-sm`}></i>
             </div>
             <div>
               <h2 className="font-bold">
                   {mode === 'pest' ? 'Pest Detective' : mode === 'crop' ? 'Crop Guide' : 'AgriBot Zimbabwe'}
               </h2>
               <p className="text-xs text-white/80">Powered by Gemini AI</p>
             </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? `bg-${theme}-600 text-white rounded-tr-none`
                    : 'bg-white text-stone-800 rounded-tl-none border border-stone-200'}
                `}
              >
                 {msg.role === 'model' ? (
                   <div className={`prose prose-sm prose-${theme}`} dangerouslySetInnerHTML={{ 
                     // Simple bold parsing for better reading
                     __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') 
                   }} />
                 ) : msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-stone-200 flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full animate-bounce bg-${theme}-400`} style={{ animationDelay: '0ms' }}></div>
                 <div className={`w-2 h-2 rounded-full animate-bounce bg-${theme}-400`} style={{ animationDelay: '150ms' }}></div>
                 <div className={`w-2 h-2 rounded-full animate-bounce bg-${theme}-400`} style={{ animationDelay: '300ms' }}></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-stone-200">
          {/* Mode Toggles */}
          <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
             <button 
                onClick={() => setMode('general')} 
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-colors border ${mode === 'general' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
             >
                🤖 General
             </button>
             <button 
                onClick={() => setMode('crop')} 
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-colors border flex items-center gap-1 ${mode === 'crop' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
             >
                <i className="fas fa-seedling"></i> Crops
             </button>
             <button 
                onClick={() => setMode('pest')} 
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-colors border flex items-center gap-1 ${mode === 'pest' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
             >
                <i className="fas fa-bug"></i> Pest ID
             </button>
          </div>

          {/* Contextual Suggestions / Chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {mode === 'crop' ? (
                  // Crop Chips
                   Object.values(CROPS)
                    .filter(c => c.type !== CropType.EMPTY)
                    .map((crop) => (
                        <button
                            key={crop.type}
                            onClick={() => handleCropSelect(crop.type)}
                            className="whitespace-nowrap px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 shadow-sm"
                        >
                            <span className="text-sm">{crop.icon}</span> {crop.name}
                        </button>
                    ))
              ) : (
                  // General/Pest Suggestions
                  (mode === 'pest' ? pestSuggestions : suggestions).map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => setInput(s)}
                      className={`whitespace-nowrap px-3 py-1 text-xs rounded-full border transition-colors
                         ${mode === 'pest' 
                           ? 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' 
                           : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}
                      `}
                    >
                      {s}
                    </button>
                  ))
              )}
          </div>
          
          {/* Text Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendClick()}
              placeholder={
                  mode === 'pest' ? "Describe the pest..." : 
                  mode === 'crop' ? "Ask specifically about a crop..." : 
                  "Ask about farming..."
              }
              className={`flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all
                  ${mode === 'pest' ? 'border-amber-200 focus:ring-amber-500' : 
                    mode === 'crop' ? 'border-blue-200 focus:ring-blue-500' :
                    'border-stone-300 focus:ring-emerald-500'}
              `}
            />
            <button
              onClick={handleSendClick}
              disabled={loading || !input.trim()}
              className={`w-10 h-10 text-white rounded-full flex items-center justify-center transition-all shadow-md disabled:opacity-50 
                  ${mode === 'pest' ? 'bg-amber-600 hover:bg-amber-700' : 
                    mode === 'crop' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-emerald-600 hover:bg-emerald-700'}
              `}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;