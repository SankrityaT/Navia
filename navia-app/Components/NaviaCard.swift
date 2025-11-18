//
//  NaviaCard.swift
//  navia-app
//
//  Card component matching web app bento grid style
//

import SwiftUI

struct NaviaCard<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(Spacing.cardPadding)
            .background(Color.sand)
            .cornerRadius(CornerRadius.xl)
            .shadow(color: Color.charcoal.opacity(0.05), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Task Card
struct TaskCard: View {
    let task: Task
    let onToggle: () -> Void
    let onTap: () -> Void

    var body: some View {
        HStack(spacing: Spacing.md) {
            // Status Icon
            Button(action: onToggle) {
                Image(systemName: task.status.icon)
                    .font(.system(size: 24))
                    .foregroundColor(task.status == .completed ? .sage600 : .clay400)
            }
            .buttonStyle(PlainButtonStyle())

            // Task Info
            VStack(alignment: .leading, spacing: Spacing.xxs) {
                Text(task.title)
                    .font(.naviaCallout)
                    .foregroundColor(.naviaForeground)
                    .strikethrough(task.status == .completed)

                HStack(spacing: Spacing.xs) {
                    // Category
                    Label(task.category.displayName, systemImage: task.category.icon)
                        .font(.naviaCaption)
                        .foregroundColor(.naviaMuted)

                    // Priority
                    if task.priority == .high {
                        Circle()
                            .fill(Color.clay600)
                            .frame(width: 6, height: 6)
                    }

                    // Time Estimate
                    if let time = task.timeEstimate {
                        Text("\(time)m")
                            .font(.naviaCaption)
                            .foregroundColor(.naviaMuted)
                    }
                }
            }

            Spacer()

            // Chevron
            Image(systemName: "chevron.right")
                .font(.system(size: 14))
                .foregroundColor(.sage400)
        }
        .padding(Spacing.md)
        .background(Color.cream)
        .cornerRadius(CornerRadius.md)
        .onTapGesture(perform: onTap)
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: Spacing.md) {
        NaviaCard {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                Text("Today's Focus")
                    .font(.naviaTitle3)
                    .foregroundColor(.naviaForeground)

                Text("3 tasks remaining")
                    .font(.naviaCallout)
                    .foregroundColor(.naviaMuted)
            }
        }

        TaskCard(
            task: Task.mock,
            onToggle: {},
            onTap: {}
        )
    }
    .padding()
    .background(Color.naviaBackground)
}
