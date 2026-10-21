import SwiftUI

// The same versioned content generates the public website pages. This reader
// never starts a network request or opens another app, including when offline.
private struct SecureLegalContent: Decodable {
    struct Page: Decodable, Identifiable {
        let id:String
        let title:String
        let intro:String
        let sections:[Section]
    }
    struct Section: Decodable { let title:String; let paragraphs:[String] }
    let updatedAt:String
    let pages:[Page]
    static func bundled() throws -> Self {
        guard let url=Bundle.main.url(forResource:"legal-content.de",withExtension:"json",subdirectory:"Legal") else {
            throw CocoaError(.fileNoSuchFile)
        }
        return try JSONDecoder().decode(Self.self,from:Data(contentsOf:url))
    }
}
private enum SecureLegalPage:String,Identifiable,CaseIterable {
    case privacy,imprint,support
    var id:String { rawValue }
    var title:String { switch self {case .privacy:return "Datenschutz";case .imprint:return "Impressum";case .support:return "Support"} }
}
struct SecureLegalLinks:View {
    @State private var selected:SecureLegalPage?
    var body:some View {
        ViewThatFits(in:.horizontal) {
            HStack(spacing:20) { links }
            VStack(spacing:4) { links }
        }.font(.footnote).frame(maxWidth:.infinity)
            .sheet(item:$selected) { page in SecureLegalSheet(initialPage:page) }
    }
    @ViewBuilder private var links:some View {
        ForEach(SecureLegalPage.allCases) { page in
            Button(page.title) { selected=page }.frame(minHeight:44).buttonStyle(.plain)
                .foregroundStyle(SecureTheme.brand).accessibilityIdentifier("legal."+page.rawValue)
        }
    }
}
private struct SecureLegalSheet:View {
    @Environment(\.dismiss) private var dismiss
    @State private var selected:SecureLegalPage
    private let content:SecureLegalContent?
    init(initialPage:SecureLegalPage) {
        _selected=State(initialValue:initialPage)
        content=try? SecureLegalContent.bundled()
    }
    var body:some View {
        NavigationStack {
            ScrollView {
                VStack(alignment:.leading,spacing:20) {
                    Picker("Information",selection:$selected) {
                        ForEach(SecureLegalPage.allCases) { Text($0.title).tag($0) }
                    }.pickerStyle(.menu).accessibilityLabel("Information auswählen")
                    if let content,let page=content.pages.first(where:{$0.id==selected.rawValue}) {
                        Text(page.title).font(.largeTitle.bold()).accessibilityAddTraits(.isHeader)
                        Text(page.intro).font(.title3).foregroundStyle(SecureTheme.secondaryText)
                        Text("Stand: "+content.updatedAt).font(.footnote).foregroundStyle(SecureTheme.secondaryText)
                        ForEach(Array(page.sections.enumerated()),id:\.offset) { _,section in
                            VStack(alignment:.leading,spacing:12) {
                                Text(section.title).font(.title2.bold()).accessibilityAddTraits(.isHeader)
                                ForEach(Array(section.paragraphs.enumerated()),id:\.offset) { _,paragraph in
                                    Text(paragraph).textSelection(.enabled).fixedSize(horizontal:false,vertical:true)
                                }
                            }
                        }
                    } else {
                        Text("Die Informationen konnten nicht geöffnet werden.").font(.headline)
                        Text("Bitte kontaktiere GradeCrew über martin.loeffler91@yahoo.de. Die öffentlichen Informationen findest du unter https://hausaufgabe-staging.web.app/datenschutz.html.").textSelection(.enabled)
                    }
                }.padding(24).frame(maxWidth:720,alignment:.leading).frame(maxWidth:.infinity)
            }.background(SecureTheme.canvas).foregroundStyle(SecureTheme.text)
                .navigationTitle("GradeCrew · Informationen").navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement:.confirmationAction) { Button("Fertig") { dismiss() } } }
        }.tint(SecureTheme.brand).preferredColorScheme(.light)
    }
}
