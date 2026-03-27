import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (result?.ok) {
      toast.success('Login successful!');
      router.push('/dashboard');
      onClose();
    } else {
      setError('Invalid credentials');
      toast.error('Invalid credentials');
    }
  };

  const handleGoogleLogin = () => signIn('google');
  const handleLinkedInLogin = () => signIn('linkedin');

  return (
    <div className='auth-modal'>
      <form onSubmit={handleLogin}>
        <input
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='Email'
          required
        />
        <input
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder='Password'
          required
        />
        <button type='submit'>Login</button>
        {error && <div className='error'>{error}</div>}
      </form>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
      <button onClick={handleLinkedInLogin}>Sign in with LinkedIn</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
