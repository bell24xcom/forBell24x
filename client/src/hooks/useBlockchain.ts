import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface BlockchainState {
  account: string | null;
  chainId: string | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
}

interface UseBlockchainOptions {
  autoConnect?: boolean;
}

export function useBlockchain(options: UseBlockchainOptions = {}) {
  const { autoConnect = true } = options;

  const [state, setState] = useState<BlockchainState>({
    account: null,
    chainId: null,
    isConnected: false,
    provider: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      setState({
        account: accounts[0],
        chainId: network.chainId.toString(),
        isConnected: true,
        provider,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      account: null,
      chainId: null,
      isConnected: false,
      provider: null,
    });
    setError(null);
  }, []);

  const createTransaction = useCallback(
    async (to: string, amount: string) => {
      if (!state.provider || !state.account) {
        throw new Error('Not connected to wallet');
      }

      try {
        const signer = await state.provider.getSigner();
        const tx = await signer.sendTransaction({
          to,
          value: ethers.parseEther(amount),
        });

        return await tx.wait();
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Transaction failed');
      }
    },
    [state.provider, state.account]
  );

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState(prev => ({ ...prev, account: accounts[0] }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({ ...prev, chainId }));
    };

    const handleDisconnect = () => {
      disconnect();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    if (autoConnect) {
      connect();
    }

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [connect, disconnect, autoConnect]);

  return {
    ...state,
    error,
    loading,
    connect,
    disconnect,
    createTransaction,
  };
}
