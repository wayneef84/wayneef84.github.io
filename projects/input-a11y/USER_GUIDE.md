# Input A11y - User Guide (Layman's Edition)

**Version:** 2.0
**Last Updated:** February 11, 2026

---

## 📱 What is Input A11y?

Input A11y (Accessibility) is a **mobile-first scanning app** that works entirely in your web browser. It can:

- **Scan QR codes** and **barcodes**
- **Read text** from your camera (OCR - Optical Character Recognition)
- **Generate QR codes** from text
- **Search Google** automatically with scanned content
- **Upload images to Google Lens** for reverse image search

**No app store required!** Just bookmark it on your phone's home screen.

---

## 🎯 New Features (v2.0)

### 1. **Google Search Integration** ✅ *(Added by Jules)*

**What it does:**
When you scan a barcode or text, it automatically searches Google for that value.

**How it works:**
1. Go to **Settings** → **Scan Action**
2. Select: `URL Input (Open Link)`
3. Base URL is pre-set to: `https://www.google.com/search?q=`
4. Toggle **"Add value to url"** to **ON** (default)

**Example:**
- You scan: `ABC123`
- App opens: `https://www.google.com/search?q=ABC123` in a new tab
- Text is auto-copied to clipboard

**Use Cases:**
- Scan product UPC → Google shows product info
- Scan tracking number → Google finds carrier
- Scan ISBN → Google shows book details

---

### 2. **Google Lens Image Upload (from History)** ✅ *(Added by Jules)*

**What it does:**
Upload any previously scanned image directly to Google Lens for reverse image search.

**How to use:**
1. Go to **History** tab
2. Find any scan that has a camera image
3. Click the **📷 (camera icon)** button
4. Google Lens opens in a new tab with your image

**Use Cases:**
- You scanned a product label earlier → Upload to Lens to find where to buy
- You took a screenshot of an error code → Upload to Lens to find solutions
- You captured an image of a plant → Upload to Lens to identify the species

---

### 3. **Screenshot → Google Lens (Direct Upload)** ✅ *(New in v2!)*

**What it does:**
While in **Scan Mode**, capture the current camera view and instantly upload it to Google Lens.

**How to use:**
1. Open **Scan** tab
2. Point camera at object/text
3. Tap **Start Scanner** (if not already running)
4. Tap **📷 Screenshot → Lens** button
5. Image captures and uploads to Google Lens automatically

**Difference from "Screenshot Evidence":**
- **Screenshot Evidence** = Saves to history only (for record-keeping)
- **📷 Screenshot → Lens** = Saves to history **AND** uploads to Google Lens

**Use Cases:**
- Quick product identification (point at item → instant Lens search)
- Translate foreign text in real-world (point at sign → Lens translates)
- Identify unknown objects without typing

---

### 4. **Theme System** ✅ *(New in v2!)*

**What it does:**
Changes the entire app's color scheme for better visibility in different conditions.

**Available Themes:**
1. **Dark** (Default) - Black background, gray text, green accents
2. **High Contrast** - Pure black background, yellow borders, bright colors
3. **Black & White** - Pure black/white only (no colors)
4. **Light** - White background, dark text (for daylight use)

**How to change:**
1. Go to **Settings** tab
2. Scroll to **Appearance** section
3. Select theme from dropdown
4. Tap **Save** (bottom of page)

**When to use each theme:**
- **Dark** → General use, battery saving
- **High Contrast** → Users with low vision, high glare environments
- **Black & White** → Colorblind users, e-ink displays
- **Light** → Outdoor use in bright sunlight

---

### 5. **Flash Feedback** *(Already existed, now more visible!)*

**What it does:**
Screen flashes white when a scan succeeds (visual confirmation).

**Settings:**
- **Off** → No flash
- **Scanner Only** → Flash only around camera area
- **Full Screen** → Entire screen flashes

**Default:** Scanner Only (already enabled)

**Note:** This is **NOT** your camera's LED flash. It's a screen effect for feedback.

---

## 🔧 How Each Feature Works (Technical but Simple)

### **Google Search Concatenation**

```
User scans → "12345"
Base URL → "https://www.google.com/search?q="
Add value → ON
Final URL → "https://www.google.com/search?q=12345"
```

**Code Flow:**
1. Scanner detects value
2. App calls `buildUrl(value)` function
3. Function checks `settings.addValueToUrl`
   - If `true` → appends `encodeURIComponent(value)` to URL
   - If `false` → just opens base URL (value copied to clipboard)
4. Opens new tab with `window.open(url, '_blank')`

---

### **Google Lens Image Upload**

```
Image → Base64 Data URI → POST to Google's server → Opens Lens results
```

**Code Flow:**
1. User clicks 📷 button on history item
2. App calls `searchImageOnGoogle(base64Data)`
3. Function extracts raw Base64 (removes `data:image/png;base64,` prefix)
4. Creates hidden HTML form:
   ```html
   <form method="POST" action="https://www.google.com/searchbyimage/upload">
     <input name="image_content" value="[Base64 string]">
   </form>
   ```
5. Auto-submits form → Google processes image → Opens Lens in new tab
6. Form auto-deletes after 2 seconds

**Why Base64?**
- Your images are stored in browser's localStorage (not on a server)
- Base64 allows direct upload without needing a file path

---

### **Screenshot → Lens**

**Code Flow:**
1. User clicks **📷 Screenshot → Lens** button
2. App calls `ocrManager.screenshotEvidence()`:
   - Gets current video frame from camera
   - Draws frame to hidden canvas element
   - Exports canvas as Base64 PNG
3. Saves to history with label: `(Google Lens screenshot)`
4. Calls `searchImageOnGoogle(imageDataUri)` (same as Feature #2)
5. Image uploads to Lens automatically

**Comparison:**

| Button                  | Saves to History? | Uploads to Lens? |
|-------------------------|-------------------|------------------|
| Screenshot Evidence     | ✅ Yes            | ❌ No            |
| 📷 Screenshot → Lens   | ✅ Yes            | ✅ Yes           |

---

### **Theme System**

**Code Flow:**
1. User selects theme in Settings
2. App saves to `localStorage` as `settings.theme`
3. App calls `applyTheme(themeName)`
4. Function sets `<body data-theme="themeName">`
5. CSS rules activate based on `[data-theme]` attribute:
   ```css
   body[data-theme="contrast"] {
     --bg-color: #000;
     --text-color: #fff;
     --border-color: #FFD700; /* Yellow borders */
   }
   ```
6. All UI elements use CSS variables (`var(--bg-color)`) so they update instantly

**Why this approach?**
- No page reload needed
- Theme persists across sessions (localStorage)
- Easy to add more themes (just add CSS rules)

---

## 📊 Feature Summary Table

| Feature                   | Status | Added By | Use Case                          |
|---------------------------|--------|----------|-----------------------------------|
| Google Search (Default)   | ✅     | Jules    | Auto-search scanned values        |
| Image Upload (History)    | ✅     | Jules    | Reverse search saved images       |
| Screenshot → Lens         | ✅     | Claude   | Quick camera-to-Lens workflow     |
| Theme System              | ✅     | Claude   | Accessibility & visibility        |
| Flash Feedback            | ✅     | Original | Visual scan confirmation          |

---

## 🚀 Quick Start Guide

### **For Product Scanning:**
1. Open app → **Scan** tab
2. Point at barcode
3. App auto-scans → Opens Google with product info

### **For Text Reading:**
1. Open app → **Scan** tab
2. Tap **⚙️ Scanner Settings**
3. Select **Mode: Text Scanner**
4. Point at text → App reads and copies it

### **For Image Search:**
1. Point camera at object
2. Tap **📷 Screenshot → Lens**
3. Google Lens identifies it

### **For QR Code Generation:**
1. Go to **Generate** tab
2. Type text/URL
3. Tap **Generate QR**
4. Tap **Download** to save

---

## 🎓 Tips & Tricks

### **Best Practices:**
- **OCR Text Scanning:** Hold phone steady, ensure good lighting
- **Barcode Scanning:** Frame barcode in center, avoid glare
- **Lens Upload:** Works best with clear, well-lit images

### **Troubleshooting:**
- **"No OCR engine available"** → Browser doesn't support native OCR, app will use Tesseract.js (slower)
- **"Camera Error"** → Grant camera permission in browser settings
- **Text not detected** → Adjust **Scan Region Box** size in Settings
- **Google Lens fails** → Image might be too large (browser localStorage limit)

### **Performance:**
- **Debounce Setting** (Settings → Text Scanner → Debounce): Increase to 5000ms if scans are too frequent
- **Confidence Threshold**: Lower to 30% if text isn't detected, raise to 60% if getting false positives

---

## 📞 Support

**Issues or Questions?**
- Check `TODO.md` for known issues
- Review `ARCHITECTURE.md` for technical details
- Submit bug reports via GitHub Issues

**Credits:**
- **Jules** (J) - Google Search integration, Image Upload
- **Claude** (C) - Screenshot→Lens, Theme system, Architecture
- **Gemini** (G) - UI/UX design contributions

---

**Enjoy your enhanced scanning experience!** 🎉
