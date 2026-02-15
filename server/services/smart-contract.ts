import { ethers } from 'ethers';

export async function interactWithContract(
  contractAddress: string,
  abi: any[],
  method: string,
  args: any[],
  privateKey: string,
  providerUrl: string
): Promise<any> {
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  // Call the contract method
  return contract[method](...args);
}

export async function verifyOnChain(
  contractAddress: string,
  abi: any[],
  method: string,
  args: any[],
  providerUrl: string
): Promise<any> {
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const contract = new ethers.Contract(contractAddress, abi, provider);
  // Call the contract read-only method
  return contract[method](...args);
}
