export const mockJobs = [
  {
    id: '1',
    clientId: 'client-1',
    title: 'Senior React Developer for Fintech Platform',
    description: 'We are looking for an experienced React developer to lead the frontend migration of our flagship trading platform. You will work closely with our backend team to ensure real-time data performance.',
    category: 'Development & IT',
    subCategory: 'Web Development',
    budgetType: 'hourly',
    budget: { min: 4000, max: 8000, rate: 6000 }, // hourly rate in INR
    duration: '3 to 6 months',
    level: 'expert',
    skills: ['React', 'TypeScript', 'Redux', 'WebSocket'],
    proposals: 12,
    client: {
      name: 'FinTech Solutions Ltd.',
      location: 'Mumbai, India',
      verified: true,
      spent: '₹5L+ spent',
      rating: 4.9
    },
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: 'open',
    isPromoted: true,
  },
  {
    id: '2',
    clientId: 'client-2',
    title: 'Modern Minimalist Logo Design for Coffee Brand',
    description: 'Seeking a creative designer to craft a unique, minimalist logo for our new premium coffee brand "Aroma". Deliverables include source files and brand guidelines.',
    category: 'Design & Creative',
    subCategory: 'Logo Design',
    budgetType: 'fixed',
    budget: { fixed: 15000 },
    duration: '1 to 4 weeks',
    level: 'intermediate',
    skills: ['Logo Design', 'Adobe Illustrator', 'Branding'],
    proposals: 45,
    client: {
      name: 'Aroma Coffee',
      location: 'Bangalore, India',
      verified: true,
      spent: '₹50k+ spent',
      rating: 4.5
    },
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: 'open',
    isPromoted: false,
  },
  {
    id: '3',
    clientId: 'client-3',
    title: 'AI Chatbot Integration using OpenAI API',
    description: 'Need a Python expert to integrate GPT-4 into our customer support dashboard. The bot should handle FAQs and route complex queries to human agents.',
    category: 'AI Services',
    subCategory: 'AI Development',
    budgetType: 'fixed',
    budget: { fixed: 120000 },
    duration: '1 to 3 months',
    level: 'expert',
    skills: ['Python', 'OpenAI', 'LangChain', 'API Integration'],
    proposals: 8,
    client: {
      name: 'TechFlow Systems',
      location: 'Remote',
      verified: false,
      spent: '₹0 spent',
      rating: 0
    },
    postedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    status: 'open',
    isPromoted: true,
  },
  {
    id: '4',
    clientId: 'client-4',
    title: 'SEO Content Writer for Travel Blog',
    description: 'Looking for a native writer to create 10 high-quality, SEO-optimized articles about "Hidden Gems in India". Must have experience in travel niches.',
    category: 'Writing & Translation',
    subCategory: 'Article Writing',
    budgetType: 'fixed',
    budget: { fixed: 5000 },
    duration: 'Less than 1 month',
    level: 'beginner',
    skills: ['Content Writing', 'SEO', 'Creative Writing'],
    proposals: 2,
    client: {
      name: 'Wanderlust Media',
      location: 'Delhi, India',
      verified: true,
      spent: '₹20k+ spent',
      rating: 4.8
    },
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    status: 'open',
    isPromoted: false,
  },
  {
    id: '5',
    clientId: 'client-5',
    title: 'Full Stack MERN Developer for SaaS MVP',
    description: 'Building an MVP for a project management tool. Need someone proficient in MongoDB, Express, React, and Node.js to fast-track development.',
    category: 'Development & IT',
    subCategory: 'Full Stack',
    budgetType: 'hourly',
    budget: { min: 1500, max: 2500, rate: 2000 }, // hourly
    duration: '3 to 6 months',
    level: 'intermediate',
    skills: ['MERN Stack', 'Redux', 'Tailwind CSS'],
    proposals: 15,
    client: {
      name: 'StartUp Hub',
      location: 'Hyderabad, India',
      verified: true,
      spent: '₹2L+ spent',
      rating: 4.7
    },
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    status: 'open',
    isPromoted: false,
  },
];

export const mockFreelancers = [
  {
    id: 'freelancer-1',
    email: 'dev@example.com',
    name: 'Rahul Kumar',
    avatar: undefined,
    role: 'freelancer',
    phone: '+91 98765 43210',
    bio: 'Full-stack developer with 5+ years experience in React and Node.js',
    location: 'India',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
    hourlyRate: 800,
    totalEarnings: 450000,
    completedProjects: 23,
    rating: 4.8,
    reviews: [],
  },
  {
    id: 'freelancer-2',
    email: 'designer@example.com',
    name: 'Priya Singh',
    avatar: undefined,
    role: 'freelancer',
    phone: '+91 98765 43211',
    bio: 'UI/UX Designer specializing in mobile apps and SaaS platforms',
    location: 'India',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    skills: ['Figma', 'UI Design', 'UX Design', 'Prototyping', 'Illustrator'],
    hourlyRate: 600,
    totalEarnings: 320000,
    completedProjects: 18,
    rating: 4.9,
    reviews: [],
  },
];

export const mockProjects = [
  {
    id: 'proj-1',
    title: 'Fintech Dashboard Revamp',
    clientName: 'FinEdge Solutions',
    clientAvatar: 'FE',
    status: 'Active',
    progress: 65,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days left
    nextMilestone: 'Frontend Integration',
    budgetTotal: 120000,
    budgetConsumed: 75000,
    techStack: ['React', 'Tailwind', 'Chart.js'],
    milestones: [
      { id: 1, title: 'UX Research', completed: true },
      { id: 2, title: 'UI Design System', completed: true },
      { id: 3, title: 'Frontend Integration', completed: false },
      { id: 4, title: 'Backend Connection', completed: false },
    ]
  },
  {
    id: 'proj-2',
    title: 'E-commerce Mobile App',
    clientName: 'ShopKart Inc.',
    clientAvatar: 'SK',
    status: 'In Review',
    progress: 95,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days left
    nextMilestone: 'Final Testing & Handoff',
    budgetTotal: 250000,
    budgetConsumed: 220000,
    techStack: ['React Native', 'Firebase', 'Redux'],
    milestones: [
      { id: 1, title: 'Core Features', completed: true },
      { id: 2, title: 'Payment Gateway', completed: true },
      { id: 3, title: 'Admin Panel', completed: true },
      { id: 4, title: 'App Store Submission', completed: false },
    ]
  },
  {
    id: 'proj-3',
    title: 'Corporate Branding Pack',
    clientName: 'Alpha Corp',
    clientAvatar: 'AC',
    status: 'Completed',
    progress: 100,
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 1 month ago
    nextMilestone: 'Project Closed',
    budgetTotal: 45000,
    budgetConsumed: 45000,
    techStack: ['Illustrator', 'Photoshop', 'Indesign'],
    milestones: [
      { id: 1, title: 'Logo Concepts', completed: true },
      { id: 2, title: 'Brand Guidelines', completed: true },
      { id: 3, title: 'Stationery Kit', completed: true },
    ]
  }
];

export const mockChats = [
  {
    id: 'c1',
    userId: 'u2',
    name: 'Sarah Jenkins',
    avatar: 'SJ',
    status: 'online',
    lastMessage: 'The new designs look fantastic! When can we review?',
    time: '10:42 AM',
    unread: 2
  },
  {
    id: 'c2',
    userId: 'u3',
    name: 'Michael Chen',
    avatar: 'MC',
    status: 'offline',
    lastMessage: 'Payment has been released for the first milestone.',
    time: 'Yesterday',
    unread: 0
  },
  {
    id: 'c3',
    userId: 'u4',
    name: 'David Wilson',
    avatar: 'DW',
    status: 'online',
    lastMessage: 'Perfect, thanks for the update.',
    time: 'Tue',
    unread: 0
  }
];

export const mockChatMessages = {
  c1: [
    { id: 'm1', fromMe: false, text: 'Hi! Just checking in on the progress.', time: '10:30 AM' },
    { id: 'm2', fromMe: true, text: 'Hey Sarah! Making good progress. I will have a preview ready by EOD.', time: '10:35 AM' },
    { id: 'm3', fromMe: false, text: 'That is great news.', time: '10:40 AM' },
    { id: 'm4', fromMe: false, text: 'The new designs look fantastic! When can we review?', time: '10:42 AM' }
  ],
  c2: [
    { id: 'm1', fromMe: true, text: 'Milestone 1 is complete. Please check the dashboard.', time: 'Yesterday' },
    { id: 'm2', fromMe: false, text: 'Payment has been released for the first milestone.', time: 'Yesterday' }
  ],
  c3: [
    { id: 'm1', fromMe: true, text: 'Here are the final assets.', time: 'Tue' },
    { id: 'm2', fromMe: false, text: 'Perfect, thanks for the update.', time: 'Tue' }
  ]
};
