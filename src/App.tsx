import React, { useState, useEffect } from 'react';
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
import TransactionPage from './pages/transactions/detail';
import BlockDetailPage from './pages/blocks/detail';
import SearchPage from './pages/search';
import { RPC_URL, rpcGraphQL } from './utils/rpc';
import { BarChart2, Activity, Shield, Users, Zap, Clock } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { createSolanaRpc } from '@solana/rpc';

interface NetworkStats {
  blockHeight: number;
  lastBlockTime: string;
  tps: number;
  latency: string;
  activeValidators: number;
  totalValidators: number;
  votingPower: number;
  totalPower: number;
}

function Dashboard() {
  const [stats, setStats] = useState<NetworkStats>({
    blockHeight: 0,
    lastBlockTime: '',
    tps: 0,
    latency: '0ms',
    activeValidators: 0,
    totalValidators: 0,
    votingPower: 0,
    totalPower: 0
  });

  const [loading, setLoading] = useState(true);

  const fetchNetworkStats = async () => {
    try {
      const rpc = createSolanaRpc(RPC_URL);
      const latestSlot = await rpc.getSlot().send();

      const source = `
        query GetNetworkStats($slot: Slot!) {
          block(slot: $slot) {
            blockhash
            blockTime
            parentSlot
            transactions {
              signatures
            }
          }
        }
      `;

      const result = await rpcGraphQL.query(source, {
        slot: latestSlot.toString()
      });

      if (result?.data?.block) {
        const block = result.data.block;
        setStats({
          blockHeight: Number(latestSlot),
          lastBlockTime: new Date(Number(block.blockTime) * 1000).toLocaleString(),
          tps: block.transactions?.length || 0,
          latency: `${Math.random() * 100 + 200}ms`, // Example latency
          activeValidators: Math.floor(Math.random() * 50 + 150), // Example data
          totalValidators: 208,
          votingPower: 544.10,
          totalPower: 544.10
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching network stats:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkStats();
    const interval = setInterval(fetchNetworkStats, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-purple-100 dark:border-purple-900/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Network Status</h2>
                <p className="text-sm text-gray-500">Real-time network metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {loading ? 'Updating...' : 'Live'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon={<Clock className="w-5 h-5" />}
              label="Block Height"
              value={stats.blockHeight.toLocaleString()}
              trend="+1 block/400ms"
            />
            <MetricCard
              icon={<Zap className="w-5 h-5" />}
              label="TPS"
              value={stats.tps.toString()}
              trend="Last block"
            />
            <MetricCard
              icon={<Shield className="w-5 h-5" />}
              label="Active Validators"
              value={`${stats.activeValidators}/${stats.totalValidators}`}
              trend={`${((stats.activeValidators / stats.totalValidators) * 100).toFixed(1)}% online`}
            />
            <MetricCard
              icon={<Users className="w-5 h-5" />}
              label="Voting Power"
              value={`${stats.votingPower}M`}
              trend={`${((stats.votingPower / stats.totalPower) * 100).toFixed(1)}% of total`}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-purple-100 dark:border-purple-900/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Network Activity</h2>
                <p className="text-sm text-gray-500">Transaction volume trend</p>
              </div>
            </div>
          </div>

          <div className="h-[200px]">
            <Line
              data={{
                labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
                datasets: [{
                  label: 'Transactions',
                  data: [65, 59, 80, 81, 56, 55, 40],
                  borderColor: 'rgb(99, 102, 241)',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  tension: 0.4,
                  fill: true,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(99, 102, 241, 0.1)',
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

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
            value={`${stats.activeValidators} out of ${stats.totalValidators}`}
            percentage={Math.round((stats.activeValidators / stats.totalValidators) * 100)}
          />
          <StatsPanel
            title="Online Voting Power"
            value={`${stats.votingPower}m from ${stats.totalPower}m`}
            percentage={Math.round((stats.votingPower / stats.totalPower) * 100)}
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

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}

function MetricCard({ icon, label, value, trend }: MetricCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
      <div className="flex items-center space-x-2 mb-2">
        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
          {icon}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trend}</div>
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
            <Route path="/transactions" element={<RecentTransactionsPage />} />
            <Route path="/tx/:txid" element={<TransactionPage />} />
            <Route path="/blocks" element={<BlocksPage />} />
            <Route path="/block/:slot" element={<BlockDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}