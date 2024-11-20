import React from 'react';
import { Link2, MessageCircle, Twitter } from 'lucide-react';

export default function ChainBanner() {
  return (
    <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-xl p-6 text-white mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-full p-2">
            <img 
              src="https://raw.githubusercontent.com/zetachain-protocol/assets/main/logos/zeta_logo.svg" 
              alt="Zetachain"
              className="w-12 h-12"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ZETACHAIN</h1>
            <p className="text-red-200 text-sm">zetachain_7000-1</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <MessageCircle className="w-6 h-6 text-white/80 hover:text-white cursor-pointer" />
          <Twitter className="w-6 h-6 text-white/80 hover:text-white cursor-pointer" />
          <Link2 className="w-6 h-6 text-white/80 hover:text-white cursor-pointer" />
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-8 mt-8">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/10 rounded">
              <img src="https://raw.githubusercontent.com/zetachain-protocol/assets/main/logos/zeta_logo.svg" alt="" className="w-4 h-4" />
            </div>
            <span className="text-sm text-red-100">Latest block</span>
          </div>
          <p className="text-xl font-semibold mt-1">2,260,890</p>
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/10 rounded">
              <img src="https://raw.githubusercontent.com/zetachain-protocol/assets/main/logos/zeta_logo.svg" alt="" className="w-4 h-4" />
            </div>
            <span className="text-sm text-red-100">Block Time</span>
          </div>
          <p className="text-xl font-semibold mt-1">10.65s</p>
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/10 rounded">
              <img src="https://raw.githubusercontent.com/zetachain-protocol/assets/main/logos/zeta_logo.svg" alt="" className="w-4 h-4" />
            </div>
            <span className="text-sm text-red-100">APR</span>
          </div>
          <p className="text-xl font-semibold mt-1">~15.16%</p>
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/10 rounded">
              <img src="https://raw.githubusercontent.com/zetachain-protocol/assets/main/logos/zeta_logo.svg" alt="" className="w-4 h-4" />
            </div>
            <span className="text-sm text-red-100">Inflation</span>
          </div>
          <p className="text-xl font-semibold mt-1">8%</p>
        </div>
      </div>
    </div>
  );
}