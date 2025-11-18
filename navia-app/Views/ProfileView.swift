//
//  ProfileView.swift
//  navia-app
//
//  User profile view matching web app
//

import SwiftUI

struct ProfileView: View {
    @State private var profile: UserProfile = .mock
    @State private var isEditing = false

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: Spacing.lg) {
                    // Avatar and Name
                    VStack(spacing: Spacing.md) {
                        NaviaAvatar(size: 100, showPulse: false)

                        VStack(spacing: Spacing.xxs) {
                            Text(profile.name ?? "User")
                                .font(.naviaTitle1)
                                .foregroundColor(.naviaForeground)

                            Text(profile.email ?? "")
                                .font(.naviaCallout)
                                .foregroundColor(.naviaMuted)
                        }
                    }
                    .padding(.top, Spacing.lg)

                    // Stats Cards
                    HStack(spacing: Spacing.md) {
                        StatCard(
                            icon: "checkmark.circle.fill",
                            value: "12",
                            label: "Tasks Done",
                            color: .sage600
                        )

                        StatCard(
                            icon: "flame.fill",
                            value: "7",
                            label: "Day Streak",
                            color: .clay500
                        )

                        StatCard(
                            icon: "person.2.fill",
                            value: "3",
                            label: "Peers",
                            color: .moss500
                        )
                    }
                    .padding(.horizontal, Spacing.screenPadding)

                    // Profile Sections
                    VStack(spacing: Spacing.md) {
                        // Current Goals
                        if let goals = profile.currentGoals, !goals.isEmpty {
                            NaviaCard {
                                VStack(alignment: .leading, spacing: Spacing.sm) {
                                    Label("Current Goals", systemImage: "target")
                                        .font(.naviaHeadline)
                                        .foregroundColor(.naviaForeground)

                                    ForEach(goals, id: \.self) { goal in
                                        HStack {
                                            Circle()
                                                .fill(Color.naviaAccent)
                                                .frame(width: 6, height: 6)

                                            Text(goal)
                                                .font(.naviaCallout)
                                                .foregroundColor(.naviaForeground)
                                        }
                                    }
                                }
                            }
                        }

                        // Interests
                        if let interests = profile.interests, !interests.isEmpty {
                            NaviaCard {
                                VStack(alignment: .leading, spacing: Spacing.sm) {
                                    Label("Interests", systemImage: "star.fill")
                                        .font(.naviaHeadline)
                                        .foregroundColor(.naviaForeground)

                                    FlowLayout(spacing: Spacing.xs) {
                                        ForEach(interests, id: \.self) { interest in
                                            Text(interest)
                                                .font(.naviaCallout)
                                                .foregroundColor(.naviaAccent)
                                                .padding(.horizontal, Spacing.sm)
                                                .padding(.vertical, Spacing.xs)
                                                .background(Color.clay100)
                                                .cornerRadius(CornerRadius.full)
                                        }
                                    }
                                }
                            }
                        }

                        // Job Field
                        if let jobField = profile.jobField {
                            NaviaCard {
                                HStack {
                                    Label("Career Focus", systemImage: "briefcase.fill")
                                        .font(.naviaHeadline)
                                        .foregroundColor(.naviaForeground)

                                    Spacer()

                                    Text(jobField)
                                        .font(.naviaCallout)
                                        .foregroundColor(.naviaMuted)
                                }
                            }
                        }

                        // Edit Profile Button
                        NaviaButton(title: "Edit Profile", style: .outline) {
                            isEditing = true
                        }
                    }
                    .padding(.horizontal, Spacing.screenPadding)

                    // Settings Section
                    VStack(spacing: Spacing.md) {
                        SettingsRow(icon: "bell.fill", title: "Notifications", color: .clay400)
                        SettingsRow(icon: "lock.fill", title: "Privacy", color: .sage500)
                        SettingsRow(icon: "questionmark.circle.fill", title: "Help & Support", color: .moss500)
                        SettingsRow(icon: "arrow.right.square.fill", title: "Sign Out", color: .charcoal)
                    }
                    .padding(.horizontal, Spacing.screenPadding)
                }
                .padding(.bottom, Spacing.xl)
            }
            .background(Color.naviaBackground)
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $isEditing) {
                EditProfileView(profile: $profile)
            }
        }
    }
}

// MARK: - Stat Card
struct StatCard: View {
    let icon: String
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(color)

            Text(value)
                .font(.naviaTitle2)
                .foregroundColor(.naviaForeground)

            Text(label)
                .font(.naviaCaption)
                .foregroundColor(.naviaMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(Spacing.md)
        .background(Color.sand)
        .cornerRadius(CornerRadius.lg)
    }
}

// MARK: - Settings Row
struct SettingsRow: View {
    let icon: String
    let title: String
    let color: Color

    var body: some View {
        HStack(spacing: Spacing.md) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(color)
                .frame(width: 32)

            Text(title)
                .font(.naviaCallout)
                .foregroundColor(.naviaForeground)

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 14))
                .foregroundColor(.sage400)
        }
        .padding(Spacing.md)
        .background(Color.sand)
        .cornerRadius(CornerRadius.lg)
    }
}

// MARK: - Flow Layout
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(in: proposal.width ?? 0, subviews: subviews, spacing: spacing)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(in: bounds.width, subviews: subviews, spacing: spacing)
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.frames[index].minX, y: bounds.minY + result.frames[index].minY), proposal: ProposedViewSize(result.frames[index].size))
        }
    }

    struct FlowResult {
        var frames: [CGRect] = []
        var size: CGSize = .zero

        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var currentX: CGFloat = 0
            var currentY: CGFloat = 0
            var lineHeight: CGFloat = 0

            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)

                if currentX + size.width > maxWidth && currentX > 0 {
                    currentX = 0
                    currentY += lineHeight + spacing
                    lineHeight = 0
                }

                frames.append(CGRect(origin: CGPoint(x: currentX, y: currentY), size: size))
                currentX += size.width + spacing
                lineHeight = max(lineHeight, size.height)
            }

            self.size = CGSize(width: maxWidth, height: currentY + lineHeight)
        }
    }
}

// MARK: - Edit Profile View (Stub)
struct EditProfileView: View {
    @Binding var profile: UserProfile
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            Form {
                Section("Basic Info") {
                    TextField("Name", text: Binding(
                        get: { profile.name ?? "" },
                        set: { profile.name = $0 }
                    ))
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        // TODO: Save to backend
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    ProfileView()
}
