'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Hash, DollarSign, Bot } from 'lucide-react';
import type { Marketplace, SEOGenerationResult } from '@/types';
import ImageUploader from './ImageUploader';

interface CardGeneratorProps {
  marketplace: Marketplace;
}

const CATEGORIES = [
  'Электроника', 'Одежда и аксессуары', 'Товары для дома',
  'Красота и здоровье', 'Спорт и фитнес', 'Детские товары',
  'Автотовары', 'Зоотовары', 'Продукты питания', 'Канцелярия',
];

const STEPS = [
  'ИИ анализирует товар...',
  'Генерация SEO-описания...',
  'Подбор тегов...',
  'Анализ цен...',
];

export default function CardGenerator({ marketplace }: CardGeneratorProps) {
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<SEOGenerationResult | null>(null);

  const handleGenerate = async () => {
    if (!name.trim() || !category) return;
    setLoading(true);
    setResult(null);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const res = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), category, marketplace }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert('Ошибка генерации: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setCurrentStep(0);
    }
  };

  const canGenerate = name.trim() && category;

  return (
    <section className="rounded-2xl bg-tma-card border border-tma-border overflow-hidden">
      <div className="px-4 py-3.5 border-b border-tma-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tma-accent/20 to-blue-500/20 flex items-center justify-center">
          <Sparkles size={16} className="text-tma-accent" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Генератор карточек</h2>
          <p className="text-[10px] text-tma-muted">AI-оптимизация товаров для {marketplace === 'ozon' ? 'Ozon' : 'Wildberries'}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <ImageUploader onImageSelect={setImage} disabled={loading} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-medium text-tma-muted mb-1.5">
              Название товара
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название..."
              className="w-full bg-tma-secondary-bg border border-tma-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-tma-muted/50 focus:outline-none focus:border-tma-accent/50 focus:ring-1 focus:ring-tma-accent/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-tma-muted mb-1.5">
              Категория
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-tma-secondary-bg border border-tma-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-tma-accent/50 focus:ring-1 focus:ring-tma-accent/20 transition-all appearance-none"
            >
              <option value="" className="bg-tma-secondary-bg">Выберите категорию</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-tma-secondary-bg">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !canGenerate}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-tma-accent to-blue-500 text-white text-sm font-medium hover:from-blue-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-tma-accent/10"
        >
          {loading ? (
            <>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse-dot" />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse-dot" />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse-dot" />
              </div>
              <span className="text-xs">{STEPS[currentStep]}</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Сгенерировать SEO-карточку
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
              <div className="bg-tma-secondary-bg border border-tma-border rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bot size={13} className="text-tma-accent" />
                  <span className="text-[10px] font-medium text-tma-accent uppercase tracking-wider">
                    SEO-описание
                  </span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">{result.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {result.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tma-accent/10 border border-tma-accent/20 text-[11px] font-medium text-tma-accent"
                  >
                    <Hash size={10} />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="bg-gradient-to-r from-tma-accent/5 to-blue-500/5 border border-tma-accent/20 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-tma-accent" />
                  <span className="text-[11px] font-medium text-tma-muted">Рекомендованная цена</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {result.recommendedPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <button
                onClick={() => {
                  const text = `SEO-описание:\n${result.description}\n\nТеги: ${result.tags.join(', ')}\n\nРекомендованная цена: ${result.recommendedPrice} ₽`;
                  navigator.clipboard.writeText(text);
                }}
                className="w-full py-2 rounded-lg border border-tma-border text-[11px] font-medium text-tma-muted hover:text-white hover:bg-tma-border/30 transition-all"
              >
                Копировать всё
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
