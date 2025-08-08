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
    help,
} from "./commands.js"

const PARSE_CONFIG = {
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
            description: "Enable step-by-step game viewing",
        },
    },
    strict: true,
    allowPositionals: true,
}

const ERROR_MESSAGES = {
    new: "Error: --new requires a value (e.g. --new 5)",
    "game-id": "Error: --game-id requires a value (e.g. --game-id 123)",
}

function handleParseError(err) {
    if (err.code !== "ERR_PARSE_ARGS_INVALID_OPTION_VALUE") {
        throw err
    }

    for (const [option, message] of Object.entries(ERROR_MESSAGES)) {
        if (err.message.includes(`--${option}`)) {
            console.error(message)
            process.exit(1)
        }
    }

    throw err
}

function getArgs() {
    try {
        return parseArgs(PARSE_CONFIG)
    } catch (err) {
        handleParseError(err)
    }
}

const COMMANDS = {
    unsolved: {
        handler: solveUnsolved,
        exitOnSuccess: true,
    },
    stats: {
        handler: stats,
        exitOnSuccess: true,
    },
    help: {
        handler: help,
        exitOnSuccess: true,
    },
}

async function executeCommand(commandName) {
    const command = COMMANDS[commandName]
    if (!command) return false

    const result = await command.handler()
    if (command.exitOnSuccess) {
        process.exit(result ? 0 : 1)
    }
    return result
}

async function main() {
    const args = getArgs()

    for (const positional of args.positionals) {
        if (await executeCommand(positional)) return
    }

    if (args.values.new) {
        const result = await solveNewGames(parseInt(args.values.new))
        process.exit(result ? 0 : 1)
    }

    const gameId = args.values["game-id"]
        ? parseInt(args.values["game-id"])
        : undefined
    const step = args.values.step || false
    const result = await solveSingleGame(gameId, step)
    process.exit(result ? 0 : 1)
}

main()
