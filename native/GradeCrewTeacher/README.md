# GradeCrew Teacher

Native iPhone/iPad teacher application starter.

## Current state

Implemented on `feature/shared-gradecrew-design-system`:

- native SwiftUI app entry point,
- adaptive `NavigationSplitView`,
- initial GradeCrew dashboard,
- shared design tokens from `native/Shared/GradeCrewDesignTokens.swift`,
- shared semantic asset manifest from `native/Shared/GradeCrewAssets.swift`,
- dependency-free Xcode project generator,
- iPhone and iPad target families,
- iOS/iPadOS 16.0 deployment target.

No production backend changes are required by this starter.

## Generate Xcode project

From the repository root on a Mac:

```bash
python3 native/GradeCrewTeacher/generate_project.py
open native/GradeCrewTeacher/GradeCrewTeacher.xcodeproj
```

The generated project includes the Teacher source files and the shared GradeCrew Swift design files.

## Next implementation slice

1. verify the shell in iPhone + iPad simulators,
2. add Firebase Apple SDK,
3. connect existing teacher authentication,
4. load the real teacher test list,
5. implement native test details,
6. add the app-specific bridge into the existing GradeCrew creation/editor flow.

## Rule

Do not add Teacher-only hard-coded brand colors or duplicate mascot artwork. Change shared GradeCrew tokens/assets first and regenerate platform outputs.
