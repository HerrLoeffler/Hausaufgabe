import SwiftUI

/// Product layout rules shared by native screens. Content may scroll vertically;
/// principal cards and actions share a centered axis, with at least 16pt side space.
enum GradeCrewLayoutGuides {
    static let pageInset: CGFloat = 16
    static let formMaxWidth: CGFloat = 560
    static let menuMaxWidth: CGFloat = 760
    static let minimumTapSize: CGFloat = 44
}

#if GRADECREW_LAYOUT_TESTS
import UIKit
struct GradeCrewLayoutSample: Equatable {
    let id: String
    let frame: CGRect
    let role: String
    let parent: String?
    let text: String?
    let fontSize: CGFloat?
}
struct GradeCrewLayoutSamplesKey: PreferenceKey {
    static var defaultValue: [String: GradeCrewLayoutSample] = [:]
    static func reduce(value: inout [String: GradeCrewLayoutSample], nextValue: () -> [String: GradeCrewLayoutSample]) { value.merge(nextValue(), uniquingKeysWith: { _, next in next }) }
}
#endif

extension View {
    /// Geometry collection exists only in the separate unsigned test host.
    @ViewBuilder
    func gcLayout(_ id: String, role: String = "content", parent: String? = nil, text: String? = nil, fontSize: CGFloat? = nil) -> some View {
        #if GRADECREW_LAYOUT_TESTS
        background(GeometryReader { geometry in
            Color.clear.preference(key: GradeCrewLayoutSamplesKey.self, value: [id: GradeCrewLayoutSample(id: id, frame: geometry.frame(in: .named("gcLayoutViewport")), role: role, parent: parent, text: text, fontSize: fontSize)])
        })
        #else
        self
        #endif
    }
}
