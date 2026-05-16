---
description: Use when explicitly prompted to engage in Documentation-Driven Development (or "DDD")
---

# Documentation-Driven Development

The philosophy behind Documentation-Driven Development is simple:

**From the perspective of a user, if a feature is not documented, then it doesn't exist, and if a feature is documented incorrectly, then it's broken.**

---

## Document the feature **first**.

Documentation is the best way to define a feature, so we begin with the documentation.

Figure out how you're going to describe the feature to users.

Remember: If it's not documented, it doesn't exist.

## Write tests that guarantee the documentation is telling the truth.

Once documentation has been written, test-driven development should commence. Unit tests should be written that test the features as described by the documentation. If the functionality ever comes out of alignment with the documentation, tests should fail.

## All modifications to existing features will begin with the documentation.

- When a feature is being modified, it should be modified documentation-first.
- When documentation is modified, so should be the tests.

# Read all the references

- [The Divio Documentation System: About](./divio-documentation-system/0-about.md)
- [The Divio Documentation System: Introduction](./divio-documentation-system/1-introduction.md)
- [The Divio Documentation System: Tutorials](./divio-documentation-system/2-tutorials.md)
- [The Divio Documentation System: How-To Guides](./divio-documentation-system/3-how-to-guides.md)
- [The Divio Documentation System: Reference Guides](./divio-documentation-system/4-reference-guides.md)
- [The Divio Documentation System: Explanation](./divio-documentation-system/5-explanation.md)
- [The Divio Documentation System: Structure](./divio-documentation-system/6-structure.md)

- [Markdown Style Guide](./markdown-style-guide.md)
- [Writing Documentation](./writing-documentation.md)
- [Developer Experience](./developer-experience.md)
