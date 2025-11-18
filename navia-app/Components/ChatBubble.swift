//
//  ChatBubble.swift
//  navia-app
//
//  Chat message bubble matching web app style
//

import SwiftUI

struct ChatBubble: View {
    let message: DisplayMessage

    var body: some View {
        HStack(alignment: .top, spacing: Spacing.sm) {
            if !message.isUser {
                NaviaAvatar(size: 32, showPulse: false)
            }

            VStack(alignment: message.isUser ? .trailing : .leading, spacing: Spacing.xxs) {
                Text(message.content)
                    .font(.naviaBody)
                    .foregroundColor(message.isUser ? .cream : .naviaForeground)
                    .padding(Spacing.md)
                    .background(message.isUser ? Color.naviaAccent : Color.sand)
                    .cornerRadius(CornerRadius.lg)
                    .frame(maxWidth: UIScreen.main.bounds.width * 0.7, alignment: message.isUser ? .trailing : .leading)

                Text(message.timestamp, style: .time)
                    .font(.naviaCaption)
                    .foregroundColor(.naviaMuted)
                    .padding(.horizontal, Spacing.xs)
            }

            if message.isUser {
                Spacer()
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
