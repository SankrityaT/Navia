# NAVIA - FRONTEND IMPLEMENTATION GUIDE

## Overview
Navia is an AI executive function coach for post-college neurodivergent young adults. This skeleton provides the foundation - you'll implement the full functionality.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Auth**: Clerk
- **Icons**: Lucide React
- **TypeScript**: Strict mode enabled

## Project Structure
```
app/
├── page.tsx                    # Landing page (DONE)
├── onboarding/page.tsx         # Onboarding flow (DONE)
├── dashboard/page.tsx          # Main dashboard (DONE)
├── tasks/page.tsx              # Task visualizer (DONE)
├── sign-in/[[...sign-in]]/     # Clerk sign-in (DONE)
└── sign-up/[[...sign-up]]/     # Clerk sign-up (DONE)

components/
├── landing/                    # Landing page sections (DONE)
├── auth/                       # Onboarding steps (DONE)
├── dashboard/                  # Dashboard components (DONE)
└── tasks/                      # Task visualizer views (DONE)
```

## Key Tasks to Implement

### 1. Landing Page (components/landing/)
**Status**: Skeleton complete, needs polish
- [ ] Add scroll animations (use framer-motion or AOS)
- [ ] Replace placeholder dashboard screenshot with real one
- [ ] Add interactive graph for support cliff visualization
- [ ] Optimize images and add proper alt text
- [ ] Make responsive for mobile

### 2. Onboarding Flow (app/onboarding/)
**Status**: Basic flow complete
- [ ] Add form validation (use react-hook-form + zod)
- [ ] Check if user already onboarded (fetch from Clerk metadata)
- [ ] Add loading states during API calls
- [ ] Add error handling and user feedback
- [ ] Make progress indicator more visual
- [ ] Add skip option for optional steps

### 3. Dashboard (app/dashboard/)
**Status**: Layout complete, needs data integration
- [ ] Fetch real tasks from `/api/tasks` endpoint
- [ ] Implement energy level save on slider change
- [ ] Add "Ask Navia" chat modal (integrate with OpenAI)
- [ ] Implement task completion toggle (call PATCH endpoint)
- [ ] Add loading skeletons while fetching data
- [ ] Add empty states with helpful CTAs
- [ ] Make responsive for mobile

### 4. Task Visualizer (app/tasks/)
**Status**: Views complete, needs interactivity
- [ ] Implement drag-and-drop for Kanban (use @dnd-kit/core)
- [ ] Update task status on drop (call PATCH endpoint)
- [ ] Implement sorting and filtering in List view
- [ ] Add task creation modal/form
- [ ] Add task edit functionality
- [ ] Add task deletion with confirmation
- [ ] Fetch real tasks from API
- [ ] Add search functionality
- [ ] Make responsive for mobile

### 5. General UI/UX Improvements
- [ ] Add global loading indicator
- [ ] Implement toast notifications (use sonner or react-hot-toast)
- [ ] Add keyboard shortcuts for power users
- [ ] Implement dark mode toggle
- [ ] Add accessibility features (ARIA labels, focus management)
- [ ] Add animations and transitions
- [ ] Create reusable UI components (Button, Card, Modal, etc.)

## Important Notes

### Clerk Integration
- User authentication is handled by Clerk
- After sign-up, users are redirected to `/onboarding`
- User metadata is stored in Clerk's `publicMetadata`
- Get current user: `const user = await currentUser()`

### API Endpoints to Use
- `POST /api/onboarding` - Save onboarding data
- `POST /api/dashboard/energy` - Save energy level
- `GET /api/tasks` - Fetch tasks (with query params for filters)
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks` - Update task status
- `DELETE /api/tasks?task_id=xxx` - Delete task

### Component Patterns
- Use `'use client'` for interactive components
- Server components for data fetching
- Keep components small and focused
- Extract reusable logic into custom hooks

### Styling Guidelines
- Use Tailwind utility classes
- Follow existing color scheme (blue-600, purple-600, green-600)
- Maintain consistent spacing (p-4, p-6, p-8)
- Use rounded-lg for cards, rounded-full for buttons
- Add hover states for interactive elements

## Quick Start
```bash
# Install dependencies (already done)
npm install

# Set up environment variables
# Copy .env.local and add your Clerk keys

# Run development server
npm run dev

# Open http://localhost:3000
```

## Testing Checklist
- [ ] Landing page loads and CTAs work
- [ ] Sign-up flow redirects to onboarding
- [ ] Onboarding saves data and redirects to dashboard
- [ ] Dashboard displays user name and tasks
- [ ] Energy slider updates
- [ ] Task visualizer switches between views
- [ ] Tasks can be filtered and sorted
- [ ] Mobile responsive on all pages
- [ ] No console errors

## Need Help?
- Check Next.js docs: https://nextjs.org/docs
- Clerk docs: https://clerk.com/docs
- Tailwind docs: https://tailwindcss.com/docs
