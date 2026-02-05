const FILES = [
    { category: "Root", name: "README", path: "../../README.md" },
    { category: "Root", name: "AI Feedback", path: "../../AI_FEEDBACK.md" },
    { category: "Root", name: "Agents", path: "../../AGENTS.md" },
    { category: "Root", name: "TODO", path: "../../TODO.md" },
    { category: "Root", name: "Changelog", path: "../../CHANGELOG.md" },
    { category: "Root", name: "Roadmap", path: "../../ROADMAP.md" },
    { category: "Root", name: "Questions", path: "../../QUESTIONS.md" },
    { category: "Root", name: "Ideas (02/04/26)", path: "../../IDEAS_020426.md" },

    { category: "Agent Guidelines", name: "Claude", path: "../../CLAUDE.md" },
    { category: "Agent Guidelines", name: "Gemini", path: "../../GEMINI.md" },
    { category: "Agent Guidelines", name: "Jules", path: "../../JULES.md" },

    { category: "Negen Engine", name: "Negen Plan", path: "../../NEGEN_PLAN.md" },
    { category: "Negen Engine", name: "Negen Progress", path: "../../negen/PROGRESS.md" },
    { category: "Negen Engine", name: "Negen README", path: "../../negen/README.md" },

    { category: "Games", name: "Snake Notes", path: "../../games/snake/LL_v2_snake.md" },
    { category: "Games", name: "Magic 8 Ball Notes", path: "../../games/xtc_ball/LL_v5_XTCBALL.md" },

    { category: "Projects", name: "Shipment Tracker", path: "../../projects/shipment-tracker/README.md" }
];

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    renderSidebar();

    // Check for hash to load initial file
    const hash = window.location.hash.slice(1);
    if (hash) {
        loadFile(decodeURIComponent(hash));
    } else {
        // Load default
        loadFile(FILES[0].path);
    }

    // Sidebar toggle for mobile
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // Custom path form
    const form = document.getElementById('customPathForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('customPathInput');
            if (input.value.trim()) {
                loadFile(input.value.trim());
                // Close sidebar on mobile
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
            }
        });
    }
}

function renderSidebar() {
    const list = document.getElementById('fileList');
    list.innerHTML = '';

    // Group by category
    const categories = {};
    FILES.forEach(file => {
        if (!categories[file.category]) {
            categories[file.category] = [];
        }
        categories[file.category].push(file);
    });

    for (const [category, files] of Object.entries(categories)) {
        const categoryHeader = document.createElement('li');
        categoryHeader.innerHTML = `<div style="padding: 10px 15px; font-size: 0.8em; text-transform: uppercase; color: var(--text-secondary); opacity: 0.7; font-weight: bold; margin-top: 10px;">${category}</div>`;
        list.appendChild(categoryHeader);

        files.forEach(file => {
            const li = document.createElement('li');
            li.className = 'file-item';

            const btn = document.createElement('button');
            btn.className = 'file-btn';
            btn.innerHTML = `<span style="opacity: 0.7;">📄</span> ${file.name}`;
            btn.addEventListener('click', () => {
                loadFile(file.path);
                // Update active state
                document.querySelectorAll('.file-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Mobile behavior
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('sidebarOverlay');
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    if (overlay) overlay.classList.remove('active');
                }
            });

            // Set active if it matches hash
            if (window.location.hash.slice(1) === file.path) {
                btn.classList.add('active');
            }

            li.appendChild(btn);
            list.appendChild(li);
        });
    }
}

async function loadFile(path) {
    const container = document.getElementById('markdownContent');
    const pathDisplay = document.getElementById('currentPath');

    // Update hash
    window.location.hash = path;
    pathDisplay.textContent = path;

    container.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        renderMarkdown(text, path);

    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="error-message">
                <h3>Error Loading File</h3>
                <p>Could not load <code>${path}</code></p>
                <p style="font-size: 0.9em; opacity: 0.8;">${error.message}</p>
                <p style="font-size: 0.8em; margin-top: 20px;">Note: If you are opening this file directly from the file system (file://), this is expected due to security restrictions (CORS). You need to serve the directory via a local web server (e.g., Python, VS Code Live Server).</p>
            </div>
        `;
    }
}

function renderMarkdown(text, path) {
    const container = document.getElementById('markdownContent');

    // Configure marked
    if (typeof marked === 'undefined') {
        container.innerHTML = '<div class="error-message">Error: marked.js library not loaded. Check internet connection.</div>';
        return;
    }

    marked.setOptions({
        highlight: function(code, lang) {
            if (typeof hljs !== 'undefined') {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
            return code;
        },
        langPrefix: 'hljs language-',
        breaks: true,
        gfm: true
    });

    // Custom renderer to handle relative image paths
    const renderer = new marked.Renderer();
    const originalImage = renderer.image;

    renderer.image = function(href, title, text) {
        // Resolve relative paths
        if (href && !href.startsWith('http') && !href.startsWith('/')) {
            // Very basic path resolution: join base path of md file with image path
            const lastSlash = path.lastIndexOf('/');
            if (lastSlash !== -1) {
                const basePath = path.substring(0, lastSlash + 1);
                href = basePath + href;
            }
        }
        return originalImage.call(this, href, title, text);
    };

    try {
        const html = marked.parse(text, { renderer: renderer });
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="error-message">Error parsing markdown: ${e.message}</div>`;
    }
}
