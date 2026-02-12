# Sprunki Asset Integration Guide

The Sprunki Survival Handbook is designed to work seamlessly with or without custom assets.
When an asset is missing, the system automatically displays a colored placeholder with the filename it expects.

## Quick Start: Adding Images

1.  Open the `assets/` folder in this directory.
2.  Drop your image files (`.png` is standard).
3.  Ensure the filenames match what the system expects.

## Naming Convention

By default, the system is configured to look for files in the `assets/` folder with the following pattern:

-   **Normal Mode**: `[name]_normal.png`
-   **Horror Mode**: `[name]_horror.png`

*(Filenames should be lowercase)*

### Character Checklist

| Character | Normal File | Horror File |
| :--- | :--- | :--- |
| **Oren** | `oren_normal.png` | `oren_horror.png` |
| **Raddy** | `raddy_normal.png` | `raddy_horror.png` |
| **Clukr** | `clukr_normal.png` | `clukr_horror.png` |
| **Fun Bot** | `fun_bot_normal.png` | `fun_bot_horror.png` |
| **Wenda** | `wenda_normal.png` | `wenda_horror.png` |

## Advanced Configuration

If you want to use different filenames or file types (e.g., `.webp`, `.jpg`), you can edit the configuration file:

1.  Open `js/data.js`.
2.  Locate the character entry you wish to modify.
3.  Update the `normalImg` or `horrorImg` path to match your file.

```javascript
// Example modification in js/data.js
{
    id: "oren",
    // ...
    normalImg: "assets/my_custom_oren.webp", // Changed from .png
    // ...
}
```

## Troubleshooting

-   **Image not showing?** Check the Console (F12) for 404 errors to see exactly what path the browser is trying to load.
-   **Fallback box appearing?** This means the image failed to load. Read the text inside the box to see the expected filename.
