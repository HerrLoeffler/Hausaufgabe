import SwiftUI

private struct SecureEntryBrandHeader: View {
    var body: some View {
        VStack(spacing:12) {
            Image("GradeCrewLogo").resizable().scaledToFit()
                .frame(width:96,height:96).accessibilityHidden(true)
            Text("GradeCrew").font(.largeTitle.bold())
                .multilineTextAlignment(.center).fixedSize(horizontal:false,vertical:true)
            Text("Secure").font(.title3.weight(.semibold)).foregroundStyle(SecureTheme.secondaryText)
        }.frame(maxWidth:.infinity).foregroundStyle(SecureTheme.text)
            .accessibilityElement(children:.combine).secureMeasure("brand",role:"center")
    }
}

struct SecureBrandHeader: View {
    var body: some View { SecureEntryBrandHeader() }
}
private struct SecureEntryFocusKey:PreferenceKey {
    static var defaultValue:String? = nil
    static func reduce(value:inout String?,nextValue:()->String?) { value=nextValue() ?? value }
}
struct SecureWelcomeFrame<Content:View>: View {
    @State private var focusedField:String?

    var entry:Bool = false
    @ViewBuilder let content: () -> Content
    var body: some View {
        ScrollViewReader { proxy in
        ScrollView {
            VStack(spacing:24) {
                if entry { SecureEntryBrandHeader() } else { SecureBrandHeader() }
                content()
                if entry { SecureLegalLinks() }
                Text(SecureReleaseEnvironment.projectID == "gradecrew-staging-2026" ? "Testumgebung" : "Schulversion").font(.footnote).foregroundStyle(SecureTheme.secondaryText)
            }.padding(.vertical,24).frame(maxWidth:SecureTheme.formWidth).secureMeasure("welcome",role:"center")
                .frame(maxWidth:.infinity).padding(.horizontal,16)
        }.scrollDismissesKeyboard(.interactively)
            .onPreferenceChange(SecureEntryFocusKey.self) { field in
                focusedField=field
                if let field { withAnimation { proxy.scrollTo(field,anchor:.top) } }
            }
            .onReceive(NotificationCenter.default.publisher(for:UIResponder.keyboardDidShowNotification)) { _ in
                if let focusedField { withAnimation { proxy.scrollTo(focusedField,anchor:.top) } }
            }
        }.background(SecureTheme.canvas).foregroundStyle(SecureTheme.text).tint(SecureTheme.brand).preferredColorScheme(.light)
    }
}
struct SecureEntryView: View {
    @Binding var code:String
    @Binding var name:String
    let busy:Bool
    let message:String
    let onStart:()->Void
    @FocusState private var focus:Field?
    private enum Field { case code,name }
    private var ready:Bool { !busy && SecureInputPolicy.code(code) != nil && !name.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty && name.count<=120 }
    var body: some View {
        VStack(alignment:.leading,spacing:20) {
            Text("Deinen Test starten").font(.largeTitle.bold()).fixedSize(horizontal:false,vertical:true)
            VStack(alignment:.leading,spacing:8) {
                Text("Testcode").font(.headline)
                TextField("Code deiner Lehrkraft",text:$code).textInputAutocapitalization(.characters)
                    .textContentType(.oneTimeCode).autocorrectionDisabled().focused($focus,equals:.code).submitLabel(.next)
                    .onSubmit { focus = .name }.secureField("entry.code")
            }
            VStack(alignment:.leading,spacing:8) {
                Text("Name oder Kürzel").font(.headline)
                TextField("Dein Name oder vereinbartes Kürzel",text:$name).textContentType(.nickname).autocorrectionDisabled()
                    .focused($focus,equals:.name).submitLabel(.go).onSubmit { if ready { onStart() } }.secureField("entry.name")
            }
            if !message.isEmpty { Label(message,systemImage:"exclamationmark.circle.fill").font(.callout).foregroundStyle(SecureTheme.errorText).fixedSize(horizontal:false,vertical:true).padding(12).frame(maxWidth:.infinity,alignment:.leading).background(SecureTheme.errorFill,in:RoundedRectangle(cornerRadius:12)) }
            Button(action:{ if ready { focus=nil;onStart() } }) {
                HStack(spacing:10) {
                    if busy { ProgressView().tint(SecureTheme.surface) }
                    Text(busy ? "Test wird geprüft …" : "Test starten").font(.headline).fixedSize(horizontal:false,vertical:true)
                }.frame(maxWidth:.infinity,minHeight:52).padding(.horizontal,12).padding(.vertical,4)
            }.buttonStyle(.plain).foregroundStyle(ready || busy ? SecureTheme.surface : SecureTheme.secondaryText)
                .background(ready || busy ? SecureTheme.brand : SecureTheme.field,in:RoundedRectangle(cornerRadius:14))
                .overlay(RoundedRectangle(cornerRadius:14).stroke(ready || busy ? SecureTheme.brand : SecureTheme.border,lineWidth:1))
                .disabled(!ready).secureMeasure("entry.start",role:"tap")
            Text(helper).font(.footnote).foregroundStyle(SecureTheme.secondaryText).fixedSize(horizontal:false,vertical:true)
        }.padding(24).background(SecureTheme.surface,in:RoundedRectangle(cornerRadius:24))
            .foregroundStyle(SecureTheme.text).secureMeasure("entry",role:"center")
            .preference(key:SecureEntryFocusKey.self,value:focus.map { $0 == .code ? "entry.code" : "entry.name" })
    }
    private var helper:String {
        if name.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty { return "Gib den Testcode und deinen Namen oder dein Kürzel ein." }
        if SecureInputPolicy.code(code)==nil { return "Gib den Code deiner Lehrkraft ein." }
        return "Das Gerät wird erst nach deiner Bestätigung für die Prüfung gesperrt."
    }
}
private extension View {
    func secureField(_ id:String)->some View {
        font(.title3).foregroundStyle(SecureTheme.text).padding(.horizontal,14).padding(.vertical,12)
            .frame(minHeight:52).background(SecureTheme.field,in:RoundedRectangle(cornerRadius:12))
            .overlay(RoundedRectangle(cornerRadius:12).stroke(SecureTheme.border,lineWidth:1.5))
            .id(id).accessibilityIdentifier(id).secureMeasure(id,role:"field")
    }
}
