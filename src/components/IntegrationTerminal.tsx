'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, RefreshCw, CheckCircle2, Info, AlertCircle, Loader2 } from 'lucide-react';
import type { TerminalLog } from '@/types';
import { TERMINAL_STEPS } from '@/data/mock';

const TYPE_CONFIG = {
  INFO: { color: '#6C7883', icon: Info },
  SUCCESS: { color: '#4CAF50', icon: CheckCircle2 },
  PROCESS: { color: '#2481CC', icon: Loader2 },
  ERROR: { color: '#F44336', icon: AlertCircle },
};

export default function IntegrationTerminal() {
  const [logs, setLogs] = useState<TerminalLog[]>([
    { id: 0, type: 'INFO', message: 'Терминал готов. Ожидание команды...' },
  ]);
  const [syncing, setSyncing] = useState(false);
  const [currentMarketplace, setCurrentMarketplace] = useState<'Ozon' | 'Wildberries'>('Ozon');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);

    const baseSteps = TERMINAL_STEPS.map((step, i) => ({
      ...step,
      message: step.message === 'Подключение к API маркетплейса...'
        ? `Подключение к API ${currentMarketplace}...`
        : step.message,
      id: i + 1,
    }));

    setLogs((prev) => [
      ...prev,
      { id: Date.now(), type: 'INFO', message: `Запуск синхронизации с ${currentMarketplace}...` },
    ]);

    for (const step of baseSteps) {
      await new Promise((r) => setTimeout(r, 700 + Math.random() * 800));
      setLogs((prev) => [...prev, step as TerminalLog]);
    }

    setLogs((prev) => [
      ...prev,
      { id: Date.now() + 999, type: 'SUCCESS', message: '✓ Синхронизация завершена успешно.' },
    ]);
    setSyncing(false);
  }, [syncing, currentMarketplace]);

  const handleClear = () => {
    setLogs([
      { id: Date.now(), type: 'INFO', message: 'Терминал очищен. Ожидание команды...' },
    ]);
  };

  return (
    <section className="rounded-2xl bg-tma-card border border-tma-border overflow-hidden">
      <div className="px-4 py-3.5 border-b border-tma-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
            <Terminal size={16} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Интеграционный терминал</h2>
            <p className="text-[10px] text-tma-muted">Синхронизация с маркетплейсом</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="px-2.5 py-1 rounded-lg text-[11px] text-tma-muted hover:text-white hover:bg-tma-border/30 transition-all"
        >
          Очистить
        </button>
      </div>

      <div className="p-4 space-y-3">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {syncing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs">Выполняется синхронизация...</span>
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Синхронизировать с маркетплейсом
            </>
          )}
        </button>

        <div
          ref={terminalRef}
          className="bg-tma-secondary-bg border border-tma-border rounded-xl p-3 h-44 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1"
        >
          <AnimatePresence mode="popLayout">
            {logs.map((log) => {
              const Icon = TYPE_CONFIG[log.type].icon;
              const color = TYPE_CONFIG[log.type].color;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-1.5"
                >
                  <span className="flex-shrink-0 pt-0.5">
                    {log.type === 'PROCESS' ? (
                      <Icon size={11} color={color} className="animate-spin" />
                    ) : (
                      <Icon size={11} color={color} />
                    )}
                  </span>
                  <span className="text-tma-muted">[{log.type}]</span>
                  <span className="text-white/80">{log.message}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {syncing && (
            <span className="inline-flex gap-0.5 pt-0.5">
              <span className="w-1 h-1 bg-tma-muted rounded-full animate-pulse-dot" />
              <span className="w-1 h-1 bg-tma-muted rounded-full animate-pulse-dot" />
              <span className="w-1 h-1 bg-tma-muted rounded-full animate-pulse-dot" />
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
