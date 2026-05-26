'use client';

import { Bot, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Marketplace } from '@/types';

interface HeaderProps {
  marketplace: Marketplace;
  onMarketplaceChange: (m: Marketplace) => void;
}

const MARKETPLACE_LABELS: Record<Marketplace, { label: string; color: string }> = {
  ozon: { label: 'Ozon', color: '#005BFF' },
  wildberries: { label: 'Wildberries', color: '#CB11AB' },
};

export default function Header({ marketplace, onMarketplaceChange }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-tma-bg/95 backdrop-blur-lg border-b border-tma-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tma-accent to-blue-400 flex items-center justify-center shadow-lg shadow-tma-accent/20">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-white">AI Hub Sellers</h1>
            <p className="text-[10px] text-tma-muted leading-tight">Мультимодальный AI-хаб</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tma-card border border-tma-border text-xs font-medium text-white hover:bg-tma-border/50 transition-colors"
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: MARKETPLACE_LABELS[marketplace].color }}
            />
            {MARKETPLACE_LABELS[marketplace].label}
            <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 w-40 bg-tma-card border border-tma-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {(Object.entries(MARKETPLACE_LABELS) as [Marketplace, { label: string; color: string }][]).map(
                  ([key, mp]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onMarketplaceChange(key);
                        setOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-3.5 py-2.5 text-xs transition-colors ${
                        marketplace === key
                          ? 'bg-tma-accent/10 text-tma-accent'
                          : 'text-tma-muted hover:text-white hover:bg-tma-border/30'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mp.color }} />
                      {mp.label}
                    </button>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
