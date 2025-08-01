function createDeck() {
    let suits = ["H", "D", "C", "S"]
    let deck = []
    for (const suit of suits) {
        for (let rank = 1; rank <= 13; rank++) {
            deck.push({ suit, rank })
        }
    }
    return deck
}

function shuffleDeck(deck) {
    let shuffledDeck = [...deck]
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        ;[shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]]
    }
    return shuffledDeck
}

function rankToString(rank) {
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

function suitColor(suit) {
    return suit === "H" || suit === "D" ? "red" : "black"
}

export { createDeck, rankToString, shuffleDeck, suitColor }
