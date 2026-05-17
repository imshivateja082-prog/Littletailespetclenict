'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useRef } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

const quickQuestions = [
  '👋 Hello! What can you help me with?',
  '💉 What vaccinations does my dog need?',
  '🍖 What should I feed my puppy?',
  '✨ How often should I groom my cat?',
  '🚨 What are signs of a pet emergency?',
  '🏃 How much exercise does my dog need?',
  '🦷 How do I care for my pet\'s teeth?',
  '🛡️ How to prevent fleas and ticks?',
];

const createMessage = (role: string, content: string): Message => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  content,
  createdAt: new Date().toISOString(),
});

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/ai/chat');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      console.error('Failed to load chat history');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      await fetchHistory();
    };
    void loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = createMessage('user', text);

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const aiMessage = createMessage('assistant', data.response);

      setMessages(prev => [...prev, aiMessage]);
    } catch {
      toast.error('Failed to get response');
      // Remove the user message if failed
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-secondary flex items-center justify-center">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">AI Pet Assistant</h2>
            <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
              <Sparkles size={12} className="text-[var(--color-accent)]" />
              Powered by AI • Available 24/7
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <Card padding="none" className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !historyLoading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto rounded-full gradient-secondary flex items-center justify-center mb-4">
                <Bot size={36} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">
                Hi there, pet parent! 🐾
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto mb-6">
                I&apos;m your AI pet care assistant. Ask me anything about pet health, nutrition, grooming, vaccinations, and more!
              </p>
              
              {/* Quick Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full gradient-secondary flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-primary)] text-white rounded-tr-md'
                    : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-tl-md'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full gradient-secondary flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[var(--color-border)]">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about pet care..."
              className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              disabled={loading}
            />
            <Button type="submit" disabled={!input.trim() || loading}>
              <Send size={18} />
            </Button>
          </form>
          <p className="text-xs text-[var(--color-text-secondary)] text-center mt-2">
            AI responses are for general guidance only. Always consult a veterinarian for medical advice.
          </p>
        </div>
      </Card>
    </div>
  );
}
