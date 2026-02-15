<<<<<<< HEAD
import { ethers, BrowserProvider, JsonRpcProvider, Contract, parseUnits, formatUnits } from 'ethers';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

=======
﻿import { ethers, BrowserProvider, JsonRpcProvider, Contract, parseUnits, formatUnits } from 'ethers';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// At the top of the file
interface EthereumProvider {
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  // Add other methods you use (e.g., request, isMetaMask, etc.)
}
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
// Contract addresses (Polygon mainnet)
const CONTRACT_ADDRESSES = {
  bellToken: '0x1234567890123456789012345678901234567890', // Deployed BellToken address
  bellEscrow: '0x2345678901234567890123456789012345678901', // Deployed BellEscrow address
  bellVerification: '0x3456789012345678901234567890123456789012', // Deployed BellVerification address
};

// Contract ABIs (simplified for demonstration)
const BELL_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function stake(uint256 amount, uint256 duration)',
  'function unstake()',
  'function claimStakingRewards()',
  'function addLiquidity(uint256 amount)',
  'function removeLiquidity(uint256 amount)',
  'function calculateStakingReward(address user) view returns (uint256)',
  'function calculateLiquidityReward(address user) view returns (uint256)',
  'function getUserStakingInfo(address user) view returns (uint256,uint256,uint256,uint256,bool,uint256)',
  'function getUserLiquidityInfo(address user) view returns (uint256,uint256,bool)',
  'event TokensStaked(address indexed user, uint256 amount, uint256 duration)',
  'event TokensUnstaked(address indexed user, uint256 amount, uint256 reward)',
  'event RewardsClaimed(address indexed user, uint256 amount)',
];

const BELL_ESCROW_ABI = [
  'function createEscrow(address supplier, uint256 milestones, uint256[] memory milestoneAmounts) payable',
  'function completeMilestone(uint256 escrowId, uint256 milestone)',
  'function releaseMilestone(uint256 escrowId, uint256 milestone)',
  'function initiateDispute(uint256 escrowId, string memory reason)',
  'function getEscrowDetails(uint256 escrowId) view returns (address,address,uint256,uint256,uint256,bool,bool,uint256)',
  'function getUserEscrows(address user) view returns (uint256[])',
  'event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed supplier, uint256 amount, uint256 milestones)',
  'event MilestoneCompleted(uint256 indexed escrowId, uint256 indexed milestone, address indexed supplier)',
  'event MilestoneReleased(uint256 indexed escrowId, uint256 indexed milestone, uint256 amount, address indexed supplier)',
  'event EscrowDisputed(uint256 indexed escrowId, address indexed initiator, string reason)',
];

// Web3 Context
interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  contracts: {
    bellToken: Contract | null;
    bellEscrow: Contract | null;
  };
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Polygon network configuration
const POLYGON_CONFIG = {
  chainId: 137,
  chainName: 'Polygon',
  rpcUrls: ['https://polygon-rpc.com'],
  blockExplorerUrls: ['https://polygonscan.com'],
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
};

// Custom hook to use Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Web3 Provider Component
interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Web3
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const web3Provider = new BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      // Check if already connected
      checkConnection(web3Provider);
    }
  }, []);

  // Check existing connection
  const checkConnection = async (web3Provider: BrowserProvider) => {
    try {
      const accounts = await web3Provider.listAccounts();
      if (accounts.length > 0) {
        const signer = await web3Provider.getSigner();
        const network = await web3Provider.getNetwork();
        
        setSigner(signer);
        setAccount(accounts[0].address);
        setChainId(Number(network.chainId));
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  // Connect wallet
  const connect = async () => {
    if (!provider) {
      setError('Web3 provider not available');
      return;
    }

<<<<<<< HEAD
=======
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not detected. Please install MetaMask.');
      return;
    }

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
    setIsConnecting(true);
    setError(null);

    try {
<<<<<<< HEAD
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get signer and account
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();

      setSigner(signer);
      setAccount(account);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      // Switch to Polygon if not already
      if (Number(network.chainId) !== POLYGON_CONFIG.chainId) {
        await switchNetwork();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Connection error:', err);
=======
      // Safely check if MetaMask (or any injected provider) exists
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get signer and account
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        const network = await provider.getNetwork();

        setSigner(signer);
        setAccount(account);
        setChainId(Number(network.chainId));
        setIsConnected(true);
        
        // Store connection state
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('walletConnected', 'true');
        }

        // Switch to Polygon if not already
        if (Number(network.chainId) !== POLYGON_CONFIG.chainId) {
          await switchNetwork();
        }
      } else {
        throw new Error('MetaMask not detected. Please install MetaMask.');
      }
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      if (err.code === 4001) {
        setError('You rejected the connection request.');
      } else if (err.message?.includes('MetaMask not detected')) {
        setError('Please install MetaMask to use BELL token staking!');
      } else {
        setError(err.message || 'Failed to connect wallet');
      }
      setIsConnected(false);
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);
  };

  // Switch to Polygon network
  const switchNetwork = async () => {
<<<<<<< HEAD
    if (!window.ethereum) {
=======
    if (typeof window === 'undefined' || !window.ethereum) {
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
      setError('Web3 provider not available');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${POLYGON_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
<<<<<<< HEAD
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_CONFIG],
          });
=======
          if (typeof window !== 'undefined' && window.ethereum) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [POLYGON_CONFIG],
            });
          }
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
        } catch (addError) {
          setError('Failed to add Polygon network');
          console.error('Add network error:', addError);
        }
      } else {
        setError('Failed to switch to Polygon network');
        console.error('Switch network error:', switchError);
      }
    }
  };

  // Initialize contracts
  const contracts = {
    bellToken: signer ? new Contract(CONTRACT_ADDRESSES.bellToken, BELL_TOKEN_ABI, signer) : null,
    bellEscrow: signer ? new Contract(CONTRACT_ADDRESSES.bellEscrow, BELL_ESCROW_ABI, signer) : null,
  };

  // Listen for account changes
  useEffect(() => {
<<<<<<< HEAD
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        window.location.reload(); // Reload to update contracts
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
    return undefined;
=======
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsConnected(false);
        localStorage.removeItem('walletConnected');
      } else {
        setAccount(accounts[0]);
      }
    };
    const handleChainChanged = () => {
      window.location.reload();
    };

    if (typeof window !== 'undefined' && window.ethereum) {
      const { on, removeListener } = window.ethereum;

      if (typeof on === 'function') {
        on('accountsChanged', handleAccountsChanged);
        on('chainChanged', handleChainChanged);
      }

      if (localStorage.getItem('walletConnected')) {
        connect();
      }

      return () => {
        if (typeof removeListener === 'function') {
          removeListener('accountsChanged', handleAccountsChanged);
          removeListener('chainChanged', handleChainChanged);
        }
      };
    }
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
  }, []);

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
    contracts,
    error,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Utility functions
export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string, decimals: number = 18) => {
  return parseFloat(formatUnits(balance, decimals)).toFixed(4);
};

export const parseUnitsHelper = (amount: string, decimals: number = 18) => {
  return parseUnits(amount, decimals);
};

export const formatUnitsHelper = (amount: string, decimals: number = 18) => {
  return formatUnits(amount, decimals);
};

// Contract interaction helpers
export const useBellToken = () => {
  const { contracts, account } = useWeb3();
  
  const getBalance = async () => {
    if (!contracts.bellToken || !account) return '0';
    const balance = await contracts.bellToken.balanceOf(account);
    return formatBalance(balance.toString());
  };

  const stake = async (amount: string, duration: number) => {
    if (!contracts.bellToken) throw new Error('Contract not available');
    const tx = await contracts.bellToken.stake(parseUnitsHelper(amount), duration);
    return await tx.wait();
  };

  const unstake = async () => {
    if (!contracts.bellToken) throw new Error('Contract not available');
    const tx = await contracts.bellToken.unstake();
    return await tx.wait();
  };

  const claimRewards = async () => {
    if (!contracts.bellToken) throw new Error('Contract not available');
    const tx = await contracts.bellToken.claimStakingRewards();
    return await tx.wait();
  };

  const getStakingInfo = async () => {
    if (!contracts.bellToken || !account) return null;
    const info = await contracts.bellToken.getUserStakingInfo(account);
    return {
      amount: formatBalance(info[0].toString()),
      startTime: info[1].toString(),
      duration: info[2].toString(),
      lastClaimTime: info[3].toString(),
      isActive: info[4],
      pendingRewards: formatBalance(info[5].toString()),
    };
  };

  return {
    getBalance,
    stake,
    unstake,
    claimRewards,
    getStakingInfo,
  };
};

export const useBellEscrow = () => {
  const { contracts } = useWeb3();
  
  const createEscrow = async (supplier: string, milestones: number[], amounts: string[]) => {
    if (!contracts.bellEscrow) throw new Error('Contract not available');
    const parsedAmounts = amounts.map(amount => parseUnitsHelper(amount));
    const totalAmount = parsedAmounts.reduce((sum, amount) => sum + amount, BigInt(0));
    
    const tx = await contracts.bellEscrow.createEscrow(supplier, milestones.length, parsedAmounts, {
      value: totalAmount,
    });
    return await tx.wait();
  };

  const completeMilestone = async (escrowId: number, milestone: number) => {
    if (!contracts.bellEscrow) throw new Error('Contract not available');
    const tx = await contracts.bellEscrow.completeMilestone(escrowId, milestone);
    return await tx.wait();
  };

  const releaseMilestone = async (escrowId: number, milestone: number) => {
    if (!contracts.bellEscrow) throw new Error('Contract not available');
    const tx = await contracts.bellEscrow.releaseMilestone(escrowId, milestone);
    return await tx.wait();
  };

  const initiateDispute = async (escrowId: number, reason: string) => {
    if (!contracts.bellEscrow) throw new Error('Contract not available');
    const tx = await contracts.bellEscrow.initiateDispute(escrowId, reason);
    return await tx.wait();
  };

  const getEscrowDetails = async (escrowId: number) => {
    if (!contracts.bellEscrow) return null;
    const details = await contracts.bellEscrow.getEscrowDetails(escrowId);
    return {
      buyer: details[0],
      supplier: details[1],
      amount: formatBalance(details[2].toString()),
      milestones: details[3].toString(),
      completedMilestones: details[4].toString(),
      isActive: details[5],
      isDisputed: details[6],
      createdAt: details[7].toString(),
    };
  };

  const getUserEscrows = async (user: string) => {
    if (!contracts.bellEscrow) return [];
    const escrows = await contracts.bellEscrow.getUserEscrows(user);
    return escrows.map((id: any) => id.toString());
  };

  return {
    createEscrow,
    completeMilestone,
    releaseMilestone,
    initiateDispute,
    getEscrowDetails,
    getUserEscrows,
  };
};