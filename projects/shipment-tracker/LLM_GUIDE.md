# LLM Quick Reference Guide - Shipment Tracker

> **For AI Assistants:** Read this FIRST before making any code changes. This guide will help you write code that matches the existing patterns.

---

## Quick Context

**Shipment Tracker** is a browser-based shipment tracking app that:
- Tracks packages across multiple carriers (DHL, FedEx, UPS)
- Stores data locally in IndexedDB (offline-first, no backend)
- Uses a BYOK (Bring Your Own Key) model for API credentials
- Is mobile-responsive with card layout on small screens

---

## Critical Constraints (MUST FOLLOW)

### 1. ES5 JavaScript Only
This codebase targets Safari 10+ and MUST NOT use ES6+ features:

| NEVER Use | Use Instead |
|-----------|-------------|
| `const` / `let` | `var` |
| Arrow functions `() => {}` | `function() {}` |
| Template literals `` `${x}` `` | `'text ' + x` |
| Destructuring `{a, b} = obj` | `var a = obj.a; var b = obj.b;` |
| Spread `...arr` | `Array.prototype.slice.call(arr)` |
| Optional chaining `obj?.prop` | `obj && obj.prop` |
| Nullish coalescing `a ?? b` | `a !== null && a !== undefined ? a : b` |
| `class` keyword | Prototype-based OOP |

### 2. No Build Tools
- No Webpack, Babel, Rollup, or bundlers
- Direct `<script>` tags in HTML
- Files must work as-is in the browser

### 3. IIFE + Prototype Pattern
All modules use this structure:

```javascript
(function(window) {
    'use strict';

    function MyClass() {
        this.property = 'value';
    }

    MyClass.prototype.myMethod = function() {
        // Method code
    };

    window.MyClass = MyClass;
})(window);
```

### 4. Mobile-First CSS
- Base styles target mobile (< 768px)
- Use `@media (min-width: 768px)` for larger screens
- Use `dvh` units with `vh` fallback for viewport height

---

## Pattern Cheat Sheet

### Adding a Prototype Method

```javascript
// DO: Add to existing prototype in app.js
ShipmentTrackerApp.prototype.myNewMethod = function() {
    var self = this;  // Capture 'this' for callbacks

    // Your code here
    console.log('[App] My new method called');
};

// DON'T: Use arrow functions or class syntax
ShipmentTrackerApp.prototype.myMethod = () => { };  // WRONG
class ShipmentTrackerApp { myMethod() { } }         // WRONG
```

### Event Listeners

```javascript
// DO: Use function() with .bind(this) or capture 'self'
var self = this;
document.getElementById('myBtn').addEventListener('click', function(e) {
    self.handleClick(e);
});

// OR with bind:
document.getElementById('myBtn').addEventListener('click', function(e) {
    this.handleClick(e);
}.bind(this));

// DON'T: Use arrow functions
document.getElementById('myBtn').addEventListener('click', (e) => {
    this.handleClick(e);  // WRONG - arrow function won't work in ES5
});
```

### Array Operations

```javascript
// DO: Use .bind(this) with filter/map/forEach
var filtered = this.trackings.filter(function(t) {
    return t.carrier === this.selectedCarrier;
}.bind(this));

// OR capture 'self':
var self = this;
var filtered = this.trackings.filter(function(t) {
    return t.carrier === self.selectedCarrier;
});

// DON'T: Use arrow functions
var filtered = this.trackings.filter(t => t.carrier === this.selectedCarrier);  // WRONG
```

### Async/Await (Allowed in Prototype Methods)

```javascript
// DO: async/await is OK in prototype methods
ShipmentTrackerApp.prototype.loadData = async function() {
    try {
        var data = await this.db.getAllTrackings();
        this.trackings = data;
    } catch (err) {
        console.error('[App] Load failed:', err);
        this.showToast('Failed to load: ' + err.message, 'error');
    }
};

// DON'T: Use async in IIFEs or regular functions
var loadData = async () => { };  // WRONG - arrow + async
```

### DOM Creation

```javascript
// DO: Use createElement and properties
var div = document.createElement('div');
div.className = 'my-class another-class';
div.textContent = 'Hello World';
div.setAttribute('data-id', '123');
container.appendChild(div);

// DON'T: Use innerHTML with user data (XSS risk) or template literals
div.innerHTML = `<span>${userInput}</span>`;  // WRONG - XSS + template literal
```

### Conditional Checks

```javascript
// DO: Explicit null/undefined checks
var value = obj && obj.prop ? obj.prop : 'default';

// DO: Ternary for simple defaults
var name = response.name !== undefined ? response.name : 'Unknown';

// DON'T: Use optional chaining or nullish coalescing
var value = obj?.prop ?? 'default';  // WRONG
```

---

## File Quick Reference

| File | Purpose |
|------|---------|
| `index.html` | Main app entry point, all UI elements |
| `js/app.js` | Main controller - `ShipmentTrackerApp` class with all UI logic |
| `js/db.js` | IndexedDB adapter - `IndexedDBAdapter` class for data persistence |
| `js/utils.js` | Helper functions - `TrackingUtils` namespace (formatting, validation) |
| `js/normalizer.js` | Converts carrier API responses to unified format |
| `js/debug.js` | Debug menu (`Ctrl+Shift+D`) for testing |
| `js/api/base.js` | Shared API utilities (fetch, retry, rate limiting) |
| `js/api/dhl.js` | DHL Express adapter - `DHLAdapter` |
| `js/api/fedex.js` | FedEx adapter - `FedExAdapter` |
| `js/api/ups.js` | UPS adapter - `UPSAdapter` |
| `css/style.css` | All styles (mobile-first) |

---

## Common Task Templates

### 1. Add a New Button Handler

```javascript
// In app.js, inside setupEventListeners method:
ShipmentTrackerApp.prototype.setupEventListeners = function() {
    var self = this;

    // ... existing listeners ...

    // Add your new button handler:
    var myBtn = document.getElementById('myNewBtn');
    if (myBtn) {
        myBtn.addEventListener('click', function(e) {
            e.preventDefault();
            self.myNewMethod();
        });
    }
};
```

### 2. Add a New Prototype Method

```javascript
// Add after existing methods in app.js:
ShipmentTrackerApp.prototype.myNewFeature = function(param) {
    var self = this;
    console.log('[App] myNewFeature called with:', param);

    // Access class properties via this
    var trackings = this.trackings;

    // Access DOM elements
    var container = document.getElementById('myContainer');

    // Show feedback to user
    this.showToast('Feature executed!', 'success');
};
```

### 3. Add Keyboard Shortcut

```javascript
// In setupEventListeners:
document.addEventListener('keypress', function(e) {
    // Enter key on specific input
    if (e.key === 'Enter' && e.target.id === 'trackingNumber') {
        e.preventDefault();
        self.addTracking();
    }
});
```

### 4. Reset Form Fields

```javascript
// Reset input fields after action:
document.getElementById('trackingNumber').value = '';
document.getElementById('carrier').selectedIndex = 0;  // First option
document.getElementById('dateShipped').value = '';
```

### 5. Create a Modal/Panel

```javascript
// HTML structure needed in index.html:
// <div id="myModal" class="modal" style="display: none;">
//   <div class="modal-content">
//     <button id="myModalClose" class="close-btn">&times;</button>
//     <h3>Modal Title</h3>
//     <!-- content -->
//   </div>
// </div>

// JS to show/hide:
ShipmentTrackerApp.prototype.showMyModal = function() {
    var modal = document.getElementById('myModal');
    if (modal) {
        modal.style.display = 'flex';
    }
};

ShipmentTrackerApp.prototype.hideMyModal = function() {
    var modal = document.getElementById('myModal');
    if (modal) {
        modal.style.display = 'none';
    }
};
```

### 6. Filter Array and Export

```javascript
// Export only filtered/visible items:
ShipmentTrackerApp.prototype.exportFiltered = function() {
    // Use filteredTrackings (already filtered by current UI state)
    var dataToExport = this.filteredTrackings.length > 0
        ? this.filteredTrackings
        : this.trackings;

    // Generate CSV
    var csv = TrackingUtils.getCSVHeader() + '\n';
    dataToExport.forEach(function(t) {
        csv += TrackingUtils.toCSVRow(t) + '\n';
    });

    // Trigger download
    this.downloadFile(csv, 'shipments.csv', 'text/csv');
};
```

---

## Completed Sprint: v1.2.0 Tasks (Reference)

> **Note:** These tasks have been implemented. This section serves as a reference for understanding the codebase patterns.

### Task 1: Icon/Emoji Color Differentiation ✅
**Location:** `css/style.css` lines 1883-1892

```css
.btn-import { filter: hue-rotate(90deg) saturate(1.2); }
.btn-export { filter: hue-rotate(200deg) saturate(1.2); }
```

---

### Task 2: Add Shipment UX (Enter Key + Form Reset) ✅
**Location:** `js/app.js` - `setupEventListeners()` method

```javascript
// Enter key support pattern
var formFields = ['awbInput', 'carrierSelect', 'dateShipped'];
formFields.forEach(function(fieldId) {
    var field = document.getElementById(fieldId);
    if (field) {
        field.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('addTrackingForm').dispatchEvent(new Event('submit'));
            }
        });
    }
});
```

Form reset is in `addTracking()` method (lines 461-463).

---

### Task 3: Advanced Import Template ✅
**Location:** `js/app.js` - `downloadImportTemplate()` method (line 1405)

Template includes comment lines starting with `#` that are skipped by parser.

---

### Task 4: Auto-Refresh Mock Data Fix ✅
**Location:** `js/app.js` - `refreshAllTrackings()` method

```javascript
// Skip mock carrier data
if (tracking.carrier === 'Mock' || tracking.carrier === 'mock') {
    console.log('[App] Skipping mock tracking:', tracking.awb);
    continue;
}
```

---

### Task 6: Import/Export Submenu Modal ✅
**Locations:**
- HTML: `index.html` - `#dataModal` element
- CSS: `css/style.css` - `.data-modal` styles (line 1898)
- JS: `js/app.js` - `openDataModal()`, `closeDataModal()`, `importWithReplace()` methods

---

### Task 7: Filter-Aware Export ✅
**Location:** `js/app.js` - `exportFilteredCSV()` and `exportFilteredJSON()` methods

```javascript
var trackingsToExport = (filter === 'total' || !filter)
    ? this.trackings
    : this.filteredTrackings;
```

---

## Testing Checklist

Before considering a task complete:

- [ ] **Safari Test**: Open in Safari - no console errors?
- [ ] **Mobile Test**: Resize to < 768px width - layout correct?
- [ ] **ES5 Check**: No arrow functions, template literals, const/let?
- [ ] **Console Clean**: No errors in browser DevTools console?
- [ ] **Pattern Match**: Code follows IIFE + Prototype pattern?
- [ ] **Accessibility**: Buttons/inputs have proper labels?

### Quick Console Tests

```javascript
// Test app is loaded
window.app;  // Should show ShipmentTrackerApp instance

// Test utils work
TrackingUtils.detectCarrier('1234567890');  // 'DHL'
TrackingUtils.truncateAWB('1234567890');    // '1...67890'

// Test DB connection
app.db.getAllTrackings().then(console.log);
```

---

## When In Doubt

1. **Look at existing code** - Find a similar feature and copy its pattern
2. **Check ARCHITECTURE.md** - Comprehensive details on all modules
3. **Use `var` not `const/let`** - When uncertain about scope
4. **Add `.bind(this)`** - When callbacks lose `this` context
5. **Test in Safari** - The strictest ES5 environment

---

*Last Updated: 2026-01-25 | Version: 1.2.0*
