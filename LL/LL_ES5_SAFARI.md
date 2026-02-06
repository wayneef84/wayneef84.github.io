# Lessons Learned: ES5 & Safari Compatibility

**Timeline:** November 2025 - Present
**Affected:** ALL games and projects

---

## Why ES5?

The Fong Family Arcade runs on older tablets (iPad Air 2, older Android tablets). These devices:
- Have outdated Safari/Chrome versions
- Cannot update to latest browsers
- Are perfectly functional otherwise

**Decision:** ES5 compatibility is non-negotiable. "Dad made this" means everyone can play.

---

## 1. Forbidden Syntax

### Never Use These:

```javascript
// WRONG - Nullish coalescing (ES2020)
var value = input ?? 'default';

// CORRECT
var value = (input !== null && input !== undefined) ? input : 'default';
// Or for falsy check:
var value = input || 'default';
```

```javascript
// WRONG - Optional chaining (ES2020)
var name = user?.profile?.name;

// CORRECT
var name = user && user.profile && user.profile.name;
```

```javascript
// WRONG - const/let (ES6)
const PI = 3.14;
let count = 0;

// CORRECT
var PI = 3.14;
var count = 0;
```

```javascript
// WRONG - Arrow functions (ES6)
array.map(x => x * 2);

// CORRECT
array.map(function(x) { return x * 2; });
```

```javascript
// WRONG - Template literals (ES6)
var msg = `Hello ${name}!`;

// CORRECT
var msg = 'Hello ' + name + '!';
```

```javascript
// WRONG - Destructuring (ES6)
var { name, age } = person;

// CORRECT
var name = person.name;
var age = person.age;
```

```javascript
// WRONG - Spread operator (ES6)
var newArray = [...oldArray, newItem];

// CORRECT
var newArray = oldArray.concat([newItem]);
```

```javascript
// WRONG - Default parameters (ES6)
function greet(name = 'World') {}

// CORRECT
function greet(name) {
    name = name || 'World';
}
```

---

## 2. Safari-Specific Bugs

### Audio Autoplay
Safari blocks audio until user interaction.

```javascript
// WRONG - Audio won't play
window.onload = function() {
    bgMusic.play(); // Blocked!
};

// CORRECT - Trigger on user action
document.body.addEventListener('touchstart', function() {
    bgMusic.play();
}, { once: true });
```

### Touch Event Handling
Safari needs explicit touch handling.

```javascript
// Prevent pull-to-refresh and bounce
document.body.addEventListener('touchmove', function(e) {
    if (!e.target.closest('.scrollable')) {
        e.preventDefault();
    }
}, { passive: false });
```

### CSS Safe Areas (iPhone X+)
```css
/* Always include for notch/home indicator */
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

### Input Zoom Prevention
Safari zooms on input focus if font < 16px.

```css
/* Prevent zoom */
input, select, textarea {
    font-size: 16px; /* Minimum! */
}
```

---

## 3. Testing Protocol

### Before Every Release:

1. **Chrome Desktop** - Primary development
2. **Safari Desktop** - Catch obvious ES6 leaks
3. **iOS Safari** - THE critical test
4. **Older iPad** - If available, test on actual old device
5. **Android Chrome** - Secondary mobile

### Quick Syntax Check
```bash
# Find ES6+ syntax in JS files
grep -r "const \|let \|=>" games/ --include="*.js"
grep -r "\?\." games/ --include="*.js"
grep -r "\?\?" games/ --include="*.js"
```

---

## 4. Polyfills We Use

### Array.prototype.includes (ES7)
```javascript
if (!Array.prototype.includes) {
    Array.prototype.includes = function(search) {
        return this.indexOf(search) !== -1;
    };
}
```

### Object.assign (ES6)
```javascript
if (!Object.assign) {
    Object.assign = function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
}
```

---

## Quick Reference Checklist

Before committing JS code:

- [ ] No `const` or `let`?
- [ ] No arrow functions `=>`?
- [ ] No template literals backticks?
- [ ] No `?.` or `??`?
- [ ] No destructuring `{ a, b }`?
- [ ] No spread `...`?
- [ ] Audio triggered by user action?
- [ ] Touch events handled?
- [ ] Tested on Safari?

---

*Last Updated: 2026-02-05 by Claude (C)*
