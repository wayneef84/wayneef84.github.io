(function() {
    'use strict';

    function init() {
        console.log("Daily Command Center initializing...");
        console.log("Architecture by G. Execution by J.");

        var creditEl = document.getElementById('system-credit');
        if (creditEl) {
            creditEl.textContent = "Architecture by G. Execution by J.";
        }

        clearOldStreaks();
        loadFeed();
    }

    function loadFeed() {
        var xhr = new XMLHttpRequest();
        // Since index.html is in daily/, and json is in daily/, path is just filename
        // If this script is included in daily/index.html, relative path is from index.html
        xhr.open('GET', 'daily-feed.json', true);

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 400) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    renderDashboard(data);
                } catch (e) {
                    console.error("JSON Parse Error", e);
                    renderError("Failed to parse daily feed.");
                }
            } else {
                console.error("Server Error", xhr.status);
                // Fallback for file:// protocol where status might be 0 but responseText exists
                if (xhr.status === 0 && xhr.responseText) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        renderDashboard(data);
                    } catch (e) {
                        renderError("Failed to load daily feed (Protocol Error).");
                    }
                } else {
                    renderError("Failed to load daily feed.");
                }
            }
        };

        xhr.onerror = function() {
            console.error("Network Error");
            renderError("Network error loading feed.");
        };

        xhr.send();
    }

    function renderError(msg) {
        var container = document.querySelector('.dashboard-container');
        if (container) {
            var err = document.createElement('div');
            err.style.color = 'var(--accent)';
            err.style.textAlign = 'center';
            err.style.marginTop = '20px';
            err.textContent = msg;
            container.appendChild(err);
        }
    }

    function renderDashboard(data) {
        renderGreeting();
        if (data.context && data.context.weather) {
            renderWeather(data.context.weather);
        }
        if (data.digest) {
            renderQuote(data.digest.quote);
            renderNews(data.digest.news);
        }
        if (data.games) {
            renderGames(data.games);
        }
    }

    function renderGreeting() {
        var hour = new Date().getHours();
        var greeting = "Good Evening";
        if (hour < 5) greeting = "Good Night";
        else if (hour < 12) greeting = "Good Morning";
        else if (hour < 18) greeting = "Good Afternoon";

        var el = document.getElementById('greeting-title');
        if (el) el.textContent = greeting + ", Wayne.";

        var statusEl = document.getElementById('system-status');
        if (statusEl) statusEl.textContent = "SYSTEMS NOMINAL // " + new Date().toLocaleDateString();
    }

    function renderWeather(weather) {
        if (!weather) return;

        var condEl = document.getElementById('weather-condition');
        if (condEl) condEl.textContent = weather.condition;

        var tempEl = document.getElementById('weather-temp');
        if (tempEl) tempEl.textContent = weather.temp_high + "° / " + weather.temp_low + "°";

        var sumEl = document.getElementById('weather-summary');
        if (sumEl) sumEl.textContent = weather.code_forecast || weather.summary;

        // Simple icon logic
        var icon = "☁️";
        var cond = (weather.condition || '').toLowerCase();
        if (cond.indexOf('sun') > -1 || cond.indexOf('clear') > -1) icon = "☀️";
        else if (cond.indexOf('rain') > -1) icon = "🌧️";
        else if (cond.indexOf('storm') > -1) icon = "⚡";
        else if (cond.indexOf('snow') > -1) icon = "❄️";
        else if (cond.indexOf('partly') > -1) icon = "⛅";

        var iconEl = document.getElementById('weather-icon');
        if (iconEl) iconEl.textContent = icon;
    }

    function renderQuote(quote) {
        var el = document.getElementById('daily-quote');
        if (el) el.textContent = quote;
    }

    function renderNews(news) {
        var list = document.getElementById('news-list');
        if (!list) return;
        list.innerHTML = '';

        if (!news || news.length === 0) {
            list.innerHTML = '<li class="news-item" style="text-align:center; opacity:0.5;">No news today.</li>';
            return;
        }

        for (var i = 0; i < news.length; i++) {
            var item = news[i];
            var li = document.createElement('li');
            li.className = 'news-item';
            li.innerHTML =
                '<span class="news-category">' + item.category + '</span>' +
                '<a href="' + item.url + '" class="news-headline">' + item.headline + '</a>';
            list.appendChild(li);
        }
    }

    function renderGames(games) {
        var container = document.getElementById('game-grid');
        if (!container) return;
        container.innerHTML = '';

        // Sudoku
        var sudokuSeed = games.sudoku_seed;
        var sudokuPlayed = isPlayed('sudoku', sudokuSeed);

        // PuzzLLer
        var puzzleSeed = games.puzzller_seed;
        var puzzlePlayed = isPlayed('puzzller', puzzleSeed);

        container.appendChild(createGameCard(
            "Sudoku",
            "🧩",
            "../games/sudoku/index.html?daily=" + sudokuSeed,
            sudokuPlayed
        ));

        container.appendChild(createGameCard(
            "PuzzLLer",
            "🧠",
            "../games/puzzller/index.html?daily=" + puzzleSeed,
            puzzlePlayed
        ));
    }

    function createGameCard(title, icon, url, played) {
        var a = document.createElement('a');
        a.className = 'game-card-mini' + (played ? ' complete' : '');
        a.href = url;

        var statusHtml = played
            ? '<span class="status-badge status-complete">Complete</span>'
            : '<span class="status-badge status-ready">Ready</span>';

        a.innerHTML =
            '<div class="game-icon-mini">' + icon + '</div>' +
            '<div class="game-info-mini">' +
                '<h3 class="game-title-mini">' + title + '</h3>' +
                '<div class="game-meta">' +
                    statusHtml +
                '</div>' +
            '</div>';

        return a;
    }

    // Helper for LocalStorage
    function isPlayed(game, seed) {
        try {
            return localStorage.getItem('fong_daily_' + game + '_' + seed) === 'true';
        } catch(e) { return false; }
    }

    // Streaks were removed (no pressure mechanics). Clear any old streak keys.
    function clearOldStreaks() {
        try {
            var keys = ['fong_streak_sudoku', 'fong_streak_puzzller'];
            for (var i = 0; i < keys.length; i++) localStorage.removeItem(keys[i]);
        } catch(e) { /* storage blocked: nothing to clear */ }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
