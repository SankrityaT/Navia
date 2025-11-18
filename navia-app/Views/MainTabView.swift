//
//  MainTabView.swift
//  navia-app
//
//  Main tab navigation matching web app structure
//

import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "square.grid.2x2")
                }
                .tag(0)

            TasksView()
                .tabItem {
                    Label("Tasks", systemImage: "checklist")
                }
                .tag(1)

            ChatView()
                .tabItem {
                    Label("Chat", systemImage: "message")
                }
                .tag(2)

            FocusView()
                .tabItem {
                    Label("Focus", systemImage: "timer")
                }
                .tag(3)

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.circle")
                }
                .tag(4)
        }
        .accentColor(.naviaAccent)
    }
}

#Preview {
    MainTabView()
}
