import SwiftUI
import PhotosUI
import UniformTypeIdentifiers
import AVFoundation

/// All three sources use the same authenticated material upload and limits.
struct QuickRemyMaterialPicker: View {
    let enabled: Bool
    let remainingSlots: Int
    let uploading: Bool
    let onFiles: ([URL]) async -> Void
    let onImage: (Data, String) async -> Void
    let onError: (String) -> Void
    @State private var showSources = false
    @State private var showFiles = false
    @State private var showPhotos = false
    @State private var showCamera = false
    @State private var photos: [PhotosPickerItem] = []

    var body: some View {
        Button { showSources = true } label: {
            Label(uploading ? "Material wird hochgeladen …" : "Material auswählen", systemImage: "paperclip")
        }
        .disabled(!enabled || uploading || remainingSlots < 1)
        .confirmationDialog("Material hinzufügen", isPresented: $showSources, titleVisibility: .visible) {
            Button("Fotomediathek") { showPhotos = true }
            Button("Dateien") { showFiles = true }
            Button("Kamera") { Task { await openCamera() } }
            Button("Abbrechen", role: .cancel) {}
        }
        .photosPicker(isPresented: $showPhotos, selection: $photos, maxSelectionCount: max(1, remainingSlots), matching: .images, preferredItemEncoding: .compatible)
        .fileImporter(isPresented: $showFiles, allowedContentTypes: contentTypes, allowsMultipleSelection: true) { result in
            switch result {
            case .success(let urls): Task { await onFiles(urls) }
            case .failure(let error): onError(error.localizedDescription)
            }
        }
        .onChange(of: photos) { selected in
            guard !selected.isEmpty else { return }
            Task {
                for item in selected {
                    do {
                        guard let raw = try await item.loadTransferable(type: Data.self),
                              let image = UIImage(data: raw), let jpeg = image.jpegData(compressionQuality: 0.9) else {
                            throw NSError(domain: "GradeCrewMaterial", code: 1, userInfo: [NSLocalizedDescriptionKey: "Das Foto konnte nicht geladen werden. Bitte erneut auswählen."])
                        }
                        await onImage(jpeg, "Foto-\(UUID().uuidString.prefix(8)).jpg")
                    } catch { onError(error.localizedDescription) }
                }
                photos = []
            }
        }
        .fullScreenCover(isPresented: $showCamera) {
            QuickRemyCamera { image in
                showCamera = false
                guard let image, let jpeg = image.jpegData(compressionQuality: 0.9) else { return }
                Task { await onImage(jpeg, "Kamera-\(UUID().uuidString.prefix(8)).jpg") }
            }.ignoresSafeArea()
        }
    }

    private var contentTypes: [UTType] {
        [.pdf, .jpeg, .png, .plainText, .commaSeparatedText] + ["webp", "docx", "pptx", "xlsx"].compactMap { UTType(filenameExtension: $0) }
    }

    @MainActor
    private func openCamera() async {
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else {
            onError("Dieses Gerät hat keine verfügbare Kamera.")
            return
        }
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        var allowed = status == .authorized
        if status == .notDetermined { allowed = await AVCaptureDevice.requestAccess(for: .video) }
        guard allowed else { onError("Bitte Kamera-Zugriff in den App-Einstellungen erlauben."); return }
        showCamera = true
    }
}

private struct QuickRemyCamera: UIViewControllerRepresentable {
    let onComplete: (UIImage?) -> Void
    func makeCoordinator() -> Coordinator { Coordinator(onComplete: onComplete) }
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.mediaTypes = [UTType.image.identifier]
        picker.delegate = context.coordinator
        return picker
    }
    func updateUIViewController(_ picker: UIImagePickerController, context: Context) {}
    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let onComplete: (UIImage?) -> Void
        init(onComplete: @escaping (UIImage?) -> Void) { self.onComplete = onComplete }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { onComplete(nil) }
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            onComplete(info[.originalImage] as? UIImage)
        }
    }
}
