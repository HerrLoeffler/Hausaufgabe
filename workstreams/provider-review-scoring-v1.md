# Provider review scoring v1

Status: offline development evidence tooling.

## Implemented

- deterministic Phase-A development checks;
- strict Crew intent JSON patch contract for benchmark outputs;
- answer-leak checks for game hints;
- exact constraint-preservation checks for selected rewrite cases;
- bounded manual-review schema;
- role-specific competency matrix;
- no global winner field by design;
- no runtime authorization from development results.

## Next

After evaluator IAM bootstrap:
1. run the 8-call Crew-intent micro-pilot;
2. download the private synthetic review packet;
3. run deterministic scoring;
4. manually review the small result set;
5. inspect role-level signals before expanding the pilot.

Do not publish routing from these development cases.
