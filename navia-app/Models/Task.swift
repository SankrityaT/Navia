//
//  Task.swift
//  navia-app
//
//  Task model matching Supabase tasks schema
//

import Foundation

struct Task: Codable, Identifiable {
    let id: String
    var userId: String
    var taskId: String?
    var title: String
    var status: TaskStatus
    var priority: TaskPriority
    var timeEstimate: Int? // minutes
    var category: TaskCategory
    var description: String?
    var breakdown: [String]?
    var dependencies: [String]?
    var dueDate: Date?
    var createdAt: Date
    var createdBy: String

    enum CodingKeys: String, CodingKey {
        case id, title, status, priority, category, description, breakdown, dependencies
        case userId = "user_id"
        case taskId = "task_id"
        case timeEstimate = "time_estimate"
        case dueDate = "due_date"
        case createdAt = "created_at"
        case createdBy = "created_by"
    }
}

enum TaskStatus: String, Codable, CaseIterable {
    case notStarted = "not_started"
    case inProgress = "in_progress"
    case completed = "completed"

    var displayName: String {
        switch self {
        case .notStarted: return "Not Started"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        }
    }

    var icon: String {
        switch self {
        case .notStarted: return "circle"
        case .inProgress: return "circle.lefthalf.filled"
        case .completed: return "checkmark.circle.fill"
        }
    }
}

enum TaskPriority: String, Codable, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"

    var displayName: String { rawValue.capitalized }

    var color: String {
        switch self {
        case .low: return "sage500"
        case .medium: return "clay400"
        case .high: return "clay600"
        }
    }
}

enum TaskCategory: String, Codable, CaseIterable {
    case career = "career"
    case finance = "finance"
    case dailyLife = "daily_life"
    case social = "social"

    var displayName: String {
        switch self {
        case .career: return "Career"
        case .finance: return "Finance"
        case .dailyLife: return "Daily Life"
        case .social: return "Social"
        }
    }

    var icon: String {
        switch self {
        case .career: return "briefcase.fill"
        case .finance: return "dollarsign.circle.fill"
        case .dailyLife: return "house.fill"
        case .social: return "person.2.fill"
        }
    }
}

// MARK: - Mock Data
extension Task {
    static let mock = Task(
        id: UUID().uuidString,
        userId: "user_123",
        title: "Update resume",
        status: .notStarted,
        priority: .high,
        timeEstimate: 60,
        category: .career,
        description: "Update resume with latest projects",
        breakdown: ["Open resume", "Add latest project", "Review formatting", "Save and export"],
        createdAt: Date(),
        createdBy: "user_123"
    )

    static let mockList: [Task] = [
        Task(id: "1", userId: "user_123", title: "Update resume", status: .notStarted, priority: .high, timeEstimate: 60, category: .career, createdAt: Date(), createdBy: "user_123"),
        Task(id: "2", userId: "user_123", title: "Review budget", status: .inProgress, priority: .medium, timeEstimate: 30, category: .finance, createdAt: Date(), createdBy: "user_123"),
        Task(id: "3", userId: "user_123", title: "Call dentist", status: .notStarted, priority: .low, timeEstimate: 10, category: .dailyLife, createdAt: Date(), createdBy: "user_123"),
        Task(id: "4", userId: "user_123", title: "Message peer", status: .completed, priority: .low, timeEstimate: 5, category: .social, createdAt: Date(), createdBy: "user_123")
    ]
}
