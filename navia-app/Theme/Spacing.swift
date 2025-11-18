//
//  Spacing.swift
//  navia-app
//
//  Consistent spacing system matching web app
//

import SwiftUI

struct Spacing {
    // Base unit: 4px
    static let xxxs: CGFloat = 2
    static let xxs: CGFloat = 4
    static let xs: CGFloat = 8
    static let sm: CGFloat = 12
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
    static let xxl: CGFloat = 48
    static let xxxl: CGFloat = 64

    // Common use cases
    static let cardPadding: CGFloat = md
    static let sectionPadding: CGFloat = lg
    static let screenPadding: CGFloat = md
    static let buttonPadding: CGFloat = md
    static let iconSize: CGFloat = 24
}

struct CornerRadius {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
    static let xxl: CGFloat = 32
    static let full: CGFloat = 999
}
