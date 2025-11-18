//
//  User.swift
//  navia-app
//
//  User model matching Supabase user_profiles schema
//

import Foundation

struct UserProfile: Codable, Identifiable {
    let id: String // clerk_user_id
    var name: String?
    var email: String?
    var graduationTimeline: String?
    var neurotypes: [String: Bool]?
    var otherNeurotype: String?
    var efChallenges: [String: Bool]?
    var currentGoal: String?
    var currentGoals: [String]?
    var jobField: String?
    var interests: [String]?
    var seeking: [String]?
    var offers: [String]?
    var onboarded: Bool?
    var onboardedAt: Date?
    var energyLevel: Int? // 1-10
    var supportLevel: Int? // 1-5
    var updatedAt: Date?
    var createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id = "clerk_user_id"
        case name, email
        case graduationTimeline = "graduation_timeline"
        case neurotypes
        case otherNeurotype = "other_neurotype"
        case efChallenges = "ef_challenges"
        case currentGoal = "current_goal"
        case currentGoals = "current_goals"
        case jobField = "job_field"
        case interests, seeking, offers, onboarded
        case onboardedAt = "onboarded_at"
        case energyLevel = "energy_level"
        case supportLevel = "support_level"
        case updatedAt = "updated_at"
        case createdAt = "created_at"
    }
}

// MARK: - Mock Data for Preview
extension UserProfile {
    static let mock = UserProfile(
        id: "user_123",
        name: "Alex Chen",
        email: "alex@example.com",
        graduationTimeline: "2024",
        neurotypes: ["adhd": true, "autism": false],
        efChallenges: ["task_initiation": true, "time_management": true],
        currentGoals: ["Find job", "Build routine", "Manage finances"],
        jobField: "Software Engineering",
        interests: ["coding", "gaming", "music"],
        seeking: ["accountability", "job search help"],
        offers: ["tech advice", "peer support"],
        onboarded: true,
        energyLevel: 6,
        supportLevel: 3,
        updatedAt: Date(),
        createdAt: Date()
    )
}
