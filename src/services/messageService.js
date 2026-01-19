import { db } from './firebaseConfig';
import { notificationService } from './notificationService';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    getDoc,
    getDocs,
    limit
} from 'firebase/firestore';

export const messageService = {
    // 1. Create or Get existing conversation between two users
    startConversation: async (currentUserId, otherUserId, otherUserName, otherUserAvatar) => {
        try {
            // Check if conversation already exists
            // Note: This query assumes a specific structure. 
            // A robust way often uses a composite ID like `minId_maxId` to force uniqueness.
            // Semantic ID: {UserID_A}_{UserID_B} (Sorted to be deterministic)
            // This guarantees a single, unique path for any pair of users
            const chatId = [currentUserId, otherUserId].sort().join('_');
            const docRef = doc(db, 'conversations', chatId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                // Create new conversation
                // We need to fetch the current user's details too if we want to store them denormalized
                // For now, we assume the caller handles UI optimistic updates or we fetch profile

                const newConv = {
                    participants: [currentUserId, otherUserId],
                    participantDetails: {
                        [otherUserId]: { name: otherUserName || 'User', avatar: otherUserAvatar || '' },
                        // We will update the current user's details when they send a message if needed, 
                        // or rely on a separate profile fetch. 
                    },
                    lastMessage: '',
                    lastMessageTime: serverTimestamp(),
                    unreadCounts: { [currentUserId]: 0, [otherUserId]: 0 },
                    updatedAt: serverTimestamp()
                };

                // Use setDoc if using custom ID, otherwise addDoc
                // Here using SetDoc with custom ID to prevent duplicates easily
                const { setDoc } = await import('firebase/firestore');
                await setDoc(docRef, newConv);
                return { id: chatId, ...newConv };
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
            throw error;
        }
    },

    // 2. Subscribe to user's conversations list
    // 2. Subscribe to user's conversations list
    subscribeToConversations: (userId, callback) => {
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', userId),
            orderBy('updatedAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const convs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Helper to get 'other' user for UI
                otherUser: (currentId) => {
                    const parts = doc.data().participants || [];
                    const otherId = parts.find(p => p !== currentId);
                    return doc.data().participantDetails?.[otherId] || { name: 'User', avatar: '' };
                }
            }));

            callback(convs);
        });
    },

    // 3. Subscribe to messages in a conversation
    subscribeToMessages: (conversationId, callback) => {
        const q = query(
            collection(db, 'conversations', conversationId, 'messages'),
            orderBy('createdAt', 'asc') // or desc depending on UI
        );

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
            }));
            callback(messages);
        });
    },

    // 4. Send a message
    sendMessage: async (conversationId, senderId, text) => {
        try {
            // Add message to subcollection
            const messagesRef = collection(db, 'conversations', conversationId, 'messages');
            await addDoc(messagesRef, {
                senderId,
                text,
                createdAt: serverTimestamp(),
                read: false
            });

            // Update conversation metadata (last message, unread count)
            const convRef = doc(db, 'conversations', conversationId);

            // We need to know who the "other" user is to increment their unread count
            // A simple way is to read the doc first, or pass the otherUserId. 
            // For efficiency, we can use dot notation update if we know the ID, 
            // but here we might need to read unless we pass participants.
            // Let's assume we maintain local state or read it.
            // For this MVP service, let's just update lastMessage and leave unread count logic for a cloud function or refined client logic.

            await updateDoc(convRef, {
                lastMessage: text,
                lastMessageTime: serverTimestamp(),
                updatedAt: serverTimestamp()
                // unreadCounts: increment logic would go here
            });

            // Trigger In-App Notification for recipient(s)
            // We fetch the conversation to find the other participant
            const convSnap = await getDoc(convRef);
            if (convSnap.exists()) {
                const data = convSnap.data();
                const participants = data.participants || [];
                const recipientId = participants.find(p => p !== senderId);

                if (recipientId) {
                    await notificationService.addNotification(
                        recipientId,
                        'info',
                        'New Message',
                        `You have a new message: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`,
                        conversationId,
                        { type: 'chat', senderId }
                    );
                }
            }

        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    },

    // 5. Mark conversation as read
    markAsRead: async (conversationId, userId) => {
        // Implementation depends on how we structure unread counts.
        // E.g., `unreadCounts.${userId}`: 0
        const convRef = doc(db, 'conversations', conversationId);
        await updateDoc(convRef, {
            [`unreadCounts.${userId}`]: 0
        });
    }
};
