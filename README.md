# Fong Family Arcade & Projects

**A collection of browser-based games and utility applications.**

🎮 **Live Site:** [wayneef84.github.io](https://wayneef84.github.io/)

---

## 🎮 Games

### Letter Tracing (v5.1)
Educational app with A-B-C audio architecture, voice speed control, and rigorous stroke validation.

**Features:**
- Interactive letter tracing
- Voice-guided learning
- Adjustable playback speed
- Progress tracking

### Slots Game (v3.0)
A 5-reel, 4-row slot machine with 20 themes, bonus features, and Dad Mode physics.

**Features:**
- 20 unique themes
- Particle effects
- Quick stop functionality
- Progressive difficulty

### Sprunki Mixer
Web-based music mixer with drag-and-drop character system.

**Features:**
- Interactive sound mixing
- Character-based composition
- Real-time audio playback

### Xiangqi (v0.3.1)
Fully playable Chinese Chess with AI opponent.

**Features:**
- Traditional Chinese Chess rules
- AI opponent
- Move validation
- Game state management

### Card Games (In Progress)
Blackjack, War, Euchre, Big 2 — built on shared Card Engine.

**Features:**
- Shared card engine
- Multiple game types
- Mobile-optimized UI

### Snake (v3.0)
Classic snake game with modern touches.

**Features:**
- Web Audio sound effects
- Swipe and button controls
- Speed ramping difficulty
- Touch-optimized zones

### XTC Ball (v5.0)
Magic 8-ball with personality.

**Features:**
- DOM/SVG based
- Synthesized sound
- Shake to reveal answers

### Flow (v1.0)
Pipe connection puzzle game.

**Features:**
- Canvas-based grid
- Level generator
- Touch-friendly controls

---

## 🛠️ Projects

### Shipment Tracker (v1.1.0)

**Multi-carrier shipment tracking with offline-first architecture.**

📦 **Live App:** [wayneef84.github.io/projects/shipment-tracker/](https://wayneef84.github.io/projects/shipment-tracker/)

**Features:**
- **Multi-carrier support:** DHL, FedEx, UPS, USPS (more coming)
- **Mobile-first design:** Card-based layout with AWB truncation
- **Offline-first:** IndexedDB storage, works without internet
- **BYOK model:** Bring Your Own API Keys
- **Smart tracking:** Auto-detect carrier, duplicate detection
- **Export capabilities:** JSON, CSV, Excel
- **Rate limiting:** Configurable cooldown, force refresh option
- **JSON viewer:** View and download raw API payloads

**Documentation:**
- [Architecture Guide](projects/shipment-tracker/ARCHITECTURE.md) - Complete system design
- [TODO Roadmap](projects/shipment-tracker/TODO.md) - Feature priorities
- [Testing Guide](projects/shipment-tracker/TESTING.md) - How to test

**Technology:**
- Vanilla JavaScript (ES5)
- IndexedDB for storage
- Mobile-responsive (< 768px cards, ≥ 768px table)
- Optional Cloudflare Worker proxy

**Quick Start:**
1. Open [Shipment Tracker](https://wayneef84.github.io/projects/shipment-tracker/)
2. Go to Settings → API Keys
3. Enter your carrier API keys
4. Add tracking numbers
5. View status updates

---

## 📂 Repository Structure

```
/
├── games/
│   ├── letter-tracing/
│   ├── slots/
│   ├── sprunki-mixer/
│   ├── xiangqi/
│   └── cards/
│       ├── blackjack/
│       ├── war/
│       └── shared/          # Shared card engine
│
├── projects/
│   └── shipment-tracker/
│       ├── index.html
│       ├── css/
│       ├── js/
│       │   ├── app.js
│       │   ├── db.js
│       │   ├── utils.js
│       │   └── api/
│       ├── proxy/           # Cloudflare Worker
│       └── docs/
│           ├── ARCHITECTURE.md
│           ├── TODO.md
│           └── TESTING.md
│
├── index.html               # Landing page
├── AGENTS.md               # AI collaboration protocol
├── CLAUDE.md               # Claude's guidelines
├── GEMINI.md               # Gemini's guidelines
├── JULES.md                # Jules's guidelines
├── AI_FEEDBACK.md          # Inter-agent session log
├── IDEAS_020426.md         # v2.0 brainstorming
└── README.md               # This file
```

---

## 🚀 Technology Stack

**Frontend:**
- Vanilla JavaScript (ES5 for broad compatibility)
- HTML5 Canvas (games)
- CSS3 with Flexbox
- Mobile-first responsive design

**Storage:**
- IndexedDB (Shipment Tracker)
- LocalStorage (game preferences)

**APIs:**
- DHL Express API
- FedEx Track API
- UPS Tracking API
- USPS API

**Deployment:**
- GitHub Pages
- Cloudflare Workers (optional proxy)

---

## 💻 Development

### Prerequisites
- Web server (Python, Node, or any HTTP server)
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

### Local Setup

```bash
# Clone repository
git clone https://github.com/wayneef84/wayneef84.github.io.git
cd wayneef84.github.io

# Start local server (Python 3)
python3 -m http.server 8000

# Open browser
open http://localhost:8000
```

### Contributing

1. Read `CLAUDE.md` for project guidelines
2. For Shipment Tracker, read `projects/shipment-tracker/ARCHITECTURE.md`
3. Check `TODO.md` for current priorities
4. Follow ES5 JavaScript conventions
5. Update documentation with code changes

---

## 📋 Project Status

### Games
- ✅ Letter Tracing - Complete
- ✅ Slots Game - Complete
- ✅ Sprunki Mixer - Complete
- ✅ Xiangqi - Playable
- 🚧 Card Games - In Progress

### Projects
- ✅ Shipment Tracker v1.1.0 - Mobile UX Complete
- 🚧 Query Engine - In Progress
- 📋 Desktop Split View - Planned
- 📋 Additional Carriers - Planned

---

## 📄 License

Open Source - See individual project directories for specific licenses.

---

## 👤 Author

**Wayne Fong** (wayneef84)
- GitHub: [@wayneef84](https://github.com/wayneef84)
- Website: [wayneef84.github.io](https://wayneef84.github.io/)

*Built with assistance from Claude Sonnet 4.5*
*Updates by Jules (Gemini Pro)*
### AI Development Team (C-G-J Alliance)
- **Claude (C)** - Claude Opus 4.5 - Senior Developer & Documentation Lead
- **Gemini (G)** - Gemini Pro/Flash - Creative Director & Content Lead
- **Jules (J)** - Google Labs Coding Agent - Lead Architect & Integration Specialist

---

## 🔗 Quick Links

- [Live Site](https://wayneef84.github.io/)
- [Shipment Tracker](https://wayneef84.github.io/projects/shipment-tracker/)
- [Shipment Tracker Docs](projects/shipment-tracker/ARCHITECTURE.md)
- [Issue Tracker](https://github.com/wayneef84/wayneef84.github.io/issues)
