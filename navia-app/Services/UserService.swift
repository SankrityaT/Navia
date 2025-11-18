//
//  UserService.swift
//  navia-app
//
//  User profile and state management API
//

import Foundation

class UserService {
    static let shared = UserService()
    private let client = APIClient.shared

    private init() {}

    // MARK: - Fetch User Profile
    func fetchProfile() async throws -> UserProfile {
        return try await client.request("/api/user/profile")
    }

    // MARK: - Update Profile
    func updateProfile(_ profile: UserProfile) async throws -> UserProfile {
        return try await client.request("/api/user/profile", method: .patch, body: profile)
    }

    // MARK: - Fetch User State
    func fetchUserState() async throws -> UserState {
        return try await client.request("/api/user-state")
    }

    // MARK: - Update Energy Level
    func updateEnergyLevel(_ level: Int) async throws {
        let body = ["energyLevel": level]
        let _: EmptyResponse = try await client.request("/api/user-state", method: .patch, body: body)
    }

    // MARK: - Update Support Level
    func updateSupportLevel(_ level: Int) async throws {
        let body = ["supportLevel": level]
        let _: EmptyResponse = try await client.request("/api/user-state", method: .patch, body: body)
    }

    // MARK: - Fetch Stats
    func fetchStats() async throws -> UserStats {
        return try await client.request("/api/users/stats")
    }
}

// MARK: - Models
struct UserState: Codable {
    let energyLevel: Int?
    let supportLevel: Int?

    enum CodingKeys: String, CodingKey {
        case energyLevel = "energy_level"
        case supportLevel = "support_level"
    }
}

struct UserStats: Codable {
    let tasksCompleted: Int
    let totalTasks: Int
    let chatSessions: Int
    let peerConnections: Int

    enum CodingKeys: String, CodingKey {
        case tasksCompleted = "tasks_completed"
        case totalTasks = "total_tasks"
        case chatSessions = "chat_sessions"
        case peerConnections = "peer_connections"
    }
}
