document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dom = {
        packTitle: document.getElementById('packTitle'),
        qCount: document.getElementById('qCount'),
        questionText: document.getElementById('questionText'),
        mediaContainer: document.getElementById('mediaContainer'),
        answerGrid: document.getElementById('answerGrid'),
        answers: {
            'A': document.querySelector('button[data-option="A"]'),
            'B': document.querySelector('button[data-option="B"]'),
            'C': document.querySelector('button[data-option="C"]'),
            'D': document.querySelector('button[data-option="D"]')
        },
        scoreValue: document.getElementById('scoreValue'),
        streakValue: document.getElementById('streakValue'),
        progressBar: document.getElementById('progressBar'),
        timerDisplay: document.getElementById('timerDisplay'),
        lockToggle: document.getElementById('lockToggle'),
        nextBtn: document.getElementById('nextBtn'),
        feedbackArea: document.getElementById('feedbackArea'),
        feedbackTitle: document.getElementById('feedbackTitle'),
        feedbackText: document.getElementById('feedbackText'),
        endScreen: document.getElementById('endScreen'),
        finalScore: document.getElementById('finalScore'),
        finalCorrect: document.getElementById('finalCorrect'),
        finalStreak: document.getElementById('finalStreak'),
        restartBtn: document.getElementById('restartBtn')
    };

    let engine = null;
    let currentPackData = null;

    // Initialize Game
    init();

    async function init() {
        // Load Pack
        try {
            const response = await fetch('packs/sprunki_v1.json');
            if (!response.ok) throw new Error('Failed to load pack');
            currentPackData = await response.json();

            dom.packTitle.textContent = currentPackData.meta.title.toUpperCase();

            setupEngine();
            bindEvents();

            // Start
            engine.startRound();
        } catch (e) {
            console.error(e);
            dom.questionText.textContent = "Error loading game pack. Please refresh.";
        }
    }

    function setupEngine() {
        engine = new QuizEngine({
            limit: 10,
            timer: 15,
            onTick: updateTimer,
            onQuestionLoaded: renderQuestion,
            onFeedback: showFeedback,
            onGameEnd: showEndScreen
        });

        engine.loadPack(currentPackData);
    }

    function bindEvents() {
        // Answer Clicks
        Object.keys(dom.answers).forEach(key => {
            dom.answers[key].addEventListener('click', () => {
                engine.selectAnswer(key);
            });
        });

        // Lock Toggle
        dom.lockToggle.addEventListener('change', (e) => {
            engine.settings.lockFastForward = e.target.checked;
            updateNextButtonState();
        });

        // Next Button
        dom.nextBtn.addEventListener('click', () => {
            engine.triggerFastForward();
        });

        // Restart
        dom.restartBtn.addEventListener('click', () => {
            dom.endScreen.classList.add('hidden');
            engine.startRound();
        });
    }

    // --- Render Functions ---

    function updateTimer(seconds) {
        dom.timerDisplay.textContent = seconds;
        if (seconds <= 5) {
            dom.timerDisplay.classList.add('danger');
        } else {
            dom.timerDisplay.classList.remove('danger');
        }
    }

    function renderQuestion(data) {
        // Reset UI
        dom.feedbackArea.classList.add('hidden');
        dom.mediaContainer.classList.add('hidden');
        dom.nextBtn.disabled = true;
        updateNextButtonState();

        // Update Text
        dom.qCount.textContent = `${data.index}/${data.total}`;
        dom.questionText.textContent = data.question.text;

        // Update Score/Streak
        dom.scoreValue.textContent = data.score;
        dom.streakValue.textContent = data.streak;

        // Progress Bar
        const progress = ((data.index - 1) / data.total) * 100;
        dom.progressBar.style.width = `${progress}%`;

        // Render Options
        Object.keys(dom.answers).forEach(key => {
            const btn = dom.answers[key];
            const optionText = data.question.options[key];

            btn.disabled = false;
            btn.className = 'answer-btn'; // Reset classes

            const textSpan = btn.querySelector('.option-text');
            if (optionText) {
                textSpan.textContent = optionText;
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none'; // Hide if option doesn't exist (e.g. True/False)
            }
        });

        // Media
        if (data.question.media) {
            // Placeholder for media handling
            dom.mediaContainer.classList.remove('hidden');
            dom.mediaContainer.innerHTML = `<img src="${data.question.media}" alt="Question Image" style="max-width:100%; border-radius: 8px;">`;
        }
    }

    function showFeedback(data) {
        // Disable all buttons
        Object.values(dom.answers).forEach(btn => btn.disabled = true);

        // Highlight Buttons
        const correctBtn = dom.answers[data.correctAnswer];
        if (correctBtn) correctBtn.classList.add('correct');

        if (!data.correct && !data.timeOut && data.selected) {
            const selectedBtn = dom.answers[data.selected];
            if (selectedBtn) selectedBtn.classList.add('incorrect');
        }

        // Show Feedback Overlay?
        // In "Lock Fast Forward" mode, we skip the overlay or show it briefly via Engine delay
        // But visually we want to see the red/green immediately.

        if (!engine.settings.lockFastForward) {
             dom.nextBtn.disabled = false;
             // Optional: Show explanation text if not in fast mode
             // For now we keep it simple on the grid
        }

        // Update Stats immediately
        if (data.score !== undefined) dom.scoreValue.textContent = data.score;
        if (data.streak !== undefined) dom.streakValue.textContent = data.streak;
    }

    function showEndScreen(data) {
        dom.progressBar.style.width = '100%';
        dom.endScreen.classList.remove('hidden');

        dom.finalScore.textContent = data.score;

        // Calculate correct count from history
        const correctCount = data.history.filter(h => h.isCorrect).length;
        dom.finalCorrect.textContent = `${correctCount}/${data.history.length}`;
        dom.finalStreak.textContent = data.maxStreak;
    }

    function updateNextButtonState() {
        if (engine.settings.lockFastForward) {
            dom.nextBtn.style.display = 'none';
        } else {
            dom.nextBtn.style.display = 'block';
        }
    }
});
