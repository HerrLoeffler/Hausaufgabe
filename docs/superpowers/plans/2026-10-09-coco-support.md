# Coco support and durable memory implementation plan

Goal: Coco retrieves owned tests using content/image metadata, retains account memory without TTL and explains current work with evidence.
Architecture: one authenticated support callable owns account-memory and bounded test search; assistant model receives server-authorized context. Existing navigation remains the only client action. No Production deployment.
Spec: user approval in current chat, GC-CREW-AI-01, workstreams/crew-assistant.md.

- [ ] Add pure search/memory normalization tests: inflected orange dragon, followup motif, missing metadata, bounded history, no solution/result content, account isolation by repository query.
- [ ] Implement functions/lib/coco-support.js and authenticated cocoSupport callable (read, remember, preferences, clear, search). Account document has no TTL. Never accept a target uid from client.
- [ ] Enrich crewAssistant with memory, current owned quiz and evidence. Avoid repeating answered navigation; no unsupported success claims.
- [ ] Client restores account conversation, serializes persistence, handles account switches, offers editable preferences and memory deletion; motif/followup routes to real server search and result cards.
- [ ] Run meaningful module/contract tests and syntax checks; preserve local designs. Save source and handoff; deploy only through existing reviewed Staging path.
