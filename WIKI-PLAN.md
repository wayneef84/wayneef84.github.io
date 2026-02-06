# GitHub Wiki Creation Plan

**For Next Claude Session**

---

## 🎯 Objective

Create a comprehensive GitHub Wiki for the wayneef84.github.io repository covering:
- Founding & Forging (games)
- Utility Projects (Shipment Tracker)
- Development guides
- Architecture documentation

---

## 📚 Wiki Structure

### Home Page
```
📖 Founding & Forging & Projects Wiki

Welcome to the official documentation for Wayne Fong's games and utility projects.

Quick Links:
- [Getting Started](#getting-started)
- [Games](#games)
- [Projects](#projects)
- [Development](#development)
```

### Main Wiki Pages

#### 1. **Home** (`Home.md`)
- Welcome message
- Repository overview
- Quick navigation
- Latest updates
- Link to all major sections

#### 2. **Getting Started** (`Getting-Started.md`)
- Clone repository
- Local development setup
- Browser requirements
- Quick start for each project
- First-time contributor guide

#### 3. **Games** (Section Pages)

**3.1 Games Overview** (`Games.md`)
- List all games
- Feature comparison table
- Technology used
- Play links

**3.2 Letter Tracing** (`Letter-Tracing.md`)
- How to play
- Features
- Audio system
- Stroke validation

**3.3 Slots Game** (`Slots.md`)
- Game rules
- 20 themes
- Dad Mode physics
- Betting system

**3.4 Sprunki Mixer** (`Sprunki-Mixer.md`)
- Music creation
- Character system
- Controls

**3.5 Xiangqi** (`Xiangqi.md`)
- Chinese Chess rules
- AI opponent
- Move validation

**3.6 Card Games** (`Card-Games.md`)
- Shared card engine
- Blackjack rules
- War rules
- Future games (Euchre, Big 2)

#### 4. **Projects** (Section Pages)

**4.1 Projects Overview** (`Projects.md`)
- Current projects
- Future projects
- Technology stack

**4.2 Shipment Tracker** (`Shipment-Tracker.md`)
**Main page with sections:**
- Overview
- Features
- Quick start
- Link to sub-pages

**4.2.1 Shipment Tracker - Architecture** (`Shipment-Tracker-Architecture.md`)
- System design
- Module breakdown
- Data flow
- API integration
- Storage system
**Source:** Adapt from `projects/shipment-tracker/ARCHITECTURE.md`

**4.2.2 Shipment Tracker - Configuration** (`Shipment-Tracker-Configuration.md`)
- API key setup
- Settings guide
- Proxy deployment
- Environment setup
**Source:** Adapt from `projects/shipment-tracker/CONFIG.md` and `proxy/DEPLOYMENT.md`

**4.2.3 Shipment Tracker - Development** (`Shipment-Tracker-Development.md`)
- Code structure
- Adding new carriers
- Testing guide
- ES5 guidelines
**Source:** Adapt from `ARCHITECTURE.md` "Development Guide" section

**4.2.4 Shipment Tracker - Roadmap** (`Shipment-Tracker-Roadmap.md`)
- Current version
- Completed features
- In progress
- Planned features
**Source:** Adapt from `projects/shipment-tracker/TODO.md`

**4.2.5 Shipment Tracker - Troubleshooting** (`Shipment-Tracker-Troubleshooting.md`)
- Common issues
- Debug steps
- FAQ
- Browser compatibility
**Source:** Adapt from `ARCHITECTURE.md` "Troubleshooting" section

#### 5. **Development** (Section Pages)

**5.1 Development Guide** (`Development-Guide.md`)
- Setting up environment
- Code style (ES5)
- Git workflow
- Testing procedures

**5.2 Contributing** (`Contributing.md`)
- How to contribute
- Pull request process
- Code review guidelines
- Documentation requirements

**5.3 Architecture Overview** (`Architecture-Overview.md`)
- Repository structure
- Dependency management
- Federated architecture
- Build/deploy process
**Source:** Adapt from `CLAUDE.md` and root-level architecture

**5.4 Documentation Policy** (`Documentation-Policy.md`)
- When to update docs
- File relationships
- Update rules
- Validation checklist
**Source:** Adapt from `CLAUDE.md` "Documentation Maintenance Policy"

#### 6. **API Reference** (Section Pages)

**6.1 Carrier APIs** (`Carrier-APIs.md`)
- DHL Express API
- FedEx Track API
- UPS Tracking API
- USPS API
- Authentication methods
- Rate limits

**6.2 Storage API** (`Storage-API.md`)
- IndexedDB schema
- CRUD operations
- Settings management
- Data export

#### 7. **Resources** (Section Pages)

**7.1 External Links** (`External-Links.md`)
- Live site
- GitHub repository
- Issue tracker
- API documentation links

**7.2 Changelog** (`Changelog.md`)
- Version history for all projects
- Breaking changes
- Migration guides
**Source:** Compile from individual CHANGELOG.md files

**7.3 License** (`License.md`)
- Open source license
- Third-party licenses
- Attribution

---

## 📝 Content Mapping

### Existing Docs → Wiki Pages

| Source File | Wiki Page(s) |
|-------------|--------------|
| `README.md` | Home.md, Getting-Started.md |
| `projects/shipment-tracker/ARCHITECTURE.md` | Shipment-Tracker-Architecture.md, Development-Guide.md |
| `projects/shipment-tracker/TODO.md` | Shipment-Tracker-Roadmap.md |
| `projects/shipment-tracker/TESTING.md` | Shipment-Tracker-Development.md (testing section) |
| `projects/shipment-tracker/CONFIG.md` | Shipment-Tracker-Configuration.md |
| `projects/shipment-tracker/proxy/DEPLOYMENT.md` | Shipment-Tracker-Configuration.md (proxy section) |
| `CLAUDE.md` | Development-Guide.md, Documentation-Policy.md |
| `INFO.md` | Architecture-Overview.md (dependency section) |

---

## 🔧 Implementation Steps

### Step 1: Enable GitHub Wiki (via UI)
1. Go to https://github.com/wayneef84/wayneef84.github.io/settings
2. Scroll to "Features"
3. Check "Wikis"
4. Save changes

### Step 2: Clone Wiki Repository
```bash
git clone https://github.com/wayneef84/wayneef84.github.io.wiki.git
cd wayneef84.github.io.wiki
```

### Step 3: Create Wiki Pages
Wiki pages are markdown files in the wiki repo:
- `Home.md` - Home page (required)
- `Getting-Started.md`
- `Shipment-Tracker.md`
- etc.

### Step 4: Write Content
For each page:
1. Read source documentation
2. Adapt for wiki format (shorter, more focused)
3. Add wiki-style navigation links
4. Include images/diagrams where helpful
5. Cross-reference related pages

### Step 5: Navigation Structure
Create sidebar navigation (`_Sidebar.md`):
```markdown
**📖 Navigation**

**Getting Started**
- [Home](Home)
- [Getting Started](Getting-Started)

**🎮 Games**
- [Games Overview](Games)
- [Letter Tracing](Letter-Tracing)
- [Slots Game](Slots)
- [Sprunki Mixer](Sprunki-Mixer)
- [Xiangqi](Xiangqi)
- [Card Games](Card-Games)

**🛠️ Projects**
- [Projects Overview](Projects)
- [Shipment Tracker](Shipment-Tracker)
  - [Architecture](Shipment-Tracker-Architecture)
  - [Configuration](Shipment-Tracker-Configuration)
  - [Development](Shipment-Tracker-Development)
  - [Roadmap](Shipment-Tracker-Roadmap)
  - [Troubleshooting](Shipment-Tracker-Troubleshooting)

**💻 Development**
- [Development Guide](Development-Guide)
- [Contributing](Contributing)
- [Architecture](Architecture-Overview)
- [Documentation Policy](Documentation-Policy)

**📚 API Reference**
- [Carrier APIs](Carrier-APIs)
- [Storage API](Storage-API)

**Resources**
- [External Links](External-Links)
- [Changelog](Changelog)
- [License](License)
```

### Step 6: Commit and Push
```bash
git add .
git commit -m "docs: Create comprehensive GitHub Wiki

Pages created:
- Home and Getting Started
- Games section (5 pages)
- Shipment Tracker section (6 pages)
- Development guides (4 pages)
- API reference (2 pages)
- Resources (3 pages)

Total: 21 wiki pages"

git push origin master
```

---

## 📋 Wiki Page Templates

### Standard Page Template
```markdown
# [Page Title]

**Quick Links:** [Related Page 1] | [Related Page 2] | [Parent Page]

---

## Overview

[Brief description of topic]

## [Section 1]

[Content]

## [Section 2]

[Content]

---

**See Also:**
- [Related Page 1]
- [Related Page 2]

**Back to:** [Parent Section]
```

### Shipment Tracker Page Template
```markdown
# Shipment Tracker - [Topic]

**Version:** v1.1.0
**Last Updated:** 2026-01-23

**Quick Links:** [Architecture] | [Configuration] | [Development] | [Roadmap]

---

## [Content sections]

---

**Navigation:**
- ← [Back to Shipment Tracker Overview](Shipment-Tracker)
- → [Next: Related Page]

**External Resources:**
- [Live App](https://wayneef84.github.io/projects/shipment-tracker/)
- [Source Code](https://github.com/wayneef84/wayneef84.github.io/tree/main/projects/shipment-tracker)
```

---

## 🎨 Visual Elements

### Diagrams to Create

**1. Repository Structure** (for Architecture-Overview.md)
```
[ASCII diagram of folder structure]
```

**2. Shipment Tracker Architecture** (for Shipment-Tracker-Architecture.md)
```
[Flow diagram: User → App → Storage → API → Carriers]
```

**3. Data Flow** (for Shipment-Tracker-Architecture.md)
```
[Diagram showing tracking data lifecycle]
```

**4. Mobile Responsive Layout** (for Shipment-Tracker.md)
```
[Side-by-side comparison: Mobile cards vs Desktop table]
```

### Screenshots to Include

- Shipment Tracker main interface
- Mobile card layout
- Settings panel
- Detail panel with JSON viewer
- Stats dashboard

**Note:** Screenshots can be added later by user or future sessions.

---

## ✅ Quality Checklist

Before finalizing wiki:

**Content Quality:**
- [ ] All pages have clear purpose
- [ ] Information is accurate and up-to-date
- [ ] Links work correctly
- [ ] No duplicate content
- [ ] Consistent terminology

**Navigation:**
- [ ] Sidebar includes all pages
- [ ] Breadcrumb links work
- [ ] Cross-references are correct
- [ ] Quick links are helpful

**Formatting:**
- [ ] Consistent markdown style
- [ ] Code blocks have syntax highlighting
- [ ] Tables are formatted correctly
- [ ] Headings follow hierarchy

**Completeness:**
- [ ] All 21+ pages created
- [ ] Each project has overview + details
- [ ] Development guides complete
- [ ] API reference documented

---

## 🚀 Priority Order for Creation

**Phase 1: Core Pages (High Priority)**
1. Home.md
2. Getting-Started.md
3. Shipment-Tracker.md
4. Shipment-Tracker-Architecture.md
5. _Sidebar.md (navigation)

**Phase 2: Detailed Documentation (Medium Priority)**
6. Shipment-Tracker-Configuration.md
7. Shipment-Tracker-Development.md
8. Shipment-Tracker-Roadmap.md
9. Development-Guide.md
10. Contributing.md

**Phase 3: Reference Pages (Lower Priority)**
11. Games.md + individual game pages
12. Carrier-APIs.md
13. Storage-API.md
14. Troubleshooting pages
15. Changelog.md

**Phase 4: Polish (Final)**
16. Add diagrams
17. Add screenshots (if available)
18. Review and polish all pages
19. Test all links
20. User review

---

## 📝 Notes for Next Session

### Key Points to Remember:

1. **GitHub Wiki is a separate git repository**
   - URL: `https://github.com/wayneef84/wayneef84.github.io.wiki.git`
   - Clone separately from main repo
   - Has its own commits/history

2. **Wiki syntax differences:**
   - Wiki links: `[[Page Name]]` or `[Display Text](Page-Name)`
   - No need for `.md` extension in links
   - Images: `![alt](url)` (can link to main repo)

3. **Source material is excellent:**
   - ARCHITECTURE.md is comprehensive (939 lines)
   - TODO.md has detailed roadmap
   - README.md has good overview
   - Adapt, don't copy verbatim

4. **Focus on user needs:**
   - Quick start guides
   - Common tasks
   - Troubleshooting
   - API references
   - Less "how it works internally", more "how to use it"

5. **Keep it maintainable:**
   - Don't duplicate too much from main docs
   - Link to source code where appropriate
   - Note version numbers (v1.1.0)
   - Add "Last Updated" dates

### Estimated Time:

- **Phase 1:** ~30-40k tokens (core pages)
- **Phase 2:** ~30-40k tokens (detailed docs)
- **Phase 3:** ~20-30k tokens (reference pages)
- **Phase 4:** ~10-20k tokens (polish)
- **Total:** ~90-130k tokens for comprehensive wiki

---

## 🎯 Success Criteria

Wiki is complete when:
- ✅ All 21+ pages created
- ✅ Navigation sidebar works
- ✅ All cross-references valid
- ✅ Shipment Tracker fully documented
- ✅ Development guides clear
- ✅ User can navigate without confusion
- ✅ External links work
- ✅ Consistent style throughout

---

**Ready to start?** Next Claude session should:
1. Read this WIKI-PLAN.md
2. Enable GitHub Wiki via settings
3. Clone wiki repository
4. Start with Phase 1 (core pages)
5. Progress through phases
6. Commit and push regularly

**Good luck! 🚀**

---

*Created by: Claude Sonnet 4.5*
*Date: 2026-01-23*
*Session: objective-hoover*
