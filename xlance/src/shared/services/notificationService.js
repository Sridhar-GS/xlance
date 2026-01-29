import { db } from './firebaseConfig';
import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp, limit } from 'firebase/firestore';

export const notificationService = {
    // Add a new notification
    addNotification: async (userId, type, title, message, relatedId = null, metadata = {}) => {
        try {
            if (!userId) {
                console.warn("Attempted to add notification without userId");
                return;
            }

            await addDoc(collection(db, 'notifications'), {
                userId,
                type, // 'info', 'success', 'warning', 'error'
                title,
                message,
                relatedId, // e.g., conversationId, jobId, proposalId
                metadata, // Any extra data
                read: false,
                createdAt: serverTimestamp()
            });
            console.log(`Notification added for user ${userId}: ${title}`);
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    },

    // Subscribe to real-time notifications for a user
    subscribeToNotifications: (userId, callback) => {
        if (!userId) return () => { };

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        return onSnapshot(q, (snapshot) => {
            // console.log("Realtime notification snapshot received. Docs:", snapshot.docs.length);
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert timestamp to date/string if needed for UI, or handle in component
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));

            // Log changes for debugging (detects if it's local or server)
            snapshot.docChanges().forEach((change) => {
                // console.log(`Notification update: ${change.type}`, change.doc.data());
            });

            callback(notifications);
        }, (error) => {
            console.error("Error subscribing to notifications:", error);
        });
    },

    // Mark a single notification as read
    markAsRead: async (notificationId) => {
        try {
            const notifRef = doc(db, 'notifications', notificationId);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    },

    // Delete a notification
    deleteNotification: async (notificationId) => {
        try {
            const notifRef = doc(db, 'notifications', notificationId);
            await import('firebase/firestore').then(mod => mod.deleteDoc(notifRef));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    },

    // Mark all notifications as read for a user
    markAllAsRead: async (userId) => {
        // This is a bit heavier as it requires reading then writing batch. 
        // For MVP we might just iterate client side or do a batch write if needed.
        // For now, let's skip complex batch logic to keep it simple, or implement if requested.
        console.log("markAllAsRead not fully implemented yet for batch efficiency.");
    }
};
