//
//  ContentView.swift
//  navia-app
//
//  Main app entry point with authentication flow
//

import SwiftUI

struct ContentView: View {
    @StateObject private var authManager = AuthManager.shared

    var body: some View {
        Group {
            if authManager.isLoading {
                // Loading screen
                ZStack {
                    Color.naviaBackground.ignoresSafeArea()

                    VStack(spacing: Spacing.xl) {
                        NaviaAvatar(size: 120, showPulse: true)

                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .clay500))

                        Text("Loading...")
                            .font(.naviaBody)
                            .foregroundColor(.naviaMuted)
                    }
                }
            } else if authManager.isAuthenticated {
                // Main app with tabs
                TabView {
                    DashboardView()
                        .tabItem {
                            Label("Dashboard", systemImage: "square.grid.2x2")
                        }

                    TasksView()
                        .tabItem {
                            Label("Tasks", systemImage: "checkmark.circle")
                        }

                    ChatView()
                        .tabItem {
                            Label("Chat", systemImage: "message")
                        }

                    FocusView()
                        .tabItem {
                            Label("Focus", systemImage: "timer")
                        }

                    ProfileView()
                        .tabItem {
                            Label("Profile", systemImage: "person")
                        }
                }
                .accentColor(.naviaAccent)
            } else {
                // Login screen
                NavigationView {
                    LoginView()
                }
            }
        }
        .onAppear {
            authManager.configure()
        }
    }
}

#Preview {
    ContentView()
}
