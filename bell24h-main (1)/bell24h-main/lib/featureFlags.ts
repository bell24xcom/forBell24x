export const featureFlags = {
  enableCanvas: process.env.NEXT_PUBLIC_ENABLE_CANVAS === 'true',
  enableThreeBell: process.env.NEXT_PUBLIC_ENABLE_THREE_BELL === 'true',
  enableAudio: process.env.NEXT_PUBLIC_ENABLE_AUDIO === 'true',
} as const;
