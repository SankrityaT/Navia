//
//  NaviaAvatar.swift
//  navia-app
//
//  Animated Navia gradient orb avatar - EXACT match to web app
//  Web: components/ai/NaviaAvatar.tsx
//

import SwiftUI

struct NaviaAvatar: View {
    @State private var isBreathing = false
    @State private var rotationAngle: Double = 0

    let size: CGFloat
    let showPulse: Bool
    let isThinking: Bool
    let isSpeaking: Bool

    init(size: CGFloat = 80, showPulse: Bool = true, isThinking: Bool = false, isSpeaking: Bool = false) {
        self.size = size
        self.showPulse = showPulse
        self.isThinking = isThinking
        self.isSpeaking = isSpeaking
    }

    var body: some View {
        ZStack {
            // Outer glow ring - pulses when speaking
            if showPulse {
                Circle()
                    .fill(
                        RadialGradient(
                            gradient: Gradient(stops: [
                                .init(color: Color.clay500.opacity(0.4), location: 0),
                                .init(color: Color.sage500.opacity(0.2), location: 0.5),
                                .init(color: .clear, location: 0.7)
                            ]),
                            center: .center,
                            startRadius: 0,
                            endRadius: size / 2
                        )
                    )
                    .frame(width: size, height: size)
                    .scaleEffect(isSpeaking ? 1.2 : 1.0)
                    .opacity(isSpeaking ? 0.8 : 0.3)
                    .animation(
                        .easeInOut(duration: 1.5).repeatForever(autoreverses: true),
                        value: isSpeaking
                    )
            }

            // Main gradient orb - EXACT web colors
            // linear-gradient(135deg, #C97D56 0%, #8A9B80 50%, #D89B76 100%)
            Circle()
                .fill(
                    LinearGradient(
                        gradient: Gradient(stops: [
                            .init(color: Color(hex: "C97D56"), location: 0.0),   // clay-500
                            .init(color: Color(hex: "8A9B80"), location: 0.5),   // sage-500
                            .init(color: Color(hex: "D89B76"), location: 1.0)    // clay-400
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: size * 0.9, height: size * 0.9)
                .shadow(color: Color.clay500.opacity(0.5), radius: 15, x: 0, y: 0)
                .scaleEffect(isThinking ? (isBreathing ? 1.1 : 1.0) : (isBreathing ? 1.02 : 1.0))
                .rotationEffect(.degrees(isThinking ? rotationAngle : 0))
                .animation(
                    .easeInOut(duration: 3.5).repeatForever(autoreverses: true),
                    value: isBreathing
                )

            // Inner highlight - white gradient for shine
            Circle()
                .fill(
                    RadialGradient(
                        gradient: Gradient(stops: [
                            .init(color: .white.opacity(0.8), location: 0),
                            .init(color: .clear, location: 0.6)
                        ]),
                        center: UnitPoint(x: 0.3, y: 0.3),
                        startRadius: 0,
                        endRadius: size * 0.4
                    )
                )
                .frame(width: size * 0.7, height: size * 0.7)
                .opacity(isBreathing ? 0.9 : 0.6)
                .animation(
                    .easeInOut(duration: 2.0).repeatForever(autoreverses: true),
                    value: isBreathing
                )

            // Speaking indicator - animated dots
            if isSpeaking {
                HStack(spacing: 4) {
                    ForEach(0..<3) { index in
                        Circle()
                            .fill(.white)
                            .frame(width: 6, height: 6)
                            .offset(y: isBreathing && (index % 3 == Int(rotationAngle) % 3) ? -4 : 0)
                            .animation(
                                .easeInOut(duration: 0.2).repeatForever(autoreverses: false).delay(Double(index) * 0.2),
                                value: isBreathing
                            )
                    }
                }
            }

            // Thinking indicator - rotating ring
            if isThinking && !isSpeaking {
                Circle()
                    .stroke(Color.white, lineWidth: 2)
                    .frame(width: size * 0.9, height: size * 0.9)
                    .overlay(
                        Circle()
                            .trim(from: 0, to: 0.25)
                            .stroke(Color.white.opacity(0), lineWidth: 2)
                    )
                    .rotationEffect(.degrees(rotationAngle))
            }
        }
        .onAppear {
            isBreathing = true

            // Rotation animation for thinking
            if isThinking {
                withAnimation(.linear(duration: 1.0).repeatForever(autoreverses: false)) {
                    rotationAngle = 360
                }
            }
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
