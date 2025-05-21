# PromptP: AI Prompt Enhancement Tool

## Overview

PromptP is a web application that enhances user prompts for different roles (writers, designers, developers, marketers). It helps users create more effective prompts by adding context, structure, and detail. The application has a tiered pricing model (free, pro) with daily usage limits for free users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **React Application**: Built with Vite for faster development
- **UI Framework**: Uses ShadCN UI components (based on Radix UI primitives)
- **Styling**: TailwindCSS with a custom theme system (light/dark mode)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query for server state management
- **Authentication**: Clerk for user authentication

### Backend
- **Server**: Express.js server with API routes
- **Database**: PostgreSQL with Drizzle ORM for type-safe database access
- **Schema**: Defined in shared/schema.ts using Drizzle and Zod for validation

### Data Flow
1. Users can sign up/login via Clerk authentication
2. Users submit prompts in the workspace
3. The system enhances prompts based on user's role
4. Enhanced prompts are stored in the database
5. Users can view prompt history and usage stats

## Key Components

### Frontend Components
1. **Pages**:
   - Home/Landing page
   - Dashboard (user stats and metrics)
   - Workspace (where prompts are enhanced)
   - Onboarding (role selection)

2. **UI Components**:
   - Comprehensive UI components from ShadCN
   - Theme toggle for light/dark mode
   - Toast notifications

3. **Authentication**:
   - ClerkProviderWithRoutes for authentication flow
   - User role selection during onboarding

### Backend Components
1. **API Routes**:
   - User management (with Clerk integration)
   - Prompt enhancement and storage
   - Usage statistics

2. **AI Engine**:
   - Local prompt enhancement engine
   - Role-specific enhancement templates

3. **Database Schema**:
   - Users table (id, username, clerkId, role, plan, usage metrics)
   - Prompts table (original and enhanced prompts, user reference)

## Data Models

### User
- `id`: Primary key
- `username`: User's username (unique)
- `password`: Password (not used with Clerk)
- `clerkId`: External Clerk user ID
- `role`: Writer, designer, developer, or marketer
- `plan`: Free or pro
- `promptsUsedToday`: Daily usage count
- `lastPromptDate`: Timestamp of last prompt
- `createdAt`: User creation timestamp

### Prompt
- `id`: Primary key
- `userId`: Reference to users table
- `originalPrompt`: The user's original prompt
- `enhancedPrompt`: The AI-enhanced prompt
- `role`: Role-specific enhancement type
- `createdAt`: Prompt creation timestamp

## External Dependencies

1. **Authentication**: Clerk for user management
2. **Database**: PostgreSQL (via Drizzle ORM)
3. **UI Components**: Radix UI primitives via ShadCN
4. **Form Handling**: React Hook Form with Zod for validation
5. **Data Fetching**: TanStack React Query

## Deployment Strategy

The application is configured for deployment on Replit with:
- `npm run dev` for development
- `npm run build` for production builds
- `npm run start` for production runtime

The deployment uses the following workflow:
1. Build the client with Vite
2. Bundle the server with esbuild
3. Serve static assets and API endpoints from a single Express server

## Development Workflow

1. Start the development server with `npm run dev`
2. Frontend code is in `client/src/`
3. Backend code is in `server/`
4. Shared code (like database schema) is in `shared/`
5. Database migrations can be applied with `npm run db:push`

## Architecture Decisions

1. **Monorepo Structure**: The application uses a monorepo structure with client, server, and shared code in a single repository, simplifying development and deployment.

2. **Drizzle ORM**: Chosen for type-safe database access with schema definitions that can be shared between frontend and backend.

3. **Local AI Engine**: The application includes a local prompt enhancement engine instead of relying on external APIs, reducing costs and latency.

4. **Clerk Authentication**: Provides a comprehensive auth solution while allowing custom role management through the application's database.

5. **ShadCN UI**: Offers high-quality, accessible UI components without the overhead of a full component library. Components are directly included in the codebase for customization.

## Known Limitations

1. The free tier has a daily limit of 10 prompts per user
2. The application currently only supports PostgreSQL for data storage
3. The local AI engine provides simpler enhancements compared to what a full AI API might offer