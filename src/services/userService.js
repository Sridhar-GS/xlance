import { db } from './firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, increment, runTransaction, collection, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore';

export const userService = {
    // Create User Profile
    createUserProfile: async (uid, data) => {
        try {
            const userRef = doc(db, 'users', uid);
            const roles = Array.isArray(data.role) ? data.role : [data.role];

            // Initialize connects ONLY for freelancers
            let connectsData = null;
            if (roles.includes('freelancer')) {
                connectsData = {
                    available: 50, // Starter pack
                    totalEarned: 50,
                    lastRefillDate: new Date().toISOString(),
                    history: [{
                        id: Date.now(),
                        type: 'earned',
                        amount: 50,
                        reason: 'Welcome Starter Pack',
                        date: new Date().toISOString()
                    }]
                };
            }

            // Default initial profile structure
            const newProfile = {
                name: data.name || '',
                email: data.email || "",
                role: roles,
                skills: [],
                bio: "",
                onboardingCompleted: false,
                onboarded: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                connects: connectsData, // Will be null for clients
                ...data // Merge provided data
            };

            await setDoc(userRef, newProfile);
            return newProfile;
        } catch (error) {
            console.error("Error creating user profile:", error);
            throw error;
        }
    },

    // Get User Profile
    getUserProfile: async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },
    // Subscribe to User Profile
    subscribeToUserProfile: (uid, callback) => {
        const userRef = doc(db, 'users', uid);
        return onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data());
            } else {
                callback(null);
            }
        }, (error) => {
            console.error("Error subscribing to user profile:", error);
        });
    },

    // Update User Profile with Custom ID Generation
    updateUserProfile: async (uid, data) => {
        try {
            console.log("Starting updateUserProfile transaction for:", uid);
            const userRef = doc(db, 'users', uid);

            // Prepare base update data
            const updateData = {
                ...data,
                updatedAt: new Date().toISOString()
            };

            if (data.onboarded || data.onboardingCompleted) {
                updateData.onboarded = true;
                updateData.onboardingCompleted = true;

                // 🔥 TRANSACTION: Generate ID and Write to Directory
                await runTransaction(db, async (transaction) => {
                    console.log("Inside transaction...");

                    // 1. Read Global Counter (Path: users -> directory -> counters -> main)
                    const counterRef = doc(db, 'users', 'directory', 'counters', 'main');
                    const counterSnap = await transaction.get(counterRef);

                    let counts = counterSnap.exists() ? counterSnap.data() : { freelancerCount: 0, clientCount: 0 };

                    // --- SELF-HEALING: Reset counters if data is wiped ---
                    if (counts.freelancerCount > 0) {
                        const checkRef = doc(db, 'users', 'directory', 'freelancers', 'F-001');
                        const checkSnap = await transaction.get(checkRef);
                        if (!checkSnap.exists()) {
                            console.log("Detected clean slate. Resetting Freelancer Counter.");
                            counts.freelancerCount = 0;
                        }
                    }
                    if (counts.clientCount > 0) {
                        const checkRef = doc(db, 'users', 'directory', 'clients', 'C-001');
                        const checkSnap = await transaction.get(checkRef);
                        if (!checkSnap.exists()) {
                            console.log("Detected clean slate. Resetting Client Counter.");
                            counts.clientCount = 0;
                        }
                    }

                    let didUpdateCounters = false;

                    // 2. Handle Roles & ID Generation
                    const rawRoles = data.role || [];
                    const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];

                    console.log("Roles detected:", roles);

                    let connectsToUpdate = null; // Track new connects to sync to main doc

                    // --- FREELANCER HANDLING ---
                    if (roles.includes('freelancer')) {
                        const newCount = (counts.freelancerCount || 0) + 1;
                        const newId = `F-${String(newCount).padStart(3, '0')}`;
                        console.log("Generated Freelancer ID:", newId);

                        updateData.freelancerId = newId;
                        counts.freelancerCount = newCount;
                        didUpdateCounters = true;

                        // Create Directory Entry: users/directory/freelancers/{F-ID}
                        const dirRef = doc(db, 'users', 'directory', 'freelancers', newId);

                        // Fetch existing data to properly populate directory
                        const userDoc = await transaction.get(userRef);
                        const userData = userDoc.exists() ? userDoc.data() : {};

                        // initialize connects if missing
                        let connectsData = userData.connects;
                        if (!connectsData) {
                            connectsData = {
                                available: 50,
                                totalEarned: 50,
                                lastRefillDate: new Date().toISOString(),
                                history: [{
                                    id: Date.now(),
                                    type: 'earned',
                                    amount: 50,
                                    reason: 'Welcome Starter Pack',
                                    date: new Date().toISOString()
                                }]
                            };
                            connectsToUpdate = connectsData; // Mark for update on main doc
                        }

                        // Sanitize payload
                        const profilePayload = {
                            uid: uid,
                            publicProfile: true,
                            name: data.name || userData.name || "",
                            email: data.email || userData.email || "",
                            role: roles,
                            createdAt: new Date().toISOString(),
                            connects: connectsData, // Ensure connects carry over
                            ...updateData
                        };

                        if (data.freelancerProfile) {
                            profilePayload.freelancerProfile = data.freelancerProfile;
                        }

                        transaction.set(dirRef, profilePayload);
                    }

                    // --- CLIENT HANDLING ---
                    if (roles.includes('client')) {
                        const newCount = (counts.clientCount || 0) + 1;
                        const newId = `C-${String(newCount).padStart(3, '0')}`;
                        console.log("Generated Client ID:", newId);

                        updateData.clientId = newId;
                        counts.clientCount = newCount;
                        didUpdateCounters = true;

                        // Create Directory Entry: users/directory/clients/{C-ID}
                        const dirRef = doc(db, 'users', 'directory', 'clients', newId);

                        const userDoc = await transaction.get(userRef);
                        const userData = userDoc.exists() ? userDoc.data() : {};

                        const profilePayload = {
                            uid: uid,
                            publicProfile: true,
                            name: data.name || userData.name || "",
                            email: data.email || userData.email || "",
                            role: roles,
                            createdAt: new Date().toISOString(),
                            ...updateData
                        };

                        if (data.clientProfile) {
                            profilePayload.clientProfile = data.clientProfile;
                        }

                        transaction.set(dirRef, profilePayload);
                    }

                    // 3. Commit Writes
                    if (didUpdateCounters) {
                        transaction.set(counterRef, counts);
                    }

                    // 🔥 OPTIMIZATION: Only save POINTERS on main doc if IDs generated
                    const pointerData = {
                        onboarded: true,
                        onboardingCompleted: true,
                        role: roles,
                        updatedAt: new Date().toISOString()
                    };

                    // If we initialized connects, save them to the main profile too
                    if (connectsToUpdate) {
                        pointerData.connects = connectsToUpdate;
                    }

                    if (updateData.freelancerId) pointerData.freelancerId = updateData.freelancerId;
                    if (updateData.clientId) pointerData.clientId = updateData.clientId;

                    transaction.update(userRef, pointerData);
                });

                console.log("Transaction committed successfully.");
                const finalSnap = await getDoc(userRef);
                return finalSnap.data();

            } else {
                // Standard non-onboarding update (no ID gen needed)
                await updateDoc(userRef, updateData);
                const updatedSnap = await getDoc(userRef);
                return updatedSnap.data();
            }

        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    },

    // Connects Management - Get Balance
    getConnectsBalance: async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return data.connects?.available || 0;
            }
            return 0;
        } catch (error) {
            console.error("Error getting connects balance:", error);
            return 0;
        }
    },

    // Connects Management - Deduct Connects
    deductConnects: async (uid, amount, reason) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) throw new Error('User not found');

            const userData = userSnap.data();
            const currentBalance = userData.connects?.available || 0;

            if (currentBalance < amount) {
                throw new Error('Insufficient connects balance');
            }

            const historyItem = {
                id: Date.now(),
                type: 'spent',
                amount: amount,
                reason: reason,
                date: new Date().toISOString()
            };

            const updates = {
                'connects.available': increment(-amount),
                'connects.history': arrayUnion(historyItem)
            };

            await updateDoc(userRef, updates);

            // SYNC: Update Directory if freelancerId exists
            if (userData.freelancerId) {
                const dirRef = doc(db, 'users', 'directory', 'freelancers', userData.freelancerId);
                // We use updateDoc safely assuming the directory doc exists (created efficiently during onboarding)
                await updateDoc(dirRef, updates).catch(err => console.warn("Directory sync failed (non-critical):", err));
            }

            const updatedSnap = await getDoc(userRef);
            return updatedSnap.data().connects;

        } catch (error) {
            console.error("Error deducting connects:", error);
            throw error;
        }
    },

    // Connects Management - Add Connects
    addConnects: async (uid, amount, reason) => {
        try {
            const userRef = doc(db, 'users', uid);
            // Fetch first to get Freelancer ID for sync
            const userSnap = await getDoc(userRef);

            // If user doesn't exist, can't add connects
            if (!userSnap.exists()) return null;
            const userData = userSnap.data();

            const historyItem = {
                id: Date.now(),
                type: 'earned',
                amount: amount,
                reason: reason,
                date: new Date().toISOString()
            };

            const updates = {
                'connects.available': increment(amount),
                'connects.totalEarned': increment(amount),
                'connects.history': arrayUnion(historyItem)
            };

            await updateDoc(userRef, updates);

            // SYNC: Update Directory if freelancerId exists
            if (userData.freelancerId) {
                const dirRef = doc(db, 'users', 'directory', 'freelancers', userData.freelancerId);
                await updateDoc(dirRef, updates).catch(err => console.warn("Directory sync failed (non-critical):", err));
            }

            const updatedSnap = await getDoc(userRef);
            return updatedSnap.data().connects;
        } catch (error) {
            console.error("Error adding connects:", error);
            throw error;
        }
    },

    // Calculate connects cost based on job budget
    calculateConnectsCost: (jobBudget) => {
        if (jobBudget < 5000) return 2;
        if (jobBudget < 25000) return 4;
        if (jobBudget < 100000) return 6;
        return 8;
    },

    // Get All Freelancers (for Client Search)
    // Get Single Freelancer by ID
    getFreelancerById: async (freelancerId) => {
        try {
            const docRef = doc(db, 'users', 'directory', 'freelancers', freelancerId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching freelancer details:", error);
            throw error;
        }
    },

    getFreelancers: async () => {
        try {
            const freelancersRef = collection(db, 'users', 'directory', 'freelancers');
            // Basic query - in real app would have pagination/limits
            const q = query(freelancersRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching freelancers:", error);
            return [];
        }
    }
};
