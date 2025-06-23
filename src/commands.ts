import { shuffleDeck, createDeck, type Deck } from "./deck"
import { createFreecellBoard } from "./freecell"
import { solve } from "./solve"
import { loadDeck, storeDeck } from "./storage"
import { renderFreecellBoard } from "./terminal"

/**
 *  Attempts to solve games that were previously attempted but not solved.
 *  This is a way of seeing if an improved heuristic or algorithm can solve previously unsolved games.
 */
async function solveUnsolved() {
    let results = await Bun.file("results.json").json()

    let games = results.filter((game: any) => !game.moves)

    console.log("Found", games.length, "unsolved games out of", results.length)
    // wait for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000))

    for (let game of games) {
        let freecellBoard = createFreecellBoard(game.deck)
        let result = solve(freecellBoard)
        if (!result) {
            console.log("No solution found on game", game.game)
            return false
        }
        console.log("Solution found:")

        await storeDeck(game.deck, result.path.length, game.game)
    }
    return true
}

/**
 * Shows statistics about the solved games.
 */
async function stats() {
    let results = await Bun.file("results.json").json()

    let unsolvedGames = results.filter((game: any) => !game.moves)
    let leastMoves = results.reduce((min: number, game: any) => {
        if (game.moves && game.moves < min) {
            return game.moves
        }
        return min
    }, Infinity)
    let mostMoves = results.reduce((max: number, game: any) => {
        if (game.moves && game.moves > max) {
            return game.moves
        }
        return max
    }, 0)

    console.log("Total games:", results.length)
    console.log("Unsolved games:", unsolvedGames.length)
    console.log("Least moves:", leastMoves)
    console.log("Most moves:", mostMoves)
}

/**
 * Solves a specified number of new games, storing the results in the storage.
 */
async function solveNewGames(count: number) {
    let solved = 0

    for (let i = 0; i < count; i++) {
        let deck = shuffleDeck(createDeck())
        let gameId = await storeDeck(deck)

        let freecellBoard = createFreecellBoard(deck)

        let result = solve(freecellBoard)
        if (!result) {
            return false
        }

        await storeDeck(deck, result.path.length, gameId)
        solved++
    }
    console.log(`Solved ${solved} new games.`)
    return true
}

/**
 * Solves a single game, either by loading an existing game by ID or creating a new game.
 */
async function solveSingleGame(gameId: number | undefined = undefined) {
    let deck: Deck

    if (gameId) {
        deck = await loadDeck(gameId)
    } else {
        deck = shuffleDeck(createDeck())
        gameId = await storeDeck(deck)
    }

    let freecellBoard = createFreecellBoard(deck)

    let result = solve(freecellBoard)
    if (!result) {
        console.log("No solution found.")
        return false
    }

    await storeDeck(deck, result.path.length, gameId)

    console.log("Solution found:")
    let solution = result.path

    for (let i = 0; i < solution.length; i++) {
        console.clear()
        console.log(renderFreecellBoard(solution[i]!, true))
        console.log("Game ID:", gameId)
        console.log("move:", i + 1, "/", solution.length)
        console.log("visited:", result.visitedStates, "states")
        console.log("queue:", result.priorityQueueSize, "states in queue")
        await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return true
}

export { solveUnsolved, stats, solveNewGames, solveSingleGame }
