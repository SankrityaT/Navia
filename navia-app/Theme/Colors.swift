//
//  Colors.swift
//  navia-app
//
//  Design system matching web app color palette
//

import SwiftUI

extension Color {
    // MARK: - Clay Palette (Terracotta & Clay)
    static let clay50 = Color(hex: "FBF7F4")
    static let clay100 = Color(hex: "F5EBE3")
    static let clay200 = Color(hex: "EDD9C8")
    static let clay300 = Color(hex: "E3BFA3")
    static let clay400 = Color(hex: "D89B76")
    static let clay500 = Color(hex: "C97D56")
    static let clay600 = Color(hex: "B4633F")
    static let clay700 = Color(hex: "8F4D31")
    static let clay800 = Color(hex: "6B3923")
    static let clay900 = Color(hex: "4A2718")

    // MARK: - Sage & Earth Accents
    static let sage100 = Color(hex: "E8EDE6")
    static let sage200 = Color(hex: "D1DCC9")
    static let sage300 = Color(hex: "B9CAAF")
    static let sage400 = Color(hex: "A8B5A0")
    static let sage500 = Color(hex: "8A9B80")
    static let sage600 = Color(hex: "6D7F63")
    static let sage700 = Color(hex: "586650")
    static let moss500 = Color(hex: "5C6E52")
    static let moss600 = Color(hex: "4A5A42")

    // MARK: - Warm Neutrals
    static let cream = Color(hex: "FFFBF7")
    static let sand = Color(hex: "F7F1EA")
    static let stone = Color(hex: "E8DFD6")
    static let charcoal = Color(hex: "3D3935")

    // MARK: - Semantic Colors
    static let naviaBackground = Color.cream
    static let naviaForeground = Color.charcoal
    static let naviaAccent = Color.clay500
    static let naviaAccentHover = Color.clay600
    static let naviaMuted = Color.sage500

    // MARK: - Helper for Hex Colors
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
