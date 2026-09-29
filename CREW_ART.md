# GradeCrew clay art · 1

Integrated against e30dcf61801c3f4050d47a91e73ffe06ffd9e2ae on fix/gradecrew-staging-polish. Staging only. Tutorial logic and the gc22–gc25 polish modules are retained.

## Character assets

penguin-guide, elephant-create, fox-improve and owl-grade SVGs package the approved six-pose raster sheets as WebP, preserving alpha. Each contains six SVG view fragments (`#pose-1` through `#pose-6`), selected by the tutorial stage. Pixels are not vector art; SVG is the viewport/container. Default viewport is the greeting pose. Existing welcome/legacy paths remain compatible. The small original vector favicon is penguin-icon.svg.

Coco: greet, introduce, pause, listen, invite, celebrate.
Remy: greet, explain, think, inspiration, present, hand over.
Emmi: greet, inspect, find error, alternatives, approve, encourage revision.
Wilma: greet, explain, time limit, inspect, celebrate, judgement.

## Scenes

Start page and introduction: clay-welcome.
Handoffs: clay-introduce-remy/emmi/wilma.
Thanks: clay-thanks-remy/emmi/wilma.
Preparation: clay-wait.
Completion and Crew question: clay-finale / demo-crew.
Additional ready-to-use illustrations: clay-save, clay-retry, clay-your-turn. These are packaged but deliberately not inserted into compact action cards, where preserving visibility of real controls matters.

The group scenes have a warm ivory background; individual character sheets have alpha. All images are self-contained without remote image hosts. The build copies and hashes every SVG.

## Motion and limits

crew-clay.css adds one-shot entrance, thinking and celebration transforms, not frame-by-frame character animation. No new observers, timers or dependencies. Motion is disabled with prefers-reduced-motion. Group images are decorative where nearby text conveys meaning; the homepage has a descriptive alt. Reduced heights on narrow/short screens keep controls reachable.

Validated by existing automated tour/UI tests and build; artwork SVG exports inspected separately. Authenticated Chrome/Safari end-to-end visual acceptance remains a staging check. Do not describe CSS whole-figure transforms as articulated flipper/trunk animation.
