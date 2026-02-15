"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const LoginForm = ({ onSwitchView, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError('Invalid email or password. Please try again.');
            } else if (result?.ok) {
                // Successful login
                onClose();
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        try {
            await signIn(provider, { callbackUrl: '/dashboard' });
        } catch (err) {
            console.error(`${provider} login error:`, err);
            setError(`Failed to login with ${provider}. Please try again.`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Welcome Back</h2>
            <p className="text-center text-gray-400 mb-8">Login to the Global B2B Operating System.</p>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="w-full bg-gray-700/50 border-2 border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled={isLoading}
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="w-full bg-gray-700/50 border-2 border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled={isLoading}
                    />
                </div>
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-lg"
                    >
                        {error}
                    </motion.p>
                )}
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></span>
                    ) : (
                        <>
                            <LogIn size={20}/>
                            <span>Login</span>
                        </>
                    )}
                </button>
            </form>
            
            <div className="text-center my-4 text-gray-500 text-sm">OR</div>
            
            {/* Social Logins */}
            <div className="space-y-3">
                <button 
                    onClick={() => handleSocialLogin('google')} 
                    className="w-full bg-gray-700/50 border-2 border-white/10 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
                    disabled={isLoading}
                >
                    <span>Sign in with Google</span>
                </button>
                <button 
                    onClick={() => handleSocialLogin('linkedin')} 
                    className="w-full bg-gray-700/50 border-2 border-white/10 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
                    disabled={isLoading}
                >
                    <span>Sign in with LinkedIn</span>
                </button>
            </div>
            
            <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?{' '}
                <button 
                    onClick={onSwitchView} 
                    className="font-semibold text-amber-400 hover:text-amber-500 transition-colors"
                    disabled={isLoading}
                >
                    Register Free
                </button>
            </p>
        </motion.div>
    );
};

export default LoginForm; 