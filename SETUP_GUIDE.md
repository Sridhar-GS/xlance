# Xlance Setup Guide

Complete setup instructions to get Xlance running on your local machine and deployed to production.

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/xlance.git
cd xlance
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note your:
   - Project URL
   - Anon Key (public)
   - Service Role Key (keep secret)

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Apply Database Migrations

The database schema is automatically set up through Supabase migrations:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration in order:
   - 001_create_users_table
   - 002_create_freelancer_profiles_table
   - 003_create_client_profiles_table
   - 004_create_jobs_table
   - 005_create_proposals_table
   - 006_create_messages_table
   - 007_create_payments_table
   - 008_create_reviews_table

Or use the Supabase migrations API (if setting up programmatically).

### Step 6: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 7: Test the Application

1. **Sign Up**: Create a new account as a freelancer or client
2. **Navigate**: Explore the homepage
3. **Dashboard**: Access the dashboard
4. **Browse Jobs**: View job listings

## Feature Walkthrough

### 1. Authentication

**Sign Up Flow:**
- Visit `/auth/signup`
- Enter name, email, password
- Select role (Freelancer or Client)
- Account created in auth.users table
- Profile created in users table

**Sign In Flow:**
- Visit `/auth/signin`
- Enter email and password
- Redirected to dashboard

### 2. Home Page Sections

- **Hero Section**: Main value proposition with CTA
- **Services Section**: 6 service categories
- **Niches Section**: Popular freelancing niches
- **Why Choose Us**: 4 key features
- **How It Works**: 4-step process
- **CTA Section**: Final conversion opportunity

### 3. Freelancer Dashboard

Shows:
- Active projects count
- Total earnings
- Rating
- Profile views
- Recent job list

### 4. Client Dashboard

Shows:
- Posted jobs count
- Freelancers hired
- Total spent
- Completed projects
- Posted jobs list

## Database Setup Details

### Users Table

Stores authentication and basic profile info:

```sql
id (uuid) - references auth.users.id
email (text, unique)
name (text)
role ('freelancer' | 'client')
avatar (text, nullable)
phone (text, nullable)
bio (text, nullable)
location (text, nullable)
created_at (timestamptz)
updated_at (timestamptz)
```

**Policies:**
- Users can read/update their own profile
- Public cannot access

### Freelancer Profiles Table

Extends users for freelancer-specific data:

```sql
user_id (uuid, FK to users)
skills (text array)
hourly_rate (numeric)
total_earnings (numeric)
completed_projects (integer)
rating (numeric, 0-5)
```

**Policies:**
- Freelancers can read/update own profile
- Public can view (browsing)
- Clients can view (hiring)

### Client Profiles Table

Extends users for client-specific data:

```sql
user_id (uuid, FK to users)
company_name (text, nullable)
budget (numeric)
total_spent (numeric)
posted_jobs (integer)
```

**Policies:**
- Clients can read/update own profile
- Only own access for write operations

### Jobs Table

Job postings:

```sql
id (uuid)
client_id (uuid, FK to users)
title (text)
description (text)
category (text)
budget (numeric)
duration (text)
level ('beginner' | 'intermediate' | 'expert')
skills (text array)
status ('open' | 'in_progress' | 'completed' | 'cancelled')
created_at (timestamptz)
```

**Policies:**
- Clients can create/update/delete own
- Freelancers can view open jobs
- Public can view open jobs

### Proposals Table

Freelancer proposals for jobs:

```sql
id (uuid)
job_id (uuid, FK to jobs)
freelancer_id (uuid, FK to users)
bid_amount (numeric)
message (text)
status ('pending' | 'accepted' | 'rejected')
created_at (timestamptz)
```

**Policies:**
- Freelancers can create proposals
- Each freelancer can propose once per job
- Clients can view proposals for own jobs

### Messages Table

Chat messages:

```sql
id (uuid)
sender_id (uuid, FK to users)
receiver_id (uuid, FK to users)
job_id (uuid, FK to jobs, optional)
content (text)
read (boolean)
created_at (timestamptz)
```

**Policies:**
- Users can only read their own messages
- Users can send messages

### Payments Table

Payment transactions:

```sql
id (uuid)
job_id (uuid, FK to jobs)
amount (numeric)
status ('pending' | 'completed' | 'failed' | 'refunded')
payment_method ('upi' | 'card' | 'bank')
transaction_id (text, unique)
created_at (timestamptz)
```

### Reviews Table

User reviews and ratings:

```sql
id (uuid)
from_user_id (uuid, FK to users)
to_user_id (uuid, FK to users)
job_id (uuid, FK to jobs)
rating (numeric, 1-5)
comment (text)
created_at (timestamptz)
```

**Policies:**
- Public can view all reviews
- Users can create reviews
- One review per job per user (unique constraint)

## Customization

### Change Primary Color

Edit `tailwind.config.js`:

```js
colors: {
  primary: {
    500: '#YOUR_COLOR_HEX',  // Change this
    // ...
  }
}
```

### Update Service Categories

Edit `src/utils/constants.ts`:

```ts
export const SERVICES = [
  { id: 1, name: 'Your Service', icon: 'IconName' },
  // Add more...
];
```

### Update How It Works Steps

Edit `src/utils/constants.ts`:

```ts
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Your Title',
    description: 'Your Description',
  },
  // Add more...
];
```

## Deployment

### Build for Production

```bash
npm run build
```

Creates optimized production build in `dist/` folder.

### Deploy to Vercel

1. **Connect Git Repository:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables:**
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Connect GitHub Repository:**
   - Go to netlify.com
   - Click "New site from Git"
   - Connect GitHub repo

2. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set Environment Variables:**
   - Site settings → Build & deploy → Environment
   - Add variables

4. **Deploy:**
   - Push to main branch
   - Netlify auto-deploys

### Environment Variables for Production

Create `.env.production`:

```env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
```

## Security Checklist

- [ ] All environment variables set in production
- [ ] HTTPS enabled on domain
- [ ] Supabase Auth email confirmation configured
- [ ] RLS policies enabled on all tables
- [ ] Database backups configured
- [ ] API rate limiting considered
- [ ] CORS properly configured
- [ ] Service role key never exposed
- [ ] User inputs validated
- [ ] Passwords hashed (automatic with Supabase)

## Monitoring & Maintenance

### Supabase Monitoring

1. Go to Supabase dashboard
2. Check:
   - Database health
   - Auth logs
   - API usage
   - Storage usage

### Application Monitoring

Use:
- Vercel Analytics
- Sentry for error tracking
- LogRocket for session replay

## Troubleshooting

### Issue: "VITE_SUPABASE_URL is not defined"

**Solution:** Make sure `.env` file exists with correct variables

### Issue: "Auth.users table not found"

**Solution:** Verify migrations are applied in Supabase SQL editor

### Issue: "RLS policy denies access"

**Solution:** Check policy conditions match your use case

### Issue: "CORS error"

**Solution:** Verify Supabase project URL matches in environment variables

### Issue: Build fails

**Solution:**
```bash
npm install
npm run build
```

### Issue: Dependencies conflicting

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Performance Tips

1. **Use Production Build**: Always test with `npm run build && npm run preview`
2. **Optimize Images**: Use Pexels or Unsplash for images
3. **Lazy Load Routes**: Implement in future
4. **Monitor Bundle**: Check Vite build output
5. **Use CDN**: Deploy to edge locations
6. **Database Indexes**: Already configured in migrations

## Support Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

## Next Steps

1. **Implement Real Features:**
   - Connect job listing to database
   - Build proposal system
   - Integrate payments

2. **Add Advanced Features:**
   - Real-time chat
   - Video calls
   - AI job matching

3. **Optimize:**
   - Add error tracking
   - Implement caching
   - Performance monitoring

4. **Scale:**
   - Add admin dashboard
   - Implement analytics
   - Plan for growth

## Contact

For questions or support, contact: support@xlance.com
