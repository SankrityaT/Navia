//
//  ChatBubble.swift
//  navia-app
//
//  Chat message bubble - EXACT match to web app
//  Web: components/chat/ChatInterface.tsx
//  User messages: Clay bubble, white text, right-aligned
//  Assistant messages: NO bubble, just text, left-aligned
//

import SwiftUI

struct ChatBubble: View {
    let message: DisplayMessage

    var body: some View {
        HStack(alignment: .top, spacing: 0) {
            if message.isUser {
                Spacer(minLength: UIScreen.main.bounds.width * 0.2)

                // User message - WITH bubble
                VStack(alignment: .trailing, spacing: Spacing.xxs) {
                    Text(message.content)
                        .font(.naviaBody)
                        .foregroundColor(.white)
                        .padding(Spacing.md)
                        .background(Color(hex: "C77A4C")) // Exact web color
                        .cornerRadius(16) // rounded-2xl
                        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)

                    Text(message.timestamp, style: .time)
                        .font(.naviaCaption)
                        .foregroundColor(.naviaMuted)
                        .padding(.horizontal, Spacing.xs)
                }
                .frame(maxWidth: UIScreen.main.bounds.width * 0.8, alignment: .trailing)
            } else {
                // Assistant message - NO bubble, just text
                VStack(alignment: .leading, spacing: Spacing.xxs) {
                    Text(message.content)
                        .font(.naviaBody)
                        .foregroundColor(Color(hex: "1F2937")) // text-gray-800
                        .padding(Spacing.md)

                    Text(message.timestamp, style: .time)
                        .font(.naviaCaption)
                        .foregroundColor(.naviaMuted)
                        .padding(.horizontal, Spacing.xs)
                }
                .frame(maxWidth: UIScreen.main.bounds.width * 0.8, alignment: .leading)

                Spacer(minLength: UIScreen.main.bounds.width * 0.2)
            }
        }
        .padding(.horizontal, Spacing.screenPadding)
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: Spacing.md) {
        ChatBubble(message: DisplayMessage(
            from: ChatMessage.mock,
            isUserMessage: true
        ))

        ChatBubble(message: DisplayMessage(
            from: ChatMessage.mock,
            isUserMessage: false
        ))
    }
    .background(Color.naviaBackground)
}
