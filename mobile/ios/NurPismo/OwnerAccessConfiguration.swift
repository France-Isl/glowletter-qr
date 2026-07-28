import Foundation

enum OwnerAccessConfiguration {
    static let infoPlistKey = "GlowLetterOwnerCapability"

    static var bundledCapability: String {
        sanitize(Bundle.main.object(forInfoDictionaryKey: infoPlistKey))
    }

    static func sanitize(_ rawValue: Any?) -> String {
        guard let rawValue = rawValue as? String else { return "" }
        let value = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
        // Keep this in lockstep with the web application's capability format.
        guard (40...128).contains(value.count),
              value.unicodeScalars.allSatisfy({ scalar in
                  switch scalar.value {
                  case 45, 48...57, 65...90, 95, 97...122:
                      return true
                  default:
                      return false
                  }
              }) else {
            return ""
        }
        return value
    }

    static func launchURL(for indexURL: URL, capability: String = bundledCapability) -> URL {
        let safeCapability = sanitize(capability)
        guard !safeCapability.isEmpty,
              var components = URLComponents(url: indexURL, resolvingAgainstBaseURL: false) else {
            return indexURL
        }
        components.percentEncodedFragment = "access=\(safeCapability)"
        return components.url ?? indexURL
    }

    static func isAllowedIndexURL(
        _ candidate: URL?,
        trustedIndexURL: URL,
        capability: String = bundledCapability
    ) -> Bool {
        guard let candidate,
              candidate.isFileURL,
              candidate.query == nil,
              candidate.standardizedFileURL.path == trustedIndexURL.standardizedFileURL.path else {
            return false
        }
        // The web app removes the owner fragment from browser history after it
        // validates and stores it, so both the clean URL and the exact build-time
        // capability URL are trusted.
        guard let fragment = candidate.fragment else { return true }
        let safeCapability = sanitize(capability)
        return !safeCapability.isEmpty && fragment == "access=\(safeCapability)"
    }
}
