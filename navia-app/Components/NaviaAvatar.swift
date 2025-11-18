//
//  NaviaAvatar.swift
//  navia-app
//
//  Animated Navia avatar with breathing effect
//

import SwiftUI

struct NaviaAvatar: View {
    @State private var isBreathing = false
    let size: CGFloat
    let showPulse: Bool

    init(size: CGFloat = 80, showPulse: Bool = true) {
        self.size = size
        self.showPulse = showPulse
    }

    var body: some View {
        ZStack {
            // Pulse rings (breathing effect)
            if showPulse {
                ForEach(0..<3) { index in
                    Circle()
                        .stroke(Color.naviaAccent.opacity(0.3), lineWidth: 2)
                        .frame(width: size, height: size)
                        .scaleEffect(isBreathing ? 1.3 : 1.0)
                        .opacity(isBreathing ? 0 : 0.6)
                        .animation(
                            Animation.easeInOut(duration: 2.0)
                                .repeatForever(autoreverses: false)
                                .delay(Double(index) * 0.3),
                            value: isBreathing
                        )
                }
            }

            // Main avatar circle
            Circle()
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [.clay400, .clay600]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: size, height: size)
                .scaleEffect(isBreathing ? 1.05 : 1.0)
                .animation(
                    Animation.easeInOut(duration: 2.0)
                        .repeatForever(autoreverses: true),
                    value: isBreathing
                )

            // Inner accent
            Circle()
                .fill(Color.sage200.opacity(0.3))
                .frame(width: size * 0.6, height: size * 0.6)
                .offset(x: -size * 0.1, y: -size * 0.1)

            // Letter "N"
            Text("N")
                .font(.system(size: size * 0.4, weight: .bold, design: .serif))
                .foregroundColor(.cream)
        }
        .onAppear {
            isBreathing = true
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: Spacing.xl) {
        NaviaAvatar(size: 120, showPulse: true)
        NaviaAvatar(size: 60, showPulse: false)
    }
    .padding()
    .background(Color.naviaBackground)
}
