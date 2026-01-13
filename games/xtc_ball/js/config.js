/**
 * MAGIC XTC BALL CONFIGURATION
 * =====================================================================================
 * CHANGELOG
 * -------------------------------------------------------------------------------------
 * v1.4 - FLUID COLOR UPDATE (Current)
 * - Data: Added 'liquidColor' property to allow customizing the internal fluid color.
 * * v1.3 - XTC LOGIC UPDATE
 * - Logic: Implemented specific answer sets for Balls 1-5.
 * - Creative: Added unique arcade themes for Balls 6, 7, and 9-15.
 * * v1.2 - POOL HALL UPDATE
 * - Data: Expanded to IDs 1-15 with accurate pool colors.
 * * v1.1 - CUSTOMIZATION SUPPORT
 * - Data: Added 'defaultAnswers' for new balls.
 * - Structure: Converted to JS Object to allow comments.
 * * v1.0 - INITIAL RELEASE
 * - Structure: Defined basic 'balls' object.
 */

const ORACLE_CONFIG = {
    // Default settings for new custom balls
    defaultAnswers: [
        { text: "YES", weight: 1 },
        { text: "NO", weight: 1 },
        { text: "MAYBE", weight: 1 }
    ],

    // The Standard 20 Answers (Used by Ball 8)
    standardAnswers: [
        // Positive (10)
        { text: "It is\ncertain", weight: 1 },
        { text: "It is\ndecidedly\nso", weight: 1 },
        { text: "Without\na doubt", weight: 1 },
        { text: "Yes\ndefinitely", weight: 1 },
        { text: "You may\nrely on it", weight: 1 },
        { text: "As I\nsee it,\nyes", weight: 1 },
        { text: "Most\nlikely", weight: 1 },
        { text: "Outlook\ngood", weight: 1 },
        { text: "Yes", weight: 1 },
        { text: "Signs\npoint to\nyes", weight: 1 },
        // Neutral (5)
        { text: "Reply hazy,\ntry again", weight: 1 },
        { text: "Ask again\nlater", weight: 1 },
        { text: "Better not\ntell you\nnow", weight: 1 },
        { text: "Cannot\npredict\nnow", weight: 1 },
        { text: "Concentrate\nand ask\nagain", weight: 1 },
        // Negative (5)
        { text: "Don't\ncount\non it", weight: 1 },
        { text: "My reply\nis no", weight: 1 },
        { text: "My sources\nsay no", weight: 1 },
        { text: "Outlook\nnot so\ngood", weight: 1 },
        { text: "Very\ndoubtful", weight: 1 }
    ],

    balls: {
        // --- LOGIC BALLS (1-5) ---
        "1": { 
            id: "1", name: "1 Ball (The Optimist)", label: "1", 
            color: "#FFD700", liquidColor: "#100060",
            answers: [{ text: "YES", weight: 1 }] 
        },
        "2": { 
            id: "2", name: "2 Ball (The Coin Flip)", label: "2", 
            color: "#0000FF", liquidColor: "#100060",
            answers: [
                { text: "YES", weight: 1 },
                { text: "NO", weight: 1 }
            ] 
        },
        "3": { 
            id: "3", name: "3 Ball (The Balanced)", label: "3", 
            color: "#CC0000", liquidColor: "#100060",
            answers: [
                { text: "YES", weight: 1 },
                { text: "NO", weight: 1 },
                { text: "MAYBE", weight: 1 }
            ] 
        },
        "4": { 
            id: "4", name: "4 Ball (The Nuanced)", label: "4", 
            color: "#800080", liquidColor: "#100060",
            answers: [
                { text: "YES", weight: 1 },
                { text: "NO", weight: 1 },
                { text: "MAYBE\nYES", weight: 1 },
                { text: "MAYBE\nNO", weight: 1 }
            ] 
        },
        "5": { 
            id: "5", name: "5 Ball (The Crowd)", label: "5", 
            color: "#FFA500", liquidColor: "#100060",
            answers: [
                { text: "YES", weight: 1 },
                { text: "YES", weight: 1 },
                { text: "NO", weight: 1 },
                { text: "NO", weight: 1 },
                { text: "MAYBE", weight: 1 }
            ] 
        },

        // --- CREATIVE SOLIDS (6-7) ---
        "6": { 
            id: "6", name: "6 Ball (Traffic Light)", label: "6", 
            color: "#008000", liquidColor: "#000000", /* Black fluid for contrast */
            answers: [
                { text: "GREEN\nLIGHT", weight: 1 },
                { text: "GO\nFOR IT", weight: 1 },
                { text: "CAUTION", weight: 1 },
                { text: "FULL\nSTOP", weight: 1 }
            ] 
        },
        "7": { 
            id: "7", name: "7 Ball (Vegas)", label: "7", 
            color: "#800000", liquidColor: "#003300", /* Felt Green fluid */
            answers: [
                { text: "JACK\nPOT", weight: 0.2 },
                { text: "LUCKY\n7", weight: 1 },
                { text: "BUST", weight: 1 },
                { text: "BET\nIT ALL", weight: 1 },
                { text: "FOLD", weight: 1 }
            ] 
        },
        
        // --- THE CLASSIC (8) ---
        "8": {
            id: "8",
            name: "Magic 8 Ball (Classic)",
            label: "8",
            color: "#1a1a1a",
            liquidColor: "#100060", // Classic Blue
            answers: [] // Fills with standardAnswers automatically
        },

        // --- CREATIVE STRIPES (9-15) ---
        "9": { 
            id: "9", name: "9 Ball (Feline)", label: "9", 
            color: "#FFD700", liquidColor: "#100060",
            answers: [
                { text: "9\nLIVES", weight: 1 },
                { text: "NOT\nYET", weight: 1 },
                { text: "LAND ON\nFEET", weight: 1 },
                { text: "HISS", weight: 1 }
            ] 
        },
        "10": { 
            id: "10", name: "10 Ball (Rating)", label: "10", 
            color: "#0000FF", liquidColor: "#100060",
            answers: [
                { text: "PERFECT\n10", weight: 1 },
                { text: "MID", weight: 1 },
                { text: "ZERO", weight: 1 },
                { text: "TOP\nTIER", weight: 1 }
            ] 
        },
        "11": { 
            id: "11", name: "11 Ball (Wishes)", label: "11", 
            color: "#CC0000", liquidColor: "#100060",
            answers: [
                { text: "WISH\nGRANTED", weight: 1 },
                { text: "DREAM\nBIG", weight: 1 },
                { text: "MAKE A\nWISH", weight: 1 }
            ] 
        },
        "12": { 
            id: "12", name: "12 Ball (Time)", label: "12", 
            color: "#800080", liquidColor: "#100060",
            answers: [
                { text: "MID\nNIGHT", weight: 1 },
                { text: "HIGH\nNOON", weight: 1 },
                { text: "TOO\nLATE", weight: 1 },
                { text: "TOO\nEARLY", weight: 1 }
            ] 
        },
        "13": { 
            id: "13", name: "13 Ball (Spooky)", label: "13", 
            color: "#FFA500", liquidColor: "#000000", /* Dark fluid */
            answers: [
                { text: "UNLUCKY", weight: 1 },
                { text: "DOOMED", weight: 1 },
                { text: "CURSED", weight: 1 },
                { text: "SAFE", weight: 1 }
            ] 
        },
        "14": { 
            id: "14", name: "14 Ball (Nature)", label: "14", 
            color: "#008000", liquidColor: "#004400", /* Green fluid */
            answers: [
                { text: "IT IS\nNATURAL", weight: 1 },
                { text: "GROWTH", weight: 1 },
                { text: "WITHER", weight: 1 },
                { text: "BLOOM", weight: 1 }
            ] 
        },
        "15": { 
            id: "15", name: "15 Ball (Endgame)", label: "15", 
            color: "#800000", liquidColor: "#100060",
            answers: [
                { text: "GAME\nOVER", weight: 1 },
                { text: "YOU\nWIN", weight: 1 },
                { text: "RE\nRACK", weight: 1 },
                { text: "SCRATCH", weight: 1 }
            ] 
        },

        // --- SPECIALS ---
        "love": {
            id: "love", name: "Cupid's Ball", label: "♥", 
            color: "#ff69b4", liquidColor: "#800000", /* Red fluid */
            answers: [
                { text: "TRUE\nLOVE", weight: 1 },
                { text: "JUST\nFRIENDS", weight: 1 },
                { text: "ASK\nHER", weight: 1 },
                { text: "NOPE", weight: 1 }
            ]
        }
    }
};

// Helper to fill Ball 8
if (ORACLE_CONFIG.balls["8"].answers.length === 0) {
    ORACLE_CONFIG.balls["8"].answers = ORACLE_CONFIG.standardAnswers;
}