//
//  FocusView.swift
//  navia-app
//
//  Focus mode matching web app - full featured
//

import SwiftUI

struct FocusView: View {
    @State private var isActive = false
    @State private var timeRemaining: TimeInterval = 25 * 60
    @State private var totalTime: TimeInterval = 25 * 60
    @State private var selectedDuration: FocusDuration = .twentyFive
    @State private var timer: Timer?
    @State private var isPaused = false
    @State private var focusIntention = ""
    @State private var selectedTask: String? = nil
    @State private var showingSetup = false
    @State private var isImmersive = false

    enum FocusDuration: Int, CaseIterable, Identifiable {
        case fifteen = 15
        case twentyFive = 25
        case fortyFive = 45
        case sixty = 60

        var id: Int { rawValue }

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
        if isImmersive && isActive {
            ImmersiveFocusView(
                timeRemaining: $timeRemaining,
                totalTime: totalTime,
                focusTask: focusIntention,
                isPaused: $isPaused,
                onPause: togglePause,
                onEnd: endSession,
                onAddTime: addTime,
                onMinimize: { isImmersive = false }
            )
        } else {
            normalFocusView
        }
    }

    var normalFocusView: some View {
        NavigationView {
            ZStack {
                Color.naviaBackground.ignoresSafeArea()

                ScrollView(showsIndicators: false) {
                    VStack(spacing: Spacing.xl) {
                        if !isActive {
                            // Not active - show inspirational cards and setup
                            VStack(spacing: Spacing.lg) {
                                // Inspirational Cards
                                HStack(spacing: Spacing.md) {
                                    VStack(alignment: .leading, spacing: Spacing.xs) {
                                        Text("🌊 Take your time")
                                            .font(.naviaCallout)
                                            .fontWeight(.semibold)
                                            .foregroundColor(.sage800)
                                        Text("Progress over perfection")
                                            .font(.naviaCaption)
                                            .foregroundColor(.sage700)
                                    }
                                    .padding(Spacing.md)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(
                                        LinearGradient(
                                            gradient: Gradient(colors: [.sage50, .sage100]),
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .cornerRadius(CornerRadius.xl)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: CornerRadius.xl)
                                            .stroke(Color.sage200, lineWidth: 1)
                                    )

                                    VStack(alignment: .leading, spacing: Spacing.xs) {
                                        Text("💛 You're not alone")
                                            .font(.naviaCallout)
                                            .fontWeight(.semibold)
                                            .foregroundColor(.clay800)
                                        Text("I'm here for you")
                                            .font(.naviaCaption)
                                            .foregroundColor(.clay700)
                                    }
                                    .padding(Spacing.md)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(
                                        LinearGradient(
                                            gradient: Gradient(colors: [.clay50, .clay100]),
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .cornerRadius(CornerRadius.xl)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: CornerRadius.xl)
                                            .stroke(Color.clay200, lineWidth: 1)
                                    )
                                }

                                // Setup Card
                                NaviaCard {
                                    VStack(spacing: Spacing.lg) {
                                        Text("What do you want to focus on?")
                                            .font(.naviaTitle3)
                                            .foregroundColor(.naviaForeground)

                                        TextField("e.g., Reading for 25 minutes...", text: $focusIntention)
                                            .font(.naviaBody)
                                            .padding(Spacing.md)
                                            .background(Color.cream)
                                            .cornerRadius(CornerRadius.lg)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: CornerRadius.lg)
                                                    .stroke(Color.stone, lineWidth: 2)
                                            )

                                        VStack(alignment: .leading, spacing: Spacing.sm) {
                                            Text("How long do you want to focus?")
                                                .font(.naviaCallout)
                                                .fontWeight(.semibold)
                                                .foregroundColor(.naviaForeground)

                                            HStack(spacing: Spacing.sm) {
                                                ForEach(FocusDuration.allCases) { duration in
                                                    Button(action: {
                                                        selectedDuration = duration
                                                        totalTime = duration.seconds
                                                        timeRemaining = duration.seconds
                                                    }) {
                                                        Text(duration.displayName)
                                                            .font(.naviaCallout)
                                                            .fontWeight(.semibold)
                                                            .foregroundColor(selectedDuration == duration ? .cream : .naviaForeground)
                                                            .padding(.horizontal, Spacing.md)
                                                            .padding(.vertical, Spacing.sm)
                                                            .frame(maxWidth: .infinity)
                                                            .background(selectedDuration == duration ? Color.naviaAccent : Color.sand)
                                                            .cornerRadius(CornerRadius.lg)
                                                    }
                                                }
                                            }
                                        }

                                        NaviaButton(title: "Let's Focus!", style: .primary) {
                                            startSession()
                                        }
                                        .disabled(focusIntention.isEmpty)
                                    }
                                }
                            }
                        } else {
                            // Active - show timer
                            VStack(spacing: Spacing.xl) {
                                Text("Focusing on:")
                                    .font(.naviaCallout)
                                    .foregroundColor(.sage600)

                                Text(focusIntention)
                                    .font(.naviaTitle2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.clay700)
                                    .multilineTextAlignment(.center)

                                // Timer Circle
                                ZStack {
                                    Circle()
                                        .stroke(Color.stone, lineWidth: 20)
                                        .frame(width: 280, height: 280)

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

                                    VStack(spacing: Spacing.sm) {
                                        Text(formattedTime)
                                            .font(.system(size: 64, weight: .bold, design: .rounded))
                                            .foregroundColor(.naviaForeground)

                                        Text(isPaused ? "Paused" : "Stay focused")
                                            .font(.naviaCallout)
                                            .foregroundColor(.naviaMuted)
                                    }
                                }

                                // Music Player Placeholder
                                HStack(spacing: Spacing.sm) {
                                    Image(systemName: "music.note")
                                        .foregroundColor(.sage600)
                                    Text("Lofi Music Playing")
                                        .font(.naviaCallout)
                                        .foregroundColor(.sage700)
                                }
                                .padding(Spacing.md)
                                .frame(maxWidth: .infinity)
                                .background(Color.sage100)
                                .cornerRadius(CornerRadius.lg)

                                // Controls
                                VStack(spacing: Spacing.md) {
                                    HStack(spacing: Spacing.md) {
                                        NaviaButton(
                                            title: isPaused ? "Resume" : "Pause",
                                            style: .primary,
                                            action: togglePause
                                        )

                                        NaviaButton(
                                            title: "Maximize",
                                            style: .secondary,
                                            action: { isImmersive = true }
                                        )
                                    }

                                    HStack(spacing: Spacing.sm) {
                                        Button(action: { addTime(1) }) {
                                            Text("+1 min")
                                                .font(.naviaCallout)
                                                .foregroundColor(.sage700)
                                                .padding(.horizontal, Spacing.md)
                                                .padding(.vertical, Spacing.sm)
                                                .background(Color.sage100)
                                                .cornerRadius(CornerRadius.full)
                                        }

                                        Button(action: { addTime(5) }) {
                                            Text("+5 min")
                                                .font(.naviaCallout)
                                                .foregroundColor(.sage700)
                                                .padding(.horizontal, Spacing.md)
                                                .padding(.vertical, Spacing.sm)
                                                .background(Color.sage100)
                                                .cornerRadius(CornerRadius.full)
                                        }

                                        Button(action: { addTime(15) }) {
                                            Text("+15 min")
                                                .font(.naviaCallout)
                                                .foregroundColor(.sage700)
                                                .padding(.horizontal, Spacing.md)
                                                .padding(.vertical, Spacing.sm)
                                                .background(Color.sage100)
                                                .cornerRadius(CornerRadius.full)
                                        }
                                    }

                                    NaviaButton(
                                        title: "End Session",
                                        style: .outline,
                                        action: endSession
                                    )
                                }
                            }
                        }
                    }
                    .padding(Spacing.screenPadding)
                    .padding(.bottom, Spacing.xxxl)
                }
            }
            .navigationTitle("Focus Mode")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: - Actions
    private func startSession() {
        isActive = true
        isPaused = false
        startTimer()
    }

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if !isPaused && timeRemaining > 0 {
                timeRemaining -= 1
            } else if timeRemaining <= 0 {
                completeSession()
            }
        }
    }

    private func togglePause() {
        isPaused.toggle()
    }

    private func addTime(_ minutes: Int) {
        timeRemaining += TimeInterval(minutes * 60)
        totalTime += TimeInterval(minutes * 60)
    }

    private func endSession() {
        timer?.invalidate()
        timer = nil
        isActive = false
        isPaused = false
        timeRemaining = totalTime
        isImmersive = false
    }

    private func completeSession() {
        timer?.invalidate()
        timer = nil
        isActive = false
        isPaused = false
        // TODO: Show celebration
    }
}

// MARK: - Immersive Focus View
struct ImmersiveFocusView: View {
    @Binding var timeRemaining: TimeInterval
    let totalTime: TimeInterval
    let focusTask: String
    @Binding var isPaused: Bool
    let onPause: () -> Void
    let onEnd: () -> Void
    let onAddTime: (Int) -> Void
    let onMinimize: () -> Void

    var progress: Double {
        1 - (timeRemaining / totalTime)
    }

    var formattedTime: String {
        let minutes = Int(timeRemaining) / 60
        let seconds = Int(timeRemaining) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                gradient: Gradient(colors: [.clay50, .sage50, .cream]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: Spacing.xxxl) {
                Spacer()

                // Timer
                VStack(spacing: Spacing.lg) {
                    Text(formattedTime)
                        .font(.system(size: 96, weight: .bold, design: .rounded))
                        .foregroundColor(.naviaForeground)

                    Text(focusTask)
                        .font(.naviaTitle2)
                        .foregroundColor(.clay700)
                        .multilineTextAlignment(.center)

                    Text(isPaused ? "Paused" : "Stay focused 💛")
                        .font(.naviaBody)
                        .foregroundColor(.sage600)
                }

                Spacer()

                // Controls
                HStack(spacing: Spacing.lg) {
                    Button(action: onPause) {
                        Image(systemName: isPaused ? "play.fill" : "pause.fill")
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
                            .clipShape(Circle())
                    }

                    Button(action: onMinimize) {
                        Image(systemName: "arrow.down.right.and.arrow.up.left")
                            .font(.system(size: 20))
                            .foregroundColor(.naviaForeground)
                            .frame(width: 60, height: 60)
                            .background(Color.sand)
                            .clipShape(Circle())
                    }

                    Button(action: onEnd) {
                        Image(systemName: "xmark")
                            .font(.system(size: 20))
                            .foregroundColor(.naviaForeground)
                            .frame(width: 60, height: 60)
                            .background(Color.sand)
                            .clipShape(Circle())
                    }
                }
                .padding(.bottom, Spacing.xxxl)
            }
        }
    }
}

#Preview {
    FocusView()
}
