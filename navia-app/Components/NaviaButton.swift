//
//  NaviaButton.swift
//  navia-app
//
//  Primary button component matching web app style
//

import SwiftUI

struct NaviaButton: View {
    let title: String
    let style: ButtonStyle
    let action: () -> Void

    enum ButtonStyle {
        case primary
        case secondary
        case outline
        case text

        var backgroundColor: Color {
            switch self {
            case .primary: return .naviaAccent
            case .secondary: return .sage500
            case .outline: return .clear
            case .text: return .clear
            }
        }

        var foregroundColor: Color {
            switch self {
            case .primary: return .cream
            case .secondary: return .cream
            case .outline: return .naviaAccent
            case .text: return .naviaAccent
            }
        }

        var borderColor: Color? {
            switch self {
            case .outline: return .naviaAccent
            default: return nil
            }
        }
    }

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.naviaHeadline)
                .foregroundColor(style.foregroundColor)
                .padding(.horizontal, Spacing.lg)
                .padding(.vertical, Spacing.md)
                .frame(maxWidth: .infinity)
                .background(style.backgroundColor)
                .cornerRadius(CornerRadius.lg)
                .overlay(
                    RoundedRectangle(cornerRadius: CornerRadius.lg)
                        .stroke(style.borderColor ?? .clear, lineWidth: 2)
                )
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: Spacing.md) {
        NaviaButton(title: "Get Started", style: .primary) {}
        NaviaButton(title: "Learn More", style: .secondary) {}
        NaviaButton(title: "View Details", style: .outline) {}
        NaviaButton(title: "Skip", style: .text) {}
    }
    .padding()
    .background(Color.naviaBackground)
}
