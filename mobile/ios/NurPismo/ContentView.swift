import SwiftUI

@MainActor
struct ContentView: View {
    @StateObject private var subscriptionStore = SubscriptionStore()

    var body: some View {
        WebViewContainer(subscriptionStore: subscriptionStore)
            .background(Color(red: 23 / 255, green: 23 / 255, blue: 34 / 255))
            .ignoresSafeArea()
            .statusBarHidden(true)
            .persistentSystemOverlays(.hidden)
            .task {
                await subscriptionStore.start()
            }
    }
}
