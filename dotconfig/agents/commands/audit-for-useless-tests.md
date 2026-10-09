---
description: Audit for useless tests
---

do a sweep for tests that do nothing than re-assert the source, are low value, duplicative, etc. remove them and then see whether the prod code can be simplified now that the tests no longer demand seams to exist

tests must justify their presence. tests that require changes whenever the underlying source changes are not good tests since they assert implementation, not behavior
