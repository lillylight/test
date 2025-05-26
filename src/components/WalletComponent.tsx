'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
  ConnectWalletText,
} from '@coinbase/onchainkit/wallet';
import { FundButton, getOnrampBuyUrl } from '@coinbase/onchainkit/fund';
import {
  Avatar,
  Name,
} from '@coinbase/onchainkit/identity';
import { useAccount, useBalance } from 'wagmi';

export function WalletComponent() {
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);

  // Fetch wallet balance
  const { data: balanceData } = useBalance({
    address: address,
    // Note: removed 'watch: true' as it's not supported in this version
  });

  // Handle client-side mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected) {
      console.log('Wallet is connected');
    }
  }, [isConnected]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const projectId = ' '; // TODO: Fill with your real projectId
  const onrampBuyUrl = getOnrampBuyUrl({
    projectId,
    addresses: { '0x1': ['base'] },
    assets: ['USDC'],
    presetFiatAmount: 20,
    fiatCurrency: 'USD',
    redirectUrl: 'https://yourapp.com/onramp-return?param=foo',
  });

  function handleFundWithCash() {
    window.open(onrampBuyUrl, '_blank');
    setShowFundModal(false);
  }

  if (!mounted) {
    return (
      <div className="flex justify-end p-4 relative sm:p-2">
        <div className="absolute right-4 top-4 w-40 h-12 pointer-events-none sm:w-32 sm:h-10">
          <div className="absolute inset-0 rounded-full blur-md opacity-20 bg-gradient-to-r from-gray-400 to-gray-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end p-4 relative sm:p-2">
      {/* Subtle background glow effect - positioned behind the button */}
      <div className="absolute right-4 top-4 w-40 h-12 pointer-events-none sm:w-32 sm:h-10">
        <div className={`absolute inset-0 rounded-full blur-md opacity-20 ${isConnected ? 'bg-gradient-to-r from-green-400 to-indigo-500' : 'bg-gradient-to-r from-indigo-400 to-purple-500'}`}></div>
      </div>

      <Wallet>
        <ConnectWallet 
          className={`
            ${isConnected 
              ? 'bg-gradient-to-r from-green-600 to-indigo-600 border border-green-400/30' 
              : 'bg-gradient-to-r from-indigo-600 to-green-600 border border-indigo-500/30'
            } 
            transition-all
            duration-300
            ease-in-out
            hover:translate-y-[-2px]
            hover:shadow-[0_0_15px_rgba(74,222,128,0.5)]
            rounded-full 
            py-2.5
            px-5
            shadow-lg
            flex items-center
            gap-2
          `}
        >
          {isConnected && (
            <div className="mr-2 relative">
              <motion.div 
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute w-2 h-2 bg-green-400 rounded-full right-0 top-0 opacity-70"
              ></motion.div>
              <div className="absolute w-2 h-2 bg-green-500 rounded-full right-0 top-0"></div>
            </div>
          )}
          <Avatar className="h-6 w-6" />
          <ConnectWalletText>
            {isConnected ? '' : 'Connect Wallet'}
          </ConnectWalletText>
          <Name className="font-medium" />
        </ConnectWallet>
        <WalletDropdown className="!bg-transparent !shadow-none !border-0 !overflow-visible w-full max-w-[220px] sm:max-w-[180px] right-0 origin-top-right z-50">
          <div className="bg-[#111218] rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
            <div className="p-4 pb-2">
              <div className="uppercase text-gray-400 text-xs font-semibold mb-1">BALANCE</div>
              <div className="flex items-center text-white text-lg font-bold mb-4">
                <svg className="h-5 w-5 mr-2 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {balanceData ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : '0.0000 ETH'}
              </div>
            </div>
            <div className="py-2 px-2">
              <WalletDropdownLink
                className="py-3 rounded-xl flex items-center bg-gray-800 hover:bg-gray-700 text-white font-medium pl-4 pr-2 my-1 transition-all duration-200 border border-gray-700 hover:translate-y-[-2px]"
                icon="wallet"
                href="https://keys.coinbase.com"
              >
                Wallet
              </WalletDropdownLink>
              <FundButton
                className="w-full py-3 rounded-xl flex items-center justify-start bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-200 my-1 pl-4 pr-2"
                text="Add Funds"
                hideIcon={false}
                openIn="tab"
              />
              <div className="pt-2 pb-2">
                <WalletDropdownDisconnect className="w-full bg-gray-800 hover:bg-red-900 transition-all duration-200 py-3 rounded-xl text-white font-medium border border-gray-700 hover:border-red-500 hover:translate-y-[-2px]" />
              </div>
            </div>
          </div>
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
