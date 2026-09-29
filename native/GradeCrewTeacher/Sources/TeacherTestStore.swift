import Foundation
import Combine

@MainActor
final class TeacherTestStore: ObservableObject {
    @Published private(set) var tests: [GradeCrewTestSummary]
    @Published private(set) var isLoading = false
    @Published private(set) var lastError: String?

    init(tests: [GradeCrewTestSummary] = GradeCrewTestSummary.previewFixtures) {
        self.tests = tests
    }

    var publishedCount: Int { tests.filter { $0.status == .published }.count }
    var draftCount: Int { tests.filter { $0.status == .draft }.count }
    var endedCount: Int { tests.filter { $0.status == .ended }.count }

    func refresh() async {
        // Phase 1 deliberately stays dependency-free so the native shell can be built
        // immediately. Phase 2 replaces this fixture source with Firebase Auth/Firestore.
        isLoading = true
        lastError = nil
        defer { isLoading = false }
        await Task.yield()
    }

    func test(id: String) -> GradeCrewTestSummary? {
        tests.first { $0.id == id }
    }
}
