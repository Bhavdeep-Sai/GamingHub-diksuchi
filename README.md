# GamingHub 🎮

A professional, production-ready brain training gaming platform built with Next.js, TypeScript, and MongoDB.

## Overview

GamingHub is a scalable web application that helps users improve their cognitive skills through competitive gaming. The platform tracks progress, provides detailed analytics, and features global leaderboards.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB
- **ORM**: Prisma with MongoDB connector
- **Authentication**: NextAuth.js
- **State Management**: 
  - React Query for server state
  - Zustand for client state
- **UI Components**: Custom design system
- **Icons**: Lucide React
- **Animations**: Framer Motion (subtle)

## Architecture

### Clean Architecture Principles

```
gaminghub/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── games/             # Game pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   └── providers/         # Context providers
├── games/                 # Game modules
│   └── tic-tac-toe/      # Game implementation
│       ├── engine.ts      # Game logic
│       └── TicTacToeGame.tsx  # Game UI
├── lib/                   # Utilities
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # Auth configuration
│   ├── utils.ts           # Helper functions
│   └── constants.ts       # App constants
├── services/              # Business logic
│   ├── user.service.ts    # User operations
│   ├── scoring.service.ts # Score calculation
│   ├── session.service.ts # Game sessions
│   └── leaderboard.service.ts # Rankings
├── types/                 # TypeScript types
└── prisma/                # Database schema
    ├── schema.prisma      # Prisma schema
    └── seed.ts            # Database seeding
```

## Features

### ✅ Implemented

- **Authentication System**
  - Email/password authentication
  - Session management with NextAuth
  - Protected routes

- **Game System**
  - Tic Tac Toe (fully playable)
  - AI opponent with difficulty levels
  - Score tracking
  - Session management

- **Design System**
  - Professional, clean UI
  - Responsive design
  - Accessible components
  - Consistent spacing and colors

- **Database Architecture**
  - Optimized MongoDB schema
  - Indexed queries
  - Scalable design

### 🚧 Ready to Implement

The foundation is built for:
- Additional games (Chess, Sudoku, etc.)
- Leaderboards with caching
- User profiles and stats
- Achievement system
- Brain power metrics
- Progress tracking

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or pnpm

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the following variables:

```env
# MongoDB Connection
DATABASE_URL="mongodb://localhost:27017/gaminghub"
# Or use MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/gaminghub"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-this-with: openssl rand -base64 32"

# Optional OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

3. **Generate Prisma Client**

```bash
npm run db:generate
```

4. **Seed the database**

```bash
npm run db:push
npm run db:seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Setup

### Local MongoDB

```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify connection
mongosh
```

### MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Get connection string
4. Update `DATABASE_URL` in `.env`

## Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed database

# Code Quality
npm run lint         # Run ESLint
```

## Design Philosophy

### Visual Style

- **Color Scheme**: Professional green (`emerald-600`) as primary
- **Typography**: Inter font family
- **Spacing**: Consistent 8px grid system
- **Borders**: Subtle, 1px solid borders
- **Shadows**: Minimal, only where necessary
- **Animations**: Subtle, <300ms transitions

### Inspiration

- Linear
- Notion
- GitHub
- Modern SaaS dashboards

### Rules

❌ **Avoid:**
- Emojis
- Gradients
- Neon colors
- Cartoonish elements
- Excessive animations

✅ **Use:**
- SVG icons only
- Flat, clean design
- Professional typography
- Subtle hover states
- Clear hierarchy

## Game Development

### Adding a New Game

1. **Create game module**

```typescript
// games/your-game/engine.ts
import { GameEngine } from '@/types';

export class YourGameEngine implements GameEngine {
  // Implement interface methods
}
```

2. **Create game UI**

```tsx
// games/your-game/YourGame.tsx
'use client';

export function YourGame() {
  // Game UI component
}
```

3. **Create page**

```tsx
// app/games/your-game/page.tsx
import { YourGame } from '@/games/your-game/YourGame';

export default function Page() {
  return <YourGame />;
}
```

4. **Update constants**

Add game metadata to `lib/constants.ts`

## Performance Optimizations

- **Code Splitting**: Lazy load game modules
- **Server Components**: Use RSC where possible
- **Image Optimization**: Next.js Image component
- **Database Indexing**: Indexed queries for leaderboards
- **Caching**: React Query for API responses
- **Connection Pooling**: Prisma connection management

## Security

- **Authentication**: Secure session management
- **Password Hashing**: bcrypt with salt rounds
- **SQL Injection**: Prisma ORM protection
- **XSS Protection**: React escaping
- **CSRF**: NextAuth CSRF tokens
- **Rate Limiting**: (To be implemented)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
# Dockerfile included in project
docker build -t gaminghub .
docker run -p 3000:3000 gaminghub
```

## Future Enhancements

- [ ] Implement remaining games
- [ ] Real-time multiplayer with WebSockets
- [ ] Mobile apps (React Native)
- [ ] Social features
- [ ] Tournaments and events
- [ ] Premium features
- [ ] Internationalization
- [ ] Dark mode

## License

MIT

---

**GamingHub** - Train Your Brain Through Competitive Gaming 🎯
