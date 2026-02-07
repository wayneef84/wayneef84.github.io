/**
 * CustomSprunkiManager - LocalStorage persistence for custom characters (ES5)
 */
var CustomSprunkiManager = (function () {
    var STORAGE_KEY = 's4k_custom_chars';

    function getCustomCharacters() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load custom characters', e);
            return [];
        }
    }

    function saveCharacter(charData) {
        var chars = getCustomCharacters();
        var existingIndex = -1;
        for (var i = 0; i < chars.length; i++) {
            if (chars[i].id === charData.id) { existingIndex = i; break; }
        }

        if (existingIndex >= 0) {
            chars[existingIndex] = charData;
        } else {
            chars.push(charData);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(chars));
        return true;
    }

    function deleteCharacter(id) {
        var chars = getCustomCharacters();
        var filtered = [];
        for (var i = 0; i < chars.length; i++) {
            if (chars[i].id !== id) filtered.push(chars[i]);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    function importCharacter(jsonString) {
        var data = JSON.parse(jsonString);
        if (!data.name || !data.type || !data.img || !data.audio) {
            throw new Error('Invalid Sprunki Data: Missing required fields');
        }

        data.id = 'custom_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        data.pack_id = 'custom';
        data.custom = true;

        saveCharacter(data);
        return data;
    }

    return {
        getCustomCharacters: getCustomCharacters,
        saveCharacter: saveCharacter,
        deleteCharacter: deleteCharacter,
        importCharacter: importCharacter
    };
})();

window.CustomSprunkiManager = CustomSprunkiManager;
