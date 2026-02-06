document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    // File Upload Handler
    const fileInput = document.getElementById('fileUpload');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    // Check for hash to load initial file (if provided via URL)
    const hash = window.location.hash.slice(1);
    if (hash) {
        loadFile(decodeURIComponent(hash));
    } else {
        // Default state
        document.getElementById('markdownContent').innerHTML = `
            <div style="padding: 40px; text-align: center; opacity: 0.6;">
                <h2>Markdown Reader</h2>
                <p>Open a local file or enter a path to start.</p>
            </div>
        `;
    }

    // Sidebar toggle logic
    setupSidebar();

    // Custom path form
    const form = document.getElementById('customPathForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('customPathInput');
            if (input.value.trim()) {
                loadFile(input.value.trim());
                closeSidebar();
            }
        });
    }
}

function setupSidebar() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            closeSidebar();
        });
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;

        // Update display
        document.getElementById('currentPath').textContent = file.name;
        // Clear hash as we are not using a path
        window.location.hash = '';

        renderMarkdown(text, file.name);
        closeSidebar();
    };

    reader.onerror = () => {
        alert('Error reading file');
    };

    reader.readAsText(file);
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
        // Resolve relative paths if we are loading from a path
        if (path && href && !href.startsWith('http') && !href.startsWith('/')) {
            // Check if path is a URL/Path string
            if (path.includes('/')) {
                const lastSlash = path.lastIndexOf('/');
                if (lastSlash !== -1) {
                    const basePath = path.substring(0, lastSlash + 1);
                    href = basePath + href;
                }
            }
        }
        return originalImage.call(this, href, title, text);
    };

    try {
        const html = marked.parse(text, { renderer: renderer });
        container.innerHTML = html;

        // Scroll to top
        window.scrollTo(0, 0);

    } catch (e) {
        container.innerHTML = `<div class="error-message">Error parsing markdown: ${e.message}</div>`;
    }
}
