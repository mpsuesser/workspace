# Content Verification & Fabrication Audit

Every piece of content in a skill must trace back to a fetched source. This reference describes how to verify content and prevent fabrication.

## The Fabrication Problem

When documentation retrieval is incomplete, agents tend to fill gaps with general knowledge. This produces content that LOOKS correct but may contain:

- **Invented API methods** that don't exist
- **Guessed parameter names** that are wrong
- **Made-up error codes** with plausible-looking numbers
- **Fabricated webhook payloads** with wrong field names
- **Incorrect SDK patterns** from pre-rewrite versions

This is worse than having no content — it actively misleads.

## Verification Checklist

After writing skill content, audit every category:

### 1. SDK Method Names

```
For each client.resource.method() call:
□ Method name appears in fetched SDK docs or API reference?
□ Parameter names match the fetched schema?
□ Return type matches fetched response schema?
□ Constructor options match fetched SDK README?
```

### 2. API Endpoints

```
For each endpoint path:
□ Path appears in fetched API reference or llms.txt?
□ HTTP method is correct (GET/POST/PATCH/DELETE)?
□ Request body fields match fetched schema?
□ Response structure matches fetched examples?
```

### 3. Error Codes

```
For each error code listed:
□ Code number appears in fetched error reference?
□ Error title matches the fetched documentation?
□ HTTP status mapping is from fetched source?
```

### 4. Webhook Events

```
For each webhook event_type:
□ Event name appears in fetched webhook reference?
□ Payload fields match fetched event schema?
□ Trigger conditions match fetched documentation?
```

### 5. Code Examples

```
For each code example:
□ Import paths are from fetched SDK docs?
□ API calls use verified method names?
□ Configuration options match fetched reference?
□ Is NOT copied from an outdated SDK version?
```

### 6. Configuration Values

```
For each configuration option/default:
□ Option name appears in fetched docs?
□ Default value matches fetched reference?
□ Allowed values match fetched enum/options?
```

## Provenance Tracking

For Comprehensive-tier skills, track where each section's content came from:

```markdown
| Skill Section | Source | Lines/URL | Verified? |
|---------------|--------|-----------|-----------|
| Call Control commands | llms-full.txt lines 787-1260 | ✅ |
| Webhook events | llms-full.txt lines 1398-1870 | ✅ |
| SDK constructor | telnyx-node README (GitHub) | ✅ |
| Error codes | llms-full.txt lines 8228-9350 | ✅ |
| TeXML verbs | llms-full.txt lines 102700-105200 | ✅ |
```

This table doesn't need to be IN the skill — it's for the creation process.

## What To Do With Unverified Content

```
Content you're confident about from general knowledge?
├─ Can you verify it quickly? → Fetch the source, then include
├─ Is it critical/specific (API names, error codes)? → Do NOT include without source
├─ Is it general/obvious (e.g., "use HTTPS")? → OK to include, mark as common knowledge
└─ Is it from a prior version? → DANGEROUS — old SDK patterns cause real errors
```

### The Rule

**Specific technical claims require specific sources.** You can state "Telnyx uses Ed25519 for webhook signatures" if you fetched that from their docs. You cannot state "the verify method is called `client.webhooks.verify()`" unless you fetched that exact method name.

## Common Fabrication Patterns

Watch for these in your own output:

| Pattern | Risk | Fix |
|---------|------|-----|
| Listing 10+ error codes with exact numbers | High — likely invented | Verify each against fetched error table |
| SDK method names following "obvious" conventions | Medium — may be wrong | Check fetched SDK docs for exact names |
| Webhook payload JSON with specific field names | High — fields may differ | Verify against fetched event schemas |
| Configuration defaults ("default: 30 seconds") | Medium — often wrong | Check fetched config reference |
| Rate limits ("100 req/s") | High — usually wrong | Only from fetched docs |
| TeXML/XML verb attributes | High — attribute names vary | Verify against fetched verb reference |

## Integration with Synthesis

The verification phase should happen AFTER synthesis but BEFORE finalization:

```
Phase 4: Synthesis → Draft skill content
Phase 5: Verification → Audit every claim against sources
  ├─ Verified → Keep
  ├─ Unverified but fetchable → Fetch source, then keep
  ├─ Unverified and unfetchable → Remove or mark as unverified
  └─ Contradicted by source → Fix
Phase 6: Finalize → Publish verified skill
```
