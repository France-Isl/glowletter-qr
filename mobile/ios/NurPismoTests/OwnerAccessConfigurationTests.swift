import XCTest
@testable import NurPismo

final class OwnerAccessConfigurationTests: XCTestCase {
    private let capability = "unit_test_capability_1234567890-ABCDEFGH"

    func testSanitizeAcceptsOnlyLongBase64URLValues() {
        XCTAssertEqual(OwnerAccessConfiguration.sanitize(capability), capability)
        XCTAssertEqual(OwnerAccessConfiguration.sanitize(""), "")
        XCTAssertEqual(OwnerAccessConfiguration.sanitize("short"), "")
        XCTAssertEqual(OwnerAccessConfiguration.sanitize("\(capability)#admin=true"), "")
        XCTAssertEqual(OwnerAccessConfiguration.sanitize("\(capability)\nextra"), "")
    }

    func testOwnerLaunchURLUsesFragmentWithoutChangingTheFilePath() throws {
        let index = URL(fileURLWithPath: "/tmp/GlowLetter Web/index.html")
        let launchURL = OwnerAccessConfiguration.launchURL(for: index, capability: capability)

        XCTAssertEqual(launchURL.standardizedFileURL.path, index.standardizedFileURL.path)
        XCTAssertEqual(launchURL.fragment, "access=\(capability)")
        XCTAssertTrue(OwnerAccessConfiguration.isAllowedIndexURL(
            launchURL,
            trustedIndexURL: index,
            capability: capability
        ))
        XCTAssertTrue(OwnerAccessConfiguration.isAllowedIndexURL(
            index,
            trustedIndexURL: index,
            capability: capability
        ))
    }

    func testWrongOwnerFragmentAndDifferentFileAreRejected() {
        let index = URL(fileURLWithPath: "/tmp/GlowLetter/index.html")
        let wrongFragment = URL(string: "\(index.absoluteString)#access=wrong_capability_12345678901234567890123")
        let otherFile = URL(fileURLWithPath: "/tmp/GlowLetter/privacy.html")

        XCTAssertFalse(OwnerAccessConfiguration.isAllowedIndexURL(
            wrongFragment,
            trustedIndexURL: index,
            capability: capability
        ))
        XCTAssertFalse(OwnerAccessConfiguration.isAllowedIndexURL(
            otherFile,
            trustedIndexURL: index,
            capability: capability
        ))
    }
}
