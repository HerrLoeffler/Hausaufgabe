# AI collaboration core v1

Status: offline contract branch. No runtime activation.

## Implemented

- server-derived risk + complexity profile;
- one-call / two-call / three-call bounded collaboration plans;
- independent critic requirement for high-risk, high-complexity or semantic-review work;
- at most one repair and no repair loops;
- critical grading requires human review;
- critic packet excludes generator reasoning/provider identity by schema;
- structured critic result contract;
- fail-closed provider/job/data-class/region policy contract;
- tests for loop bounds, grading behavior, critic independence and privacy gate behavior.

## Deliberately not implemented

- no provider winner or hardcoded model role;
- no real privacy approval rows;
- no Production wiring;
- no new provider model allowlists;
- no automatic route publication.

## Next

1. Complete evaluator IAM bootstrap and 8-call Phase-A micro-pilot.
2. Review real Phase-A outputs and convert reviewed findings into role evidence.
3. Add deterministic validators for the first real runtime path (Crew intent).
4. Populate privacy/data-policy rows only from reviewed provider/data-processing facts.
5. Pilot Crew intent behind a feature flag before test generation moves to the new gateway.
