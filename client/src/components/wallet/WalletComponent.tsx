import useSWR, { mutate } from 'swr';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const WalletComponent = () => {
  const { data: wallet, error } = useSWR('/api/wallet', fetcher);

  const handleDeposit = async (amount: number) => {
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type: 'DEPOSIT', description: 'Deposit' }),
      });
      if (response.ok) {
        mutate('/api/wallet');
        toast.success('Deposit successful!');
      } else {
        toast.error('Deposit failed');
      }
    } catch (error) {
      toast.error('Deposit failed');
    }
  };

  if (error) return <div>Failed to load wallet</div>;
  if (!wallet) return <div>Loading...</div>;

  return (
    <div className='wallet-container'>
      <h2>Wallet Balance: ₹{wallet.balance}</h2>
      {/* TransactionHistory and DepositForm components assumed to exist */}
      {/* <TransactionHistory transactions={wallet.transactions} /> */}
      {/* <DepositForm onDeposit={handleDeposit} /> */}
      <button onClick={() => handleDeposit(1000)}>Deposit ₹1000</button>
    </div>
  );
};
