import SwiftUI

enum SecureTheme {
    static let canvas = Color(hex: 0xEFF3F9)
    static let surface = Color(hex: 0xFFFFFF)
    static let field = Color(hex: 0xF2F6FC)
    static let text = Color(hex: 0x15283F)
    static let secondaryText = Color(hex: 0x4B5E75)
    static let border = Color(hex: 0x6B7D96)
    static let brand = Color(hex: 0x1857CC)
    static let completeText = Color(hex: 0x0E6547)
    static let completeFill = Color(hex: 0xDCF3E8)
    static let warningText = Color(hex: 0x8A4B08)
    static let warningFill = Color(hex: 0xFFF1CF)
    static let errorText = Color(hex: 0xB42318)
    static let errorFill = Color(hex: 0xFEE4E2)
    static let formWidth: CGFloat = 560
    static let examWidth: CGFloat = 880
}
private extension Color {
    init(hex: UInt32) { self.init(.sRGB,red:Double((hex>>16)&255)/255,green:Double((hex>>8)&255)/255,blue:Double(hex&255)/255,opacity:1) }
}

#if SECURE_LAYOUT_TESTS
struct SecureLayoutSample: Equatable {
    let id: String
    let frame: CGRect
    let role: String
}
struct SecureLayoutSamples: PreferenceKey {
    static var defaultValue: [String:SecureLayoutSample] = [:]
    static func reduce(value:inout [String:SecureLayoutSample],nextValue:()->[String:SecureLayoutSample]) { value.merge(nextValue(),uniquingKeysWith: { _,next in next }) }
}
#endif
extension View {
    @ViewBuilder func secureMeasure(_ id:String,role:String="content") -> some View {
        #if SECURE_LAYOUT_TESTS
        background(GeometryReader { geometry in Color.clear.preference(key:SecureLayoutSamples.self,value:[id:SecureLayoutSample(id:id,frame:geometry.frame(in:.named("secureLayout")),role:role)]) })
        #else
        self
        #endif
    }
}
