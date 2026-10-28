# tests/theme

`hostile/*.json` are import samples that must all be rejected or cleaned by `FongTheme.importJSON` and must not run code, inject elements or pollute prototypes. File names start with a number. Expected result per sample:

| Sample | Expected |
|---|---|
| 01 huge file, 06 10,000 groups (too big), 05 05b 05c prototype keys, 08 08b future or bad version, 10 not JSON, 11 array, 16 wrong format, 17 deep nesting | rejected |
| 02 wrong types, 03 HTML in names, 04 css in colors, 06b many groups, 07 unknown ids, 09 css and js fields, 12 protected ids, 13 control characters, 14 out of range, 15 long names, 18 caps | cleaned (ok with a report) |

Run them by loading the homepage in a browser, calling `FongTheme.importJSON(text)` and checking the result, then `FongTheme.setConfig(result.config)` and checking the page has no injected elements.
