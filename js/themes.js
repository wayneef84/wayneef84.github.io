/**
 * ============================================================================
 * 🎨 THEME CONFIGURATION FILE
 * ============================================================================
 * * --- INSTRUCTIONS FOR HUMANS ---
 * To add a new theme:
 * 1. Copy an existing block (like 'fantasy' or 'classic').
 * 2. Paste it at the bottom of the list.
 * 3. Change the 'key' (e.g., 'my_new_theme') and the 'name'.
 * 4. Update the symbols. You must keep the IDs (1-6, W, S) consistent.
 * * --- INSTRUCTIONS FOR LLM / AI ---
 * Context: This object defines the visual assets for a slot machine engine.
 * Schema Rules:
 * - Root keys (e.g., 'fantasy') must be unique lowercase strings.
 * - 'symbols' array must contain exactly 8 objects.
 * - Symbols IDs '1' through '6' represent standard paying symbols (Low to High).
 * - Symbol ID 'W' is the Wild. Symbol ID 'S' is the Scatter.
 * - 'weight' determines frequency (Higher = More common).
 * ============================================================================
 */
/**
 * ============================================================================
 * 🎨 THEME CONFIGURATION FILE (v1.2)
 * Adds 'paylineColor' for custom win line styling.
 * ============================================================================
 */

/**
 * ============================================================================
 * 🎨 THEME CONFIGURATION FILE (v1.3 - Complete Collection)
 * Contains all 20 themes from the original specification.
 * ============================================================================
 */

/**
 * ============================================================================
 * 🎨 THEME CONFIGURATION FILE (v1.3)
 * ============================================================================
 */

/**
 * ============================================================================
 * 🎨 THEME CONFIGURATION FILE
 * Version: 1.0 (Gold Master)
 * ============================================================================
 */

const THEME_LIBRARY = {
    // 🦄 1. MYSTICAL UNICORN
    'fantasy': {
        name: 'Mystical Unicorn',
        paylineColor: '#ffd700', // Gold
        bgMusic: '../music/fantasy.mp3',
        symbols: [
            { id: '1', name: '💎', value: 5,   weight: 100, color: '#3498db' },
            { id: '2', name: '🔮', value: 10,  weight: 80,  color: '#9b59b6' },
            { id: '3', name: '🛡️', value: 20,  weight: 60,  color: '#95a5a6' },
            { id: '4', name: '⚔️', value: 30,  weight: 50,  color: '#e74c3c' },
            { id: '5', name: '👸', value: 50,  weight: 30,  color: '#f1c40f' },
            { id: '6', name: '🏰', value: 100, weight: 20,  color: '#ecf0f1' },
            { id: 'W', name: '🦄', value: 200, weight: 15,  color: '#ff69b4', isWild: true },
            { id: 'S', name: '🌟', value: 0,   weight: 10,  color: '#ffd700', isScatter: true }
        ]
    },

    // 🍒 2. VEGAS CLASSIC
    'classic': {
        name: 'Classic Fruits',
        paylineColor: '#e74c3c', // Red
        bgMusic: '../music/classic.mp3',
        symbols: [
            { id: '1', name: '🍒', value: 5,   weight: 100, color: '#e74c3c' },
            { id: '2', name: '🍋', value: 10,  weight: 80,  color: '#f1c40f' },
            { id: '3', name: '🍊', value: 20,  weight: 60,  color: '#e67e22' },
            { id: '4', name: '🍇', value: 30,  weight: 50,  color: '#8e44ad' },
            { id: '5', name: '🔔', value: 50,  weight: 30,  color: '#f39c12' },
            { id: '6', name: '💎', value: 100, weight: 20,  color: '#3498db' },
            { id: 'W', name: '🃏', value: 200, weight: 15,  color: '#fff', isWild: true },
            { id: 'S', name: '💰', value: 0,   weight: 10,  color: '#2ecc71', isScatter: true }
        ]
    },

    // 🐙 3. OCEAN ADVENTURE
    'ocean': {
        name: 'Ocean Adventure',
        paylineColor: '#00ffff', // Cyan
        bgMusic: '../music/ocean.mp3',
        symbols: [
            { id: '1', name: '🐠', value: 5,   weight: 100, color: '#00bcd4' },
            { id: '2', name: '🐙', value: 10,  weight: 80,  color: '#9c27b0' },
            { id: '3', name: '🐋', value: 20,  weight: 60,  color: '#2196f3' },
            { id: '4', name: '🦈', value: 30,  weight: 50,  color: '#607d8b' },
            { id: '5', name: '🐬', value: 50,  weight: 30,  color: '#03a9f4' },
            { id: '6', name: '💰', value: 100, weight: 20,  color: '#ffc107' },
            { id: 'W', name: '🌊', value: 200, weight: 15,  color: '#00acc1', isWild: true },
            { id: 'S', name: '⚓', value: 0,   weight: 10,  color: '#795548', isScatter: true }
        ]
    },

    // 🚀 4. SPACE EXPLORER
    'space': {
        name: 'Space Explorer',
        paylineColor: '#00ff00', // Green
        bgMusic: '../music/space.mp3',
        symbols: [
            { id: '1', name: '👽', value: 5,   weight: 100, color: '#4caf50' },
            { id: '2', name: '🚀', value: 10,  weight: 80,  color: '#f44336' },
            { id: '3', name: '🪐', value: 20,  weight: 60,  color: '#ff9800' },
            { id: '4', name: '🛸', value: 30,  weight: 50,  color: '#9c27b0' },
            { id: '5', name: '👨‍🚀', value: 50,  weight: 30,  color: '#2196f3' },
            { id: '6', name: '🌌', value: 100, weight: 20,  color: '#673ab7' },
            { id: 'W', name: '⭐', value: 200, weight: 15,  color: '#ffeb3b', isWild: true },
            { id: 'S', name: '🌍', value: 0,   weight: 10,  color: '#4caf50', isScatter: true }
        ]
    },

    // 🦁 5. WILD ANIMALS
    'animals': {
        bgMusic: '../music/default.mp3',
        name: 'Wild Animals',
        paylineColor: '#e67e22', // Orange
        symbols: [
            { id: '1', name: '🐵', value: 5,   weight: 100, color: '#8d6e63' },
            { id: '2', name: '🐅', value: 10,  weight: 80,  color: '#ff9800' },
            { id: '3', name: '🐘', value: 20,  weight: 60,  color: '#607d8b' },
            { id: '4', name: '🦁', value: 30,  weight: 50,  color: '#ffc107' },
            { id: '5', name: '🐼', value: 50,  weight: 30,  color: '#9e9e9e' },
            { id: '6', name: '🐉', value: 100, weight: 20,  color: '#f44336' },
            { id: 'W', name: '🦊', value: 200, weight: 15,  color: '#ff5722', isWild: true },
            { id: 'S', name: '🌿', value: 0,   weight: 10,  color: '#4caf50', isScatter: true }
        ]
    },

    // 🍕 6. DELICIOUS TREATS
    'food': {
        bgMusic: '../music/default.mp3',
        name: 'Delicious Treats',
        paylineColor: '#ff69b4', // Pink
        symbols: [
            { id: '1', name: '🍕', value: 5,   weight: 100, color: '#ff6b35' },
            { id: '2', name: '🍔', value: 10,  weight: 80,  color: '#8d6e63' },
            { id: '3', name: '🍩', value: 20,  weight: 60,  color: '#ff69b4' },
            { id: '4', name: '🎂', value: 30,  weight: 50,  color: '#ffc107' },
            { id: '5', name: '🍦', value: 50,  weight: 30,  color: '#81c784' },
            { id: '6', name: '🍭', value: 100, weight: 20,  color: '#e91e63' },
            { id: 'W', name: '🍰', value: 200, weight: 15,  color: '#f06292', isWild: true },
            { id: 'S', name: '🎉', value: 0,   weight: 10,  color: '#ff9800', isScatter: true }
        ]
    },

    // 💎 7. PRECIOUS GEMS
    'gems': {
        bgMusic: '../music/default.mp3',
        name: 'Precious Gems',
        paylineColor: '#8e44ad', // Purple
        symbols: [
            { id: '1', name: '❤️', value: 5,   weight: 100, color: '#f44336' },
            { id: '2', name: '💚', value: 10,  weight: 80,  color: '#4caf50' },
            { id: '3', name: '💙', value: 20,  weight: 60,  color: '#2196f3' },
            { id: '4', name: '💜', value: 30,  weight: 50,  color: '#9c27b0' },
            { id: '5', name: '💛', value: 50,  weight: 30,  color: '#ffc107' },
            { id: '6', name: '👑', value: 100, weight: 20,  color: '#ffd700' },
            { id: 'W', name: '✨', value: 200, weight: 15,  color: '#ffffff', isWild: true },
            { id: 'S', name: '💍', value: 0,   weight: 10,  color: '#ff69b4', isScatter: true }
        ]
    },

    // ♠️ 8. CARD ROYALE
    'cards': {
        bgMusic: '../music/casino.mp3',
        name: 'Card Royale',
        paylineColor: '#c0392b', // Dark Red
        symbols: [
            { id: '1', name: '♣️', value: 5,   weight: 100, color: '#2c3e50' },
            { id: '2', name: '♦️', value: 10,  weight: 80,  color: '#e74c3c' },
            { id: '3', name: '♥️', value: 20,  weight: 60,  color: '#e74c3c' },
            { id: '4', name: '♠️', value: 30,  weight: 50,  color: '#2c3e50' },
            { id: '5', name: '👸', value: 50,  weight: 30,  color: '#8e44ad' },
            { id: '6', name: '🤴', value: 100, weight: 20,  color: '#f1c40f' },
            { id: 'W', name: '🃏', value: 200, weight: 15,  color: '#3498db', isWild: true },
            { id: 'S', name: '🎴', value: 0,   weight: 10,  color: '#e67e22', isScatter: true }
        ]
    },

    // ♛ 9. CHESS MASTERS
    'chess': {
        bgMusic: '../music/default.mp3',
        name: 'Chess Masters',
        paylineColor: '#95a5a6', // Silver
        symbols: [
            { id: '1', name: '♟️', value: 5,   weight: 100, color: '#7f8c8d' },
            { id: '2', name: '♞', value: 10,  weight: 80,  color: '#95a5a6' },
            { id: '3', name: '♝', value: 20,  weight: 60,  color: '#bdc3c7' },
            { id: '4', name: '♜', value: 30,  weight: 50,  color: '#34495e' },
            { id: '5', name: '♛', value: 50,  weight: 30,  color: '#9b59b6' },
            { id: '6', name: '♚', value: 100, weight: 20,  color: '#f1c40f' },
            { id: 'W', name: '🏆', value: 200, weight: 15,  color: '#d4af37', isWild: true },
            { id: 'S', name: '⚔️', value: 0,   weight: 10,  color: '#c0392b', isScatter: true }
        ]
    },

    // 👻 10. MONSTER MAYHEM
    'monsters': {
        bgMusic: '../music/default.mp3',
        name: 'Monster Mayhem',
        paylineColor: '#2ecc71', // Slime Green
        symbols: [
            { id: '1', name: '👻', value: 5,   weight: 100, color: '#ecf0f1' },
            { id: '2', name: '👾', value: 10,  weight: 80,  color: '#9b59b6' },
            { id: '3', name: '👺', value: 20,  weight: 60,  color: '#e74c3c' },
            { id: '4', name: '👹', value: 30,  weight: 50,  color: '#c0392b' },
            { id: '5', name: '🧟', value: 50,  weight: 30,  color: '#27ae60' },
            { id: '6', name: '🧛', value: 100, weight: 20,  color: '#8e44ad' },
            { id: 'W', name: '🔮', value: 200, weight: 15,  color: '#9b59b6', isWild: true },
            { id: 'S', name: '⚡', value: 0,   weight: 10,  color: '#f39c12', isScatter: true }
        ]
    },

    // 🐺 11. WOLF PACK
    'wolves': {
        bgMusic: '../music/default.mp3',
        name: 'Wolf Pack',
        paylineColor: '#3498db', // Moon Blue
        symbols: [
            { id: '1', name: '🐾', value: 5,   weight: 100, color: '#95a5a6' },
            { id: '2', name: '🌙', value: 10,  weight: 80,  color: '#f1c40f' },
            { id: '3', name: '🌲', value: 20,  weight: 60,  color: '#27ae60' },
            { id: '4', name: '🐺', value: 30,  weight: 50,  color: '#7f8c8d' },
            { id: '5', name: '🏹', value: 50,  weight: 30,  color: '#c0392b' },
            { id: '6', name: '🌕', value: 100, weight: 20,  color: '#f39c12' },
            { id: 'W', name: '🔥', value: 200, weight: 15,  color: '#e74c3c', isWild: true },
            { id: 'S', name: '🌟', value: 0,   weight: 10,  color: '#f1c40f', isScatter: true }
        ]
    },

    // 🏺 12. ANCIENT EGYPT
    'egypt': {
        bgMusic: '../music/default.mp3',
        name: 'Ancient Egypt',
        paylineColor: '#f1c40f', // Sand Gold
        symbols: [
            { id: '1', name: '☥', value: 5,   weight: 100, color: '#f39c12' },
            { id: '2', name: '👁️', value: 10,  weight: 80,  color: '#3498db' },
            { id: '3', name: '😺', value: 20,  weight: 60,  color: '#f1c40f' },
            { id: '4', name: '🪲', value: 30,  weight: 50,  color: '#27ae60' },
            { id: '5', name: '🧟', value: 50,  weight: 30,  color: '#ecf0f1' },
            { id: '6', name: '🦁', value: 100, weight: 20,  color: '#d35400' },
            { id: 'W', name: '🧞', value: 200, weight: 15,  color: '#3498db', isWild: true },
            { id: 'S', name: '📜', value: 0,   weight: 10,  color: '#7f8c8d', isScatter: true }
        ]
    },

    // 🎸 13. MUSIC BEATS
    'music': {
        bgMusic: '../music/music.mp3',
        name: 'Music Beats',
        paylineColor: '#e91e63', // Neon Pink
        symbols: [
            { id: '1', name: '🎵', value: 5,   weight: 100, color: '#3498db' },
            { id: '2', name: '🎼', value: 10,  weight: 80,  color: '#9b59b6' },
            { id: '3', name: '🎸', value: 20,  weight: 60,  color: '#e74c3c' },
            { id: '4', name: '🎹', value: 30,  weight: 50,  color: '#2c3e50' },
            { id: '5', name: '🎤', value: 50,  weight: 30,  color: '#d35400' },
            { id: '6', name: '🎧', value: 100, weight: 20,  color: '#2980b9' },
            { id: 'W', name: '🔊', value: 200, weight: 15,  color: '#16a085', isWild: true },
            { id: 'S', name: '💿', value: 0,   weight: 10,  color: '#7f8c8d', isScatter: true }
        ]
    },

    // 🏆 14. SPORTS ARENA
    'sports': {
        bgMusic: '../music/default.mp3',
        name: 'Sports Arena',
        paylineColor: '#2ecc71', // Field Green
        symbols: [
            { id: '1', name: '⚽', value: 5,   weight: 100, color: '#ecf0f1' },
            { id: '2', name: '🏀', value: 10,  weight: 80,  color: '#e67e22' },
            { id: '3', name: '🏈', value: 20,  weight: 60,  color: '#795548' },
            { id: '4', name: '🎾', value: 30,  weight: 50,  color: '#cddc39' },
            { id: '5', name: '⚾', value: 50,  weight: 30,  color: '#bdc3c7' },
            { id: '6', name: '🏆', value: 100, weight: 20,  color: '#f1c40f' },
            { id: 'W', name: '🏅', value: 200, weight: 15,  color: '#ffd700', isWild: true },
            { id: 'S', name: '🎯', value: 0,   weight: 10,  color: '#e74c3c', isScatter: true }
        ]
    },

    // 🤖 15. TECH GADGETS
    'tech': {
        bgMusic: '../music/default.mp3',
        name: 'Tech Gadgets',
        paylineColor: '#00cec9', // Electric Blue
        symbols: [
            { id: '1', name: '📱', value: 5,   weight: 100, color: '#95a5a6' },
            { id: '2', name: '💻', value: 10,  weight: 80,  color: '#3498db' },
            { id: '3', name: '📷', value: 20,  weight: 60,  color: '#2c3e50' },
            { id: '4', name: '🎮', value: 30,  weight: 50,  color: '#9b59b6' },
            { id: '5', name: '📺', value: 50,  weight: 30,  color: '#34495e' },
            { id: '6', name: '🤖', value: 100, weight: 20,  color: '#1abc9c' },
            { id: 'W', name: '⚡', value: 200, weight: 15,  color: '#f1c40f', isWild: true },
            { id: 'S', name: '🔌', value: 0,   weight: 10,  color: '#2ecc71', isScatter: true }
        ]
    },

    // ⛺ 16. WILDERNESS CAMP
    'camping': {
        bgMusic: '../music/default.mp3',
        name: 'Wilderness Camp',
        paylineColor: '#27ae60', // Forest Green
        symbols: [
            { id: '1', name: '⛺', value: 5,   weight: 100, color: '#e67e22' },
            { id: '2', name: '🌲', value: 10,  weight: 80,  color: '#27ae60' },
            { id: '3', name: '⛰️', value: 20,  weight: 60,  color: '#7f8c8d' },
            { id: '4', name: '🔥', value: 30,  weight: 50,  color: '#c0392b' },
            { id: '5', name: '🐟', value: 50,  weight: 30,  color: '#3498db' },
            { id: '6', name: '🎒', value: 100, weight: 20,  color: '#d35400' },
            { id: 'W', name: '🧭', value: 200, weight: 15,  color: '#f1c40f', isWild: true },
            { id: 'S', name: '🌟', value: 0,   weight: 10,  color: '#f1c40f', isScatter: true }
        ]
    },

    // ♈ 17. ASTROLOGY SIGNS
    'astrology': {
        bgMusic: '../music/default.mp3',
        name: 'Astrology Signs',
        paylineColor: '#9b59b6', // Mystic Purple
        symbols: [
            { id: '1', name: '♈', value: 5,   weight: 100, color: '#ff5722' },
            { id: '2', name: '♉', value: 10,  weight: 80,  color: '#8bc34a' },
            { id: '3', name: '♊', value: 20,  weight: 60,  color: '#ffeb3b' },
            { id: '4', name: '♋', value: 30,  weight: 50,  color: '#03a9f4' },
            { id: '5', name: '♌', value: 50,  weight: 30,  color: '#ff9800' },
            { id: '6', name: '♍', value: 100, weight: 20,  color: '#9c27b0' },
            { id: 'W', name: '✨', value: 200, weight: 15,  color: '#e91e63', isWild: true },
            { id: 'S', name: '🔮', value: 0,   weight: 10,  color: '#9c27b0', isScatter: true }
        ]
    },

    // 🌧️ 18. WEATHER FORECAST
    'weather': {
        bgMusic: '../music/default.mp3',
        name: 'Weather Forecast',
        paylineColor: '#3498db', // Sky Blue
        symbols: [
            { id: '1', name: '☀️', value: 5,   weight: 100, color: '#ffeb3b' },
            { id: '2', name: '☁️', value: 10,  weight: 80,  color: '#b0bec5' },
            { id: '3', name: '🌧️', value: 20,  weight: 60,  color: '#2196f3' },
            { id: '4', name: '⚡', value: 30,  weight: 50,  color: '#ffc107' },
            { id: '5', name: '❄️', value: 50,  weight: 30,  color: '#e1f5fe' },
            { id: '6', name: '🌈', value: 100, weight: 20,  color: '#9c27b0' },
            { id: 'W', name: '🌞', value: 200, weight: 15,  color: '#ff9800', isWild: true },
            { id: 'S', name: '🌍', value: 0,   weight: 10,  color: '#4caf50', isScatter: true }
        ]
    },

    // 🪐 19. SOLAR SYSTEM
    'planets': {
        bgMusic: '../music/space.mp3',
        name: 'Solar System',
        paylineColor: '#8e44ad', // Deep Space Purple
        symbols: [
            { id: '1', name: '☿', value: 5,   weight: 100, color: '#9e9e9e' },
            { id: '2', name: '♀', value: 10,  weight: 80,  color: '#ffeb3b' },
            { id: '3', name: '🌍', value: 20,  weight: 60,  color: '#2196f3' },
            { id: '4', name: '♂', value: 30,  weight: 50,  color: '#f44336' },
            { id: '5', name: '♃', value: 50,  weight: 30,  color: '#ff9800' },
            { id: '6', name: '♄', value: 100, weight: 20,  color: '#ffd54f' },
            { id: 'W', name: '☀️', value: 200, weight: 15,  color: '#ffeb3b', isWild: true },
            { id: 'S', name: '⭐', value: 0,   weight: 10,  color: '#e1f5fe', isScatter: true }
        ]
    },

    // 😊 20. EMOJI FACES
    'emoticons': {
        bgMusic: '../music/default.mp3',
        name: 'Emoji Faces',
        paylineColor: '#f1c40f', // Smiley Yellow
        symbols: [
            { id: '1', name: '😊', value: 5,   weight: 100, color: '#ffeb3b' },
            { id: '2', name: '😂', value: 10,  weight: 80,  color: '#2196f3' },
            { id: '3', name: '😉', value: 20,  weight: 60,  color: '#ff9800' },
            { id: '4', name: '😍', value: 30,  weight: 50,  color: '#f44336' },
            { id: '5', name: '😎', value: 50,  weight: 30,  color: '#009688' },
            { id: '6', name: '😮', value: 100, weight: 20,  color: '#9c27b0' },
            { id: 'W', name: '🥳', value: 200, weight: 15,  color: '#e91e63', isWild: true },
            { id: 'S', name: '🎭', value: 0,   weight: 10,  color: '#3f51b5', isScatter: true }
        ]
    }
};