import dayjs from 'dayjs';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    } as any),
});

export async function requestNotificationPermissions() {
    // Basic local notification permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return false;
    }

    // Android channel is required for local notifications too
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('subscriptions', {
            name: 'Lembretes de Assinaturas',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#8b5cf6',
        });
    }

    return true;
}

export async function scheduleSubscriptionNotification(id: string, name: string, dueDate: string) {
    try {
        await cancelSubscriptionNotification(id);

        const now = dayjs();
        let nextDueDate = dayjs(dueDate);

        // Map to current or next month
        if (nextDueDate.isBefore(now)) {
            nextDueDate = nextDueDate.add(1, 'month');
        }

        // Trigger 2 days (48h) before
        const triggerDate = nextDueDate.subtract(48, 'hour');

        if (triggerDate.isBefore(now)) {
            // If already within 48h, just notify now or in a few seconds for testing
            return null;
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Vencimento Próximo! 💳',
                body: `Sua assinatura de ${name} vence em 48 horas.`,
                data: { subscriptionId: id },
                sound: true,
            },
            trigger: {
                date: triggerDate.toDate(),
                channelId: 'subscriptions',
            } as any,
        });

        return notificationId;
    } catch (e) {
        console.log("Error scheduling notification:", e);
        return null;
    }
}

export async function cancelSubscriptionNotification(subscriptionId: string) {
    try {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of scheduled) {
            if (notification.content.data?.subscriptionId === subscriptionId) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
        }
    } catch (e) {
        console.log("Error canceling notification:", e);
    }
}
