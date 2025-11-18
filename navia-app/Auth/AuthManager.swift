//
//  AuthManager.swift
//  navia-app
//
//  Authentication manager using Clerk iOS SDK
//

import Foundation
import ClerkSDK
import SwiftUI

@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()

    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var authToken: String?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private init() {
        checkAuthStatus()
    }

    // MARK: - Clerk Setup
    func configure() {
        // Configure Clerk with publishable key from environment
        let publishableKey = AppEnvironment.clerkPublishableKey

        if publishableKey.isEmpty {
            print("⚠️ Clerk publishable key not configured")
            return
        }

        // Initialize Clerk SDK
        Clerk.configure(publishableKey: publishableKey)

        // Check if user is already signed in
        checkAuthStatus()
    }

    // MARK: - Auth Status
    private func checkAuthStatus() {
        isLoading = true

        Task {
            do {
                // Check Clerk session
                if let session = Clerk.shared.session {
                    // Get auth token
                    let token = try await session.getToken()

                    await MainActor.run {
                        self.authToken = token
                        self.currentUser = Clerk.shared.user
                        self.isAuthenticated = true

                        // Pass token to API client
                        APIClient.shared.setAuthToken(token)

                        if AppEnvironment.isDebug {
                            print("✅ User authenticated: \(Clerk.shared.user?.emailAddress ?? "unknown")")
                        }
                    }
                } else {
                    await MainActor.run {
                        self.isAuthenticated = false
                        self.authToken = nil
                        self.currentUser = nil
                    }
                }

                await MainActor.run {
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = "Authentication check failed: \(error.localizedDescription)"

                    if AppEnvironment.isDebug {
                        print("❌ Auth check failed: \(error)")
                    }
                }
            }
        }
    }

    // MARK: - Sign In
    func signIn(email: String, password: String) async throws {
        isLoading = true
        errorMessage = nil

        do {
            // Sign in with Clerk
            try await Clerk.shared.signIn(
                strategy: .identifier(email, password: password)
            )

            // Get session token
            if let session = Clerk.shared.session {
                let token = try await session.getToken()

                await MainActor.run {
                    self.authToken = token
                    self.currentUser = Clerk.shared.user
                    self.isAuthenticated = true
                    self.isLoading = false

                    // Pass token to API client
                    APIClient.shared.setAuthToken(token)

                    if AppEnvironment.isDebug {
                        print("✅ Sign in successful: \(email)")
                    }
                }
            }
        } catch {
            await MainActor.run {
                self.isLoading = false
                self.errorMessage = error.localizedDescription

                if AppEnvironment.isDebug {
                    print("❌ Sign in failed: \(error)")
                }
            }
            throw error
        }
    }

    // MARK: - Sign Up
    func signUp(email: String, password: String, firstName: String, lastName: String) async throws {
        isLoading = true
        errorMessage = nil

        do {
            // Create Clerk account
            try await Clerk.shared.signUp(
                strategy: .standard(
                    emailAddress: email,
                    password: password,
                    firstName: firstName,
                    lastName: lastName
                )
            )

            // Get session token
            if let session = Clerk.shared.session {
                let token = try await session.getToken()

                await MainActor.run {
                    self.authToken = token
                    self.currentUser = Clerk.shared.user
                    self.isAuthenticated = true
                    self.isLoading = false

                    // Pass token to API client
                    APIClient.shared.setAuthToken(token)

                    if AppEnvironment.isDebug {
                        print("✅ Sign up successful: \(email)")
                    }
                }
            }
        } catch {
            await MainActor.run {
                self.isLoading = false
                self.errorMessage = error.localizedDescription

                if AppEnvironment.isDebug {
                    print("❌ Sign up failed: \(error)")
                }
            }
            throw error
        }
    }

    // MARK: - Sign Out
    func signOut() async {
        isLoading = true

        do {
            try await Clerk.shared.signOut()

            await MainActor.run {
                self.isAuthenticated = false
                self.authToken = nil
                self.currentUser = nil
                self.isLoading = false

                // Clear API client token
                APIClient.shared.setAuthToken("")

                if AppEnvironment.isDebug {
                    print("✅ Sign out successful")
                }
            }
        } catch {
            await MainActor.run {
                self.isLoading = false
                self.errorMessage = "Sign out failed: \(error.localizedDescription)"

                if AppEnvironment.isDebug {
                    print("❌ Sign out failed: \(error)")
                }
            }
        }
    }

    // MARK: - Token Refresh
    func refreshToken() async throws -> String {
        guard let session = Clerk.shared.session else {
            throw NSError(domain: "AuthManager", code: 401, userInfo: [
                NSLocalizedDescriptionKey: "No active session"
            ])
        }

        let token = try await session.getToken()

        await MainActor.run {
            self.authToken = token
            APIClient.shared.setAuthToken(token)
        }

        return token
    }
}
