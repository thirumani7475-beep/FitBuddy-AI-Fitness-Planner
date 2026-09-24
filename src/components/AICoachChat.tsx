import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Dumbbell, Flame, Check } from 'lucide-react';
import { ChatMessage, FitnessPlan, Language, UserProfile } from '../types/fitness';
import { translations } from '../utils/translations';

interface AICoachChatProps {
  currentPlan: FitnessPlan;
  userProfile: UserProfile;
  streak: number;
  language: Language;
}

export const AICoachChat: React.FC<AICoachChatProps> = ({
  currentPlan,
  userProfile,
  streak,
  language,
}) => {
  const t = translations[language];
  const isTamil = language === 'ta';

  const defaultWelcomeMessage: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    text: isTamil
      ? `வணக்கம்! நான் உங்கள் FitBuddy AI பயிற்சியாளர். உங்கள் தற்போதைய திட்டம்: **${currentPlan.title}** (${streak} நாட்கள் தொடர் உடற்பயிற்சி!).\n\nஉடற்பயிற்சி முறைகள், மாற்றுப் பயிற்சிகள், உணவுக் குறிப்புகள் அல்லது உத்வேகம் பெற என்னிடம் கேளுங்கள்!`
      : `Hey there! I'm your FitBuddy AI coach. You're currently following the **${currentPlan.title}** with a **${streak}-day active streak**.\n\nAsk me anything about proper exercise biomechanics, what routine to tackle today, how to swap an exercise for joint safety, or keeping up momentum!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedActions: [
      t.chat.suggested1,
      t.chat.suggested2,
      t.chat.suggested3,
      t.chat.suggested4,
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcomeMessage]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, text: m.text })),
          userContext: {
            goal: userProfile.fitnessGoal,
            level: userProfile.experienceLevel,
            streak,
            limitations: userProfile.injuriesAndLimitations?.join(', '),
            planTitle: currentPlan.title,
          },
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get coach response.');
      }

      const assistantMsg: ChatMessage = {
        id: 'reply-' + Date.now(),
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        text: isTamil
          ? 'மன்னிக்கவும், தகவல் தொடர்பில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'I encountered an issue connecting to Gemini. Please try again shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] min-h-[500px] flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{t.chat.title}</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                Live Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-zinc-400">{t.chat.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-semibold text-zinc-200">{streak}d Streak</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                    : 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[10px] font-mono mt-1 ${
                    isUser ? 'text-emerald-200 text-right' : 'text-zinc-500'
                  }`}
                >
                  {msg.timestamp}
                </div>

                {/* Suggested Follow-up Action Chips */}
                {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(action)}
                        className="text-[11px] text-zinc-300 hover:text-emerald-300 bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 px-2.5 py-1 rounded-lg text-left transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-zinc-950 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters Bar (if only welcome message) */}
      {messages.length === 1 && (
        <div className="px-5 py-2 bg-zinc-950 border-t border-zinc-800/60 overflow-x-auto no-scrollbar flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 font-mono shrink-0">Suggested:</span>
          {[
            t.chat.suggested1,
            t.chat.suggested2,
            t.chat.suggested3,
            t.chat.suggested4,
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg whitespace-nowrap hover:border-zinc-700 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-4 bg-zinc-900/80 border-t border-zinc-800/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.chat.placeholder}
            disabled={isTyping}
            className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
