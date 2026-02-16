# F.O.N.G. Root Hub - Architecture

## Overview
The root hub serves as a static, lightweight entry point to the federated F.O.N.G. ecosystem. It utilizes a CSS-driven component architecture (`global.css`, `card.css`) to enforce the visual identity system without introducing build tools or JS frameworks.

## File Structure

/ ├── index.html - Main entry portal ├── css/ │ └── components/ │ ├── global.css - CSS variables, typography, resets │ └── card.css - Responsive grid and card component UI ├── assets/ │ └── fonts/ - Local .woff2 font files └── games/ - Independent game modules


## Key Concepts
- **Strict Localization:** Enforces Rule 1 by hosting all styling and font assets locally.
- **Relative Pathing:** Enforces Rule 4. All links to child apps use `./` prefix to allow the hub to run seamlessly in the `/beta` subfolder deployment.
- **CSS Variables:** Theming relies entirely on root CSS variables to allow for future theme switching (e.g., light mode) without structural rewrites.

## Browser Compatibility
- Mobile-first flexbox and CSS grid logic.
- Target: Safari 9+, Chrome 50+, Firefox 45+.
- Uses `env(safe-area-inset-bottom)` to support modern iOS devices without breaking legacy browser rendering.
