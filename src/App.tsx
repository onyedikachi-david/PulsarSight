import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChainBanner from './components/ChainBanner';
import PriceSection from './components/PriceSection';
import StatsPanel from './components/StatsPanel';
import BlockList from './components/BlockList';
import TransactionList from './components/TransactionList';
import RecentTransactionsPage from './pages/transactions/recent';
import BlocksPage from './pages/blocks';

function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ChainBanner 
        chainName="Soon Network"
        blockHeight={0}
        lastBlockTime=""
        networkStatus="online"
        tps={0}
        latency="0ms"
      />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <PriceSection 
            price={0}
            priceChange24h={0}
            volume24h={0}
            marketCap={0}
            circulatingSupply={0}
            totalSupply={0}
          />
        </div>
        <div className="space-y-6">
          <StatsPanel
            title="Active Validators"
            value="100 out of 208"
            percentage={56}
          />
          <StatsPanel
            title="Online Voting Power"
            value="544.10m from 544.10m"
            percentage={80}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <BlockList />
        <TransactionList />
      </div>
    </div>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onToggleSidebar={handleToggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions/recent" element={<RecentTransactionsPage />} />
            <Route path="/blocks" element={<BlocksPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}