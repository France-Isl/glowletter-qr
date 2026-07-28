import Combine
import Foundation
import StoreKit

enum StoreProductCatalog {
    static let subscriptionProductID = "glowletter_premium_monthly"
    static let legacyProductID = "full_access"
    static let fallbackPriceLabel = "€21.99/month"
    static let entitlementProductIDs: Set<String> = [subscriptionProductID, legacyProductID]
}

struct BillingSnapshot: Equatable, Sendable {
    let entitled: Bool
    let priceLabel: String
    let reason: String
    let productID: String
    let purchaseConfigured: Bool

    static let initial = BillingSnapshot(
        entitled: false,
        priceLabel: StoreProductCatalog.fallbackPriceLabel,
        reason: "initializing",
        productID: StoreProductCatalog.subscriptionProductID,
        purchaseConfigured: false
    )

    var bridgePayload: [String: Any] {
        [
            "entitled": entitled,
            "owned": entitled,
            "premium": entitled,
            "priceLabel": priceLabel,
            "reason": reason,
            "productId": productID,
            "legacyProductId": StoreProductCatalog.legacyProductID,
            "freeLetterLimit": 10,
            "purchaseConfigured": purchaseConfigured,
            "mock": false
        ]
    }
}

@MainActor
final class SubscriptionStore: ObservableObject {
    @Published private(set) var snapshot: BillingSnapshot = .initial

    private var productsByID: [String: Product] = [:]
    private var transactionUpdatesTask: Task<Void, Never>?
    private var hasStarted = false
    private var storeOperationInProgress = false

    deinit {
        transactionUpdatesTask?.cancel()
    }

    func start() async {
        guard !hasStarted else {
            if productsByID[StoreProductCatalog.subscriptionProductID] == nil {
                await loadProducts()
            }
            await refreshEntitlements(reason: snapshot.entitled ? snapshot.reason : "storekit_ready")
            return
        }
        hasStarted = true
        observeTransactionUpdates()
        await loadProducts()
        await refreshEntitlements(reason: "storekit_ready")
    }

    func purchasePremium() async {
        guard !storeOperationInProgress else {
            publish(reason: "store_operation_in_progress", purchaseConfigured: snapshot.purchaseConfigured)
            return
        }
        storeOperationInProgress = true
        defer { storeOperationInProgress = false }

        if productsByID[StoreProductCatalog.subscriptionProductID] == nil {
            await loadProducts()
        }
        guard let product = productsByID[StoreProductCatalog.subscriptionProductID] else {
            publish(reason: "subscription_product_unavailable", purchaseConfigured: false)
            return
        }

        publish(reason: "verifying_purchase", purchaseConfigured: true)
        do {
            switch try await product.purchase() {
            case .success(let verificationResult):
                let transaction = try Self.verified(verificationResult)
                guard StoreProductCatalog.entitlementProductIDs.contains(transaction.productID) else {
                    publish(reason: "unexpected_product", purchaseConfigured: true)
                    return
                }
                await transaction.finish()
                await refreshEntitlements(reason: "purchase_verified")
            case .pending:
                publish(reason: "purchase_pending", purchaseConfigured: true)
            case .userCancelled:
                await refreshEntitlements(reason: "purchase_cancelled")
            @unknown default:
                await refreshEntitlements(reason: "purchase_unknown_result")
            }
        } catch {
            await refreshEntitlements(reason: "purchase_failed")
        }
    }

    func restorePurchases() async {
        guard !storeOperationInProgress else {
            publish(reason: "store_operation_in_progress", purchaseConfigured: snapshot.purchaseConfigured)
            return
        }
        storeOperationInProgress = true
        defer { storeOperationInProgress = false }

        publish(reason: "restoring_purchases", purchaseConfigured: snapshot.purchaseConfigured)
        do {
            // Apple may present an App Store authentication sheet. This method is
            // intentionally called only after the user taps Restore Purchases.
            try await AppStore.sync()
            await loadProducts()
            await refreshEntitlements(reason: "purchases_restored")
        } catch {
            await refreshEntitlements(reason: "restore_failed")
        }
    }

    private func loadProducts() async {
        do {
            let products = try await Product.products(for: [
                StoreProductCatalog.subscriptionProductID,
                StoreProductCatalog.legacyProductID
            ])
            productsByID = Dictionary(uniqueKeysWithValues: products.map { ($0.id, $0) })
            let subscription = productsByID[StoreProductCatalog.subscriptionProductID]
            let price = subscription.map(Self.monthlyPriceLabel(for:)) ?? StoreProductCatalog.fallbackPriceLabel
            snapshot = BillingSnapshot(
                entitled: snapshot.entitled,
                priceLabel: price,
                reason: snapshot.reason,
                productID: StoreProductCatalog.subscriptionProductID,
                purchaseConfigured: subscription != nil
            )
        } catch {
            productsByID = [:]
            snapshot = BillingSnapshot(
                entitled: snapshot.entitled,
                priceLabel: StoreProductCatalog.fallbackPriceLabel,
                reason: "product_load_failed",
                productID: StoreProductCatalog.subscriptionProductID,
                purchaseConfigured: false
            )
        }
    }

    private func refreshEntitlements(reason: String) async {
        var activeProductIDs = Set<String>()

        for await verificationResult in Transaction.currentEntitlements {
            guard case .verified(let transaction) = verificationResult,
                  StoreProductCatalog.entitlementProductIDs.contains(transaction.productID),
                  transaction.revocationDate == nil else {
                continue
            }
            activeProductIDs.insert(transaction.productID)
        }

        let entitlementReason: String
        if activeProductIDs.contains(StoreProductCatalog.legacyProductID) {
            entitlementReason = "legacy_full_access"
        } else if activeProductIDs.contains(StoreProductCatalog.subscriptionProductID) {
            entitlementReason = "subscription_active"
        } else {
            entitlementReason = reason
        }

        snapshot = BillingSnapshot(
            entitled: !activeProductIDs.isEmpty,
            priceLabel: currentPriceLabel,
            reason: entitlementReason,
            productID: StoreProductCatalog.subscriptionProductID,
            purchaseConfigured: productsByID[StoreProductCatalog.subscriptionProductID] != nil
        )
    }

    private func observeTransactionUpdates() {
        transactionUpdatesTask?.cancel()
        transactionUpdatesTask = Task { [weak self] in
            for await verificationResult in Transaction.updates {
                guard !Task.isCancelled else { return }
                guard case .verified(let transaction) = verificationResult,
                      StoreProductCatalog.entitlementProductIDs.contains(transaction.productID) else {
                    continue
                }
                await transaction.finish()
                await self?.refreshEntitlements(reason: "transaction_update")
            }
        }
    }

    private var currentPriceLabel: String {
        guard let subscription = productsByID[StoreProductCatalog.subscriptionProductID] else {
            return StoreProductCatalog.fallbackPriceLabel
        }
        return Self.monthlyPriceLabel(for: subscription)
    }

    private func publish(reason: String, purchaseConfigured: Bool) {
        snapshot = BillingSnapshot(
            entitled: snapshot.entitled,
            priceLabel: currentPriceLabel,
            reason: reason,
            productID: StoreProductCatalog.subscriptionProductID,
            purchaseConfigured: purchaseConfigured
        )
    }

    private static func monthlyPriceLabel(for product: Product) -> String {
        "\(product.displayPrice)/month"
    }

    private static func verified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let value):
            return value
        case .unverified:
            throw StoreError.failedVerification
        }
    }

    private enum StoreError: Error {
        case failedVerification
    }
}
