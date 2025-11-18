// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "navia-app",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "navia-app",
            targets: ["navia-app"]
        )
    ],
    dependencies: [
        // Clerk iOS SDK for authentication
        .package(url: "https://github.com/clerk/clerk-ios", from: "0.3.0")
    ],
    targets: [
        .target(
            name: "navia-app",
            dependencies: [
                .product(name: "ClerkSDK", package: "clerk-ios")
            ]
        )
    ]
)
