import Foundation

enum GradeCrewTestStatus: String, CaseIterable, Codable, Hashable {
    case draft
    case published
    case ended

    var label: String {
        switch self {
        case .draft: return "Entwurf"
        case .published: return "Veröffentlicht"
        case .ended: return "Beendet"
        }
    }

    var systemImage: String {
        switch self {
        case .draft: return "pencil"
        case .published: return "checkmark.circle.fill"
        case .ended: return "archivebox.fill"
        }
    }
}

struct GradeCrewTestSummary: Identifiable, Hashable {
    let id: String
    let title: String
    let subject: String
    let gradeLabel: String
    let status: GradeCrewTestStatus
    let submissionCount: Int
    let totalPoints: Double
    let updatedAt: Date

    static let previewFixtures: [GradeCrewTestSummary] = [
        GradeCrewTestSummary(
            id: "preview-deutsch-9",
            title: "Satzglieder",
            subject: "Deutsch",
            gradeLabel: "9. Klasse",
            status: .published,
            submissionCount: 18,
            totalPoints: 20,
            updatedAt: Date().addingTimeInterval(-2_700)
        ),
        GradeCrewTestSummary(
            id: "preview-mathe-9",
            title: "Prozentrechnung",
            subject: "Mathematik",
            gradeLabel: "9. Klasse",
            status: .draft,
            submissionCount: 0,
            totalPoints: 20,
            updatedAt: Date().addingTimeInterval(-86_400)
        ),
        GradeCrewTestSummary(
            id: "preview-gpg-9",
            title: "BRD und DDR",
            subject: "GPG",
            gradeLabel: "9. Klasse",
            status: .ended,
            submissionCount: 21,
            totalPoints: 24,
            updatedAt: Date().addingTimeInterval(-172_800)
        ),
    ]
}
