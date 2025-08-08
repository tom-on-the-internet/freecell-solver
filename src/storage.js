import { readFile, writeFile } from "fs/promises"

/**
 * Safely loads the results.json file, returning an empty array if the file doesn't exist or is empty.
 */
async function loadResults() {
    try {
        const content = await readFile("results.json", "utf8")
        if (!content.trim()) {
            return []
        }
        return JSON.parse(content)
    } catch (error) {
        if (error.code === "ENOENT") {
            return []
        }
        throw error
    }
}

/**
 * Stores a deck in the results.json file.
 * If a gameId is provided, it updates the existing game.
 * If not, it creates a new game entry.
 */
async function storeDeck(deck, moves = null, gameId = null) {
    let results = await loadResults()

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
    let results = await loadResults()

    let result = results.find((game) => game.game === gameId)
    return result.deck
}

export { storeDeck, loadDeck, loadResults }
