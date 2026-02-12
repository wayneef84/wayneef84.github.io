document.addEventListener('DOMContentLoaded', () => {
    const book = document.getElementById('book');
    const navTabs = document.getElementById('nav-tabs');
    const themeToggle = document.getElementById('theme-toggle');

    // Add Close Button
    const controls = document.querySelector('.controls');
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn';
    closeBtn.textContent = 'Close Book';
    closeBtn.onclick = () => {
        flipToPage(-1); // Close book
        // Reset active tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    };
    if (controls) {
        controls.appendChild(closeBtn);
    }

    // State
    let contentData = [];
    let pages = [];
    let currentPageIndex = -1; // -1 means closed (no pages flipped)
    let totalPages = 0;

    // Theme Handling
    const themes = ['classic', 'dark', 'modern'];
    let currentTheme = localStorage.getItem('encyclopedia_theme') || 'classic';
    setTheme(currentTheme);

    themeToggle.addEventListener('click', () => {
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    });

    function setTheme(theme) {
        currentTheme = theme;
        document.body.className = `theme-${theme}`;
        localStorage.setItem('encyclopedia_theme', theme);
        themeToggle.textContent = `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
    }

    // Fetch Data
    fetch('data/content.json')
        .then(response => response.json())
        .then(data => {
            contentData = data.entries;
            initBook();
        })
        .catch(err => console.error('Failed to load content:', err));

    function initBook() {
        // Group content
        const ITEMS_PER_RANGE = 8;
        const ranges = [];
        for (let i = 0; i < contentData.length; i += ITEMS_PER_RANGE) {
            ranges.push(contentData.slice(i, i + ITEMS_PER_RANGE));
        }

        const backCover = document.querySelector('.page.cover.back');

        // Dynamically create pages
        ranges.forEach((rangeItems, index) => {
            const firstLetter = rangeItems[0].term.charAt(0).toUpperCase();
            const lastLetter = rangeItems[rangeItems.length - 1].term.charAt(0).toUpperCase();
            const label = firstLetter === lastLetter ? firstLetter : `${firstLetter}-${lastLetter}`;
            const rangeIndex = index;

            // 1. Create Navigation Tab
            const tab = document.createElement('div');
            tab.className = 'tab';
            tab.textContent = label;
            tab.onclick = (e) => {
                e.stopPropagation();

                // Target: We want to see Spread (Index + 1).
                // Spread 1 (Index 0) is Page 1 Back + Page 2 Front.
                // This requires Page 0 and Page 1 to be FLIPPED.
                // So flipToPage(1).
                // Spread N (Index N) requires flipToPage(1 + N).
                flipToPage(1 + rangeIndex);
            };
            navTabs.appendChild(tab);

            // 2. Setup Index on Previous Page Back
            // The previous page is Page (1 + index).
            // Page 0 = Cover
            // Page 1 = Intro
            // If index=0, we target Page 1.
            const prevPageIdx = 1 + rangeIndex;
            // We need to find this page in DOM or create it?
            // Page 1 exists.
            // Page 2 (created in loop 0) exists for loop 1.

            let prevPage = document.querySelector(`.page[data-page="${prevPageIdx}"]`);

            // Render Index List
            const indexListHTML = document.createElement('ul');
            indexListHTML.className = 'index-list';

            rangeItems.forEach((item) => {
                const li = document.createElement('li');
                li.textContent = item.term;
                li.dataset.term = item.term;
                li.onclick = (e) => {
                    e.stopPropagation();
                    // Show content on the facing page (Right side)
                    // Facing page is Page (2 + rangeIndex)
                    showContent(2 + rangeIndex, item);

                    // Highlight active
                    const allLi = prevPage.querySelectorAll('.index-list li');
                    allLi.forEach(l => l.classList.remove('active'));
                    li.classList.add('active');
                };
                indexListHTML.appendChild(li);
            });

            // Inject into Back of Prev Page
            if (prevPage) {
                const back = prevPage.querySelector('.page-side.back');
                if (back) {
                    back.innerHTML = ''; // Clear placeholders
                    const container = document.createElement('div');
                    container.className = 'content-container';
                    container.innerHTML = `<h3>Index ${label}</h3>`;
                    container.appendChild(indexListHTML);

                    back.appendChild(container);

                    // Add Page Number
                    const num = document.createElement('div');
                    num.className = 'page-number';
                    num.textContent = (prevPageIdx * 2);
                    back.appendChild(num);
                }
            }

            // 3. Create Content Page (The Right Side)
            const newPageIdx = 2 + rangeIndex;
            const newPage = document.createElement('div');
            newPage.className = 'page';
            newPage.dataset.page = newPageIdx;

            // Front (Right Content)
            const front = document.createElement('div');
            front.className = 'page-side front';
            // Default content
            front.innerHTML = renderContentHTML(rangeItems[0]);

            const frontNum = document.createElement('div');
            frontNum.className = 'page-number';
            frontNum.textContent = (newPageIdx * 2) - 1;
            front.appendChild(frontNum); // Append after content

            // Back (Empty for next index)
            const back = document.createElement('div');
            back.className = 'page-side back';

            newPage.appendChild(front);
            newPage.appendChild(back);

            book.insertBefore(newPage, backCover);
        });

        // Re-query pages
        pages = Array.from(document.querySelectorAll('.page'));
        totalPages = pages.length;

        // Update Z-Index initially
        updateZIndex();

        // Click to flip
        pages.forEach((page, i) => {
            page.onclick = (e) => {
                // If clicking a link or button inside, handle it?
                // But for now, simple flip logic
                if (e.target.closest('.index-list li')) return; // handled by li click

                if (page.classList.contains('flipped')) {
                    flipToPage(i - 1);
                } else {
                    flipToPage(i);
                }
            };
        });
    }

    function renderContentHTML(item) {
        // Safe access
        const desc = item.definition || item.description || '';
        const cat = item.category || 'General';

        return `
            <div class="content-container">
                <div class="two-column">
                    <h3>${item.term}</h3>
                    <p><strong>Category:</strong> ${cat}</p>
                    <p>${desc}</p>
                </div>
            </div>
        `;
    }

    function showContent(pageIndex, item) {
        const page = pages.find(p => parseInt(p.dataset.page) === pageIndex);
        if (page) {
            const front = page.querySelector('.front');
            const num = front.querySelector('.page-number');
            const numHTML = num ? num.outerHTML : '';

            front.innerHTML = renderContentHTML(item);
            if (numHTML) front.insertAdjacentHTML('beforeend', numHTML);
        }
    }

    function flipToPage(index) {
        currentPageIndex = index;

        pages.forEach((page, i) => {
            if (i <= index) {
                page.classList.add('flipped');
            } else {
                page.classList.remove('flipped');
            }
        });

        if (index >= 0 && index < totalPages - 1) {
            book.classList.add('open');

            // Update Active Tab based on page
            // Page 1 flipped -> Range 0
            // Page 2 flipped -> Range 1
            // So rangeIndex = index - 1
            const rangeIdx = index - 1;
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach((t, i) => {
                if (i === rangeIdx) t.classList.add('active');
                else t.classList.remove('active');
            });

        } else {
            book.classList.remove('open');
            // Clear tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        }

        updateZIndex();
    }

    function updateZIndex() {
        // Correct z-index stacking
        pages.forEach((page, i) => {
            if (page.classList.contains('flipped')) {
                // Flipped stack: 0, 1, 2... (0 is bottom, 2 is top)
                page.style.zIndex = i + 1;
            } else {
                // Unflipped stack: ...3, 4, 5 (3 is top, 5 is bottom)
                page.style.zIndex = totalPages - i;
            }
        });
    }

    // Global expose for debug
    window.bookAPI = {
        flipToPage,
        setTheme
    };
});
