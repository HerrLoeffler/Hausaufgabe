import Foundation

enum AssessmentLabTimer {
    static func schedule(every interval: TimeInterval, handler: @escaping () -> Void) -> Timer {
        let timer = Timer(timeInterval: interval, repeats: true) { _ in handler() }
        RunLoop.main.add(timer, forMode: .common)
        return timer
    }
}
