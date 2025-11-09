# NAVIA - TASK DIVISION FOR HACKATHON

Clear division of work between frontend and backend teams.

## 🎨 FRONTEND TEAM TASKS

### Priority 1: Core Functionality
- [ ] **Landing Page Polish** (2-3 hours)
  - Add scroll animations
  - Replace placeholder screenshot
  - Make fully responsive
  - Test all CTAs

- [ ] **Onboarding Flow** (3-4 hours)
  - Add form validation (react-hook-form + zod)
  - Check if user already onboarded
  - Add loading states
  - Error handling
  - Test complete flow

- [ ] **Dashboard Integration** (4-5 hours)
  - Fetch tasks from `/api/tasks`
  - Implement energy level save
  - Add loading skeletons
  - Handle empty states
  - Make responsive

- [ ] **Task Visualizer** (5-6 hours)
  - Implement drag & drop (use @dnd-kit/core)
  - Connect to API endpoints
  - Add task creation modal
  - Add task edit/delete
  - Implement filters & sorting
  - Make responsive

### Priority 2: UX Enhancements
- [ ] **Chat Modal** (3-4 hours)
  - "Ask Navia" button functionality
  - Chat interface
  - Connect to OpenAI streaming
  - Message history

- [ ] **Notifications** (1-2 hours)
  - Toast notifications (use sonner)
  - Success/error feedback
  - Loading indicators

- [ ] **Animations** (2-3 hours)
  - Page transitions
  - Component animations
  - Micro-interactions

### Priority 3: Polish
- [ ] Mobile optimization
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Dark mode (optional)
- [ ] Performance optimization

### Frontend File Ownership
```
components/          # All components
app/page.tsx        # Landing page
app/onboarding/     # Onboarding pages
app/dashboard/      # Dashboard pages
app/tasks/          # Task visualizer pages
```

---

## ⚙️ BACKEND TEAM TASKS

### Priority 1: Core Infrastructure
- [ ] **Pinecone Setup** (1-2 hours)
  - Create index with correct dimensions
  - Configure metadata fields
  - Test connection

- [ ] **Complete Pinecone Operations** (3-4 hours)
  - Implement `updateTaskStatus` properly
  - Add batch operations
  - Add error handling & retries
  - Test all CRUD operations

- [ ] **API Route Completion** (4-5 hours)
  - Add input validation (zod schemas)
  - Implement proper error responses
  - Add pagination for tasks
  - Test all endpoints
  - Add request logging

### Priority 2: AI Integration
- [ ] **OpenAI Function Calling** (3-4 hours)
  - Define task breakdown functions
  - Implement function calling
  - Test with different prompts

- [ ] **Chat Endpoint** (3-4 hours)
  - Create `/api/chat` route
  - Implement streaming responses
  - Store conversation history in Pinecone
  - Context injection (user profile + tasks)

- [ ] **AI Personas** (2-3 hours)
  - Career coach persona
  - Finance advisor persona
  - Daily life helper persona
  - Social coach persona

### Priority 3: Advanced Features
- [ ] **Task Dependencies** (2-3 hours)
  - Parent-child task relationships
  - Dependency checking
  - Auto-suggest next tasks

- [ ] **Smart Recommendations** (3-4 hours)
  - Analyze user patterns
  - Suggest tasks based on energy level
  - Time-of-day optimization

- [ ] **Progress Analytics** (2-3 hours)
  - Calculate completion rates
  - Track time estimates vs actual
  - Generate insights

### Backend File Ownership
```
app/api/            # All API routes
lib/pinecone/       # Vector DB operations
lib/openai/         # AI client & functions
lib/types.ts        # Shared types
```

---

## 🤝 SHARED RESPONSIBILITIES

### Types & Interfaces
- **File**: `lib/types.ts`
- **Owner**: Backend defines, Frontend uses
- **Rule**: Backend team updates types, Frontend team reviews

### API Contract
- **Documentation**: Backend documents endpoints
- **Testing**: Both teams test integration
- **Changes**: Communicate before breaking changes

### Environment Variables
- **Setup**: Both teams need all keys for testing
- **Security**: Never commit `.env.local`

---

## 📋 SUGGESTED WORKFLOW

### Day 1: Setup & Core
**Frontend**:
1. Set up environment
2. Polish landing page
3. Complete onboarding validation
4. Start dashboard integration

**Backend**:
1. Set up Pinecone index
2. Complete CRUD operations
3. Test all API endpoints
4. Start OpenAI integration

### Day 2: Integration & Features
**Frontend**:
1. Connect dashboard to API
2. Implement task visualizer
3. Add drag & drop
4. Start chat modal

**Backend**:
1. Implement function calling
2. Create chat endpoint
3. Add AI personas
4. Implement recommendations

### Day 3: Polish & Testing
**Frontend**:
1. Mobile responsiveness
2. Animations & transitions
3. Error handling
4. User testing

**Backend**:
1. Performance optimization
2. Error handling
3. Rate limiting
4. Integration testing

---

## 🚨 CRITICAL DEPENDENCIES

### Frontend depends on Backend:
- API endpoints must be working
- Response formats must match types
- Error codes must be documented

### Backend depends on Frontend:
- Request formats must match API expectations
- User flows determine data requirements

### Communication Points:
1. **Daily standup**: Share progress & blockers
2. **API changes**: Notify immediately
3. **Type updates**: Commit & notify
4. **Testing**: Test together before demo

---

## 📊 PROGRESS TRACKING

### Frontend Checklist
- [ ] Landing page complete
- [ ] Onboarding flow working
- [ ] Dashboard displays data
- [ ] Task visualizer functional
- [ ] Chat modal working
- [ ] Mobile responsive
- [ ] No console errors

### Backend Checklist
- [ ] Pinecone index configured
- [ ] All CRUD endpoints working
- [ ] OpenAI integration complete
- [ ] Chat endpoint streaming
- [ ] Error handling implemented
- [ ] API documented
- [ ] Performance tested

---

## 🎯 DEMO REQUIREMENTS

### Must Have (MVP)
- ✅ User can sign up & onboard
- ✅ Dashboard shows personalized tasks
- ✅ Tasks can be viewed in Kanban/List
- ✅ Tasks can be created & completed
- ✅ AI chat responds to questions

### Nice to Have
- Drag & drop working
- Mobile fully responsive
- Animations smooth
- Task recommendations
- Progress analytics

### Demo Flow
1. Show landing page
2. Sign up new user
3. Complete onboarding
4. View dashboard
5. Create task
6. Use task visualizer
7. Chat with Navia
8. Show completed task

---

## 💡 TIPS FOR SUCCESS

### Frontend Team
- Use mock data initially, swap for API later
- Build components in isolation first
- Test on multiple screen sizes
- Keep components small & reusable
- Use TypeScript strictly

### Backend Team
- Test with Postman/Insomnia first
- Log everything during development
- Handle errors gracefully
- Document as you go
- Use environment variables

### Both Teams
- Commit often with clear messages
- Review each other's PRs
- Communicate blockers early
- Test integration frequently
- Have fun! 🚀
