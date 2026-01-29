import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { db } from '../../../shared/services/firebaseConfig';
import { notificationService } from '../../../shared/services/notificationService';

const COLLECTION_NAME = 'orders';

export const orderService = {
    // Create a new order
    createOrder: async (orderData) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...orderData,
                status: 'active', // active, completed, cancelled, disputed
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Notify Seller
            await notificationService.addNotification(
                orderData.sellerId,
                'success',
                'New Order Received!',
                `You have a new order from ${orderData.buyerName} for ${orderData.gigTitle}`,
                `/orders/${docRef.id}`,
                { type: 'order', orderId: docRef.id }
            );

            return { id: docRef.id, ...orderData };
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    },

    // Get order by ID
    getOrderById: async (id) => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting order:", error);
            throw error;
        }
    },

    // Get orders for a buyer
    getBuyerOrders: async (buyerId) => {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where("buyerId", "==", buyerId),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching buyer orders:", error);
            throw error;
        }
    },

    // Get orders for a seller
    getSellerOrders: async (sellerId) => {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where("sellerId", "==", sellerId),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching seller orders:", error);
            throw error;
        }
    },

    // Update order status
    updateOrderStatus: async (orderId, status, additionalData = {}) => {
        try {
            const orderRef = doc(db, COLLECTION_NAME, orderId);
            await updateDoc(orderRef, {
                status,
                ...additionalData,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating order status:", error);
            throw error;
        }
    },

    // Mark order as delivered
    deliverOrder: async (orderId, deliveryFiles = [], note = "") => {
        try {
            const orderRef = doc(db, COLLECTION_NAME, orderId);
            await updateDoc(orderRef, {
                status: 'delivered',
                deliveryFiles,
                deliveryNote: note,
                deliveredAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Notify Buyer
            // (Ideally fetch order first to get buyerId, but for MVP assuming caller handles or we do a read)
        } catch (error) {
            console.error("Error delivering order:", error);
            throw error;
        }
    }
};
