import { rankToString, suitColor } from "./deck.js"

function renderCard(card) {
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
function renderFreecellBoard(board, solved) {
    let output =
        "𝐅𝐫𝐞𝐞𝐜𝐞𝐥𝐥 𝙎𝙤𝙡𝙫𝙚𝙧   " + (solved ? "Solved!" : "Solving...") + " \n\n"

    board.freeCells.forEach((cell) => {
        output += `|${renderCard(cell)}| `
    })

    output += "   "

    board.foundations.forEach((foundation) => {
        let topCard = foundation.length > 0 ? foundation.at(-1) : null
        output += `|${renderCard(topCard)}| `
    })

    output += "\n\n"

    for (
        let row = 0;
        row < Math.max(...board.tableau.map((cascade) => cascade.length));
        row++
    ) {
        output += " "
        for (let col = 0; col < board.tableau.length; col++) {
            let card = board.tableau[col][row]

            let cardText = `|${renderCard(card)}| `

            output += cardText
        }
        output += "\n"
    }

    return output
}

export { renderFreecellBoard }
