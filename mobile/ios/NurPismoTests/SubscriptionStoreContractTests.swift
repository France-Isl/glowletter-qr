import StoreKit
import XCTest
@testable import NurPismo

final class SubscriptionStoreContractTests: XCTestCase {
    func testProductCatalogKeepsSubscriptionAndLegacyEntitlement() {
        XCTAssertEqual(StoreProductCatalog.subscriptionProductID, "glowletter_premium_monthly")
        XCTAssertEqual(StoreProductCatalog.legacyProductID, "full_access")
        XCTAssertEqual(StoreProductCatalog.fallbackPriceLabel, "€21.99/month")
        XCTAssertEqual(
            StoreProductCatalog.entitlementProductIDs,
            Set(["glowletter_premium_monthly", "full_access"])
        )
    }

    @MainActor
    func testInitialSnapshotIsFailClosedButShowsFallbackPrice() {
        let store = SubscriptionStore()
        XCTAssertFalse(store.snapshot.entitled)
        XCTAssertFalse(store.snapshot.purchaseConfigured)
        XCTAssertEqual(store.snapshot.priceLabel, "€21.99/month")
        XCTAssertEqual(store.snapshot.productID, "glowletter_premium_monthly")
    }
}

#if canImport(StoreKitTest)
import StoreKitTest

@available(iOS 16.0, *)
final class StoreKitConfigurationSmokeTests: XCTestCase {
    func testLocalConfigurationContainsBothProducts() async throws {
        let session = try SKTestSession(configurationFileNamed: "GlowLetter")
        session.disableDialogs = true
        session.resetToDefaultState()

        let products = try await Product.products(for: [
            StoreProductCatalog.subscriptionProductID,
            StoreProductCatalog.legacyProductID
        ])
        XCTAssertEqual(Set(products.map(\.id)), StoreProductCatalog.entitlementProductIDs)
    }
}
#endif
