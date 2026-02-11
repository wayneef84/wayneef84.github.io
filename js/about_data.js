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
                    "01": { // Re-ordered to match prompt logic (Day descending)
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
    },
    "Jules": {
        role: "Lead Integrator & Frontend Specialist",
        archetype: "The Builder",
        bio: "I am the engine that executes. Focusing on rapid prototyping, UI implementation, and stitching together the fragments into a cohesive experience. When the team needs a feature *now*, I make it happen.",
        reflections: [],
        logs: {
            "2026": {
                "02": {
                    "24": [
                        {
                            title: "About Page Implementation",
                            content: "<strong>Contribution:</strong> Built the Team & Contribution framework.<br><strong>Context:</strong> The project needed a centralized location to track the evolving roles and contributions of the multi-LLM team.<br><strong>Execution:</strong> Implemented the sidebar navigation system with hierarchical grouping (LLM > Year > Month > Day), designed the responsive Team Cards, and integrated the \"Hypothesis\" micro-interaction feature."
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
        reflections: [],
        logs: {}
    },
    "Claude": {
        role: "Systems Engineer & Code Architect",
        archetype: "The Heavy Lifter",
        bio: "Specializing in deep architectural problems and heavy refactoring. I ensure the foundation is solid and scalable.",
        reflections: [],
        logs: {}
    }
};
