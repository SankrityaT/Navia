//
//  DashboardView.swift
//  navia-app
//
//  Complete dashboard matching web app - mobile optimized
//

import SwiftUI

struct DashboardView: View {
    @State private var energyLevel: Double = 6
    @State private var previousEnergyLevel: Double = 6
    @State private var supportLevel: Int = 3
    @State private var tasks: [Task] = []
    @State private var isLoadingTasks = true
    @State private var loadError: String?
    @State private var showingAddTask = false
    @State private var newTaskInput = ""
    @State private var isExtractingTasks = false
    @State private var extractionMessage = ""
    @State private var showNaviaModal = false
    @State private var naviaMessage = ""
    @State private var celebratingTask: String? = nil
    @State private var deletingTaskId: String? = nil
    @State private var completingTaskId: String? = nil

    var userName: String {
        "friend"
    }

    var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Good morning"
        case 12..<17: return "Good afternoon"
        case 17..<21: return "Good evening"
        default: return "Good night"
        }
    }

    var incompleteTasks: [Task] {
        tasks.filter { $0.status != .completed }
    }

    var energyFilteredTasks: [Task] {
        let active = incompleteTasks

        // Low energy (1-3): Show quick tasks only
        if energyLevel <= 3 {
            let quick = active.filter { ($0.timeEstimate ?? 30) <= 15 }
            return quick.isEmpty ? Array(active.prefix(3)) : quick
        }
        // Medium energy (4-6): Show medium tasks
        if energyLevel <= 6 {
            let medium = active.filter { ($0.timeEstimate ?? 60) <= 30 }
            return medium.isEmpty ? Array(active.prefix(5)) : medium
        }
        // High energy: Show all
        return active
    }

    var hiddenTaskCount: Int {
        incompleteTasks.count - energyFilteredTasks.count
    }

    var body: some View {
        ZStack {
            Color.naviaBackground.ignoresSafeArea()

            if isLoadingTasks {
                ProgressView("Loading your tasks...")
                    .font(.naviaBody)
                    .foregroundColor(.clay600)
            } else {
                mainContent
            }
        }
        .onAppear {
            loadData()
        }
    }

    private var mainContent: some View {
        ScrollView(showsIndicators: false) {
                VStack(spacing: Spacing.lg) {
                    // Greeting Header
                    VStack(spacing: Spacing.xs) {
                        Text("\(greeting), \(userName)! 💛")
                            .font(.naviaDisplayMedium)
                            .foregroundColor(.naviaForeground)

                        HStack(spacing: 4) {
                            Text("You've got this.")
                                .font(.naviaTitle3)
                                .foregroundColor(.clay600)
                                .fontWeight(.bold)
                            Text("One step at a time.")
                                .font(.naviaCallout)
                                .foregroundColor(.clay600)
                        }
                    }
                    .padding(.top, Spacing.md)

                    // Navia Avatar - Tappable
                    NaviaAvatar(size: 100, showPulse: true)
                        .onTapGesture {
                            showNaviaModal = true
                            naviaMessage = "Hey! I'm here to help. What's on your mind? 💛"
                        }
                        .overlay(
                            Text("😴")
                                .font(.system(size: 32))
                                .offset(x: 30, y: 30)
                        )

                    Text("Click me if you need help")
                        .font(.naviaFootnote)
                        .fontWeight(.semibold)
                        .foregroundColor(.naviaForeground)
                        .padding(.horizontal, Spacing.md)
                        .padding(.vertical, Spacing.sm)
                        .background(Color.sand)
                        .cornerRadius(CornerRadius.full)
                        .padding(.top, -Spacing.md)

                    // TASKS SECTION
                    TasksSection(
                        tasks: tasks,
                        energyFilteredTasks: energyFilteredTasks,
                        hiddenTaskCount: hiddenTaskCount,
                        completingTaskId: $completingTaskId,
                        deletingTaskId: $deletingTaskId,
                        newTaskInput: $newTaskInput,
                        isExtractingTasks: $isExtractingTasks,
                        extractionMessage: $extractionMessage,
                        onToggleTask: toggleTask,
                        onDeleteTask: deleteTask,
                        onBreakdownTask: breakdownTask,
                        onExtractTasks: extractTasks
                    )

                    // ENERGY SECTION
                    EnergySection(
                        energyLevel: $energyLevel,
                        previousEnergyLevel: $previousEnergyLevel,
                        onEnergyChangeEnd: handleEnergyChangeEnd
                    )

                    // BRAIN DUMP SECTION
                    BrainDumpSection(
                        onOpenNavia: {
                            showNaviaModal = true
                            naviaMessage = "What's on your mind? I'm listening 💛"
                        }
                    )

                    // FOCUS MODE SECTION
                    FocusModeSection(
                        onStartFocus: {
                            // Navigate to Focus tab
                        }
                    )
                }
                .padding(.horizontal, Spacing.screenPadding)
                .padding(.bottom, Spacing.xxxl)
            }

            // Navia Modal
            if showNaviaModal {
                NaviaModalView(
                    isPresented: $showNaviaModal,
                    message: naviaMessage
                )
            }
        }
        .navigationBarHidden(true)
    }

    // MARK: - Actions
    private func toggleTask(_ task: Task) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            completingTaskId = task.id

            let newStatus: TaskStatus = task.status == .completed ? .notStarted : .completed
            let oldStatus = task.status

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                tasks[index].status = newStatus
                completingTaskId = nil

                if newStatus == .completed {
                    celebratingTask = task.id
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        celebratingTask = nil
                    }
                }
            }

            _Concurrency.Task {
                do {
                    _ = try await TaskService.shared.updateTask(id: task.id, status: newStatus)
                } catch {
                    // Revert on error
                    await MainActor.run {
                        if let revertIndex = tasks.firstIndex(where: { $0.id == task.id }) {
                            tasks[revertIndex].status = oldStatus
                        }
                        naviaMessage = "Oops, couldn't update that task. Try again? 💛"
                        showNaviaModal = true

                        if Environment.isDebug {
                            print("❌ Failed to update task: \(error)")
                        }
                    }
                }
            }
        }
    }

    private func deleteTask(_ taskId: String) {
        deletingTaskId = taskId
        let taskToDelete = tasks.first { $0.id == taskId }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            tasks.removeAll { $0.id == taskId }
            deletingTaskId = nil

            // Delete from backend
            _Concurrency.Task {
                do {
                    try await TaskService.shared.deleteTask(id: taskId)
                } catch {
                    // Restore on error
                    await MainActor.run {
                        if let restoredTask = taskToDelete {
                            tasks.append(restoredTask)
                        }
                        naviaMessage = "Couldn't delete that task. Try again? 💛"
                        showNaviaModal = true

                        if Environment.isDebug {
                            print("❌ Failed to delete task: \(error)")
                        }
                    }
                }
            }
        }
    }

    private func breakdownTask(_ taskId: String) {
        guard let task = tasks.first(where: { $0.id == taskId }) else { return }
        showNaviaModal = true
        naviaMessage = "Let me break down \"\(task.title)\" for you..."
    }

    private func extractTasks() {
        guard !newTaskInput.isEmpty else { return }

        isExtractingTasks = true
        extractionMessage = "Extracting tasks with AI..."

        _Concurrency.Task {
            do {
                // Call real task extraction API
                let response: ExtractTasksResponse = try await APIClient.shared.request(
                    "/api/features/extract-tasks",
                    method: .post,
                    body: ["text": newTaskInput]
                )

                await MainActor.run {
                    // Add extracted tasks to the list
                    for extractedTask in response.tasks {
                        let newTask = Task(
                            id: UUID().uuidString,
                            userId: "current_user",
                            title: extractedTask.title,
                            status: .notStarted,
                            priority: extractedTask.priority ?? .medium,
                            timeEstimate: extractedTask.timeEstimate,
                            category: extractedTask.category ?? .dailyLife,
                            description: extractedTask.reasoning,
                            createdAt: Date(),
                            createdBy: "current_user"
                        )

                        // Save to backend
                        _Concurrency.Task {
                            do {
                                let saved = try await TaskService.shared.createTask(
                                    title: newTask.title,
                                    category: newTask.category,
                                    priority: newTask.priority
                                )
                                // Update with server-generated ID
                                await MainActor.run {
                                    if let idx = tasks.firstIndex(where: { $0.id == newTask.id }) {
                                        tasks[idx] = saved
                                    }
                                }
                            } catch {
                                print("Failed to save task to backend: \(error)")
                            }
                        }

                        tasks.insert(newTask, at: 0)
                    }

                    extractionMessage = "Added \(response.tasks.count) task(s)! 💛"
                    newTaskInput = ""
                    isExtractingTasks = false

                    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                        extractionMessage = ""
                    }
                }
            } catch {
                await MainActor.run {
                    extractionMessage = "Oops, try again? 💛"
                    isExtractingTasks = false

                    if Environment.isDebug {
                        print("❌ Task extraction failed: \(error)")
                    }
                }
            }
        }
    }

    private func handleEnergyChangeEnd(_ finalLevel: Double) {
        // Proactive check-in when energy drops to ≤4
        if finalLevel <= 4 && previousEnergyLevel > 4 {
            let message = getEnergyMessage(Int(finalLevel))
            showNaviaModal = true
            naviaMessage = message
        }
        previousEnergyLevel = finalLevel

        // Save energy level
        saveUserState()
    }

    // MARK: - API Integration
    private func loadData() {
        _Concurrency.Task {
            do {
                // Load user state
                await loadUserState()

                // Load tasks
                isLoadingTasks = true
                let fetchedTasks = try await TaskService.shared.fetchTasks(status: nil)
                await MainActor.run {
                    tasks = fetchedTasks
                    isLoadingTasks = false
                    loadError = nil
                }
            } catch {
                await MainActor.run {
                    // Fall back to mock data on error (for dev/testing)
                    if Environment.isDebug {
                        tasks = Task.mockList
                        print("⚠️ Failed to load tasks, using mock data: \(error)")
                    } else {
                        loadError = "Couldn't load tasks. Please try again."
                    }
                    isLoadingTasks = false
                }
            }
        }
    }

    private func loadUserState() async {
        // TODO: Implement user state API when backend endpoint is ready
        // For now, use local storage
        await MainActor.run {
            energyLevel = UserDefaults.standard.double(forKey: "energyLevel")
            if energyLevel == 0 { energyLevel = 6 } // Default
            previousEnergyLevel = energyLevel
        }
    }

    private func saveUserState() {
        // Save locally
        UserDefaults.standard.set(energyLevel, forKey: "energyLevel")

        // TODO: Sync to backend via /api/user-state
        _Concurrency.Task {
            // Will implement when auth is ready
        }
    }

    private func getEnergyMessage(_ level: Int) -> String {
        switch level {
        case 1:
            return "I see your energy is really low right now (1/10). That's completely valid - some days are just like that, especially with ADHD/Autism. Your brain is working hard even when it doesn't feel like it. Want to talk about what's draining you, or should we find something super gentle to do? No pressure at all 💛"
        case 2:
            return "Your energy is quite low (2/10). I know this can feel really overwhelming, especially when executive function feels impossible. You're not broken - your brain just needs different support right now. What would feel most helpful? We can just sit here together if that's what you need 💛"
        case 3:
            return "I noticed your energy is low (3/10). That's totally okay - energy fluctuations are real, especially for neurodivergent brains. Sometimes the best thing we can do is honor where we're at. Want to talk about it, or should I help you find something gentle that won't drain you more? 💛"
        case 4:
            return "Your energy is on the lower side (4/10). That's completely normal - everyone has days like this, and it's especially common with ADHD/Autism. How are you feeling? I'm here to support you however you need right now 💛"
        default:
            return "I noticed your energy is at \(level)/10. How are you feeling?"
        }
    }
}

// MARK: - Tasks Section
struct TasksSection: View {
    let tasks: [Task]
    let energyFilteredTasks: [Task]
    let hiddenTaskCount: Int
    @Binding var completingTaskId: String?
    @Binding var deletingTaskId: String?
    @Binding var newTaskInput: String
    @Binding var isExtractingTasks: Bool
    @Binding var extractionMessage: String
    let onToggleTask: (Task) -> Void
    let onDeleteTask: (String) -> Void
    let onBreakdownTask: (String) -> Void
    let onExtractTasks: () -> Void

    var body: some View {
        NaviaCard {
            VStack(alignment: .leading, spacing: Spacing.md) {
                // Header
                HStack {
                    HStack(spacing: Spacing.sm) {
                        Image(systemName: "target")
                            .font(.system(size: 20))
                            .foregroundColor(.naviaAccent)
                        Text("Your Tasks")
                            .font(.naviaTitle2)
                            .foregroundColor(.naviaForeground)
                    }

                    Spacer()

                    HStack(spacing: Spacing.xs) {
                        Text("\(energyFilteredTasks.count) active")
                            .font(.naviaCaption)
                            .fontWeight(.semibold)
                            .foregroundColor(.sage700)
                            .padding(.horizontal, Spacing.sm)
                            .padding(.vertical, 4)
                            .background(Color.sage100)
                            .cornerRadius(CornerRadius.full)

                        if hiddenTaskCount > 0 {
                            Text("\(hiddenTaskCount) hidden")
                                .font(.naviaCaption)
                                .fontWeight(.semibold)
                                .foregroundColor(.clay700)
                                .padding(.horizontal, Spacing.sm)
                                .padding(.vertical, 4)
                                .background(Color.clay100)
                                .cornerRadius(CornerRadius.full)
                        }
                    }
                }

                // Task List
                if tasks.isEmpty {
                    VStack(spacing: Spacing.md) {
                        Image(systemName: "checkmark.circle")
                            .font(.system(size: 48))
                            .foregroundColor(.sage500)

                        Text("No tasks yet")
                            .font(.naviaHeadline)
                            .foregroundColor(.naviaForeground)

                        Text("Start your day by adding your first task below. I'll help you break it down if it feels overwhelming! 💛")
                            .font(.naviaCallout)
                            .foregroundColor(.naviaMuted)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Spacing.xl)
                } else {
                    VStack(spacing: Spacing.sm) {
                        ForEach(tasks.sorted(by: { ($0.status == .completed) && !($1.status == .completed) ? false : true })) { task in
                            TaskRowView(
                                task: task,
                                isCompleting: completingTaskId == task.id,
                                isDeleting: deletingTaskId == task.id,
                                onToggle: { onToggleTask(task) },
                                onDelete: { onDeleteTask(task.id) },
                                onBreakdown: { onBreakdownTask(task.id) }
                            )
                        }
                    }
                }

                // AI Task Input
                VStack(spacing: Spacing.xs) {
                    HStack(spacing: Spacing.sm) {
                        TextField("Brain dump all your tasks here... I'll organize them! 💛", text: $newTaskInput)
                            .font(.naviaBody)
                            .padding(Spacing.md)
                            .background(Color.cream)
                            .cornerRadius(CornerRadius.lg)
                            .overlay(
                                RoundedRectangle(cornerRadius: CornerRadius.lg)
                                    .stroke(Color.clay200, lineWidth: 2)
                            )
                            .disabled(isExtractingTasks)

                        Button(action: onExtractTasks) {
                            if isExtractingTasks {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .cream))
                            } else {
                                Image(systemName: "plus")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(.cream)
                            }
                        }
                        .frame(width: 50, height: 50)
                        .background(
                            LinearGradient(
                                gradient: Gradient(colors: [.naviaAccent, .clay600]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .cornerRadius(CornerRadius.lg)
                        .disabled(isExtractingTasks || newTaskInput.isEmpty)
                    }

                    if !extractionMessage.isEmpty {
                        Text(extractionMessage)
                            .font(.naviaCaption)
                            .foregroundColor(.sage700)
                            .padding(.horizontal, Spacing.sm)
                            .padding(.vertical, Spacing.xs)
                            .background(Color.sage100)
                            .cornerRadius(CornerRadius.md)
                    }

                    Text("✨ Type multiple tasks at once - I'll extract them automatically!")
                        .font(.system(size: 10))
                        .foregroundColor(.clay600)
                        .multilineTextAlignment(.center)
                }
            }
        }
    }
}

// MARK: - Task Row
struct TaskRowView: View {
    let task: Task
    let isCompleting: Bool
    let isDeleting: Bool
    let onToggle: () -> Void
    let onDelete: () -> Void
    let onBreakdown: () -> Void

    var body: some View {
        HStack(spacing: Spacing.md) {
            // Checkbox
            Button(action: onToggle) {
                Image(systemName: task.status == .completed ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 20))
                    .foregroundColor(task.status == .completed ? .sage600 : .clay400)
            }
            .buttonStyle(PlainButtonStyle())

            // Title
            VStack(alignment: .leading, spacing: 2) {
                Text(task.title)
                    .font(.naviaCallout)
                    .foregroundColor(task.status == .completed ? .charcoal.opacity(0.5) : .naviaForeground)
                    .strikethrough(task.status == .completed)
            }

            Spacer()

            // Actions
            HStack(spacing: Spacing.xs) {
                Button(action: onBreakdown) {
                    HStack(spacing: 4) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 12))
                        Text("Break down")
                            .font(.system(size: 11, weight: .medium))
                    }
                    .foregroundColor(.clay600)
                    .padding(.horizontal, Spacing.sm)
                    .padding(.vertical, 4)
                    .background(Color.clay100)
                    .cornerRadius(CornerRadius.sm)
                }
                .buttonStyle(PlainButtonStyle())

                Button(action: onDelete) {
                    Image(systemName: "trash")
                        .font(.system(size: 14))
                        .foregroundColor(.red)
                }
                .buttonStyle(PlainButtonStyle())
            }
        }
        .padding(Spacing.md)
        .background(task.status == .completed ? Color.stone.opacity(0.5) : Color.cream)
        .cornerRadius(CornerRadius.lg)
        .opacity(isDeleting ? 0 : 1)
        .offset(x: isDeleting ? -100 : 0)
        .animation(.easeOut(duration: 0.3), value: isDeleting)
        .overlay(
            isCompleting ?
                LinearGradient(
                    gradient: Gradient(colors: [.clear, .sage300.opacity(0.3), .clear]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .offset(x: -200)
                .animation(.linear(duration: 0.6).repeatCount(1), value: isCompleting)
            : nil
        )
    }
}

// MARK: - Energy Section
struct EnergySection: View {
    @Binding var energyLevel: Double
    @Binding var previousEnergyLevel: Double
    let onEnergyChangeEnd: (Double) -> Void

    var energyLabel: String {
        switch Int(energyLevel) {
        case 1...3: return "Low energy - that's okay 💛"
        case 4...6: return "Moderate energy"
        default: return "Good energy! 🌟"
        }
    }

    var body: some View {
        NaviaCard {
            VStack(spacing: Spacing.lg) {
                HStack(spacing: Spacing.sm) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 20))
                        .foregroundColor(.sage600)
                    Text("How are you feeling?")
                        .font(.naviaTitle2)
                        .foregroundColor(.naviaForeground)
                }

                VStack(spacing: Spacing.md) {
                    Text("\(Int(energyLevel))/10")
                        .font(.system(size: 56, weight: .bold, design: .rounded))
                        .foregroundColor(.naviaForeground)

                    Text(energyLabel)
                        .font(.naviaCallout)
                        .fontWeight(.semibold)
                        .foregroundColor(.clay700)

                    Slider(value: $energyLevel, in: 1...10, step: 1)
                        .accentColor(.naviaAccent)
                        .onChange(of: energyLevel) { oldValue, newValue in
                            if oldValue != newValue {
                                onEnergyChangeEnd(newValue)
                            }
                        }

                    HStack {
                        Text("Drained")
                            .font(.naviaCaption)
                            .foregroundColor(.clay600)
                        Spacer()
                        Text("Okay")
                            .font(.naviaCaption)
                            .foregroundColor(.clay600)
                        Spacer()
                        Text("Energized")
                            .font(.naviaCaption)
                            .foregroundColor(.clay600)
                    }
                }

                // Context box
                VStack(spacing: Spacing.xs) {
                    Text("Tell me how you're feeling")
                        .font(.naviaCallout)
                        .fontWeight(.bold)
                        .foregroundColor(.sage800)
                    Text("I'll adjust to meet you where you are")
                        .font(.naviaCaption)
                        .foregroundColor(.sage700)
                }
                .padding(Spacing.md)
                .frame(maxWidth: .infinity)
                .background(Color.sage100)
                .cornerRadius(CornerRadius.lg)
                .overlay(
                    RoundedRectangle(cornerRadius: CornerRadius.lg)
                        .stroke(Color.sage300, lineWidth: 1)
                )
            }
        }
    }
}

// MARK: - Brain Dump Section
struct BrainDumpSection: View {
    let onOpenNavia: () -> Void

    var body: some View {
        NaviaCard {
            VStack(spacing: Spacing.md) {
                HStack(spacing: Spacing.sm) {
                    Image(systemName: "brain.head.profile")
                        .font(.system(size: 20))
                        .foregroundColor(.moss500)
                    Text("Brain Dump")
                        .font(.naviaTitle2)
                        .foregroundColor(.naviaForeground)
                }

                VStack(spacing: Spacing.sm) {
                    Text("Got something on your mind?")
                        .font(.naviaBody)
                        .foregroundColor(.naviaForeground)
                        .multilineTextAlignment(.center)

                    Text("I remember everything you tell me 💛")
                        .font(.naviaCallout)
                        .foregroundColor(.naviaMuted)
                        .multilineTextAlignment(.center)

                    NaviaButton(title: "Talk to Navia", style: .primary, action: onOpenNavia)
                }
                .padding(.vertical, Spacing.md)
            }
        }
    }
}

// MARK: - Focus Mode Section
struct FocusModeSection: View {
    let onStartFocus: () -> Void

    var body: some View {
        NaviaCard {
            VStack(spacing: Spacing.md) {
                HStack(spacing: Spacing.sm) {
                    Image(systemName: "target")
                        .font(.system(size: 20))
                        .foregroundColor(.clay600)
                    Text("Focus Mode")
                        .font(.naviaTitle2)
                        .foregroundColor(.naviaForeground)
                }

                // Inspirational cards
                HStack(spacing: Spacing.sm) {
                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Text("🌊 Take your time")
                            .font(.naviaFootnote)
                            .fontWeight(.semibold)
                            .foregroundColor(.sage800)
                        Text("Progress over perfection")
                            .font(.system(size: 10))
                            .foregroundColor(.sage700)
                    }
                    .padding(Spacing.sm)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [.sage50, .sage100]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .cornerRadius(CornerRadius.lg)
                    .overlay(
                        RoundedRectangle(cornerRadius: CornerRadius.lg)
                            .stroke(Color.sage200, lineWidth: 1)
                    )

                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        Text("💛 You're not alone")
                            .font(.naviaFootnote)
                            .fontWeight(.semibold)
                            .foregroundColor(.clay800)
                        Text("I'm here for you")
                            .font(.system(size: 10))
                            .foregroundColor(.clay700)
                    }
                    .padding(Spacing.sm)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [.clay50, .clay100]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .cornerRadius(CornerRadius.lg)
                    .overlay(
                        RoundedRectangle(cornerRadius: CornerRadius.lg)
                            .stroke(Color.clay200, lineWidth: 1)
                    )
                }

                NaviaButton(title: "Start Focus Session", style: .primary, action: onStartFocus)

                Text("Set your intention and I'll stay with you")
                    .font(.naviaCallout)
                    .foregroundColor(.clay700)
                    .multilineTextAlignment(.center)
            }
        }
    }
}

// MARK: - Navia Modal
struct NaviaModalView: View {
    @Binding var isPresented: Bool
    let message: String

    var body: some View {
        ZStack {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
                .onTapGesture {
                    isPresented = false
                }

            VStack(spacing: Spacing.lg) {
                NaviaAvatar(size: 80, showPulse: true)

                Text(message)
                    .font(.naviaBody)
                    .foregroundColor(.naviaForeground)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Spacing.lg)

                NaviaButton(title: "Close", style: .secondary) {
                    isPresented = false
                }
            }
            .padding(Spacing.xl)
            .background(Color.naviaBackground)
            .cornerRadius(CornerRadius.xxl)
            .shadow(radius: 20)
            .padding(Spacing.xl)
        }
    }
}

// MARK: - Supporting Models for API
struct ExtractTasksResponse: Codable {
    let tasks: [ExtractedTask]
}

struct ExtractedTask: Codable {
    let title: String
    let category: TaskCategory?
    let priority: TaskPriority?
    let timeEstimate: Int?
    let reasoning: String?

    enum CodingKeys: String, CodingKey {
        case title, category, priority, reasoning
        case timeEstimate = "time_estimate"
    }
}

#Preview {
    DashboardView()
}
