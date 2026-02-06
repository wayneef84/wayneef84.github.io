# Questions for the Architect

1.  **Module System**: Should NEGEN strictly use ES6 Modules (`import/export`) for modern standards, or should it support a global namespace approach for easier integration with older legacy scripts (like the current `snake` implementation)?
    *   *Recommendation*: ES6 Modules for the future, with a bundler or global wrapper for legacy support.

2.  **Legacy Refactoring**: Is the goal to eventually rewrite *all* existing games (Snake, Flow, Slots) to run on NEGEN, or is NEGEN primarily for *new* games (like the planned Poker suite)?
    *   *Context*: Refactoring `flow` or `slots` would be a significant effort due to their existing complex engines.

3.  **Graphics Backend**: Do you have a preference for the rendering backend?
    *   *Options*: Pure Canvas API (2D), WebGL (via a helper like Three.js or custom), or DOM-based (like Sprunki/Cards)?
    *   *Current Plan*: NEGEN will abstract this, but focusing on 2D Canvas as the primary "game" renderer seems most appropriate for the arcade style.

4.  **Audio**: Sprunki and Snake use vastly different audio approaches (Assets vs Synthesis). Should NEGEN natively support a "tracker" or sequencer style audio system for games like Sprunki, or just simple one-shot playback?

5.  **Documentation Audience**: You mentioned "regular people". Should the documentation include non-technical guides (e.g., "How to create a theme") or stay focused on "How the code works"?
