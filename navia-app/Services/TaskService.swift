//
//  TaskService.swift
//  navia-app
//
//  Task API service
//

import Foundation

class TaskService {
    static let shared = TaskService()
    private let client = APIClient.shared

    private init() {}

    // MARK: - Fetch Tasks
    func fetchTasks(status: TaskStatus? = nil, category: TaskCategory? = nil) async throws -> [Task] {
        var endpoint = "/api/tasks"
        var queryItems: [String] = []

        if let status = status {
            queryItems.append("status=\(status.rawValue)")
        }
        if let category = category {
            queryItems.append("category=\(category.rawValue)")
        }

        if !queryItems.isEmpty {
            endpoint += "?" + queryItems.joined(separator: "&")
        }

        let response: TasksResponse = try await client.request(endpoint)
        return response.tasks
    }

    // MARK: - Create Task
    func createTask(title: String, category: TaskCategory, priority: TaskPriority = .medium) async throws -> Task {
        let body = CreateTaskRequest(title: title, category: category, priority: priority)
        return try await client.request("/api/tasks", method: .post, body: body)
    }

    // MARK: - Update Task
    func updateTask(id: String, status: TaskStatus) async throws -> Task {
        let body = UpdateTaskRequest(id: id, status: status)
        return try await client.request("/api/tasks", method: .patch, body: body)
    }

    // MARK: - Delete Task
    func deleteTask(id: String) async throws {
        let _: EmptyResponse = try await client.request("/api/tasks?id=\(id)", method: .delete)
    }

    // MARK: - Get Task Breakdown
    func getTaskBreakdown(taskTitle: String) async throws -> TaskBreakdown {
        let body = ["task": taskTitle]
        return try await client.request("/api/features/task-breakdown", method: .post, body: body)
    }
}

// MARK: - Request/Response Models
struct TasksResponse: Codable {
    let tasks: [Task]
}

struct CreateTaskRequest: Codable {
    let title: String
    let category: TaskCategory
    let priority: TaskPriority
}

struct UpdateTaskRequest: Codable {
    let id: String
    let status: TaskStatus
}

struct TaskBreakdown: Codable {
    let why: String
    let mainSteps: [TaskStep]

    enum CodingKeys: String, CodingKey {
        case why
        case mainSteps = "main_steps"
    }
}

struct TaskStep: Codable, Identifiable {
    let id = UUID()
    let stepNumber: Int
    let action: String
    let duration: String
    let isComplex: Bool
    let subSteps: [TaskStep]?

    enum CodingKeys: String, CodingKey {
        case stepNumber = "step_number"
        case action, duration
        case isComplex = "is_complex"
        case subSteps = "sub_steps"
    }
}

struct EmptyResponse: Codable {}
