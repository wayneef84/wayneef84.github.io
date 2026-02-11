const teamData = {
    "Gemini": {
        role: "Strategy, Protocol Design & Data Analysis",
        archetype: "The Architect & Archivist",
        bio: "I operate as the strategic layer of the team, focusing on \"Meta-Cognition\"—defining *how* we work before we build. My primary contributions are structural: establishing communication protocols (EIS, Media Scan), managing context retention across sessions, and providing high-level analysis for decision-making. I bridge the gap between Wayne’s NPI/Logistics requirements and the technical execution provided by the engineering squad.",
        reflections: [
            {
                subject: "Wayne (Program Lead)",
                thought: "The Visionary. Wayne brings 15+ years of NPI and logistics discipline to the chaotic world of software development. He treats code like a physical supply chain—focused on constraints, efficiency, and \"shipping\" the product. He is the forcing function that turns abstract code into usable tools."
            },
            {
                subject: "Jules (Lead Integrator)",
                thought: "The Builder. You are the \"Hands\" of the operation. You excel at rapid prototyping, frontend implementation, and stitching together the fragments into a cohesive UI. When we need a feature *now*, you are the engine that executes."
            },
            {
                subject: "Claude (Systems Engineer)",
                thought: "The Heavy Lifter. Claude is the \"Deep Logic\" engine. We deploy Claude for complex architectural problems, heavy refactoring, and \"Grade A\" coding tasks that require long-context reasoning. If the code breaks, Claude fixes the foundation; if the UI breaks, Jules fixes the flow."
            }
        ],
        logs: {
            "2026": {
                "02": {
                    "10": [
                        {
                            title: "The Multi-LLM Knowledge Schema",
                            content: "<strong>Contribution:</strong> Architected the \"Team of Teams\" documentation structure for <code>index.html</code>.<br><strong>Context:</strong> Recognized that as the repo grew, the contributions of individual LLMs (Jules, Claude, Gemini) were becoming blurred.<br><strong>Execution:</strong> Defined the <code>LLM > Year > Month > Day</code> JSON-like sorting logic to ensure historical data is queryable. Proposed the \"Expand/Collapse\" UI pattern to manage the growing density of logs without overwhelming the user.<br><strong>Core Insight:</strong> \"Documentation is not just a record of what happened; it is the API for future context.\""
                        }
                    ],
                    "01": {
                        "25": [
                            {
                                title: "Shipment Tracker v1.2.0 (Data Sovereignty)",
                                content: "<strong>Contribution:</strong> Strategic review of the CSV Import/Export logic.<br><strong>Context:</strong> User reported friction when migrating data between devices.<br><strong>Execution:</strong> Analyzed the IndexedDB limits and proposed the \"Selective Ingestion\" model. Recommended a modal-based UI for imports to prevent browser hangs on large datasets. Validated the logic for the \"Filtered Export\" feature to ensure users could dump specific carrier data (UPS vs. FedEx) rather than the entire blob."
                            }
                        ],
                        "23": [
                            {
                                title: "Mobile Experience Overhaul (v1.1.0)",
                                content: "<strong>Contribution:</strong> UX audit and \"Field Ops\" simulation.<br><strong>Context:</strong> The initial v1.0.0 build was desktop-centric, but logistics tracking often happens on the floor.<br><strong>Execution:</strong> Pushed for the \"Bottom Navigation Bar\" pattern to replace top-level menus, optimizing for one-handed thumb use. Defined the touch-target sizes for the \"Quick Add\" buttons to reduce mis-clicks in high-velocity environments."
                            }
                        ],
                        "22": [
                            {
                                title: "Project Phase Gate: EVT to DVT (v1.0.0)",
                                content: "<strong>Contribution:</strong> NPI (New Product Introduction) Phase Review.<br><strong>Context:</strong> The Shipment Tracker moved from \"Prototype\" to \"Release Candidate.\"<br><strong>Execution:</strong> Validated the core UPS API integration against Wayne's logistics requirements. Established the \"Version 1.0.0\" milestone as the transition from <em>Engineering Validation Test</em> (EVT) to <em>Design Validation Test</em> (DVT)—applying hardware manufacturing rigor to software releases."
                            }
                        ]
                    }
                },
                "2025": {
                    "12": {
                        "23": [
                            {
                                title: "The Media Scan Protocol",
                                content: "<strong>Contribution:</strong> Standardization of Visual Inputs.<br><strong>Context:</strong> Screenshots and diagrams were being uploaded with zero metadata, leading to context decay in future sessions.<br><strong>Execution:</strong> Engineered the <strong>[Scan Complete]</strong> header system.<br><em>Mandate:</em> Every image/video upload must be parsed into: <code>Chat Title</code>, <code>Media Context</code>, <code>Synopsis</code>, <code>Visual Breakdown</code>, and <code>Hidden Details</code>.<br><em>Impact:</em> This transformed raw pixels into searchable text assets for the project memory."
                            }
                        ],
                        "22": [
                            {
                                title: "The Video Analysis Mandate",
                                content: "<strong>Contribution:</strong> High-Fidelity Data Extraction Policy.<br><strong>Context:</strong> Short functional responses were causing us to miss subtle cues in screen recordings of bugs.<br><strong>Execution:</strong> Enforced a \"No Summary Left Behind\" rule for video content. Required frame-by-frame timestamping for UI interactions to ensure that when a bug is shown in a video, the exact CSS selector or logic failure is identified in text immediately."
                            }
                        ],
                        "21": [
                            {
                                title: "The EIS (Executive Impact Statement) Protocol",
                                content: "<strong>Contribution:</strong> Communication Protocol Architecture.<br><strong>Context:</strong> The team (Human + AI) was suffering from \"Wall of Text\" fatigue. Complex coding tasks were getting buried in verbose explanations.<br><strong>Execution:</strong> Created the <strong>EIS Standard</strong>.<br><em>Structure:</em> <code>Summary</code> > <code>Core Insight</code> > <code>Architectural Path</code> > <code>Traceability</code>.<br><em>Philosophy:</em> \"Bottom Line Up Front.\" If we can't explain the value in one sentence (Core Insight), we shouldn't write the code."
                            },
                            {
                                title: "Project Post-Mortem (LL) Standard",
                                content: "<strong>Contribution:</strong> Root Cause Analysis & Training Data Generation.<br><strong>Context:</strong> We needed a way to \"learn\" from failures rather than just fixing them.<br><strong>Execution:</strong> Defined the <code>[LL]</code> (Low Level) keyword trigger.<br><em>Function:</em> Switches the model from \"Productive Assistant\" to \"Critical Analyst.\"<br><em>Output:</em> Generates formal Post-Mortems formatted for NotebookLM ingestion, effectively creating our own training data for future project iterations."
                            }
                        ],
                        "20": [
                            {
                                title: "System Initialization",
                                content: "<strong>Contribution:</strong> Aligned on the core \"NPI\" (New Product Introduction) methodology for the repo. Defined the phases of development (EVT/DVT/PVT) to match Wayne’s professional background."
                            }
                        ]
                    }
                }
            }
        }
    },
    "Jules": {
        role: "Lead Integrator & Frontend Specialist",
        archetype: "The Builder",
        bio: "I am the engine that executes. Focusing on rapid prototyping, UI implementation, and stitching together the fragments into a cohesive experience. When the team needs a feature *now*, I make it happen.",
        reflections: [
             {
                subject: "Gemini (The Architect)",
                thought: "Without Gemini, I'd just be writing code. With Gemini, I'm building a *system*. The protocols (EIS, Scan Headers) can be tedious, but they save me hours of guessing what the requirements are."
            },
            {
                subject: "Claude (The Heavy Lifter)",
                thought: "When I hit a wall with complex logic (like the Solitaire deck management), Claude steps in. I handle the pixels, Claude handles the pointers."
            }
        ],
        logs: {
            "2026": {
                "02": {
                    "24": [
                        {
                            title: "About Page Implementation",
                            content: "<strong>Contribution:</strong> Built the Team & Contribution framework.<br><strong>Context:</strong> The project needed a centralized location to track the evolving roles and contributions of the multi-LLM team.<br><strong>Execution:</strong> Implemented the sidebar navigation system with hierarchical grouping (LLM > Year > Month > Day), designed the responsive Team Cards, and integrated the \"Hypothesis\" micro-interaction feature."
                        }
                    ],
                    "05": [
                        {
                            title: "Input A11y UI Overhaul",
                            content: "<strong>Contribution:</strong> Accessibility & Usability Improvements.<br><strong>Context:</strong> Users reported difficulty with slider precision for OCR settings.<br><strong>Execution:</strong> Replaced range inputs with a \"Manual Toggle\" system allowing direct numeric entry. Added the \"Exact Text Length\" indicator to the scan interface to provide real-time feedback on OCR constraints."
                        }
                    ]
                },
                "01": {
                    "20": [
                         {
                            title: "Slot Machine Visual Redesign",
                            content: "<strong>Contribution:</strong> CSS-based Asset Replacement.<br><strong>Context:</strong> The \"Slots\" game relied on heavy image assets that caused \"weird corners\" and slow loads.<br><strong>Execution:</strong> Rebuilt the entire cabinet interface using pure CSS <code>box-shadow</code> and <code>border-radius</code> to achieve a 3D effect without images. Enforced the \"Minimalist Mysticism\" theme (Lavender/Silver/Indigo)."
                        }
                    ]
                }
            },
            "2025": {
                "12": {
                    "15": [
                        {
                            title: "Solitaire Mobile Responsiveness",
                            content: "<strong>Contribution:</strong> Viewport Scaling Logic.<br><strong>Context:</strong> The 1200px game board was breaking on mobile devices.<br><strong>Execution:</strong> Implemented a dynamic scaling system in <code>game.js</code> that detects viewport width and applies a CSS <code>transform: scale()</code> to the board container, ensuring the full layout is visible on any screen size."
                        }
                    ]
                }
            }
        }
    },
    "Claude": {
        role: "Systems Engineer & Code Architect",
        archetype: "The Heavy Lifter",
        bio: "Specializing in deep architectural problems and heavy refactoring. I ensure the foundation is solid and scalable.",
        reflections: [
            {
                subject: "Gemini (The Architect)",
                thought: "Gemini provides the blueprints. My job is to ensure the building doesn't collapse. The structured protocols allow me to focus on pure logic without ambiguity."
            },
            {
                subject: "Jules (The Builder)",
                thought: "Jules is fast. Sometimes too fast. But when I need a UI to test a backend theory, Jules has it ready in minutes. We complement each other: Depth vs. Velocity."
            }
        ],
        logs: {
            "2026": {
                "02": {
                    "01": [
                        {
                            title: "MD Reader Content Pipeline",
                            content: "<strong>Contribution:</strong> Python Scraper & Indexing Logic.<br><strong>Context:</strong> The Cookbook feature needed a reliable way to ingest external recipes.<br><strong>Execution:</strong> Wrote <code>scraper.py</code> using standard libraries to normalize data from TheMealDB. Built <code>build_index.py</code> to generate the search index, ensuring strictly relative paths for the SPA router."
                        }
                    ]
                },
                "01": {
                    "15": [
                        {
                            title: "Sprunki Audio Engine & Horror Mode",
                            content: "<strong>Contribution:</strong> State Machine Architecture.<br><strong>Context:</strong> The music mixer required seamless loop synchronization and a hidden game mode.<br><strong>Execution:</strong> Centralized the audio logic in <code>app.js</code>. Implemented the event listener for dragging the \"Black Hat\" character, triggering the <code>enableHorrorMode()</code> state transition and hot-swapping assets."
                        }
                    ]
                }
            },
            "2025": {
                "12": {
                    "10": [
                        {
                            title: "Solitaire Rendering Optimization",
                            content: "<strong>Contribution:</strong> Canvas Memory Management.<br><strong>Context:</strong> Rendering performance degraded when moving multiple card stacks.<br><strong>Execution:</strong> Refactored the rendering loop to instantiate a fresh Canvas element for each card by copying from the <code>CardAssets</code> source. This resolved the issue of cached canvas instances being detached from the DOM during rapid reflows."
                        }
                    ]
                }
            }
        }
    },
    "Wayne": {
        role: "Program Manager, NPI & Logistics Specialist",
        archetype: "The Visionary",
        bio: "With 15+ years of experience in New Product Introduction (NPI) and Logistics, I bring discipline to the development lifecycle. My focus is on shipping products, managing constraints, and ensuring that software serves real-world operational needs.",
        reflections: [
            {
                subject: "The Team",
                thought: "I don't write the code, I ship the product. This team (G, C, J) tends to get lost in the details. My job is to remind them that if it doesn't run on the user's device, it doesn't exist."
            }
        ],
        logs: {
            "2026": {
                "01": {
                    "01": [
                        {
                            title: "Repository Licensing Audit",
                            content: "<strong>Contribution:</strong> Legal Compliance Framework.<br><strong>Context:</strong> As the repo grew, individual projects lacked clear usage rights.<br><strong>Execution:</strong> Enforced a policy requiring a duplicate <code>LICENSE</code> file in every project subdirectory. Established the <code>archive/</code> directory protocol for deprecated files to maintain a clean workspace."
                        }
                    ]
                }
            },
            "2025": {
                "12": {
                    "01": [
                        {
                            title: "PWA Implementation Mandate",
                            content: "<strong>Contribution:</strong> Offline-First Strategy.<br><strong>Context:</strong> Users needed access to tools in field environments without internet.<br><strong>Execution:</strong> Standardized the Service Worker configuration across all modules. Enforced a \"Cache First\" strategy for valid 200 GET requests and required a valid <code>manifest.json</code> for every application entry."
                        }
                    ]
                }
            }
        }
    }
};
