//
//  ChatService.swift
//  navia-app
//
//  Chat API service with streaming support
//

import Foundation

class ChatService {
    static let shared = ChatService()
    private let client = APIClient.shared

    private init() {}

    // MARK: - Send Message (Streaming)
    func sendMessage(
        message: String,
        category: MessageCategory? = nil,
        sessionId: String? = nil,
        onChunk: @escaping (String) -> Void
    ) async throws {
        let body = ChatRequest(
            message: message,
            category: category?.rawValue,
            sessionId: sessionId
        )

        try await client.stream("/api/dashboard-chat", method: .post, body: body, onChunk: onChunk)
    }

    // MARK: - Fetch Chat History
    func fetchChatHistory(limit: Int = 50, category: MessageCategory? = nil) async throws -> [ChatMessage] {
        var endpoint = "/api/chat/history?limit=\(limit)"
        if let category = category {
            endpoint += "&category=\(category.rawValue)"
        }

        let response: ChatHistoryResponse = try await client.request(endpoint)
        return response.messages
    }

    // MARK: - Fetch Sessions
    func fetchSessions() async throws -> [ChatSession] {
        let response: SessionsResponse = try await client.request("/api/chat/sessions")
        return response.sessions
    }

    // MARK: - Send Feedback
    func sendFeedback(messageId: String, feedback: String) async throws {
        let body = ["messageId": messageId, "feedback": feedback]
        let _: EmptyResponse = try await client.request("/api/chat/feedback", method: .post, body: body)
    }
}

// MARK: - Request/Response Models
struct ChatRequest: Codable {
    let message: String
    let category: String?
    let sessionId: String?

    enum CodingKeys: String, CodingKey {
        case message, category
        case sessionId = "session_id"
    }
}

struct ChatHistoryResponse: Codable {
    let messages: [ChatMessage]
}

struct ChatSession: Codable, Identifiable {
    let id: String
    let title: String?
    let createdAt: Date
    let messageCount: Int

    enum CodingKeys: String, CodingKey {
        case id, title
        case createdAt = "created_at"
        case messageCount = "message_count"
    }
}

struct SessionsResponse: Codable {
    let sessions: [ChatSession]
}
