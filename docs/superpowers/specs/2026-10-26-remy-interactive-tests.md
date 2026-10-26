# Remy: echte interaktive Testaufgaben

GC-EXTENDED-QUESTION-TYPES-01 / GC-DESIGN-05-Folgeauftrag26Oct2026. User explicitly requests integrating the saved homepage blueprints and existing real-AI laboratory into normal Remy for real tests, prioritising timeline, coordinate plane, marking in an image, angle measurement and picture sequences. Prior requests explicitly opt out of repeated design/permission questions; routine implementation decisions are delegated.

Decision: reuse the visual type and secure contracts from PR265/296 on current live integrationf8274f06. No second generator, no raw task JSON in teacher UI, no executable AI markup. Resolve integration conflicts preserving current feedback-learning and server guards. Existing twelve visual formats remain available. Add timeline and sequence; improve the plant with the approved botanical image and preserve reversible assignment/keyboard controls from homepage/PR300.

## Data interfaces for the two new visual formats

All use existing task schemaVersion2, maxPoints and private solution. Public spec never contains the correct event mapping/order. All IDs follow existing safeId rule; strings plain bounded text. Browser/AI/Assessment validation and grading must agree.

- timeline spec={min:number,max:number,unit:string,ticks:[{id,value,label}],events:[{id,text}]}.2–6 unique ticks in increasing numeric order inside min..max (min<max),2–6 events with equal count. tick.label is a displayed date, events have no leaked year. solution={assignments:{tickId:eventId}} is a complete bijection. Answer has same mapping, may be partial/null during editing. Positions use the true numeric axis, not evenly spaced dates. Keyboard/click/drag assignment, remove/change. Public-only geometry validation can use synthetic bijection but must never expose it.
- sequence spec={family:'butterfly'|'water-cycle'|'plant-growth',items:[{id,illustration,caption}]}. Exactly4 unique items and unique illustrations matching family. Allowed illustration IDs: butterfly:egg,caterpillar,chrysalis,butterfly; water-cycle:evaporation,condensation,precipitation,collection; plant-growth:seed,germination,seedling,flowering. solution={order:[itemId...]} is a complete permutation. Answer is an ID array only after interaction; no untouched initial arrangement credited. Reorder by buttons/two-click and drag, preserve feedback after saved/reloaded answer. Use homepage butterflyArt and own constrained SVG diagrams; no free image URLs or generated code.

Image marking uses the existing bounded hotspot/labeling scene contract (plant,sentence,receipt), with the approved botanical illustration for plant. No claim of arbitrary uploaded-image region grounding in this release; AI must not invent a scene or tell pupils unseen image content. Generated/uploaded arbitrary images need a separately validated region/asset contract. Standard tasks with ordinary media remain available.

Angle: existing direct aligned protractor, numeric measured answer, no digital solution before submission; tolerance3deg existing laboratory contract. Coordinate: existing points/segment widget and keyboard/numeric alternative; blueA/orangeB, no prefilled solution. Timeline is multi-event, not one-point scale.

## Normal Remy connection

Use existing test job/schema/validation/revision pipeline; provide teacher-readable format choices, optional allowedVisualFormats copied into persisted job/repair checks. Defaults prefer the requested five (hotspot and labeling form one picture category), never a forced format quota. Existing clients without field preserve prior compatibility. Selected formats are server-validated; disallowed output fails/repairs instead of silently changing learning goal. Saved blueprints selected to relevant formats and passed as bounded authoring guidance, not treated as trusted instructions or as permission to bypass schema.

## Completion and boundaries

Meaningful tests cover generated/edited/saved/published/public paper/answer/grading boundaries, malformed specs, partial/cleared responses, forbidden formats, point consistency and all three validator copies. Browser smoke through actual normal Remy UI and secure student render; independent review on exact source. Use existing laboratory services/keys for bounded evidence; no new provider setup. A fake/mock generation is not a live AI proof. Preserve request/attempt IDs; never restart an uncertain paid operation. Production/backend live not authorised by this new task; prepare reviewable integration and separate test environment, name deployment status honestly. Homepage stays unchanged.
