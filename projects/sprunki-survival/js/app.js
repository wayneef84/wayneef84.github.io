document.addEventListener('DOMContentLoaded', () => {
    const roster = document.getElementById('roster');
    const toggle = document.getElementById('horrorToggle');
    let isHorror = false;

    function init() {
        renderRoster();

        toggle.addEventListener('change', (e) => {
            isHorror = e.target.checked;
            updateMode();
        });
    }

    function renderRoster() {
        roster.innerHTML = '';
        sprunkiData.forEach(char => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = char.id;

            // HTML Structure
            card.innerHTML = `
                <div class="card-img-container" style="background-color: ${char.color}20;">
                    <!-- Image inserted via JS for error handling -->
                </div>
                <div class="card-content">
                    <h2 class="card-title">${char.name}</h2>
                    <div class="card-meta">
                        <span class="char-type">${char.type}</span>
                        <span class="char-color" style="color:${char.color}">●</span>
                    </div>
                    <p class="card-desc">${char.normalDesc}</p>
                    <div class="survival-tip">
                        <span class="tip-label">Care Instructions:</span>
                        <span class="survival-tip-text">Keep well-tuned and rhythmically active.</span>
                    </div>
                </div>
            `;

            // Insert Image
            const container = card.querySelector('.card-img-container');
            loadImage(container, char, false);

            roster.appendChild(card);
        });
    }

    function loadImage(container, char, horrorMode) {
        container.innerHTML = '';
        const img = document.createElement('img');
        img.className = 'card-img';
        img.alt = char.name;
        img.src = horrorMode ? char.horrorImg : char.normalImg;

        img.onerror = () => {
            showFallback(container, char, horrorMode);
        };

        container.appendChild(img);
    }

    function showFallback(container, char, horrorMode) {
        container.innerHTML = '';
        const fallback = document.createElement('div');
        fallback.className = 'img-fallback';
        fallback.style.backgroundColor = char.color;

        // Darken text color if background is bright, lighten if dark?
        // For simplicity, using white text with shadow (handled in CSS).

        const fileName = horrorMode ?
            `${char.name.toLowerCase()}_horror.png` :
            `${char.name.toLowerCase()}_normal.png`;

        fallback.innerHTML = `
            <span>ASSET MISSING:</span>
            <br>
            <span style="font-family: monospace">${fileName}</span>
        `;

        container.appendChild(fallback);
    }

    function updateMode() {
        if (isHorror) {
            document.body.classList.add('horror-mode');
        } else {
            document.body.classList.remove('horror-mode');
        }

        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const id = card.dataset.id;
            const char = sprunkiData.find(d => d.id === id);
            if (!char) return;

            // Update Text
            const descEl = card.querySelector('.card-desc');
            const tipLabel = card.querySelector('.tip-label');
            const tipText = card.querySelector('.survival-tip-text');

            if (isHorror) {
                descEl.textContent = char.horrorDesc;
                tipLabel.textContent = "CONTAINMENT PROTOCOL:";
                tipText.textContent = char.survivalRating;
                card.style.borderColor = char.color; // Optional: Tint border
            } else {
                descEl.textContent = char.normalDesc;
                tipLabel.textContent = "Care Instructions:";
                tipText.textContent = "Keep well-tuned and rhythmically active.";
                card.style.borderColor = 'transparent';
            }

            // Update Image
            const container = card.querySelector('.card-img-container');
            loadImage(container, char, isHorror);
        });
    }

    init();
});
