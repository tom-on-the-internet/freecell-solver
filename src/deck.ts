type Suit = "H" | "D" | "C" | "S"
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13

type Card = {
    suit: Suit
    rank: Rank
}

type Deck = Card[]

function createDeck(): Deck {
    let suits: Suit[] = ["H", "D", "C", "S"]
    let ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

    let deck: Deck = []

    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank })
        }
    }

    return deck
}

function shuffleDeck(deck: Deck): Deck {
    let shuffledDeck = [...deck]
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        ;[shuffledDeck[i], shuffledDeck[j]] = [
            shuffledDeck[j]!,
            shuffledDeck[i]!,
        ]
    }
    return shuffledDeck
}

function dealCard(deck: Deck): Card | null {
    if (deck.length === 0) {
        return null // No cards left to deal
    }
    return deck.pop()! // Remove and return the last card
}
function rankToString(rank: Rank): string {
    switch (rank) {
        case 1:
            return "A"
        case 10:
            return "T"
        case 11:
            return "J"
        case 12:
            return "Q"
        case 13:
            return "K"
        default:
            return rank.toString()
    }
}

function suitColor(suit: Suit): "black" | "red" {
    switch (suit) {
        case "H":
        case "D":
            return "red"
    }

    return "black"
}

export type { Card, Deck, Rank, Suit }
export { createDeck, dealCard, rankToString, shuffleDeck, suitColor }
