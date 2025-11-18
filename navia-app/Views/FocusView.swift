//
//  FocusView.swift
//  navia-app
//
//  Focus mode (Pomodoro timer) matching web app
//

import SwiftUI

struct FocusView: View {
    @State private var isActive = false
    @State private var timeRemaining: TimeInterval = 25 * 60 // 25 minutes
    @State private var totalTime: TimeInterval = 25 * 60
    @State private var selectedDuration: FocusDuration = .twentyFive
    @State private var timer: Timer?

    enum FocusDuration: Int, CaseIterable {
        case fifteen = 15
        case twentyFive = 25
        case fortyFive = 45
        case sixty = 60

        var displayName: String {
            "\(rawValue) min"
        }

        var seconds: TimeInterval {
            TimeInterval(rawValue * 60)
        }
    }

    var progress: Double {
        1 - (timeRemaining / totalTime)
    }

    var formattedTime: String {
        let minutes = Int(timeRemaining) / 60
        let seconds = Int(timeRemaining) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    var body: some View {
        NavigationView {
            ZStack {
                Color.naviaBackground.ignoresSafeArea()

                VStack(spacing: Spacing.xl) {
                    Spacer()

                    // Timer Circle
                    ZStack {
                        // Background circle
                        Circle()
                            .stroke(Color.stone, lineWidth: 20)
                            .frame(width: 280, height: 280)

                        // Progress circle
                        Circle()
                            .trim(from: 0, to: progress)
                            .stroke(
                                LinearGradient(
                                    gradient: Gradient(colors: [.naviaAccent, .clay600]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                style: StrokeStyle(lineWidth: 20, lineCap: .round)
                            )
                            .frame(width: 280, height: 280)
                            .rotationEffect(.degrees(-90))
                            .animation(.linear, value: progress)

                        // Time text
                        VStack(spacing: Spacing.sm) {
                            Text(formattedTime)
                                .font(.system(size: 56, weight: .bold, design: .rounded))
                                .foregroundColor(.naviaForeground)

                            Text(isActive ? "Stay focused" : "Ready to focus?")
                                .font(.naviaCallout)
                                .foregroundColor(.naviaMuted)
                        }
                    }

                    Spacer()

                    // Duration selection (only when not active)
                    if !isActive {
                        VStack(spacing: Spacing.md) {
                            Text("Select Duration")
                                .font(.naviaHeadline)
                                .foregroundColor(.naviaForeground)

                            HStack(spacing: Spacing.sm) {
                                ForEach(FocusDuration.allCases, id: \.self) { duration in
                                    Button(action: {
                                        selectedDuration = duration
                                        totalTime = duration.seconds
                                        timeRemaining = duration.seconds
                                    }) {
                                        Text(duration.displayName)
                                            .font(.naviaCallout)
                                            .foregroundColor(selectedDuration == duration ? .cream : .naviaForeground)
                                            .padding(.horizontal, Spacing.md)
                                            .padding(.vertical, Spacing.sm)
                                            .background(selectedDuration == duration ? Color.naviaAccent : Color.sand)
                                            .cornerRadius(CornerRadius.lg)
                                    }
                                }
                            }
                        }
                    }

                    // Controls
                    HStack(spacing: Spacing.lg) {
                        // Reset button (only when active or paused)
                        if isActive || timeRemaining != totalTime {
                            Button(action: resetTimer) {
                                Image(systemName: "arrow.counterclockwise")
                                    .font(.system(size: 24))
                                    .foregroundColor(.naviaMuted)
                                    .frame(width: 56, height: 56)
                                    .background(Color.sand)
                                    .cornerRadius(CornerRadius.full)
                            }
                        }

                        // Play/Pause button
                        Button(action: toggleTimer) {
                            Image(systemName: isActive ? "pause.fill" : "play.fill")
                                .font(.system(size: 32))
                                .foregroundColor(.cream)
                                .frame(width: 80, height: 80)
                                .background(
                                    LinearGradient(
                                        gradient: Gradient(colors: [.naviaAccent, .clay600]),
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .cornerRadius(CornerRadius.full)
                                .shadow(color: Color.naviaAccent.opacity(0.3), radius: 10, x: 0, y: 5)
                        }
                    }
                    .padding(.bottom, Spacing.xl)
                }
                .padding(Spacing.screenPadding)
            }
            .navigationTitle("Focus Mode")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func toggleTimer() {
        if isActive {
            pauseTimer()
        } else {
            startTimer()
        }
    }

    private func startTimer() {
        isActive = true
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if timeRemaining > 0 {
                timeRemaining -= 1
            } else {
                completeSession()
            }
        }
    }

    private func pauseTimer() {
        isActive = false
        timer?.invalidate()
        timer = nil
    }

    private func resetTimer() {
        pauseTimer()
        timeRemaining = totalTime
    }

    private func completeSession() {
        pauseTimer()
        // TODO: Show completion celebration
        // TODO: Log focus session to backend
    }
}

#Preview {
    FocusView()
}
