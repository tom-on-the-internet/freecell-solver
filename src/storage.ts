import type { Deck } from "./deck"

/**
 * Stores a deck in the results.json file.
 * If a gameId is provided, it updates the existing game.
 * If not, it creates a new game entry.
 */
async function storeDeck(
    deck: Deck,
    moves: number | null = null,
    gameId: number | null = null
): Promise<number> {
    let results = await Bun.file("results.json").json()

    // If there is a gameId, we will update the existing game.
    if (gameId !== null) {
        let result = results.find((game: any) => game.game === gameId)
        if (result) {
            result.moves = moves
            result.deck = deck
            await Bun.write("results.json", JSON.stringify(results, null, 4))
            return gameId
        }
    }

    let gameCount = results.length + 1
    results.push({
        game: gameCount,
        moves: moves,
        deck: deck,
    })

    await Bun.write("results.json", JSON.stringify(results, null, 4))
    return gameCount
}

/**
 * Loads a deck from the results.json file based on the gameId.
 */
async function loadDeck(gameId: number): Promise<Deck> {
    let results = await Bun.file("results.json").json()

    let result = results.find((game: any) => game.game === gameId)
    return result.deck
}

export { storeDeck, loadDeck }
