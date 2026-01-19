import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, getDoc, deleteDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { notificationService } from './notificationService';

export const projectService = {
    // Get active projects for a freelancer
    getProjectsByFreelancer: async (freelancerId) => {
        try {
            const q = query(
                collection(db, 'projects'),
                where('freelancerId', '==', freelancerId)
            );
            const querySnapshot = await getDocs(q);
            const projects = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date()),
                    dueDate: data.dueDate?.toDate ? data.dueDate.toDate().toISOString() : data.dueDate,
                };
            });

            // Sort in-memory to avoid composite index requirement
            return projects.sort((a, b) => b.updatedAt - a.updatedAt);
        } catch (error) {
            console.error("Error fetching projects:", error);
            return [];
        }
    },

    // Update project details (e.g. milestones, progress)
    updateProject: async (projectId, updateData) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating project:", error);
            throw error;
        }
    },

    // Create a new project (usually called when proposal is accepted)
    createProject: async (projectData) => {
        try {
            // Semantic ID: PRJ_{JobId} ensures 1:1 mapping
            const projectId = projectData.jobId ? `PRJ_${projectData.jobId}` : `PRJ_${Date.now()}`;
            const docRef = doc(db, 'projects', projectId);

            await setDoc(docRef, {
                ...projectData,
                id: projectId,
                status: 'Active',
                progress: 0,
                budgetConsumed: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return projectId;
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    },

    // Delete a project
    deleteProject: async (projectId) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await deleteDoc(projectRef);
        } catch (error) {
            console.error("Error deleting project:", error);
            throw error;
        }
    },

    // Seed a demo project for the user if they have none (Development Helper)
    seedDemoProject: async (freelancerId) => {
        const demoProject = {
            freelancerId,
            title: "E-Commerce Dashboard Redesign",
            clientName: "TechCorp Inc.",
            clientAvatar: "TC",
            clientUserId: "demo_client_1", // Added for messaging
            status: "Active",
            dueDate: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
            budgetTotal: 45000,
            budgetConsumed: 15000,
            progress: 35,
            nextMilestone: "User Profile Integration",
            milestones: [
                { id: 1, title: "UI Design Approval", completed: true },
                { id: 2, title: "Frontend Implementation", completed: false },
                { id: 3, title: "API Integration", completed: false }
            ]
        };
        return await projectService.createProject(demoProject);
    },

    // Submit Deliverable (Freelancer Action) -> Notify Client
    submitDeliverable: async (projectId, deliverableData) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                deliverables: arrayUnion({
                    ...deliverableData,
                    submittedAt: new Date().toISOString(),
                    status: 'pending'
                }),
                status: 'Under Review'
            });

            // Notify Client
            const projectSnap = await getDoc(projectRef);
            if (projectSnap.exists()) {
                const data = projectSnap.data();
                if (data.clientUserId) {
                    await notificationService.addNotification(
                        data.clientUserId,
                        'info',
                        'Deliverables Submitted',
                        `${data.freelancerName || 'Freelancer'} submitted work for "${data.title}".`,
                        projectId,
                        { type: 'project', projectId }
                    );
                }
            }
        } catch (error) {
            console.error("Error submitting deliverable:", error);
            throw error;
        }
    },

    // Approve Milestone (Client Action) -> Notify Freelancer
    approveMilestone: async (projectId, milestoneTitle) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            // Updating a nested array object is hard in standard firestore without reading first
            // For MVP we assume we fetch, update array, write back or just set status
            // Here we just notify for the event simulation

            // Notify Freelancer
            const projectSnap = await getDoc(projectRef);
            if (projectSnap.exists()) {
                const data = projectSnap.data();
                if (data.freelancerId) {
                    await notificationService.addNotification(
                        data.freelancerId,
                        'success',
                        'Milestone Approved',
                        `Client approved milestone: "${milestoneTitle}". Payment released.`,
                        projectId,
                        { type: 'project', projectId }
                    );
                }
            }
        } catch (error) {
            console.error("Error approving milestone:", error);
            throw error;
        }
    }
};
