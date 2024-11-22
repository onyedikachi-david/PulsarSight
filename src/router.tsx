import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RecentTransactionsPage from './pages/transactions/recent';
import TransactionDetailPage from './pages/transactions/detail';
import BlocksPage from './pages/blocks';
import BlockDetailPage from './pages/blocks/detail';
import SearchPage from './pages/search';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home redirects to recent transactions */}
        <Route path="/" element={<Navigate to="/transactions" replace />} />
        
        {/* Transaction Routes */}
        <Route path="/transactions" element={<RecentTransactionsPage />} />
        <Route path="/tx/:txid" element={<TransactionDetailPage />} />
        
        {/* Block Routes */}
        <Route path="/blocks" element={<BlocksPage />} />
        <Route path="/block/:slot" element={<BlockDetailPage />} />
        
        {/* Search Route */}
        <Route path="/search" element={<SearchPage />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
