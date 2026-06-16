'use client';
import { useAuth } from '@/src/app/contexts/AuthContext';
import { type CaptureIntent } from '@/src/lib/intent';

// Wraps any action with an auth gate.
// If the user is not logged in, opens the capture modal with the given intent.
// If logged in, calls the action directly.
//
// Usage:
//   const gated = useIntentGate();
//   <button onClick={gated(() => router.push('/rfq/create'), { action: 'post-rfq', label: 'Post Steel Requirement' })}>
//     Post Requirement
//   </button>

export function useIntentGate() {
  const { isAuthenticated, openCaptureModal } = useAuth();

  return function gate<T>(
    action: () => T,
    intent: CaptureIntent
  ): () => T | void {
    return () => {
      if (isAuthenticated) {
        return action();
      }
      openCaptureModal(intent);
    };
  };
}
