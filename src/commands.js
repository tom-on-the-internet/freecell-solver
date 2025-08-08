import { shuffleDeck, createDeck } from "./deck.js"
import { createFreecellBoard } from "./freecell.js"
import { solve } from "./solve.js"
import { loadDeck, storeDeck, loadResults } from "./storage.js"
import { renderFreecellBoard } from "./terminal.js"
import readline from "readline"

/**
 *  Attempts to solve games that were previously attempted but not solved.
 *  This is a way of seeing if an improved heuristic or algorithm can solve previously unsolved games.
 */
async function solveUnsolved() {
    let results = await loadResults()

    let games = results.filter((game) => !game.moves)

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
    let results = await loadResults()

    let unsolvedGames = results.filter((game) => !game.moves)
    let leastMoves = results.reduce((min, game) => {
        if (game.moves && game.moves < min) {
            return game.moves
        }
        return min
    }, Infinity)
    let mostMoves = results.reduce((max, game) => {
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
async function solveNewGames(count) {
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
/**
 * Shows help information about available commands and options.
 */
function help() {
    console.log(`
    _____
   |A .  | _____
   | /.\ ||A ^  | _____
   |(_._)|| / \ ||A _  | _____
   |  |  || \ / || ( ) ||A_ _ |
   |____V||  .  ||(_'_)||( v )|
          |____V||  |  || \ / |
                 |____V||  .  |
                        |____V|

Freecell Solver CLI

COMMANDS:
  npm run new [count]     Solve new games (default: 1)
  npm run single          Solve a single new game
  npm run game [id]       Solve specific game by ID with step-by-step display
  npm run unsolved        Attempt to solve previously unsolved games
  npm run stats           Display solver statistics
  npm run help            Show this help message

OPTIONS:
  --new [count]           Solve specified number of new games
  --game-id [id]          Load and solve a specific game by ID
  --step                  Enable interactive step-by-step viewing

EXAMPLES:
  npm run new 5           Solve 5 new games
  npm run game 123        View game 123 step-by-step
  node src --new 10       Solve 10 new games directly
  node src --game-id 42 --step  View game 42 interactively

For more info: tom@tomontheinternet.com
`)
}

async function solveSingleGame(gameId = undefined, step = false) {
    let deck

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

    if (step) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        let currentStep = 0
        const totalSteps = solution.length

        function renderStep() {
            console.clear()
            console.log(renderFreecellBoard(solution[currentStep], true))
            console.log("Game ID:", gameId)
            console.log("move:", currentStep + 1, "/", totalSteps)
            console.log("visited:", result.visitedStates, "states")
            console.log("queue:", result.priorityQueueSize, "states in queue")
            console.log("\nUse ←/→ arrows to step, 'q' to quit.")
        }

        function onKeypress(str, key) {
            if (key.name === "right" && currentStep < totalSteps - 1) {
                currentStep++
                renderStep()
            } else if (key.name === "left" && currentStep > 0) {
                currentStep--
                renderStep()
            } else if (key.name === "q" || (key.ctrl && key.name === "c")) {
                rl.input.setRawMode(false)
                rl.close()
                process.exit(0)
            }
        }

        readline.emitKeypressEvents(process.stdin, rl)
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true)
        }
        process.stdin.on("keypress", onKeypress)
        renderStep()
        await new Promise(() => {}) // Keep process alive
    } else {
        for (let i = 0; i < solution.length; i++) {
            console.clear()
            console.log(renderFreecellBoard(solution[i], true))
            console.log("Game ID:", gameId)
            console.log("move:", i + 1, "/", solution.length)
            console.log("visited:", result.visitedStates, "states")
            console.log("queue:", result.priorityQueueSize, "states in queue")
            await new Promise((resolve) => setTimeout(resolve, 100))
        }
        return true
    }
}

export { solveUnsolved, stats, solveNewGames, solveSingleGame, help }
