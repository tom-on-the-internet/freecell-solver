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
} from "./commands"

function getArgs() {
    return parseArgs({
        args: Bun.argv,
        options: {
            "game-id": {
                type: "string",
                description: "Load a specific game by ID",
            },
            new: {
                type: "string",
                short: "g",
                description: "Solve # of new games",
            },
        },
        strict: true,
        allowPositionals: true,
    })
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
        let result = await solveNewGames(parseInt(args.values.new as string))
        process.exit(result ? 0 : 1)
    }

    // pass "--game-id 123" to solve a specific game by ID (which is a game previously attempted)
    // if no game-id is provided a new game will be generated
    let gameId = args.values["game-id"]
        ? parseInt(args.values["game-id"] as string)
        : undefined

    let result = await solveSingleGame(gameId)
    process.exit(result ? 0 : 1)
}

main()
