(function() {
    // Check if data is loaded
    if (typeof survivalData === 'undefined') {
        console.error("Survival Data not found!");
        return;
    }

    var currentIndex = 0;
    var isAnimating = false;

    // DOM Elements
    var spineNav = document.getElementById('spine-nav');
    var pageRight = document.getElementById('page-right');

    // Content Elements
    var els = {
        title: document.getElementById('entry-title'),
        situation: document.getElementById('entry-situation'),
        gear: document.getElementById('entry-gear'),
        tip: document.getElementById('entry-tip'),
        wcScenario: document.getElementById('wc-scenario'),
        wcAction: document.getElementById('wc-action'),
        pgLeft: document.getElementById('pg-num-left'),
        pgRight: document.getElementById('pg-num-right')
    };

    function init() {
        renderNav();
        // Load initial content without animation
        updateContent(0);
        updateNav(0);

        // Add keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (isAnimating) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                var next = (currentIndex + 1) % survivalData.length;
                goToEntry(next);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                var prev = (currentIndex - 1 + survivalData.length) % survivalData.length;
                goToEntry(prev);
            }
        });
    }

    function renderNav() {
        spineNav.innerHTML = '';
        survivalData.forEach(function(entry, index) {
            var dot = document.createElement('div');
            dot.className = 'nav-dot';
            dot.title = entry.title;
            dot.onclick = function() {
                if (index !== currentIndex && !isAnimating) {
                    goToEntry(index);
                }
            };
            spineNav.appendChild(dot);
        });
    }

    function updateNav(index) {
        var dots = document.querySelectorAll('.nav-dot');
        for (var i = 0; i < dots.length; i++) {
            if (i === index) {
                dots[i].classList.add('active');
            } else {
                dots[i].classList.remove('active');
            }
        }
    }

    function goToEntry(index) {
        if (isAnimating) return;
        isAnimating = true;

        // 1. Close the book (Flip right page to left)
        // actually, in CSS, .page.flipped rotates -180deg.
        // My CSS for page-right origin is left center.
        // So adding .flipped should close it.
        pageRight.classList.add('flipped');

        // 2. Wait for animation (600ms defined in CSS)
        setTimeout(function() {
            // 3. Update content while closed
            updateContent(index);
            updateNav(index);
            currentIndex = index;

            // 4. Open the book
            pageRight.classList.remove('flipped');

            // 5. Reset animation lock after open finishes
            setTimeout(function() {
                isAnimating = false;
            }, 600);

        }, 600);
    }

    function updateContent(index) {
        var data = survivalData[index];

        els.title.textContent = data.title;
        els.situation.textContent = data.situation;

        // Gear List
        els.gear.innerHTML = '';
        if (data.gear && data.gear.length) {
            data.gear.forEach(function(item) {
                var li = document.createElement('li');
                li.textContent = item;
                els.gear.appendChild(li);
            });
        }

        els.tip.textContent = data.tips;

        if (data.worstCase) {
            els.wcScenario.textContent = data.worstCase.scenario;
            els.wcAction.textContent = data.worstCase.immediateAction;
        }

        // Page Numbers
        var pageNum = (index * 2) + 1;
        els.pgLeft.textContent = pad(pageNum);
        els.pgRight.textContent = pad(pageNum + 1);
    }

    function pad(num) {
        return num < 10 ? '0' + num : num;
    }

    // Run Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
