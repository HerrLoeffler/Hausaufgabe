# GradeCrew Shared Design System

This directory is the single source of truth for visual GradeCrew decisions shared by the web product, GradeCrew Teacher and GradeCrew Secure where appropriate.

## Source files

- `tokens.json`: platform-neutral colors, spacing, radii, typography, layout, motion and shadows.
- `assets.json`: canonical semantic names for brand and Crew assets.
- `tools/generate-gradecrew-design.mjs`: generates platform outputs.

Permanent brand colors, spacing constants, radii or canonical mascot paths must be defined here first rather than copied into an individual product.

## Component contract

Web and native components share semantics, hierarchy, tokens and accessibility rules, not necessarily executable layout code. Initial contracts include `PrimaryButton`, `SecondaryButton`, `GradeCrewCard`, `PageHeader`, `MascotCoach` and `TestCard`.

## Asset rules

`assets/gradecrew/` remains the canonical artwork library. New product code should use semantic Crew names (Coco, Remy, Emmi, Wilma and named scenes) and must not create manually edited product-specific duplicates.

## Versioning

Intentional shared-system changes increment the version in `tokens.json` and/or `assets.json`.

- patch: cleanup/correction without changed component behavior
- minor: compatible token, asset or component-pattern addition
- major: renamed semantic roles or breaking component contract

## Migration

Existing `styles.css`, `design-system.css`, `gradecrew-brand.css` and `workspace.css` remain operational while migration is incremental. The generated tokens are loaded before these layers; new focused polish may consume shared variables while legacy declarations are removed only after regression tests prove safety.

GradeCrew Secure shares brand identity and core tokens but examination screens intentionally remain calmer and more utilitarian. Security state never depends on mascot art or color alone.
