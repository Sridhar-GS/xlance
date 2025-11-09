# Xlance Platform - Architecture Documentation

## Overview

Xlance is a full-stack freelancing platform built with modern technologies prioritizing scalability, security, and user experience. The architecture follows a clean, modular design pattern with clear separation of concerns.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages (Home, Auth, Dashboard)                       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Components (Common, Home, Dashboard)                │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Context & Hooks (Auth, API)                         │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Utilities & Helpers                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   Supabase Client SDK
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication (JWT-based)                          │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  PostgreSQL Database                                 │   │
│  │  - Users & Profiles                                  │   │
│  │  - Jobs & Proposals                                  │   │
│  │  - Messages & Reviews                                │   │
│  │  - Payments                                          │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Row Level Security (RLS)                            │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Real-time Subscriptions                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### Common Components
Reusable, atomic components used across the application:

- **Button**: Versatile button with multiple variants
- **Card**: Container component with glass effect
- **Badge**: Status and tag component
- **Input**: Form input with validation
- **Navbar**: Navigation header with auth integration
- **Footer**: Site footer
- **LoadingSpinner**: Loading state indicator

### Page Components
Full-page components representing routes:

- **HomePage**: Landing page with all sections
- **SignUpPage**: User registration
- **SignInPage**: User login
- **DashboardPage**: Post-auth dashboard

### Feature Components
Feature-specific components:

**Home Page Sections:**
- HeroSection: Hero with CTA
- ServicesSection: Service categories
- NichesSection: Popular niches
- WhyChooseUs: Value proposition
- HowItWorks: Process explanation
- CTASection: Final call-to-action

**Dashboard Sections:**
- FreelancerDashboard: Freelancer overview
- ClientDashboard: Client overview

## State Management

### Authentication Context
Global authentication state managed through `AuthContext`:

```tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string, role: 'freelancer' | 'client') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

**How it works:**
1. On app mount, checks existing session
2. Sets up auth state listener
3. Updates user on auth changes
4. Provides global auth context to entire app

### Custom Hooks
- **useAuth**: Access authentication state
- **useApi**: Manage API calls with loading/error states

## Database Design

### Entity Relationship Diagram

```
users (auth_users)
├── freelancer_profiles (1:1)
├── client_profiles (1:1)
├── jobs (1:many as client)
├── proposals (1:many as freelancer)
├── messages_sent (1:many as sender)
├── messages_received (1:many as receiver)
└── reviews (1:many as from_user, to_user)

jobs
├── client_id (FK → users)
├── proposals (1:many)
├── payments (1:many)
└── messages (1:many)

proposals
├── job_id (FK → jobs)
└── freelancer_id (FK → users)

messages
├── sender_id (FK → users)
├── receiver_id (FK → users)
└── job_id (FK → jobs, optional)

payments
└── job_id (FK → jobs)

reviews
├── from_user_id (FK → users)
├── to_user_id (FK → users)
└── job_id (FK → jobs)
```

### Row Level Security (RLS) Policies

**Users Table:**
- Users can SELECT their own profile
- Users can UPDATE their own profile
- Admins can access all

**Freelancer Profiles:**
- Freelancers can SELECT/UPDATE their own
- Public can SELECT (public profiles)
- Clients can SELECT (browsing)

**Jobs Table:**
- Clients can CREATE/UPDATE/DELETE own jobs
- Freelancers can SELECT open jobs
- Clients can SELECT own jobs

**Proposals:**
- Freelancers can CREATE proposals
- Freelancers can SELECT own proposals
- Clients can SELECT proposals for own jobs

**Messages:**
- Users can SELECT own messages
- Users can INSERT messages

**Payments:**
- Users involved can SELECT

**Reviews:**
- Public can SELECT all
- Users can INSERT reviews

## Routing Structure

```
/                           → HomePage
/auth/signup                → SignUpPage (Guest only)
/auth/signin                → SignInPage (Guest only)
/dashboard/:role            → DashboardPage (Protected)
  /dashboard/freelancer     → FreelancerDashboard
  /dashboard/client         → ClientDashboard
```

## Type System

TypeScript types organized in `src/types/index.ts`:

```tsx
User              // Base user type
FreelancerProfile // Extends User
ClientProfile     // Extends User
Job               // Job listing
Proposal          // Freelancer proposal
Review            // User review
Message           // Chat message
Payment           // Transaction
Niche             // Service category
```

## Data Flow

### Authentication Flow

```
1. User → SignUpPage/SignInPage
2. ↓
3. Form submission → AuthContext
4. ↓
5. Supabase Auth API
6. ↓
7. Create/Retrieve User Profile (Supabase DB)
8. ↓
9. AuthContext updates → UI Updates
10. ↓
11. Redirect to Dashboard
```

### Job Search Flow

```
1. User on HomePage or Dashboard
2. ↓
3. Fetch Jobs from Supabase (filtered by RLS)
4. ↓
5. Display in UI with pagination
6. ↓
7. User clicks Job
8. ↓
9. Navigate to Job Detail (future)
10. ↓
11. User submits Proposal
12. ↓
13. Insert Proposal in DB (RLS validates)
14. ↓
15. Notify Client (future)
```

## Styling Architecture

### Theme System

**Tailwind Configuration:**
- Custom primary color palette (#5B7FFF)
- Glass effect utilities
- Animation definitions
- Custom spacing system

**Color Palette:**
```tsx
primary: {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#5B7FFF',     // Main
  600: '#4c6eeb',
  700: '#3b5bdb',
  800: '#2e4bb8',
  900: '#1e3a8a',
}
```

### Design Patterns

**Glassmorphism:**
```css
glass-effect: bg-white/70 backdrop-blur-lg border border-white/20 shadow-glass
glass-effect-strong: bg-white/80 backdrop-blur-xl border border-white/30 shadow-glass-lg
```

**Animations:**
```css
fade-in: 0.5s ease-in-out opacity
slide-up: 0.5s ease-out translateY(-20px)
slide-down: 0.3s ease-out translateY(20px)
```

## Performance Optimizations

1. **Code Splitting**: Vite automatically chunks components
2. **Tree Shaking**: Unused code removed in production
3. **Lazy Loading**: Components imported dynamically (future)
4. **Image Optimization**: Use external Pexels links
5. **Memoization**: Expensive components wrapped with React.memo (when needed)
6. **Bundle Analysis**: Vite provides build statistics

## Security Considerations

1. **Authentication**: Supabase Auth with JWT tokens
2. **Authorization**: RLS policies on all tables
3. **Data Validation**: TypeScript ensures type safety
4. **CORS**: Configured for Supabase
5. **Secrets**: Environment variables, never committed
6. **HTTPS**: Always use in production
7. **XSS Prevention**: React auto-escapes by default

## Scalability Considerations

1. **Database Indexing**: Indexes on foreign keys and frequently queried columns
2. **Query Optimization**: Efficient Supabase queries
3. **Component Reusability**: Reduces bundle size
4. **API Rate Limiting**: Implement future rate limiting
5. **Caching**: Consider Supabase real-time for performance
6. **CDN**: Deploy to global CDN (Vercel, Netlify)

## Testing Strategy (Future Implementation)

```
Unit Tests:
├── Utility functions (helpers.ts)
├── Components (isolated with Vitest)
└── Hooks (custom hooks testing)

Integration Tests:
├── Auth flows
├── Job CRUD operations
└── Message sending

E2E Tests:
├── Complete user flows
├── Dashboard interactions
└── Payment flows
```

## Error Handling

1. **Auth Errors**: Displayed to user with clear messages
2. **API Errors**: Caught and logged with fallback UI
3. **Form Validation**: Inline error messages
4. **Network Errors**: Retry logic for failed requests (future)

## Future Enhancements

1. **Real-time Chat**: WebSocket integration
2. **Video Calls**: WebRTC integration
3. **AI Job Matching**: Machine learning recommendations
4. **Payment Processing**: Stripe/UPI integration
5. **File Uploads**: Document and portfolio management
6. **Analytics**: User behavior tracking
7. **Admin Dashboard**: Platform management tools
8. **Mobile App**: React Native version
9. **Notifications**: Push notifications system
10. **API Documentation**: OpenAPI/Swagger documentation

## Development Guidelines

### File Naming
- Components: PascalCase (Button.tsx)
- Utilities: camelCase (helpers.ts)
- Types: index.ts in types folder
- Exports: Use named exports in index.ts

### Component Structure
```tsx
import React from 'react';
import { ComponentType } from '../types';

interface Props {
  // props interface
}

const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  // Component logic

  return (
    // JSX
  );
};

export default Component;
```

### Commit Message Convention
- `feat: Add new feature`
- `fix: Fix bug`
- `refactor: Refactor code`
- `docs: Update documentation`
- `test: Add tests`
- `chore: Maintenance tasks`

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build completed successfully
- [ ] No console errors or warnings
- [ ] Tests passing
- [ ] Bundle size reviewed
- [ ] SEO tags verified
- [ ] HTTPS enabled
- [ ] Backups configured
- [ ] Monitoring setup
