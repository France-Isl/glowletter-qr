import Foundation
import XCTest
@testable import NurPismo

final class PlatformPrivacyContractTests: XCTestCase {
    @MainActor
    func testIOSPlatformMarkerDisablesEverySocialLoginButKeepsEmail() {
        let bootstrap = WebViewContainer.Coordinator.platformBootstrap

        XCTAssertFalse(WebViewContainer.Coordinator.socialAuthenticationEnabled)
        XCTAssertTrue(bootstrap.contains("Object.defineProperty(window, 'NurPlatform'"))
        XCTAssertTrue(bootstrap.contains("os: 'ios'"))
        XCTAssertTrue(bootstrap.contains("emailAuthentication: true"))
        XCTAssertTrue(bootstrap.contains("socialAuthentication: false"))
        for buttonID in ["googleSignIn", "appleSignIn", "facebookSignIn", "supportSignInButton"] {
            XCTAssertTrue(bootstrap.contains(buttonID), buttonID)
        }
    }

    func testPrivacyManifestDeclaresFirstPartyCollectionWithoutTracking() throws {
        let url = try XCTUnwrap(Bundle.main.url(
            forResource: "PrivacyInfo",
            withExtension: "xcprivacy"
        ))
        let data = try Data(contentsOf: url)
        let object = try PropertyListSerialization.propertyList(from: data, format: nil)
        let manifest = try XCTUnwrap(object as? [String: Any])

        XCTAssertEqual(manifest["NSPrivacyTracking"] as? Bool, false)
        XCTAssertEqual(manifest["NSPrivacyTrackingDomains"] as? [String], [])
        XCTAssertTrue((manifest["NSPrivacyAccessedAPITypes"] as? [Any])?.isEmpty == true)

        let entries = try XCTUnwrap(manifest["NSPrivacyCollectedDataTypes"] as? [[String: Any]])
        let expected: Set<String> = [
            "NSPrivacyCollectedDataTypeName",
            "NSPrivacyCollectedDataTypeEmailAddress",
            "NSPrivacyCollectedDataTypeUserID",
            "NSPrivacyCollectedDataTypePurchaseHistory",
            "NSPrivacyCollectedDataTypeProductInteraction",
            "NSPrivacyCollectedDataTypeCustomerSupport",
            "NSPrivacyCollectedDataTypeOtherUserContent",
            "NSPrivacyCollectedDataTypeAudioData",
            "NSPrivacyCollectedDataTypePreciseLocation"
        ]
        XCTAssertEqual(Set(entries.compactMap { $0["NSPrivacyCollectedDataType"] as? String }), expected)
        for entry in entries {
            let type = try XCTUnwrap(entry["NSPrivacyCollectedDataType"] as? String)
            XCTAssertEqual(
                entry["NSPrivacyCollectedDataTypeLinked"] as? Bool,
                type != "NSPrivacyCollectedDataTypePreciseLocation"
            )
            XCTAssertEqual(entry["NSPrivacyCollectedDataTypeTracking"] as? Bool, false)
            XCTAssertEqual(
                entry["NSPrivacyCollectedDataTypePurposes"] as? [String],
                ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
            )
        }
    }

    func testLocationPermissionExplanationIsBundledForEverySupportedLanguage() throws {
        for language in ["en", "fr", "ru"] {
            let url = try XCTUnwrap(Bundle.main.url(
                forResource: "InfoPlist",
                withExtension: "strings",
                subdirectory: nil,
                localization: language
            ), language)
            let data = try Data(contentsOf: url)
            let object = try PropertyListSerialization.propertyList(from: data, format: nil)
            let strings = try XCTUnwrap(object as? [String: String])
            let explanation = try XCTUnwrap(strings["NSLocationWhenInUseUsageDescription"])
            XCTAssertGreaterThan(explanation.count, 40, language)
        }
    }
}
