# 🚀 XLance - India's Freelancing Platform

<div align="center">


**Your Trusted Hub for Freelance in India**

[![CI/CD](https://github.com/Duraisingh-J/xlance/actions/workflows/test.yml/badge.svg)](https://github.com/Duraisingh-J/xlance/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Live Demo](#) • [Documentation](#features) • [Contributing](#contributing)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Firebase Authentication** | Secure email/password signup with onboarding flow |
| 💼 **Gig Marketplace** | Browse, create, and manage freelance gigs |
| 💬 **Real-time Messaging** | Built-in chat with push notifications |
| 💰 **UPI Payments** | India-focused secure payment system |
| 👤 **Dual Profiles** | Separate dashboards for freelancers and clients |
| 🔔 **Push Notifications** | Stay updated on orders and messages |
| 📱 **Fully Responsive** | Mobile-first design with Tailwind CSS |
| 🎨 **Modern UI** | Glassmorphism design with Framer Motion animations |

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, React Router 7, Framer Motion |
| **Styling** | Tailwind CSS 3, Custom glassmorphism theme |
| **Backend** | Firebase (Auth, Firestore, Storage, Messaging) |
| **Build** | Vite 5 |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **CI/CD** | GitHub Actions |

---

## 📁 Project Structure

```
xlance/
├── src/
│   ├── features/                 # Feature-based modules
│   │   ├── auth/                 # Authentication & onboarding
│   │   ├── dashboard/            # User dashboards & reports
│   │   ├── gigs/                 # Gig marketplace
│   │   ├── home/                 # Landing page sections
│   │   ├── messages/             # Real-time chat
│   │   ├── orders/               # Order management & checkout
│   │   └── profile/              # User profiles & settings
│   ├── shared/
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # React contexts
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # Firebase config
│   │   └── utils/                # Helpers & constants
│   ├── App.jsx                   # Main routing
│   └── main.jsx                  # Entry point
├── e2e/                          # Playwright E2E tests
├── firebase.json                 # Firebase hosting config
├── firestore.rules               # Security rules
└── .github/workflows/            # CI/CD pipelines
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/Duraisingh-J/xlance.git
cd xlance

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Firebase Emulators (Optional)

```bash
npm run emulators
```

Runs local emulators for Auth (9099), Firestore (8080), and Functions (5001).

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run emulators` | Start Firebase emulators |

---

## 🧪 Testing

### Unit Tests
```bash
npm run test          # Watch mode
npm run test -- --run # Single run
```

### E2E Tests
```bash
npm run test:e2e      # Headless
npm run test:e2e:ui   # Interactive UI
```

---

## 🔒 Firebase Security

Firestore security rules configured for:

- **Users** - Owner-based access control
- **Jobs/Gigs** - Public read, authenticated write
- **Proposals** - Freelancer-specific access
- **Conversations** - Participant-based messaging
- **Notifications** - User-specific access

---

## 🎨 Key Components

| Component | Description |
|-----------|-------------|
| `Navbar` | Responsive navigation with auth state |
| `Button` | Variants: primary, secondary, ghost, outline |
| `Card` | Glass effect cards with hover states |
| `Input` | Form inputs with validation |
| `LoadingScreen` | Animated loading states |
| `ProtectedRoute` | Auth-guarded routes |

---

## 🚀 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Vercel

```bash
npm i -g vercel
vercel
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---


</div>
