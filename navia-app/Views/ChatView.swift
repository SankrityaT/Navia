//
//  ChatView.swift
//  navia-app
//
//  Chat interface with Navia AI
//

import SwiftUI

struct ChatView: View {
    @State private var messages: [DisplayMessage] = []
    @State private var inputText = ""
    @State private var isStreaming = false
    @State private var currentStreamingMessage = ""

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Messages
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: Spacing.md) {
                            // Welcome message
                            if messages.isEmpty {
                                VStack(spacing: Spacing.lg) {
                                    NaviaAvatar(size: 80, showPulse: true)

                                    Text("Hi! I'm Navia")
                                        .font(.naviaTitle1)
                                        .foregroundColor(.naviaForeground)

                                    Text("I'm here to help you with tasks, career advice, finances, and daily challenges. What's on your mind?")
                                        .font(.naviaBody)
                                        .foregroundColor(.naviaMuted)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal, Spacing.xl)
                                }
                                .padding(.top, Spacing.xxxl)
                            }

                            ForEach(messages) { message in
                                ChatBubble(message: message)
                                    .id(message.id)
                            }

                            // Streaming message
                            if isStreaming && !currentStreamingMessage.isEmpty {
                                ChatBubble(message: DisplayMessage(
                                    id: "streaming",
                                    content: currentStreamingMessage,
                                    isUser: false,
                                    timestamp: Date(),
                                    category: nil
                                ))
                                .id("streaming")
                            }
                        }
                        .padding(.vertical, Spacing.md)
                    }
                    .onChange(of: messages.count) { _, _ in
                        if let lastMessage = messages.last {
                            withAnimation {
                                proxy.scrollTo(lastMessage.id, anchor: .bottom)
                            }
                        }
                    }
                }

                // Input bar
                HStack(spacing: Spacing.sm) {
                    TextField("Message Navia...", text: $inputText, axis: .vertical)
                        .font(.naviaBody)
                        .padding(Spacing.sm)
                        .background(Color.sand)
                        .cornerRadius(CornerRadius.lg)
                        .lineLimit(1...5)
                        .disabled(isStreaming)

                    Button(action: sendMessage) {
                        Image(systemName: isStreaming ? "stop.circle.fill" : "arrow.up.circle.fill")
                            .font(.system(size: 32))
                            .foregroundColor(inputText.isEmpty && !isStreaming ? .sage300 : .naviaAccent)
                    }
                    .disabled(inputText.isEmpty && !isStreaming)
                }
                .padding(Spacing.screenPadding)
                .background(Color.cream)
            }
            .background(Color.naviaBackground)
            .navigationTitle("Chat")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func sendMessage() {
        guard !inputText.isEmpty else { return }

        let userMessage = inputText
        inputText = ""

        // Add user message
        let tempUserMessage = DisplayMessage(
            id: UUID().uuidString,
            content: userMessage,
            isUser: true,
            timestamp: Date(),
            category: nil
        )
        messages.append(tempUserMessage)

        // Stream AI response
        isStreaming = true
        currentStreamingMessage = ""

        _Concurrency.Task {
            do {
                try await ChatService.shared.sendMessage(
                    message: userMessage,
                    sessionId: nil
                ) { chunk in
                    currentStreamingMessage += chunk
                }

                // Save completed message
                let aiMessage = DisplayMessage(
                    id: UUID().uuidString,
                    content: currentStreamingMessage,
                    isUser: false,
                    timestamp: Date(),
                    category: nil
                )
                messages.append(aiMessage)

                isStreaming = false
                currentStreamingMessage = ""

            } catch {
                print("Chat error: \(error)")
                isStreaming = false
                currentStreamingMessage = ""

                let errorMessage = DisplayMessage(
                    id: UUID().uuidString,
                    content: "Sorry, I encountered an error. Please try again.",
                    isUser: false,
                    timestamp: Date(),
                    category: nil
                )
                messages.append(errorMessage)
            }
        }
    }
}

#Preview {
    ChatView()
}
