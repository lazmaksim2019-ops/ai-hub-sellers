'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bot, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import type { Sentiment, ReviewAnalysisResult } from '@/types';

const SENTIMENT_CONFIG: Record<Sentiment, { label: string; icon: typeof ThumbsUp; color: string }> = {
  positive: { label: 'Позитивный', icon: ThumbsUp, color: '#4CAF50' },
  negative: { label: 'Негативный', icon: ThumbsDown, color: '#F44336' },
  neutral: { label: 'Нейтральный', icon: Minus, color: '#FF9800' },
};

export default function SmartResponder() {
  const [reviewText, setReviewText] = useState('');
  const [result, setResult] = useState<ReviewAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!reviewText.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/analyze-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reviewText.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert('Ошибка анализа: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const SentimentIcon = result ? SENTIMENT_CONFIG[result.sentiment].icon : null;

  return (
    <section className="rounded-2xl bg-tma-card border border-tma-border overflow-hidden">
      <div className="px-4 py-3.5 border-b border-tma-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
          <MessageSquare size={16} className="text-green-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Умный авто-ответчик</h2>
          <p className="text-[10px] text-tma-muted">AI-анализ и ответ на отзывы</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-tma-muted mb-1.5">
            Текст отзыва покупателя
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Вставьте отзыв с маркетплейса..."
            rows={4}
            className="w-full bg-tma-secondary-bg border border-tma-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-tma-muted/50 resize-none focus:outline-none focus:border-tma-accent/50 focus:ring-1 focus:ring-tma-accent/20 transition-all"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !reviewText.trim()}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium hover:from-green-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse-dot" />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse-dot" />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse-dot" />
              </div>
              <span className="text-xs">Анализируем отзыв...</span>
            </>
          ) : (
            <>
              <Bot size={16} />
              Анализировать и ответить
            </>
          )}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 12, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-3 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-tma-muted">Тональность:</span>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                  style={{
                    backgroundColor: `${SENTIMENT_CONFIG[result.sentiment].color}15`,
                    color: SENTIMENT_CONFIG[result.sentiment].color,
                  }}
                >
                  {SentimentIcon && <SentimentIcon size={12} />}
                  {SENTIMENT_CONFIG[result.sentiment].label}
                </span>
              </div>

              <div className="bg-tma-secondary-bg border border-tma-border rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bot size={13} className="text-tma-accent" />
                  <span className="text-[10px] font-medium text-tma-accent uppercase tracking-wider">
                    Рекомендуемый ответ
                  </span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">{result.suggestedReply}</p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.suggestedReply);
                }}
                className="w-full py-2 rounded-lg border border-tma-border text-[11px] font-medium text-tma-muted hover:text-white hover:bg-tma-border/30 transition-all"
              >
                Копировать ответ
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
