/**
 * C.o.D.E. - Cracking Engine Logic
 * ES5 Compatible
 */

(function(global) {
    'use strict';

    var CHARSETS = {
        'N': '0123456789'.split(''),
        'A': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
        '*': '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    };

    function CodeCracker() {
        this.target = '';
        this.currentGuess = '';
        this.attempts = 0;
        this.running = false;

        // Configuration
        this.config = {
            mode: 'numeric', // numeric, alpha, alphanumeric, custom
            length: 4,
            pattern: '', // Used if mode is custom
            strategy: 'sequential' // sequential, random, reverse
        };

        // Internal State for Sequential/Reverse
        this.slots = []; // Array of { chars: [], currentIdx: 0, isLiteral: bool }
    }

    CodeCracker.prototype.configure = function(cfg) {
        for (var key in cfg) {
            if (cfg.hasOwnProperty(key)) {
                this.config[key] = cfg[key];
            }
        }
        this._buildSlots();
        this.reset();
    };

    CodeCracker.prototype._buildSlots = function() {
        this.slots = [];
        var mode = this.config.mode;
        var len = parseInt(this.config.length, 10);
        var pattern = this.config.pattern;

        if (mode === 'custom') {
            // Regex Parser (Simple)
            var i = 0;
            while (i < pattern.length) {
                var char = pattern[i];
                var template = null;

                if (char === '[') {
                    // Character Set
                    var end = pattern.indexOf(']', i);
                    if (end === -1) {
                         template = { val: '[', isLiteral: true };
                         i++;
                    } else {
                        var content = pattern.substring(i + 1, end);
                        var set = this._parseCharSet(content);
                        template = { chars: set, idx: 0, isLiteral: false };
                        i = end + 1;
                    }
                } else if (char === '\\') {
                    // Escape sequence
                    var next = pattern[i + 1];
                    if (next === 'd') {
                        template = { chars: CHARSETS['N'], idx: 0, isLiteral: false };
                    } else if (next === 'w') {
                        template = { chars: CHARSETS['*'], idx: 0, isLiteral: false };
                    } else {
                        template = { val: next, isLiteral: true };
                    }
                    i += 2;
                } else if (char === '.') {
                     template = { chars: CHARSETS['*'], idx: 0, isLiteral: false };
                     i++;
                } else {
                    // Literal
                    template = { val: char, isLiteral: true };
                    i++;
                }

                // Check quantifier {n}
                var repeat = 1;
                if (i < pattern.length && pattern[i] === '{') {
                    var qEnd = pattern.indexOf('}', i);
                    if (qEnd !== -1) {
                        var qContent = pattern.substring(i + 1, qEnd);
                        var r = parseInt(qContent, 10);
                        if (!isNaN(r) && r > 0) repeat = r;
                        i = qEnd + 1;
                    }
                }

                // Push slots
                for (var k = 0; k < repeat; k++) {
                    if (template.isLiteral) {
                        this.slots.push({ val: template.val, isLiteral: true });
                    } else {
                        this.slots.push({ chars: template.chars, idx: 0, isLiteral: false });
                    }
                }
            }
        } else {
            // Standard modes
            var set = [];
            if (mode === 'numeric') set = CHARSETS['N'];
            else if (mode === 'alpha') set = CHARSETS['A'];
            else if (mode === 'alphanumeric') set = CHARSETS['*'];

            for (var j = 0; j < len; j++) {
                this.slots.push({
                    chars: set,
                    idx: 0,
                    isLiteral: false
                });
            }
        }
    };

    CodeCracker.prototype._parseCharSet = function(content) {
        var set = [];
        // Handle A-Z, 0-9 ranges
        for (var i = 0; i < content.length; i++) {
            if (i + 2 < content.length && content[i+1] === '-') {
                var start = content.charCodeAt(i);
                var end = content.charCodeAt(i+2);
                for (var c = start; c <= end; c++) {
                    set.push(String.fromCharCode(c));
                }
                i += 2;
            } else {
                set.push(content[i]);
            }
        }
        return set;
    };

    CodeCracker.prototype.reset = function() {
        this.attempts = 0;
        this.currentGuess = '';

        // Reset slot indices based on strategy
        if (this.config.strategy === 'reverse') {
            for (var i = 0; i < this.slots.length; i++) {
                if (!this.slots[i].isLiteral) {
                    this.slots[i].idx = this.slots[i].chars.length - 1;
                }
            }
        } else {
            for (var k = 0; k < this.slots.length; k++) {
                if (!this.slots[k].isLiteral) {
                    this.slots[k].idx = 0;
                }
            }
        }
    };

    CodeCracker.prototype.generateTarget = function() {
        var code = '';
        for (var i = 0; i < this.slots.length; i++) {
            var slot = this.slots[i];
            if (slot.isLiteral) {
                code += slot.val;
            } else {
                var rand = Math.floor(Math.random() * slot.chars.length);
                code += slot.chars[rand];
            }
        }
        this.target = code;
        return code;
    };

    CodeCracker.prototype.setTarget = function(code) {
        // Validate against current slots?
        // For now, just set it. We assume user input is valid or we simply try to crack it.
        // If the target doesn't match the slot capabilities, sequential might never find it.
        // We should warn or validate, but for this demo, we assume compliance.
        this.target = code.toUpperCase();
    };

    CodeCracker.prototype.checkMatch = function() {
        return this.currentGuess === this.target;
    };

    CodeCracker.prototype.nextGuess = function() {
        this.attempts++;
        var strategy = this.config.strategy;

        if (strategy === 'random') {
            this.currentGuess = this._getRandomGuess();
        } else if (strategy === 'sequential') {
            this.currentGuess = this._getSequentialGuess();
            this._incrementSlots();
        } else if (strategy === 'reverse') {
            this.currentGuess = this._getSequentialGuess(); // Same builder, different indices
            this._decrementSlots();
        }

        return this.currentGuess;
    };

    CodeCracker.prototype._getRandomGuess = function() {
        var str = '';
        for (var i = 0; i < this.slots.length; i++) {
            var slot = this.slots[i];
            if (slot.isLiteral) {
                str += slot.val;
            } else {
                var rand = Math.floor(Math.random() * slot.chars.length);
                str += slot.chars[rand];
            }
        }
        return str;
    };

    CodeCracker.prototype._getSequentialGuess = function() {
        var str = '';
        for (var i = 0; i < this.slots.length; i++) {
            var slot = this.slots[i];
            if (slot.isLiteral) {
                str += slot.val;
            } else {
                str += slot.chars[slot.idx];
            }
        }
        return str;
    };

    CodeCracker.prototype._incrementSlots = function() {
        // Increment from last non-literal slot
        for (var i = this.slots.length - 1; i >= 0; i--) {
            var slot = this.slots[i];
            if (slot.isLiteral) continue;

            slot.idx++;
            if (slot.idx >= slot.chars.length) {
                slot.idx = 0;
                // Continue loop to carry over
            } else {
                // No carry, done
                return;
            }
        }
        // If we get here, we rolled over completely (0000 -> 0000)
    };

    CodeCracker.prototype._decrementSlots = function() {
        // Decrement from last non-literal slot
        for (var i = this.slots.length - 1; i >= 0; i--) {
            var slot = this.slots[i];
            if (slot.isLiteral) continue;

            slot.idx--;
            if (slot.idx < 0) {
                slot.idx = slot.chars.length - 1;
                // Continue loop to carry over
            } else {
                // No carry, done
                return;
            }
        }
    };

    // Validation helper
    CodeCracker.prototype.isValidConfig = function(val) {
        if (!val) return false;
        // Check if val fits current slots structure
        if (val.length !== this.slots.length) return false;

        var valChars = val.toUpperCase().split('');
        for (var i = 0; i < this.slots.length; i++) {
            var slot = this.slots[i];
            var char = valChars[i];

            if (slot.isLiteral) {
                if (char !== slot.val) return false;
            } else {
                if (slot.chars.indexOf(char) === -1) return false;
            }
        }
        return true;
    };

    // Export
    global.CodeCracker = CodeCracker;

})(window);
