/*
  Types (previously written in TypeScript). This file is a JS-compatible
  version containing JSDoc typedefs so editors that understand JSDoc can
  still provide hints. The runtime exports an empty object — these are
  only for developer documentation.
*/

/**
 * @typedef {'freelancer' | 'client' | 'admin'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string=} avatar
 * @property {UserRole} role
 * @property {string=} phone
 * @property {string=} bio
 * @property {string=} location
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {User & {
 *   skills: string[];
 *   hourlyRate: number;
 *   totalEarnings: number;
 *   completedProjects: number;
 *   rating: number;
 *   reviews: Review[];
 * }} FreelancerProfile
 */

/**
 * @typedef {User & {
 *   companyName?: string;
 *   budget: number;
 *   totalSpent: number;
 *   postedJobs: number;
 * }} ClientProfile
 */

/**
 * @typedef {'AI Services'|'Development & IT'|'Design & Creative'|'Sales & Marketing'|'Admin & Support'|'Writing & Translation'} JobCategory
 */

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} clientId
 * @property {string} title
 * @property {string} description
 * @property {JobCategory} category
 * @property {number} budget
 * @property {string} duration
 * @property {'beginner'|'intermediate'|'expert'} level
 * @property {string[]} skills
 * @property {Proposal[]} proposals
 * @property {'open'|'in_progress'|'completed'|'cancelled'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Proposal
 * @property {string} id
 * @property {string} jobId
 * @property {string} freelancerId
 * @property {number} bidAmount
 * @property {string} message
 * @property {'pending'|'accepted'|'rejected'} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} fromUserId
 * @property {string} toUserId
 * @property {string} jobId
 * @property {number} rating
 * @property {string} comment
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} senderId
 * @property {string} receiverId
 * @property {string=} jobId
 * @property {string} content
 * @property {string} createdAt
 * @property {boolean} read
 */

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} jobId
 * @property {number} amount
 * @property {'pending'|'completed'|'failed'|'refunded'} status
 * @property {'upi'|'card'|'bank'} paymentMethod
 * @property {string} transactionId
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Niche
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {string} description
 * @property {number} jobCount
 */

// Export an empty object at runtime — types are for editor hints only.
export default {};
