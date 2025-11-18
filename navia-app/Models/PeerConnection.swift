//
//  PeerConnection.swift
//  navia-app
//
//  Peer connection models matching Supabase schema
//

import Foundation

struct PeerConnection: Codable, Identifiable {
    let id: String // connection_id
    var user1Id: String
    var user2Id: String
    var status: ConnectionStatus
    var initiatedBy: String
    var goals: ConnectionGoals?
    var lastCheckin: Date?
    var createdAt: Date
    var acceptedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id = "connection_id"
        case user1Id = "user1_id"
        case user2Id = "user2_id"
        case status
        case initiatedBy = "initiated_by"
        case goals
        case lastCheckin = "last_checkin"
        case createdAt = "created_at"
        case acceptedAt = "accepted_at"
    }
}

struct ConnectionGoals: Codable {
    var user1Goals: [String]?
    var user2Goals: [String]?

    enum CodingKeys: String, CodingKey {
        case user1Goals = "user1_goals"
        case user2Goals = "user2_goals"
    }
}

enum ConnectionStatus: String, Codable, CaseIterable {
    case pending = "pending"
    case active = "active"
    case paused = "paused"
    case ended = "ended"

    var displayName: String { rawValue.capitalized }

    var icon: String {
        switch self {
        case .pending: return "clock.fill"
        case .active: return "checkmark.circle.fill"
        case .paused: return "pause.circle.fill"
        case .ended: return "xmark.circle.fill"
        }
    }

    var color: String {
        switch self {
        case .pending: return "clay400"
        case .active: return "sage600"
        case .paused: return "sage400"
        case .ended: return "charcoal"
        }
    }
}

struct PeerMessage: Codable, Identifiable {
    let id: String // message_id
    var connectionId: String
    var senderId: String
    var content: String
    var read: Bool
    var timestamp: Date

    enum CodingKeys: String, CodingKey {
        case id = "message_id"
        case connectionId = "connection_id"
        case senderId = "sender_id"
        case content, read, timestamp
    }
}

// MARK: - Mock Data
extension PeerConnection {
    static let mock = PeerConnection(
        id: UUID().uuidString,
        user1Id: "user_123",
        user2Id: "user_456",
        status: .active,
        initiatedBy: "user_123",
        goals: ConnectionGoals(
            user1Goals: ["Find job", "Build routine"],
            user2Goals: ["Manage finances", "Social connections"]
        ),
        lastCheckin: Date().addingTimeInterval(-86400 * 3), // 3 days ago
        createdAt: Date().addingTimeInterval(-86400 * 14), // 2 weeks ago
        acceptedAt: Date().addingTimeInterval(-86400 * 13)
    )
}

extension PeerMessage {
    static let mock = PeerMessage(
        id: UUID().uuidString,
        connectionId: UUID().uuidString,
        senderId: "user_123",
        content: "Hey! How's your job search going?",
        read: false,
        timestamp: Date()
    )
}
