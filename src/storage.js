import { readFile, writeFile } from "fs/promises"

/**
 * Stores a deck in the results.json file.
 * If a gameId is provided, it updates the existing game.
 * If not, it creates a new game entry.
 */
async function storeDeck(deck, moves = null, gameId = null) {
    let results = JSON.parse(await readFile("results.json", "utf8"))

    // If there is a gameId, we will update the existing game.
    if (gameId !== null) {
        let result = results.find((game) => game.game === gameId)
        if (result) {
            result.moves = moves
            result.deck = deck
            await writeFile("results.json", JSON.stringify(results, null, 4))
            return gameId
        }
    }

    let gameCount = results.length + 1
    results.push({
        game: gameCount,
        moves: moves,
        deck: deck,
    })

    await writeFile("results.json", JSON.stringify(results, null, 4))
    return gameCount
}

/**
 * Loads a deck from the results.json file based on the gameId.
 */
async function loadDeck(gameId) {
    let results = JSON.parse(await readFile("results.json", "utf8"))

    let result = results.find((game) => game.game === gameId)
    return result.deck
}

export { storeDeck, loadDeck }

