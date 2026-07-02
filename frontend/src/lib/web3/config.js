import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, celoSepolia, celo, celoAlfajores } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

// WalletConnect Project ID - Get from https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Define supported chains
export const chains = [mainnet, sepolia, celo, celoAlfajores];

// Configure wagmi
export const config = createConfig({
  chains: [celoSepolia, celoAlfajores, mainnet, sepolia, celo,],
  connectors: [
    // Injected connector (MetaMask, Browser Wallets)
    // Using default injected() without target to detect all injected wallets
    injected({
      shimDisconnect: true,
    }),
    // WalletConnect
    walletConnect({
      projectId,
      metadata: {
        name: 'EduLedger',
        description: 'Decentralized Educational Materials Sharing Platform',
        url: typeof window !== 'undefined' ? window.location.origin : '',
        icons: ['https://eduledger.com/icon.png'],
      },
      showQrModal: true,
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'EduLedger',
      appLogoUrl: 'https://eduledger.com/icon.png',
    }),
  ],
  transports: {
    [celoSepolia.id]: http(),
    [celoAlfajores.id]: http(),
    [celo.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});


