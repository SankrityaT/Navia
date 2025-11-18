//
//  DashboardView.swift
//  navia-app
//
//  Dashboard with bento grid layout matching web app
//

import SwiftUI

struct DashboardView: View {
    @State private var energyLevel: Double = 6
    @State private var supportLevel: Int = 3
    @State private var tasks: [Task] = Task.mockList
    @State private var showingAddTask = false

    var incompleteTasks: [Task] {
        tasks.filter { $0.status != .completed }
    }

    var todayTasks: [Task] {
        incompleteTasks.prefix(3).map { $0 }
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: Spacing.lg) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: Spacing.xxs) {
                            Text("Welcome back!")
                                .font(.naviaTitle1)
                                .foregroundColor(.naviaForeground)

                            Text("Let's make today count")
                                .font(.naviaCallout)
                                .foregroundColor(.naviaMuted)
                        }

                        Spacer()

                        NaviaAvatar(size: 48, showPulse: true)
                    }
                    .padding(.horizontal, Spacing.screenPadding)

                    // Bento Grid
                    LazyVGrid(columns: [
                        SwiftUI.GridItem(.flexible()),
                        SwiftUI.GridItem(.flexible())
                    ], spacing: Spacing.md) {
                        // Energy Check-in (full width)
                        BentoGridCell(columnSpan: 2) {
                            EnergySlider(energyLevel: $energyLevel) { level in
                                Task {
                                    try? await UserService.shared.updateEnergyLevel(level)
                                }
                            }
                        }

                        // Today's Focus
                        NaviaCard {
                            VStack(alignment: .leading, spacing: Spacing.sm) {
                                HStack {
                                    Image(systemName: "target")
                                        .foregroundColor(.naviaAccent)
                                    Text("Today's Focus")
                                        .font(.naviaHeadline)
                                        .foregroundColor(.naviaForeground)
                                }

                                Text("\(incompleteTasks.count) tasks")
                                    .font(.naviaTitle2)
                                    .foregroundColor(.naviaAccent)

                                if incompleteTasks.isEmpty {
                                    Text("You're all caught up! 🎉")
                                        .font(.naviaCallout)
                                        .foregroundColor(.naviaMuted)
                                } else {
                                    Text("Great progress!")
                                        .font(.naviaCallout)
                                        .foregroundColor(.naviaMuted)
                                }
                            }
                        }

                        // Quick Wins
                        NaviaCard {
                            VStack(alignment: .leading, spacing: Spacing.sm) {
                                HStack {
                                    Image(systemName: "bolt.fill")
                                        .foregroundColor(.clay500)
                                    Text("Quick Wins")
                                        .font(.naviaHeadline)
                                        .foregroundColor(.naviaForeground)
                                }

                                let quickTasks = tasks.filter { ($0.timeEstimate ?? 0) <= 15 && $0.status != .completed }
                                Text("\(quickTasks.count)")
                                    .font(.naviaTitle2)
                                    .foregroundColor(.clay500)

                                Text("Under 15 min")
                                    .font(.naviaCallout)
                                    .foregroundColor(.naviaMuted)
                            }
                        }
                    }
                    .padding(.horizontal, Spacing.screenPadding)

                    // Today's Tasks (full width)
                    VStack(alignment: .leading, spacing: Spacing.md) {
                        HStack {
                            Text("Today's Tasks")
                                .font(.naviaTitle3)
                                .foregroundColor(.naviaForeground)

                            Spacer()

                            Button(action: { showingAddTask = true }) {
                                Image(systemName: "plus.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(.naviaAccent)
                            }
                        }
                        .padding(.horizontal, Spacing.screenPadding)

                        if todayTasks.isEmpty {
                            NaviaCard {
                                VStack(spacing: Spacing.sm) {
                                    Image(systemName: "checkmark.circle")
                                        .font(.system(size: 48))
                                        .foregroundColor(.sage500)

                                    Text("No tasks yet")
                                        .font(.naviaHeadline)
                                        .foregroundColor(.naviaForeground)

                                    Text("Add a task to get started")
                                        .font(.naviaCallout)
                                        .foregroundColor(.naviaMuted)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(Spacing.lg)
                            }
                            .padding(.horizontal, Spacing.screenPadding)
                        } else {
                            VStack(spacing: Spacing.sm) {
                                ForEach(todayTasks) { task in
                                    TaskCard(
                                        task: task,
                                        onToggle: {
                                            toggleTask(task)
                                        },
                                        onTap: {
                                            // Navigate to task detail
                                        }
                                    )
                                }
                            }
                            .padding(.horizontal, Spacing.screenPadding)
                        }
                    }

                    // Quick Chat Section
                    NaviaCard {
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            HStack {
                                NaviaAvatar(size: 32, showPulse: false)

                                VStack(alignment: .leading, spacing: Spacing.xxs) {
                                    Text("Chat with Navia")
                                        .font(.naviaHeadline)
                                        .foregroundColor(.naviaForeground)

                                    Text("I'm here to help!")
                                        .font(.naviaCallout)
                                        .foregroundColor(.naviaMuted)
                                }

                                Spacer()

                                Image(systemName: "chevron.right")
                                    .foregroundColor(.sage400)
                            }
                        }
                    }
                    .padding(.horizontal, Spacing.screenPadding)
                    .onTapGesture {
                        // Navigate to chat
                    }
                }
                .padding(.vertical, Spacing.lg)
            }
            .background(Color.naviaBackground)
            .navigationBarHidden(true)
            .sheet(isPresented: $showingAddTask) {
                AddTaskView { newTask in
                    tasks.append(newTask)
                }
            }
        }
    }

    private func toggleTask(_ task: Task) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            let newStatus: TaskStatus = task.status == .completed ? .notStarted : .completed
            tasks[index].status = newStatus

            Task {
                try? await TaskService.shared.updateTask(id: task.id, status: newStatus)
            }
        }
    }
}

// MARK: - Bento Grid Cell Helper
struct BentoGridCell<Content: View>: View {
    let columnSpan: Int
    let content: Content

    init(columnSpan: Int = 1, @ViewBuilder content: () -> Content) {
        self.columnSpan = columnSpan
        self.content = content()
    }

    var body: some View {
        content
            .gridCellColumns(columnSpan)
    }
}

#Preview {
    DashboardView()
}
