# Navia iOS App

Native iOS application for Navia - AI executive function coach for neurodivergent young adults.

## 🎨 Design System

The iOS app perfectly matches the web app's design language:

### Colors
- **Clay Palette** (Terracotta): `clay50` - `clay900`
- **Sage & Earth**: `sage100` - `sage700`, `moss500` - `moss600`
- **Warm Neutrals**: `cream`, `sand`, `stone`, `charcoal`
- **Accent**: Clay-500 primary, Sage-500 secondary

### Typography
- **Primary Font**: System Rounded (matching DM Sans feel)
- **Display Font**: System Serif (matching Fraunces)
- Consistent font scales from Caption (11pt) to Display (40pt)

### Spacing
- Base unit: 4px
- Semantic spacing: `xxxs` (2) to `xxxl` (64)
- Corner radius: `xs` (4) to `full` (999)

## 📱 Features

### ✅ Implemented
- **Dashboard** - Bento grid layout with energy tracking, task overview, quick wins
- **Task Management** - Create, complete, filter, and manage tasks
- **Chat with Navia** - Streaming AI chat interface
- **Focus Mode** - Pomodoro timer (15/25/45/60 min sessions)
- **Profile** - User stats, goals, interests, settings

### 🎨 UI Components
- `NaviaButton` - Primary, secondary, outline, text styles
- `NaviaCard` - Bento grid card with consistent styling
- `NaviaAvatar` - Animated breathing avatar
- `ChatBubble` - Message bubbles for user/AI
- `EnergySlider` - 1-10 energy level tracking
- `TaskCard` - Task display with status, category, priority

### 📊 Data Models
- `UserProfile` - User info, neurotypes, goals, energy/support levels
- `Task` - Tasks with status, priority, category, breakdown
- `ChatMessage` - Chat history with session management
- `PeerConnection` - Peer matching and messaging

### 🌐 API Integration
- `APIClient` - Generic HTTP client with auth
- `TaskService` - Task CRUD operations
- `ChatService` - Streaming chat responses
- `UserService` - Profile and state management

## 🏗️ Architecture

```
navia-app/
├── Theme/
│   ├── Colors.swift          # Color palette matching web
│   ├── Typography.swift       # Font system
│   └── Spacing.swift          # Layout constants
├── Models/
│   ├── User.swift             # UserProfile model
│   ├── Task.swift             # Task model + enums
│   ├── ChatMessage.swift      # Chat models
│   └── PeerConnection.swift   # Peer models
├── Services/
│   ├── APIClient.swift        # HTTP client
│   ├── TaskService.swift      # Task API
│   ├── ChatService.swift      # Chat API
│   └── UserService.swift      # User API
├── Components/
│   ├── NaviaButton.swift
│   ├── NaviaCard.swift
│   ├── NaviaAvatar.swift
│   ├── ChatBubble.swift
│   └── EnergySlider.swift
├── Views/
│   ├── MainTabView.swift      # Tab navigation
│   ├── DashboardView.swift    # Main dashboard
│   ├── TasksView.swift        # Task management
│   ├── ChatView.swift         # AI chat
│   ├── FocusView.swift        # Pomodoro timer
│   └── ProfileView.swift      # User profile
├── Assets.xcassets/           # Images & colors
├── Info.plist                 # App configuration
├── navia_appApp.swift         # App entry point
└── ContentView.swift          # (Legacy, unused)
```

## 🚀 Getting Started

### Prerequisites
- Xcode 15.0+
- iOS 17.0+
- Swift 5.9+

### Environment Variables
Create a `.env` file or set in Xcode scheme:
```
API_BASE_URL=https://navia.app
```

### Build & Run
1. Open `navia-app.xcodeproj` in Xcode
2. Select target device/simulator
3. Press ⌘R to build and run

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core UI matching web app
- ✅ Dashboard with bento grid
- ✅ Task management
- ✅ Chat interface
- ✅ Focus mode
- ✅ Profile view

### Phase 2 (Next)
- [ ] Authentication (Clerk SDK)
- [ ] Onboarding flow
- [ ] Peer matching
- [ ] Push notifications
- [ ] Voice input (Speech Recognition)
- [ ] TTS output (AVSpeechSynthesizer)

### Phase 3 (Future)
- [ ] Offline mode with CoreData
- [ ] Widgets (Tasks, Focus Timer)
- [ ] Apple Watch companion
- [ ] Spotlight integration
- [ ] Siri shortcuts
- [ ] HealthKit integration (sleep, activity)

## 📦 Dependencies

Currently using **zero external dependencies** - pure SwiftUI!

Future additions:
- Clerk SDK for auth
- Supabase Swift client (optional)

## 🎨 Design Principles

1. **Consistency** - Match web app exactly (colors, fonts, spacing)
2. **Accessibility** - VoiceOver support, dynamic type, high contrast
3. **Performance** - Smooth 60fps animations, lazy loading
4. **Native Feel** - iOS patterns (swipe actions, haptics, gestures)

## 🧪 Testing

```bash
# Run unit tests
xcodebuild test -scheme navia-app -destination 'platform=iOS Simulator,name=iPhone 15'

# Run UI tests
xcodebuild test -scheme navia-app-UITests
```

## 📝 Notes

- All colors are defined in `Theme/Colors.swift` using hex values from web app
- Typography uses SF Pro rounded/serif to approximate DM Sans/Fraunces
- API calls use native `URLSession` with async/await
- Chat uses `bytes.lines` for Server-Sent Events streaming

## 🤝 Contributing

1. Match web app design exactly
2. Use existing components where possible
3. Follow Swift API design guidelines
4. Add previews to all views/components

## 📄 License

Proprietary - Navia 2025
