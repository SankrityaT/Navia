//
//  Typography.swift
//  navia-app
//
//  Font system matching web app (DM Sans + Fraunces)
//

import SwiftUI

extension Font {
    // MARK: - DM Sans (Body Font)
    // iOS uses SF Pro as fallback, with custom styling to match DM Sans feel

    static let naviaLargeTitle = Font.system(size: 34, weight: .bold, design: .rounded)
    static let naviaTitle1 = Font.system(size: 28, weight: .semibold, design: .rounded)
    static let naviaTitle2 = Font.system(size: 22, weight: .semibold, design: .rounded)
    static let naviaTitle3 = Font.system(size: 20, weight: .semibold, design: .rounded)

    static let naviaHeadline = Font.system(size: 17, weight: .semibold, design: .rounded)
    static let naviaBody = Font.system(size: 17, weight: .regular, design: .rounded)
    static let naviaCallout = Font.system(size: 16, weight: .regular, design: .rounded)
    static let naviaSubheadline = Font.system(size: 15, weight: .regular, design: .rounded)
    static let naviaFootnote = Font.system(size: 13, weight: .regular, design: .rounded)
    static let naviaCaption = Font.system(size: 12, weight: .regular, design: .rounded)
    static let naviaCaption2 = Font.system(size: 11, weight: .regular, design: .rounded)

    // MARK: - Fraunces-style (Serif/Display Font)
    // Using .serif design for headings to match Fraunces

    static let naviaDisplayLarge = Font.system(size: 40, weight: .bold, design: .serif)
    static let naviaDisplayMedium = Font.system(size: 32, weight: .semibold, design: .serif)
    static let naviaDisplaySmall = Font.system(size: 24, weight: .medium, design: .serif)
}

// MARK: - Text Styles for Consistency
struct NaviaTextStyle {
    // Hero/Landing
    static let hero = Font.naviaDisplayLarge
    static let heroSubtitle = Font.naviaTitle2

    // Dashboard
    static let sectionTitle = Font.naviaTitle3
    static let cardTitle = Font.naviaHeadline
    static let cardBody = Font.naviaBody

    // Chat
    static let chatMessage = Font.naviaBody
    static let chatTimestamp = Font.naviaCaption

    // Tasks
    static let taskTitle = Font.naviaCallout
    static let taskMeta = Font.naviaFootnote

    // Buttons
    static let buttonPrimary = Font.naviaHeadline
    static let buttonSecondary = Font.naviaCallout
}
