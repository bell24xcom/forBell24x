import * as Notifications from 'expo-notifications';

// v1 is local-only: there is no push server yet, so these fire from
// on-device polling (e.g. quote count increasing between refreshes) rather
// than a remote push payload. Server-side push is deferred to Phase 2.
export async function notifyNewQuote(rfqTitle: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New quote received',
      body: `You received a new quote on "${rfqTitle}"`,
    },
    trigger: null,
  });
}

export async function notifyRfqMatch(rfqTitle: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New requirement matched',
      body: `A new requirement matching your profile is available: "${rfqTitle}"`,
    },
    trigger: null,
  });
}
