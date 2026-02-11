const fs = require('fs');
const path = require('path');

// Read the file content
const projectsFile = fs.readFileSync('js/projects.js', 'utf8');

// Extract the array part.
// We can just evaluate the file since it declares `const projects = ...`
// But we need to mock document/window if the file uses them immediately?
// js/projects.js has `document.addEventListener...` at the end.
// We can strip that out or mock document.

const mockDocument = {
    addEventListener: () => {},
    getElementById: () => {},
    body: { classList: { add: () => {}, toggle: () => {}, contains: () => {} } },
    querySelectorAll: () => []
};

global.document = mockDocument;
global.localStorage = { getItem: () => {}, setItem: () => {} };

try {
    // Eval the content
    eval(projectsFile);

    // Check projects array
    console.log(`Found ${projects.length} projects.`);

    projects.forEach((p, index) => {
        if (!p.tags || !Array.isArray(p.tags) || p.tags.length === 0) {
            console.error(`Project at index ${index} (${p.name}) has invalid tags.`);
        }
        if (!p.name) console.error(`Project at index ${index} missing name.`);
        if (!p.category) console.error(`Project at index ${index} missing category.`);
    });
    console.log("Validation complete.");

} catch (e) {
    console.error("Error evaluating js/projects.js:", e);
}
