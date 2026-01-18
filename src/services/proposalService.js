import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, updateDoc, increment, setDoc, collectionGroup } from 'firebase/firestore';
import { userService } from './userService';

export const proposalService = {
  // Create a new proposal
  createProposal: async (proposalData) => {
    try {
      // 1. Deduct connects first (optimistic check)
      // Default cost is 4, or calculate based on job budget if available
      const connectsCost = 4;
      await userService.deductConnects(proposalData.freelancerId, connectsCost, `Proposal for: ${proposalData.jobTitle}`);

      // 2. Create Proposal Document in Subcollection
      // Path: jobs/{jobId}/proposals/{freelancerId}
      // Using setDoc ensures one proposal per freelancer per job
      const proposalRef = doc(db, 'jobs', proposalData.jobId, 'proposals', proposalData.freelancerId);

      await setDoc(proposalRef, {
        ...proposalData,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // 3. Increment Proposal Count on Job
      const jobRef = doc(db, 'jobs', proposalData.jobId);
      await updateDoc(jobRef, {
        proposalsCount: increment(1)
      });

      return proposalRef.id;
    } catch (error) {
      console.error("Error creating proposal:", error);
      throw error;
    }
  },

  // Get proposals for a specific job (Client view)
  getProposalsByJob: async (jobId) => {
    try {
      const proposalsRef = collection(db, 'jobs', jobId, 'proposals');
      const q = query(proposalsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching job proposals:", error);
      return [];
    }
  },

  // Get proposals made by a freelancer (Freelancer view)
  getProposalsByFreelancer: async (freelancerId) => {
    try {
      // Use collectionGroup query to search across all jobs
      const q = query(
        collectionGroup(db, 'proposals'),
        where('freelancerId', '==', freelancerId)
      );
      const querySnapshot = await getDocs(q);
      const proposals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory to avoid complex index requirements initially
      return proposals.sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
      });
    } catch (error) {
      console.error("Error fetching freelancer proposals:", error);
      return [];
    }
  },

  // Accept a proposal
  acceptProposal: async (proposalId, proposalData, currentClientUid) => {
    try {
      const { projectService } = await import('./projectService');
      const { messageService } = await import('./messageService');

      // 1. Create Project
      const projectData = {
        title: proposalData.jobTitle,
        clientName: proposalData.clientName || 'Client',
        clientAvatar: proposalData.clientAvatar || 'C',
        clientUserId: proposalData.clientUserId,
        freelancerId: proposalData.freelancerId,
        freelancerName: proposalData.freelancerName,
        budgetTotal: proposalData.bidAmount,
        status: 'Active',
        dueDate: new Date(Date.now() + 86400000 * 30).toISOString(), // Default 30 days or from proposal
      };
      const projectId = await projectService.createProject(projectData);

      // 2. Update Proposal Status
      const proposalRef = doc(db, 'jobs', proposalData.jobId, 'proposals', proposalId);
      await updateDoc(proposalRef, {
        status: 'accepted',
        projectId: projectId,
        updatedAt: serverTimestamp()
      });

      // 3. Start Conversation
      await messageService.startConversation(
        currentClientUid || proposalData.clientUserId,
        proposalData.freelancerId,
        proposalData.freelancerName,
        '' // Avatar if available
      );

      // 4. Update Job Status to Closed (One hire per job rule)
      const jobRef = doc(db, 'jobs', proposalData.jobId);
      await updateDoc(jobRef, {
        status: 'closed',
        hiredFreelancerId: proposalData.freelancerId,
        updatedAt: serverTimestamp()
      });

      // 5. Reward Freelancer (Refund + Bonus)
      // Connects update is now allowed by Secure Firestore Rules!
      try {
        await userService.addConnects(
          proposalData.freelancerId,
          8,
          `Hired for: ${proposalData.jobTitle} (Bonus)`
        );
      } catch (err) {
        console.error("Error rewarding connects (Non-critical):", err);
      }

      return projectId;
    } catch (error) {
      console.error("Error accepting proposal:", error);
      throw error;
    }
  }
};