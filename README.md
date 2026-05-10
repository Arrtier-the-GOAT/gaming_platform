# Gaming Platform - Local Development Setup Guide

## Project Overview

**Gaming Platform** is a comprehensive multi-game hub built with modern web technologies. Players can compete in various games, earn rewards, climb leaderboards, and unlock premium features. The platform features real-time leaderboards, seasonal competitions, a shop system, and premium membership benefits.

### Key Features

- **20+ Games**: Including Candy Crush, Bubble Shooter, Wordle Clone, and more
- **Dual Leaderboards**: Game Points leaderboard and Referrer leaderboard
- **Seasonal System**: Weekly seasons with historical data archiving
- **Premium Membership**: Exclusive benefits and rewards
- **Shop System**: Purchase items with earned currency
- **User Profiles**: Track stats, achievements, and referral data
- **Dark Theme**: Modern gaming-focused dark UI with vibrant colors
- **Mobile Responsive**: Fully optimized for mobile and desktop

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + Tailwind CSS 4 + TypeScript |
| Backend | Express.js + tRPC |
| Database | MySQL/TiDB |
| Authentication | Manus OAuth |
| Real-time | WebSocket support |
| Deployment | Manus Platform |

---

## Local Development Setup

### Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v22.13.0 or higher
- **npm**: v10.0.0 or higher (package manager)
- **Git**: Latest version
- **MySQL/TiDB**: Local database instance (optional - can use remote)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd gaming_platform
```

### Step 2: Install Dependencies

```bash
# Install all dependencies using npm
npm install
```

### Step 3: Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/gaming_platform

# Authentication
JWT_SECRET=your-jwt-secret-key-here
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Owner Information
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id

# Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# App Configuration
VITE_APP_TITLE=Gaming Platform
VITE_APP_LOGO=https://your-logo-url.png
```

### Step 4: Database Setup

#### Option A: Using Local MySQL

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE gaming_platform;"

# Update DATABASE_URL in .env.local
DATABASE_URL=mysql://root:password@localhost:3306/gaming_platform
```

#### Option B: Using Remote Database

Update `DATABASE_URL` in `.env.local` with your remote database connection string.

### Step 5: Run Database Migrations

```bash
# Generate migration files (if schema changes)
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate
```

### Step 6: Start Development Server

```bash
# Start both frontend and backend dev servers
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

---

## Project Structure

```
gaming_platform/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── Games.tsx            # Games listing
│   │   │   ├── Leaderboard.tsx      # Leaderboards (seasonal)
│   │   │   ├── Premium.tsx          # Premium membership
│   │   │   ├── Shop.tsx             # Shop/marketplace
│   │   │   ├── Profile.tsx          # User profile
│   │   │   ├── AdminDashboard.tsx   # Admin panel
│   │   │   └── games/               # Individual game components
│   │   ├── components/              # Reusable UI components
│   │   ├── contexts/                # React contexts
│   │   ├── lib/                     # Utilities and helpers
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── public/                      # Static assets
│   └── package.json
├── server/                          # Express backend
│   ├── routers.ts                   # tRPC procedures
│   ├── db.ts                        # Database queries
│   ├── auth.logout.test.ts          # Test examples
│   └── _core/                       # Framework core
├── drizzle/                         # Database schema
│   ├── schema.ts                    # Table definitions
│   └── migrations/                  # Migration files
├── storage/                         # S3 storage helpers
├── shared/                          # Shared types and constants
├── package.json                     # Project dependencies
└── README.md                        # Project documentation
```

---

## Development Workflow

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npx vitest

# Run specific test file
npx vitest run server/auth.logout.test.ts
```

### Code Quality

```bash
# Type checking
npm run check

# Linting (if configured)
npx eslint .

# Format code
npm run format
```

### Building for Production

```bash
# Build frontend and backend
npm run build

# Preview production build
npx vite preview
```

---

## Database Schema

### Key Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts and profiles |
| `games` | Game definitions and metadata |
| `gameScores` | Player game scores and results |
| `leaderboardSeasons` | Season metadata |
| `seasonalGameLeaderboardSnapshots` | Historical game leaderboard data |
| `seasonalReferrerLeaderboardSnapshots` | Historical referrer leaderboard data |
| `shopItems` | Shop items and rewards |
| `userInventory` | User purchased items |
| `premiumPlans` | Premium subscription plans |
| `userPremium` | User premium subscriptions |

### Adding New Tables

1. **Define schema** in `drizzle/schema.ts`
2. **Generate migration**: `npx drizzle-kit generate`
3. **Review migration** SQL in `drizzle/migrations/`
4. **Apply migration**: `npx drizzle-kit migrate`

---

## API Routes

### tRPC Procedures

All API calls use tRPC. Access procedures via:

```typescript
import { trpc } from '@/lib/trpc';

// Query example
const { data } = trpc.games.getAll.useQuery();

// Mutation example
await trpc.games.createScore.useMutation({
  gameId: 1,
  score: 100,
});
```

### Main Routers

- **`games`**: Game management and scoring
- **`leaderboard`**: Leaderboard queries and rankings
- **`shop`**: Shop items and purchases
- **`premium`**: Premium membership management
- **`auth`**: Authentication and user profile
- **`admin`**: Admin operations

---

## Authentication

### Manus OAuth Flow

1. User clicks "Login" button
2. Redirected to Manus OAuth portal
3. User authenticates
4. Callback to `/api/oauth/callback`
5. Session cookie created
6. User logged in

### Protected Routes

Use `protectedProcedure` in backend:

```typescript
protectedProcedure
  .input(z.object({ gameId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    // ctx.user contains authenticated user
    return db.createScore(ctx.user.id, input.gameId);
  });
```

---

## Debugging

### Enable Debug Logging

```bash
# Enable debug output
DEBUG=* npm run dev
```

### Browser DevTools

- **React DevTools**: Inspect component hierarchy
- **Redux DevTools**: Monitor state changes
- **Network Tab**: Monitor API calls
- **Console**: View logs and errors

### Server Logs

Check server output in terminal for:
- Database connection status
- API request logs
- Error messages
- Performance metrics

---

## Common Issues & Solutions

### Issue: Database Connection Failed

**Solution**: Verify `DATABASE_URL` in `.env.local` and ensure database server is running.

```bash
# Test connection
mysql -u user -p -h localhost -e "SELECT 1;"
```

### Issue: Port Already in Use

**Solution**: Kill existing process or use different port.

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Use different port
PORT=3001 npm run dev
```

### Issue: Module Not Found

**Solution**: Reinstall dependencies.

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: OAuth Login Not Working

**Solution**: Verify OAuth credentials in `.env.local` and check callback URL configuration.

---

## Performance Optimization

### Frontend

- **Code Splitting**: Automatic via Vite
- **Image Optimization**: Use optimized image formats
- **Lazy Loading**: Lazy load components and routes
- **Caching**: Browser cache for static assets

### Backend

- **Database Indexing**: Indexed on frequently queried columns
- **Query Optimization**: Use efficient database queries
- **Caching**: Cache frequently accessed data
- **Connection Pooling**: Reuse database connections

---

## Deployment

### Deploy to Manus Platform

```bash
# Create checkpoint (if your environment provides this command)
npx webdev checkpoint "Your checkpoint message"

# Publish to production
# Use Manus Management UI → Publish button
```

### Environment Variables for Production

Update production environment variables in Manus Management UI:
- Database URL (production database)
- API keys and secrets
- OAuth configuration
- Analytics endpoints

---

## Contributing

### Code Standards

- **TypeScript**: Use strict mode
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **Testing**: Write tests for new features

### Commit Messages

```
feat: Add new feature description
fix: Fix bug description
docs: Update documentation
test: Add tests
refactor: Refactor code
```

---

## Support & Resources

### Documentation

- [Manus Platform Docs](https://docs.manus.im)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Docs](https://orm.drizzle.team)

### Getting Help

- Check existing issues and PRs
- Review error messages in console
- Enable debug logging
- Contact support team

---

## License

This project is proprietary software. Unauthorized copying or distribution is prohibited.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-09 | Initial release with games, leaderboards, and premium system |

---

**Last Updated**: May 9, 2026

For questions or issues, please contact the development team.
