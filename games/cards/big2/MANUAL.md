# Big 2 Manual

## Goal
Be first to play all your cards. Cards rank 3 (low) up to 2 (high). Suits break ties, lowest to highest: diamonds, clubs, hearts, spades (the Singapore ruleset reverses this: spades lowest, diamonds highest).

## Setup screen
1. Pick a ruleset.
2. Pick Players: 2, 3 or 4.
3. Pick Who starts: Lowest card or Last winner.
4. A short sentence under the buttons explains the deal in use. Tap Deal Cards.

## The deal
The start card is the 3 of the lowest suit of the ruleset: the 3 of diamonds in Hong Kong, Taiwanese and Poker Hands, the 3 of spades in Singapore. The second-lowest suit gives the fallback card: the 3 of clubs, or the 3 of hearts in Singapore.

| Players | Deal | Who starts (Lowest card) |
|---|---|---|
| 4 | 13 cards each | The holder of the start card |
| 3 | 17 cards each, the last card turned face up | The holder of the start card picks up the face-up card (18 cards) and starts |
| 2 | 17 cards each, the other 18 form a spare pile, one is turned face up | The holder of the start card picks up the face-up card and starts |

Special cases when the face-up card matters:
- 3 or 2 players, the face-up card is the start card: the holder of the fallback card picks it up and starts. That card must be in the opening play.
- 2 players, the start card is in the spare pile: nobody picks up, the face-up card is discarded with the spare pile, and the holder of the lowest dealt card (rank, then suit order) starts.
- 2 players, the face-up card is the start card and the fallback card is also in the spare pile: nobody picks up, the lowest dealt card starts.

A deal panel shows the face-up card, the spare pile and a sentence saying who picked up. Tap Got it to close it (it also closes when you play).

## Opening play
If the ruleset flag `firstPlayMustIncludeStartCard` is on (it is on in every ruleset), the first play must include the start card, in any legal combination. With a pickup, the picked-up card counts: if you picked up the start card it must be in your opening play. If nobody held the start card, the lowest dealt card must be in the opening play.

## Last winner
With Who starts set to Last winner, the winner of the previous game starts and no card is required in the opening play. The first game, or a first game at a seat count where the saved winner is not seated, uses the lowest card rule. In 3 and 2 player games the holder of the start card still picks up the face-up card, even if someone else starts.

## Scoring note
The triple penalty applies to a player who never played a card (17 or 18 cards in a 2 or 3 player game, 13 in a 4 player game). Double penalty at 10 or more cards is unchanged.
