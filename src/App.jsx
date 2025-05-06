import React, { useState, useEffect } from 'react';
import { UserButton, useUser, CivicAuthProvider } from '@civic/auth-web3/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import 'bootstrap/dist/css/bootstrap.min.css';
import {
  WagmiProvider,
  createConfig,
  useAccount,
  useConnect,
  useBalance,
  http
} from 'wagmi';
import { embeddedWallet } from '@civic/auth-web3/wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { userHasWallet } from '@civic/auth-web3';
import { useAutoConnect } from '@civic/auth-web3/wagmi';
import LandingPageLayout from './LandingPageLayout';

// Create query client for React Query
const queryClient = new QueryClient();

// Setup Wagmi configuration
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [embeddedWallet()],
});

// Function to create wallet if not existing
const createWallet = async (userContext) => {
  if (userContext && userContext.user && !userHasWallet(userContext)) {
    await userContext.createWallet();
  }
};

// Function to connect existing wallet
const connectExistingWallet = async (connectors, connect) => {
  await connect({ connector: connectors[0] });
};

// Navbar Component
function Navbar({ onWalletClick, onBusinessCardClick, onSignOutClick, onSignInClick, isLoggedIn }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">DeFi Card</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button className="btn btn-primary" onClick={onWalletClick}>My Wallet</button>
            </li>
            <li className="nav-item">
              <button className="btn btn-secondary" onClick={onBusinessCardClick}>Generate Your Business Card</button>
            </li>
         
          </ul>
        </div>
      </div>
    </nav>
  );
}

// Main App Content Component
function AppContent() {
  const [view, setView] = useState('wallet');  // 'wallet' or 'business-card'
  const userContext = useUser();
  const { isConnected, address } = useAccount();
  const { connectors, connect, disconnect } = useConnect();
  const balance = useBalance({ address });
  const [isLoggedIn, setIsLoggedIn] = useState(isConnected);

  useAutoConnect();

  useEffect(() => {
    if (userContext && userContext.user && !userHasWallet(userContext)) {
      createWallet(userContext);
    }
    setIsLoggedIn(isConnected);
  }, [userContext, isConnected]);

  const handleWalletClick = () => {
    if (!isConnected) {
      connectExistingWallet(connectors, connect);
    }
    setView('wallet');
  };

  const handleBusinessCardClick = () => {
    setView('business-card');
  };

  const handleSignOutClick = () => {
    if (userContext) {
      userContext.signOut();  // Sign out from CivicAuth
    }
    disconnect();  // Disconnect wallet using Wagmi
    setIsLoggedIn(false);  // Update login status
    setView('wallet');  // Reset view to wallet after sign-out
  };

  const handleSignInClick = async () => {
    if (!userContext.user) {
      try {
        await userContext.signIn(); // Trigger the CivicAuth sign-in prompt
      } catch (error) {
        console.error('Sign-In Error:', error);
      }
    }
  };

  return (
    <>
      <Navbar 
        onWalletClick={handleWalletClick} 
        onBusinessCardClick={handleBusinessCardClick}
        onSignOutClick={handleSignOutClick}
        onSignInClick={handleSignInClick}
        isLoggedIn={isLoggedIn}
      />
      <div className="container mt-4">
        {view === 'wallet' && (
          <div className="card p-4">
            <UserButton />
            {!isLoggedIn ? (
              <div className="card-body">
                <h2 className="card-title">Please Sign In</h2>
                <p>To view your wallet, you need to sign in first.</p>
              </div>
            ) : (
              userContext.user && userHasWallet(userContext) && (
                <div className="card-body">
                  <h2 className="card-title"> Your Wallet</h2>
                  <p><strong>Wallet Address:</strong> <code>{address}</code></p>
                  <p><strong>Balance:</strong> {
                    balance?.data
                      ? `${(BigInt(balance.data.value) / BigInt(1e18)).toString()} ${balance.data.symbol}`
                      : 'Loading...'
                  }</p>

                  {isConnected ? (
                    <p className="text-success">✅ Wallet Connected</p>
                  ) : null}
                </div>
              )
            )}
          </div>
        )}

        {view === 'business-card' && (
          <div className="card p-4">
            <UserButton />
            {userContext.user && userHasWallet(userContext) && (
              <div className="card-body">
                <h2 className="card-title">🪪 Your DeFi Business Card</h2>
                <p><strong>Name:</strong> DeFi Builder #{address?.slice(-4)}</p>
                <p><strong>Wallet:</strong> <code>{address}</code></p>
                <p><strong>Balance:</strong> {
                  balance?.data
                    ? `${(BigInt(balance.data.value) / BigInt(1e18)).toString()} ${balance.data.symbol}`
                    : 'Loading...'
                }</p>

                {isConnected ? (
                  <>
                    <p className="text-success">✅ Wallet Connected</p>
                    <button className="btn btn-success mt-3" onClick={() => window.print()}>
                      🖨️ Print or Save
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Main App Component (Including providers and layout)
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <CivicAuthProvider clientId="0569cf62-3392-4cba-876e-2944412088fb">
          <LandingPageLayout>
            <AppContent />
          </LandingPageLayout>
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
