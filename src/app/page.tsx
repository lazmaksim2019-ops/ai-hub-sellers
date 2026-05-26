'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import CardGenerator from '@/components/CardGenerator';
import SmartResponder from '@/components/SmartResponder';
import IntegrationTerminal from '@/components/IntegrationTerminal';
import type { Marketplace } from '@/types';

export default function Home() {
  const [marketplace, setMarketplace] = useState<Marketplace>('ozon');

  return (
    <div className="flex flex-col min-h-screen bg-tma-bg">
      <Header marketplace={marketplace} onMarketplaceChange={setMarketplace} />

      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-4 space-y-4 pb-8">
        <CardGenerator marketplace={marketplace} />
        <SmartResponder />
        <IntegrationTerminal />
      </main>
    </div>
  );
}
