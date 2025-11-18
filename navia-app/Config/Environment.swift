//
//  Environment.swift
//  navia-app
//
//  Environment configuration for API endpoints
//

import Foundation

enum Environment {
    static var apiBaseURL: String {
        // Check for environment variable first (for local dev)
        if let envURL = ProcessInfo.processInfo.environment["NAVIA_API_URL"] {
            return envURL
        }

        // Default to production
        #if DEBUG
        return "http://localhost:3000" // Local Next.js dev server
        #else
        return "https://navia.app" // Production
        #endif
    }

    static var supabaseURL: String {
        ProcessInfo.processInfo.environment["SUPABASE_URL"] ?? ""
    }

    static var supabaseAnonKey: String {
        ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"] ?? ""
    }

    static var clerkPublishableKey: String {
        ProcessInfo.processInfo.environment["CLERK_PUBLISHABLE_KEY"] ?? ""
    }

    static var isDebug: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }

    static func printConfiguration() {
        print("🔧 Environment Configuration:")
        print("   API Base URL: \(apiBaseURL)")
        print("   Debug Mode: \(isDebug)")
        print("   Supabase URL: \(supabaseURL.isEmpty ? "Not configured" : "Configured ✅")")
        print("   Clerk Key: \(clerkPublishableKey.isEmpty ? "Not configured" : "Configured ✅")")
    }
}
