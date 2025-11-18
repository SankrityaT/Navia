//
//  SignUpView.swift
//  navia-app
//
//  Sign up screen matching web app design
//

import SwiftUI

struct SignUpView: View {
    @StateObject private var authManager = AuthManager.shared
    @Environment(\.dismiss) private var dismiss

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var showPassword = false
    @State private var showError = false
    @State private var errorMessage = ""

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
                    NaviaAvatar(size: 100, showPulse: true)

                    // Title
                    VStack(spacing: Spacing.xs) {
                        Text("Join Navia")
                            .font(.naviaDisplayLarge)
                            .foregroundColor(.naviaForeground)

                        Text("Your AI executive function coach 💛")
                            .font(.naviaBody)
                            .foregroundColor(.naviaMuted)
                            .multilineTextAlignment(.center)
                    }

                    // Form
                    VStack(spacing: Spacing.md) {
                        // First Name
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("First Name")
                                .font(.naviaCallout)
                                .foregroundColor(.naviaForeground)
                                .fontWeight(.medium)

                            TextField("Your first name", text: $firstName)
                                .textContentType(.givenName)
                                .autocapitalization(.words)
                                .padding(Spacing.md)
                                .background(Color.white)
                                .cornerRadius(CornerRadius.lg)
                                .overlay(
                                    RoundedRectangle(cornerRadius: CornerRadius.lg)
                                        .stroke(Color.sage300, lineWidth: 1)
                                )
                        }

                        // Last Name
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("Last Name")
                                .font(.naviaCallout)
                                .foregroundColor(.naviaForeground)
                                .fontWeight(.medium)

                            TextField("Your last name", text: $lastName)
                                .textContentType(.familyName)
                                .autocapitalization(.words)
                                .padding(Spacing.md)
                                .background(Color.white)
                                .cornerRadius(CornerRadius.lg)
                                .overlay(
                                    RoundedRectangle(cornerRadius: CornerRadius.lg)
                                        .stroke(Color.sage300, lineWidth: 1)
                                )
                        }

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
                                    TextField("At least 8 characters", text: $password)
                                        .textContentType(.newPassword)
                                } else {
                                    SecureField("At least 8 characters", text: $password)
                                        .textContentType(.newPassword)
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

                        // Confirm Password
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            Text("Confirm Password")
                                .font(.naviaCallout)
                                .foregroundColor(.naviaForeground)
                                .fontWeight(.medium)

                            SecureField("Re-enter password", text: $confirmPassword)
                                .textContentType(.newPassword)
                                .padding(Spacing.md)
                                .background(Color.white)
                                .cornerRadius(CornerRadius.lg)
                                .overlay(
                                    RoundedRectangle(cornerRadius: CornerRadius.lg)
                                        .stroke(passwordsMatch ? Color.sage300 : Color.red, lineWidth: 1)
                                )
                        }

                        // Error message
                        if showError {
                            Text(errorMessage)
                                .font(.naviaCaption)
                                .foregroundColor(.red)
                                .padding(Spacing.sm)
                                .background(Color.red.opacity(0.1))
                                .cornerRadius(CornerRadius.md)
                        }

                        // Sign up button
                        Button(action: handleSignUp) {
                            if authManager.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Create Account")
                                    .font(.naviaHeadline)
                                    .fontWeight(.bold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Spacing.md)
                        .background(Color.clay500)
                        .foregroundColor(.white)
                        .cornerRadius(CornerRadius.full)
                        .disabled(!isFormValid || authManager.isLoading)
                        .opacity((!isFormValid || authManager.isLoading) ? 0.6 : 1.0)
                    }
                    .padding(.horizontal, Spacing.xl)

                    // Sign in link
                    HStack(spacing: 4) {
                        Text("Already have an account?")
                            .font(.naviaCallout)
                            .foregroundColor(.naviaMuted)

                        Button(action: { dismiss() }) {
                            Text("Sign in")
                                .font(.naviaCallout)
                                .foregroundColor(.clay600)
                                .fontWeight(.semibold)
                        }
                    }

                    Spacer()
                }
            }
        }
        .navigationBarHidden(true)
    }

    private var isFormValid: Bool {
        !firstName.isEmpty &&
        !lastName.isEmpty &&
        !email.isEmpty &&
        !password.isEmpty &&
        password.count >= 8 &&
        passwordsMatch
    }

    private var passwordsMatch: Bool {
        confirmPassword.isEmpty || password == confirmPassword
    }

    private func handleSignUp() {
        // Validate passwords match
        guard password == confirmPassword else {
            errorMessage = "Passwords don't match"
            showError = true
            return
        }

        // Validate password length
        guard password.count >= 8 else {
            errorMessage = "Password must be at least 8 characters"
            showError = true
            return
        }

        showError = false

        Task {
            do {
                try await authManager.signUp(
                    email: email,
                    password: password,
                    firstName: firstName,
                    lastName: lastName
                )

                // Success - dismiss to go to main app
                await MainActor.run {
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    errorMessage = authManager.errorMessage ?? "Sign up failed"
                    showError = true
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        SignUpView()
    }
}
