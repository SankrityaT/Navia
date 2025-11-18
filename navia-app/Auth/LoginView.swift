//
//  LoginView.swift
//  navia-app
//
//  Login screen matching web app design
//

import SwiftUI

struct LoginView: View {
    @StateObject private var authManager = AuthManager.shared
    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false
    @State private var showError = false

    var body: some View {
        ZStack {
            // Background gradient matching web
            LinearGradient(
                gradient: Gradient(colors: [.cream, .sand, .clay50]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: Spacing.xl) {
                    Spacer().frame(height: 60)

                    // Navia Avatar
                    NaviaAvatar(size: 120, showPulse: true)

                    // Title
                    VStack(spacing: Spacing.xs) {
                        Text("Welcome back")
                            .font(.naviaDisplayLarge)
                            .foregroundColor(.naviaForeground)

                        Text("Sign in to continue with Navia 💛")
                            .font(.naviaBody)
                            .foregroundColor(.naviaMuted)
                            .multilineTextAlignment(.center)
                    }

                    // Form
                    VStack(spacing: Spacing.md) {
                        // Email
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("Email")
                                .font(.naviaCallout)
                                .foregroundColor(.naviaForeground)
                                .fontWeight(.medium)

                            TextField("your@email.com", text: $email)
                                .textContentType(.emailAddress)
                                .autocapitalization(.none)
                                .keyboardType(.emailAddress)
                                .padding(Spacing.md)
                                .background(Color.white)
                                .cornerRadius(CornerRadius.lg)
                                .overlay(
                                    RoundedRectangle(cornerRadius: CornerRadius.lg)
                                        .stroke(Color.sage300, lineWidth: 1)
                                )
                        }

                        // Password
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("Password")
                                .font(.naviaCallout)
                                .foregroundColor(.naviaForeground)
                                .fontWeight(.medium)

                            HStack {
                                if showPassword {
                                    TextField("Enter your password", text: $password)
                                        .textContentType(.password)
                                } else {
                                    SecureField("Enter your password", text: $password)
                                        .textContentType(.password)
                                }

                                Button(action: { showPassword.toggle() }) {
                                    Image(systemName: showPassword ? "eye.slash" : "eye")
                                        .foregroundColor(.sage500)
                                }
                            }
                            .padding(Spacing.md)
                            .background(Color.white)
                            .cornerRadius(CornerRadius.lg)
                            .overlay(
                                RoundedRectangle(cornerRadius: CornerRadius.lg)
                                    .stroke(Color.sage300, lineWidth: 1)
                            )
                        }

                        // Error message
                        if showError, let error = authManager.errorMessage {
                            Text(error)
                                .font(.naviaCaption)
                                .foregroundColor(.red)
                                .padding(Spacing.sm)
                                .background(Color.red.opacity(0.1))
                                .cornerRadius(CornerRadius.md)
                        }

                        // Sign in button
                        Button(action: handleSignIn) {
                            if authManager.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Sign In")
                                    .font(.naviaHeadline)
                                    .fontWeight(.bold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Spacing.md)
                        .background(Color.clay500)
                        .foregroundColor(.white)
                        .cornerRadius(CornerRadius.full)
                        .disabled(authManager.isLoading || email.isEmpty || password.isEmpty)
                        .opacity((authManager.isLoading || email.isEmpty || password.isEmpty) ? 0.6 : 1.0)

                        // Forgot password
                        Button(action: {}) {
                            Text("Forgot password?")
                                .font(.naviaCallout)
                                .foregroundColor(.clay600)
                        }
                    }
                    .padding(.horizontal, Spacing.xl)

                    // Divider
                    HStack {
                        Rectangle()
                            .frame(height: 1)
                            .foregroundColor(.sage200)
                        Text("or")
                            .font(.naviaCaption)
                            .foregroundColor(.naviaMuted)
                            .padding(.horizontal, Spacing.sm)
                        Rectangle()
                            .frame(height: 1)
                            .foregroundColor(.sage200)
                    }
                    .padding(.horizontal, Spacing.xl)

                    // Sign up link
                    HStack(spacing: 4) {
                        Text("Don't have an account?")
                            .font(.naviaCallout)
                            .foregroundColor(.naviaMuted)

                        NavigationLink(destination: SignUpView()) {
                            Text("Sign up")
                                .font(.naviaCallout)
                                .foregroundColor(.clay600)
                                .fontWeight(.semibold)
                        }
                    }

                    Spacer()
                }
            }
        }
    }

    private func handleSignIn() {
        showError = false

        Task {
            do {
                try await authManager.signIn(email: email, password: password)
            } catch {
                showError = true
            }
        }
    }
}

#Preview {
    NavigationView {
        LoginView()
    }
}
