# GradeCrew Shared Design System

This directory is the single source of truth for visual GradeCrew decisions shared by:

- the GradeCrew web product,
- the native GradeCrew Teacher app,
- GradeCrew Secure where appropriate.

The goal is to stop copying colors, spacing, mascot paths and visual decisions into multiple products.

## Source-of-truth files

### `tokens.json`
Contains platform-neutral design values: colors, spacing, radii, typography sizes, layout limits and motion rules.

Do not introduce a new permanent brand color, radius scale or spacing constant directly in a product unless it first exists here.

### `assets.json`
Contains canonical mascot and brand asset names. The actual source files continue to live in `assets/gradecrew/`.

Product code should refer to semantic names such as `coco`, `remy`, `emmi`, `wilma`, `welcome` and `finale`, not create new product-specific copies of the same artwork.

### Generated platform files

`tools/generate-gradecrew-design.mjs` reads the shared files and writes platform-specific outputs:

- `generated/gradecrew-design-tokens.css` for web,
- `generated/gradecrew-assets.js` for web asset lookup,
- `native/Shared/GradeCrewDesignTokens.swift` for SwiftUI,
- `native/Shared/GradeCrewAssets.swift` for native semantic asset lookup.

Generated files must not become independent sources of truth. Edit the JSON source and regenerate instead.

## What can be changed once

The following should be changed centrally and then regenerated/rebuilt:

- GradeCrew colors,
- spacing scale,
- corner radii,
- standard touch target,
- major font sizes,
- canonical mascot names and roles,
- mascot source artwork,
- logo/icon source artwork,
- shared scene artwork.

Example: if Remy's approved primary illustration changes, replace the canonical source asset referenced by `assets.json`. Web and native packaging then consume that same source rather than maintaining separate Remy copies.

## What is shared by specification, not by executable code

A native SwiftUI card and an HTML/CSS card cannot use the same executable layout component. They should instead use:

1. the same design tokens,
2. the same content hierarchy,
3. the same component specification,
4. the same accessibility rules,
5. the same canonical assets.

This keeps the products visually aligned while allowing each platform to remain native and accessible.

## Component contract

Shared components should follow semantic contracts rather than pixel copies. Initial contracts:

- `PrimaryButton`: primary color, minimum 44 pt/px touch target, control radius.
- `SecondaryButton`: surface/soft treatment, same touch target and focus/accessibility behavior.
- `GradeCrewCard`: surface, border, card radius, restrained shadow.
- `PageHeader`: title, optional supporting text, optional primary action.
- `MascotCoach`: one mascot, one role, short supporting message; mascot never replaces status text.
- `TestCard`: title, metadata, state, primary action, secondary actions under overflow/more.

Platform-specific navigation may differ. iPhone/iPad should follow Apple navigation conventions; web should follow responsive browser conventions.

## Asset distribution

`assets/gradecrew/` remains the canonical artwork library.

Web can reference these assets directly.

Native apps should package generated/converted release assets from this canonical library rather than keeping manually edited duplicates. A later asset pipeline may additionally publish versioned, cacheable artwork for content-only updates. Remote assets must never contain executable code and the app must retain a safe bundled fallback.

## Versioning

Every intentional visual-system change increments `version` in `tokens.json` and/or `assets.json`.

Suggested policy:

- patch: asset cleanup or tiny value correction without changed component behavior,
- minor: new token, new mascot pose/scene, compatible new component pattern,
- major: renamed semantic roles or breaking component contract.

Teacher and Secure releases should record the design-system version they were built against.

## Migration rule

Existing `gradecrew-brand.css`, `design-system.css`, `workspace.css` and native files remain operational while migration is incremental. Do not perform a large visual rewrite in one step.

Migration order:

1. generate shared tokens,
2. import generated web tokens before existing GradeCrew CSS,
3. replace duplicated root variables with aliases to shared tokens,
4. create the Teacher app using the generated Swift tokens from day one,
5. migrate mascot lookups to the shared manifest,
6. add automated checks that reject missing canonical assets and stale generated files,
7. only then consolidate older CSS declarations where regression tests prove safety.

## GradeCrew Secure

Secure should share brand identity, typography and core colors, but examination screens may intentionally be calmer and more utilitarian. Security state must never depend on mascot art or color alone.
