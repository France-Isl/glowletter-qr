import Foundation
import XCTest
@testable import NurPismo

final class OAuthURLPolicyTests: XCTestCase {
    private let authorizeURLString =
        "https://xzzngrquomyiglktroqi.supabase.co/auth/v1/authorize"
    private let challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

    func testAllowsOnlyConfiguredProvidersWithExactCallbackAndS256PKCE() throws {
        for provider in ["google", "facebook", "apple"] {
            let url = try XCTUnwrap(authorizeURL(provider: provider))
            XCTAssertTrue(OAuthURLPolicy.isAllowedAuthorizeURL(url), provider)
        }
    }

    func testAppleAuthorizeURLStillRequiresExactSupabaseEndpoint() throws {
        XCTAssertFalse(OAuthURLPolicy.isAllowedAuthorizeURL(try XCTUnwrap(URL(string:
            "http://xzzngrquomyiglktroqi.supabase.co/auth/v1/authorize?\(appleQuery)"
        ))))
        XCTAssertFalse(OAuthURLPolicy.isAllowedAuthorizeURL(try XCTUnwrap(URL(string:
            "https://xzzngrquomyiglktroqi.supabase.co.evil.example/auth/v1/authorize?\(appleQuery)"
        ))))
        XCTAssertFalse(OAuthURLPolicy.isAllowedAuthorizeURL(try XCTUnwrap(URL(string:
            "https://xzzngrquomyiglktroqi.supabase.co:443/auth/v1/authorize?\(appleQuery)"
        ))))
        XCTAssertFalse(OAuthURLPolicy.isAllowedAuthorizeURL(try XCTUnwrap(URL(string:
            "\(authorizeURLString)/extra?\(appleQuery)"
        ))))
        XCTAssertFalse(OAuthURLPolicy.isAllowedAuthorizeURL(try XCTUnwrap(URL(string:
            "\(authorizeURLString)?\(appleQuery)#unexpected"
        ))))
    }

    func testAppleAuthorizeURLStillRequiresExactCallbackAndPKCE() throws {
        XCTAssertFalse(OAuthURLPolicy.isAllowedAuthorizeURL(try XCTUnwrap(authorizeURL(
            provider: "Apple"
        ))))
        XCTAssertFalse(OAuthURLPolicy.isAllowedAuthorizeURL(try XCTUnwrap(authorizeURL(
            provider: "apple",
            redirect: "https://evil.example/callback"
        ))))
        XCTAssertFalse(OAuthURLPolicy.isAllowedAuthorizeURL(try XCTUnwrap(authorizeURL(
            provider: "apple",
            challenge: "too-short"
        ))))
        XCTAssertFalse(OAuthURLPolicy.isAllowedAuthorizeURL(try XCTUnwrap(authorizeURL(
            provider: "apple",
            method: "plain"
        ))))

        var duplicateProvider = try XCTUnwrap(URLComponents(
            url: try XCTUnwrap(authorizeURL(provider: "apple")),
            resolvingAgainstBaseURL: false
        ))
        duplicateProvider.queryItems?.append(URLQueryItem(name: "provider", value: "google"))
        XCTAssertFalse(OAuthURLPolicy.isAllowedAuthorizeURL(try XCTUnwrap(duplicateProvider.url)))
    }

    func testCallbackPolicyRemainsExactForAppleOAuthResults() throws {
        XCTAssertTrue(OAuthURLPolicy.isAllowedCallbackURL(try XCTUnwrap(URL(string:
            "com.franceisl.glowletternext://auth/callback?code=one-time-code"
        ))))
        XCTAssertTrue(OAuthURLPolicy.isAllowedCallbackURL(try XCTUnwrap(URL(string:
            "com.franceisl.glowletternext://auth/callback?error=access_denied&error_description=Cancelled"
        ))))
        XCTAssertFalse(OAuthURLPolicy.isAllowedCallbackURL(try XCTUnwrap(URL(string:
            "com.franceisl.glowletternext://evil/callback?code=one-time-code"
        ))))
        XCTAssertFalse(OAuthURLPolicy.isAllowedCallbackURL(try XCTUnwrap(URL(string:
            "com.franceisl.glowletternext://auth/callback?code=one&code=two"
        ))))
    }

    private var appleQuery: String {
        "provider=apple"
            + "&redirect_to=com.franceisl.glowletternext%3A%2F%2Fauth%2Fcallback"
            + "&code_challenge=\(challenge)"
            + "&code_challenge_method=S256"
    }

    private func authorizeURL(
        provider: String,
        redirect: String = OAuthURLPolicy.callbackURLString,
        challenge: String? = nil,
        method: String = "S256"
    ) -> URL? {
        guard var components = URLComponents(string: authorizeURLString) else { return nil }
        components.queryItems = [
            URLQueryItem(name: "provider", value: provider),
            URLQueryItem(name: "redirect_to", value: redirect),
            URLQueryItem(name: "code_challenge", value: challenge ?? self.challenge),
            URLQueryItem(name: "code_challenge_method", value: method)
        ]
        return components.url
    }
}
