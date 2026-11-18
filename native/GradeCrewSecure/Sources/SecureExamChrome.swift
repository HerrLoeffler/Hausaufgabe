import SwiftUI
private struct SecureCompactChromeKey:EnvironmentKey { static let defaultValue=false }
extension EnvironmentValues {
    var secureCompactChrome:Bool { get { self[SecureCompactChromeKey.self] } set { self[SecureCompactChromeKey.self]=newValue } }
}
struct SecureExamFrame<Content:View>:View {
    let header:SecureExamHeader
    let footer:SecureExamFooter?
    @ViewBuilder let content:()->Content
    var body:some View {
        GeometryReader { geometry in
            VStack(spacing:0) {
                header
                content().frame(maxWidth:.infinity,maxHeight:.infinity)
                if let footer { footer }
            }.environment(\.secureCompactChrome,geometry.size.width<600 || geometry.size.height<500)
        }.background(SecureTheme.canvas.ignoresSafeArea()).foregroundStyle(SecureTheme.text).tint(SecureTheme.brand).preferredColorScheme(.light)
    }
}
struct SecureExamHeader:View {
    let title:String
    let participant:String
    let remaining:Int?
    @Environment(\.secureCompactChrome) private var compact
    @State private var showDetails=false
    private var time:String { remaining.map { String(format:"%02d:%02d",max(0,$0)/60,max(0,$0)%60) } ?? "Ohne Zeitlimit" }
    var body:some View {
        Group {
            if compact {
                HStack(spacing:8) {
                    Button { showDetails=true } label: {
                        HStack(spacing:8) {
                            Image("GradeCrewLogo").resizable().scaledToFit().frame(width:24,height:24).accessibilityHidden(true)
                            Text(title).font(.subheadline.weight(.semibold)).lineLimit(1)
                        }.frame(maxWidth:.infinity,minHeight:44,alignment:.leading).contentShape(Rectangle())
                    }.buttonStyle(.plain).accessibilityLabel("Testinformationen: "+title+", "+participant)
                        .secureMeasure("exam.details",role:"tap")
                    clock.fixedSize()
                }
            } else {
                ViewThatFits(in:.horizontal) {
                    HStack(alignment:.center,spacing:16) { identity;Spacer(minLength:0);clock.fixedSize() }
                    VStack(alignment:.leading,spacing:12) { identity;clock }
                }
            }
        }.padding(.horizontal,compact ? 12 : 16).padding(.vertical,compact ? 2 : 12).frame(maxWidth:SecureTheme.examWidth)
            .frame(maxWidth:.infinity).background(SecureTheme.surface).overlay(alignment:.bottom) { Rectangle().fill(SecureTheme.border).frame(height:1) }
            .secureMeasure("exam.header")
            .alert("Testinformationen",isPresented:$showDetails) { Button("Schließen",role:.cancel) {} } message: { Text(title+"\n"+participant) }
    }
    private var identity:some View {
        HStack(spacing:12) { logo;VStack(alignment:.leading,spacing:4) {
            Text(title).font(.headline).lineLimit(2).accessibilityLabel(title)
            Text(participant).font(.caption).foregroundStyle(SecureTheme.secondaryText).fixedSize(horizontal:false,vertical:true)
        } }
    }
    private var logo:some View { Image("GradeCrewLogo").resizable().scaledToFit().frame(width:36,height:36).accessibilityHidden(true) }
    private var clock:some View {
        Label(compact && remaining == nil ? "∞" : time,systemImage:"clock")
            .font(compact ? .callout.monospacedDigit().bold() : .title3.monospacedDigit().bold())
            .foregroundStyle((remaining ?? 61)<=60 ? SecureTheme.warningText : SecureTheme.brand)
            .padding(.horizontal,12).padding(.vertical,compact ? 4 : 8)
            .background((remaining ?? 61)<=60 ? SecureTheme.warningFill : SecureTheme.field,in:RoundedRectangle(cornerRadius:12))
            .accessibilityLabel("Verbleibende Zeit: "+time).secureMeasure("exam.clock")
    }
}
struct SecureExamFooter:View {
    let storageStatus:String
    let warning:String?
    let canSubmit:Bool
    let onSubmit:()->Void
    var showSubmit=true
    @Environment(\.secureCompactChrome) private var compact
    @State private var showStatus=false
    var body:some View {
        VStack(alignment:.leading,spacing:8) {
            if let warning,!warning.isEmpty,!compact {
                Label(warning,systemImage:"wifi.exclamationmark").font(.footnote).foregroundStyle(SecureTheme.warningText).fixedSize(horizontal:false,vertical:true)
            }
            if !showSubmit { statusText } else if compact {
                HStack(spacing:16) { statusButton;Spacer(minLength:8);submit }
            } else {
                ViewThatFits(in:.horizontal) {
                    HStack(spacing:16) { statusText;Spacer(minLength:8);submit.fixedSize(horizontal:true,vertical:false) }
                    VStack(alignment:.leading,spacing:12) { statusText;submit.frame(maxWidth:.infinity) }
                }
            }
        }.padding(compact ? 8 : 16).frame(maxWidth:SecureTheme.examWidth).frame(maxWidth:.infinity).background(SecureTheme.surface)
            .overlay(alignment:.top) { Rectangle().fill(SecureTheme.border).frame(height:1) }
            .alert("Speicherstatus",isPresented:$showStatus) { Button("Schließen",role:.cancel) {} } message: { Text([storageStatus,warning].compactMap{$0}.filter{!$0.isEmpty}.joined(separator:"\n")) }
    }
    private var statusText:some View { Text(storageStatus).font(.footnote).foregroundStyle(SecureTheme.secondaryText).fixedSize(horizontal:false,vertical:true).secureMeasure("exam.storage") }
    private var statusButton:some View {
        Button { showStatus=true } label: { Image(systemName:warning != nil || !canSubmit ? "exclamationmark.circle" : "checkmark.shield").font(.title2).frame(minWidth:44,minHeight:44) }
            .accessibilityLabel("Speicherstatus: "+storageStatus).secureMeasure("exam.storage-details",role:"tap")
    }
    private var submit:some View {
        Button(action:onSubmit) { Text("Abgeben").font(.headline).padding(.horizontal,20).frame(minHeight:compact ? 44 : 52) }
            .buttonStyle(.plain).foregroundStyle(canSubmit ? SecureTheme.surface : SecureTheme.secondaryText)
            .background(canSubmit ? SecureTheme.brand : SecureTheme.field,in:RoundedRectangle(cornerRadius:14))
            .overlay(RoundedRectangle(cornerRadius:14).stroke(canSubmit ? SecureTheme.brand : SecureTheme.border,lineWidth:1))
            .disabled(!canSubmit).secureMeasure("exam.submit",role:"tap")
    }
}
