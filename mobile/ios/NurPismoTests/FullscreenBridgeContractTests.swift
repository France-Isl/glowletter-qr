import WebKit
import XCTest
@testable import NurPismo

final class FullscreenBridgeContractTests: XCTestCase {
    @MainActor
    func testBootstrapConnectsExistingFullscreenControlToNativeBridge() {
        let bootstrap = WebViewContainer.Coordinator.fullscreenBootstrap

        XCTAssertTrue(bootstrap.contains("nurFullscreen"))
        XCTAssertTrue(bootstrap.contains("#fullscreenToggle"))
        XCTAssertTrue(bootstrap.contains("post('request')"))
        XCTAssertTrue(bootstrap.contains("nur-fullscreen-state"))
    }

    @MainActor
    func testImmersiveControllerHidesSystemChromeByDefault() {
        let controller = ImmersiveWebViewController(webView: WKWebView())

        XCTAssertTrue(controller.isImmersive)
        XCTAssertTrue(controller.prefersStatusBarHidden)
        XCTAssertTrue(controller.prefersHomeIndicatorAutoHidden)

        controller.setImmersive(false)

        XCTAssertFalse(controller.isImmersive)
        XCTAssertFalse(controller.prefersStatusBarHidden)
        XCTAssertFalse(controller.prefersHomeIndicatorAutoHidden)
    }
}
