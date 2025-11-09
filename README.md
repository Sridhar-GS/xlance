# Xlance - Freelancing Platform for India

A modern, production-ready freelancing platform built with React, Vite, Tailwind CSS, and Supabase. Designed to connect freelancers and clients in India with a focus on trust, quality, and secure payments.

## Features

- **Modern UI/UX**: Glassmorphism design with smooth animations powered by Framer Motion
- **Authentication**: Email/password signup and signin with Supabase Auth
- **Dual Dashboards**: Separate dashboards for freelancers and clients
- **Job Management**: Post jobs, browse opportunities, and submit proposals
- **Secure Payments**: UPI-focused payment integration ready
- **Real-time Messaging**: Built-in chat system for communication
- **Rating & Reviews**: Comprehensive review system for quality assurance
- **Mobile Responsive**: Fully responsive design for all devices
- **Accessibility**: WCAG-compliant components with proper semantic HTML
- **SEO Optimized**: Meta tags and structured data for search engines

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 3 with custom theme
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router v7
- **State Management**: React Context API

## Project Structure

```
src/
├── components/
│   ├── common/              # Reusable components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── index.ts
│   ├── home/                # Home page sections
│   │   ├── HeroSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── NichesSection.tsx
│   │   ├── WhyChooseUs.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── CTASection.tsx
│   │   └── index.ts
│   └── dashboard/           # Dashboard components
│       ├── FreelancerDashboard.tsx
│       ├── ClientDashboard.tsx
│       └── index.ts
├── pages/
│   ├── HomePage.tsx
│   ├── SignUpPage.tsx
│   ├── SignInPage.tsx
│   └── DashboardPage.tsx
├── context/
│   └── AuthContext.tsx      # Global auth state
├── hooks/
│   ├── useApi.ts
│   └── index.ts
├── utils/
│   ├── constants.ts         # App constants
│   ├── helpers.ts           # Utility functions
│   ├── mockData.ts          # Mock data for development
│   └── index.ts
├── types/
│   └── index.ts             # TypeScript type definitions
├── config/
│   └── supabase.ts          # Supabase client setup
├── App.tsx
├── main.tsx
└── index.css
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd xlance
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Database Schema

### Core Tables

- **users**: Authentication and profile information
- **freelancer_profiles**: Freelancer-specific data (skills, earnings, rating)
- **client_profiles**: Client-specific data (company, budget, projects)
- **jobs**: Job postings with requirements
- **proposals**: Freelancer proposals for jobs
- **messages**: Chat messages between users
- **payments**: Payment transaction records
- **reviews**: User reviews and ratings

All tables include:
- Row Level Security (RLS) policies
- Proper foreign key relationships
- Indexed columns for performance
- Timestamp tracking (created_at, updated_at)

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Key Components

### Button
Versatile button component with variants (primary, secondary, ghost, outline) and sizes (sm, md, lg).

```tsx
<Button variant="primary" size="md" isLoading={false}>
  Click me
</Button>
```

### Card
Reusable card component with glass effect and solid options.

```tsx
<Card variant="glass" hover={true}>
  Content here
</Card>
```

### Input
Form input with validation and error handling.

```tsx
<Input
  label="Email"
  type="email"
  error={errors.email}
  icon={<Mail size={20} />}
  value={email}
  onChange={handleChange}
/>
```

### AuthContext
Global authentication state management.

```tsx
const { user, loading, signUp, signIn, signOut } = useAuth();
```

## Styling

Custom Tailwind theme with:
- Primary blue color palette (#5B7FFF)
- Glass effect utilities
- Smooth animations
- Responsive spacing system
- Gradient text utilities

## API Integration

The app is structured to easily integrate with:
- Custom Edge Functions for complex operations
- Supabase REST API for CRUD operations
- Real-time subscriptions for live updates

## Security

- Row Level Security (RLS) on all tables
- Secure authentication with Supabase
- Protected routes and dashboards
- No sensitive data in localStorage
- CORS headers properly configured

## Performance

- Code splitting with Vite
- Tree-shaking for optimal bundle size
- Lazy loading for images
- Memoized components with React.memo
- Efficient re-renders with proper dependency arrays

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Set environment variables
4. Deploy

## Customization

### Theme Colors
Edit `tailwind.config.js` to change the primary color palette.

### Services & Niches
Update `src/utils/constants.ts` with your categories.

### Mock Data
Modify `src/utils/mockData.ts` for testing without backend.

## Type Safety

The project uses TypeScript with strict mode enabled. All types are defined in `src/types/index.ts`.

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run build` to verify
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please create an issue in the repository or contact support@xlance.com
