import { useState, useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging } from '../services/firebaseConfig';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const usePushNotifications = (userId) => {
    const [token, setToken] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

    // Initial check (non-blocking) - just to update state
    useEffect(() => {
        setNotificationPermission(Notification.permission);
    }, []);

    const enableNotifications = async () => {
        if (!userId) {
            console.warn("Cannot enable notifications: No User ID");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                // Explicitly register SW
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

                // Get FCM Token
                const currentToken = await getToken(messaging, {
                    vapidKey: 'BJQdvloA7BiUfRqybi2ioQmkTuwdH1hd1Nm8e8L7mkG_cm5AuJO4uxLcrfR0FbhEvdE4--jk14Z00ffAYMtET4M',
                    serviceWorkerRegistration: registration
                });

                if (currentToken) {
                    setToken(currentToken);
                    // Save token to user profile
                    const userRef = doc(db, 'users', userId);
                    await updateDoc(userRef, {
                        fcmTokens: arrayUnion(currentToken)
                    });
                    console.log('FCM Token generated and saved:', currentToken);
                    alert("Notifications enabled successfully!");
                } else {
                    console.log('No registration token available.');
                }
            } else {
                alert("Permission denied. Please enable notifications in your browser settings.");
            }
        } catch (error) {
            console.error('An error occurred while retrieving token. ', error);
        }
    };

    return { token, notificationPermission, enableNotifications };
};

export default usePushNotifications;
