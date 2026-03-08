import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const NOTIFICATION_ID = 1001;

export async function scheduleDailyReminder() {
  if (!Capacitor.isNativePlatform()) return;

  const { display } = await LocalNotifications.checkPermissions();
  if (display !== 'granted') {
    const { display: newStatus } = await LocalNotifications.requestPermissions();
    if (newStatus !== 'granted') return;
  }

  // Cancel any existing scheduled notification to avoid duplicates
  await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });

  // Schedule daily at 6:00 PM
  const now = new Date();
  const sixPM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);

  // If 6 PM already passed today, start from tomorrow
  if (now >= sixPM) {
    sixPM.setDate(sixPM.getDate() + 1);
  }

  await LocalNotifications.schedule({
    notifications: [
      {
        id: NOTIFICATION_ID,
        title: 'Squirdle',
        body: "Today's Squirdle is waiting! Can you guess the word? 🟩",
        schedule: {
          at: sixPM,
          every: 'day',
          allowWhileIdle: true,
        },
        smallIcon: 'ic_notification',
        largeIcon: 'ic_notification',
        sound: 'default',
        autoCancel: true,
      },
    ],
  });
}
