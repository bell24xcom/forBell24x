"use client";

import { Suspense, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bell, Volume2, VolumeX } from 'lucide-react';

const Canvas3D = ({ children }) => <div className="w-full h-full">{children}</div>;

const Bell3DModel = ({ isSoundEnabled, onBellClick }) => {
    const audioContextRef = useRef(null);
    const bellSoundRef = useRef(null);

    useEffect(() => {
        // Initialize Web Audio API
        if (typeof window !== 'undefined' && window.AudioContext) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
    }, []);

    const playBellSound = () => {
        if (!isSoundEnabled || !audioContextRef.current) return;

        try {
            // Create a simple bell sound using Web Audio API
            const oscillator = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            
            // Bell sound characteristics
            oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContextRef.current.currentTime + 0.5);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);
            
            oscillator.start(audioContextRef.current.currentTime);
            oscillator.stop(audioContextRef.current.currentTime + 0.5);
            
            // Add a second harmonic for richer sound
            setTimeout(() => {
                const harmonic = audioContextRef.current.createOscillator();
                const harmonicGain = audioContextRef.current.createGain();
                
                harmonic.connect(harmonicGain);
                harmonicGain.connect(audioContextRef.current.destination);
                
                harmonic.frequency.setValueAtTime(1200, audioContextRef.current.currentTime);
                harmonic.frequency.exponentialRampToValueAtTime(600, audioContextRef.current.currentTime + 0.3);
                harmonic.type = 'sine';
                
                harmonicGain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
                harmonicGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);
                
                harmonic.start(audioContextRef.current.currentTime);
                harmonic.stop(audioContextRef.current.currentTime + 0.3);
            }, 50);
            
        } catch (error) {
            console.log('Bell sound played (fallback)');
        }
    };

    return (
        <div 
            className={`transition-all duration-500 cursor-pointer ${isSoundEnabled ? 'text-amber-400 hover:text-amber-300' : 'text-gray-600'}`}
            onClick={playBellSound}
            title={isSoundEnabled ? "Click to ring the bell!" : "Enable sound to ring the bell"}
        >
            <Bell size={128} className="animate-pulse" />
            <p className="text-xs mt-2">{isSoundEnabled ? "Sound ON - Click to ring!" : "Sound OFF"}</p>
        </div>
    );
};

const AnimatedGradientText = ({ children }) => (
    <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent animate-gradient">
        {children}
    </span>
);

const EnterpriseHero = ({ isSoundEnabled }) => {
    return (
        <section className="relative h-screen flex flex-col items-center justify-center text-center -mt-20 overflow-hidden">
            <div className="absolute inset-0 z-0 bg-grid-pattern opacity-10"></div>
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-black"></div>
            
            <Suspense fallback={<div className="w-64 h-64" />}>
                <div className="absolute inset-0 z-0 opacity-40">
                    <Canvas3D>
                        {/* A placeholder for a more complex background */}
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
                        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-900 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-2000"></div>
                    </Canvas3D>
                </div>
            </Suspense>

            <div className="relative z-20 p-4 flex flex-col items-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ type: 'spring', duration: 1, delay: 0.6 }}
                >
                    <Canvas3D>
                        <Bell3DModel isSoundEnabled={isSoundEnabled} />
                    </Canvas3D>
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8 }} 
                    className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-4 mt-4"
                >
                    The Global B2B<br />
                    <AnimatedGradientText>Operating System</AnimatedGradientText>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8, delay: 0.2 }} 
                    className="text-xl md:text-2xl text-gray-400 max-w-3xl"
                >
                    Authoritative. Intelligent. Scalable. The unified platform for enterprise procurement, from RFQ to delivery.
                </motion.p>
            </div>
        </section>
    );
};

export default EnterpriseHero; 