import Foundation

/// One shared wall clock keeps decorative motion independent of auth restoration.
enum GradeCrewBrandMotionPolicy {
    static let duration: TimeInterval = 1
    static let frameCount = 20

    enum Mascot: CaseIterable {
        case coco, remy, emmi, wilma
    }

    struct Point {
        let x: Double
        let y: Double
    }

    struct Sample {
        let frameIndex: Int
        let travelProgress: Double

        func center(for mascot: Mascot) -> Point {
            let destination: Point
            let startsLeft: Bool
            switch mascot {
            case .coco: destination = Point(x: 79, y: 43); startsLeft = true
            case .remy: destination = Point(x: 72, y: 119); startsLeft = true
            case .emmi: destination = Point(x: 181, y: 43); startsLeft = false
            case .wilma: destination = Point(x: 188, y: 119); startsLeft = false
            }
            let startX = startsLeft ? -30.0 : 290.0
            return Point(x: startX + (destination.x - startX) * travelProgress, y: destination.y)
        }
    }

    static func sample(startedAt: Date, now: Date, reduceMotion: Bool) -> Sample {
        if reduceMotion { return Sample(frameIndex: frameCount - 1, travelProgress: 1) }
        let elapsed = now.timeIntervalSince(startedAt)
        // Date subtraction can land just below a frame boundary; microseconds
        // retain ample precision for 50 ms frames without skipping that boundary.
        let bounded = elapsed.isNaN ? 0 : min(duration, max(0, elapsed))
        let time = (bounded * 1_000_000).rounded() / 1_000_000
        let frameIndex = min(frameCount - 1, Int(time / duration * Double(frameCount)))
        // Run at a steady pace, then ease into contact during the reaching frames.
        let travelProgress: Double
        if time < 0.6 {
            travelProgress = time / 0.7
        } else if time < 0.8 {
            let remaining = (0.8 - time) / 0.2
            travelProgress = 1 - remaining * remaining / 7
        } else {
            travelProgress = 1
        }
        return Sample(frameIndex: frameIndex, travelProgress: travelProgress)
    }

    static func shouldMirrorFrame(for mascot: Mascot, index: Int) -> Bool {
        // A few generated gait frames face outward. Normalize just those crops;
        // the reaching/cuddle frames already face the center correctly.
        switch mascot {
        case .emmi: return (4...7).contains(index)
        case .wilma: return [3, 5, 7, 9].contains(index)
        case .coco, .remy: return false
        }
    }

    /// Finite entries: a current snapshot, remaining frame changes, then the final hold.
    static func refreshDates(startedAt: Date, from now: Date, reduceMotion: Bool, isActive: Bool) -> [Date] {
        guard isActive, !reduceMotion, now < startedAt.addingTimeInterval(duration) else { return [] }
        let futureFrames = (0...frameCount).map {
            startedAt.addingTimeInterval(Double($0) * duration / Double(frameCount))
        }.filter { $0 > now }
        return [now] + futureFrames
    }
}
