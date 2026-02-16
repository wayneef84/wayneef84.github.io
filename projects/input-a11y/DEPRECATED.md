# ⚠️ DEPRECATED - input-a11y (v0)

**Status:** End of Life
**Replacement:** `/projects/input-a11y_v2/`
**Sunset Date:** Q2 2026

---

## What Changed?

This version (v0, original) has been superseded by **input-a11y_v2**, which includes:

- ✅ All features from v0
- ✅ Enhanced OCR configuration
- ✅ Additional text transform modes (UPPERCASE, LOWERCASE)
- ✅ Character mode settings (OFF, MIN, MAX, REQ)
- ✅ Improved storage architecture (shared `StorageManager.js`)
- ✅ Reduced code duplication

---

## Migration Instructions

### 1. Update Bookmarks/Links
Replace any links to:
```
/projects/input-a11y/
```

With:
```
/projects/input-a11y_v2/
```

### 2. Check Your Settings
Settings are stored by namespace (`input_a11y`) and will be automatically available in v2. Your preferences will be preserved:
- Theme selection
- Scan region settings
- Feedback preferences
- All OCR settings

### 3. Test v2
Open the new version and verify all features work:
- [ ] Theme selection
- [ ] OCR settings persistence
- [ ] Scan history retrieval
- [ ] Barcode scanning
- [ ] All saved preferences present

---

## Why Deprecate?

1. **Code Consolidation:** Three versions → One canonical version
2. **Better Defaults:** v2 includes improved default settings
3. **Shared Library:** Storage layer now reusable across projects
4. **Maintenance:** Single codebase easier to maintain and update
5. **Feature Parity:** v2 has all v0 functionality plus improvements

---

## Timeline

| Date | Action |
|------|--------|
| 2026-02-15 | Marked as deprecated |
| 2026-05-15 | No new features/fixes |
| 2026-08-15 | Removal from repository |

---

## Questions?

If you experience any issues:
1. Check the [input-a11y_v2 README](../input-a11y_v2/README.md)
2. Review [StorageManager documentation](../../lib/StorageManager.md)
3. Compare settings in browser DevTools → Application → Storage

**Rollback:** You can temporarily access this version at the current URL, but it will no longer receive updates or support.

---

**Deprecated:** 2026-02-15
**Next Review:** 2026-05-15
