var FILES = [
    { category: "Root", name: "README", path: "../../README.md" },
    { category: "Root", name: "AI Feedback", path: "../../AI_FEEDBACK.md" },
    { category: "Root", name: "Agents", path: "../../AGENTS.md" },
    { category: "Root", name: "Changelog", path: "../../CHANGELOG.md" },
    { category: "Root", name: "Roadmap", path: "../../ROADMAP.md" },
    { category: "Root", name: "Ideas (02/04/26)", path: "../../IDEAS_020426.md" },

    { category: "Agent Guidelines", name: "Claude", path: "../../CLAUDE.md" },
    { category: "Agent Guidelines", name: "Gemini", path: "../../GEMINI.md" },
    { category: "Agent Guidelines", name: "Jules", path: "../../JULES.md" },

    { category: "Lessons Learned", name: "LL Index", path: "../../LL/README.md" },
    { category: "Lessons Learned", name: "Card Engine", path: "../../LL/LL_CARD_ENGINE.md" },
    { category: "Lessons Learned", name: "ES5 & Safari", path: "../../LL/LL_ES5_SAFARI.md" },
    { category: "Lessons Learned", name: "Collaboration", path: "../../LL/LL_COLLABORATION.md" },

    { category: "NEGEN Engine", name: "NEGEN Ideas (C)", path: "../../NEGEN_IDEAS_C.md" },

    { category: "Games", name: "Snake Notes", path: "../../games/snake/LL_v2_snake.md" },

    { category: "Projects", name: "Shipment Tracker", path: "../../projects/shipment-tracker/README.md" }
];

// Imported files storage (session-based)
var importedFiles = {};
var currentFilePath = null;

// Infinite Scroll Globals
var allTokens = [];
var currentTokenIndex = 0;
var globalRenderer = null;
var renderingPath = null;

// View Mode & History
var viewMode = 'parsed'; // 'parsed' or 'raw'
var recentFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    loadImportedFromSession();
    loadHistory();
    init();
});

function loadHistory() {
    try {
        recentFiles = JSON.parse(localStorage.getItem('mdReader_recent') || '[]');
    } catch (e) {
        console.error("Failed to load history", e);
    }
}

function updateHistory(path) {
    if (path.startsWith('imported:')) return; // Don't save imported files to persistent history

    try {
        localStorage.setItem('mdReader_lastFile', path);

        // Remove if exists
        var idx = recentFiles.indexOf(path);
        if (idx !== -1) recentFiles.splice(idx, 1);

        // Add to top
        recentFiles.unshift(path);

        // Limit to 10
        if (recentFiles.length > 10) recentFiles.pop();

        localStorage.setItem('mdReader_recent', JSON.stringify(recentFiles));
        renderSidebar(); // Refresh sidebar
    } catch (e) {
        console.error("Failed to save history", e);
    }
}

function loadImportedFromSession() {
    try {
        var stored = sessionStorage.getItem('mdReaderImported');
        if (stored) {
            importedFiles = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to load imported files:', e);
    }
}

function saveImportedToSession() {
    try {
        sessionStorage.setItem('mdReaderImported', JSON.stringify(importedFiles));
    } catch (e) {
        console.error('Failed to save imported files:', e);
    }
}

function init() {
    setupSearch();
    renderSidebar();
    setupFileUpload();

    // View Toggle
    var toggleViewBtn = document.getElementById('toggleView');
    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', function() {
            viewMode = (viewMode === 'parsed') ? 'raw' : 'parsed';
            toggleViewBtn.textContent = (viewMode === 'parsed') ? '👁️ Parsed' : '📝 Raw';
            if (currentFilePath) {
                // Reload current file to re-render
                 // We don't have the text handy, so re-fetch is easiest (cache usually handles it)
                 if (currentFilePath.startsWith('imported:')) {
                     var filename = currentFilePath.replace('imported:', '');
                     if (importedFiles[filename]) renderMarkdown(importedFiles[filename], filename);
                 } else {
                     loadFile(currentFilePath);
                 }
            }
        });
    }

    // Check for hash to load initial file
    var hash = window.location.hash.slice(1);
    if (hash) {
        if (hash.startsWith('imported:')) {
            var filename = hash.replace('imported:', '');
            if (importedFiles[filename]) {
                loadImportedFile(filename);
            } else {
                loadFile(FILES[0].path);
            }
        } else {
            loadFile(decodeURIComponent(hash));
        }
    } else {
        // Load last opened or default
        var last = localStorage.getItem('mdReader_lastFile');
        if (last) {
            loadFile(last);
        } else {
            loadFile(FILES[0].path);
        }
    }

    // Sidebar toggle for mobile and desktop
    var toggleBtn = document.getElementById('toggleSidebar');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            if (window.innerWidth > 768) {
                // Desktop: Toggle collapsed state
                sidebar.classList.toggle('collapsed');
            } else {
                // Mobile: Toggle open state
                sidebar.classList.toggle('open');
                if (overlay) overlay.classList.toggle('active');
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            closeSidebar();
        });
    }

    // Infinite Scroll Listener
    var container = document.getElementById('markdownContent');
    if (container) {
        container.parentElement.addEventListener('scroll', function(e) {
            // Note: markdown-container is the scrollable element in style.css,
            // but the ID markdownContent is the inner div?
            // In index.html: <div id="markdownContent" class="markdown-body markdown-container">
            // So markdownContent IS the container.
        });

        // Wait, looking at index.html:
        // <div id="markdownContent" class="markdown-body markdown-container">
        // So the scroll listener should be on markdownContent.
        container.addEventListener('scroll', function() {
            if (container.scrollHeight - container.scrollTop - container.clientHeight < 1000) {
                renderNextChunk();
            }
        });
    }

    // Custom path form
    var form = document.getElementById('customPathForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var input = document.getElementById('customPathInput');
            if (input.value.trim()) {
                loadFile(input.value.trim());
                closeSidebar();
            }
        });
    }

    // Open in new tab button
    var openNewTabBtn = document.getElementById('openNewTab');
    if (openNewTabBtn) {
        openNewTabBtn.addEventListener('click', openInNewTab);
    }
}

function setupSearch() {
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            renderSidebar(e.target.value);
        });
    }
}

function closeSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

function setupFileUpload() {
    var uploadArea = document.getElementById('uploadArea');
    var fileInput = document.getElementById('fileUploadInput');

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            handleFileUpload(fileInput.files[0]);
        }
    });
}

function handleFileUpload(file) {
    if (!file.name.match(/\.(md|markdown|txt)$/i)) {
        alert('Please upload a markdown file (.md, .markdown, or .txt)');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var content = e.target.result;
        var filename = file.name;

        // Store in session
        importedFiles[filename] = content;
        saveImportedToSession();

        // Re-render sidebar to show new file
        renderSidebar();

        // Load the imported file
        loadImportedFile(filename);
    };
    reader.readAsText(file);
}

function removeImportedFile(filename, event) {
    event.stopPropagation();
    delete importedFiles[filename];
    saveImportedToSession();
    renderSidebar();

    // If this was current file, load default
    if (currentFilePath === 'imported:' + filename) {
        loadFile(FILES[0].path);
    }
}

function loadImportedFile(filename) {
    var content = importedFiles[filename];
    if (!content) return;

    currentFilePath = 'imported:' + filename;
    window.location.hash = 'imported:' + filename;

    var pathDisplay = document.getElementById('currentPath');
    pathDisplay.textContent = filename + ' (imported)';

    renderMarkdown(content, filename);

    // Update active state
    document.querySelectorAll('.file-btn').forEach(function(b) {
        b.classList.remove('active');
    });
    var importedBtn = document.querySelector('[data-imported="' + filename + '"]');
    if (importedBtn) importedBtn.classList.add('active');

    closeSidebar();
}

function renderSidebar(searchTerm) {
    searchTerm = (searchTerm || '').toLowerCase();
    var list = document.getElementById('fileList');
    if (!list) return;
    list.innerHTML = '';

    // Render Recent Files (only if no search term)
    if (!searchTerm && recentFiles.length > 0) {
        var recentHeader = document.createElement('li');
        recentHeader.innerHTML = '<div style="padding: 10px 15px; font-size: 0.8em; text-transform: uppercase; color: #60a5fa; opacity: 0.9; font-weight: bold; margin-top: 10px;">🕒 Recent</div>';
        list.appendChild(recentHeader);

        recentFiles.forEach(function(path) {
            // Find name in FILES if possible
            var fileObj = FILES.find(f => f.path === path);
            var name = fileObj ? fileObj.name : path.split('/').pop();

            var li = document.createElement('li');
            li.className = 'file-item';
            var btn = document.createElement('button');
            btn.className = 'file-btn';
            btn.innerHTML = '<span style="opacity: 0.7;">📄</span> ' + name;
            btn.addEventListener('click', function() {
                loadFile(path);
                closeSidebar();
            });
            list.appendChild(li);
        });
    }

    // Filter FILES
    var filteredFiles = FILES.filter(function(file) {
        if (!searchTerm) return true;
        return file.name.toLowerCase().includes(searchTerm) ||
               file.category.toLowerCase().includes(searchTerm);
    });

    // Group by category
    var categories = {};
    filteredFiles.forEach(function(file) {
        if (!categories[file.category]) {
            categories[file.category] = [];
        }
        categories[file.category].push(file);
    });

    // Render repo files
    Object.keys(categories).forEach(function(category) {
        var files = categories[category];

        var categoryHeader = document.createElement('li');
        categoryHeader.innerHTML = '<div style="padding: 10px 15px; font-size: 0.8em; text-transform: uppercase; color: var(--text-secondary); opacity: 0.7; font-weight: bold; margin-top: 10px;">' + category + '</div>';
        list.appendChild(categoryHeader);

        files.forEach(function(file) {
            var li = document.createElement('li');
            li.className = 'file-item';

            var btn = document.createElement('button');
            btn.className = 'file-btn';
            btn.innerHTML = '<span style="opacity: 0.7;">📄</span> ' + file.name;
            btn.addEventListener('click', function() {
                loadFile(file.path);
                document.querySelectorAll('.file-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                closeSidebar();
            });

            if (window.location.hash.slice(1) === file.path) {
                btn.classList.add('active');
            }

            li.appendChild(btn);
            list.appendChild(li);
        });
    });

    // Filter Imported Files
    var importedKeys = Object.keys(importedFiles).filter(function(filename) {
        if (!searchTerm) return true;
        return filename.toLowerCase().includes(searchTerm);
    });

    // Render imported files section
    if (importedKeys.length > 0) {
        var importedHeader = document.createElement('li');
        importedHeader.innerHTML = '<div style="padding: 10px 15px; font-size: 0.8em; text-transform: uppercase; color: #fbbf24; opacity: 0.9; font-weight: bold; margin-top: 10px;">📥 Imported (Session)</div>';
        list.appendChild(importedHeader);

        importedKeys.forEach(function(filename) {
            var li = document.createElement('li');
            li.className = 'file-item';

            var btn = document.createElement('button');
            btn.className = 'file-btn imported-file';
            btn.setAttribute('data-imported', filename);
            btn.innerHTML = '<span style="opacity: 0.7;">📄</span> <span class="imported-name">' + filename + '</span> <span class="remove-btn" title="Remove from session">✕</span>';

            btn.addEventListener('click', function(e) {
                if (e.target.classList.contains('remove-btn')) {
                    removeImportedFile(filename, e);
                } else {
                    loadImportedFile(filename);
                }
            });

            if (window.location.hash === '#imported:' + filename) {
                btn.classList.add('active');
            }

            li.appendChild(btn);
            list.appendChild(li);
        });
    }
}

function loadFile(path) {
    var container = document.getElementById('markdownContent');
    var pathDisplay = document.getElementById('currentPath');

    currentFilePath = path;
    window.location.hash = path;
    pathDisplay.textContent = path;

    container.innerHTML = '<div class="loading">Loading...</div>';

    fetch(path)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to load file: ' + response.status + ' ' + response.statusText);
            }
            return response.text();
        })
        .then(function(text) {
            // Large file check (1MB)
            if (text.length > 1000000) {
                var sizeMB = (text.length / 1024 / 1024).toFixed(2);
                if (!confirm('This file is very large (' + sizeMB + ' MB). Loading it might freeze the browser temporarily. Load anyway?')) {
                    container.innerHTML = '<div class="error-message">Load cancelled by user.</div>';
                    return;
                }
            }
            updateHistory(path);
            renderMarkdown(text, path);
        })
        .catch(function(error) {
            console.error(error);
            container.innerHTML = '<div class="error-message">' +
                '<h3>Error Loading File</h3>' +
                '<p>Could not load <code>' + path + '</code></p>' +
                '<p style="font-size: 0.9em; opacity: 0.8;">' + error.message + '</p>' +
                '<p style="font-size: 0.8em; margin-top: 20px;">Note: If you are opening this file directly from the file system (file://), this is expected due to security restrictions (CORS). You need to serve the directory via a local web server.</p>' +
                '</div>';
        });
}

function renderMarkdown(text, path) {
    var container = document.getElementById('markdownContent');

    if (typeof marked === 'undefined') {
        container.innerHTML = '<div class="error-message">Error: marked.js library not loaded.</div>';
        return;
    }

    marked.setOptions({
        highlight: function(code, lang) {
            if (typeof hljs !== 'undefined') {
                var language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language: language }).value;
            }
            return code;
        },
        langPrefix: 'hljs language-',
        breaks: true,
        gfm: true
    });

    var renderer = new marked.Renderer();
    var originalImage = renderer.image;

    renderer.image = function(href, title, text) {
        if (path && href && !href.startsWith('http') && !href.startsWith('/')) {
            if (path.includes('/')) {
                var lastSlash = path.lastIndexOf('/');
                if (lastSlash !== -1) {
                    var basePath = path.substring(0, lastSlash + 1);
                    href = basePath + href;
                }
            }
        }
        return originalImage.call(this, href, title, text);
    };

    globalRenderer = renderer;
    renderingPath = path;

    if (viewMode === 'raw') {
        container.innerHTML = '<pre style="white-space: pre-wrap; word-break: break-all;"><code>' +
            text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") +
            '</code></pre>';
        container.scrollTop = 0;
        return;
    }

    // BBC Translation
    text = convertBbcToMarkdown(text);

    try {
        // Use lexer to get tokens for chunking
        allTokens = marked.lexer(text);
        currentTokenIndex = 0;

        container.innerHTML = '';
        container.scrollTop = 0;

        renderNextChunk();
    } catch (e) {
        container.innerHTML = '<div class="error-message">Error parsing markdown: ' + e.message + '</div>';
    }
}

function convertBbcToMarkdown(text) {
    return text
        .replace(/\[b\](.*?)\[\/b\]/gi, '**$1**')
        .replace(/\[i\](.*?)\[\/i\]/gi, '*$1*')
        .replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>')
        .replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, '[$2]($1)')
        .replace(/\[img\](.*?)\[\/img\]/gi, '![]($1)')
        .replace(/\[code\]([\s\S]*?)\[\/code\]/gi, '```\n$1\n```')
        .replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '> $1');
}

function renderNextChunk() {
    if (currentTokenIndex >= allTokens.length) return;

    var chunkSize = 50; // Render 50 top-level blocks at a time
    var chunk = allTokens.slice(currentTokenIndex, currentTokenIndex + chunkSize);
    // Pass links from parent
    chunk.links = allTokens.links;

    currentTokenIndex += chunkSize;

    try {
        var html = marked.parser(chunk, { renderer: globalRenderer });

        // Create a temp div to hold the new content
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Append children to container
        var container = document.getElementById('markdownContent');
        while (tempDiv.firstChild) {
            container.appendChild(tempDiv.firstChild);
        }
    } catch (e) {
        console.error("Error rendering chunk:", e);
    }
}

function openInNewTab() {
    if (!currentFilePath) return;

    if (currentFilePath.startsWith('imported:')) {
        var filename = currentFilePath.replace('imported:', '');
        var content = importedFiles[filename];
        if (!content) return;

        var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + filename + '</title>' +
            '<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>' +
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">' +
            '<style>body{font-family:system-ui;max-width:900px;margin:0 auto;padding:40px;background:#0f172a;color:#f8fafc;line-height:1.6;}' +
            'a{color:#ffd700;}code{background:rgba(110,118,129,0.4);padding:2px 6px;border-radius:4px;}' +
            'pre{background:#1e1e1e;padding:16px;border-radius:6px;overflow-x:auto;border:1px solid rgba(255,255,255,0.1);}' +
            'pre code{background:transparent;padding:0;}' +
            'table{border-collapse:collapse;width:100%;}th,td{border:1px solid rgba(255,255,255,0.1);padding:8px 12px;}' +
            'h1{color:#ffd700;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:8px;}' +
            'h2{border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:8px;}</style></head>' +
            '<body><div id="content"></div><script>' +
            'document.getElementById("content").innerHTML = marked.parse(' + JSON.stringify(content) + ');<\/script></body></html>';
        var blob = new Blob([html], {type: 'text/html'});
        var url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } else {
        window.open(currentFilePath, '_blank');
    }
}
