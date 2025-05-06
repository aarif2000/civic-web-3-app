import React, { useEffect } from 'react';
import { UserButton, useUser, CivicAuthProvider } from '@civic/auth-web3/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [embeddedWallet()],
});

const createWallet = async (userContext) => {
  if (userContext.user && !userHasWallet(userContext)) {
    await userContext.createWallet();
  }
};

const connectExistingWallet = async (connectors, connect) => {
  await connect({ connector: connectors[0] });
};

function AppContent() {
  const userContext = useUser();
  useAutoConnect();

  const { isConnected, address } = useAccount();
  const { connectors, connect } = useConnect();
  const balance = useBalance({ address });

  // Automatically create wallet after login
  useEffect(() => {
    if (userContext.user && !userHasWallet(userContext)) {
      createWallet(userContext);
    }
  }, [userContext.user]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Web3 Business Card Generator</h1>
      <UserButton />

      {userContext.user && userHasWallet(userContext) && (
        <div style={{
          border: '1px solid #ccc',
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '420px',
          marginTop: '2rem',
          backgroundColor: '#ffffff',
          boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
        }}>
          <h2>🪪 Your Web3 Business Card</h2>
          <p><strong>Name:</strong> Solana Explorer #{address?.slice(-4)}</p>
          <p><strong>Wallet:</strong> {address}</p>
          <p><strong>Balance:</strong> {
            balance?.data
              ? `${(BigInt(balance.data.value) / BigInt(1e18)).toString()} ${balance.data.symbol}`
              : 'Loading...'
          }</p>

          {!isConnected && (
            <button
              onClick={() => connectExistingWallet(connectors, connect)}
              style={{ marginTop: '1rem' }}
            >
              Connect Wallet
            </button>
          )}

          {isConnected && (
            <>
              <p>✅ Wallet is connected</p>
              <button onClick={() => window.print()} style={{ marginTop: '1rem' }}>
                🖨️ Print or Save Business Card
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <CivicAuthProvider clientId="0569cf62-3392-4cba-876e-2944412088fb">
          <AppContent />
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
