import { renderHook, act } from '@testing-library/react-hooks';
import { useBlockchain } from './useBlockchain';
import { BlockchainService } from '@/services/blockchain/blockchainService';
import { ethers } from 'ethers';

// Mock BlockchainService
jest.mock('@/services/blockchainService', () => ({
  blockchainService: {
    createWallet: jest.fn(),
    getWalletBalance: jest.fn(),
    sendTransaction: jest.fn(),
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
  },
}));

describe('useBlockchain', () => {
  let mockBlockchainService: jest.Mocked<BlockchainService>;

  beforeEach(() => {
    mockBlockchainService = new BlockchainService() as jest.Mocked<BlockchainService>;
    (BlockchainService as jest.Mock).mockImplementation(() => mockBlockchainService);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBlockchain());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.account).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should connect to wallet successfully', async () => {
    mockBlockchainService.connectWallet.mockResolvedValueOnce(true);
    mockBlockchainService.getAccount.mockResolvedValueOnce('0x123');

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.account).toBe('0x123');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle wallet connection error', async () => {
    mockBlockchainService.connectWallet.mockRejectedValueOnce(new Error('Connection failed'));

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.account).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Connection failed');
  });

  it('should create transaction successfully', async () => {
    mockBlockchainService.createTransaction.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.createTransaction('0x456', ethers.utils.parseEther('1.0'));
    });

    expect(mockBlockchainService.createTransaction).toHaveBeenCalledWith(
      '0x456',
      ethers.utils.parseEther('1.0')
    );
    expect(result.current.error).toBe(null);
  });

  it('should handle transaction creation error', async () => {
    mockBlockchainService.createTransaction.mockRejectedValueOnce(new Error('Transaction failed'));

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.createTransaction('0x456', ethers.utils.parseEther('1.0'));
    });

    expect(result.current.error).toBe('Transaction failed');
  });

  it('should release funds successfully', async () => {
    mockBlockchainService.releaseFunds.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.releaseFunds(1);
    });

    expect(mockBlockchainService.releaseFunds).toHaveBeenCalledWith(1);
    expect(result.current.error).toBe(null);
  });

  it('should handle fund release error', async () => {
    mockBlockchainService.releaseFunds.mockRejectedValueOnce(new Error('Release failed'));

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.releaseFunds(1);
    });

    expect(result.current.error).toBe('Release failed');
  });

  it('should process refund successfully', async () => {
    mockBlockchainService.refund.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.refund(1);
    });

    expect(mockBlockchainService.refund).toHaveBeenCalledWith(1);
    expect(result.current.error).toBe(null);
  });

  it('should handle refund error', async () => {
    mockBlockchainService.refund.mockRejectedValueOnce(new Error('Refund failed'));

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.refund(1);
    });

    expect(result.current.error).toBe('Refund failed');
  });

  it('should raise dispute successfully', async () => {
    mockBlockchainService.raiseDispute.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.raiseDispute(1, 'Test dispute');
    });

    expect(mockBlockchainService.raiseDispute).toHaveBeenCalledWith(1, 'Test dispute');
    expect(result.current.error).toBe(null);
  });

  it('should handle dispute raising error', async () => {
    mockBlockchainService.raiseDispute.mockRejectedValueOnce(new Error('Dispute failed'));

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.raiseDispute(1, 'Test dispute');
    });

    expect(result.current.error).toBe('Dispute failed');
  });

  it('should resolve dispute successfully', async () => {
    mockBlockchainService.resolveDispute.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.resolveDispute(1, true);
    });

    expect(mockBlockchainService.resolveDispute).toHaveBeenCalledWith(1, true);
    expect(result.current.error).toBe(null);
  });

  it('should handle dispute resolution error', async () => {
    mockBlockchainService.resolveDispute.mockRejectedValueOnce(new Error('Resolution failed'));

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      await result.current.resolveDispute(1, true);
    });

    expect(result.current.error).toBe('Resolution failed');
  });

  it('should handle transaction events', async () => {
    const onTransactionCreated = jest.fn();
    const onFundsReleased = jest.fn();
    const onDisputeRaised = jest.fn();
    const onDisputeResolved = jest.fn();

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      result.current.onTransactionCreated(onTransactionCreated);
      result.current.onFundsReleased(onFundsReleased);
      result.current.onDisputeRaised(onDisputeRaised);
      result.current.onDisputeResolved(onDisputeResolved);
    });

    expect(mockBlockchainService.onTransactionCreated).toHaveBeenCalledWith(onTransactionCreated);
    expect(mockBlockchainService.onFundsReleased).toHaveBeenCalledWith(onFundsReleased);
    expect(mockBlockchainService.onDisputeRaised).toHaveBeenCalledWith(onDisputeRaised);
    expect(mockBlockchainService.onDisputeResolved).toHaveBeenCalledWith(onDisputeResolved);
  });

  it('should handle network changes', async () => {
    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      window.ethereum.emit('chainChanged', '0x2');
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.account).toBe('');
  });

  it('should handle account changes', async () => {
    mockBlockchainService.getAccount.mockResolvedValueOnce('0x789');

    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      window.ethereum.emit('accountsChanged', ['0x789']);
    });

    expect(result.current.account).toBe('0x789');
  });

  it('should handle disconnection', async () => {
    const { result } = renderHook(() => useBlockchain());

    await act(async () => {
      window.ethereum.emit('disconnect');
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.account).toBe('');
  });
});
