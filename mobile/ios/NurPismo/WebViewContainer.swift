import AuthenticationServices
import AVFoundation
import Combine
import SwiftUI
import UIKit
import WebKit

@MainActor
struct WebViewContainer: UIViewRepresentable {
    @ObservedObject var subscriptionStore: SubscriptionStore

    func makeCoordinator() -> Coordinator {
        Coordinator(subscriptionStore: subscriptionStore)
    }

    func makeUIView(context: Context) -> WKWebView {
        let controller = WKUserContentController()
        controller.add(context.coordinator, name: "nurBilling")
        controller.add(context.coordinator, name: "nurAuth")
        controller.add(context.coordinator, name: "nurShare")
        controller.add(context.coordinator, name: "nurSpeech")
        controller.addUserScript(WKUserScript(
            source: Coordinator.billingBootstrap,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        ))
        controller.addUserScript(WKUserScript(
            source: Coordinator.authBootstrap,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        ))
        controller.addUserScript(WKUserScript(
            source: Coordinator.shareBootstrap,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        ))
        controller.addUserScript(WKUserScript(
            source: Coordinator.speechBootstrap,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        ))

        let configuration = WKWebViewConfiguration()
        configuration.userContentController = controller
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = [.audio]
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 23 / 255, green: 23 / 255, blue: 34 / 255, alpha: 1)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        if #available(iOS 16.4, *) {
            #if DEBUG
            webView.isInspectable = true
            #endif
        }
        context.coordinator.webView = webView

        guard let webRoot = Bundle.main.resourceURL?.appendingPathComponent("WebResources", isDirectory: true),
              let index = Bundle.main.url(
                forResource: "index",
                withExtension: "html",
                subdirectory: "WebResources"
              ) else {
            webView.loadHTMLString(
                "<meta name='viewport' content='width=device-width'><body style='background:#171722;color:#fff7e8;font-family:-apple-system;padding:32px'>WebResources/index.html не найден. Запустите sync_web_assets.py.</body>",
                baseURL: nil
            )
            return webView
        }

        let launchURL = OwnerAccessConfiguration.launchURL(for: index)
        webView.loadFileURL(launchURL, allowingReadAccessTo: webRoot)
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "nurBilling")
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "nurAuth")
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "nurShare")
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "nurSpeech")
        uiView.stopLoading()
        coordinator.cancelAuthentication()
        coordinator.stopSpeech()
        coordinator.webView = nil
    }

    @MainActor
    final class Coordinator: NSObject,
                             WKNavigationDelegate,
                             WKUIDelegate,
                             WKScriptMessageHandler,
                             AVSpeechSynthesizerDelegate,
                             ASWebAuthenticationPresentationContextProviding {
        weak var webView: WKWebView?
        private let subscriptionStore: SubscriptionStore
        private var entitlementCancellable: AnyCancellable?
        private var authSession: ASWebAuthenticationSession?
        private var trustedMainDocumentReady = false
        private var pendingAuthCallbackURL: URL?
        private let speechSynthesizer = AVSpeechSynthesizer()
        private var activeSpeechUtterance: AVSpeechUtterance?

        init(subscriptionStore: SubscriptionStore) {
            self.subscriptionStore = subscriptionStore
            super.init()
            speechSynthesizer.delegate = self
            entitlementCancellable = subscriptionStore.$snapshot
                .removeDuplicates()
                .receive(on: DispatchQueue.main)
                .sink { [weak self] snapshot in
                    self?.sendEntitlement(snapshot)
                }
        }

        static let billingBootstrap = """
        (function () {
          const state = {
            entitled: false,
            owned: false,
            premium: false,
            priceLabel: '€21.99/month',
            reason: 'initializing',
            productId: 'glowletter_premium_monthly',
            legacyProductId: 'full_access',
            freeLetterLimit: 10,
            purchaseConfigured: false,
            mock: false
          };
          const applyNativeState = function (payload) {
            if (!payload || typeof payload !== 'object') return;
            Object.assign(state, payload);
            if (typeof window.onNativeEntitlement === 'function') {
              window.onNativeEntitlement(Boolean(state.entitled), state.priceLabel, state.reason);
            }
            window.dispatchEvent(new CustomEvent('nur-entitlement', { detail: Object.assign({}, state) }));
          };
          Object.defineProperty(window, '__nurApplyEntitlement', {
            value: applyNativeState,
            configurable: false,
            writable: false
          });
          Object.defineProperty(window, 'NurBilling', {
            value: Object.freeze({
              getEntitlement: function () { return JSON.stringify(state); },
              purchaseFullAccess: function () {
                window.webkit.messageHandlers.nurBilling.postMessage({ action: 'purchaseFullAccess' });
              },
              restorePurchases: function () {
                window.webkit.messageHandlers.nurBilling.postMessage({ action: 'restorePurchases' });
              },
              manageSubscription: function () {
                window.webkit.messageHandlers.nurBilling.postMessage({ action: 'manageSubscription' });
              }
            }),
            configurable: false,
            writable: false
          });
        })();
        """

        static let authBootstrap = """
        (function () {
          const bridge = Object.freeze({
            getRedirectUrl: function () { return '\(OAuthURLPolicy.callbackURLString)'; },
            openAuthorizeUrl: function (url) {
              window.webkit.messageHandlers.nurAuth.postMessage({ action: 'openAuthorizeUrl', url: String(url) });
            }
          });
          Object.defineProperty(window, 'NurAuth', { value: bridge, configurable: false, writable: false });
        })();
        """

        static let shareBootstrap = """
        (function () {
          const bridge = Object.freeze({
            share: function (title, text, url) {
              window.webkit.messageHandlers.nurShare.postMessage({
                action: 'share',
                title: String(title || ''),
                text: String(text || ''),
                url: String(url || '')
              });
            }
          });
          Object.defineProperty(window, 'NurShare', { value: bridge, configurable: false, writable: false });
        })();
        """

        static let speechBootstrap = """
        (function () {
          const bridge = Object.freeze({
            speak: function (text, language) {
              window.webkit.messageHandlers.nurSpeech.postMessage({
                action: 'speak',
                text: String(text || ''),
                language: String(language || '')
              });
            },
            stop: function () {
              window.webkit.messageHandlers.nurSpeech.postMessage({ action: 'stop' });
            }
          });
          Object.defineProperty(window, 'NurSpeech', { value: bridge, configurable: false, writable: false });
        })();
        """

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            trustedMainDocumentReady = false
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            trustedMainDocumentReady = isTrustedMainDocumentURL(webView.url)
            sendEntitlement(subscriptionStore.snapshot)
            dispatchPendingAuthCallback()
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            if navigationAction.navigationType == .linkActivated,
               let url = navigationAction.request.url,
               let scheme = url.scheme?.lowercased(),
               scheme == "https" || scheme == "http" {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.frameInfo.isMainFrame,
                  isTrustedMainDocumentURL(message.frameInfo.request.url),
                  let body = message.body as? [String: Any],
                  let action = body["action"] as? String else { return }

            switch message.name {
            case "nurBilling":
                switch action {
                case "purchaseFullAccess":
                    Task { await subscriptionStore.purchasePremium() }
                case "restorePurchases":
                    Task { await subscriptionStore.restorePurchases() }
                case "manageSubscription":
                    if let url = URL(string: "https://apps.apple.com/account/subscriptions") {
                        UIApplication.shared.open(url)
                    }
                default:
                    return
                }
            case "nurAuth":
                guard action == "openAuthorizeUrl",
                      let rawURL = body["url"] as? String,
                      let url = URL(string: rawURL),
                      OAuthURLPolicy.isAllowedAuthorizeURL(url) else { return }
                beginAuthentication(at: url)
            case "nurShare":
                guard action == "share",
                      trustedMainDocumentReady,
                      let rawURL = body["url"] as? String,
                      let url = allowedShareURL(rawURL) else { return }
                presentShareSheet(
                    title: boundedShareText(body["title"] as? String, limit: 160, fallback: "GlowLetter"),
                    text: boundedShareText(body["text"] as? String, limit: 1_200, fallback: "GlowLetter"),
                    url: url
                )
            case "nurSpeech":
                guard trustedMainDocumentReady else { return }
                switch action {
                case "speak":
                    let text = boundedShareText(body["text"] as? String, limit: 6_000, fallback: "")
                    guard !text.isEmpty else {
                        dispatchSpeechState("error")
                        return
                    }
                    speakText(text, language: body["language"] as? String)
                case "stop":
                    stopSpeech()
                default:
                    return
                }
            default:
                return
            }
        }

        func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
            if let window = webView?.window {
                return window
            }
            for case let scene as UIWindowScene in UIApplication.shared.connectedScenes {
                if let window = scene.windows.first(where: { $0.isKeyWindow }) {
                    return window
                }
            }
            return ASPresentationAnchor()
        }

        func cancelAuthentication() {
            authSession?.cancel()
            authSession = nil
        }

        private func beginAuthentication(at url: URL) {
            guard trustedMainDocumentReady,
                  isTrustedMainDocumentURL(webView?.url),
                  OAuthURLPolicy.isAllowedAuthorizeURL(url) else { return }

            cancelAuthentication()
            let session = ASWebAuthenticationSession(
                url: url,
                callbackURLScheme: OAuthURLPolicy.callbackScheme
            ) { [weak self] callbackURL, _ in
                DispatchQueue.main.async {
                    guard let self else { return }
                    self.authSession = nil
                    guard let callbackURL,
                          OAuthURLPolicy.isAllowedCallbackURL(callbackURL) else { return }
                    self.pendingAuthCallbackURL = callbackURL
                    self.dispatchPendingAuthCallback()
                }
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = false
            authSession = session
            if !session.start() {
                authSession = nil
            }
        }

        private func presentShareSheet(title: String, text: String, url: URL) {
            guard let webView,
                  trustedMainDocumentReady,
                  isTrustedMainDocumentURL(webView.url),
                  let presenter = topViewController(from: webView.window?.rootViewController) else { return }
            let payload = "\(text)\n\(url.absoluteString)"
            let sheet = UIActivityViewController(activityItems: [payload], applicationActivities: nil)
            sheet.setValue(title, forKey: "subject")
            if let popover = sheet.popoverPresentationController {
                popover.sourceView = webView
                popover.sourceRect = CGRect(x: webView.bounds.midX, y: webView.bounds.midY, width: 1, height: 1)
                popover.permittedArrowDirections = []
            }
            presenter.present(sheet, animated: true)
        }

        private func speakText(_ text: String, language rawLanguage: String?) {
            guard trustedMainDocumentReady,
                  isTrustedMainDocumentURL(webView?.url) else { return }
            if speechSynthesizer.isSpeaking {
                activeSpeechUtterance = nil
                speechSynthesizer.stopSpeaking(at: .immediate)
            }
            let requested = (rawLanguage ?? "").lowercased()
            let language = requested.hasPrefix("fr") ? "fr-FR" : requested.hasPrefix("en") ? "en-US" : "ru-RU"
            let utterance = AVSpeechUtterance(string: text)
            utterance.voice = AVSpeechSynthesisVoice(language: language) ?? AVSpeechSynthesisVoice(language: Locale.preferredLanguages.first ?? language)
            utterance.rate = 0.47
            activeSpeechUtterance = utterance
            speechSynthesizer.speak(utterance)
        }

        func stopSpeech() {
            activeSpeechUtterance = nil
            if speechSynthesizer.isSpeaking || speechSynthesizer.isPaused {
                speechSynthesizer.stopSpeaking(at: .immediate)
            }
            dispatchSpeechState("stopped")
        }

        func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
            guard let activeUtterance = activeSpeechUtterance, utterance === activeUtterance else { return }
            dispatchSpeechState("started")
        }

        func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
            guard let activeUtterance = activeSpeechUtterance, utterance === activeUtterance else { return }
            activeSpeechUtterance = nil
            dispatchSpeechState("done")
        }

        func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
            guard let activeUtterance = activeSpeechUtterance, utterance === activeUtterance else { return }
            activeSpeechUtterance = nil
            dispatchSpeechState("stopped")
        }

        private func dispatchSpeechState(_ state: String) {
            guard let webView,
                  trustedMainDocumentReady,
                  isTrustedMainDocumentURL(webView.url) else { return }
            let script = "window.dispatchEvent(new CustomEvent('nur-speech-state',{detail:{state:'\(state)'}}));"
            webView.evaluateJavaScript(script)
        }

        private func topViewController(from root: UIViewController?) -> UIViewController? {
            if let presented = root?.presentedViewController {
                return topViewController(from: presented)
            }
            if let navigation = root as? UINavigationController {
                return topViewController(from: navigation.visibleViewController)
            }
            if let tabs = root as? UITabBarController {
                return topViewController(from: tabs.selectedViewController)
            }
            return root
        }

        private func allowedShareURL(_ rawValue: String) -> URL? {
            guard rawValue.count <= 8_192,
                  let components = URLComponents(string: rawValue),
                  components.scheme?.lowercased() == "https",
                  components.host?.isEmpty == false,
                  components.user == nil,
                  components.password == nil,
                  components.port == nil else { return nil }
            return components.url
        }

        private func boundedShareText(_ value: String?, limit: Int, fallback: String) -> String {
            let clean = (value ?? "")
                .unicodeScalars
                .filter { !CharacterSet.controlCharacters.contains($0) || $0.value == 10 || $0.value == 9 }
                .map(String.init)
                .joined()
                .trimmingCharacters(in: .whitespacesAndNewlines)
            guard !clean.isEmpty else { return fallback }
            return String(clean.prefix(limit))
        }

        private func dispatchPendingAuthCallback() {
            guard let webView,
                  let callbackURL = pendingAuthCallbackURL,
                  trustedMainDocumentReady,
                  isTrustedMainDocumentURL(webView.url),
                  OAuthURLPolicy.isAllowedCallbackURL(callbackURL) else { return }

            let callback = Self.jsonString(callbackURL.absoluteString)
            let script = """
            (function(){
              var u=\(callback);
              if(typeof window.onNativeAuthCallback==='function'){window.onNativeAuthCallback(u);}
              else{window.__nurPendingAuthCallback=u;}
              window.dispatchEvent(new CustomEvent('nur-auth-callback',{detail:{url:u}}));
            })();
            """
            pendingAuthCallbackURL = nil
            webView.evaluateJavaScript(script)
        }

        private func isTrustedMainDocumentURL(_ url: URL?) -> Bool {
            guard let trusted = Bundle.main.url(
                forResource: "index",
                withExtension: "html",
                subdirectory: "WebResources"
            ) else { return false }
            return OwnerAccessConfiguration.isAllowedIndexURL(url, trustedIndexURL: trusted)
        }

        private func sendEntitlement(_ snapshot: BillingSnapshot) {
            guard let webView,
                  trustedMainDocumentReady,
                  isTrustedMainDocumentURL(webView.url),
                  JSONSerialization.isValidJSONObject(snapshot.bridgePayload),
                  let data = try? JSONSerialization.data(withJSONObject: snapshot.bridgePayload),
                  let payload = String(data: data, encoding: .utf8) else { return }
            let script = "if(typeof window.__nurApplyEntitlement==='function'){window.__nurApplyEntitlement(\(payload));}"
            webView.evaluateJavaScript(script)
        }

        private static func jsonString(_ value: String) -> String {
            guard let data = try? JSONSerialization.data(withJSONObject: [value]),
                  let array = String(data: data, encoding: .utf8) else { return "\"unknown\"" }
            return String(array.dropFirst().dropLast())
        }
    }
}
