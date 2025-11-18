//
//  TasksView.swift
//  navia-app
//
//  Task management view
//

import SwiftUI

struct TasksView: View {
    @State private var tasks: [Task] = Task.mockList
    @State private var selectedFilter: TaskStatus? = nil
    @State private var showingAddTask = false

    var filteredTasks: [Task] {
        if let filter = selectedFilter {
            return tasks.filter { $0.status == filter }
        }
        return tasks
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Filter chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Spacing.sm) {
                        FilterChip(
                            title: "All",
                            isSelected: selectedFilter == nil,
                            count: tasks.count
                        ) {
                            selectedFilter = nil
                        }

                        ForEach(TaskStatus.allCases, id: \.self) { status in
                            FilterChip(
                                title: status.displayName,
                                isSelected: selectedFilter == status,
                                count: tasks.filter { $0.status == status }.count
                            ) {
                                selectedFilter = status
                            }
                        }
                    }
                    .padding(.horizontal, Spacing.screenPadding)
                    .padding(.vertical, Spacing.sm)
                }
                .background(Color.sand.opacity(0.5))

                // Task list
                ScrollView {
                    LazyVStack(spacing: Spacing.sm) {
                        ForEach(filteredTasks) { task in
                            TaskCard(
                                task: task,
                                onToggle: {
                                    toggleTask(task)
                                },
                                onTap: {
                                    // Navigate to detail
                                }
                            )
                        }
                    }
                    .padding(Spacing.screenPadding)
                }
                .background(Color.naviaBackground)
            }
            .navigationTitle("Tasks")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddTask = true }) {
                        Image(systemName: "plus")
                            .foregroundColor(.naviaAccent)
                    }
                }
            }
            .sheet(isPresented: $showingAddTask) {
                AddTaskView { newTask in
                    tasks.insert(newTask, at: 0)
                }
            }
        }
    }

    private func toggleTask(_ task: Task) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            let newStatus: TaskStatus = task.status == .completed ? .notStarted : .completed
            tasks[index].status = newStatus

            Task.detached {
                try? await TaskService.shared.updateTask(id: task.id, status: newStatus)
            }
        }
    }
}

// MARK: - Filter Chip
struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let count: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Spacing.xs) {
                Text(title)
                    .font(.naviaCallout)

                Text("\(count)")
                    .font(.naviaCaption)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(isSelected ? Color.cream : Color.stone)
                    .cornerRadius(CornerRadius.xs)
            }
            .foregroundColor(isSelected ? .cream : .naviaForeground)
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.sm)
            .background(isSelected ? Color.naviaAccent : Color.sand)
            .cornerRadius(CornerRadius.full)
        }
    }
}

// MARK: - Add Task View
struct AddTaskView: View {
    @Environment(\.dismiss) var dismiss
    let onAdd: (Task) -> Void

    @State private var title = ""
    @State private var category: TaskCategory = .dailyLife
    @State private var priority: TaskPriority = .medium

    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("Task title", text: $title)
                        .font(.naviaBody)
                }

                Section("Category") {
                    Picker("Category", selection: $category) {
                        ForEach(TaskCategory.allCases, id: \.self) { cat in
                            Label(cat.displayName, systemImage: cat.icon)
                                .tag(cat)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Priority") {
                    Picker("Priority", selection: $priority) {
                        ForEach(TaskPriority.allCases, id: \.self) { pri in
                            Text(pri.displayName).tag(pri)
                        }
                    }
                    .pickerStyle(.segmented)
                }
            }
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.naviaMuted)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        addTask()
                    }
                    .foregroundColor(.naviaAccent)
                    .disabled(title.isEmpty)
                }
            }
        }
    }

    private func addTask() {
        let newTask = Task(
            id: UUID().uuidString,
            userId: "current_user",
            title: title,
            status: .notStarted,
            priority: priority,
            category: category,
            createdAt: Date(),
            createdBy: "current_user"
        )

        onAdd(newTask)

        Task.detached {
            try? await TaskService.shared.createTask(
                title: title,
                category: category,
                priority: priority
            )
        }

        dismiss()
    }
}

#Preview {
    TasksView()
}
