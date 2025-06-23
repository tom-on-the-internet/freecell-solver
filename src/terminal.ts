import { type Card, rankToString, suitColor } from "./deck"
import type { FreecellBoard } from "./freecell"

function renderCard(card: Card | undefined | null): string {
    if (!card) {
        return "  "
    }

    let color = suitColor(card.suit)
    let ansiColor = color === "red" ? "\x1b[31m" : "\x1b[33m"

    return `${ansiColor}${rankToString(card.rank)}${card.suit}\x1b[0m`
}

/**
 * Renders the Freecell board in a human-readable format.
 */
function renderFreecellBoard(board: FreecellBoard, solved: boolean): string {
    let output =
        "𝐅𝐫𝐞𝐞𝐜𝐞𝐥𝐥 𝙎𝙤𝙡𝙫𝙚𝙧   " + (solved ? "Solved!" : "Solving...") + " \n\n"

    board.freeCells.forEach((cell) => {
        output += `|${renderCard(cell)}| `
    })

    output += "   "

    board.foundations.forEach((foundation) => {
        if (foundation.length > 0) {
            let topCard = foundation.at(-1)!
            output += `|${renderCard(topCard)}| `
        }
    })

    output += "\n\n"

    for (
        let row = 0;
        row < Math.max(...board.tableau.map((cascade) => cascade!.length));
        row++
    ) {
        output += " "
        for (let col = 0; col < board.tableau.length; col++) {
            let card = board.tableau[col]![row]

            let cardText = `|${renderCard(card)}| `

            output += cardText
        }
        output += "\n"
    }

    return output
}

export { renderFreecellBoard }
