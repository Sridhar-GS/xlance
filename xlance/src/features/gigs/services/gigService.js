import { db } from '../../../shared/services/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  limit,
  startAfter,
  increment
} from 'firebase/firestore';

const COLLECTION_NAME = 'gigs';

export const gigService = {
  // Create a new Gig
  createGig: async (gigData) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...gigData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active', // active, paused, draft
        rating: 0,
        reviewCount: 0,
        views: 0
      });
      return { id: docRef.id, ...gigData };
    } catch (error) {
      console.error("Error creating gig:", error);
      throw error;
    }
  },

  // Get all gigs (Public Marketplace)
  getGigs: async (filters = {}, lastDoc = null) => {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      if (filters.category && filters.category !== 'All') {
        q = query(q, where('category', '==', filters.category));
      }

      // Note: Firestore requires composite indexes for complex queries.
      // If filtering by price/rating + category, ensure indexes exist.

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      return {
        gigs: snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
        })),
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error("Error fetching gigs:", error);
      throw error;
    }
  },

  // Get single gig by ID
  getGigById: async (gigId) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, gigId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null; // Handle 404 in component
      }
    } catch (error) {
      console.error("Error getting gig:", error);
      throw error;
    }
  },

  // Get gigs by Seller (Freelancer)
  getGigsBySeller: async (sellerId) => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching seller gigs:", error);
      throw error;
    }
  },

  // Update Gig
  updateGig: async (gigId, updates) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, gigId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { id: gigId, ...updates };
    } catch (error) {
      console.error("Error updating gig:", error);
      throw error;
    }
  },

  // Delete Gig
  deleteGig: async (gigId) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, gigId));
      return gigId;
    } catch (error) {
      console.error("Error deleting gig:", error);
      throw error;
    }
  },

  // Increment view count
  incrementGigView: async (gigId) => {
    try {
      const ref = doc(db, COLLECTION_NAME, gigId);
      await updateDoc(ref, {
        views: increment(1)
      });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  }
};
