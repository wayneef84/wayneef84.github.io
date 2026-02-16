# ⚠️ DEPRECATED - input-a11y_v1

**Status:** End of Life
**Replacement:** `/projects/input-a11y_v2/`
**Sunset Date:** Q2 2026

---

## What Changed?

This version (v1) has been superseded by **input-a11y_v2**, which includes:

- ✅ All features from v1
- ✅ Improved storage layer (shared `StorageManager.js`)
- ✅ Better OCR configuration options
- ✅ Enhanced text transform and character mode settings
- ✅ Reduced code duplication (extracted to shared library)

---

## Migration Instructions

### 1. Update Bookmarks/Links
Replace any links to:
```
/projects/input-a11y_v1/
```

With:
```
/projects/input-a11y_v2/
```

### 2. Check Your Settings
Settings are stored by namespace (`input_a11y`) and will be available in v2.

### 3. Test v2
Open the new version and verify all features work:
- [ ] Theme selection
- [ ] OCR settings persistence
- [ ] Scan history
- [ ] Barcode scanning

---

## Why Deprecate?

1. **Code Consolidation:** Reduced duplication from 443 LOC → 120 LOC of shared library
2. **Simplified Maintenance:** Single codebase instead of 3 versions
3. **Better Architecture:** Common storage API for future projects
4. **Future-Proof:** v2 ready for enhancement without carrying legacy

---

## Technical Details

### Storage Migration
Both versions use the same localStorage namespace (`input_a11y_settings`, `input_a11y_history`), so settings will be available in v2 immediately.

**Before:**
```javascript
// v1: Custom storage.js with boilerplate
StorageManager (149 LOC local file)
```

**After:**
```javascript
// v2: Shared StorageManager.js
StorageManager (320 LOC shared, configured per-project)
```

### Removed from Repository
- No files deleted yet
- v1 will be removed in Q2 2026
- Archive available at commit history if needed

---

## Questions?

If you experience any issues with v2:
1. Check the [input-a11y_v2 README](../input-a11y_v2/README.md)
2. Review [StorageManager documentation](../../lib/StorageManager.md)
3. Compare settings in browser DevTools → Application → Storage

**Rollback:** You can temporarily access this version at the current URL, but it will no longer receive updates.

---

**Deprecated:** 2026-02-15
**Next Review:** 2026-05-15
