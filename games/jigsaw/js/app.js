// games/jigsaw/js/app.js

var App = (function() {
    // UI Elements
    var screens = {
        setup: document.getElementById('setup-screen'),
        game: document.getElementById('game-screen')
    };

    var inputs = {
        file: document.getElementById('file-input'),
        difficulty: document.getElementById('difficulty'),
        rows: document.getElementById('rows'),
        cols: document.getElementById('cols'),
        jaggedness: document.getElementById('jaggedness'),
        snapDistance: document.getElementById('snap-distance'),
        customDiff: document.getElementById('custom-difficulty'),
        preview: document.getElementById('image-preview'),
        video: document.getElementById('camera-video'),
        canvas: document.getElementById('camera-canvas')
    };

    var buttons = {
        start: document.getElementById('start-btn'),
        load: document.getElementById('load-btn'),
        exit: document.getElementById('exit-btn'),
        save: document.getElementById('save-btn'),
        hint: document.getElementById('hint-btn'),
        playAgain: document.getElementById('play-again-btn'),
        takePhoto: document.getElementById('take-photo-btn'),
        capture: document.getElementById('capture-btn'),
        cancelCamera: document.getElementById('cancel-camera-btn')
    };

    var modals = {
        win: document.getElementById('win-modal'),
        camera: document.getElementById('camera-modal')
    };

    // State
    var currentImage = null; // Image object

    function init() {
        bindEvents();
        checkSavedGame();
    }

    function bindEvents() {
        // File Input
        inputs.file.addEventListener('change', handleFileSelect);

        // Camera Controls
        buttons.takePhoto.addEventListener('click', startCamera);
        buttons.capture.addEventListener('click', capturePhoto);
        buttons.cancelCamera.addEventListener('click', stopCamera);

        // Difficulty Select
        inputs.difficulty.addEventListener('change', function() {
            if (this.value === 'custom') {
                inputs.customDiff.classList.remove('hidden');
            } else {
                inputs.customDiff.classList.add('hidden');
            }
        });

        // Start Button
        buttons.start.addEventListener('click', startGame);

        // Load Button
        buttons.load.addEventListener('click', loadGame);

        // Game Controls
        buttons.exit.addEventListener('click', function() {
            if (confirm("Exit to menu? Unsaved progress will be lost.")) {
                showSetup();
            }
        });

        buttons.save.addEventListener('click', function() {
            if (typeof Puzzle !== 'undefined') {
                Puzzle.save();
                alert("Game Saved!");
            }
        });

        buttons.hint.addEventListener('mousedown', function() {
            if (typeof Puzzle !== 'undefined') Puzzle.toggleHint(true);
        });
        buttons.hint.addEventListener('mouseup', function() {
            if (typeof Puzzle !== 'undefined') Puzzle.toggleHint(false);
        });
        buttons.hint.addEventListener('touchstart', function(e) {
            e.preventDefault(); // prevent mouse emulation
            if (typeof Puzzle !== 'undefined') Puzzle.toggleHint(true);
        });
        buttons.hint.addEventListener('touchend', function(e) {
             e.preventDefault();
            if (typeof Puzzle !== 'undefined') Puzzle.toggleHint(false);
        });

        buttons.playAgain.addEventListener('click', function() {
            modals.win.classList.add('hidden');
            showSetup();
        });
    }

    function handleFileSelect(e) {
        var file = e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(event) {
            var img = new Image();
            img.onload = function() {
                currentImage = img;
                // Show preview
                inputs.preview.innerHTML = '';
                inputs.preview.appendChild(img);
                buttons.start.disabled = false;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function getSettings() {
        var diff = inputs.difficulty.value;
        var rows, cols;

        if (diff === 'custom') {
            rows = parseInt(inputs.rows.value) || 5;
            cols = parseInt(inputs.cols.value) || 8;
        } else {
            // Approx pieces logic
            var total = parseInt(diff);
            // Calculate ratio based on image
            var ratio = currentImage.width / currentImage.height;
            // rows * cols = total
            // cols / rows = ratio  => cols = rows * ratio
            // rows * (rows * ratio) = total => rows^2 = total / ratio
            rows = Math.sqrt(total / ratio);
            rows = Math.max(2, Math.round(rows));
            cols = Math.max(2, Math.round(total / rows));
        }

        return {
            rows: rows,
            cols: cols,
            jaggedness: parseInt(inputs.jaggedness.value) / 100, // 0 to 1
            snapDistance: parseInt(inputs.snapDistance.value)
        };
    }

    function startGame() {
        if (!currentImage) return;

        var settings = getSettings();

        // Save image for reload
        // Convert image to dataURL (it already is if loaded from file, but might need canvas if huge)
        // For now assume it fits.
        try {
            Storage.saveImage(currentImage.src);
        } catch (e) {
            console.warn("Could not save image to local storage");
        }

        screens.setup.classList.add('hidden');
        screens.game.classList.remove('hidden');

        // Init Puzzle
        if (typeof Puzzle !== 'undefined') {
            Puzzle.init(currentImage, settings);
        }
    }

    function loadGame() {
        var savedImage = Storage.loadImage();
        if (!savedImage) {
            alert("No saved game found.");
            return;
        }

        var img = new Image();
        img.onload = function() {
            currentImage = img;
            screens.setup.classList.add('hidden');
            screens.game.classList.remove('hidden');

            if (typeof Puzzle !== 'undefined') {
                Puzzle.load(img);
            }
        };
        img.onerror = function() {
            alert("Failed to load saved image.");
        };
        img.src = savedImage;
    }

    function checkSavedGame() {
        var saved = Storage.load('state');
        if (saved) {
            buttons.load.disabled = false;
            buttons.load.textContent = "Load Saved Game (" + saved.timestamp + ")"; // simplistic
        } else {
            buttons.load.disabled = true;
        }
    }

    function showSetup() {
        screens.game.classList.add('hidden');
        screens.setup.classList.remove('hidden');
        buttons.start.disabled = !currentImage;
        checkSavedGame();

        if (typeof Puzzle !== 'undefined') {
            Puzzle.stop();
        }
    }

    function showWin(timeStr) {
        document.getElementById('final-time').textContent = timeStr;
        modals.win.classList.remove('hidden');
    }

    function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Camera not supported or permission denied.");
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                inputs.video.srcObject = stream;
                inputs.video.play();
                modals.camera.classList.remove('hidden');
            })
            .catch(function(err) {
                console.error("Error accessing camera: ", err);
                alert("Could not access camera. Please allow camera permissions.");
            });
    }

    function stopCamera() {
        var stream = inputs.video.srcObject;
        if (stream) {
            var tracks = stream.getTracks();
            tracks.forEach(function(track) {
                track.stop();
            });
        }
        inputs.video.srcObject = null;
        modals.camera.classList.add('hidden');
    }

    function capturePhoto() {
        var video = inputs.video;
        var canvas = inputs.canvas;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            var ctx = canvas.getContext('2d');

            // Mirror the capture to match the CSS mirrored preview
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            var dataURL = canvas.toDataURL('image/png');

            var img = new Image();
            img.onload = function() {
                currentImage = img;
                // Show preview
                inputs.preview.innerHTML = '';
                inputs.preview.appendChild(img);
                buttons.start.disabled = false;
                stopCamera();
            };
            img.src = dataURL;
        }
    }

    return {
        init: init,
        showWin: showWin
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
