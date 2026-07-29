import Foundation
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
    func testLocalConfigurationIsBundledAndContainsBothProducts() throws {
        guard let configurationURL = Bundle.main.url(
            forResource: "GlowLetter",
            withExtension: "storekit"
        ) else {
            XCTFail("GlowLetter.storekit is missing from the application bundle")
            return
        }

        let data = try Data(contentsOf: configurationURL)
        let configuration = try XCTUnwrap(
            JSONSerialization.jsonObject(with: data) as? [String: Any]
        )
        let products = configuration["products"] as? [[String: Any]] ?? []
        let subscriptions = (configuration["subscriptionGroups"] as? [[String: Any]] ?? [])
            .flatMap { $0["subscriptions"] as? [[String: Any]] ?? [] }
        let productIDs = Set((products + subscriptions).compactMap { $0["productID"] as? String })

        XCTAssertEqual(productIDs, StoreProductCatalog.entitlementProductIDs)
        _ = try SKTestSession(contentsOf: configurationURL)
    }
}
#endif
