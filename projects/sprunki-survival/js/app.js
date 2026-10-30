(function () {
    'use strict';

    // Calm handbook only. There is no mode switch and nothing is read from storage,
    // so any old saved setting from the removed switch is never looked at.
    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) { node.className = className; }
        if (text) { node.textContent = text; }
        return node;
    }

    function showFallback(container, char) {
        container.innerHTML = '';
        var fallback = el('div', 'img-fallback');
        fallback.style.backgroundColor = char.color;
        fallback.appendChild(el('span', '', 'ASSET MISSING:'));
        fallback.appendChild(document.createElement('br'));
        var name = el('span', '', char.name.toLowerCase() + '_normal.png');
        name.style.fontFamily = 'monospace';
        fallback.appendChild(name);
        container.appendChild(fallback);
    }

    function loadImage(container, char) {
        container.innerHTML = '';
        if (!char.normalImg) {
            showFallback(container, char);
            return;
        }
        var img = document.createElement('img');
        img.className = 'card-img';
        img.alt = char.name;
        img.onerror = function () { showFallback(container, char); };
        img.src = char.normalImg;
        container.appendChild(img);
    }

    function renderCard(char) {
        var card = el('div', 'card');
        card.setAttribute('data-id', char.id);

        var imgBox = el('div', 'card-img-container');
        imgBox.style.backgroundColor = char.color + '20';
        card.appendChild(imgBox);

        var content = el('div', 'card-content');
        content.appendChild(el('h2', 'card-title', char.name));

        var meta = el('div', 'card-meta');
        meta.appendChild(el('span', 'char-type', char.type));
        var dot = el('span', 'char-color', '●');
        dot.style.color = char.color;
        meta.appendChild(dot);
        content.appendChild(meta);

        content.appendChild(el('p', 'card-desc', char.normalDesc));

        var tip = el('div', 'survival-tip');
        tip.appendChild(el('span', 'tip-label', 'Care Instructions:'));
        tip.appendChild(document.createTextNode(' '));
        tip.appendChild(el('span', 'survival-tip-text', 'Keep well-tuned and rhythmically active.'));
        content.appendChild(tip);

        card.appendChild(content);
        loadImage(imgBox, char);
        return card;
    }

    function start() {
        var roster = document.getElementById('roster');
        roster.innerHTML = '';
        for (var i = 0; i < sprunkiData.length; i++) {
            roster.appendChild(renderCard(sprunkiData[i]));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
}());
