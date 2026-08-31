---
name: Orval integer compatibility
description: Orval's generated Zod output is currently paired with Zod 3 in this workspace.
---

When adding numeric API fields, prefer `number` in the OpenAPI contract unless integer-specific validation is essential.

**Why:** The installed Orval/Zod combination emitted `z.int()`, which is unavailable in the workspace's Zod 3 runtime and breaks the generated library typecheck.

**How to apply:** After every OpenAPI change, run codegen and the library typecheck; treat generated-schema compatibility as part of the contract design.