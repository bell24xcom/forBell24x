import { useRef } from 'react';

export default function InteractiveBell({ soundOn = false, className = '' }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleClick = () => {
    if (soundOn && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return (
    <div
      className={`group inline-block cursor-pointer transition-transform duration-300 ${className}`}
      style={{ filter: 'drop-shadow(0 0 12px gold)' }}
      onClick={handleClick}
    >
      <span>🔔</span>
      <audio ref={audioRef} src='/sounds/temple-bell.mp3' preload='auto' />
      <style jsx>{`
        @keyframes bell-swing {
          0% {
            transform: rotate(0deg);
          }
          20% {
            transform: rotate(-18deg);
          }
          40% {
            transform: rotate(12deg);
          }
          60% {
            transform: rotate(-8deg);
          }
          80% {
            transform: rotate(4deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .animate-bell-swing {
          animation: bell-swing 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
