import SwiftUI
struct SecureStatusPresentation {
    enum Kind { case progress,warning,success }
    let kind:Kind
    let title:String
    let message:String
    let actionTitle:String?
    let busy:Bool
    init(phase:SecureExamCoordinator.Phase,message:String,busy:Bool) {
        self.busy=busy
        self.message=message.isEmpty ? "Apple bereitet die geschützte Prüfung vor …" : message
        switch phase {
        case .completed:kind = .success;title="Abgabe gespeichert";actionTitle="Zurück zum Start"
        case .recovery:kind = .warning;title="Prüfung fortsetzen";actionTitle="Verbindung und Prüfungsstand prüfen"
        case .interrupted:kind = .warning;title="Prüfung unterbrochen";actionTitle="Verbindung und Prüfungsstand prüfen"
        case .waiting:kind = .progress;title="Du bist bereit";actionTitle=nil
        case .submitting:kind = .progress;title="Abgabe wird gesendet";actionTitle=nil
        case .verifying:kind = .progress;title="Abgabe wird bestätigt";actionTitle=nil
        default:kind = .progress;title="Prüfungsmodus wird gestartet";actionTitle=nil
        }
    }
}
struct SecureStatusView:View {
    let presentation:SecureStatusPresentation
    let onAction:()->Void
    var body:some View {
        VStack(alignment:.leading,spacing:20) {
            HStack {
                Spacer()
                if presentation.kind == .success { Image(systemName:"checkmark.circle.fill").font(.system(size:54)).foregroundStyle(SecureTheme.completeText) }
                else if presentation.kind == .warning { Image(systemName:"exclamationmark.circle.fill").font(.system(size:48)).foregroundStyle(SecureTheme.warningText) }
                else { ProgressView().controlSize(.large).tint(SecureTheme.brand).accessibilityLabel(presentation.title) }
                Spacer()
            }
            Text(presentation.title).font(.title2.bold()).fixedSize(horizontal:false,vertical:true)
            Text(presentation.message).foregroundStyle(SecureTheme.secondaryText).fixedSize(horizontal:false,vertical:true)
            if presentation.kind == .warning {
                Text("Bei anhaltender Störung bitte die Lehrkraft informieren. Ein Neustart ist keine bestätigte Abgabe.")
                    .font(.footnote).foregroundStyle(SecureTheme.warningText).fixedSize(horizontal:false,vertical:true).padding(12).background(SecureTheme.warningFill,in:RoundedRectangle(cornerRadius:12))
            }
            if let action=presentation.actionTitle {
                Button(action:onAction) { Text(action).font(.headline).fixedSize(horizontal:false,vertical:true).frame(maxWidth:.infinity,minHeight:52).padding(12) }
                    .buttonStyle(.plain).foregroundStyle(SecureTheme.surface).background(SecureTheme.brand,in:RoundedRectangle(cornerRadius:14))
                    .disabled(presentation.busy).secureMeasure("status.action",role:"tap")
            }
        }.padding(24).frame(maxWidth:.infinity,alignment:.leading).background(SecureTheme.surface,in:RoundedRectangle(cornerRadius:24))
            .foregroundStyle(SecureTheme.text).secureMeasure("status",role:"center")
    }
}
