//
//  EnergySlider.swift
//  navia-app
//
//  Energy level slider (1-10) matching web app
//

import SwiftUI

struct EnergySlider: View {
    @Binding var energyLevel: Double
    let onChange: (Int) -> Void

    var energyEmoji: String {
        switch Int(energyLevel) {
        case 1...2: return "😴"
        case 3...4: return "😔"
        case 5...6: return "😐"
        case 7...8: return "🙂"
        case 9...10: return "🤩"
        default: return "😐"
        }
    }

    var energyLabel: String {
        switch Int(energyLevel) {
        case 1...2: return "Exhausted"
        case 3...4: return "Low Energy"
        case 5...6: return "Okay"
        case 7...8: return "Good Energy"
        case 9...10: return "Energized!"
        default: return "Okay"
        }
    }

    var body: some View {
        NaviaCard {
            VStack(spacing: Spacing.md) {
                HStack {
                    Text("How are you feeling?")
                        .font(.naviaHeadline)
                        .foregroundColor(.naviaForeground)

                    Spacer()

                    Text(energyEmoji)
                        .font(.system(size: 32))
                }

                VStack(spacing: Spacing.xs) {
                    Text(energyLabel)
                        .font(.naviaCallout)
                        .foregroundColor(.naviaMuted)

                    Slider(value: $energyLevel, in: 1...10, step: 1)
                        .accentColor(.naviaAccent)
                        .onChange(of: energyLevel) { _, newValue in
                            onChange(Int(newValue))
                        }

                    HStack {
                        Text("1")
                            .font(.naviaCaption)
                            .foregroundColor(.naviaMuted)

                        Spacer()

                        Text(String(Int(energyLevel)))
                            .font(.naviaHeadline)
                            .foregroundColor(.naviaAccent)

                        Spacer()

                        Text("10")
                            .font(.naviaCaption)
                            .foregroundColor(.naviaMuted)
                    }
                }
            }
        }
    }
}

// MARK: - Preview
#Preview {
    EnergySlider(energyLevel: .constant(6)) { level in
        print("Energy level: \(level)")
    }
    .padding()
    .background(Color.naviaBackground)
}
