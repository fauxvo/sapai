---
"@sapai/api": minor
"@sapai/dashboard": minor
"@sapai/shared": minor
---

Add business rules engine, message decomposer, corroborator, and delivery date support

- **BusinessRulesEngine**: New "guarding" pipeline stage with 19 safety rules that evaluate before plan building. Blocks price modifications, negative quantities, deleted PO changes, past delivery dates, and more.
- **MessageDecomposer**: Pre-processes complex emails and multi-item messages before intent parsing, extracting structured change specifications.
- **Corroborator**: Cross-references resolved SAP entities against parsed intent fields via weighted signals (quantity, description, price, plant, unit, delivery date, qty/unit coherence).
- **Delivery date support**: End-to-end — intent registry, schedule line expansion, entity metadata, corroboration signal, plan builder routing, executor via schedule line service, dashboard display.
- **Price modification blocked**: Defense-in-depth at three layers (intent registry, AI prompt, business rules engine).
- **Current date injection**: AI prompts now include today's date for correct year inference on date fields.
- **Dashboard improvements**: HR separators between pipeline stages, collapsible guard checks table, violation severity cards, delivery date in SAP item data.
