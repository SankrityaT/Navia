//
//  ChatMessage.swift
//  navia-app
//
//  Chat message model matching Supabase chat_messages schema
//

import Foundation

struct ChatMessage: Codable, Identifiable {
    let id: String
    var userId: String
    var message: String // user input
    var response: String // AI response
    var category: MessageCategory?
    var persona: String?
    var metadata: [String: String]?
    var pineconeId: String?
    var isError: Bool?
    var sessionId: String?
    var sessionTitle: String?
    var isFirstMessage: Bool?
    var userFeedback: String?
    var createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, message, response, category, persona, metadata
        case userId = "user_id"
        case pineconeId = "pinecone_id"
        case isError = "is_error"
        case sessionId = "session_id"
        case sessionTitle = "session_title"
        case isFirstMessage = "is_first_message"
        case userFeedback = "user_feedback"
        case createdAt = "created_at"
    }
}

enum MessageCategory: String, Codable {
    case finance = "finance"
    case career = "career"
    case dailyTask = "daily_task"
    case general = "general"

    var displayName: String {
        switch self {
        case .finance: return "Finance"
        case .career: return "Career"
        case .dailyTask: return "Daily Tasks"
        case .general: return "General"
        }
    }

    var icon: String {
        switch self {
        case .finance: return "dollarsign.circle"
        case .career: return "briefcase"
        case .dailyTask: return "checklist"
        case .general: return "message"
        }
    }
}

// MARK: - Display Message (for UI)
struct DisplayMessage: Identifiable {
    let id: String
    let content: String
    let isUser: Bool
    let timestamp: Date
    let category: MessageCategory?

    init(id: String, content: String, isUser: Bool, timestamp: Date, category: MessageCategory?) {
        self.id = id
        self.content = content
        self.isUser = isUser
        self.timestamp = timestamp
        self.category = category
    }

    init(from chatMessage: ChatMessage, isUserMessage: Bool) {
        self.id = chatMessage.id + (isUserMessage ? "_user" : "_ai")
        self.content = isUserMessage ? chatMessage.message : chatMessage.response
        self.isUser = isUserMessage
        self.timestamp = chatMessage.createdAt
        self.category = chatMessage.category
    }
}

// MARK: - Mock Data
extension ChatMessage {
    static let mock = ChatMessage(
        id: UUID().uuidString,
        userId: "user_123",
        message: "How do I start working on my resume?",
        response: "Let's break this down into small, manageable steps! First, let's gather what you need...",
        category: .career,
        persona: "supportive",
        sessionId: UUID().uuidString,
        sessionTitle: "Resume Help",
        isFirstMessage: true,
        createdAt: Date()
    )
}
