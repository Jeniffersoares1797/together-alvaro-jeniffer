"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Heart, Smile, Flame, ThumbsUp } from "lucide-react";
import { ChatMessage } from "@/types";

const QUICK_REACTIONS = ["❤️", "🥰", "😂", "👏", "🔥", "☕", "✨"];

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onSendReaction: (emoji: string) => void;
}

export function ChatDrawer({
  isOpen,
  onClose,
  messages,
  currentUserId,
  onSendMessage,
  onSendReaction,
}: ChatDrawerProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 z-40 w-full sm:w-96 glass-panel border-l border-white/10 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <h3 className="text-sm font-semibold text-[#f4ede2]">
            Chat da Sala
          </h3>
          <span className="text-[11px] text-stone-400">({messages.length})</span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
            <Sparkles className="w-8 h-8 text-amber-500/40 mb-2" />
            <p className="text-xs text-stone-400">Nenhuma mensagem ainda.</p>
            <p className="text-[11px] text-stone-500 mt-1">Diga um oi aconchegante ou envie um coração!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="text-[11px] text-stone-400/80 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 inline-block">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  <span className="text-[11px] font-medium text-stone-300">
                    {isMe ? "Você" : msg.senderName}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? "bg-gradient-to-r from-amber-600/90 to-amber-500/90 text-stone-950 font-medium rounded-tr-sm shadow-md"
                      : "bg-stone-900/90 border border-white/10 text-stone-200 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reactions Bar */}
      <div className="px-4 py-2 border-t border-white/[0.05] bg-black/30 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSendReaction(emoji)}
            className="text-base p-1.5 rounded-xl hover:bg-white/10 active:scale-125 transition-transform"
            title={`Reagir com ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/[0.08] bg-black/40">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escreva algo com carinho..."
            className="w-full pl-4 pr-12 py-3 rounded-2xl bg-stone-900 border border-white/10 text-xs text-[#f4ede2] placeholder:text-stone-500 focus:outline-none focus:border-amber-400/50"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2 p-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-stone-950 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
