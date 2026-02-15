<<<<<<< HEAD
// Global type declarations for Bell24H

declare global {
  interface Window {
    templeBellSound?: {
      playBellSound: (duration?: number) => Promise<void>;
      isAudioSupported: () => boolean;
    };
  }
}

export {};
=======
// Global type declarations for browser APIs

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
    selectedAddress?: string;
    chainId?: string;
  };
}
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
