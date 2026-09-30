import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('first-guide-responsive.js', 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const { computeAdaptiveGuidePlan, isCompactGuideViewport } = await import(moduleUrl);

const viewports = [
  ['iPhone SE / small phone', 320, 568],
  ['iPhone classic', 375, 667],
  ['iPhone Pro', 402, 874],
  ['iPhone Pro Max', 430, 932],
  ['Android compact', 360, 640],
  ['Phone landscape', 844, 390]
].map(([name, width, height]) => ({ name, left: 0, top: 0, width, height }));

for (const viewport of viewports) {
  test(`${viewport.name}: guide and active control keep separate visible zones`, () => {
    assert.equal(isCompactGuideViewport(viewport), true);

    const cases = [
      { top: 72, height: 52 },
      { top: viewport.height - 104, height: 56 },
      { top: 150, height: Math.min(380, viewport.height - 180) }
    ];

    for (const target of cases) {
      const plan = computeAdaptiveGuidePlan({ viewport, target, cardHeight: 300 });
      const effectiveCardHeight = Math.min(300, plan.maxCardHeight);
      const cardBottom = plan.cardTop + effectiveCardHeight;

      assert.ok(plan.cardTop >= viewport.top, 'guide starts inside visible viewport');
      assert.ok(cardBottom <= viewport.top + viewport.height, 'guide ends inside visible viewport');
      assert.ok(plan.availableBottom > plan.availableTop, 'active control receives a visible zone');

      if (plan.placement === 'top') {
        assert.ok(cardBottom < plan.availableTop, 'top guide does not overlap target zone');
      } else {
        assert.ok(plan.availableBottom < plan.cardTop, 'bottom guide does not overlap target zone');
      }
    }
  });
}

test('placement remains deterministic when supplied during settling scrolls', () => {
  const viewport = { left: 0, top: 0, width: 390, height: 844 };
  const first = computeAdaptiveGuidePlan({ viewport, target: { top: 700, height: 50 }, cardHeight: 280 });
  assert.equal(first.placement, 'top');

  const settled = computeAdaptiveGuidePlan({
    viewport,
    target: { top: 470, height: 50 },
    cardHeight: 280,
    placement: first.placement
  });
  assert.equal(settled.placement, 'top');
});
