/**
 *    _____
 *   |A .  | _____
 *   | /.\ ||A ^  | _____
 *   |(_._)|| / \ ||A _  | _____
 *   |  |  || \ / || ( ) ||A_ _ |
 *   |____V||  .  ||(_'_)||( v )|
 *          |____V||  |  || \ / |
 *                 |____V||  .  |
 *                        |____V|
 *
 * Welcome to the Freecell Solver CLI.
 *
 * This is a simple command-line interface for solving Freecell games.
 * I built this as a fun project. I wondered how hard it would be to solve Freecell games.
 * It turns out it's not that hard.
 *
 * If you have any questions, reach out. tom@tomontheinternet.com
 *
 * - Tom
 */

import { parseArgs } from "util"

import {
    solveNewGames,
    solveSingleGame,
    solveUnsolved,
    stats,
} from "./commands.js"

function getArgs() {
    try {
        return parseArgs({
            options: {
                "game-id": {
                    type: "string",
                    description: "Load a specific game by ID",
                },
                new: {
                    type: "string",
                    description: "Solve # of new games",
                },
                step: {
                    type: "boolean",
                },
            },
            strict: true,
            allowPositionals: true,
        })
    } catch (err) {
        if (
            err.code === "ERR_PARSE_ARGS_INVALID_OPTION_VALUE" &&
            err.message.includes("--new")
        ) {
            console.error("Error: --new requires a value (e.g. --new 5)")
            process.exit(1)
        }
        if (
            err.code === "ERR_PARSE_ARGS_INVALID_OPTION_VALUE" &&
            err.message.includes("--game-id")
        ) {
            console.error(
                "Error: --game-id requires a value (e.g. --game-id 123)"
            )
            process.exit(1)
        }
        throw err // rethrow if it's a different error
    }
}

async function main() {
    let args = getArgs()

    // pass "unsolved" as a positional argument to solve all unsolved games
    if (args.positionals.includes("unsolved")) {
        let result = await solveUnsolved()
        process.exit(result ? 0 : 1)
    }

    // pass "stats" as a positional argument to get stats
    if (args.positionals.includes("stats")) {
        await stats()
        process.exit(0)
    }

    // pass "--new 10" to solve 10 new games
    if (args.values.new) {
        let result = await solveNewGames(parseInt(args.values.new))
        process.exit(result ? 0 : 1)
    }

    // pass "--game-id 123" to solve a specific game by ID (which is a game previously attempted)
    // if no game-id is provided a new game will be generated
    let gameId = args.values["game-id"]
        ? parseInt(args.values["game-id"])
        : undefined

    let step = args.values.step || false
    let result = await solveSingleGame(gameId, step)
    process.exit(result ? 0 : 1)
}

main()
