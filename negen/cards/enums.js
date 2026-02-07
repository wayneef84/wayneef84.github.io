// negen/cards/enums.js

export const Suits = Object.freeze({
    HEARTS: 'hearts',
    DIAMONDS: 'diamonds',
    CLUBS: 'clubs',
    SPADES: 'spades'
});

export const Ranks = Object.freeze({
    TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6',
    SEVEN: '7', EIGHT: '8', NINE: '9', TEN: '10',
    JACK: 'J', QUEEN: 'Q', KING: 'K', ACE: 'A'
});

export const RankValues = Object.freeze({
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
    '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
});

export const Colors = Object.freeze({
    RED: 'red',
    BLACK: 'black'
});
